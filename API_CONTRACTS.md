# API CONTRACTS - FROZEN

**Version:** 1.0.0  
**Last Updated:** 2026-01-16  
**Status:** LOCKED - Do not modify without version bump

All endpoints return `X-Request-ID` header for tracing.

---

## Authentication

All authenticated endpoints require:
```
Authorization: Bearer <jwt_token>
```

Missing/invalid token returns:
```json
{
  "error": "Authentication required",
  "error_code": "AUTH_MISSING_TOKEN" | "AUTH_INVALID_TOKEN" | "AUTH_EXPIRED",
  "request_id": "uuid"
}
```
**HTTP Status:** 401

---

## Opportunities API

### GET /api/opportunities/feed

**Description:** Get institution-scoped opportunity feed with visibility filtering

**Auth:** Required

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `type` (string, optional): "job" | "internship" | "project"
- `status` (string, default: "active"): "active" | "closed"

**Success Response (200):**
```json
{
  "opportunities": [
    {
      "id": "uuid",
      "title": "string",
      "company_name": "string",
      "type": "job" | "internship" | "project",
      "location": "string",
      "remote_ok": boolean,
      "description": "string",
      "requirements": "string",
      "skills_required": ["string"],
      "experience_required_min": number,
      "experience_required_max": number,
      "education_required": "high_school" | "associate" | "bachelor" | "master" | "phd",
      "salary_min": number | null,
      "salary_max": number | null,
      "application_count": number,
      "posted_by": "uuid",
      "institution_id": "uuid",
      "institution_name": "string",
      "visibility": "institution_only" | "all_verified",
      "status": "active" | "closed",
      "expires_at": "ISO8601",
      "created_at": "ISO8601"
    }
  ],
  "total": number,
  "page": number,
  "limit": number,
  "has_more": boolean
}
```

**Error Responses:**
- `VERIFICATION_INACTIVE` (403): User has no active verification
- `VERIFICATION_EXPIRED` (403): User's verification expired

**Pagination:** Offset-based, stable sort by `created_at DESC`

**Empty Result:** Returns `{"opportunities": [], "total": 0, ...}`

---

### POST /api/opportunities

**Description:** Create new opportunity (premium gated)

**Auth:** Required

**Request Body:**
```json
{
  "title": "string (required, max 200)",
  "company_name": "string (required, max 200)",
  "type": "job" | "internship" | "project" (required)",
  "location": "string (required, max 200)",
  "remote_ok": boolean,
  "description": "string (required, max 5000)",
  "requirements": "string (optional, max 5000)",
  "skills_required": ["string"] (required, min 1),
  "experience_required_min": number (required, >= 0),
  "experience_required_max": number (required, >= min),
  "education_required": "high_school" | "associate" | "bachelor" | "master" | "phd" (required),
  "salary_min": number | null,
  "salary_max": number | null,
  "job_types": ["full_time" | "part_time" | "contract" | "freelance"],
  "visibility": "institution_only" | "all_verified" (required),
  "expires_at": "ISO8601 (required, future date)"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "opportunity_id": "uuid",
  "message": "Opportunity created successfully"
}
```

**Error Responses:**
- `VERIFICATION_INACTIVE` (403): No active verification
- `VERIFICATION_EXPIRED` (403): Verification expired
- `SUBSCRIPTION_REQUIRED` (403): Premium subscription required for visibility=all_verified
- `SUBSCRIPTION_LIMIT_REACHED` (429): Monthly posting limit reached
- `INVALID_INPUT` (400): Validation failed
- `MISSING_REQUIRED_FIELD` (400): Required field missing

---

### GET /api/opportunities/:id

**Description:** Get single opportunity details

**Auth:** Required

**Path Parameters:**
- `id` (uuid, required)

**Success Response (200):**
```json
{
  "opportunity": {
    "id": "uuid",
    "title": "string",
    "company_name": "string",
    "type": "job" | "internship" | "project",
    "location": "string",
    "remote_ok": boolean,
    "description": "string",
    "requirements": "string",
    "skills_required": ["string"],
    "experience_required_min": number,
    "experience_required_max": number,
    "education_required": "high_school" | "associate" | "bachelor" | "master" | "phd",
    "salary_min": number | null,
    "salary_max": number | null,
    "job_types": ["string"],
    "application_count": number,
    "posted_by": "uuid",
    "institution_id": "uuid",
    "institution_name": "string",
    "visibility": "institution_only" | "all_verified",
    "status": "active" | "closed",
    "expires_at": "ISO8601",
    "created_at": "ISO8601",
    "updated_at": "ISO8601"
  }
}
```

**Error Responses:**
- `OPPORTUNITY_NOT_FOUND` (404): Opportunity doesn't exist
- `OPPORTUNITY_ACCESS_DENIED` (403): User doesn't have access to this opportunity

---

### POST /api/opportunities/:id/apply

