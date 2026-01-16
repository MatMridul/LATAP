# FRONTEND INTEGRATION PLAN

**Version:** 1.0.0  
**Status:** PLANNING PHASE - No UI implementation yet

This document defines the integration strategy between frontend and backend APIs.

---

## Core Principles

1. **API-First:** Frontend consumes frozen API contracts
2. **Error-Driven:** Every error_code has deterministic UX behavior
3. **Loading States:** All async operations show loading indicators
4. **Empty States:** All lists handle zero results gracefully
5. **Premium Gating:** Server-side enforcement, client-side UX hints
6. **Request Tracing:** Log request_id for all API calls

---

## Authentication Flow

### Initial Load
```
1. Check localStorage for JWT token
2. If token exists:
   - Set Authorization header
   - Fetch user profile (implicit auth check)
   - If AUTH_EXPIRED → clear token, redirect to login
3. If no token:
   - Redirect to login (unless on public route)
```

### Login Success
```
1. Receive JWT from /api/auth/login
2. Store in localStorage (or httpOnly cookie)
3. Set Authorization header globally
4. Redirect to intended destination or /opportunities
```

### Token Refresh
```
- NOT IMPLEMENTED in MVP
- All auth errors → re-login
- Future: Implement refresh token flow
```

---

## Opportunity Feed Flow

### Page Load: /opportunities

**API Call Sequence:**
```
1. GET /api/opportunities/feed?page=1&limit=20
   - Loading: Show skeleton cards
   - Success: Render opportunity cards
   - Error VERIFICATION_INACTIVE: Show verification modal
   - Error VERIFICATION_EXPIRED: Show re-verification banner
   - Empty: Show "No opportunities yet" empty state
```

**Data Dependencies:**
- Requires: Active authentication
- Requires: Active verification
- Optional: Filter/sort preferences (from localStorage)

**Loading States:**
- Initial load: Skeleton cards (20 placeholders)
- Pagination: Append skeleton cards at bottom
- Refresh: Overlay spinner on existing content

**Empty State:**
- Icon: Briefcase illustration
- Message: "No opportunities available"
- Submessage: "Check back soon or adjust your filters"
- CTA: "Create Opportunity" (if premium)

**Error States:**
- VERIFICATION_INACTIVE: Modal with "Verify Now" CTA
- VERIFICATION_EXPIRED: Banner with "Re-verify" CTA
- Network error: Retry button

---

## Opportunity Detail Flow

### Page Load: /opportunities/:id

**API Call Sequence:**
```
1. GET /api/opportunities/:id
   - Loading: Show skeleton detail page
   - Success: Render opportunity details
   - Error OPPORTUNITY_NOT_FOUND: Show 404 page
   - Error OPPORTUNITY_ACCESS_DENIED: Show 403 page

2. Check application status (parallel):
   - GET /api/applications/my-applications?opportunity_id=:id
   - If exists: Show "Already Applied" badge
   - If not: Show "Apply" button
```

**Data Dependencies:**
- Requires: Active authentication
- Requires: Opportunity ID from URL
- Optional: User's talent profile (for match preview)

**Button States:**
- "Apply" (default)
- "Already Applied" (disabled, if duplicate)
- "Closed" (disabled, if status=closed)
- "Expired" (disabled, if past expires_at)
- "Your Posting" (hidden, if posted_by=current_user)

**Loading States:**
- Initial: Skeleton detail page
- Apply button: Spinner + disabled during submission

---

## Application Submission Flow

### Action: Click "Apply" on /opportunities/:id

**Pre-Flight Checks (Client-Side):**
```
1. Check if talent profile exists (cached or fetch)
   - If missing: Show "Create Profile" modal
   - Block submission

2. Check if profile.is_open_to_opportunities = true
   - If false: Show "Update Preferences" modal
   - Block submission

3. Check subscription limits (if cached)
   - If limit reached: Show "Upgrade" modal
   - Block submission (server will enforce anyway)
```

