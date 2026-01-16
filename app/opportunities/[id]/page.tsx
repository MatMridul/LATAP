'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, APIError } from '../../lib/apiClient';
import { handleAPIError } from '../../lib/errorHandler';
import type { OpportunityDetail, MatchBreakdown } from '../../types/api';
import ApplyModal from '../../components/ApplyModal';

export default function OpportunityDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [opportunity, setOpportunity] = useState<OpportunityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    loadOpportunity();
    checkApplicationStatus();
  }, [params.id]);

  async function loadOpportunity() {
    try {
      setLoading(true);
      const response = await apiClient.getOpportunityDetail(params.id);
      setOpportunity(response.opportunity);
    } catch (err) {
      if (err instanceof APIError) {
        const action = handleAPIError(err);
        if (action.type === 'redirect' && action.redirectTo) {
          router.push(action.redirectTo);
        } else {
          setError(action.message);
        }
      } else {
        setError('Failed to load opportunity');
      }
    } finally {
      setLoading(false);
    }
  }

  async function checkApplicationStatus() {
    try {
      const response = await apiClient.getMyApplications({ page: 1, limit: 100 });
      const applied = response.applications.some(
        (app) => app.opportunity_id === params.id
      );
      setHasApplied(applied);
    } catch (err) {
      // Ignore error - user might not be authenticated
    }
  }

  function canApply(): boolean {
    if (!opportunity) return false;
    if (hasApplied) return false;
    if (opportunity.status !== 'active') return false;
    if (new Date(opportunity.expires_at) < new Date()) return false;
    return true;
  }

  function getApplyButtonText(): string {
    if (hasApplied) return 'Already Applied';
    if (opportunity?.status === 'closed') return 'Closed';
    if (opportunity && new Date(opportunity.expires_at) < new Date()) return 'Expired';
    return 'Apply Now';
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <p className="text-red-600">{error || 'Opportunity not found'}</p>
            <button
              onClick={() => router.push('/opportunities')}
              className="mt-4 text-blue-600 hover:text-blue-700"
            >
              Back to Opportunities
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.push('/opportunities')}
          className="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Opportunities
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {opportunity.title}
              </h1>
              <p className="text-xl text-gray-600">{opportunity.company_name}</p>
            </div>
            <button
              onClick={() => setShowApplyModal(true)}
              disabled={!canApply()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
            >
              {getApplyButtonText()}
            </button>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {opportunity.type.charAt(0).toUpperCase() + opportunity.type.slice(1)}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
              {opportunity.location} {opportunity.remote_ok && '(Remote OK)'}
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              {opportunity.institution_name}
            </span>
          </div>

          <div className="prose max-w-none mb-8">
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{opportunity.description}</p>
          </div>

          {opportunity.requirements && (
            <div className="prose max-w-none mb-8">
              <h2 className="text-xl font-semibold mb-3">Requirements</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{opportunity.requirements}</p>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {opportunity.skills_required.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Experience</h3>
              <p className="text-gray-700">
                {opportunity.experience_required_min}-{opportunity.experience_required_max} years
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Education</h3>
              <p className="text-gray-700 capitalize">
                {opportunity.education_required.replace('_', ' ')}
              </p>
            </div>
            {(opportunity.salary_min || opportunity.salary_max) && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Salary</h3>
                <p className="text-gray-700">
                  ${(opportunity.salary_min || 0) / 1000}k - ${(opportunity.salary_max || 0) / 1000}k
                </p>
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Applications</h3>
              <p className="text-gray-700">{opportunity.application_count} applicants</p>
            </div>
          </div>

          <div className="border-t pt-6">
            <p className="text-sm text-gray-600">
              Posted on {new Date(opportunity.created_at).toLocaleDateString()}
              {' • '}
              Expires on {new Date(opportunity.expires_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {showApplyModal && (
        <ApplyModal
          opportunityId={params.id}
          opportunityTitle={opportunity.title}
          onClose={() => setShowApplyModal(false)}
          onSuccess={() => {
            setHasApplied(true);
            setShowApplyModal(false);
          }}
        />
      )}
    </div>
  );
}
