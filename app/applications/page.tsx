'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient, APIError } from '../lib/apiClient';
import { handleAPIError } from '../lib/errorHandler';
import type { ApplicationSummary } from '../types/api';
import EmptyState from '../components/EmptyState';

export default function ApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    loadApplications();
  }, [statusFilter]);

  async function loadApplications() {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getMyApplications({
        page: 1,
        limit: 100,
        status: statusFilter || undefined,
      });

      setApplications(response.applications);
    } catch (err) {
      if (err instanceof APIError) {
        const action = handleAPIError(err);
        if (action.type === 'redirect' && action.redirectTo) {
          router.push(action.redirectTo);
        } else {
          setError(action.message);
        }
      } else {
        setError('Failed to load applications');
      }
    } finally {
      setLoading(false);
    }
  }

  function getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'shortlisted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'accepted':
        return 'bg-purple-100 text-purple-800';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  if (loading) {
    return (
      <>
        <header className="nav-primary">
          <div className="nav-container">
            <a href="/" className="nav-brand">
              <div className="nav-logo">L</div>
              <div>
                <div className="nav-title">LATAP</div>
                <div className="nav-subtitle">Alumni Talent Network</div>
              </div>
            </a>
          </div>
        </header>
        
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Applications</h1>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="flex gap-4">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (applications.length === 0 && !loading) {
    return (
      <>
        <header className="nav-primary">
          <div className="nav-container">
            <a href="/" className="nav-brand">
              <div className="nav-logo">L</div>
              <div>
                <div className="nav-title">LATAP</div>
                <div className="nav-subtitle">Alumni Talent Network</div>
              </div>
            </a>
          </div>
        </header>
        
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Applications</h1>
            <EmptyState
              icon="document"
              title="No applications yet"
              message="You haven't applied to any opportunities yet"
              ctaText="Browse Opportunities"
              ctaAction={() => router.push('/opportunities')}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <header className="nav-primary">
        <div className="nav-container">
          <a href="/" className="nav-brand">
            <div className="nav-logo">L</div>
            <div>
              <div className="nav-title">LATAP</div>
              <div className="nav-subtitle">Alumni Talent Network</div>
            </div>
          </a>
        </div>
      </header>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
            <div className="flex gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="rejected">Rejected</option>
                <option value="accepted">Accepted</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {applications.map((application) => (
              <div key={application.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {application.opportunity_title}
                    </h3>
                    <p className="text-gray-600 mb-2">{application.company_name}</p>
                    <div className="flex items-center gap-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(application.status)}`}>
                        {application.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        Match: {application.match_score}%
                      </span>
                      <span className="text-sm text-gray-500">
                        Applied {new Date(application.submitted_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Link
                    href={`/applications/${application.id}`}
                    className="btn btn-secondary btn-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
