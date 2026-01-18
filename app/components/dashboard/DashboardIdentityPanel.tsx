'use client';

import { motion } from 'framer-motion';
import type { MockUserProfile } from '../../../frontend/mocks/dashboard.mock';

interface DashboardIdentityPanelProps {
  userProfile: MockUserProfile;
}

export function DashboardIdentityPanel({ userProfile }: DashboardIdentityPanelProps) {
  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'var(--success-500)';
      case 'expiring': return 'var(--warning-500)';
      case 'expired': return 'var(--error-500)';
      default: return 'var(--text-muted)';
    }
  };

  const getVerificationStatusText = (status: string) => {
    switch (status) {
      case 'verified': return 'Verified & Trusted';
      case 'expiring': return 'Expiring Soon';
      case 'expired': return 'Verification Expired';
      default: return 'Pending Verification';
    }
  };

  const getCredibilityColor = (score: number) => {
    if (score >= 90) return 'var(--success-500)';
    if (score >= 70) return 'var(--accent-500)';
    if (score >= 50) return 'var(--warning-500)';
    return 'var(--error-500)';
  };

  const formatExpiryDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <motion.div 
      className="card card-floating"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{ 
        background: 'linear-gradient(135deg, var(--navy-900) 0%, var(--navy-800) 100%)',
        color: 'var(--white)'
      }}
    >
      <div className="card-body-lg">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          
          {/* User Identity */}
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
              style={{ background: 'var(--accent-600)' }}
            >
              {userProfile.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h1 className="text-xl font-semibold mb-1">{userProfile.name}</h1>
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ background: getVerificationStatusColor(userProfile.verification_status) }}
                ></div>
                <span className="text-sm font-medium">
                  {userProfile.institution}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span 
                  className="text-xs px-2 py-1 rounded-full font-medium"
                  style={{ 
                    background: `${getVerificationStatusColor(userProfile.verification_status)}20`,
                    color: getVerificationStatusColor(userProfile.verification_status)
                  }}
                >
                  {getVerificationStatusText(userProfile.verification_status)}
                </span>
              </div>
            </div>
          </div>

          {/* Credibility Score */}
          <div className="text-center">
            <div className="mb-3">
              <div className="text-sm text-gray-300 mb-2">Trust Score</div>
              <div className="relative w-20 h-20 mx-auto">
                <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={getCredibilityColor(userProfile.credibility_score)}
                    strokeWidth="2"
                    strokeDasharray={`${userProfile.credibility_score}, 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold">{userProfile.credibility_score}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Status & Actions */}
          <div className="text-right">
            {userProfile.verification_expires_at && (
              <div className="mb-3">
                <div className="text-sm text-gray-300">Verification Expires</div>
                <div className="text-sm font-medium">
                  {formatExpiryDate(userProfile.verification_expires_at)}
                </div>
              </div>
            )}
            
            {(userProfile.verification_status === 'expiring' || userProfile.verification_status === 'expired') && (
              <motion.button
                className="btn btn-accent btn-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Re-verify Now
              </motion.button>
            )}
            
            {userProfile.verification_status === 'verified' && (
              <div className="flex items-center justify-end gap-2">
                <svg className="w-5 h-5" style={{ color: 'var(--success-500)' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium" style={{ color: 'var(--success-500)' }}>
                  Fully Verified
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
