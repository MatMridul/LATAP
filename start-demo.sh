#!/bin/bash

# LATAP Demo Startup Script

echo "🚀 Starting LATAP Demo..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start database and Redis
echo "📊 Starting database and Redis..."
docker-compose up -d postgres redis

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "🗄️ Setting up database..."
docker-compose exec -T postgres psql -U postgres -d alumni_connect -f /docker-entrypoint-initdb.d/schema.sql
docker-compose exec -T postgres psql -U postgres -d alumni_connect -f /docker-entrypoint-initdb.d/init-data.sql

# Start backend
echo "🔧 Starting backend server..."
cd backend && npm install && npm start &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start frontend
echo "🎨 Starting frontend..."
cd .. && npm install && npm run dev &
FRONTEND_PID=$!

echo "✅ LATAP Demo is starting up!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
trap "echo '🛑 Stopping services...'; kill $BACKEND_PID $FRONTEND_PID; docker-compose down; exit" INT
wait
