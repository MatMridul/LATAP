/**
 * LATAP Dashboard Mock Data
 * 
 * IMPORTANT: This file contains mock data for UI development only.
 * All data here must be removed before production deployment.
 * See MOCK_REGISTRY.md for removal tracking.
 */

export interface MockUserProfile {
  id: string;
  name: string;
  email: string;
  institution: string;
  verification_status: 'verified' | 'pending' | 'expired' | 'expiring';
  verification_expires_at: string | null;
  credibility_score: number;
  avatar_url?: string;
  type: 'mock_user_profile';
  description: 'Mock user profile data for dashboard identity panel';
  used_in_component: 'DashboardIdentityPanel';
}

export interface MockOpportunityInsight {
  id: string;
  title: string;
  company_name: string;
  applications_count: number;
  status: 'active' | 'closed' | 'draft';
  posted_date: string;
  type: 'mock_opportunity_insight';
  description: 'Mock opportunity data for institution insights';
  used_in_component: 'OpportunityInsights';
}

export interface MockApplicationStatus {
  id: string;
  opportunity_title: string;
  company_name: string;
  status: 'submitted' | 'shortlisted' | 'rejected' | 'accepted';
  applied_date: string;
  type: 'mock_application_status';
  description: 'Mock application status for user application summary';
  used_in_component: 'ApplicationStatusSummary';
}

export interface MockActivityFeedItem {
  id: string;
  type: 'verification' | 'application' | 'opportunity' | 'system';
  title: string;
  description: string;
  timestamp: string;
  icon: string;
  type_field: 'mock_activity_feed';
  description_field: 'Mock activity feed items for trust & activity section';
  used_in_component: 'TrustActivityFeed';
}

// Mock Data Instances
export const mockUserProfile: MockUserProfile = {
  id: 'mock-user-001',
  name: 'Sarah Chen',
  email: 'sarah.chen@stanford.edu',
  institution: 'Stanford University',
  verification_status: 'verified',
  verification_expires_at: '2026-07-15T00:00:00Z',
  credibility_score: 92,
  avatar_url: undefined,
  type: 'mock_user_profile',
  description: 'Mock user profile data for dashboard identity panel',
  used_in_component: 'DashboardIdentityPanel'
};

export const mockInstitutionOpportunities: MockOpportunityInsight[] = [
  {
    id: 'mock-opp-001',
    title: 'Senior Software Engineer',
    company_name: 'TechCorp Alumni Ventures',
    applications_count: 12,
    status: 'active',
    posted_date: '2026-01-10T00:00:00Z',
    type: 'mock_opportunity_insight',
    description: 'Mock opportunity data for institution insights',
    used_in_component: 'OpportunityInsights'
  },
  {
    id: 'mock-opp-002',
    title: 'Product Manager',
    company_name: 'Stanford Innovation Lab',
    applications_count: 8,
    status: 'active',
    posted_date: '2026-01-12T00:00:00Z',
    type: 'mock_opportunity_insight',
    description: 'Mock opportunity data for institution insights',
    used_in_component: 'OpportunityInsights'
  }
];

export const mockApplicationStatuses: MockApplicationStatus[] = [
  {
    id: 'mock-app-001',
    opportunity_title: 'Data Scientist',
    company_name: 'AI Innovations Inc',
    status: 'shortlisted',
    applied_date: '2026-01-08T00:00:00Z',
    type: 'mock_application_status',
    description: 'Mock application status for user application summary',
    used_in_component: 'ApplicationStatusSummary'
  },
  {
    id: 'mock-app-002',
    opportunity_title: 'UX Designer',
    company_name: 'Design Studio Pro',
    status: 'submitted',
    applied_date: '2026-01-14T00:00:00Z',
    type: 'mock_application_status',
    description: 'Mock application status for user application summary',
    used_in_component: 'ApplicationStatusSummary'
  }
];

export const mockActivityFeed: MockActivityFeedItem[] = [
  {
    id: 'mock-activity-001',
    type: 'verification',
    title: 'Verification Approved',
    description: 'Your Stanford University verification was approved',
    timestamp: '2026-01-15T10:30:00Z',
    icon: 'shield-check',
    type_field: 'mock_activity_feed',
    description_field: 'Mock activity feed items for trust & activity section',
    used_in_component: 'TrustActivityFeed'
  },
  {
    id: 'mock-activity-002',
    type: 'application',
    title: 'Application Submitted',
    description: 'You applied to Data Scientist at AI Innovations Inc',
    timestamp: '2026-01-08T14:20:00Z',
    icon: 'document-text',
    type_field: 'mock_activity_feed',
    description_field: 'Mock activity feed items for trust & activity section',
    used_in_component: 'TrustActivityFeed'
  },
  {
    id: 'mock-activity-003',
    type: 'opportunity',
    title: 'New Applications Received',
    description: 'Your Senior Software Engineer opportunity received 3 new applications',
    timestamp: '2026-01-16T09:15:00Z',
    icon: 'users',
    type_field: 'mock_activity_feed',
    description_field: 'Mock activity feed items for trust & activity section',
    used_in_component: 'TrustActivityFeed'
  }
];

// Premium Preview Mock Data
export const mockPremiumInsights = {
  top_matches: {
    count: 5,
    preview_title: 'Top Talent Matches',
    locked: true,
    type: 'mock_premium_preview',
    description: 'Mock premium feature preview for upgrade CTA',
    used_in_component: 'PremiumValuePreview'
  },
  recruiter_interest: {
    score: 87,
    preview_title: 'Recruiter Interest Score',
    locked: true,
    type: 'mock_premium_preview',
    description: 'Mock premium feature preview for upgrade CTA',
    used_in_component: 'PremiumValuePreview'
  }
};
