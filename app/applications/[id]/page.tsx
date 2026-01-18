'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, APIError } from '../../lib/apiClient';
import { handleAPIError } from '../../lib/errorHandler';
import type { ApplicationDetail } from '../../types/api';

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    loadApplication();
  }, [id]);

  async function loadApplication() {
    try {
      setLoading(true);
      const response = await apiClient.getApplicationDetail(id);
      setApplication(response.application);
    } catch (err) {
      if (err instanceof APIError) {
        const action = handleAPIError(err);
        if (action.type === 'redirect' && action.redirectTo) {
          router.push(action.redirectTo);
        } else {
          setError(action.message);
        }
      } else {
        setError('Failed to load application');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleWithdraw() {
    if (!application) return;

    try {
      setWithdrawing(true);
      await apiClient.withdrawApplication(id);
      
      // Reload application to show updated status
      await loadApplication();
      setShowWithdrawConfirm(false);
    } catch (err) {
      if (err instanceof APIError) {
        const action = handleAPIError(err);
        setError(action.message);
      } else {
        setError('Failed to withdraw application');
      }
    } finally {
      setWithdrawing(false);
    }
  }

  function canWithdraw(): boolean {
    if (!application) return false;
    return ['pending', 'reviewed'].includes(application.status);
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'shortlisted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'withdrawn':
        return 'bg-gray-100 text-gray-600';
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
      </>
    );
  }

  if (error || !application) {
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
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <p className="text-red-600">{error || 'Application not found'}</p>
              <button
                onClick={() => router.push('/applications')}
                className="mt-4 text-blue-600 hover:text-blue-700"
              >
                Back to Applications
              </button>
            </div>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => router.push('/applications')}
            className="mb-4 text-blue-600 hover:text-blue-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Applications
          </button>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {application.opportunity_title}
                </h1>
                <p className="text-xl text-gray-600">{application.company_name}</p>
                <p className="text-gray-600">{application.institution_name}</p>
              </div>
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                  application.status
                )}`}
              >
                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
              </span>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-blue-600 mb-1">
                  {application.match_score}%
                </div>
                <div className="text-sm text-gray-600">Match Score</div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Skills Match</span>
                  <span className="font-semibold text-gray-900">
                    {application.match_breakdown.skills_score}/40
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Experience Match</span>
                  <span className="font-semibold text-gray-900">
                    {application.match_breakdown.experience_score}/25
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Education Match</span>
                  <span className="font-semibold text-gray-900">
                    {application.match_breakdown.education_score}/15
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Location Match</span>
                  <span className="font-semibold text-gray-900">
                    {application.match_breakdown.location_score}/10
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Job Type Match</span>
                  <span className="font-semibold text-gray-900">
                    {application.match_breakdown.job_type_score}/10
                  </span>
                </div>
              </div>
            </div>

            {application.cover_letter && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-3">Cover Letter</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{application.cover_letter}</p>
              </div>
            )}

            <div className="border-t pt-6 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Submitted:</span>
                  <span className="ml-2 font-medium">
                    {new Date(application.submitted_at).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="ml-2 font-medium">
                    {new Date(application.status_updated_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => router.push(`/opportunities/${application.opportunity_id}`)}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                View Opportunity
              </button>
              {canWithdraw() && (
                <button
                  onClick={() => setShowWithdrawConfirm(true)}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  Withdraw Application
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showWithdrawConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Withdraw Application?
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to withdraw your application? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleWithdraw}
                disabled={withdrawing}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
              >
                {withdrawing ? 'Withdrawing...' : 'Yes, Withdraw'}
              </button>
              <button
                onClick={() => setShowWithdrawConfirm(false)}
                disabled={withdrawing}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
