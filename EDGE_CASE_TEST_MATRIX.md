# EDGE CASE TEST MATRIX

**Version:** 1.0.0  
**Date:** 2026-01-16  
**Status:** COMPREHENSIVE

This document lists every edge case that must be tested before production deployment.

---

## Authentication & Authorization

### Edge Cases
- [ ] Missing JWT token → AUTH_MISSING_TOKEN (401)
- [ ] Invalid JWT token → AUTH_INVALID_TOKEN (401)
- [ ] Expired JWT token → AUTH_EXPIRED (401)
- [ ] Malformed JWT token → AUTH_INVALID_TOKEN (401)
- [ ] JWT with invalid signature → AUTH_INVALID_TOKEN (401)
- [ ] JWT with missing sub claim → AUTH_INVALID_TOKEN (401)
- [ ] JWT with non-UUID sub claim → INVALID_UUID (400)
- [ ] User deleted but token still valid → AUTH_INVALID_TOKEN (401)
- [ ] Concurrent requests with same token → Both succeed
- [ ] Token refresh during active session → Not implemented (expected)

### Security Tests
- [ ] SQL injection in query params → Blocked
- [ ] XSS in query params → Blocked
- [ ] Path traversal attempts → Blocked
- [ ] Header injection → Blocked
- [ ] CSRF attempts → Blocked by CORS

---

## Verification System

### Edge Cases
- [ ] Verification expired mid-request → VERIFICATION_EXPIRED (403)
- [ ] Verification inactive → VERIFICATION_INACTIVE (403)
- [ ] Multiple verifications for same institution → Only one active
- [ ] Verification expires during application → Application fails
- [ ] User has no verifications → VERIFICATION_INACTIVE (403)
- [ ] Verification for deleted institution → Handled gracefully

---

## Opportunities

### Creation Edge Cases
- [ ] Missing required fields → MISSING_REQUIRED_FIELD (400)
- [ ] Invalid opportunity type → INVALID_INPUT (400)
- [ ] Expires_at in the past → INVALID_INPUT (400)
- [ ] Experience_min > experience_max → INVALID_INPUT (400)
- [ ] Empty skills array → INVALID_INPUT (400)
- [ ] Salary_min > salary_max → INVALID_INPUT (400)
- [ ] Invalid visibility value → INVALID_INPUT (400)
- [ ] Free user with all_verified visibility → SUBSCRIPTION_REQUIRED (403)
- [ ] Monthly limit reached → SUBSCRIPTION_LIMIT_REACHED (429)
- [ ] Verification expired during creation → VERIFICATION_EXPIRED (403)

