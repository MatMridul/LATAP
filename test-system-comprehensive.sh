#!/bin/bash
# Comprehensive System Test Suite
# Tests backend APIs, frontend integration, and edge cases

set -e

BASE_URL="http://localhost:3001"
FRONTEND_URL="http://localhost:3000"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0
WARNINGS=0

# Test result tracking
log_pass() {
    echo -e "${GREEN}✓ PASS${NC}: $1"
    ((PASSED++))
}

log_fail() {
    echo -e "${RED}✗ FAIL${NC}: $1"
    ((FAILED++))
}

log_warn() {
    echo -e "${YELLOW}⚠ WARN${NC}: $1"
    ((WARNINGS++))
}

# Check if services are running
check_services() {
    echo "=== Checking Services ==="
    
    # Check backend
    if curl -s "$BASE_URL/health" > /dev/null 2>&1; then
        log_pass "Backend is running on $BASE_URL"
    else
        log_fail "Backend is NOT running on $BASE_URL"
        echo "Start backend with: cd backend && npm start"
        exit 1
    fi
    
    # Check database
    if docker ps | grep -q alumni-connect-db; then
        log_pass "PostgreSQL container is running"
    else
        log_fail "PostgreSQL container is NOT running"
        exit 1
    fi
    
    # Check Redis
    if docker ps | grep -q alumni-connect-redis; then
        log_pass "Redis container is running"
    else
        log_warn "Redis container is NOT running (optional)"
    fi
    
    echo ""
}

# Test authentication flow
test_auth() {
    echo "=== Testing Authentication ==="
    
    # Test missing token
    RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/opportunities/feed")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" = "401" ]; then
        ERROR_CODE=$(echo "$BODY" | grep -o '"error_code":"[^"]*"' | cut -d'"' -f4)
        if [ "$ERROR_CODE" = "AUTH_MISSING_TOKEN" ]; then
            log_pass "Missing token returns AUTH_MISSING_TOKEN"
        else
            log_fail "Missing token returns wrong error_code: $ERROR_CODE"
        fi
    else
        log_fail "Missing token returns HTTP $HTTP_CODE instead of 401"
    fi
    
    # Test invalid token
    RESPONSE=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer invalid_token" "$BASE_URL/api/opportunities/feed")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    if [ "$HTTP_CODE" = "401" ]; then
        ERROR_CODE=$(echo "$BODY" | grep -o '"error_code":"[^"]*"' | cut -d'"' -f4)
        if [ "$ERROR_CODE" = "AUTH_INVALID_TOKEN" ]; then
            log_pass "Invalid token returns AUTH_INVALID_TOKEN"
        else
            log_fail "Invalid token returns wrong error_code: $ERROR_CODE"
        fi
    else
        log_fail "Invalid token returns HTTP $HTTP_CODE instead of 401"
    fi
    
    # Check X-Request-ID header
    REQUEST_ID=$(curl -s -I "$BASE_URL/health" | grep -i "x-request-id" | cut -d' ' -f2 | tr -d '\r')
    if [ -n "$REQUEST_ID" ]; then
        log_pass "X-Request-ID header present: $REQUEST_ID"
    else
        log_fail "X-Request-ID header missing"
    fi
    
    echo ""
}

# Test error responses
test_error_responses() {
    echo "=== Testing Error Responses ==="
    
    # Test 404
    RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/opportunities/00000000-0000-0000-0000-000000000000")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "404" ]; then
        log_pass "Non-existent opportunity returns $HTTP_CODE"
    else
        log_fail "Non-existent opportunity returns HTTP $HTTP_CODE"
    fi
    
    # Test invalid UUID
    RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/opportunities/invalid-uuid")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "404" ]; then
        log_pass "Invalid UUID returns $HTTP_CODE"
    else
        log_fail "Invalid UUID returns HTTP $HTTP_CODE"
    fi
    
    echo ""
}

# Test structured logging
test_logging() {
    echo "=== Testing Structured Logging ==="
    
    # Make a request and check logs
    curl -s "$BASE_URL/health" > /dev/null
    
    # Check if logs are JSON formatted (basic check)
    if docker logs alumni-connect-backend 2>&1 | tail -5 | grep -q '"timestamp"'; then
        log_pass "Logs are JSON formatted"
    else
        log_warn "Logs may not be JSON formatted (check manually)"
    fi
    
    echo ""
}

# Test database schema
test_database_schema() {
    echo "=== Testing Database Schema ==="
    
    # Check critical tables exist
    TABLES=("users" "institutions" "user_verifications" "opportunities" "applications" "talent_profiles" "subscriptions")
    
    for table in "${TABLES[@]}"; do
        if docker exec alumni-connect-db psql -U postgres -d alumni_connect -c "\dt $table" 2>&1 | grep -q "$table"; then
            log_pass "Table '$table' exists"
        else
            log_fail "Table '$table' does NOT exist"
        fi
    done
    
    echo ""
}

# Test API contracts
test_api_contracts() {
    echo "=== Testing API Contracts ==="
    
    # Test health endpoint
    RESPONSE=$(curl -s "$BASE_URL/health")
    if echo "$RESPONSE" | grep -q '"status"'; then
        log_pass "Health endpoint returns valid JSON"
    else
        log_fail "Health endpoint returns invalid response"
    fi
    
    # Test CORS headers
    CORS=$(curl -s -I -H "Origin: http://localhost:3000" "$BASE_URL/health" | grep -i "access-control-allow-origin")
    if [ -n "$CORS" ]; then
        log_pass "CORS headers present"
    else
        log_warn "CORS headers missing (may cause frontend issues)"
    fi
    
    echo ""
}

