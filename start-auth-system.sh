#!/bin/bash

# LATAP Production Startup Script
# This script starts the authentication-enabled LATAP system

echo "🚀 Starting LATAP Authentication System"
echo "======================================"

# Check if required environment variables are set
check_env_var() {
    if [ -z "${!1}" ]; then
        echo "❌ Error: Environment variable $1 is not set"
        echo "Please check your .env file and ensure all required variables are configured"
        exit 1
    fi
}

# Load environment variables
if [ -f backend/.env ]; then
    echo "📋 Loading environment variables..."
    export $(cat backend/.env | grep -v '^#' | xargs)
else
    echo "⚠️  Warning: backend/.env file not found"
fi

# Check critical environment variables
echo "🔍 Checking environment configuration..."
check_env_var "DB_HOST"
check_env_var "DB_NAME" 
check_env_var "DB_USER"
check_env_var "JWT_SECRET"

echo "✅ Environment configuration looks good"

# Check if PostgreSQL is accessible
echo "🗄️  Checking database connection..."
if command -v psql >/dev/null 2>&1; then
    if PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" >/dev/null 2>&1; then
        echo "✅ Database connection successful"
    else
        echo "❌ Cannot connect to database. Please ensure PostgreSQL is running and credentials are correct."
        exit 1
    fi
else
    echo "⚠️  psql not found. Skipping database connection test."
fi

# Start backend server
echo "🖥️  Starting backend server..."
cd backend
if [ "$NODE_ENV" = "production" ]; then
    echo "🏭 Running in production mode"
    node server.js &
else
    echo "🔧 Running in development mode"
    npm run dev &
fi

BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Check if backend is running
if curl -s http://localhost:${PORT:-3001}/api/health >/dev/null; then
    echo "✅ Backend server started successfully"
else
    echo "❌ Backend server failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start frontend
echo "🌐 Starting frontend server..."
if [ "$NODE_ENV" = "production" ]; then
    npm run build
    npm start &
else
    npm run dev &
fi

FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 5

echo ""
echo "🎉 LATAP Authentication System Started Successfully!"
echo "=================================================="
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🖥️  Backend:  http://localhost:${PORT:-3001}"
echo ""
echo "📋 Available endpoints:"
echo "   • POST /api/auth/signup     - User registration"
echo "   • GET  /api/auth/verify-email - Email verification"
echo "   • POST /api/auth/login      - User login"
echo "   • GET  /api/auth/me         - Get user info (protected)"
echo ""
echo "🔐 Authentication Features:"
echo "   ✅ Email + password signup"
echo "   ✅ AWS SES email verification"
echo "   ✅ JWT-based authentication"
echo "   ✅ bcrypt password hashing"
echo "   ✅ Protected routes"
echo "   ✅ Database persistence"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user interrupt
trap 'echo ""; echo "🛑 Stopping servers..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' INT
wait
