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

    const isWebCall =
      !callerPhoneQuery ||
      callerPhoneQuery.toLowerCase().includes('web') ||
      decodeURIComponent(callerPhoneQuery).toLowerCase().includes('web');

    let tenantId = tenantIdQuery;
    const agentId = agentIdQuery;
    const callSid = callSidQuery || `call-${Date.now()}`;
    const rawPhone = decodeURIComponent(callerPhoneQuery);
    let callerPhone = isWebCall
      ? '+1 (Web Voice Call)'
      : rawPhone && rawPhone !== 'Unknown' && rawPhone !== 'undefined' && rawPhone !== ''
        ? rawPhone
        : '+1 (Web Voice Call)';

    console.log(`[WebSocket Stream (NestJS)] Connected. CallSid: ${callSid}, Tenant: ${tenantId}, CallerPhone: ${callerPhone}`);

    let streamSid = '';
    let trueSid = callSid;
    let callRecordId = '';
    let isCallActive = true;
    let speechSession: SpeechSession | null = null;
    let deepgramLive: any = null;
    const startTime = Date.now();

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

    // Construct system prompt via VoicePromptBuilderService
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

      try {
        ws.send(JSON.stringify({ event: 'transcript', role: 'agent', text: initialGreeting }));
      } catch (e) {}

      if (speechSession) {
        speechSession.enqueueSentence(initialGreeting);
      }
    };

    const processFinalUserUtterance = async (userText: string) => {
      if (!userText.trim() || isProcessingLlm || !isCallActive) return;
      isProcessingLlm = true;

      if (speechSession) {
        speechSession.interrupt();
      }

      console.log(`[STT Final] Caller: "${userText}"`);
      chatHistory.push({ role: 'user', content: userText });

      try {
        ws.send(JSON.stringify({ event: 'transcript', role: 'user', text: userText }));
      } catch (e) {}

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
          if (cleanSentence) {
            speechSession.enqueueSentence(cleanSentence);
          }
        }

        const finalAiText = fullResponseText.trim();
        chatHistory.push({ role: 'assistant', content: finalAiText });
        console.log(`[AI Response Completed]: "${finalAiText}"`);

        try {
          ws.send(JSON.stringify({ event: 'transcript', role: 'agent', text: finalAiText }));
        } catch (e) {}
      } catch (llmErr) {
        console.error('[VoiceGateway LLM Error]:', llmErr);
      } finally {
        isProcessingLlm = false;
      }
    };

    deepgramLive = this.deepgramService.createDeepgramLiveStream(isWebCall);

    if (deepgramLive) {
      let lastProcessedTranscript = '';
      let lastProcessedTime = 0;

      const handleDeepgramTranscript = (transcriptData: any) => {
        if (!isCallActive) return;

        try {
          const parsed = typeof transcriptData === 'string' ? JSON.parse(transcriptData) : transcriptData;
          const transcript = parsed.channel?.alternatives?.[0]?.transcript || '';
          const isFinal = parsed.is_final || false;

          if (transcript.trim() && isFinal) {
            const now = Date.now();
            if (transcript === lastProcessedTranscript && (now - lastProcessedTime) < 500) {
              return; // Skip duplicate event within 500ms
            }
            lastProcessedTranscript = transcript;
            lastProcessedTime = now;

            accumulatedUserTranscript += ' ' + transcript;
            if (silenceTimer) clearTimeout(silenceTimer);

            silenceTimer = setTimeout(() => {
              const finalText = accumulatedUserTranscript.trim();
              accumulatedUserTranscript = '';
              if (finalText) {
                processFinalUserUtterance(finalText);
              }
            }, 800);
          }
        } catch (e) {}
      };

      if (typeof deepgramLive.addListener === 'function') {
        deepgramLive.addListener('transcriptReceived', handleDeepgramTranscript);
        deepgramLive.addListener('Results', handleDeepgramTranscript);
      }
      if (typeof deepgramLive.on === 'function') {
        deepgramLive.on('transcriptReceived', handleDeepgramTranscript);
        deepgramLive.on('Results', handleDeepgramTranscript);
      }
    }

    let mediaChunkCount = 0;

    ws.on('message', async (message: any) => {
      try {
        const data = JSON.parse(message.toString());

        switch (data.event) {
          case 'connected':
            console.log(`[Twilio Connect] Connected. Protocol version: ${data.protocol}`);
            break;
          case 'start':
            streamSid = data.start?.streamSid || '';
            const customParams = data.start?.customParameters || {};
            const paramPhone = customParams.callerPhone || customParams.callerphone || customParams.From || customParams.from;
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
                  if (existingCall.callerPhone) {
                    callerPhone = existingCall.callerPhone;
                  }
                  if (paramPhone && paramPhone.startsWith('+')) {
                    callerPhone = paramPhone;
                    await this.prisma.call.update({
                      where: { id: callRecordId },
                      data: { callerPhone: paramPhone },
                    }).catch(() => {});
                  }
                } else {
                  const finalPhone = (paramPhone && paramPhone.startsWith('+')) ? paramPhone : callerPhone;
                  dbCallRecord = await this.prisma.call.create({
                    data: {
                      sid: trueSid,
                      direction: isOutbound ? 'OUTBOUND' : 'INBOUND',
                      status: 'IN_PROGRESS',
                      callerPhone: finalPhone,
                      agentId: targetAgentId,
                      tenantId: targetTenantId || undefined,
                    },
                  });
                  callRecordId = dbCallRecord.id;
                  callerPhone = finalPhone;
                }
              } catch (err) {
                console.error('[VoiceGateway Start] Call binding failed:', err);
              }
            }

            console.log(`[Twilio Start] Media stream bound. CallSid: ${trueSid}, Phone: ${callerPhone}`);
            break;
          case 'media':
            if (!streamSid && data.streamSid) {
              streamSid = data.streamSid;
            }
            if (!speechSession && (streamSid || callSid)) {
              speechSession = this.elevenLabsService.createSpeechSession(ws, streamSid || callSid, voiceId);
            }
            triggerGreeting();
            mediaChunkCount++;
            if (mediaChunkCount === 1 || mediaChunkCount % 10 === 0) {
              console.log(`[VoiceGateway Media] Audio chunk #${mediaChunkCount} received.`);
            }
            if (isCallActive && deepgramLive) {
              try {
                const rawAudio = Buffer.from(data.media.payload, 'base64');
                if (typeof deepgramLive.send === 'function') {
                  deepgramLive.send(rawAudio);
                }
              } catch (err) {
                console.error('[Deepgram Send Error]:', err);
              }
            }
            break;
          case 'stop':
            console.log('[Twilio Stop] Media stream stopped.');
            break;
          default:
            break;
        }
      } catch (err) {
        console.error('[WebSocket Message Error] Parsing failed:', err);
      }
    });

    ws.on('close', async () => {
      console.log('[WebSocket Close] Connection terminated.');
      isCallActive = false;

      if (deepgramLive && typeof deepgramLive.finish === 'function') {
        try {
          deepgramLive.finish();
        } catch (e) {}
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
    console.log('[WebSocket Gateway] Client disconnected');
  }
}
