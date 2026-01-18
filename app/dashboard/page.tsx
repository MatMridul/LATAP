'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '../components/VerificationGate';
import { DashboardIdentityPanel } from '../components/dashboard/DashboardIdentityPanel';
import { QuickActions } from '../components/dashboard/QuickActions';
import { OpportunityInsights } from '../components/dashboard/OpportunityInsights';
import { TrustActivityFeed } from '../components/dashboard/TrustActivityFeed';
import { PremiumValuePreview } from '../components/dashboard/PremiumValuePreview';
import { mockUserProfile } from '../../frontend/mocks/dashboard.mock';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading real user data
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen" style={{ background: 'var(--surface-50)' }}>
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
          
          <div className="container section">
            <div className="grid gap-6">
              <div className="card card-elevated animate-pulse">
                <div className="card-body-lg">
                  <div style={{ height: '120px', background: 'var(--surface-100)', borderRadius: 'var(--radius-md)' }}></div>
                </div>
              </div>
              <div className="grid grid-2">
                <div className="card card-elevated animate-pulse">
                  <div className="card-body">
                    <div style={{ height: '200px', background: 'var(--surface-100)', borderRadius: 'var(--radius-md)' }}></div>
                  </div>
                </div>
                <div className="card card-elevated animate-pulse">
                  <div className="card-body">
                    <div style={{ height: '200px', background: 'var(--surface-100)', borderRadius: 'var(--radius-md)' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ background: 'var(--surface-50)' }}>
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

        <div className="container section">
          <div className="grid gap-6">
            {/* Identity Panel - Top Priority */}
            <DashboardIdentityPanel userProfile={mockUserProfile} />

            {/* Quick Actions */}
            <QuickActions />

            {/* Main Content Grid */}
            <div className="grid grid-2 gap-6">
              {/* Left Column */}
              <div className="grid gap-6">
                <OpportunityInsights />
                <TrustActivityFeed />
              </div>

              {/* Right Column */}
              <div className="grid gap-6">
                <PremiumValuePreview />
              </div>
            </div>
          </div>
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
