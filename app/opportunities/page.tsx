'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, APIError } from '../lib/apiClient';
import { handleAPIError } from '../lib/errorHandler';
import type { OpportunityCard } from '../types/api';
import { ProtectedRoute } from '../components/VerificationGate';
import OpportunityCardComponent from '../components/OpportunityCard';
import OpportunityFeedSkeleton from '../components/OpportunityFeedSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';

export default function OpportunitiesPage() {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<OpportunityCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorAction, setErrorAction] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    loadOpportunities();
  }, [page]);

  async function loadOpportunities() {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.getOpportunityFeed({
        page,
        limit: 20,
      });

      setOpportunities(response.opportunities);
      setTotal(response.total);
      setHasMore(response.has_more);
    } catch (err) {
      if (err instanceof APIError) {
        const action = handleAPIError(err);
        setErrorAction(action);
        
        if (action.type === 'redirect' && action.redirectTo) {
          router.push(action.redirectTo);
        } else {
          setError(action.message);
        }
      } else {
        setError('Network error. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading && opportunities.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Opportunities
          </h1>
          <OpportunityFeedSkeleton count={20} />
        </div>
      </div>
    );
  }

  if (error && errorAction?.type === 'banner') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorBanner
            message={error}
            ctaText={errorAction.ctaText}
            ctaAction={errorAction.ctaAction}
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-8 mt-4">
            Opportunities
          </h1>
          {opportunities.length > 0 && (
            <div className="space-y-4">
              {opportunities.map((opp) => (
                <OpportunityCardComponent key={opp.id} opportunity={opp} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (opportunities.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Opportunities
          </h1>
          <EmptyState
            icon="briefcase"
            title="No opportunities available"
            message="Check back soon or adjust your filters"
          />
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
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
          {error && errorAction?.type === 'banner' && (
            <ErrorBanner
              message={error}
              ctaText={errorAction.ctaText}
              ctaAction={errorAction.ctaAction}
            />
          )}
          
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Opportunities
            </h1>
            <p className="text-sm text-gray-600">
              {total} {total === 1 ? 'opportunity' : 'opportunities'} found
            </p>
          </div>

          <div className="space-y-4">
            {opportunities.map((opp) => (
              <OpportunityCardComponent key={opp.id} opportunity={opp} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setPage(page + 1)}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 py-8 text-center">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            © 2026 Infinitra Innovations. All rights reserved.
          </p>
        </footer>
      </div>
    </ProtectedRoute>
  );
}
