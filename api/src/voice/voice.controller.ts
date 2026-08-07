import { Controller, Get, Post, Body, Query, Headers, Req, Res, Inject } from '@nestjs/common';
import { Request, Response } from 'express';
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
    @Query() query: any,
    @Req() req: Request,
    @Headers('host') hostHeader: string,
    @Headers('x-forwarded-host') forwardedHost: string,
    @Headers('x-forwarded-proto') forwardedProto: string,
    @Res() res: Response,
  ) {
    const directionParam = query?.direction;
    const toPhone = (body.To || '').toString();
    const fromPhone = (body.From || '').toString();
    const callSid = (body.CallSid || '').toString();
    const direction = (directionParam || body.direction || 'INBOUND').toString().toUpperCase();

    console.log(`[Twilio Inbound] Incoming call. CallSid: ${callSid}, Direction: ${direction}, From: ${fromPhone}, To: ${toPhone}`);

    const { tenant, agent } = await this.voiceService.getTenantAndAgent(toPhone);

    if (!tenant || !agent) {
      res.setHeader('Content-Type', 'text/xml');
      return res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Say>System error. Unable to locate receptionist.</Say><Hangup/></Response>`.trim());
    }

    if (callSid && fromPhone) {
      await this.voiceService.createInitialCallRecord({
        sid: callSid,
        callerPhone: fromPhone,
        tenantId: tenant.id,
        agentId: agent.id,
        direction: direction,
      } as any);
    }

    if (await this.voiceService.isRateLimited(fromPhone, tenant.id)) {
      console.log(`[Rate Limiting] Caller ${fromPhone} is rate limited.`);
      res.setHeader('Content-Type', 'text/xml');
      return res.send(`<?xml version="1.0" encoding="UTF-8"?><Response><Say>You have exceeded the maximum allowed calls per hour. Please try again later.</Say><Hangup/></Response>`.trim());
    }

    const serviceQuery = (req.query?.service || req.query?.inquiredService || '').toString();
    const amountQuery = (req.query?.amount || '').toString();
    const intentQuery = (req.query?.intent || req.query?.intentType || '').toString();

    const host = (forwardedHost || hostHeader || `localhost:${config.port}`).split(',')[0].trim();
    const scheme = forwardedProto === 'http' && host.includes('localhost') ? 'ws' : 'wss';
    const rawWsUrl = `${scheme}://${host}/stream?tenantId=${tenant.id}&agentId=${agent.id}&callSid=${callSid}&callerPhone=${encodeURIComponent(fromPhone)}&direction=${direction}&service=${encodeURIComponent(serviceQuery)}&amount=${encodeURIComponent(amountQuery)}&intent=${encodeURIComponent(intentQuery)}`;
    const xmlWsUrl = rawWsUrl.replace(/&/g, '&amp;');
    const xmlRedirect = `/voice/post-stream?callSid=${callSid}`.replace(/&/g, '&amp;');

    const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Connect><Stream url="${xmlWsUrl}"><Parameter name="callerPhone" value="${fromPhone}" /><Parameter name="tenantId" value="${tenant.id}" /><Parameter name="agentId" value="${agent.id}" /><Parameter name="callSid" value="${callSid}" /><Parameter name="direction" value="${direction}" /></Stream></Connect><Redirect>${xmlRedirect}</Redirect></Response>`.trim();

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
