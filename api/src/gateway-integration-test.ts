/**
 * gateway-integration-test.ts
 *
 * Integration tests for VoiceGateway (/stream) and WebVoiceGateway (/stream/web).
 *
 * Run against a running TIOS API server:
 *   npx tsx src/gateway-integration-test.ts
 *
 * Or against production:
 *   API_BASE_URL=wss://tios.onrender.com npx tsx src/gateway-integration-test.ts
 */

import WebSocket from 'ws';

const API_BASE_URL = process.env.API_BASE_URL || 'ws://localhost:10000';
const TIMEOUT_MS = 8000;

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    console.log(`  [PASS] ${label}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${label}`);
    failed++;
  }
}

function connectWs(path: string, params: Record<string, string>): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const query = new URLSearchParams(params).toString();
    const wsUrl = `${API_BASE_URL}${path}?${query}`;
    console.log(`\n  Connecting to: ${wsUrl}`);
    const ws = new WebSocket(wsUrl);
    ws.on('open', () => resolve(ws));
    ws.on('error', reject);
    setTimeout(() => reject(new Error(`Connection timeout: ${wsUrl}`)), TIMEOUT_MS);
  });
}

function collectMessages(ws: WebSocket, durationMs: number): Promise<any[]> {
  return new Promise((resolve) => {
    const messages: any[] = [];
    ws.on('message', (raw) => {
      try {
        messages.push(JSON.parse(raw.toString()));
      } catch {
        messages.push({ raw: raw.toString() });
      }
    });
    setTimeout(() => resolve(messages), durationMs);
  });
}

async function testTwilioGateway() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 1: VoiceGateway (/stream) — Twilio Mode');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  let ws: WebSocket | null = null;
  try {
    ws = await connectWs('/stream', {
      callSid: 'CAtest1234567890abcdef1234567890ab',
      tenantId: 'test-tenant',
      agentId: 'test-agent',
      direction: 'INBOUND',
    });

    assert(ws.readyState === WebSocket.OPEN, 'WebSocket connected to /stream');

    const collectPromise = collectMessages(ws, 4000);

    ws.send(JSON.stringify({ event: 'connected', protocol: '1.0.0' }));

    await new Promise(r => setTimeout(r, 100));

    ws.send(JSON.stringify({
      event: 'start',
      start: {
        streamSid: 'MZtest1234567890abcdef1234567890ab',
        callSid: 'CAtest1234567890abcdef1234567890ab',
        customParameters: {
          callerPhone: '+17808025420',
          tenantId: 'test-tenant',
        },
      },
    }));

    await new Promise(r => setTimeout(r, 500));

    const silentMulaw = Buffer.alloc(160, 0xFF);
    for (let i = 0; i < 5; i++) {
      ws.send(JSON.stringify({
        event: 'media',
        streamSid: 'MZtest1234567890abcdef1234567890ab',
        media: { payload: silentMulaw.toString('base64') },
      }));
      await new Promise(r => setTimeout(r, 50));
    }

    const messages = await collectPromise;

    const eventTypes = messages.map(m => m.event).filter(Boolean);
    console.log(`\n  Received event types from /stream: [${eventTypes.join(', ')}]`);

    const transcriptEvents = messages.filter(m => m.event === 'transcript');
    assert(
      transcriptEvents.length === 0,
      `NO 'transcript' events sent to Twilio WebSocket (received: ${transcriptEvents.length})`
    );

    const validTwilioEvents = messages.filter(m =>
      m.event === 'media' || m.event === 'mark' || m.event === 'clear'
    );
    console.log(`  Valid Twilio events received: ${validTwilioEvents.length}`);

    const invalidEvents = messages.filter(m =>
      m.event && !['media', 'mark', 'clear'].includes(m.event)
    );
    assert(
      invalidEvents.length === 0,
      `ONLY valid Twilio event types (media/mark/clear) sent — invalid: [${invalidEvents.map(e => e.event).join(', ')}]`
    );

    if (validTwilioEvents.length > 0) {
      const mediaEvent = validTwilioEvents.find(m => m.event === 'media');
      if (mediaEvent) {
        assert(
          typeof mediaEvent.streamSid === 'string' && mediaEvent.streamSid.startsWith('MZ'),
          `Media frames use valid MZ... streamSid (got: ${mediaEvent.streamSid})`
        );
      }
    }

  } catch (err: any) {
    console.error(`  [FAIL] TEST 1 ERROR: ${err.message}`);
    failed++;
  } finally {
    if (ws && ws.readyState === WebSocket.OPEN) ws.close();
  }
}

