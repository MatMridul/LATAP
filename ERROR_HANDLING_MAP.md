# ERROR HANDLING MAP

**Version:** 1.0.0  
**Status:** FROZEN

This document defines deterministic frontend behavior for each backend error_code.

---

## Authentication Errors

### AUTH_MISSING_TOKEN
**HTTP Status:** 401  
**Frontend Behavior:**
- Clear local auth state
- Redirect to `/login`
- Show toast: "Please log in to continue"
- Preserve intended destination for post-login redirect

### AUTH_INVALID_TOKEN
**HTTP Status:** 401  
**Frontend Behavior:**
- Clear local auth state
- Redirect to `/login`
- Show toast: "Session invalid. Please log in again"
- Do NOT preserve destination (security)

### AUTH_EXPIRED
**HTTP Status:** 401  
**Frontend Behavior:**
- Clear local auth state
- Redirect to `/login`
- Show toast: "Session expired. Please log in again"
- Preserve intended destination for post-login redirect

---

## Verification Errors

### VERIFICATION_INACTIVE
**HTTP Status:** 403  
**Frontend Behavior:**
- Show modal: "Institution Verification Required"
- CTA button: "Verify Now" → `/verification`
- Block access to opportunities feed
- Allow access to profile and settings

### VERIFICATION_EXPIRED
**HTTP Status:** 403  
**Frontend Behavior:**
- Show banner: "Your verification has expired"
- CTA button: "Re-verify" → `/verification`
- Disable opportunity posting
- Disable application submission
- Show expiry date in banner

### VERIFICATION_NOT_FOUND
**HTTP Status:** 404  
**Frontend Behavior:**
- Show empty state: "No verification found"
- CTA button: "Get Verified" → `/verification`

### VERIFICATION_ALREADY_EXISTS
**HTTP Status:** 409  
**Frontend Behavior:**
- Show message: "Verification already submitted"
- Display current verification status
- Show estimated review time

---

## Subscription Errors

### SUBSCRIPTION_EXPIRED
**HTTP Status:** 403  
**Frontend Behavior:**
- Show modal: "Premium Subscription Expired"
- Display expiry date
- CTA button: "Renew Now" → `/subscription/renew`
- Downgrade UI to free tier features

### SUBSCRIPTION_LIMIT_REACHED
**HTTP Status:** 429  
**Frontend Behavior:**
- Show modal with usage stats:
  - "You've reached your monthly limit"
  - "X of Y opportunities posted this month"
  - OR "X of Y applications submitted this month"
- CTA button: "Upgrade to Premium" → `/subscription/upgrade`
- Show limit reset date
- Disable submit button on forms

### SUBSCRIPTION_REQUIRED
**HTTP Status:** 403  
**Frontend Behavior:**
- Show modal: "Premium Feature"
- Explain feature benefit
- CTA button: "Upgrade Now" → `/subscription/plans`
- Show pricing comparison

---

## Opportunity Errors

### OPPORTUNITY_NOT_FOUND
**HTTP Status:** 404  
**Frontend Behavior:**
- Show 404 page: "Opportunity not found"
- Possible reasons: "Deleted, expired, or you don't have access"
- CTA button: "Browse Opportunities" → `/opportunities`

### OPPORTUNITY_NOT_ACTIVE
**HTTP Status:** 400  
**Frontend Behavior:**
- Disable "Apply" button
- Show badge: "Closed"
- Show message: "This opportunity is no longer accepting applications"
- Allow viewing details (read-only)

### OPPORTUNITY_EXPIRED
**HTTP Status:** 400  
**Frontend Behavior:**
- Disable "Apply" button
- Show badge: "Expired"
- Show expiry date
- Show message: "Application deadline has passed"

### OPPORTUNITY_ACCESS_DENIED
**HTTP Status:** 403  
**Frontend Behavior:**
- Show 403 page: "Access Denied"
- Message: "You don't have permission to view this opportunity"
- Possible reason: "Institution-only visibility"
- CTA button: "Back to Feed" → `/opportunities`

---

## Application Errors

### DUPLICATE_APPLICATION
**HTTP Status:** 409  
**Frontend Behavior:**
- Show message: "You've already applied to this opportunity"
- Display existing application status
- CTA button: "View Application" → `/applications/:id`
- Disable "Apply" button

### APPLY_TO_OWN_OPPORTUNITY
**HTTP Status:** 400  
**Frontend Behavior:**
- Hide "Apply" button entirely
- Show badge: "Your Posting"
- CTA button: "View Applications" → `/opportunities/:id/applications`

### APPLICATION_NOT_FOUND
**HTTP Status:** 404  
**Frontend Behavior:**
- Show 404 page: "Application not found"
- CTA button: "My Applications" → `/applications`

