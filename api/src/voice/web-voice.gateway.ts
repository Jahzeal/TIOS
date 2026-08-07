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
 * WebVoiceGateway — handles BROWSER-BASED test calls ONLY.
 * Path: /stream/web
 *
 * This gateway is separate from VoiceGateway (/stream) which handles real Twilio calls.
 * This separation guarantees that 'transcript' events NEVER reach Twilio's WebSocket.
 * This gateway will be removed once web-based testing is no longer needed.
 */
@WebSocketGateway({ path: '/stream/web' })
export class WebVoiceGateway implements OnGatewayConnection, OnGatewayDisconnect {
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

    let tenantId = tenantIdQuery;
    const agentId = agentIdQuery;
    const callSid = callSidQuery || `web-call-${Date.now()}`;
    const callerPhone = '+1 (Web Voice Call)';

    console.log(`[WebVoiceGateway] Browser call connected. CallSid: ${callSid}, Tenant: ${tenantId}`);

    let streamSid = '';
    let callRecordId = '';
    let isCallActive = true;
    let speechSession: SpeechSession | null = null;
    let deepgramLive: any = null;
    const startTime = Date.now();

    // Register message handler IMMEDIATELY to buffer events during async setup
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
      console.error('[WebVoiceGateway] Agent lookup error:', err);
    }

    const voiceId = activeAgent?.voiceId || '21m00Tcm4TlvDq8ikWAM';

    const systemPrompt = await this.promptBuilderService.buildSystemPrompt({
      activeAgent,
      callerPhone,
      isOutbound: false,
    });

    chatHistory.push({ role: 'system', content: systemPrompt });

    let isProcessingLlm = false;
    let accumulatedUserTranscript = '';
    let silenceTimer: NodeJS.Timeout | null = null;
    let hasDispatchedGreeting = false;

    const sendTranscript = (role: 'agent' | 'user', text: string) => {
      try {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ event: 'transcript', role, text }));
        }
      } catch (e) {}
    };

    const triggerGreeting = () => {
      if (hasDispatchedGreeting || !isCallActive) return;
      hasDispatchedGreeting = true;

      const initialGreeting = `Hello! Thank you for calling ${activeAgent?.tenant?.name || 'Hive'}. How can I help you today?`;
      chatHistory.push({ role: 'assistant', content: initialGreeting });
      console.log(`[WebVoiceGateway Greeting]: "${initialGreeting}"`);

      sendTranscript('agent', initialGreeting);

      if (speechSession) {
        speechSession.enqueueSentence(initialGreeting);
      }
    };

    const processFinalUserUtterance = async (userText: string) => {
      if (!userText.trim() || isProcessingLlm || !isCallActive) return;
      isProcessingLlm = true;

      if (speechSession) speechSession.interrupt();

      console.log(`[WebVoiceGateway STT] User: "${userText}"`);
      chatHistory.push({ role: 'user', content: userText });
      sendTranscript('user', userText);

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

          const match = sentenceBuffer.match(/([^.!?]+[.!?]+(?:\s+|$))/);
          if (match) {
            const completeSentence = match[1].trim();
            sentenceBuffer = sentenceBuffer.slice(match[0].length);
            const clean = completeSentence.replace(/\[ACTION:[^\]]+\]/g, '').trim();
            if (clean && speechSession) speechSession.enqueueSentence(clean);
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
          const clean = sentenceBuffer.replace(/\[ACTION:[^\]]+\]/g, '').trim();
          if (clean) speechSession.enqueueSentence(clean);
        }

        const finalAiText = fullResponseText.trim();
        chatHistory.push({ role: 'assistant', content: finalAiText });
        console.log(`[WebVoiceGateway AI]: "${finalAiText}"`);
        sendTranscript('agent', finalAiText);

      } catch (llmErr) {
        console.error('[WebVoiceGateway LLM Error]:', llmErr);
      } finally {
        isProcessingLlm = false;
      }
    };

    // Deepgram STT — web/browser mode (nova-2, WebM audio)
    deepgramLive = this.deepgramService.createDeepgramLiveStream(true);

    if (!deepgramLive) {
      console.warn('[WebVoiceGateway] Deepgram Live Stream NULL. Check DEEPGRAM_API_KEY.');
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
            parsed.transcript || '';
          const isFinal = parsed.is_final ?? parsed.isFinal ?? true;

          if (transcript.trim() && isFinal) {
            const now = Date.now();
            if (transcript === lastProcessedTranscript && (now - lastProcessedTime) < 500) return;
            lastProcessedTranscript = transcript;
            lastProcessedTime = now;

            accumulatedUserTranscript += ' ' + transcript;
            if (silenceTimer) clearTimeout(silenceTimer);

            silenceTimer = setTimeout(() => {
              const finalText = accumulatedUserTranscript.trim();
              accumulatedUserTranscript = '';
              if (finalText) processFinalUserUtterance(finalText);
            }, 800);
          }
        } catch (e) {
          console.error('[WebVoiceGateway Deepgram Error]:', e);
        }
      };

      ['Results', 'transcriptReceived', 'transcript', 'message'].forEach((eventName) => {
        if (typeof deepgramLive.addListener === 'function') deepgramLive.addListener(eventName, handleDeepgramTranscript);
        if (typeof deepgramLive.on === 'function') deepgramLive.on(eventName, handleDeepgramTranscript);
      });
    }

    const processMessage = async (message: any) => {
      try {
        const data = JSON.parse(message.toString());

        switch (data.event) {
          case 'start':
            streamSid = data.start?.streamSid || `stream-${callSid}`;
            if (!speechSession) {
              speechSession = this.elevenLabsService.createSpeechSession(ws, streamSid, voiceId);
            }
            speechSession.setStreamSid(streamSid);
            triggerGreeting();
            console.log(`[WebVoiceGateway Start] StreamSid: ${streamSid}`);
            break;

          case 'media': {
            if (!speechSession) {
              streamSid = streamSid || `stream-${callSid}`;
              speechSession = this.elevenLabsService.createSpeechSession(ws, streamSid, voiceId);
              speechSession.setStreamSid(streamSid);
              triggerGreeting();
            }

            if (isCallActive && deepgramLive) {
              try {
                const rawAudio = Buffer.from(data.media.payload, 'base64');
                if (typeof deepgramLive.send === 'function') deepgramLive.send(rawAudio);
              } catch (err) {
                console.error('[WebVoiceGateway Deepgram Send Error]:', err);
              }
            }
            break;
          }

          default:
            break;
        }
      } catch (err) {
        console.error('[WebVoiceGateway Message Error]:', err);
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
      console.log('[WebVoiceGateway] Browser call disconnected.');
      isCallActive = false;

      if (deepgramLive && typeof deepgramLive.finish === 'function') {
        try { deepgramLive.finish(); } catch (e) {}
      }

      await this.actionHandlerService.finalizeCallSummary({
        callRecordId,
        callSid,
        trueSid: callSid,
        chatHistory,
        startTime,
        callerPhone,
        targetTenantId,
      });
    });
  }

  handleDisconnect(ws: WebSocket) {
    console.log('[WebVoiceGateway] Browser client disconnected.');
  }
}
