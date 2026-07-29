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
    @Headers('x-forwarded-host') forwardedHost: string,
    @Headers('x-forwarded-proto') forwardedProto: string,
    @Res() res: Response,
  ) {
    const toPhone = (body.To || '').toString();
    const fromPhone = (body.From || '').toString();
    const callSid = (body.CallSid || '').toString();

    console.log(`[Twilio Inbound] Incoming call. CallSid: ${callSid}, From: ${fromPhone}, To: ${toPhone}`);

    const { tenant, agent } = await this.voiceService.getTenantAndAgent(toPhone);

    if (!tenant || !agent) {
      res.setHeader('Content-Type', 'text/xml');
      return res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Say>System error. Unable to locate receptionist.</Say><Hangup/></Response>`.trim());
    }

    if (await this.voiceService.isRateLimited(fromPhone, tenant.id)) {
      console.log(`[Rate Limiting] Caller ${fromPhone} is rate limited.`);
      res.setHeader('Content-Type', 'text/xml');
      return res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Say>You have exceeded the maximum allowed calls per hour. Please try again later.</Say><Hangup/></Response>`.trim());
    }

    const host = (forwardedHost || hostHeader || `localhost:${config.port}`).split(',')[0].trim();
    const scheme = forwardedProto === 'http' && host.includes('localhost') ? 'ws' : 'wss';
    const rawWsUrl = `${scheme}://${host}/stream?tenantId=${tenant.id}&agentId=${agent.id}&callSid=${callSid}&callerPhone=${encodeURIComponent(fromPhone)}`;
    const xmlWsUrl = rawWsUrl.replace(/&/g, '&amp;');
    const xmlRedirect = `/voice/post-stream?callSid=${callSid}`.replace(/&/g, '&amp;');

    const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Connect><Stream url="${xmlWsUrl}" /></Connect><Redirect>${xmlRedirect}</Redirect></Response>`.trim();

    res.setHeader('Content-Type', 'text/xml');
    return res.send(twiml);
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