**Description:** Submit application with matching score

**Auth:** Required

**Path Parameters:**
- `id` (uuid, required)

**Request Body:**
```json
{
  "cover_letter": "string (optional, max 2000)"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "application_id": "uuid",
  "match_score": number (0-100),
  "match_breakdown": {
    "skills_score": number (0-40),
    "experience_score": number (0-25),
    "education_score": number (0-15),
    "location_score": number (0-10),
    "job_type_score": number (0-10),
    "details": {
      "skills_matched": ["string"],
      "skills_missing": ["string"],
      "experience_match": "perfect" | "under_qualified" | "over_qualified",
      "education_match": "meets" | "exceeds" | "below"
    }
  },
  "message": "Application submitted successfully"
}
```

**Error Responses:**
- `TALENT_PROFILE_MISSING` (400): User must create talent profile first
- `TALENT_PROFILE_NOT_OPEN` (400): User not open to opportunities
- `OPPORTUNITY_NOT_FOUND` (404): Opportunity doesn't exist
- `OPPORTUNITY_NOT_ACTIVE` (400): Opportunity is closed
- `OPPORTUNITY_EXPIRED` (400): Opportunity expired
- `DUPLICATE_APPLICATION` (409): Already applied
- `APPLY_TO_OWN_OPPORTUNITY` (400): Cannot apply to own posting
- `SUBSCRIPTION_LIMIT_REACHED` (429): Monthly application limit reached

---

### GET /api/opportunities/my-posts

**Description:** Get user's posted opportunities

**Auth:** Required

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `status` (string, optional): "active" | "closed"

**Success Response (200):**
```json
{
  "opportunities": [
    {
      "id": "uuid",
      "title": "string",
      "company_name": "string",
      "type": "job" | "internship" | "project",
      "application_count": number,
      "status": "active" | "closed",
      "visibility": "institution_only" | "all_verified",
      "expires_at": "ISO8601",
      "created_at": "ISO8601"
    }
  ],
  "total": number,
  "page": number,
  "limit": number
}
```

**Pagination:** Offset-based, stable sort by `created_at DESC`

---

### GET /api/opportunities/:id/applications

**Description:** Get applications for opportunity (owner only)

**Auth:** Required

**Path Parameters:**
- `id` (uuid, required)

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `status` (string, optional): "pending" | "reviewed" | "shortlisted" | "rejected" | "accepted"

**Success Response (200):**
```json
{
  "applications": [
    {
      "id": "uuid",
      "applicant_id": "uuid",
      "applicant_name": "string",
      "applicant_email": "string",
      "match_score": number,
      "match_breakdown": {
        "skills_score": number,
        "experience_score": number,
        "education_score": number,
        "location_score": number,
        "job_type_score": number
      },
      "cover_letter": "string",
      "status": "pending" | "reviewed" | "shortlisted" | "rejected" | "accepted",
      "submitted_at": "ISO8601",
      "reviewed_at": "ISO8601" | null
    }
  ],
  "total": number,
  "page": number,
  "limit": number
}
```

**Error Responses:**
- `OPPORTUNITY_NOT_FOUND` (404): Opportunity doesn't exist
- `OPPORTUNITY_ACCESS_DENIED` (403): User is not the opportunity owner

**Pagination:** Offset-based, stable sort by `match_score DESC, submitted_at DESC`

---

## Applications API

### GET /api/applications/my-applications

**Description:** Get user's submitted applications

**Auth:** Required

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `status` (string, optional): "pending" | "reviewed" | "shortlisted" | "rejected" | "accepted" | "withdrawn"

**Success Response (200):**
```json
{
  "applications": [
    {
      "id": "uuid",
      "opportunity_id": "uuid",
      "opportunity_title": "string",
      "company_name": "string",
      "opportunity_status": "active" | "closed",
      "institution_name": "string",
      "match_score": number,
      "status": "pending" | "reviewed" | "shortlisted" | "rejected" | "accepted" | "withdrawn",
      "submitted_at": "ISO8601",
      "status_updated_at": "ISO8601"
    }
  ],
  "total": number,
  "page": number,
  "limit": number
}
```

**Pagination:** Offset-based, stable sort by `submitted_at DESC`

---

### GET /api/applications/:id

**Description:** Get single application details

**Auth:** Required

**Path Parameters:**
- `id` (uuid, required)

**Success Response (200):**
```json
{
  "application": {
    "id": "uuid",
    "opportunity_id": "uuid",
    "opportunity_title": "string",
    "opportunity_description": "string",
    "company_name": "string",
    "institution_name": "string",
    "match_score": number,
    "match_breakdown": {
      "skills_score": number,
      "experience_score": number,
      "education_score": number,
      "location_score": number,
      "job_type_score": number,
      "details": object
    },
    "cover_letter": "string",
    "status": "pending" | "reviewed" | "shortlisted" | "rejected" | "accepted" | "withdrawn",
    "submitted_at": "ISO8601",
    "status_updated_at": "ISO8601"
  }
}
```