**API Call Sequence:**
```
1. POST /api/opportunities/:id/apply
   Body: { cover_letter: "..." }
   
   - Loading: Disable button, show spinner
   - Success: 
     * Show success modal with match_score
     * Display match_breakdown
     * CTA: "View Application" → /applications/:id
   - Error TALENT_PROFILE_MISSING: Show "Create Profile" modal
   - Error DUPLICATE_APPLICATION: Show "Already Applied" message
   - Error SUBSCRIPTION_LIMIT_REACHED: Show "Upgrade" modal
   - Error OPPORTUNITY_NOT_ACTIVE: Disable button, show "Closed" badge
```

**Data Dependencies:**
- Requires: Opportunity ID
- Requires: Talent profile exists
- Requires: profile.is_open_to_opportunities = true
- Optional: Cover letter (user input)

**Success State:**
- Modal: "Application Submitted!"
- Show match score with visual indicator (0-100)
- Show match breakdown:
  - Skills: X/40 points
  - Experience: X/25 points
  - Education: X/15 points
  - Location: X/10 points
  - Job Type: X/10 points
- CTA: "View Application" or "Back to Feed"

**Error States:**
- TALENT_PROFILE_MISSING: Modal → "Create Profile"
- DUPLICATE_APPLICATION: Toast → "Already applied"
- SUBSCRIPTION_LIMIT_REACHED: Modal → "Upgrade to Premium"

---

## My Applications Flow

### Page Load: /applications

**API Call Sequence:**
```
1. GET /api/applications/my-applications?page=1&limit=20
   - Loading: Show skeleton list
   - Success: Render application cards
   - Empty: Show "No applications yet" empty state
```

**Data Dependencies:**
- Requires: Active authentication
- Optional: Status filter (from UI dropdown)

**Loading States:**
- Initial: Skeleton cards
- Pagination: Append skeletons
- Status filter change: Replace with skeletons

**Empty State:**
- Icon: Document illustration
- Message: "You haven't applied to any opportunities yet"
- CTA: "Browse Opportunities" → /opportunities

**Card Display:**
- Opportunity title + company
- Match score badge
- Status badge (color-coded):
  - pending: gray
  - reviewed: blue
  - shortlisted: green
  - rejected: red
  - accepted: green
  - withdrawn: gray
- Submitted date
- CTA: "View Details" → /applications/:id

---

## Application Detail Flow

### Page Load: /applications/:id

**API Call Sequence:**
```
1. GET /api/applications/:id
   - Loading: Show skeleton detail
   - Success: Render application details
   - Error APPLICATION_NOT_FOUND: Show 404 page
```

**Data Dependencies:**
- Requires: Application ID from URL
- Requires: User owns this application

**Display Sections:**
1. Status header (prominent badge)
2. Opportunity details (title, company, description)
3. Match breakdown (visual chart)
4. Cover letter (if provided)
5. Timeline (submitted_at, status_updated_at)
6. Actions:
   - "Withdraw" button (if status=pending or reviewed)
   - "View Opportunity" link

**Withdraw Flow:**
```
1. Click "Withdraw"
2. Show confirmation modal: "Are you sure?"
3. PUT /api/applications/:id/withdraw
   - Loading: Disable button, show spinner
   - Success: Update status to "withdrawn", show toast
   - Error APPLICATION_INVALID_STATUS: Show message with reason
```

---

## Create Opportunity Flow

### Page Load: /opportunities/create

**Pre-Flight Checks:**
```
1. Check subscription status
   - If free + visibility=all_verified: Show "Premium Required" modal
   - If limit reached: Show "Limit Reached" modal

2. Check verification status
   - If inactive/expired: Show verification modal
```

**API Call Sequence:**
```
1. POST /api/opportunities
   Body: { title, company_name, type, ... }
   
   - Loading: Disable submit, show spinner
   - Success: 
     * Show success toast
     * Redirect to /opportunities/:id
   - Error SUBSCRIPTION_REQUIRED: Show "Upgrade" modal
   - Error SUBSCRIPTION_LIMIT_REACHED: Show usage stats + "Upgrade" modal
   - Error VERIFICATION_EXPIRED: Show "Re-verify" modal
   - Error INVALID_INPUT: Highlight invalid fields
```

