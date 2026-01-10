#!/bin/bash

# LATAP Authentication System Test Script
# This script tests the complete authentication flow

echo "🚀 LATAP Authentication System Test"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test configuration
API_URL="http://localhost:3001"
TEST_EMAIL="test@example.com"
TEST_PASSWORD="TestPass123!"
TEST_FIRST_NAME="Test"
TEST_LAST_NAME="User"

echo -e "${YELLOW}Testing API endpoints...${NC}"

# Test 1: Health Check
echo "1. Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/health")
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "   ${GREEN}✓ Health check passed${NC}"
else
    echo -e "   ${RED}✗ Health check failed (HTTP $HEALTH_RESPONSE)${NC}"
    exit 1
fi

# Test 2: Signup Endpoint
echo "2. Testing signup endpoint..."
SIGNUP_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/signup" \
    -H "Content-Type: application/json" \
    -d "{
        \"firstName\": \"$TEST_FIRST_NAME\",
        \"lastName\": \"$TEST_LAST_NAME\",
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"$TEST_PASSWORD\"
    }")

if echo "$SIGNUP_RESPONSE" | grep -q "Account created successfully"; then
    echo -e "   ${GREEN}✓ Signup endpoint working${NC}"
else
    echo -e "   ${YELLOW}⚠ Signup response: $SIGNUP_RESPONSE${NC}"
fi

# Test 3: Login Endpoint (should fail - email not verified)
echo "3. Testing login endpoint (unverified email)..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"$TEST_PASSWORD\"
    }")

if echo "$LOGIN_RESPONSE" | grep -q "verify your email"; then
    echo -e "   ${GREEN}✓ Login correctly blocks unverified email${NC}"
else
    echo -e "   ${YELLOW}⚠ Login response: $LOGIN_RESPONSE${NC}"
fi

# Test 4: Protected Endpoint (should fail - no auth)
echo "4. Testing protected endpoint without auth..."
PROTECTED_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/auth/me")
if [ "$PROTECTED_RESPONSE" = "401" ]; then
    echo -e "   ${GREEN}✓ Protected endpoint correctly blocks unauthorized access${NC}"
else
    echo -e "   ${RED}✗ Protected endpoint should return 401, got $PROTECTED_RESPONSE${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Authentication system tests completed!${NC}"
echo ""
echo "Next steps:"
echo "1. Set up PostgreSQL database"
echo "2. Run database migrations"
echo "3. Configure AWS SES credentials"
echo "4. Test complete flow with real email verification"
echo ""
echo "For full setup instructions, see: AUTHENTICATION_SETUP.md"
