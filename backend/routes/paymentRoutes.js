const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const admin = require('firebase-admin');
const crypto = require('crypto');
const { paymentRateLimiter, detectSuspiciousActivity, getFuckOffMessage } = require('../middlewares/paymentSecurity');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_live_RW6hQg5iL5Thm2',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'Q3dHSAcCjossSapgKhkBcsxd'
});

// Store used nonces to prevent replay attacks
const usedNonces = new Map();

// Clean up old nonces every 5 minutes
setInterval(() => {
  const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
  for (const [nonce, timestamp] of usedNonces.entries()) {
    if (timestamp < fiveMinutesAgo) {
      usedNonces.delete(nonce);
    }
  }
}, 5 * 60 * 1000);

// Decrypt payload
function decryptPayload(encrypted, iv, key) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
}

// Verify signature
function verifySignature(payload, nonce, signature, secret) {
  const data = JSON.stringify(payload) + nonce;
  const expectedSignature = crypto.createHmac('sha256', secret).update(data).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

// Security middleware for payment routes
function validatePaymentRequest(req, res, next) {
  const { encrypted, iv, nonce, timestamp } = req.body;
  const signature = req.headers['x-signature'];
  const requestNonce = req.headers['x-nonce'];
  const requestTimestamp = parseInt(req.headers['x-timestamp']);

  // Validate required fields
  if (!encrypted || !iv || !nonce || !signature || !requestNonce) {
    console.warn(`🚨 HACKING ATTEMPT: Missing security parameters from IP: ${req.ip}`);
    return res.status(400).json({ 
      error: getFuckOffMessage(),
      message: 'Missing security parameters - nice try asshole!',
      details: 'Your request is missing required security tokens. This looks like a hack attempt.',
      blocked: true
    });
  }

  // Check nonce matches
  if (nonce !== requestNonce) {
    console.warn(`🚨 HACKING ATTEMPT: Nonce mismatch from IP: ${req.ip}`);
    return res.status(400).json({ 
      error: getFuckOffMessage(),
      message: 'Nonce mismatch detected - you\'re trying to inject fake data!',
      details: 'Security token mismatch. This is clearly a hack attempt.',
      blocked: true
    });
  }

  // Check if nonce was already used (replay attack prevention)
  if (usedNonces.has(nonce)) {
    console.error(`🚨🚨🚨 REPLAY ATTACK DETECTED from IP: ${req.ip}`);
    console.error(`      Nonce: ${nonce}`);
    console.error(`      HACKER ATTEMPTING TO REUSE TOKEN!`);
    return res.status(403).json({ 
      error: getFuckOffMessage(),
      message: 'REPLAY ATTACK DETECTED! Fuck off hacker!',
      details: 'You\'re trying to replay an old request. We caught you, dumbass!',
      attackType: 'REPLAY_ATTACK',
      ipLogged: req.ip,
      reported: true,
      blocked: true
    });
  }

  // Validate timestamp (request must be within 30 seconds)
  const now = Date.now();
  if (Math.abs(now - requestTimestamp) > 30000) {
    console.warn(`🚨 HACKING ATTEMPT: Expired timestamp from IP: ${req.ip}`);
    console.warn(`      Time difference: ${Math.abs(now - requestTimestamp)}ms`);
    return res.status(400).json({ 
      error: getFuckOffMessage(),
      message: 'Request expired - trying to use old stolen tokens, huh?',
      details: 'Your request timestamp is too old. Stop trying to reuse intercepted data!',
      blocked: true
    });
  }

  // Decrypt payload
  const encryptionKey = process.env.PAYMENT_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
  const signatureSecret = process.env.PAYMENT_SIGNATURE_SECRET || 'default-secret-change-in-production';

  try {
    const payload = decryptPayload(encrypted, iv, encryptionKey);
    
    // Verify signature
    if (!verifySignature(payload, nonce, signature, signatureSecret)) {
      console.error(`🚨🚨🚨 TAMPERING DETECTED from IP: ${req.ip}`);
      console.error(`      INVALID SIGNATURE - DATA WAS MODIFIED!`);
      return res.status(401).json({ 
        error: getFuckOffMessage(),
        message: 'INVALID SIGNATURE! You modified the request data, asshole!',
        details: 'Signature verification failed. You\'re trying to tamper with payment data.',
        attackType: 'REQUEST_TAMPERING',
        ipLogged: req.ip,
        reported: true,
        blocked: true
      });
    }

    // Mark nonce as used
    usedNonces.set(nonce, now);

    // Attach decrypted payload to request
    req.securePayload = payload;
    next();
  } catch (error) {
    console.error('🚨 HACKING ATTEMPT: Payment request validation error:', error.message);
    console.error(`   IP: ${req.ip}`);
    return res.status(400).json({ 
      error: getFuckOffMessage(),
      message: 'Invalid encrypted payload - you\'re not using our official client!',
      details: 'Failed to decrypt your request. Stop trying to inject fake payment data!',
      blocked: true
    });
  }
}

// Create order endpoint with enhanced security
router.post('/create-order', 
  paymentRateLimiter, 
  validatePaymentRequest, 
  detectSuspiciousActivity, 
  async (req, res) => {
  const { courseId, userId, requestId } = req.securePayload;
  try {
    // Additional validation - verify user from Firebase token
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Verify userId matches token
      if (decodedToken.uid !== userId) {
        return res.status(403).json({ error: 'User ID mismatch' });
      }
    }

    // Fetch course price from Firestore
    const courseDoc = await admin.firestore().collection('courses').doc(courseId).get();
    if (!courseDoc.exists) {
      return res.status(404).json({ error: 'Course not found' });
    }
    const price = courseDoc.data().price;
    const amount = price * 100; // Razorpay expects paise

    // Generate dynamic receipt with request ID for tracking
    const options = {
      amount,
      currency: 'INR',
      receipt: `receipt_${requestId.substring(0, 16)}_${Date.now()}`,
      notes: {
        courseId,
        userId,
        requestId,
        securePayment: 'true'
      }
    };
    const order = await razorpay.orders.create(options);

    // Store order in Firestore with security metadata
    await admin.firestore().collection('razorpayOrders').doc(order.id).set({
      courseId,
      userId,
      requestId,
      amount,
      currency: 'INR',
      status: 'created',
      createdAt: new Date().toISOString(),
      securityValidated: true,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // Generate response signature
    const responseData = { order };
    const responseNonce = crypto.randomBytes(16).toString('hex');
    const signatureSecret = process.env.PAYMENT_SIGNATURE_SECRET || 'default-secret-change-in-production';
    const responseSignature = crypto.createHmac('sha256', signatureSecret)
      .update(JSON.stringify(responseData) + responseNonce)
      .digest('hex');

    res.setHeader('X-Response-Signature', responseSignature);
    res.setHeader('X-Response-Nonce', responseNonce);
    res.json(responseData);
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

module.exports = router;