**Error Responses:**
- `APPLICATION_NOT_FOUND` (404): Application doesn't exist or user doesn't own it

---

### PUT /api/applications/:id/withdraw

**Description:** Withdraw application

**Auth:** Required

**Path Parameters:**
- `id` (uuid, required)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Application withdrawn successfully"
}
```

**Error Responses:**
- `APPLICATION_NOT_FOUND` (404): Application doesn't exist
- `APPLICATION_INVALID_STATUS` (400): Cannot withdraw (already accepted/rejected/withdrawn)

---

### PUT /api/applications/:id/status

**Description:** Update application status (opportunity owner only)

**Auth:** Required

**Path Parameters:**
- `id` (uuid, required)

**Request Body:**
```json
{
  "status": "reviewed" | "shortlisted" | "rejected" | "accepted" (required),
  "notes": "string (optional, max 1000)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Application status updated"
}
```

**Error Responses:**
- `APPLICATION_NOT_FOUND` (404): Application doesn't exist
- `OPPORTUNITY_ACCESS_DENIED` (403): User is not the opportunity owner
- `INVALID_INPUT` (400): Invalid status value

---

## Talent Profile API

### GET /api/talent-profile

**Description:** Get user's talent profile

**Auth:** Required

**Success Response (200):**
```json
{
  "profile": {
    "user_id": "uuid",
    "headline": "string",
    "bio": "string",
    "location": "string",
    "skills": ["string"],
    "years_of_experience": number,
    "current_role": "string",
    "current_company": "string",
    "highest_degree": "high_school" | "associate" | "bachelor" | "master" | "phd",
    "field_of_study": "string",
    "job_types": ["full_time" | "part_time" | "contract" | "freelance"],
    "preferred_locations": ["string"],
    "remote_preference": "remote_only" | "hybrid" | "onsite" | "flexible",
    "expected_salary_min": number | null,
    "expected_salary_max": number | null,
    "resume_s3_key": "string" | null,
    "resume_uploaded_at": "ISO8601" | null,
    "is_searchable": boolean,
    "is_open_to_opportunities": boolean,
    "created_at": "ISO8601",
    "updated_at": "ISO8601"
  }
}
```

**Error Responses:**
- `TALENT_PROFILE_MISSING` (404): Profile not found

---

### POST /api/talent-profile

**Description:** Create or update talent profile

**Auth:** Required

**Request Body:**
```json
{
  "headline": "string (optional, max 200)",
  "bio": "string (optional, max 2000)",
  "location": "string (optional, max 200)",
  "skills": ["string"] (optional),
  "years_of_experience": number (optional, >= 0),
  "current_role": "string (optional, max 200)",
  "current_company": "string (optional, max 200)",
  "highest_degree": "high_school" | "associate" | "bachelor" | "master" | "phd" (optional),
  "field_of_study": "string (optional, max 200)",
  "job_types": ["full_time" | "part_time" | "contract" | "freelance"] (optional),
  "preferred_locations": ["string"] (optional),
  "remote_preference": "remote_only" | "hybrid" | "onsite" | "flexible" (optional),
  "expected_salary_min": number | null (optional),
  "expected_salary_max": number | null (optional),
  "is_searchable": boolean (optional),
  "is_open_to_opportunities": boolean (optional)
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile saved successfully"
}
```

**Error Responses:**
- `INVALID_INPUT` (400): Validation failed

---

### POST /api/talent-profile/resume

**Description:** Upload resume with OCR extraction

**Auth:** Required

**Request Body:** multipart/form-data
- `resume` (file, required): PDF file, max 5MB

**Success Response (200):**
```json
{
  "success": true,
  "message": "Resume uploaded successfully",
  "ocr_extracted": boolean
}
```

**Error Responses:**
- `FILE_PROCESSING_FAILED` (500): Upload or OCR failed
- `INVALID_INPUT` (400): Invalid file type or size

---

## Pagination Guarantees

**All paginated endpoints:**
- Use offset-based pagination (`page` and `limit`)
- Default `page=1`, default `limit=20`
- Maximum `limit=100`
- Return `total` count for UI pagination
- Return `has_more` boolean (where applicable)
- Stable sorting (documented per endpoint)
- Empty results return empty array, not error

**Consistency:**
- Results may change between pages if data is modified
- No cursor-based pagination (simpler for MVP)
- Frontend should handle edge cases (deleted items, etc.)

---

## Error Response Format

**All errors follow this structure:**
```json
{
  "error": "Human-readable message",
  "error_code": "DETERMINISTIC_CODE",
  "request_id": "uuid"
}
```

**HTTP status codes are deterministic per error_code** (see ERROR_HANDLING_MAP.md)
