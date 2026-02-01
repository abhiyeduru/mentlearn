#!/usr/bin/env node
const crypto = require('crypto');

console.log('=== Payment Security Keys Generator ===\n');

// Generate 256-bit encryption key
const encryptionKey = crypto.randomBytes(32).toString('hex');
console.log('PAYMENT_ENCRYPTION_KEY=' + encryptionKey);

// Generate strong signature secret
const signatureSecret = crypto.randomBytes(64).toString('hex');
console.log('PAYMENT_SIGNATURE_SECRET=' + signatureSecret);

console.log('\n=== Add these to your .env file ===');
console.log('⚠️  NEVER commit these keys to version control!');
console.log('⚠️  Use different keys for development and production!');
console.log('⚠️  Keys change every time you run this script - save them immediately!');
