#!/bin/bash

# LATAP Demo Launcher (Simplified)

echo "🚀 Launching LATAP Verification Demo..."

# Kill any existing processes
pkill -f "next dev" 2>/dev/null
pkill -f "demo-server.js" 2>/dev/null
sleep 2

# Create uploads directory
mkdir -p backend/uploads/verification

# Start frontend
echo "🎨 Starting frontend..."
npm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 3

# Start simplified backend
echo "🔧 Starting backend..."
cd backend
node demo-server.js &
BACKEND_PID=$!
cd ..

# Wait for services to start
sleep 3

echo ""
echo "🎉 LATAP Demo is LIVE!"
echo "================================"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:3001"
echo ""
echo "🎯 Quick Demo Links:"
echo "   • Dashboard:     http://localhost:3000/dashboard"
echo "   • Verification:  http://localhost:3000/verification/claim"
echo "   • Admin Review:  http://localhost:3000/verification/admin"
echo ""
echo "📋 Demo Flow:"
echo "   1. Go to verification link above"
echo "   2. Fill in academic details"
echo "   3. Upload any PDF file"
echo "   4. Watch real-time processing"
echo "   5. See professional results"
echo ""
echo "Press Ctrl+C to stop demo"

# Wait for user to stop
trap "echo '🛑 Stopping demo...'; kill $FRONTEND_PID $BACKEND_PID 2>/dev/null; exit" INT
wait
