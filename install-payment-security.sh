#!/bin/bash

echo "🔒 Installing Payment Security Dependencies..."
echo ""

cd backend

echo "📦 Installing express-rate-limit..."
npm install express-rate-limit

echo ""
echo "✅ Dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "1. Run: node ../generate-security-keys.js"
echo "2. Copy the generated keys to your .env file"
echo "3. Restart your backend server"
echo "4. Test payment security"
echo ""
echo "📖 Read PAYMENT-SECURITY-GUIDE.md for full documentation"
