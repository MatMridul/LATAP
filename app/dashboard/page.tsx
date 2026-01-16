'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient, APIError } from '../lib/apiClient';
import { handleAPIError } from '../lib/errorHandler';
import type { MyOpportunitiesResponse } from '../types/api';
import EmptyState from '../components/EmptyState';

export default function DashboardPage() {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOpportunities();
  }, []);

  async function loadOpportunities() {
    try {
      setLoading(true);
      setError(null);

      // Using the my-posts endpoint from API contracts
      const response = await apiClient.request<MyOpportunitiesResponse>(
        'GET',
        '/api/opportunities/my-posts?page=1&limit=100'
      );

      setOpportunities(response.opportunities);
    } catch (err) {
      if (err instanceof APIError) {
        const action = handleAPIError(err);
        if (action.type === 'redirect' && action.redirectTo) {
          router.push(action.redirectTo);
        } else {
          setError(action.message);
        }
      } else {
        setError('Failed to load opportunities');
      }
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status: string): string {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600';
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Opportunities</h1>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="flex gap-4">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (opportunities.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Opportunities</h1>
          <EmptyState
            icon="briefcase"
            title="No opportunities posted yet"
            message="Create your first opportunity to start receiving applications"
            ctaText="Create Opportunity"
            ctaAction={() => router.push('/opportunities/create')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Opportunities</h1>
          <button
            onClick={() => router.push('/opportunities/create')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Create Opportunity
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {opp.title}
                </h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    opp.status
                  )}`}
                >
                  {opp.status.toUpperCase()}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4">{opp.company_name}</p>

              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-gray-600">
                  {opp.application_count} {opp.application_count === 1 ? 'applicant' : 'applicants'}
                </span>
                <span className="text-gray-600">
                  {opp.visibility === 'all_verified' && (
                    <span className="text-purple-600 font-medium">Premium</span>
                  )}
                </span>
              </div>

              <div className="text-xs text-gray-500 mb-4">
                Expires {new Date(opp.expires_at).toLocaleDateString()}
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/opportunities/${opp.id}`}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-center text-sm font-medium"
                >
                  View
                </Link>
                <Link
                  href={`/opportunities/${opp.id}/applications`}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center text-sm font-medium"
                >
                  Applicants
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
