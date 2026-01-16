'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, APIError } from '../../../lib/apiClient';
import { handleAPIError } from '../../../lib/errorHandler';
import type { ApplicantPreview } from '../../../types/api';
import ApplicantCard from '../../../components/ApplicantCard';
import EmptyState from '../../../components/EmptyState';

export default function OpportunityApplicationsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [applicants, setApplicants] = useState<ApplicantPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isPremium, setIsPremium] = useState(false); // TODO: Get from subscription status

  useEffect(() => {
    loadApplicants();
    // TODO: Load subscription status
    // For now, assume free tier
    setIsPremium(false);
  }, [params.id, statusFilter]);

  async function loadApplicants() {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getOpportunityApplications(params.id, {
        page: 1,
        limit: 100,
        status: statusFilter || undefined,
      });

      setApplicants(response.applications);
    } catch (err) {
      if (err instanceof APIError) {
        const action = handleAPIError(err);
        if (action.type === 'redirect' && action.redirectTo) {
          router.push(action.redirectTo);
        } else {
          setError(action.message);
        }
      } else {
        setError('Failed to load applicants');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(applicationId: string, newStatus: string) {
    try {
      await apiClient.updateApplicationStatus(applicationId, {
        status: newStatus as any,
      });
      
      // Reload applicants
      await loadApplicants();
    } catch (err) {
      if (err instanceof APIError) {
        const action = handleAPIError(err);
        setError(action.message);
      } else {
        setError('Failed to update status');
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Applicants</h1>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="flex gap-4">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (applicants.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => router.push('/opportunities')}
            className="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Opportunities
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Applicants</h1>
          <EmptyState
            icon="document"
            title="No applications yet"
            message="No one has applied to this opportunity yet"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.push('/opportunities')}
          className="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Opportunities
        </button>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Applicants ({applicants.length})
          </h1>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
            <option value="accepted">Accepted</option>
          </select>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {applicants.map((applicant) => (
            <ApplicantCard
              key={applicant.id}
              applicant={applicant}
              onStatusUpdate={handleStatusUpdate}
              isPremium={isPremium}
            />
          ))}
        </div>

        {!isPremium && applicants.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Unlock Full Candidate Profiles
                </h3>
                <p className="text-gray-700 mb-4">
                  You're seeing anonymized candidates. Upgrade to Premium to:
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2 text-gray-700">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    View full names and contact information
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Access detailed talent profiles and work history
                  </li>
                  <li className="flex items-center gap-2 text-gray-700">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Post opportunities visible to all verified users
                  </li>
                </ul>
                <button
                  onClick={() => router.push('/subscription/plans')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Upgrade to Premium
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
