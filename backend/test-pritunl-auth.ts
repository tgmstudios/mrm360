import crypto from 'crypto';
import https from 'https';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const config = {
  baseUrl: process.env.PRITUNL_BASE_URL || 'https://pritunl.psuccso.org',
  apiToken: process.env.PRITUNL_API_TOKEN || '',
  apiSecret: process.env.PRITUNL_API_SECRET || '',
};

function generateAuthHeaders(method: string, path: string): Record<string, string> {
  const authTimestamp = Math.floor(Date.now() / 1000).toString();
  const authNonce = crypto.randomBytes(16).toString('hex');
  
  // Pritunl authentication string format
  const authString = [
    config.apiToken,
    authTimestamp,
    authNonce,
    method,
    path,
  ].join('&');

  console.log('Auth String:', authString);

  // Generate HMAC-SHA256 signature
  const authSignature = crypto
    .createHmac('sha256', config.apiSecret)
    .update(authString)
    .digest('base64');

  console.log('Auth Signature:', authSignature);

  return {
    'Auth-Token': config.apiToken,
    'Auth-Timestamp': authTimestamp,
    'Auth-Nonce': authNonce,
    'Auth-Signature': authSignature,
    'Content-Type': 'application/json',
  };
}

console.log('Testing Pritunl API Authentication\n');
console.log('Config:');
console.log('  Base URL:', config.baseUrl);
console.log('  API Token:', config.apiToken);
console.log('  API Secret:', config.apiSecret ? '***' + config.apiSecret.slice(-4) : 'MISSING');
console.log();

const method = 'GET';
const path = '/organization';

console.log('Request:');
console.log(`  Method: ${method}`);
console.log(`  Path: ${path}`);
console.log();

const headers = generateAuthHeaders(method, path);
console.log('Headers:');
Object.entries(headers).forEach(([key, value]) => {
  console.log(`  ${key}: ${value}`);
});
console.log();

const url = new URL(path, config.baseUrl);

const options = {
  method,
  headers,
  rejectUnauthorized: false,
};

console.log('Making request to:', url.toString());
console.log();

const req = https.request(url, options, (res) => {
  let data = '';

  console.log('Response Status:', res.statusCode);
  console.log('Response Headers:', JSON.stringify(res.headers, null, 2));
  console.log();

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response Body:');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
    } catch {
      console.log(data);
    }
  });
});

req.on('error', (err) => {
  console.error('Request error:', err);
});

req.end();
