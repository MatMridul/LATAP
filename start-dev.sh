#!/bin/bash

# LATAP Demo Startup Script (Quick Demo Mode)

echo "🚀 Starting LATAP Demo with Verification System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p backend/uploads/verification

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Start frontend in development mode
echo "🎨 Starting frontend on http://localhost:3000..."
npm run dev &
FRONTEND_PID=$!

# Start backend (without OCR dependencies for demo)
echo "🔧 Starting backend on http://localhost:3001..."
cd backend
npm install
npm start &
BACKEND_PID=$!
cd ..

echo ""
echo "✅ LATAP Demo is running!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:3001"
echo ""
echo "🎯 Demo Features:"
echo "   • Professional verification UI"
echo "   • PDF upload simulation"
echo "   • Mock OCR processing"
echo "   • Real-time status updates"
echo "   • Appeal system"
echo "   • Admin review interface"
echo ""
echo "📋 To test:"
echo "   1. Go to http://localhost:3000/verification/claim"
echo "   2. Fill in academic details"
echo "   3. Upload any PDF file"
echo "   4. Watch the verification process"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
trap "echo '🛑 Stopping services...'; kill $FRONTEND_PID $BACKEND_PID 2>/dev/null; exit" INT
wait
