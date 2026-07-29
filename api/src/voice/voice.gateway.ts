import { Inject } from '@nestjs/common';
import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { WebSocket } from 'ws';
import * as url from 'url';
import { LiveTranscriptionEvents } from '@deepgram/sdk';
import { PrismaService } from '../prisma/prisma.service';
import { OpenAiService } from '../services/ai/openai.service';
import { DeepgramService } from '../services/ai/deepgram.service';
import { ElevenLabsService, SpeechSession } from '../services/ai/elevenlabs.service';
import { config } from '../config';

function containsEmergency(text: string): boolean {
  const normalized = text.toLowerCase();
  return config.emergencyKeywords.some((keyword) => normalized.includes(keyword));
}

@WebSocketGateway({ path: '/stream' })
export class VoiceGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(OpenAiService) private readonly openAiService: OpenAiService,
    @Inject(DeepgramService) private readonly deepgramService: DeepgramService,
    @Inject(ElevenLabsService) private readonly elevenLabsService: ElevenLabsService,
  ) {}

  async handleConnection(ws: WebSocket, req: any) {
    const parsedUrl = url.parse(req.url || '', true);
    let tenantId = parsedUrl.query.tenantId as string;
    const agentId = parsedUrl.query.agentId as string;
    const callSid = parsedUrl.query.callSid as string;
    const callerPhone = decodeURIComponent((parsedUrl.query.callerPhone as string) || 'Unknown');

    console.log(`[WebSocket Stream (NestJS)] Connected. CallSid: ${callSid}, Tenant: ${tenantId}`);

    let streamSid = '';
    let callRecordId = '';
    let isCallActive = true;
    let speechSession: SpeechSession | null = null;
    let chatHistory: { role: 'system' | 'user' | 'assistant'; content: string }[] = [];
    let dbCallRecord: any = null;
    const startTime = Date.now();

    let systemPrompt = 'You are a helpful AI receptionist.';
    let voiceId = 'EXAVITQu4vr4xnSDxMaL';

    let activeAgent: any = null;

    try {
      if (agentId && agentId !== 'default-agent') {
        activeAgent = await this.prisma.agent.findUnique({
          where: { id: agentId },
          include: { tenant: true },
        });
      }

      if (!activeAgent) {
        activeAgent = await this.prisma.agent.findFirst({
          include: { tenant: true },
        });
      }

      if (activeAgent) {
        systemPrompt = activeAgent.prompt;
        voiceId = activeAgent.voiceId;

        if (activeAgent.tenantId) {
          tenantId = activeAgent.tenantId;
          const kbEntries = await this.prisma.knowledgeBase.findMany({
            where: { tenantId: activeAgent.tenantId },
          });
          if (kbEntries.length > 0) {
            const kbText = kbEntries.map((e) => `Q: ${e.question}\nA: ${e.answer}`).join('\n\n');
            systemPrompt += `\n\nBUSINESS KNOWLEDGE BASE (Use these facts to answer caller questions accurately):\n${kbText}`;
          }
        }
      }
    } catch (err) {
      console.error('[WebSocket Context] Agent query failed:', err);
    }

    chatHistory.push({ role: 'system', content: systemPrompt });

    let targetAgentId = activeAgent?.id;
    let targetTenantId = activeAgent?.tenantId || (tenantId !== 'web-tenant' ? tenantId : undefined);

    if (!targetAgentId) {
      const fallbackAgent = await this.prisma.agent.findFirst();
      if (fallbackAgent) {
        targetAgentId = fallbackAgent.id;
        targetTenantId = fallbackAgent.tenantId || undefined;
      }
    }

    if (targetAgentId) {
      try {
        dbCallRecord = await this.prisma.call.create({
          data: {
            sid: callSid,
            direction: 'INBOUND',
            status: 'IN_PROGRESS',
            callerPhone: callerPhone,
            agentId: targetAgentId,
            tenantId: targetTenantId || undefined,
          },
        });
        callRecordId = dbCallRecord.id;
        console.log(`[WebSocket DB] Call record created successfully: ${callRecordId}`);
      } catch (err) {
        console.error('[WebSocket DB] Failed to create call record:', err);
      }
    }

    let deepgramLive: any = null;
    let llmCancellation = { cancelled: false };

    const isWebCall = tenantId === 'web-tenant' || callerPhone.includes('Web Browser');
    const dgStream = this.deepgramService.createDeepgramLiveStream(isWebCall);
    if (dgStream) {
      deepgramLive = dgStream;

      deepgramLive.on(LiveTranscriptionEvents.Open, () => {
        console.log('[Deepgram] Streaming STT connection established');
      });

      deepgramLive.on(LiveTranscriptionEvents.Transcript, async (data: any) => {
        const transcript = data.channel.alternatives[0]?.transcript || '';
        const isFinal = data.is_final;

        if (transcript.trim()) {
          if (speechSession && speechSession.getIsPlaying()) {
            console.log(`[Interruption Engine] User spoke: "${transcript}". Flusher triggered.`);
            speechSession.interrupt();
            llmCancellation.cancelled = true;
          }

          if (isFinal) {
            console.log(`[STT Final] Caller: "${transcript}"`);
            try {
              ws.send(JSON.stringify({ event: 'transcript', role: 'user', text: transcript }));
            } catch (e) {}

            if (containsEmergency(transcript)) {
              console.log(`[Safety Engine] Emergency keyword detected: "${transcript}"`);
              isCallActive = false;

              try {
                if (callRecordId) {
                  await this.prisma.call.update({
                    where: { id: callRecordId },
                    data: {
                      status: 'FORWARD_REQUESTED',
                      summary: `Emergency triggered: "${transcript}".`,
                    },
                  });
                }
              } catch (err) {
                console.error('[Safety Engine] DB Update Failed:', err);
              }

              ws.close();
              return;
            }

            chatHistory.push({ role: 'user', content: transcript });

            llmCancellation = { cancelled: false };
            try {
              const stream = await this.openAiService.getLlmCompletionStream(chatHistory);

              let fullResponseText = '';
              let currentSentence = '';

              for await (const chunk of stream) {
                if (llmCancellation.cancelled) {
                  console.log('[LLM] Generative response cancelled.');
                  break;
                }

                const content = chunk.choices[0]?.delta?.content || '';
                fullResponseText += content;
                currentSentence += content;

                const sentenceEndRegex = /[.!?]\s+/;
                const match = currentSentence.match(sentenceEndRegex);
                if (match && match.index !== undefined) {
                  const endPos = match.index + 1;
                  const sentence = currentSentence.substring(0, endPos).trim();
                  currentSentence = currentSentence.substring(endPos);

                  if (sentence && speechSession) {
                    speechSession.enqueueSentence(sentence);
                  }
                }
              }

              if (currentSentence.trim() && !llmCancellation.cancelled && speechSession) {
                speechSession.enqueueSentence(currentSentence.trim());
              }

              if (!llmCancellation.cancelled) {
                chatHistory.push({ role: 'assistant', content: fullResponseText });
                try {
                  ws.send(JSON.stringify({ event: 'transcript', role: 'agent', text: fullResponseText }));
                } catch (e) {}
              }
            } catch (err) {
              console.error('[LLM] OpenAI streaming error:', err);
            }
          }
        }
      });

      deepgramLive.on(LiveTranscriptionEvents.Error, (err: any) => {
        console.error('[Deepgram] Error:', err);
      });

      deepgramLive.on(LiveTranscriptionEvents.Close, () => {
        console.log('[Deepgram] Connection closed');
      });
    }

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);

        switch (data.event) {
          case 'connected':
            console.log(`[Twilio Connect] Connected. Protocol version: ${data.protocol}`);
            break;
          case 'start':
            streamSid = data.start?.streamSid || '';
            console.log(`[Twilio Start] Media stream started. StreamSid: ${streamSid}`);

            speechSession = this.elevenLabsService.createSpeechSession(ws, streamSid, voiceId);
            speechSession.enqueueSentence('Hello! Thank you for calling. How can I help you today?');
            chatHistory.push({
              role: 'assistant',
              content: 'Hello! Thank you for calling. How can I help you today?',
            });
            try {
              ws.send(
                JSON.stringify({
                  event: 'transcript',
                  role: 'agent',
                  text: 'Hello! Thank you for calling. How can I help you today?',
                }),
              );
            } catch (e) {}
            break;
          case 'media':
            if (isCallActive && deepgramLive && deepgramLive.getReadyState() === 1) {
              const rawAudio = Buffer.from(data.media.payload, 'base64');
              deepgramLive.send(rawAudio);
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

      if (deepgramLive) {
        try {
          deepgramLive.finish();
        } catch (e) {}
      }

      const duration = Math.round((Date.now() - startTime) / 1000);

      try {
        if (callRecordId) {
          const callRecord = await this.prisma.call.findUnique({ where: { id: callRecordId } });
          const finalStatus =
            callRecord?.status === 'FORWARD_REQUESTED' ? 'FORWARD_REQUESTED' : 'COMPLETED';

          const dialogueHistory = chatHistory.filter((t) => t.role !== 'system');
          const formattedHistory = dialogueHistory.map((t) => ({
            role: t.role,
            text: t.content,
            timestamp: new Date().toISOString(),
          }));

          const analysis = await this.openAiService.analyzeCallDialogue(dialogueHistory);

          await this.prisma.call.update({
            where: { id: callRecordId },
            data: {
              status: finalStatus,
              duration: duration,
              summary: analysis.summary,
              sentiment: analysis.sentiment,
              transcript: formattedHistory as any,
            },
          });
          console.log(`[WebSocket DB Log] Saved call record ${callRecordId} successfully.`);
        }
      } catch (err) {
        console.error('[WebSocket DB Log] Cleanup update failed:', err);
      }
    });
  }

  handleDisconnect(ws: WebSocket) {
    console.log('[WebSocket Gateway] Client disconnected');
  }
}