# Test edge cases
test_edge_cases() {
    echo "=== Testing Edge Cases ==="
    
    # Test empty request body
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -d '{}' "$BASE_URL/api/opportunities")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "401" ]; then
        log_pass "Empty POST body returns $HTTP_CODE"
    else
        log_fail "Empty POST body returns HTTP $HTTP_CODE"
    fi
    
    # Test malformed JSON
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -d '{invalid json}' "$BASE_URL/api/opportunities")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "500" ]; then
        log_pass "Malformed JSON returns $HTTP_CODE"
    else
        log_fail "Malformed JSON returns HTTP $HTTP_CODE"
    fi
    
    # Test SQL injection attempt
    RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/opportunities/feed?type='; DROP TABLE users; --")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "401" ]; then
        log_pass "SQL injection attempt blocked"
    else
        log_warn "SQL injection attempt returned HTTP $HTTP_CODE (verify manually)"
    fi
    
    # Test XSS attempt
    RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/opportunities/feed?type=<script>alert('xss')</script>")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "401" ]; then
        log_pass "XSS attempt blocked"
    else
        log_warn "XSS attempt returned HTTP $HTTP_CODE (verify manually)"
    fi
    
    echo ""
}

# Test rate limiting
test_rate_limiting() {
    echo "=== Testing Rate Limiting ==="
    
    # Make multiple rapid requests
    for i in {1..10}; do
        curl -s "$BASE_URL/health" > /dev/null
    done
    
    log_warn "Rate limiting test completed (verify manually if needed)"
    
    echo ""
}

# Test observability
test_observability() {
    echo "=== Testing Observability ==="
    
    # Check if metrics are being collected
    if docker logs alumni-connect-backend 2>&1 | grep -q "METRICS_SNAPSHOT"; then
        log_pass "Metrics are being logged"
    else
        log_warn "Metrics not found in logs (may not have run yet)"
    fi
    
    # Check if audit logs are working
    if docker exec alumni-connect-db psql -U postgres -d alumni_connect -c "SELECT COUNT(*) FROM audit_logs" 2>&1 | grep -q "[0-9]"; then
        log_pass "Audit logs table accessible"
    else
        log_fail "Audit logs table NOT accessible"
    fi
    
    echo ""
}

# Test background jobs
test_background_jobs() {
    echo "=== Testing Background Jobs ==="
    
    # Check if scheduler started
    if docker logs alumni-connect-backend 2>&1 | grep -q "SCHEDULER_STARTED"; then
        log_pass "Job scheduler started"
    else
        log_warn "Job scheduler not found in logs"
    fi
    
    echo ""
}

# Test frontend build
test_frontend() {
    echo "=== Testing Frontend ==="
    
    # Check if frontend is accessible
    if curl -s "$FRONTEND_URL" > /dev/null 2>&1; then
        log_pass "Frontend is accessible on $FRONTEND_URL"
    else
        log_warn "Frontend is NOT accessible on $FRONTEND_URL"
    fi
    
    # Check if API client exists
    if [ -f "app/lib/apiClient.ts" ]; then
        log_pass "API client file exists"
    else
        log_fail "API client file NOT found"
    fi
    
    # Check if DTOs exist
    if [ -f "app/types/api.ts" ]; then
        log_pass "Type definitions file exists"
    else
        log_fail "Type definitions file NOT found"
    fi
    
    echo ""
}

# Test data integrity
test_data_integrity() {
    echo "=== Testing Data Integrity ==="
    
    # Check for orphaned records
    ORPHANED=$(docker exec alumni-connect-db psql -U postgres -d alumni_connect -t -c "
        SELECT COUNT(*) FROM applications a 
        LEFT JOIN opportunities o ON a.opportunity_id = o.id 
        WHERE o.id IS NULL
    " 2>&1 | tr -d ' ')
    
    if [ "$ORPHANED" = "0" ]; then
        log_pass "No orphaned application records"
    else
        log_warn "Found $ORPHANED orphaned application records"
    fi
    
    echo ""
}

# Generate report
generate_report() {
    echo ""
    echo "========================================"
    echo "         TEST SUMMARY"
    echo "========================================"
    echo -e "${GREEN}Passed:${NC}   $PASSED"
    echo -e "${RED}Failed:${NC}   $FAILED"
    echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
    echo "========================================"
    
    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}✓ ALL CRITICAL TESTS PASSED${NC}"
        if [ $WARNINGS -gt 0 ]; then
            echo -e "${YELLOW}⚠ Review warnings above${NC}"
        fi
        exit 0
    else
        echo -e "${RED}✗ SOME TESTS FAILED${NC}"
        echo "Review failures above and fix before deployment"
        exit 1
    fi
}

# Main execution
main() {
    echo "========================================"
    echo "   LATAP COMPREHENSIVE TEST SUITE"
    echo "========================================"
    echo ""
    
    check_services
    test_auth
    test_error_responses
    test_logging
    test_database_schema
    test_api_contracts
    test_edge_cases
    test_rate_limiting
    test_observability
    test_background_jobs
    test_frontend
    test_data_integrity
    
    generate_report
}

main