async function testWebGateway() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 2: WebVoiceGateway (/stream/web) — Browser Mode');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  let ws: WebSocket | null = null;
  try {
    const webCallSid = `web-call-${Date.now()}`;
    ws = await connectWs('/stream/web', {
      callSid: webCallSid,
      tenantId: 'test-tenant',
      agentId: 'test-agent',
    });

    assert(ws.readyState === WebSocket.OPEN, 'WebSocket connected to /stream/web');

    const collectPromise = collectMessages(ws, 5000);

    ws.send(JSON.stringify({
      event: 'start',
      start: {
        streamSid: `stream-${webCallSid}`,
        callSid: webCallSid,
      },
    }));

    const messages = await collectPromise;

    const eventTypes = messages.map(m => m.event).filter(Boolean);
    console.log(`\n  Received event types from /stream/web: [${eventTypes.join(', ')}]`);

    const transcriptEvents = messages.filter(m => m.event === 'transcript');
    assert(
      transcriptEvents.length > 0,
      `'transcript' events ARE sent to browser (received: ${transcriptEvents.length})`
    );

    const agentTranscripts = transcriptEvents.filter(m => m.role === 'agent');
    assert(
      agentTranscripts.length > 0,
      `Agent greeting transcript received (count: ${agentTranscripts.length})`
    );

    if (agentTranscripts.length > 0) {
      console.log(`  Agent greeting: "${agentTranscripts[0].text}"`);
      assert(
        typeof agentTranscripts[0].text === 'string' && agentTranscripts[0].text.length > 0,
        'Agent greeting text is non-empty'
      );
    }

  } catch (err: any) {
    console.error(`  [FAIL] TEST 2 ERROR: ${err.message}`);
    failed++;
  } finally {
    if (ws && ws.readyState === WebSocket.OPEN) ws.close();
  }
}

async function testPathIsolation() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('TEST 3: Path Isolation — Browser on /stream gets NO transcripts');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  let ws: WebSocket | null = null;
  try {
    ws = await connectWs('/stream', {
      callSid: 'CAtest9999',
      tenantId: 'test-tenant',
    });

    const collectPromise = collectMessages(ws, 3000);

    ws.send(JSON.stringify({
      event: 'start',
      start: {
        streamSid: 'MZtest9999fake',
        callSid: 'CAtest9999',
      },
    }));

    const messages = await collectPromise;
    const transcriptEvents = messages.filter(m => m.event === 'transcript');

    assert(
      transcriptEvents.length === 0,
      `Connecting to /stream NEVER returns 'transcript' events (got: ${transcriptEvents.length})`
    );

  } catch (err: any) {
    console.error(`  [FAIL] TEST 3 ERROR: ${err.message}`);
    failed++;
  } finally {
    if (ws && ws.readyState === WebSocket.OPEN) ws.close();
  }
}

async function runAll() {
  console.log('\nTIOS Gateway Integration Tests');
  console.log(`   Target: ${API_BASE_URL}`);
  console.log('═════════════════════════════════════════════\n');

  await testTwilioGateway();
  await testWebGateway();
  await testPathIsolation();

  console.log('\n═════════════════════════════════════════════');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed === 0) {
    console.log('ALL TESTS PASSED!\n');
    process.exit(0);
  } else {
    console.log('SOME TESTS FAILED\n');
    process.exit(1);
  }
}

runAll().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
