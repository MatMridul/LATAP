#!/bin/bash

# LATAP Verification Module Setup Script

echo "🔧 Setting up LATAP Verification Module..."

# Navigate to backend directory
cd backend

# Install additional dependencies for verification module
echo "📦 Installing verification dependencies..."
npm install tesseract.js@^5.0.4 typescript@^5.3.3

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p uploads/verification

# Compile TypeScript files
echo "🔨 Compiling TypeScript verification module..."
npx tsc --project tsconfig.json

echo "✅ Verification module setup complete!"
echo ""
echo "🚀 To test the verification system:"
echo "1. Start the backend: cd backend && npm start"
echo "2. Start the frontend: npm run dev"
echo "3. Navigate to http://localhost:3000/verification/claim"
echo ""
echo "📋 Test with a sample PDF containing academic information"
echo "🔍 The system will use OCR to extract and verify the data"
echo ""
echo "⚠️  Note: This is a local implementation. Future integrations:"
echo "   - DigiLocker API (via API Setu)"
echo "   - Government database connections"
echo "   - Cloud storage for documents"