**Form Validation (Client-Side):**
- Title: Required, max 200 chars
- Company: Required, max 200 chars
- Type: Required, one of [job, internship, project]
- Location: Required, max 200 chars
- Description: Required, max 5000 chars
- Skills: Required, min 1 skill
- Experience: Min >= 0, Max >= Min
- Education: Required
- Expires: Required, future date
- Visibility: Required, premium check

**Loading States:**
- Submit button: Spinner + disabled
- Form: Overlay to prevent edits during submission

**Success State:**
- Toast: "Opportunity created successfully"
- Redirect to opportunity detail page
- Clear form data from cache

---

## Talent Profile Flow

### Page Load: /profile

**API Call Sequence:**
```
1. GET /api/talent-profile
   - Loading: Show skeleton form
   - Success: Populate form with existing data
   - Error TALENT_PROFILE_MISSING: Show empty form (create mode)
```

**Form Sections:**
1. Basic Info (headline, bio, location)
2. Experience (years, current role/company)
3. Education (degree, field of study)
4. Skills (multi-select tags)
5. Preferences (job types, locations, remote, salary)
6. Privacy (is_searchable, is_open_to_opportunities)
7. Resume Upload

**Save Flow:**
```
1. POST /api/talent-profile
   Body: { headline, bio, skills, ... }
   
   - Loading: Disable save button, show spinner
   - Success: Show toast "Profile saved"
   - Error INVALID_INPUT: Highlight invalid fields
```

**Resume Upload Flow:**
```
1. Select PDF file (max 5MB)
2. Client-side validation:
   - Check file type = PDF
   - Check file size <= 5MB
3. POST /api/talent-profile/resume (multipart/form-data)
   - Loading: Progress bar
   - Success: Show toast "Resume uploaded"
   - Error FILE_PROCESSING_FAILED: Show retry option
```

**Data Dependencies:**
- Optional: Existing profile data
- Required for applications: is_open_to_opportunities = true

---

## Premium Gating Strategy

### Client-Side Hints (UX Only)
```
- Show "Premium" badge on restricted features
- Disable buttons with tooltip: "Premium feature"
- Show usage stats: "X of Y opportunities posted"
- Pre-emptive modals before API call
```

### Server-Side Enforcement (Truth)
```
- All premium checks happen on backend
- Frontend hints can be bypassed (that's OK)
- Backend returns SUBSCRIPTION_REQUIRED or SUBSCRIPTION_LIMIT_REACHED
- Frontend handles error gracefully
```

### Premium Features:
1. Post opportunities with visibility=all_verified
2. Unlimited opportunity postings (free = 5/month)
3. Unlimited applications (free = 20/month)
4. View full applicant profiles (free = preview only)

---

## Data Caching Strategy

### Cache in Memory (React State/Context)
- Current user profile
- Subscription status
- Verification status
- Opportunity feed (current page)

### Cache in localStorage
- JWT token
- User preferences (filters, sort)
- Draft form data (auto-save)

### Do NOT Cache
- Application status (always fetch fresh)
- Opportunity details (may change)
- Applicant data (privacy)

### Cache Invalidation
- On logout: Clear all
- On profile update: Invalidate user profile
- On application submit: Invalidate opportunity detail
- On opportunity create: Invalidate feed

---

## Loading State Patterns

### Skeleton Screens
- Use for initial page loads
- Match layout of actual content
- Animate shimmer effect
- Show for 20 cards/items

### Spinners
- Use for button actions
- Use for inline updates
- Small, centered in button
- Disable button during loading

### Progress Bars
- Use for file uploads
- Show percentage
- Cancelable if possible

### Overlay Spinners
- Use for full-page refreshes
- Semi-transparent background
- Centered spinner
- Block all interactions

---

## Empty State Patterns

### No Results
- Friendly illustration
- Clear message: "No X found"
- Suggest action or reason
- CTA button to relevant action

### No Access
- Lock icon
- Message: "Premium feature" or "Verification required"
- Explain benefit
- CTA to upgrade/verify

### Error State
- Error icon
- Message: "Something went wrong"
- Suggest retry
- Show request_id (for support)

---

## Error Recovery Patterns

