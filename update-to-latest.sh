#!/bin/bash

echo "🚀 Updating LATAP to Latest 2025 Stack..."
echo "=========================================="

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="20.9.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js $REQUIRED_VERSION or higher is required"
    echo "   Current version: $NODE_VERSION"
    echo "   Please update Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $NODE_VERSION"

# Clean previous installations
echo "🧹 Cleaning previous installations..."
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json
rm -rf .next

# Install frontend dependencies
echo "📦 Installing latest frontend dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing latest backend dependencies..."
cd backend
npm install
cd ..

# Create uploads directory
mkdir -p backend/uploads/verification

echo ""
echo "✅ Update Complete!"
echo "==================="
echo "📋 Latest Versions Installed:"
echo "   • Next.js 16.1"
echo "   • React 19"
echo "   • Express 5.1"
echo "   • TypeScript 5.9"
echo ""
echo "🚀 Ready to launch with:"
echo "   ./launch-latest.sh"
