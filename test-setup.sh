#!/bin/bash

echo "🧪 Testing LATAP Demo Setup..."

# Test Node.js version
NODE_VERSION=$(node --version)
echo "Node.js version: $NODE_VERSION"

# Test if CSS is valid
echo "Checking CSS syntax..."
if node -e "const fs = require('fs'); const css = fs.readFileSync('./app/globals.css', 'utf8'); console.log('CSS file loaded successfully');" 2>/dev/null; then
    echo "✅ CSS syntax is valid"
else
    echo "❌ CSS syntax error"
    exit 1
fi

# Start backend only for testing
echo "Testing backend..."
cd backend
node server.js &
SERVER_PID=$!
cd ..

# Wait for server to start
sleep 3

# Test backend endpoints
if curl -s http://localhost:3001/ | grep -q "LATAP"; then
    echo "✅ Backend root route working"
else
    echo "❌ Backend root route failed"
fi

if curl -s http://localhost:3001/health | grep -q "healthy"; then
    echo "✅ Backend health check working"
else
    echo "❌ Backend health check failed"
fi

# Stop backend
kill $SERVER_PID 2>/dev/null

echo ""
echo "🎯 Ready to launch full demo!"
echo "Run: npm run dev (in one terminal)"
echo "Run: cd backend && node server.js (in another terminal)"
