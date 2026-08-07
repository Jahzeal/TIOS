import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Injectable, Inject } from '@nestjs/common';
import { WebSocket } from 'ws';
import * as url from 'url';
import { PrismaService } from '../prisma/prisma.service';
import { OpenAiService } from '../services/ai/openai.service';
import { DeepgramService } from '../services/ai/deepgram.service';
import { ElevenLabsService, SpeechSession } from '../services/ai/elevenlabs.service';
import { VoicePromptBuilderService } from './voice-prompt-builder.service';
import { VoiceActionHandlerService } from './voice-action-handler.service';

/**
 * VoiceGateway — handles REAL Twilio phone calls ONLY.
 * Path: /stream
 *
 * Strict Twilio Media Streams protocol:
 *  - ONLY sends 'media', 'mark', 'clear' frames back to Twilio
 *  - Never sends 'transcript' or any custom event type
 *  - Eliminates Twilio Error 31951 by structural guarantee
 */
@WebSocketGateway({ path: '/stream' })
export class VoiceGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(OpenAiService) private readonly openAiService: OpenAiService,
    @Inject(DeepgramService) private readonly deepgramService: DeepgramService,
    @Inject(ElevenLabsService) private readonly elevenLabsService: ElevenLabsService,
    @Inject(VoicePromptBuilderService) private readonly promptBuilderService: VoicePromptBuilderService,
    @Inject(VoiceActionHandlerService) private readonly actionHandlerService: VoiceActionHandlerService,
  ) {}

  async handleConnection(ws: WebSocket, req: any) {
    const parsedUrl = url.parse(req.url || '', true);

    const getQueryParam = (targetKey: string): string => {
      if (!parsedUrl.query) return '';
      for (const [key, val] of Object.entries(parsedUrl.query)) {
        const cleanKey = key.replace(/^(amp;)+/i, '');
        if (cleanKey.toLowerCase() === targetKey.toLowerCase()) {
          const strVal = Array.isArray(val) ? val[0] : val;
          return (strVal || '').toString().trim();
        }
      }
      return '';
    };

    const tenantIdQuery = getQueryParam('tenantId');
    const agentIdQuery = getQueryParam('agentId');
    const callSidQuery = getQueryParam('callSid');
    const callerPhoneQuery = getQueryParam('callerPhone');
    const directionQuery = getQueryParam('direction').toUpperCase();

    let tenantId = tenantIdQuery;
    const agentId = agentIdQuery;
    // Use CA... callSid from Twilio, or generate fallback
    const callSid = callSidQuery || `call-${Date.now()}`;
    const rawPhone = decodeURIComponent(callerPhoneQuery);
    const initialDigits = (rawPhone || '').replace(/\D/g, '');
    let callerPhone = rawPhone && rawPhone !== 'Unknown' && rawPhone !== 'undefined' && rawPhone !== '' && !rawPhone.toLowerCase().includes('web')
      ? (rawPhone.startsWith('+') ? rawPhone : initialDigits.length >= 10 ? `+${initialDigits.length === 10 ? '1' + initialDigits : initialDigits}` : rawPhone)
      : 'Unknown Caller';


    console.log(`[Twilio VoiceGateway] Connected. CallSid: ${callSid}, Tenant: ${tenantId}, Phone: ${callerPhone}`);

    let streamSid = '';
    let trueSid = callSid;
    let callRecordId = '';
    let isCallActive = true;
    let speechSession: SpeechSession | null = null;
    let deepgramLive: any = null;
    const startTime = Date.now();

    // ===== Register message handler IMMEDIATELY to buffer all Twilio events =====
    // Twilio sends 'connected' and 'start' within milliseconds of WebSocket open.
    // All async setup (DB lookups, prompt building) runs AFTER this registration.
    // Buffered messages are replayed in order once setup is complete.
    const messageBuffer: any[] = [];
    let isSetupComplete = false;
    let onMessageReady: ((msg: any) => void) | null = null;

    ws.on('message', (rawMsg: any) => {
      if (!isSetupComplete) {
        messageBuffer.push(rawMsg);
      } else if (onMessageReady) {
        onMessageReady(rawMsg);
      }
    });
    // ===========================================================================

    const chatHistory: { role: 'system' | 'user' | 'assistant'; content: string }[] = [];

    let activeAgent: any = null;
    let targetAgentId = agentId;
    let targetTenantId = tenantId;

    try {
      if (agentId) {
        activeAgent = await this.prisma.agent.findUnique({ where: { id: agentId }, include: { tenant: true } });
      }
      if (!activeAgent && tenantId) {
        activeAgent = await this.prisma.agent.findFirst({ where: { tenantId }, include: { tenant: true } });
      }
      if (!activeAgent) {
        activeAgent = await this.prisma.agent.findFirst({ include: { tenant: true } });
      }

      if (activeAgent) {
        targetAgentId = activeAgent.id;
        targetTenantId = activeAgent.tenantId || tenantId;
      }
    } catch (err) {
      console.error('[VoiceGateway] Agent lookup error:', err);
    }

    const voiceId = activeAgent?.voiceId || '21m00Tcm4TlvDq8ikWAM';
    const isOutbound = directionQuery === 'OUTBOUND';

    const systemPrompt = await this.promptBuilderService.buildSystemPrompt({
      activeAgent,
      callerPhone,
      isOutbound,
    });

    chatHistory.push({ role: 'system', content: systemPrompt });

    let isProcessingLlm = false;
    let accumulatedUserTranscript = '';
    let silenceTimer: NodeJS.Timeout | null = null;
    let hasDispatchedGreeting = false;
    let dbCallRecord: any = null;

    const triggerGreeting = () => {
      if (hasDispatchedGreeting || !isCallActive) return;
      hasDispatchedGreeting = true;

      const initialGreeting = isOutbound
        ? `Hello! This is ${activeAgent?.tenant?.name || 'Hive'} following up on your earlier quote inquiry. How are you doing today?`
        : `Hello! Thank you for calling ${activeAgent?.tenant?.name || 'Hive'}. How can I help you today?`;

      chatHistory.push({ role: 'assistant', content: initialGreeting });
      console.log(`[VoiceGateway Greeting Sent]: "${initialGreeting}"`);

      // ONLY enqueue to SpeechSession — NO custom event types sent to Twilio WebSocket
      if (speechSession) {
        speechSession.enqueueSentence(initialGreeting);
      }
    };

    const processFinalUserUtterance = async (userText: string) => {
      if (!userText.trim() || isProcessingLlm || !isCallActive) return;
      isProcessingLlm = true;

      if (speechSession) speechSession.interrupt();

      console.log(`[STT Final] Caller: "${userText}"`);
      chatHistory.push({ role: 'user', content: userText });

      try {
        let sentenceBuffer = '';
        let fullResponseText = '';
        let hasDispatchedPaymentForTurn = false;

        const stream = await this.openAiService.getLlmCompletionStream(chatHistory);

        for await (const chunk of stream) {
          if (!isCallActive) break;

          const content = chunk.choices[0]?.delta?.content || '';
          if (!content) continue;

          fullResponseText += content;
          sentenceBuffer += content;

          const sentencePunctuationMatch = sentenceBuffer.match(/([^.!?]+[.!?]+(?:\s+|$))/);
          if (sentencePunctuationMatch) {
            const completeSentence = sentencePunctuationMatch[1].trim();
            sentenceBuffer = sentenceBuffer.slice(sentencePunctuationMatch[0].length);

            if (completeSentence) {
              const cleanSentence = completeSentence.replace(/\[ACTION:[^\]]+\]/g, '').trim();
              if (cleanSentence && speechSession) {
                speechSession.enqueueSentence(cleanSentence);
              }
            }
          }

          if (fullResponseText.includes('[ACTION:SEND_PAYMENT_LINK]') && !hasDispatchedPaymentForTurn) {
            hasDispatchedPaymentForTurn = true;
            await this.actionHandlerService.handlePaymentAction({
              responseText: fullResponseText,
              chatHistory,
              callerPhone,
              targetTenantId,
              callRecordId,
            });
          }

          if (fullResponseText.includes('[ACTION:REQUEST_CALLBACK]')) {
            await this.actionHandlerService.handleCallbackAction(callRecordId);
          }
        }

        if (sentenceBuffer.trim() && isCallActive && speechSession) {
          const cleanSentence = sentenceBuffer.replace(/\[ACTION:[^\]]+\]/g, '').trim();
          if (cleanSentence) speechSession.enqueueSentence(cleanSentence);
        }

        const finalAiText = fullResponseText.trim();
        chatHistory.push({ role: 'assistant', content: finalAiText });
        console.log(`[AI Response Completed]: "${finalAiText}"`);

      } catch (llmErr) {
        console.error('[VoiceGateway LLM Error]:', llmErr);
      } finally {
        isProcessingLlm = false;
      }
    };

    // Deepgram STT — telephone mode (nova-2, mulaw 8000Hz)
    deepgramLive = this.deepgramService.createDeepgramLiveStream(false);

    if (!deepgramLive) {
      console.warn(`[VoiceGateway] Deepgram Live Stream NULL for ${callSid}. Check DEEPGRAM_API_KEY.`);
    } else {
      let lastProcessedTranscript = '';
      let lastProcessedTime = 0;

      const handleDeepgramTranscript = (transcriptData: any) => {
        if (!isCallActive) return;
        try {
          const parsed = typeof transcriptData === 'string' ? JSON.parse(transcriptData) : transcriptData;
          const transcript =
            parsed.channel?.alternatives?.[0]?.transcript ||
            parsed.alternatives?.[0]?.transcript ||
            parsed.transcript ||
            '';
          const isFinal = parsed.is_final ?? parsed.isFinal ?? true;

          if (transcript.trim() && isFinal) {
            const now = Date.now();
            if (transcript === lastProcessedTranscript && (now - lastProcessedTime) < 500) return;
            lastProcessedTranscript = transcript;
            lastProcessedTime = now;

            console.log(`[Deepgram STT] "${transcript.trim()}" from ${callerPhone}`);
            accumulatedUserTranscript += ' ' + transcript;
            if (silenceTimer) clearTimeout(silenceTimer);

            silenceTimer = setTimeout(() => {
              const finalText = accumulatedUserTranscript.trim();
              accumulatedUserTranscript = '';
              if (finalText) processFinalUserUtterance(finalText);
            }, 800);
          }
        } catch (e) {
          console.error('[Deepgram STT Parse Error]:', e);
        }
      };

      ['Results', 'transcriptReceived', 'transcript', 'message'].forEach((eventName) => {
        if (typeof deepgramLive.addListener === 'function') deepgramLive.addListener(eventName, handleDeepgramTranscript);
        if (typeof deepgramLive.on === 'function') deepgramLive.on(eventName, handleDeepgramTranscript);
      });
    }

    let mediaChunkCount = 0;

    const processMessage = async (message: any) => {
      try {
        const data = JSON.parse(message.toString());

        switch (data.event) {
          case 'connected':
            console.log(`[Twilio Connected] Protocol: ${data.protocol}`);
            break;

          case 'start': {
            streamSid = data.start?.streamSid || '';
            const customParams = data.start?.customParameters || {};
            
            const rawParamPhone = customParams.callerPhone || customParams.callerphone || customParams.From || customParams.from || getQueryParam('callerPhone');
            const cleanDigits = (rawParamPhone || '').replace(/\D/g, '');
            const normalizedPhone = rawParamPhone && rawParamPhone.startsWith('+')
              ? rawParamPhone
              : cleanDigits.length >= 10
                ? `+${cleanDigits.length === 10 ? '1' + cleanDigits : cleanDigits}`
                : rawParamPhone;

            if (normalizedPhone && !normalizedPhone.toLowerCase().includes('web') && normalizedPhone !== 'Unknown') {
              callerPhone = normalizedPhone;
            }

            trueSid = data.start?.callSid || customParams.callSid || callSid;

            if (targetAgentId) {
              try {
                let existingCall = await this.prisma.call.findUnique({ where: { sid: trueSid } });
                if (!existingCall && callSid && callSid !== trueSid) {
                  existingCall = await this.prisma.call.findUnique({ where: { sid: callSid } });
                }

                if (existingCall) {
                  dbCallRecord = existingCall;
                  callRecordId = existingCall.id;
                  
                  // Prefer valid phone from existing call or update if we now have a resolved phone number
                  if (existingCall.callerPhone && existingCall.callerPhone !== 'Unknown Caller' && !existingCall.callerPhone.includes('Web Voice')) {
                    callerPhone = existingCall.callerPhone;
                  } else if (callerPhone && callerPhone !== 'Unknown Caller') {
                    await this.prisma.call.update({
                      where: { id: callRecordId },
                      data: { callerPhone: callerPhone },
                    }).catch(() => {});
                  }
                } else {
                  dbCallRecord = await this.prisma.call.create({
                    data: {
                      sid: trueSid,
                      direction: isOutbound ? 'OUTBOUND' : 'INBOUND',
                      status: 'IN_PROGRESS',
                      callerPhone: callerPhone || 'Unknown Caller',
                      agentId: targetAgentId,
                      tenantId: targetTenantId || undefined,
                    },
                  });
                  callRecordId = dbCallRecord.id;
                }
              } catch (err) {
                console.error('[VoiceGateway Start] Call binding failed:', err);
              }
            }

            // Create SpeechSession with guaranteed valid MZ... streamSid
            if (!speechSession && streamSid) {
              speechSession = this.elevenLabsService.createSpeechSession(ws, streamSid, voiceId);
            } else if (speechSession && streamSid) {
              speechSession.setStreamSid(streamSid);
            }

            triggerGreeting();
            console.log(`[Twilio Start] CallSid: ${trueSid}, StreamSid: ${streamSid}, Phone: ${callerPhone}`);
            break;
          }

          case 'media': {
            // Safety net: recover streamSid from media if start was somehow missed
            if (data.streamSid && !streamSid) {
              streamSid = data.streamSid;
              console.warn(`[VoiceGateway] Recovered streamSid from media: ${streamSid}`);
            }
            if (!speechSession && streamSid) {
              speechSession = this.elevenLabsService.createSpeechSession(ws, streamSid, voiceId);
              speechSession.setStreamSid(streamSid);
              triggerGreeting();
            } else if (speechSession && streamSid) {
              speechSession.setStreamSid(streamSid);
            }

            mediaChunkCount++;
            if (mediaChunkCount === 1 || mediaChunkCount % 10 === 0) {
              console.log(`[VoiceGateway Media] Chunk #${mediaChunkCount}`);
            }

            if (isCallActive && deepgramLive) {
              try {
                const rawAudio = Buffer.from(data.media.payload, 'base64');
                if (typeof deepgramLive.send === 'function') deepgramLive.send(rawAudio);
              } catch (err) {
                console.error('[Deepgram Send Error]:', err);
              }
            }
            break;
          }

          case 'stop':
            console.log('[Twilio Stop] Media stream stopped.');
            break;

          default:
            break;
        }
      } catch (err) {
        console.error('[VoiceGateway Message Error]:', err);
      }
    };

    // Setup complete — flush buffered messages then wire live handler
    isSetupComplete = true;
    onMessageReady = processMessage;
    for (const buffered of messageBuffer) {
      await processMessage(buffered);
    }
    messageBuffer.length = 0;

    ws.on('close', async () => {
      console.log('[Twilio VoiceGateway] Connection closed.');
      isCallActive = false;

      if (deepgramLive && typeof deepgramLive.finish === 'function') {
        try { deepgramLive.finish(); } catch (e) {}
      }

      await this.actionHandlerService.finalizeCallSummary({
        callRecordId,
        callSid,
        trueSid,
        chatHistory,
        startTime,
        callerPhone,
        targetTenantId,
      });
    });
  }

  handleDisconnect(ws: WebSocket) {
    console.log('[Twilio VoiceGateway] Client disconnected.');
  }
}
