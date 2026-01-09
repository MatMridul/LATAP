#!/bin/bash

# LATAP Demo Pre-flight Check

echo "🔍 LATAP Demo Pre-flight Check"
echo "================================"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "❌ Node.js not found - please install Node.js"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm: $NPM_VERSION"
else
    echo "❌ npm not found"
    exit 1
fi

# Check if directories exist
echo ""
echo "📁 Checking project structure..."
if [ -d "app" ]; then
    echo "✅ Frontend (Next.js) directory exists"
else
    echo "❌ Frontend directory missing"
fi

if [ -d "backend" ]; then
    echo "✅ Backend directory exists"
else
    echo "❌ Backend directory missing"
fi

if [ -f "backend/verification/routes/verification.routes.js" ]; then
    echo "✅ Verification routes exist"
else
    echo "❌ Verification routes missing"
fi

# Check package.json files
echo ""
echo "📦 Checking dependencies..."
if [ -f "package.json" ]; then
    echo "✅ Frontend package.json exists"
else
    echo "❌ Frontend package.json missing"
fi

if [ -f "backend/package.json" ]; then
    echo "✅ Backend package.json exists"
else
    echo "❌ Backend package.json missing"
fi

# Create uploads directory
echo ""
echo "📁 Setting up uploads directory..."
mkdir -p backend/uploads/verification
echo "✅ Uploads directory ready"

echo ""
echo "🚀 Pre-flight check complete!"
echo ""
echo "To start the demo:"
echo "  ./start-dev.sh"
echo ""
echo "To test connections:"
echo "  ./test-connections.sh"
echo ""
echo "Demo URLs:"
echo "  • Frontend: http://localhost:3000"
echo "  • Backend: http://localhost:3001"
echo "  • Verification: http://localhost:3000/verification/claim"
echo "  • Admin: http://localhost:3000/verification/admin"
