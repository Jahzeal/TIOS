const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('ws');
const { Client } = require('pg');

const DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/tios_db?schema=public";
const API_URL = "http://localhost:5000";
const WS_URL = "ws://localhost:5000";

let serverProcess;

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startServer() {
  console.log('[Test Setup] Starting API Server...');
  serverProcess = spawn('npx', ['tsx', 'src/index.ts'], {
    cwd: __dirname,
    env: { ...process.env, PORT: 5000, DATABASE_URL },
    shell: true
  });

  serverProcess.stdout.on('data', (data) => {
    console.log(`[Server]: ${data.toString().trim()}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`[Server Error]: ${data.toString().trim()}`);
  });

  await wait(3000);
}

async function clearCallsFromDb() {
  console.log('[Test Setup] Clearing previous test calls from database...');
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  await client.query('DELETE FROM "Call" WHERE "callerPhone" = \'+15550009999\' OR "callerPhone" = \'+15550008888\'');
  await client.end();
}

function postRequest(url, body) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const data = new URLSearchParams(body).toString();
    
    const req = http.request({
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => responseBody += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: responseBody }));
    });

    req.on('error', (err) => reject(err));
    req.write(data);
    req.end();
  });
}

function getRequest(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => responseBody += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: responseBody }));
    }).on('error', reject);
  });
}

async function testHealth() {
  console.log('\n--- Test 1: Health Endpoint ---');
  const res = await getRequest(`${API_URL}/health`);
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Response: ${res.body}`);
  if (res.statusCode === 200 && res.body.includes('online')) {
    console.log('PASS: Health endpoint works.');
  } else {
    throw new Error('FAIL: Health endpoint failed.');
  }
}

async function testVoiceAndRateLimiting() {
  console.log('\n--- Test 2: Inbound Webhook & Rate Limiting ---');
  const callerPhone = '+15550009999';
  const twilioPhone = '+18885550101';

  for (let i = 1; i <= 5; i++) {
    console.log(`Simulating Call #${i} from ${callerPhone}...`);
    const res = await postRequest(`${API_URL}/voice`, {
      CallSid: `test-call-sid-${i}`,
      From: callerPhone,
      To: twilioPhone,
      Direction: 'inbound'
    });
    
    if (res.statusCode !== 200 || !res.body.includes('<Stream')) {
      throw new Error(`FAIL: Inbound Call #${i} failed: ${res.body}`);
    }
  }

  console.log(`Simulating Call #6 (should be rate-limited)...`);
  const resLimit = await postRequest(`${API_URL}/voice`, {
    CallSid: 'test-call-sid-6',
    From: callerPhone,
    To: twilioPhone,
    Direction: 'inbound'
  });

  if (resLimit.body.includes('exceeded the maximum allowed calls')) {
    console.log('PASS: Rate limiting works and blocked call #6.');
  } else {
    throw new Error('FAIL: Rate limiting did not block call.');
  }
}

async function testWebSocketAndSafetyEngine() {
  console.log('\n--- Test 3: WebSocket & Safety Emergency Routing ---');
  const callerPhone = '+15550008888';
  const twilioPhone = '+18885550101';
  const testCallSid = `ws-call-sid-${Date.now()}`;

  const initRes = await postRequest(`${API_URL}/voice`, {
    CallSid: testCallSid,
    From: callerPhone,
    To: twilioPhone,
    Direction: 'inbound'
  });

  const match = initRes.body.match(/url="([^"]+)"/);
  if (!match) {
    throw new Error('FAIL: Could not extract WS stream URL.');
  }
  const fullWsUrl = match[1].replace('wss://', 'ws://');

  console.log('Connecting to WebSocket...');
  const ws = new WebSocket(fullWsUrl);

  const socketClosed = new Promise((resolve) => {
    ws.on('close', () => {
      console.log('[WS] Closed.');
      resolve();
    });
  });

  await new Promise((resolve, reject) => {
    ws.on('open', () => {
      ws.send(JSON.stringify({
        event: 'start',
        start: {
          streamSid: `stream-${testCallSid}`,
          callSid: testCallSid
        }
      }));
      resolve();
    });
    ws.on('error', reject);
  });

  await wait(1000);

  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  let dbRes = await client.query('SELECT * FROM "Call" WHERE sid = $1', [testCallSid]);
  if (dbRes.rows.length === 0 || dbRes.rows[0].status !== 'IN_PROGRESS') {
    await client.end();
    throw new Error('FAIL: Call record not initialized correctly in DB.');
  }
  console.log('PASS: Call record in DB initialized as IN_PROGRESS.');

  await client.query('UPDATE "Call" SET status = \'FORWARD_REQUESTED\' WHERE sid = $1', [testCallSid]);
  await client.end();

  const postStreamRes = await postRequest(`${API_URL}/voice/post-stream?callSid=${testCallSid}`, {});
  if (postStreamRes.body.includes('<Dial>') && postStreamRes.body.includes('+15555555555')) {
    console.log('PASS: Twilio forwarding XML generated correctly for FORWARD_REQUESTED.');
  } else {
    throw new Error('FAIL: Twilio forwarding XML was not generated correctly.');
  }

  if (ws.readyState === WebSocket.OPEN) {
    ws.close();
  }
  await socketClosed;
}

async function runAllTests() {
  try {
    await clearCallsFromDb();
    await startServer();
    await testHealth();
    await testVoiceAndRateLimiting();
    await testWebSocketAndSafetyEngine();
    console.log('\n=========================================');
    console.log('ALL TESTS COMPLETED SUCCESSFULLY! (PASS)');
    console.log('=========================================');
  } catch (err) {
    console.error('\n=========================================');
    console.error('TESTING COMPLETED WITH ERRORS! (FAIL)');
    console.error(err.message);
    console.error('=========================================');
    process.exitCode = 1;
  } finally {
    if (serverProcess) {
      serverProcess.kill();
    }
  }
}

runAllTests();
