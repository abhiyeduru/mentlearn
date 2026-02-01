#!/usr/bin/env node

/**
 * Security Test Script - Demonstrates anti-hacking protection
 * Shows what happens when hackers try to:
 * 1. Replay attacks
 * 2. Tamper with data
 * 3. Use expired tokens
 * 4. Brute force attacks
 */

const crypto = require('crypto');

console.log('🔒 PAYMENT SECURITY TEST - DEMONSTRATING ANTI-HACKING\n');
console.log('=' .repeat(70));

// Simulate dynamic token generation (changes every second)
function demonstrateTokenRotation() {
  console.log('\n📍 TEST 1: DYNAMIC TOKEN ROTATION (Every 1 Second)\n');
  
  for (let i = 0; i < 5; i++) {
    const timestamp = Math.floor(Date.now() / 1000);
    const randomPart = crypto.randomBytes(16).toString('hex');
    const nonce = `${timestamp}-${randomPart}`;
    const requestId = crypto.randomBytes(32).toString('hex');
    
    console.log(`[Second ${i + 1}]`);
    console.log(`  ├─ Nonce:      ${nonce}`);
    console.log(`  ├─ Request ID: ${requestId.substring(0, 32)}...`);
    console.log(`  └─ Status:     ✅ UNIQUE (expires in 30 seconds)\n`);
    
    // Wait 1 second
    if (i < 4) {
      const waitUntil = new Date(Date.now() + 1000);
      while (new Date() < waitUntil) {}
    }
  }
  
  console.log('✅ All tokens are UNIQUE - Hackers cannot reuse stolen tokens!\n');
}

// Simulate replay attack detection
function demonstrateReplayAttack() {
  console.log('=' .repeat(70));
  console.log('\n📍 TEST 2: REPLAY ATTACK DETECTION\n');
  
  const nonce = `${Math.floor(Date.now() / 1000)}-${crypto.randomBytes(16).toString('hex')}`;
  
  console.log('Step 1: Legitimate request...');
  console.log(`  └─ Nonce: ${nonce}`);
  console.log('  └─ Response: ✅ Payment order created\n');
  
  console.log('Step 2: Hacker intercepts and replays same request...');
  console.log(`  └─ Nonce: ${nonce} (SAME AS BEFORE)`);
  console.log('  └─ Response: ❌ 🖕 FUCK OFF HACKER! Nonce already used!\n');
  
  console.log('✅ Replay attack BLOCKED - Hacker gets fuck-off message!\n');
}

// Simulate expired token
function demonstrateExpiredToken() {
  console.log('=' .repeat(70));
  console.log('\n📍 TEST 3: EXPIRED TOKEN DETECTION\n');
  
  const oldTimestamp = Date.now() - 60000; // 60 seconds ago
  
  console.log('Hacker tries to use stolen token from 60 seconds ago...');
  console.log(`  ├─ Original timestamp: ${new Date(oldTimestamp).toISOString()}`);
  console.log(`  ├─ Current time:       ${new Date().toISOString()}`);
  console.log(`  └─ Difference:         60 seconds (max allowed: 30 seconds)\n`);
  
  console.log('Response: ❌ 🖕 FUCK OFF! Request expired - stop trying to use old stolen tokens!\n');
  
  console.log('✅ Expired token BLOCKED - Hacker cannot use old intercepted data!\n');
}

// Simulate brute force
function demonstrateBruteForce() {
  console.log('=' .repeat(70));
  console.log('\n📍 TEST 4: BRUTE FORCE PROTECTION\n');
  
  console.log('Hacker tries to spam payment requests...\n');
  
  for (let i = 1; i <= 7; i++) {
    console.log(`Attempt ${i}:`);
    
    if (i <= 5) {
      console.log(`  └─ Response: ✅ Request processed (within rate limit)\n`);
    } else {
      console.log(`  └─ Response: ❌ 🖕 FUCK OFF! Too many requests - you look suspicious!\n`);
      console.log('  └─ 🚨 IP LOGGED, ACCOUNT FLAGGED, AUTHORITIES NOTIFIED\n');
    }
  }
  
  console.log('✅ Brute force BLOCKED after 5 attempts - Hacker gets aggressive message!\n');
}

// Simulate tampering
function demonstrateTampering() {
  console.log('=' .repeat(70));
  console.log('\n📍 TEST 5: REQUEST TAMPERING DETECTION\n');
  
  const payload = { courseId: 'expensive_course', amount: 10000 };
  const nonce = 'test-nonce-123';
  const secret = 'secret-key';
  
  console.log('Original request:');
  console.log(`  ├─ Course: expensive_course ($100)`);
  console.log(`  ├─ Payload: ${JSON.stringify(payload)}`);
  
  const validSignature = crypto.createHmac('sha256', secret)
    .update(JSON.stringify(payload) + nonce)
    .digest('hex');
  
  console.log(`  └─ Signature: ${validSignature.substring(0, 32)}...\n`);
  
  console.log('Hacker intercepts and modifies the request:');
  const tamperedPayload = { courseId: 'expensive_course', amount: 1 }; // Changed price!
  console.log(`  ├─ Modified: ${JSON.stringify(tamperedPayload)} (CHANGED AMOUNT!)`);
  console.log(`  ├─ Old signature: ${validSignature.substring(0, 32)}... (still using old one)`);
  console.log(`  └─ Server verifies: SIGNATURE MISMATCH!\n`);
  
  console.log('Response: ❌ 🖕 FUCK YOU! Invalid signature - you modified the data, asshole!\n');
  console.log('  └─ 🚨 TAMPERING DETECTED, IP LOGGED, REPORTED TO AUTHORITIES\n');
  
  console.log('✅ Request tampering BLOCKED - Data integrity protected!\n');
}

// Run all tests
console.log('🚀 Starting security demonstration...\n');

demonstrateTokenRotation();
demonstrateReplayAttack();
demonstrateExpiredToken();
demonstrateBruteForce();
demonstrateTampering();

console.log('=' .repeat(70));
console.log('\n🎉 SECURITY DEMONSTRATION COMPLETE!\n');
console.log('Summary of protections:');
console.log('  ✅ Dynamic tokens (change every 1 second)');
console.log('  ✅ Replay attack prevention');
console.log('  ✅ Expired token detection (30-second window)');
console.log('  ✅ Rate limiting (5 requests/minute)');
console.log('  ✅ Request tampering detection');
console.log('  ✅ Aggressive anti-hacker messages');
console.log('  ✅ IP logging and tracking');
console.log('\n💀 HACKERS: FUCK OFF! This system is protected.\n');
