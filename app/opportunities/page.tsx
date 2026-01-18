'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient, APIError } from '../lib/apiClient';
import { handleAPIError } from '../lib/errorHandler';
import type { OpportunityCard } from '../types/api';
import { useAuth } from '../contexts/AuthContext';
import OpportunityCardComponent from '../components/OpportunityCard';
import OpportunityFeedSkeleton from '../components/OpportunityFeedSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';

export default function OpportunitiesPage() {
  const router = useRouter();
  const { logout } = useAuth();
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
      <div style={{ minHeight: '100vh', background: 'var(--surface-50)' }}>
        {/* Navigation */}
        <nav className="nav-primary">
          <div className="nav-container">
            <Link href="/" className="nav-brand">
              <div className="nav-logo">L</div>
              <div>
                <div className="nav-title">LATAP</div>
                <div className="nav-subtitle">Opportunities</div>
              </div>
            </Link>
            <div className="nav-actions">
              <Link href="/dashboard" className="btn btn-ghost btn-sm">
                Dashboard
              </Link>
              <button 
                onClick={logout}
                className="btn btn-ghost btn-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </nav>

        <div className="container" style={{ padding: '2rem 1rem' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: 'var(--text-primary)', 
            marginBottom: '2rem' 
          }}>
            Opportunities
          </h1>
          <OpportunityFeedSkeleton count={20} />
        </div>
      </div>
    );
  }

  if (error && errorAction?.type === 'banner') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--surface-50)' }}>
        {/* Navigation */}
        <nav className="nav-primary">
          <div className="nav-container">
            <Link href="/" className="nav-brand">
              <div className="nav-logo">L</div>
              <div>
                <div className="nav-title">LATAP</div>
                <div className="nav-subtitle">Opportunities</div>
              </div>
            </Link>
            <div className="nav-actions">
              <Link href="/dashboard" className="btn btn-ghost btn-sm">
                Dashboard
              </Link>
              <button 
                onClick={logout}
                className="btn btn-ghost btn-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </nav>

        <div className="container" style={{ padding: '2rem 1rem' }}>
          <ErrorBanner
            message={error}
            ctaText={errorAction.ctaText}
            ctaAction={errorAction.ctaAction}
          />
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: 'var(--text-primary)', 
            marginBottom: '2rem',
            marginTop: '1rem'
          }}>
            Opportunities
          </h1>
          {opportunities.length > 0 && (
            <div style={{ display: 'grid', gap: '1rem' }}>
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
      <div style={{ minHeight: '100vh', background: 'var(--surface-50)' }}>
        {/* Navigation */}
        <nav className="nav-primary">
          <div className="nav-container">
            <Link href="/" className="nav-brand">
              <div className="nav-logo">L</div>
              <div>
                <div className="nav-title">LATAP</div>
                <div className="nav-subtitle">Opportunities</div>
              </div>
            </Link>
            <div className="nav-actions">
              <Link href="/dashboard" className="btn btn-ghost btn-sm">
                Dashboard
              </Link>
              <button 
                onClick={logout}
                className="btn btn-ghost btn-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </nav>

        <div className="container" style={{ padding: '2rem 1rem' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: 'var(--text-primary)', 
            marginBottom: '2rem' 
          }}>
            Opportunities
          </h1>
          <EmptyState
            icon="briefcase"
            title="No opportunities available"
            message="Check back later for new opportunities or create your own."
            ctaText="Create Opportunity"
            ctaAction={() => router.push('/opportunities/create')}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-50)' }}>
      {/* Navigation */}
      <nav className="nav-primary">
        <div className="nav-container">
          <Link href="/" className="nav-brand">
            <div className="nav-logo">L</div>
            <div>
              <div className="nav-title">LATAP</div>
              <div className="nav-subtitle">Opportunities</div>
            </div>
          </Link>
          <div className="nav-actions">
            <Link href="/dashboard" className="btn btn-ghost btn-sm">
              Dashboard
            </Link>
            <button 
              onClick={logout}
              className="btn btn-ghost btn-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>
      
      <div className="container" style={{ padding: '2rem 1rem' }}>
        {error && errorAction?.type === 'banner' && (
          <ErrorBanner
            message={error}
            ctaText={errorAction.ctaText}
            ctaAction={errorAction.ctaAction}
          />
        )}
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem' 
        }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: 'var(--text-primary)' 
          }}>
            Opportunities
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <p style={{ 
              fontSize: '0.875rem', 
              color: 'var(--text-muted)' 
            }}>
              {total} {total === 1 ? 'opportunity' : 'opportunities'} found
            </p>
            <Link href="/opportunities/create" className="btn btn-primary">
              Create Opportunity
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          {opportunities.map((opp) => (
            <OpportunityCardComponent key={opp.id} opportunity={opp} />
          ))}
        </div>

        {hasMore && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button
              onClick={() => setPage(prev => prev + 1)}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{
        padding: '2rem 0',
        textAlign: 'center',
        borderTop: '1px solid var(--surface-200)',
        background: 'var(--white)'
      }}>
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-muted)'
        }}>
          © 2026 Infinitra Innovations. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
