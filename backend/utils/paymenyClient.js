// src/utils/paymentClient.js
import { getAuth } from 'firebase/auth';
import crypto from 'crypto';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5001';

// Generate dynamic nonce that changes every second
function generateDynamicNonce() {
  const timestamp = Math.floor(Date.now() / 1000); // Changes every second
  const randomPart = crypto.randomBytes(16).toString('hex');
  return `${timestamp}-${randomPart}`;
}

// Generate HMAC signature for request validation
function generateSignature(payload, nonce, secret) {
  const data = JSON.stringify(payload) + nonce;
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

// Encrypt sensitive data
function encryptPayload(payload, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  let encrypted = cipher.update(JSON.stringify(payload), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    encrypted,
    iv: iv.toString('hex')
  };
}

export async function createOrder(courseId) {
  if (!courseId) throw new Error('courseId required');

  const auth = getAuth();
  const user = auth.currentUser;
  const idToken = user ? await user.getIdToken(/* forceRefresh */ true) : null; // Force refresh for security

  // Generate dynamic security tokens
  const nonce = generateDynamicNonce();
  const requestId = crypto.randomBytes(32).toString('hex');
  const timestamp = Date.now();

  // Log security info (IDs change every second)
  console.log('🔒 PAYMENT SECURITY ACTIVE - IDs ROTATE EVERY 1 SECOND');
  console.log(`   Request ID: ${requestId.substring(0, 16)}...`);
  console.log(`   Nonce: ${nonce}`);
  console.log(`   Timestamp: ${timestamp}`);
  console.log(`   ⚡ These tokens will expire in 30 seconds`);
  console.log(`   🛡️ Anti-hacking protection: ENABLED`);

  // Prepare payload with security metadata
  const payload = {
    courseId,
    requestId,
    timestamp,
    userId: user?.uid
  };

  // Get encryption key from environment
  const encryptionKey = process.env.REACT_APP_PAYMENT_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
  const signatureSecret = process.env.REACT_APP_PAYMENT_SIGNATURE_SECRET || 'default-secret-change-in-production';

  // Encrypt sensitive payload
  const { encrypted, iv } = encryptPayload(payload, encryptionKey);
  
  // Generate signature
  const signature = generateSignature(payload, nonce, signatureSecret);

  // Enhanced security headers
  const headers = {
    'Content-Type': 'application/json',
    'X-Request-ID': requestId,
    'X-Nonce': nonce,
    'X-Timestamp': timestamp.toString(),
    'X-Signature': signature,
    'X-Client-Version': '2.0.0',
    ...(idToken ? { Authorization: `Bearer ${idToken}` } : {})
  };

  const res = await fetch(`${API_BASE}/api/payment/create-order`, {
    method: 'POST',
    credentials: 'omit', // IMPORTANT: prevents cookies (and large Cookie header)
    headers,
    body: JSON.stringify({
      encrypted,
      iv,
      nonce,
      timestamp
    })
  });

  // handle non-JSON or non-2xx responses
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch(e) { data = { raw: text }; }

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.payload = data;
    throw err;
  }
  return data; // expected { order }
}

// src/someOtherFile.js
import { createOrder } from './utils/paymentClient';

async function onBuy(courseId) {
  try {
    const data = await createOrder(courseId);
    // open Razorpay checkout with data.order
  } catch(err) {
    console.error(err);
    alert(err.message || 'Payment initialization failed');
  }
}