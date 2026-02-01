# 🔒 Payment Security System

## Overview
Advanced payment security system with **dynamic token rotation** and multi-layer protection against interception attacks.

## 🛡️ Security Features

### 1. **Dynamic Token Generation (Changes Every Second)**
- Nonce tokens regenerate every second
- Request IDs are unique 32-byte random values
- Timestamps ensure requests are valid for only 30 seconds
- Prevents replay attacks and token reuse

### 2. **Request Encryption**
- All payment data encrypted with AES-256-CBC
- Dynamic IV (Initialization Vector) for each request
- Payload includes: courseId, userId, requestId, timestamp

### 3. **HMAC Signature Verification**
- SHA-256 HMAC signatures for request integrity
- Signature includes payload + nonce
- Timing-safe comparison prevents timing attacks
- Both request and response are signed

### 4. **Replay Attack Prevention**
- Nonce tracking prevents reuse
- Used nonces stored in memory (5-minute expiry)
- Automatic cleanup of old nonces

### 5. **Rate Limiting**
- 5 requests per minute per user
- IP + User ID based tracking
- Suspicious activity detection (10+ attempts = block)

### 6. **Request Validation**
- Timestamp validation (30-second window)
- Nonce uniqueness check
- Signature verification
- Firebase token validation
- User ID matching

## 🚀 Setup Instructions

### Step 1: Generate Security Keys
```bash
node generate-security-keys.js
```

### Step 2: Add Keys to .env
```bash
# Copy the generated keys
PAYMENT_ENCRYPTION_KEY=<your-generated-key>
PAYMENT_SIGNATURE_SECRET=<your-generated-secret>

# Frontend (.env in React app)
REACT_APP_PAYMENT_ENCRYPTION_KEY=<same-key-as-backend>
REACT_APP_PAYMENT_SIGNATURE_SECRET=<same-secret-as-backend>
```

### Step 3: Install Dependencies
```bash
npm install express-rate-limit
```

### Step 4: Test Security
```bash
# Start backend
npm run dev

# Test payment flow
# The system will now validate all security parameters
```

## 🔐 How It Works

### Client Side (paymenyClient.js)
1. Generate dynamic nonce (changes every second)
2. Create unique request ID
3. Add timestamp
4. Encrypt payload with AES-256
5. Generate HMAC signature
6. Send encrypted data + security headers

### Server Side (paymentRoutes.js)
1. Validate all security parameters
2. Check nonce hasn't been used (replay prevention)
3. Verify timestamp (30-second window)
4. Decrypt payload
5. Verify HMAC signature
6. Validate Firebase token
7. Check for suspicious activity
8. Process payment
9. Sign response

## 🔴 Security Flow Diagram

```
Client Request
    ↓
[Generate Nonce] → Changes every second
    ↓
[Encrypt Payload] → AES-256-CBC with dynamic IV
    ↓
[Sign Request] → HMAC-SHA256
    ↓
[Send to Server] → With security headers
    ↓
Server Middleware
    ↓
[Check Nonce] → Prevent replay
    ↓
[Verify Timestamp] → 30s window
    ↓
[Decrypt] → Extract payload
    ↓
[Verify Signature] → Validate integrity
    ↓
[Rate Limit] → 5 req/min
    ↓
[Process Payment] → Razorpay
    ↓
[Sign Response] → Return with signature
```

## ⚠️ Attack Prevention

### Prevented Attack Types:
✅ **Man-in-the-Middle (MITM)** - Encryption prevents data reading  
✅ **Replay Attacks** - Nonce tracking + timestamp validation  
✅ **Token Theft** - Tokens expire in 1 second  
✅ **Request Tampering** - HMAC signature verification  
✅ **Brute Force** - Rate limiting (5 req/min)  
✅ **DDoS** - Rate limiting + suspicious activity detection  
✅ **Session Hijacking** - Dynamic tokens prevent session reuse  

## 📊 Security Headers

### Request Headers:
- `Authorization`: Bearer <firebase-token>
- `X-Request-ID`: Unique request identifier
- `X-Nonce`: Dynamic nonce (changes every second)
- `X-Timestamp`: Request timestamp
- `X-Signature`: HMAC signature
- `X-Client-Version`: Client version tracking

### Response Headers:
- `X-Response-Signature`: Response integrity signature
- `X-Response-Nonce`: Response nonce

## 🔧 Configuration

### Environment Variables:
```bash
# Encryption (Backend & Frontend)
PAYMENT_ENCRYPTION_KEY=64-character-hex-string
PAYMENT_SIGNATURE_SECRET=strong-random-secret

# Rate Limiting (Backend only)
PAYMENT_RATE_LIMIT_WINDOW=60000      # 1 minute
PAYMENT_RATE_LIMIT_MAX_REQUESTS=5    # 5 requests

# Security Settings (Backend only)
PAYMENT_NONCE_EXPIRY=300000          # 5 minutes
PAYMENT_REQUEST_TIMEOUT=30000        # 30 seconds
```

## 🚨 Monitoring & Alerts

### Suspicious Activity Detection:
- **10+ attempts in 5 minutes** → Account blocked
- **Invalid signatures** → Logged to security system
- **Replay attempts** → Flagged for review
- **Expired timestamps** → Tracked for patterns

### Logging:
```javascript
// Automatically logged:
- Invalid signature attempts
- Replay attack attempts
- Rate limit violations
- Suspicious activity patterns
```

## 🧪 Testing Security

### Test Valid Request:
```bash
# Request will succeed with valid encryption and signature
curl -X POST http://localhost:5001/api/payment/create-order \
  -H "Content-Type: application/json" \
  -H "X-Nonce: <nonce>" \
  -H "X-Timestamp: <timestamp>" \
  -H "X-Signature: <signature>" \
  -d '{"encrypted":"...","iv":"...","nonce":"...","timestamp":...}'
```

### Test Replay Attack:
```bash
# Same nonce twice will fail (second request blocked)
# Response: "Nonce already used - possible replay attack"
```

### Test Expired Request:
```bash
# Request older than 30 seconds will fail
# Response: "Request timestamp expired"
```

## 📝 Best Practices

1. **Never log encryption keys** in production
2. **Rotate keys regularly** (monthly recommended)
3. **Use HTTPS only** in production
4. **Monitor failed attempts** for patterns
5. **Different keys** for dev/staging/production
6. **Enable Redis** for distributed rate limiting
7. **Set up security alerts** for admin team

## 🆘 Troubleshooting

### "Nonce already used":
- Client retrying too fast
- Clock synchronization issue
- Actual replay attack attempt

### "Request timestamp expired":
- Server/client clock out of sync
- Network delay > 30 seconds
- Check server time: `date`

### "Invalid signature":
- Key mismatch between frontend/backend
- Payload modified during transit
- Verify both .env files match

## 🔄 Key Rotation Process

```bash
# 1. Generate new keys
node generate-security-keys.js

# 2. Update backend .env (keep old keys as backup)
PAYMENT_ENCRYPTION_KEY_OLD=<old-key>
PAYMENT_ENCRYPTION_KEY=<new-key>

# 3. Deploy backend

# 4. Update frontend .env
REACT_APP_PAYMENT_ENCRYPTION_KEY=<new-key>

# 5. Deploy frontend

# 6. Remove old keys after 24 hours
```

## 📞 Support

For security concerns or questions:
- Email: security@mentlearn.com
- Emergency: Call support team immediately

---

**Last Updated:** January 2, 2026  
**Version:** 2.0.0  
**Security Level:** Maximum 🔒