### Retry Logic
- Exponential backoff: 1s, 2s, 4s, 8s
- Max 3 retries for GET requests
- No auto-retry for POST/PUT (user action required)
- Show retry button

### Form Data Preservation
- Auto-save to localStorage every 30s
- Restore on page reload
- Clear on successful submit
- Show "Draft restored" message

### Optimistic Updates
- NOT RECOMMENDED for MVP
- All updates wait for server confirmation
- Show loading state during wait

---

## Request Tracing

### Every API Call Must:
```typescript
1. Include Authorization header
2. Log request start (with timestamp)
3. Log response (status, request_id, duration)
4. Log errors (error_code, request_id, user_action)
5. Send to monitoring service
```

### Logging Format:
```typescript
{
  timestamp: "ISO8601",
  request_id: "uuid",
  user_id: "uuid",
  endpoint: "GET /api/opportunities/feed",
  status: 200,
  duration_ms: 245,
  error_code: null,
  user_action: "viewing_opportunity_feed"
}
```

---

## API Client Implementation (Pseudocode)

```typescript
class APIClient {
  private baseURL = process.env.REACT_APP_API_URL;
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  async request<T>(
    method: string,
    path: string,
    body?: any
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const startTime = Date.now();

    try {
      const response = await fetch(`${this.baseURL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const duration = Date.now() - startTime;
      const requestId = response.headers.get('X-Request-ID');

      // Log request
      this.logRequest({
        method,
        path,
        status: response.status,
        duration,
        requestId,
      });

      if (!response.ok) {
        const error: ErrorResponse = await response.json();
        throw new APIError(error.error_code, error.error, error.request_id);
      }

      return await response.json();
    } catch (error) {
      // Handle network errors
      if (error instanceof APIError) {
        throw error;
      }
      throw new NetworkError('Network request failed');
    }
  }

  // Convenience methods
  get<T>(path: string) { return this.request<T>('GET', path); }
  post<T>(path: string, body: any) { return this.request<T>('POST', path, body); }
  put<T>(path: string, body: any) { return this.request<T>('PUT', path, body); }
  delete<T>(path: string) { return this.request<T>('DELETE', path); }
}
```

---

## Screen-by-Screen Data Flow

### /opportunities (Feed)
```
Load → GET /api/opportunities/feed
Filter → GET /api/opportunities/feed?type=job
Paginate → GET /api/opportunities/feed?page=2
Click card → Navigate to /opportunities/:id
```

### /opportunities/:id (Detail)
```
Load → GET /api/opportunities/:id
Check applied → GET /api/applications/my-applications (filter by opportunity_id)
Apply → POST /api/opportunities/:id/apply
```

### /opportunities/create (Create)
```
Load → Check subscription status (cached)
Submit → POST /api/opportunities
Success → Navigate to /opportunities/:id
```

### /opportunities/:id/applications (Applicants)
```
Load → GET /api/opportunities/:id/applications
Filter → GET /api/opportunities/:id/applications?status=shortlisted
Update status → PUT /api/applications/:id/status
```

### /applications (My Applications)
```
Load → GET /api/applications/my-applications
Filter → GET /api/applications/my-applications?status=pending
Click card → Navigate to /applications/:id
```

### /applications/:id (Application Detail)
```
Load → GET /api/applications/:id
Withdraw → PUT /api/applications/:id/withdraw
```

### /profile (Talent Profile)
```
Load → GET /api/talent-profile
Save → POST /api/talent-profile
Upload resume → POST /api/talent-profile/resume
```

---

## Next Steps (After This Phase)

1. **Phase 2B:** Implement React components (no API calls yet)
2. **Phase 2C:** Integrate API client with components
3. **Phase 2D:** Add error handling and loading states
4. **Phase 2E:** Add empty states and edge cases
5. **Phase 3:** End-to-end testing
6. **Phase 4:** Production deployment

---

## Success Criteria

This plan is complete when:
- ✅ All API call sequences are documented
- ✅ All data dependencies are explicit
- ✅ All loading states are defined
- ✅ All empty states are defined
- ✅ All error states are defined
- ✅ Premium gating behavior is clear
- ✅ Request tracing strategy is defined
- ✅ No implementation has started yet
