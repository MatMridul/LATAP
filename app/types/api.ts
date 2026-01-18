// Frontend Data Transfer Objects (DTOs)
// These interfaces MUST match backend API responses exactly
// Version: 1.0.0 - FROZEN

// ============================================
// COMMON TYPES
// ============================================

export type OpportunityType = 'job' | 'internship' | 'project';
export type OpportunityStatus = 'active' | 'closed';
export type OpportunityVisibility = 'institution_only' | 'all_verified';
export type EducationLevel = 'high_school' | 'associate' | 'bachelor' | 'master' | 'phd';
export type JobType = 'full_time' | 'part_time' | 'contract' | 'freelance';
export type RemotePreference = 'remote_only' | 'hybrid' | 'onsite' | 'flexible';
export type ApplicationStatus = 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted' | 'withdrawn';
export type ExperienceMatch = 'perfect' | 'under_qualified' | 'over_qualified';
export type EducationMatch = 'meets' | 'exceeds' | 'below';

// ============================================
// ERROR RESPONSE
// ============================================

export interface ErrorResponse {
  error: string;
  error_code: string;
  request_id: string;
}

// ============================================
// OPPORTUNITIES
// ============================================

export interface OpportunityCard {
  id: string;
  title: string;
  company_name: string;
  type: OpportunityType;
  location: string;
  remote_ok: boolean;
  description: string;
  requirements: string;
  skills_required: string[];
  experience_required_min: number;
  experience_required_max: number;
  education_required: EducationLevel;
  salary_min: number | null;
  salary_max: number | null;
  application_count: number;
  posted_by: string;
  institution_id: string;
  institution_name: string;
  visibility: OpportunityVisibility;
  status: OpportunityStatus;
  expires_at: string; // ISO8601
  created_at: string; // ISO8601
}

export interface OpportunityDetail extends OpportunityCard {
  job_types: JobType[];
  updated_at: string; // ISO8601
}

export interface OpportunityFeedResponse {
  opportunities: OpportunityCard[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface OpportunityCreateRequest {
  title: string;
  company_name: string;
  opportunity_type: OpportunityType;
  location: string;
  is_remote: boolean;
  description: string;
  job_type: JobType; // Single job type for backend
  required_skills: string[];
  min_experience: number;
  max_experience: number;
  required_degree: EducationLevel;
  salary_min?: number | null;
  salary_max?: number | null;
  currency?: string;
  visibility: OpportunityVisibility;
  expires_at: string; // ISO8601
}

export interface OpportunityCreateResponse {
  success: true;
  opportunity_id: string;
  message: string;
}

export interface OpportunityDetailResponse {
  opportunity: OpportunityDetail;
}

export interface MyOpportunitiesResponse {
  opportunities: Array<{
    id: string;
    title: string;
    company_name: string;
    type: OpportunityType;
    application_count: number;
    status: OpportunityStatus;
    visibility: OpportunityVisibility;
    expires_at: string;
    created_at: string;
  }>;
  total: number;
  page: number;
  limit: number;
}

// ============================================
// MATCHING
// ============================================

export interface MatchBreakdown {
  skills_score: number; // 0-40
  experience_score: number; // 0-25
  education_score: number; // 0-15
  location_score: number; // 0-10
  job_type_score: number; // 0-10
  details: {
    skills_matched: string[];
    skills_missing: string[];
    experience_match: ExperienceMatch;
    education_match: EducationMatch;
  };
}

// ============================================
// APPLICATIONS
// ============================================

export interface ApplicationSubmitRequest {
  cover_letter?: string;
}

export interface ApplicationSubmitResponse {
  success: true;
  application_id: string;
  match_score: number; // 0-100
  match_breakdown: MatchBreakdown;
  message: string;
}

export interface ApplicationSummary {
  id: string;
  opportunity_id: string;
  opportunity_title: string;
  company_name: string;
  opportunity_status: OpportunityStatus;
  institution_name: string;
  match_score: number;
  status: ApplicationStatus;
  submitted_at: string; // ISO8601
  status_updated_at: string; // ISO8601
}

export interface MyApplicationsResponse {
  applications: ApplicationSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface ApplicationDetail {
  id: string;
  opportunity_id: string;
  opportunity_title: string;
  opportunity_description: string;
  company_name: string;
  institution_name: string;
  match_score: number;
  match_breakdown: MatchBreakdown;
  cover_letter: string;
  status: ApplicationStatus;
  submitted_at: string; // ISO8601
  status_updated_at: string; // ISO8601
}

export interface ApplicationDetailResponse {
  application: ApplicationDetail;
}

export interface ApplicationWithdrawResponse {
  success: true;
  message: string;
}

export interface ApplicationStatusUpdateRequest {
  status: 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
  notes?: string;
}

export interface ApplicationStatusUpdateResponse {
  success: true;
  message: string;
}

// ============================================
// APPLICANTS (for opportunity owners)
// ============================================

export interface ApplicantPreview {
  id: string;
  applicant_id: string;
  applicant_name: string;
  applicant_email: string;
  match_score: number;
  match_breakdown: {
    skills_score: number;
    experience_score: number;
    education_score: number;
    location_score: number;
    job_type_score: number;
  };
  cover_letter: string;
  status: ApplicationStatus;
  submitted_at: string; // ISO8601
  reviewed_at: string | null; // ISO8601
}

export interface OpportunityApplicationsResponse {
  applications: ApplicantPreview[];
  total: number;
  page: number;
  limit: number;
}

// ============================================
// TALENT PROFILE
// ============================================

export interface TalentProfile {
  user_id: string;
  headline: string;
  bio: string;
  location: string;
  skills: string[];
  years_of_experience: number;
  current_role: string;
  current_company: string;
  highest_degree: EducationLevel;
  field_of_study: string;
  job_types: JobType[];
  preferred_locations: string[];
  remote_preference: RemotePreference;
  expected_salary_min: number | null;
  expected_salary_max: number | null;
  resume_s3_key: string | null;
  resume_uploaded_at: string | null; // ISO8601
  is_searchable: boolean;
  is_open_to_opportunities: boolean;
  created_at: string; // ISO8601
  updated_at: string; // ISO8601
}

export interface TalentProfileResponse {
  profile: TalentProfile;
}

export interface TalentProfileUpdateRequest {
  headline?: string;
  bio?: string;
  location?: string;
  skills?: string[];
  years_of_experience?: number;
  current_role?: string;
  current_company?: string;
  highest_degree?: EducationLevel;
  field_of_study?: string;
  job_types?: JobType[];
  preferred_locations?: string[];
  remote_preference?: RemotePreference;
  expected_salary_min?: number | null;
  expected_salary_max?: number | null;
  is_searchable?: boolean;
  is_open_to_opportunities?: boolean;
}

export interface TalentProfileUpdateResponse {
  success: true;
  message: string;
}

export interface ResumeUploadResponse {
  success: true;
  message: string;
  ocr_extracted: boolean;
}

// ============================================
// SUBSCRIPTION (for future use)
// ============================================

export interface SubscriptionStatus {
  plan_type: 'free' | 'premium' | 'enterprise';
  is_active: boolean;
  opportunities_posted_this_month: number;
  max_opportunities_per_month: number;
  applications_submitted_this_month: number;
  max_applications_per_month: number;
  expires_at: string | null; // ISO8601
}

// ============================================
// PAGINATION
// ============================================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more?: boolean;
}
