#!/bin/bash

# LATAP Verification Pipeline Test Script
echo "🧪 Testing LATAP Verification Pipeline..."

# Check if servers are running
echo "🔍 Checking server status..."

# Test backend health
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/auth/health 2>/dev/null || echo "000")
if [ "$BACKEND_STATUS" = "200" ]; then
    echo "✅ Backend server running on port 3001"
else
    echo "❌ Backend server not responding (expected on port 3001)"
fi

# Test frontend
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Frontend server running on port 3000"
else
    echo "❌ Frontend server not responding (expected on port 3000)"
fi

echo ""
echo "📋 Manual Testing Steps:"
echo ""
echo "1. 🔐 Login/Register:"
echo "   • Go to http://localhost:3000/login"
echo "   • Create account or login with existing credentials"
echo ""
echo "2. 📄 Test Verification:"
echo "   • Navigate to http://localhost:3000/verification"
echo "   • Fill out the verification form with test data:"
echo "     - Name: John Doe"
echo "     - Institution: Test University"
echo "     - Program: Bachelor of Technology"
echo "     - Start Year: 2018"
echo "     - End Year: 2022"
echo "   • Upload a PDF file (any PDF for testing)"
echo ""
echo "3. 🔍 Monitor Progress:"
echo "   • Watch the progress bar update in real-time"
echo "   • Check browser console for API calls"
echo "   • Verify status changes: PENDING → PROCESSING_OCR → MATCHING → COMPLETE"
echo ""
echo "4. 🧪 API Testing with curl:"
echo ""
echo "   # Get user verification status"
echo "   curl -H \"Authorization: Bearer YOUR_JWT_TOKEN\" \\"
echo "        http://localhost:3001/api/verification/user-status"
echo ""
echo "   # Submit verification (requires multipart form)"
echo "   curl -X POST \\"
echo "        -H \"Authorization: Bearer YOUR_JWT_TOKEN\" \\"
echo "        -F \"claimed_name=John Doe\" \\"
echo "        -F \"claimed_institution=Test University\" \\"
echo "        -F \"claimed_program=Bachelor of Technology\" \\"
echo "        -F \"claimed_start_year=2018\" \\"
echo "        -F \"claimed_end_year=2022\" \\"
echo "        -F \"document=@test-document.pdf\" \\"
echo "        http://localhost:3001/api/verification/submit"
echo ""
echo "5. 📊 Expected Behaviors:"
echo "   • ✅ PDF uploads should be accepted"
echo "   • ❌ Non-PDF files should be rejected with clear error"
echo "   • ❌ Files > 10MB should be rejected"
echo "   • ✅ Progress should update every 3 seconds during processing"
echo "   • ✅ OCR should extract text from PDF (may fail without AWS credentials)"
echo "   • ✅ Matching should compare user claims vs OCR data"
echo "   • ✅ Document should be deleted after OCR completion"
echo ""
echo "6. 🔧 Testing Without AWS (Mock Mode):"
echo "   • OCR will fail gracefully with 'OCR_FAILED' status"
echo "   • This tests the error handling and user feedback"
echo "   • Full pipeline requires valid AWS Textract credentials"
echo ""
echo "7. 🗄️ Database Verification:"
echo "   • Check verification_requests table for new entries"
echo "   • Verify document_deleted_at timestamp is set"
echo "   • Check verification_progress table for status updates"
echo ""
echo "⚠️ Prerequisites:"
echo "• PostgreSQL running on localhost:5432"
echo "• Database schema applied (verification-pipeline-schema.sql)"
echo "• Backend server running (npm run dev in backend/)"
echo "• Frontend server running (npm run dev in root/)"
echo "• Valid JWT token for API testing"
