#!/bin/bash

# Quick connection test script

echo "🔍 Testing LATAP connections..."

# Test if backend is running
echo "Testing backend connection..."
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Backend is running on http://localhost:3001"
else
    echo "❌ Backend is not responding on http://localhost:3001"
    echo "   Make sure to run: cd backend && npm start"
fi

# Test if frontend is running
echo "Testing frontend connection..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is running on http://localhost:3000"
else
    echo "❌ Frontend is not responding on http://localhost:3000"
    echo "   Make sure to run: npm run dev"
fi

# Test verification API
echo "Testing verification API..."
if curl -s http://localhost:3001/api/verification/admin/pending > /dev/null; then
    echo "✅ Verification API is accessible"
else
    echo "❌ Verification API is not responding"
fi

echo ""
echo "🎯 Ready to demo:"
echo "   • Claim form: http://localhost:3000/verification/claim"
echo "   • Admin review: http://localhost:3000/verification/admin"
echo "   • Dashboard: http://localhost:3000/dashboard"
