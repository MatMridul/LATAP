#!/bin/bash

# LATAP Verification Pipeline Setup Script
# This script installs dependencies and sets up the production verification system

echo "🚀 Setting up LATAP Verification Pipeline..."

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Apply database schema
echo "🗄️ Applying verification pipeline schema..."
if command -v psql &> /dev/null; then
    echo "Applying verification schema to database..."
    psql $DATABASE_URL -f ../database/verification-pipeline-schema.sql
    echo "✅ Database schema applied successfully"
else
    echo "⚠️ PostgreSQL client not found. Please apply the schema manually:"
    echo "   psql \$DATABASE_URL -f database/verification-pipeline-schema.sql"
fi

# Create upload directories
echo "📁 Creating upload directories..."
mkdir -p uploads/verification
chmod 755 uploads/verification

# Check AWS credentials
echo "🔐 Checking AWS configuration..."
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "⚠️ AWS credentials not configured. Please set:"
    echo "   AWS_ACCESS_KEY_ID=your-access-key"
    echo "   AWS_SECRET_ACCESS_KEY=your-secret-key"
    echo "   AWS_REGION=us-east-1 (or your preferred region)"
else
    echo "✅ AWS credentials configured"
fi

# Test database connection
echo "🔌 Testing database connection..."
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.log('❌ Database connection failed:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Database connection successful');
        pool.end();
    }
});
"

cd ..

echo ""
echo "🎉 Verification Pipeline Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Configure AWS credentials in backend/.env"
echo "2. Ensure PostgreSQL is running"
echo "3. Start the backend server: cd backend && npm run dev"
echo "4. Start the frontend: npm run dev"
echo ""
echo "🔧 Key Features Implemented:"
echo "• AWS Textract OCR for PDF documents"
echo "• Standard Identity Record normalization"
echo "• Deterministic matching engine"
echo "• Automatic document deletion after OCR"
echo "• 1-year verification validity with expiry tracking"
echo "• Real-time progress tracking"
echo "• Comprehensive error handling"
echo ""
echo "📚 API Endpoints:"
echo "• POST /api/verification/submit - Submit verification"
echo "• GET /api/verification/status/:id - Get verification status"
echo "• GET /api/verification/user-status - Get user verification status"
echo ""
echo "🔒 Security Features:"
echo "• Documents deleted after OCR completion"
echo "• Audit logging for all operations"
echo "• Input validation and sanitization"
echo "• Rate limiting on API endpoints"
