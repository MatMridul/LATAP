#!/bin/bash

echo "🚀 Launching LATAP with Latest 2025 Stack..."
echo "============================================="

# Kill any existing processes
pkill -f "next dev" 2>/dev/null
pkill -f "server.js" 2>/dev/null
sleep 2

# Start backend with ES modules
echo "🔧 Starting Express 5.1 backend..."
cd backend
node server.js &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Test backend
if curl -s http://localhost:3001/ | grep -q "LATAP"; then
    echo "✅ Backend running on http://localhost:3001"
else
    echo "❌ Backend failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start Next.js 16 frontend
echo "🎨 Starting Next.js 16 frontend..."
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 5

echo ""
echo "🎉 LATAP 2025 Stack is LIVE!"
echo "============================="
echo "📱 Frontend (Next.js 16): http://localhost:3000"
echo "🔧 Backend (Express 5.1):  http://localhost:3001"
echo ""
echo "🎯 Demo Links:"
echo "   • Dashboard:     http://localhost:3000/dashboard"
echo "   • Verification:  http://localhost:3000/verification/claim"
echo "   • Admin Review:  http://localhost:3000/verification/admin"
echo ""
echo "🔥 Latest Features:"
echo "   • Next.js 16.1 with Turbopack"
echo "   • React 19 with new hooks"
echo "   • Express 5.1 with ES modules"
echo "   • TypeScript 5.9"
echo ""
echo "Press Ctrl+C to stop demo"

# Wait for user to stop
trap "echo '🛑 Stopping latest stack...'; kill $FRONTEND_PID $BACKEND_PID 2>/dev/null; exit" INT
wait
