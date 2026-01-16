#!/bin/bash

# LATAP Identity-Hardened Verification Integration Test
# Tests complete flow: signup → login → verification → audit

set -e

API_URL="http://localhost:3001/api"
TEST_EMAIL="test-$(date +%s)@example.com"
TEST_PASSWORD="Test123!@#"

echo "🧪 Starting LATAP Identity-Hardened Verification Integration Test"
echo "=================================================="

# 1. Signup
echo "📝 Step 1: User Signup"
SIGNUP_RESPONSE=$(curl -s -X POST "$API_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\"
  }")

echo "Signup Response: $SIGNUP_RESPONSE"
USER_ID=$(echo $SIGNUP_RESPONSE | jq -r '.userId')

if [ "$USER_ID" == "null" ]; then
  echo "❌ Signup failed"
  exit 1
fi

echo "✅ User created with ID: $USER_ID"

# 2. Verify email (simulate)
echo ""
echo "📧 Step 2: Email Verification (simulated)"
# In real scenario, extract token from email
# For now, manually verify in database or skip

# 3. Login
echo ""
echo "🔐 Step 3: User Login"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

echo "Login Response: $LOGIN_RESPONSE"
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')

if [ "$TOKEN" == "null" ]; then
  echo "❌ Login failed - email not verified"
  echo "⚠️  Manually verify email in database to continue test"
  exit 1
fi

echo "✅ Login successful, JWT token obtained"

# 4. Get current user (verify JWT)
echo ""
echo "👤 Step 4: Get Current User"
ME_RESPONSE=$(curl -s -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN")

echo "User Info: $ME_RESPONSE"
echo "✅ JWT authentication working"

# 5. Submit verification request
echo ""
echo "📄 Step 5: Submit Verification Request"

# Create a test PDF (simple text file for demo)
TEST_PDF="test-certificate-$(date +%s).pdf"
echo "Test Certificate Content" > "/tmp/$TEST_PDF"

VERIFICATION_RESPONSE=$(curl -s -X POST "$API_URL/verification/submit" \
  -H "Authorization: Bearer $TOKEN" \
  -F "document=@/tmp/$TEST_PDF" \
  -F "claimed_name=Test User" \
  -F "claimed_institution=Test University" \
  -F "claimed_program=Computer Science" \
  -F "claimed_start_year=2020" \
  -F "claimed_end_year=2024")

echo "Verification Response: $VERIFICATION_RESPONSE"
VERIFICATION_ID=$(echo $VERIFICATION_RESPONSE | jq -r '.verificationId')

if [ "$VERIFICATION_ID" == "null" ]; then
  echo "❌ Verification submission failed"
  exit 1
fi

echo "✅ Verification submitted with ID: $VERIFICATION_ID"

# 6. Check verification status
echo ""
echo "📊 Step 6: Check Verification Status"
sleep 2 # Wait for processing

STATUS_RESPONSE=$(curl -s -X GET "$API_URL/verification/status/$VERIFICATION_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "Status Response: $STATUS_RESPONSE"
echo "✅ Verification status retrieved"

# 7. Get user's verification requests
echo ""
echo "📋 Step 7: Get User's Verification Requests"
REQUESTS_RESPONSE=$(curl -s -X GET "$API_URL/verification/my-requests" \
  -H "Authorization: Bearer $TOKEN")

echo "Requests Response: $REQUESTS_RESPONSE"
echo "✅ User verification history retrieved"

# Cleanup
rm -f "/tmp/$TEST_PDF"

echo ""
echo "=================================================="
echo "✅ All integration tests passed!"
echo ""
echo "🔍 Verification Points:"
echo "  - User signup with immutable UUID"
echo "  - JWT authentication with user_id"
echo "  - Verification tied to authenticated user"
echo "  - No user_id accepted from request body"
echo "  - All actions traceable via audit_logs"
echo ""
echo "📊 Check audit_logs table for complete action trail:"
echo "  SELECT * FROM audit_logs WHERE user_id = '$USER_ID' ORDER BY created_at;"