### APPLICATION_INVALID_STATUS
**HTTP Status:** 400  
**Frontend Behavior:**
- Show message: "Cannot withdraw application"
- Display current status with explanation:
  - "accepted": "Application already accepted"
  - "rejected": "Application already rejected"
  - "withdrawn": "Application already withdrawn"
- Disable withdraw button

---

## Profile Errors

### TALENT_PROFILE_MISSING
**HTTP Status:** 400  
**Frontend Behavior:**
- Show modal: "Complete Your Profile"
- Message: "Create your talent profile to apply for opportunities"
- CTA button: "Create Profile" → `/profile/create`
- Block application submission

### TALENT_PROFILE_NOT_OPEN
**HTTP Status:** 400  
**Frontend Behavior:**
- Show message: "You're not currently open to opportunities"
- CTA button: "Update Preferences" → `/profile/edit`
- Explain: "Enable 'Open to Opportunities' in your profile settings"

---

## Rate Limiting

### RATE_LIMIT_EXCEEDED
**HTTP Status:** 429  
**Frontend Behavior:**
- Show toast: "Too many requests. Please try again in a moment"
- Disable submit button for 5 seconds
- Show countdown timer
- Log to analytics (potential abuse)

---

## System Errors

### DATABASE_TRANSACTION_FAILED
**HTTP Status:** 500  
**Frontend Behavior:**
- Show toast: "Something went wrong. Please try again"
- Log error to monitoring (with request_id)
- Retry button available
- Do NOT expose technical details

### DATABASE_CONNECTION_FAILED
**HTTP Status:** 500  
**Frontend Behavior:**
- Show toast: "Service temporarily unavailable"
- Retry button with exponential backoff
- Log to monitoring
- Show status page link if available

### FILE_PROCESSING_FAILED
**HTTP Status:** 500  
**Frontend Behavior:**
- Show message: "File upload failed"
- Suggest: "Please try again or use a different file"
- Check file size and format
- Retry button available

### OCR_FAILED
**HTTP Status:** 500  
**Frontend Behavior:**
- Show warning: "Resume uploaded but text extraction failed"
- Message: "You can still apply, but matching may be less accurate"
- CTA: "Continue Anyway" or "Upload Different File"

### EMAIL_SEND_FAILED
**HTTP Status:** 500  
**Frontend Behavior:**
- Show message: "Email notification failed"
- Reassure: "Your action was saved successfully"
- Suggest: "Check your email settings"

---

## Validation Errors

### INVALID_INPUT
**HTTP Status:** 400  
**Frontend Behavior:**
- Highlight invalid form fields
- Show inline error messages
- Focus first invalid field
- Do NOT submit form

### INVALID_UUID
**HTTP Status:** 400  
**Frontend Behavior:**
- Show 404 page (treat as not found)
- Log to monitoring (potential tampering)

### MISSING_REQUIRED_FIELD
**HTTP Status:** 400  
**Frontend Behavior:**
- Highlight missing fields in red
- Show message: "Please fill in all required fields"
- Scroll to first missing field
- Disable submit until valid

---

## Global Error Handling

### Unknown error_code
**Frontend Behavior:**
- Show generic error: "Something went wrong"
- Log full error to monitoring
- Include request_id in logs
- Provide retry option

### Network Error (no response)
**Frontend Behavior:**
- Show toast: "Network error. Check your connection"
- Retry button with exponential backoff
- Cache form data (don't lose user input)

### Timeout
**Frontend Behavior:**
- Show message: "Request timed out"
- Retry button
- Suggest: "Check your internet connection"

---

## Error Display Patterns

### Toast (Temporary)
- Auto-dismiss after 5 seconds
- Used for: Auth errors, rate limiting, system errors
- Position: Top-right
- Include close button

### Modal (Blocking)
- Requires user action
- Used for: Subscription limits, verification required, premium features
- Include clear CTA
- Dismissible with X button

### Inline (Form)
- Persistent until fixed
- Used for: Validation errors
- Red text below field
- Icon indicator

### Banner (Persistent)
- Stays until resolved
- Used for: Verification expired, subscription expired
- Dismissible but reappears on page load
- Prominent CTA button

### Page (Full)
- Dedicated error page
- Used for: 404, 403, 500
- Include navigation options
- Friendly illustration

---

## Error Logging

**All errors must be logged with:**
- error_code
- request_id (from response)
- user_id (if authenticated)
- timestamp
- current_route
- user_action (what they were trying to do)

**Send to monitoring service for:**
- Error rate tracking
- Request_id correlation with backend logs
- User impact analysis
