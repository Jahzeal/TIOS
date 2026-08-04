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



function containsGoodbye(text: string): boolean {
  const keywords = ['goodbye', 'bye', 'talk to you later', 'have a nice day', 'hang up', 'see you later', 'bye bye'];
  const normalized = text.toLowerCase().trim();
  return keywords.some((kw) => normalized.includes(kw));
}

import { PaymentsService } from '../payments/payments.service';

@WebSocketGateway({ path: '/stream' })
export class VoiceGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(OpenAiService) private readonly openAiService: OpenAiService,
    @Inject(DeepgramService) private readonly deepgramService: DeepgramService,
    @Inject(ElevenLabsService) private readonly elevenLabsService: ElevenLabsService,
    @Inject(PaymentsService) private readonly paymentsService: PaymentsService,
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
    const isWebQuery = getQueryParam('isWeb');

    const isWebCall =
      isWebQuery === 'true' ||
      tenantIdQuery === 'web-tenant' ||
      callerPhoneQuery.toLowerCase().includes('web') ||
      decodeURIComponent(callerPhoneQuery).toLowerCase().includes('web');

    let tenantId = tenantIdQuery;
    const agentId = agentIdQuery;
    const callSid = callSidQuery || `call-${Date.now()}`;
    const rawPhone = decodeURIComponent(callerPhoneQuery);
    const callerPhone = isWebCall
      ? '+1 (Web Voice Call)'
      : rawPhone && rawPhone !== 'Unknown' && rawPhone !== 'undefined' && rawPhone !== ''
        ? rawPhone
        : '+1 (Inbound Phone Call)';

    console.log(`[WebSocket Stream (NestJS)] Connected. CallSid: ${callSid}, Tenant: ${tenantId}, CallerPhone: ${callerPhone}`);

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
        systemPrompt += `\n\nAUTOMATED ACTIONS RULE:\nIf the caller expresses ANY intention to speak with a human agent, representative, live person, or requests a phone call back (regardless of how they phrase it), you MUST start your response with the exact tag: [ACTION:REQUEST_CALLBACK]. Followed by your polite closing response: "I have logged your request! One of our representatives will give you a call back shortly on this number. Thank you for reaching out, and have a wonderful day!"`;

        try {
          const activeDebt = await this.prisma.payment.findFirst({
            where: { phone: callerPhone, status: { not: 'PAID' } },
            orderBy: { createdAt: 'desc' },
          });

          if (activeDebt) {
            systemPrompt += `\n\n[ACCOUNT CONTEXT]: The caller has an active pending invoice/quote for "${activeDebt.inquiredService || 'Utility Service Setup'}" with an outstanding balance of $${activeDebt.amount.toFixed(2)}. Status: ${activeDebt.status}. If they ask to pay or request a payment link, inform them politely and start your response with [ACTION:SEND_PAYMENT_LINK].`;
          }
        } catch (e) {}

        systemPrompt += `\n\nAUTOMATED PAYMENTS RULE:\nIf the caller expresses ANY intention to pay their bill, complete their service quote, or requests a payment link via SMS (regardless of how they phrase it), you MUST start your response with the exact tag: [ACTION:SEND_PAYMENT_LINK]. Followed by your polite confirmation response: "I have dispatched a secure payment link directly to your mobile phone via SMS! You can click the link right now to finalize your account setup. Have a wonderful day!"`;
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
            if (isWebCall) {
              try {
                ws.send(JSON.stringify({ event: 'transcript', role: 'user', text: transcript }));
              } catch (e) {}
            }

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

            // Cancel any previous LLM streaming loop
            llmCancellation.cancelled = true;

            // Bind a new cancellation token for this specific completion
            const currentToken = { cancelled: false };
            llmCancellation = currentToken;

            try {
              const stream = await this.openAiService.getLlmCompletionStream(chatHistory);

              let fullResponseText = '';
              let currentSentence = '';

              for await (const chunk of stream) {
                if (currentToken.cancelled || !isCallActive) {
                  console.log('[LLM] Generative response cancelled.');
                  break;
                }

                const content = chunk.choices[0]?.delta?.content || '';
                fullResponseText += content;
                currentSentence += content;

                const sentenceEndRegex = /[,.!?;:]\s+/;
                const match = currentSentence.match(sentenceEndRegex);
                const wordCount = currentSentence.trim().split(/\s+/).length;
                if ((match && match.index !== undefined) || wordCount >= 6) {
                  const endPos = match && match.index !== undefined ? match.index + 1 : currentSentence.length;
                  const sentence = currentSentence.substring(0, endPos).trim();
                  currentSentence = currentSentence.substring(endPos);

                  const cleanSentence = sentence.replace(/\[ACTION:REQUEST_CALLBACK\]/gi, '').trim();
                  if (cleanSentence && !currentToken.cancelled) {
                    if (!speechSession && (streamSid || callSid)) {
                      speechSession = this.elevenLabsService.createSpeechSession(ws, streamSid || callSid, voiceId);
                    }
                    if (speechSession) {
                      speechSession.enqueueSentence(cleanSentence);
                    }
                  }
                }
              }

              const finalSentence = currentSentence
                .replace(/\[ACTION:REQUEST_CALLBACK\]/gi, '')
                .replace(/\[ACTION:SEND_PAYMENT_LINK\]/gi, '')
                .trim();
              if (finalSentence && !currentToken.cancelled) {
                if (!speechSession && (streamSid || callSid)) {
                  speechSession = this.elevenLabsService.createSpeechSession(ws, streamSid || callSid, voiceId);
                }
                if (speechSession) {
                  speechSession.enqueueSentence(finalSentence);
                }
              }

              if (fullResponseText.trim()) {
                const cleanedFullText = fullResponseText
                  .replace(/\[ACTION:REQUEST_CALLBACK\]/gi, '')
                  .replace(/\[ACTION:SEND_PAYMENT_LINK\]/gi, '')
                  .trim();
                const savedContent = currentToken.cancelled ? `${cleanedFullText}...` : cleanedFullText;
                chatHistory.push({ role: 'assistant', content: savedContent });
                if (isWebCall && !currentToken.cancelled) {
                  try {
                    ws.send(JSON.stringify({ event: 'transcript', role: 'agent', text: savedContent }));
                  } catch (e) {}
                }
              }

              if (fullResponseText.includes('[ACTION:SEND_PAYMENT_LINK]') && !currentToken.cancelled) {
                console.log(`[AI Payment Engine] LLM detected payment intent dynamically. Dispatching SMS checkout link...`);
                try {
                  const paymentRecord = await this.paymentsService.createCheckoutLink({
                    tenantId: targetTenantId,
                    amount: 250.0,
                    phone: callerPhone,
                    inquiredService: 'Utility Service Setup',
                    callId: callRecordId,
                    status: 'SMS_SENT',
                  });

                  if (paymentRecord && paymentRecord.id) {
                    await this.paymentsService.sendPaymentSms(paymentRecord.id);
                    console.log(`[AI Payment Engine] SMS Payment Link dispatched to ${callerPhone}: ${paymentRecord.link}`);
                  }
                } catch (paymentErr) {
                  console.error('[AI Payment Engine] Failed to dispatch SMS payment link:', paymentErr);
                }
              }

              if (fullResponseText.includes('[ACTION:REQUEST_CALLBACK]') && !currentToken.cancelled) {
                console.log(`[AI Action Engine] LLM detected callback intent dynamically. Updating DB...`);
                isCallActive = false;

                if (isWebCall) {
                  try {
                    ws.send(JSON.stringify({ event: 'hangup' }));
                  } catch (e) {}
                }

                try {
                  if (callRecordId) {
                    await this.prisma.call.update({
                      where: { id: callRecordId },
                      data: {
                        status: 'FORWARD_REQUESTED',
                        summary: `Callback/Transfer requested by caller: "${transcript}".`,
                      },
                    });
                  }
                } catch (err) {
                  console.error('[AI Action Engine] DB Update Failed:', err);
                }

                setTimeout(() => {
                  try {
                    console.log('[AI Action Engine] Closing WebSocket connection after AI Action Callback.');
                    ws.close();
                  } catch (e) {}
                }, 5000);
              } else if (containsGoodbye(transcript) && !currentToken.cancelled) {
                console.log(`[Goodbye Engine] Goodbye intent detected: "${transcript}". Scheduling graceful hangup...`);
                isCallActive = false;

                if (isWebCall) {
                  try {
                    ws.send(JSON.stringify({ event: 'hangup' }));
                  } catch (e) {}
                }

                setTimeout(() => {
                  try {
                    console.log('[Goodbye Engine] Closing WebSocket to hang up phone call.');
                    ws.close();
                  } catch (e) {}
                }, 4500);
              }
            } catch (err) {
              console.error('[LLM] OpenAI streaming error:', err);
            }
          }
        }
      });

      deepgramLive.on(LiveTranscriptionEvents.Error, (err: any) => {
        console.error('[Deepgram Live Error]:', JSON.stringify(err || {}));
      });

      deepgramLive.on(LiveTranscriptionEvents.Close, (event: any) => {
        console.log('[Deepgram Close Reason]:', JSON.stringify(event || {}));
      });
    }

    let hasGreeted = false;
    let mediaChunkCount = 0;

    const triggerGreeting = () => {
      if (!hasGreeted) {
        hasGreeted = true;
        if (!speechSession && (streamSid || callSid)) {
          speechSession = this.elevenLabsService.createSpeechSession(ws, streamSid || callSid, voiceId);
        }
        const greetingText = 'Hello! Thank you for calling. How can I help you today?';
        if (speechSession) {
          speechSession.enqueueSentence(greetingText);
        }
        chatHistory.push({
          role: 'assistant',
          content: greetingText,
        });
        if (isWebCall) {
          try {
            ws.send(
              JSON.stringify({
                event: 'transcript',
                role: 'agent',
                text: greetingText,
              }),
            );
          } catch (e) {}
        }
      }
    };

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        if (data.event !== 'media') {
          console.log('[VoiceGateway WS Event]:', data.event, JSON.stringify(data));
        }

        switch (data.event) {
          case 'connected':
            console.log(`[Twilio Connect] Connected. Protocol version: ${data.protocol}`);
            break;
          case 'start':
            streamSid = data.start?.streamSid || '';
            console.log(`[Twilio Start] Media stream started. StreamSid: ${streamSid}`);
            triggerGreeting();
            break;
          case 'media':
            if (data.streamSid && !streamSid) {
              streamSid = data.streamSid;
            }
            if (!speechSession && (streamSid || callSid)) {
              speechSession = this.elevenLabsService.createSpeechSession(ws, streamSid || callSid, voiceId);
            }
            triggerGreeting();
            mediaChunkCount++;
            if (mediaChunkCount === 1 || mediaChunkCount % 10 === 0) {
              console.log(`[VoiceGateway Media] Audio chunk #${mediaChunkCount} received (${data.media?.payload?.length || 0} chars).`);
            }
            if (isCallActive && deepgramLive) {
              try {
                const rawAudio = Buffer.from(data.media.payload, 'base64');
                deepgramLive.send(rawAudio);
              } catch (err) {
                console.error('[Deepgram Send Error]:', err);
              }
            }
            break;
          case 'stop':
            console.log('[Twilio Stop] Media stream stopped.');
            break;
          default:
            console.log('[VoiceGateway WS Unknown Event]:', data);
            break;
        }
      } catch (err) {
        console.error('[WebSocket Message Error] Parsing failed:', err, 'Raw text:', message);
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

          // Auto-create PENDING_QUOTE for prospective inquiries if none exists
          try {
            const existingPayment = await this.prisma.payment.findFirst({
              where: { phone: callerPhone, status: { in: ['PENDING_QUOTE', 'SMS_SENT', 'PAID'] } },
            });

            if (!existingPayment && callerPhone && !callerPhone.includes('Web Voice')) {
              await this.paymentsService.createCheckoutLink({
                tenantId: targetTenantId,
                amount: 250.0,
                phone: callerPhone,
                inquiredService: 'Utility Service Setup',
                callId: callRecordId,
                status: 'PENDING_QUOTE',
                notes: `Auto-captured from inquiry call summary: "${analysis.summary || 'Caller inquired about utility service options.'}"`,
              });
              console.log(`[Prospective Lead Engine] Logged PENDING_QUOTE for caller ${callerPhone}.`);
            }
          } catch (quoteErr) {
            console.error('[Prospective Lead Engine] Failed to log pending quote:', quoteErr);
          }
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