### Retrieval Edge Cases
- [ ] Non-existent opportunity ID → OPPORTUNITY_NOT_FOUND (404)
- [ ] Invalid UUID format → INVALID_UUID (400)
- [ ] Opportunity from different institution (institution_only) → OPPORTUNITY_ACCESS_DENIED (403)
- [ ] Closed opportunity → Returns with status=closed
- [ ] Expired opportunity → Returns with status=active (backend doesn't auto-close)
- [ ] Empty feed → Returns empty array
- [ ] Page beyond total pages → Returns empty array
- [ ] Negative page number → INVALID_INPUT (400)
- [ ] Limit > 100 → Uses 100 (max)
- [ ] Limit < 1 → INVALID_INPUT (400)

---

## Applications

### Submission Edge Cases
- [ ] Already applied → DUPLICATE_APPLICATION (409)
- [ ] Apply to own opportunity → APPLY_TO_OWN_OPPORTUNITY (400)
- [ ] Opportunity closed → OPPORTUNITY_NOT_ACTIVE (400)
- [ ] Opportunity expired → OPPORTUNITY_EXPIRED (400)
- [ ] No talent profile → TALENT_PROFILE_MISSING (400)
- [ ] Profile not open to opportunities → TALENT_PROFILE_NOT_OPEN (400)
- [ ] Monthly application limit reached → SUBSCRIPTION_LIMIT_REACHED (429)
- [ ] Cover letter > 2000 chars → INVALID_INPUT (400)
- [ ] Opportunity deleted mid-apply → OPPORTUNITY_NOT_FOUND (404)
- [ ] Verification expires mid-apply → VERIFICATION_EXPIRED (403)
- [ ] Concurrent applications to same opportunity → One succeeds, one gets DUPLICATE_APPLICATION

### Withdrawal Edge Cases
- [ ] Withdraw non-existent application → APPLICATION_NOT_FOUND (404)
- [ ] Withdraw someone else's application → APPLICATION_NOT_FOUND (404)
- [ ] Withdraw already withdrawn → APPLICATION_INVALID_STATUS (400)
- [ ] Withdraw accepted application → APPLICATION_INVALID_STATUS (400)
- [ ] Withdraw rejected application → APPLICATION_INVALID_STATUS (400)
- [ ] Withdraw pending application → Success
- [ ] Withdraw reviewed application → Success
- [ ] Concurrent withdrawal attempts → One succeeds, one fails

### Status Update Edge Cases
- [ ] Update non-existent application → APPLICATION_NOT_FOUND (404)
- [ ] Update as non-owner → OPPORTUNITY_ACCESS_DENIED (403)
- [ ] Invalid status value → INVALID_INPUT (400)
- [ ] Update withdrawn application → Success (allowed)
- [ ] Concurrent status updates → Last write wins
- [ ] Update with notes > 1000 chars → INVALID_INPUT (400)

---

## Talent Profiles

### Edge Cases
- [ ] Create profile without required fields → Success (all optional)
- [ ] Update non-existent profile → Creates new profile
- [ ] Skills array > 100 items → INVALID_INPUT (400)
- [ ] Years_of_experience < 0 → INVALID_INPUT (400)
- [ ] Expected_salary_min > expected_salary_max → INVALID_INPUT (400)
- [ ] Invalid education level → INVALID_INPUT (400)
- [ ] Invalid remote preference → INVALID_INPUT (400)

### Resume Upload Edge Cases
- [ ] Non-PDF file → FILE_PROCESSING_FAILED (500)
- [ ] File > 5MB → FILE_PROCESSING_FAILED (500)
- [ ] Corrupted PDF → OCR fails but upload succeeds
- [ ] OCR service unavailable → Upload succeeds, ocr_extracted=false
- [ ] Concurrent resume uploads → Last upload wins
- [ ] Resume with no text → OCR returns empty, upload succeeds

---

## Subscriptions

### Edge Cases
- [ ] Subscription expired mid-request → SUBSCRIPTION_EXPIRED (403)
- [ ] No active subscription → Uses free tier defaults
- [ ] Multiple active subscriptions → Uses most recent
- [ ] Subscription expires during opportunity creation → SUBSCRIPTION_EXPIRED (403)
- [ ] Usage counter at limit → SUBSCRIPTION_LIMIT_REACHED (429)
- [ ] Usage counter reset on month boundary → Handled by background job
- [ ] Subscription downgrade mid-session → Next request uses new limits

---

## Matching Engine

### Edge Cases
- [ ] No skills match → Score = 0
- [ ] All skills match → Score = 40
- [ ] Experience exactly in range → Score = 25
- [ ] Experience below minimum → Score reduced
- [ ] Experience above maximum → Score = 20
- [ ] Education below requirement → Score = 0
- [ ] Education above requirement → Score = 15
- [ ] Location exact match → Score = 10
- [ ] Remote preference mismatch → Score reduced
- [ ] Job type mismatch → Score = 0
- [ ] All criteria match → Score = 100

---

## Database & Transactions

### Edge Cases
- [ ] Database connection lost mid-request → DATABASE_CONNECTION_FAILED (500)
- [ ] Transaction rollback → No partial data saved
- [ ] Deadlock detected → Retry or fail gracefully
- [ ] Unique constraint violation → Appropriate error
- [ ] Foreign key violation → Appropriate error
- [ ] Concurrent updates to same record → Last write wins or lock timeout
- [ ] Connection pool exhausted → Queue or fail gracefully

---

## Request Handling

### Edge Cases
- [ ] Missing Content-Type header → Handled
- [ ] Invalid Content-Type → 400 error
- [ ] Empty request body → Handled per endpoint
- [ ] Malformed JSON → 400 error
- [ ] Request body > 10MB → 413 error
- [ ] Very long URL → 414 error
- [ ] Missing required headers → Handled
- [ ] Duplicate headers → Last value used
- [ ] Request timeout → 504 error

---

## Error Responses

### Consistency Checks
- [ ] All errors have error_code
- [ ] All errors have request_id
- [ ] All errors have safe_message
- [ ] No stack traces in production responses
- [ ] HTTP status matches error_code
- [ ] Error format consistent across all endpoints

---

## Observability

### Logging Checks
- [ ] All requests logged with request_id
- [ ] All errors logged with error_code
- [ ] All audit actions logged
- [ ] Logs are valid JSON
- [ ] No PII in logs (except audit logs)
- [ ] Log levels correct (INFO/WARN/ERROR)

### Metrics Checks
- [ ] Counters increment correctly
- [ ] Metrics logged periodically
- [ ] No metric overflow
- [ ] Metrics reset on restart

---

## Background Jobs

### Edge Cases
- [ ] Job runs while no data to process → Completes successfully
- [ ] Job fails mid-execution → Logs error, doesn't crash
- [ ] Multiple job instances running → Idempotent, no conflicts
- [ ] Job runs during high load → Doesn't impact API performance
- [ ] Verification expiry job → Marks expired verifications inactive
- [ ] Subscription expiry job → Marks expired subscriptions inactive
- [ ] Opportunity expiry job → Closes expired opportunities
- [ ] Usage reset job → Resets counters at month boundary

---

## Frontend Integration

### Edge Cases
- [ ] API returns 401 → Redirect to login
- [ ] API returns 403 → Show appropriate modal/banner
- [ ] API returns 404 → Show not found page
- [ ] API returns 500 → Show error message with retry
- [ ] Network timeout → Show network error
- [ ] Network offline → Show offline message
- [ ] Slow response → Show loading state
- [ ] Empty response → Show empty state
- [ ] Malformed response → Show error message

---

## Race Conditions

### Critical Scenarios
- [ ] Two users apply to same opportunity simultaneously → Both succeed
- [ ] User applies while opportunity is being closed → One succeeds
- [ ] User withdraws while hirer updates status → Last write wins
- [ ] Two hirers update same application status → Last write wins
- [ ] User creates profile while applying → Application waits for profile
- [ ] Subscription expires during opportunity creation → Creation fails
- [ ] Verification expires during application → Application fails

---

## Data Integrity

### Checks
- [ ] No orphaned applications (opportunity deleted)
- [ ] No orphaned verifications (user deleted)
- [ ] No orphaned subscriptions (user deleted)
- [ ] Application counts match actual applications
- [ ] Usage counters match actual usage
- [ ] All foreign keys valid
- [ ] All timestamps in correct timezone (UTC)
- [ ] All UUIDs valid format

---

## Performance

### Load Tests
- [ ] 100 concurrent requests → All succeed
- [ ] 1000 requests/minute → No degradation
- [ ] Large result sets (1000+ opportunities) → Paginated correctly
- [ ] Complex queries (multiple joins) → Complete in < 1s
- [ ] File uploads under load → No timeouts
- [ ] Database connection pool under load → No exhaustion

---

## Security

### Penetration Tests
- [ ] SQL injection attempts → Blocked
- [ ] XSS attempts → Blocked
- [ ] CSRF attempts → Blocked
- [ ] Path traversal → Blocked
- [ ] Header injection → Blocked
- [ ] JWT tampering → Detected
- [ ] Brute force login → Rate limited
- [ ] Enumeration attacks → Prevented
- [ ] Mass assignment → Prevented

---

## Deployment

### Pre-Deployment Checks
- [ ] All migrations applied
- [ ] Environment variables set
- [ ] Database backups configured
- [ ] Monitoring configured
- [ ] Logging configured
- [ ] Error tracking configured
- [ ] Rate limiting configured
- [ ] CORS configured correctly
- [ ] SSL/TLS configured
- [ ] Health checks working

---

## Test Execution

### Manual Testing
1. Run `./test-system-comprehensive.sh`
2. Review all PASS/FAIL/WARN results
3. Fix all FAIL results
4. Investigate all WARN results
5. Manually test critical user flows
6. Verify error messages user-friendly
7. Check logs for errors
8. Monitor metrics during testing

### Automated Testing
1. Unit tests for matching engine
2. Integration tests for API endpoints
3. End-to-end tests for user flows
4. Load tests for performance
5. Security tests for vulnerabilities

---

## Sign-Off

Before production deployment, confirm:

- [ ] All critical edge cases tested
- [ ] All FAIL results fixed
- [ ] All WARN results investigated
- [ ] Manual testing completed
- [ ] Load testing completed
- [ ] Security testing completed
- [ ] Documentation updated
- [ ] Monitoring configured
- [ ] Rollback plan ready
- [ ] Team trained on new features

**Tested By:** _______________  
**Date:** _______________  
**Approved By:** _______________  
**Date:** _______________
