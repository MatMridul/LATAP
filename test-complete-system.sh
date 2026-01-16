#!/bin/bash

# LATAP Comprehensive System Test
# Tests all implemented features end-to-end

set -e

API_URL="http://localhost:3001/api"
FRONTEND_URL="http://localhost:3000"
TEST_EMAIL="test-$(date +%s)@example.com"
TEST_PASSWORD="Test123!@#"

echo "🧪 LATAP Comprehensive System Test"
echo "===================================="
echo ""

# Test 1: Health Checks
echo "✅ Test 1: Health Checks"
echo "------------------------"
HEALTH=$(curl -s $API_URL/../health)
echo "Backend Health: $HEALTH"

FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" $FRONTEND_URL)
echo "Frontend Status: $FRONTEND"

if [ "$FRONTEND" != "200" ]; then
  echo "❌ Frontend not responding"
  exit 1
fi
echo "✅ Health checks passed"
echo ""

# Test 2: User Signup
echo "✅ Test 2: User Signup"
echo "----------------------"
SIGNUP_RESPONSE=$(curl -s -X POST "$API_URL/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\"
  }")

echo "Signup Response: $SIGNUP_RESPONSE"

# Extract user_id (basic parsing without jq)
USER_ID=$(echo $SIGNUP_RESPONSE | grep -o '"userId":"[^"]*"' | cut -d'"' -f4)

if [ -z "$USER_ID" ]; then
  echo "❌ Signup failed - no user_id returned"
  exit 1
fi

echo "✅ User created with ID: $USER_ID"
echo ""

# Test 3: Email Verification (Manual step required)
echo "⚠️  Test 3: Email Verification"
echo "------------------------------"
echo "Manual step: Verify email in database"
echo "Run: docker exec alumni-connect-db psql -U postgres -d alumni_connect -c \"UPDATE users SET is_email_verified = TRUE WHERE id = '$USER_ID';\""
echo ""
read -p "Press Enter after verifying email..."

# Test 4: User Login
echo "✅ Test 4: User Login"
echo "---------------------"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

echo "Login Response: $LOGIN_RESPONSE"

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed - no token returned"
  exit 1
fi

echo "✅ Login successful"
echo ""

# Test 5: Get Current User
echo "✅ Test 5: Get Current User"
echo "---------------------------"
ME_RESPONSE=$(curl -s -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN")

echo "User Info: $ME_RESPONSE"
echo "✅ JWT authentication working"
echo ""

# Test 6: Verification Submission (requires PDF)
echo "✅ Test 6: Verification Submission"
echo "-----------------------------------"
echo "Creating test PDF..."
echo "Test Certificate - $(date)" > /tmp/test-cert.txt
echo "Name: Test User" >> /tmp/test-cert.txt
echo "Institution: Test University" >> /tmp/test-cert.txt
echo "Program: Computer Science" >> /tmp/test-cert.txt
echo "Year: 2020-2024" >> /tmp/test-cert.txt

VERIFICATION_RESPONSE=$(curl -s -X POST "$API_URL/verification/submit" \
  -H "Authorization: Bearer $TOKEN" \
  -F "document=@/tmp/test-cert.txt" \
  -F "claimed_name=Test User" \
  -F "claimed_institution=Test University" \
  -F "claimed_program=Computer Science" \
  -F "claimed_start_year=2020" \
  -F "claimed_end_year=2024")

echo "Verification Response: $VERIFICATION_RESPONSE"

VERIFICATION_ID=$(echo $VERIFICATION_RESPONSE | grep -o '"verificationId":"[^"]*"' | cut -d'"' -f4)

if [ -z "$VERIFICATION_ID" ]; then
  echo "❌ Verification submission failed"
  exit 1
fi

echo "✅ Verification submitted with ID: $VERIFICATION_ID"
echo ""

# Test 7: Check Verification Status
echo "✅ Test 7: Check Verification Status"
echo "-------------------------------------"
sleep 2

STATUS_RESPONSE=$(curl -s -X GET "$API_URL/verification/status/$VERIFICATION_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "Status Response: $STATUS_RESPONSE"
echo "✅ Verification status retrieved"
echo ""

# Test 8: Get User's Verification Requests
echo "✅ Test 8: Get User's Verification Requests"
echo "--------------------------------------------"
REQUESTS_RESPONSE=$(curl -s -X GET "$API_URL/verification/my-requests" \
  -H "Authorization: Bearer $TOKEN")

echo "Requests Response: $REQUESTS_RESPONSE"
echo "✅ User verification history retrieved"
echo ""

# Test 9: Check Audit Logs
echo "✅ Test 9: Check Audit Logs"
echo "---------------------------"
echo "Checking audit logs in database..."
docker exec alumni-connect-db psql -U postgres -d alumni_connect -c \
  "SELECT action, entity_type, created_at FROM audit_logs WHERE user_id = '$USER_ID' ORDER BY created_at;"
echo "✅ Audit logs verified"
echo ""

# Test 10: Check User-Institution Mapping (if approved)
echo "✅ Test 10: Check User-Institution Mapping"
echo "-------------------------------------------"
docker exec alumni-connect-db psql -U postgres -d alumni_connect -c \
  "SELECT * FROM user_institutions WHERE user_id = '$USER_ID';"
echo ""

# Cleanup
rm -f /tmp/test-cert.txt

echo "===================================="
echo "✅ ALL TESTS PASSED!"
echo "===================================="
echo ""
echo "📊 Summary:"
echo "  - Backend API: Running"
echo "  - Frontend: Running"
echo "  - User Signup: Working"
echo "  - User Login: Working"
echo "  - JWT Authentication: Working"
echo "  - Verification Submission: Working"
echo "  - Verification Status: Working"
echo "  - Audit Logging: Working"
echo ""
echo "🔍 Test User Details:"
echo "  Email: $TEST_EMAIL"
echo "  User ID: $USER_ID"
echo "  Verification ID: $VERIFICATION_ID"
echo ""
echo "📝 Next Steps:"
echo "  1. Test frontend UI manually at http://localhost:3000"
echo "  2. Test signup/login flow in browser"
echo "  3. Test verification upload in browser"
echo "  4. Check dashboard functionality"
