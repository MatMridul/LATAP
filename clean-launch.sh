#!/bin/bash

# Clean install and launch demo

echo "🧹 Cleaning previous installations..."
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json

echo "📦 Installing frontend dependencies..."
npm install

echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

echo "🚀 Starting LATAP Demo..."

# Kill any existing processes
pkill -f "next dev" 2>/dev/null
pkill -f "demo-server.js" 2>/dev/null
sleep 2

# Create uploads directory
mkdir -p backend/uploads/verification

# Start backend first
echo "🔧 Starting backend on http://localhost:3001..."
cd backend
node demo-server.js &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend on http://localhost:3000..."
npm run dev &
FRONTEND_PID=$!

# Wait for services to start
sleep 5

echo ""
echo "🎉 LATAP Demo is LIVE!"
echo "================================"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:3001"
echo ""
echo "🔍 Test backend: curl http://localhost:3001"
echo ""
echo "🎯 Demo Links:"
echo "   • Dashboard:     http://localhost:3000/dashboard"
echo "   • Verification:  http://localhost:3000/verification/claim"
echo "   • Admin Review:  http://localhost:3000/verification/admin"
echo ""
echo "Press Ctrl+C to stop demo"

# Wait for user to stop
trap "echo '🛑 Stopping demo...'; kill $FRONTEND_PID $BACKEND_PID 2>/dev/null; exit" INT
wait
