import { Controller, Get, Post, Body, Query, Headers, Res, Inject } from '@nestjs/common';
import { Response } from 'express';
import { VoiceService } from './voice.service';
import { config } from '../config';

@Controller()
export class VoiceController {
  constructor(@Inject(VoiceService) private readonly voiceService: VoiceService) {}

  @Get('health')
  getHealth() {
    return { status: 'ok', message: 'TIOS API voice gateway is online.' };
  }

  @Post('voice')
  async handleVoice(
    @Body() body: any,
    @Headers('host') hostHeader: string,
    @Res() res: Response,
  ) {
    const toPhone = (body.To || '').toString();
    const fromPhone = (body.From || '').toString();
    const callSid = (body.CallSid || '').toString();

    console.log(`[Twilio Inbound] Incoming call. CallSid: ${callSid}, From: ${fromPhone}, To: ${toPhone}`);

    const { tenant, agent } = await this.voiceService.getTenantAndAgent(toPhone);

    if (await this.voiceService.isRateLimited(fromPhone, tenant.id)) {
      console.log(`[Rate Limiting] Caller ${fromPhone} is rate limited.`);
      res.setHeader('Content-Type', 'text/xml');
      return res.send(`
        <Response>
          <Say>You have exceeded the maximum allowed calls per hour. Please try again later.</Say>
          <Hangup/>
        </Response>
      `);
    }

    const host = hostHeader || `localhost:${config.port}`;
    const wsUrl = `wss://${host}/stream?tenantId=${tenant.id}&agentId=${agent.id}&callSid=${callSid}&callerPhone=${encodeURIComponent(fromPhone)}`;

    res.setHeader('Content-Type', 'text/xml');
    return res.send(`
      <Response>
        <Say>Connecting to the AI assistant.</Say>
        <Connect>
          <Stream url="${wsUrl}" />
        </Connect>
        <Redirect>/voice/post-stream?callSid=${callSid}</Redirect>
      </Response>
    `);
  }

  @Post('voice/post-stream')
  async handlePostStream(@Query('callSid') callSidParam: string, @Res() res: Response) {
    const callSid = (callSidParam || '').toString();
    console.log(`[Twilio Post-Stream] Webhook triggered. CallSid: ${callSid}`);

    const xmlResponse = await this.voiceService.handlePostStream(callSid);
    res.setHeader('Content-Type', 'text/xml');
    return res.send(xmlResponse);
  }
}
