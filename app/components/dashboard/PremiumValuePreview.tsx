'use client';

import { motion } from 'framer-motion';
import { mockPremiumInsights } from '../../../frontend/mocks/dashboard.mock';

export function PremiumValuePreview() {
  return (
    <motion.div 
      className="card card-elevated"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      style={{ 
        background: 'linear-gradient(135deg, var(--accent-50) 0%, var(--surface-50) 100%)',
        border: '1px solid var(--accent-200)'
      }}
    >
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-primary">Premium Insights</h2>
          <div 
            className="text-xs px-2 py-1 rounded-full font-medium"
            style={{ 
              background: 'var(--accent-600)',
              color: 'var(--white)'
            }}
          >
            PREMIUM
          </div>
        </div>

        <div className="space-y-4">
          {/* Top Matches Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="relative p-4 rounded-lg border border-accent-200 bg-white overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm text-primary">
                  {mockPremiumInsights.top_matches.preview_title}
                </h3>
                <svg className="w-4 h-4 text-accent-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-accent-600 mb-1">
                {mockPremiumInsights.top_matches.count}
              </div>
              <p className="text-xs text-muted">
                Perfect matches waiting for you
              </p>
            </div>
            
            {/* Blur overlay */}
            <div 
              className="absolute inset-0 backdrop-blur-sm"
              style={{ background: 'rgba(255, 255, 255, 0.7)' }}
            ></div>
          </motion.div>

          {/* Recruiter Interest Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="relative p-4 rounded-lg border border-accent-200 bg-white overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-sm text-primary">
                  {mockPremiumInsights.recruiter_interest.preview_title}
                </h3>
                <svg className="w-4 h-4 text-accent-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <div className="text-2xl font-bold text-accent-600">
                  {mockPremiumInsights.recruiter_interest.score}
                </div>
                <div className="text-sm text-success-600 font-medium">
                  High Interest
                </div>
              </div>
              <p className="text-xs text-muted">
                Recruiters are actively viewing your profile
              </p>
            </div>
            
            {/* Blur overlay */}
            <div 
              className="absolute inset-0 backdrop-blur-sm"
              style={{ background: 'rgba(255, 255, 255, 0.7)' }}
            ></div>
          </motion.div>
        </div>

        {/* Upgrade CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-6 pt-4 border-t border-accent-200"
        >
          <div className="text-center">
            <h4 className="font-semibold text-sm text-primary mb-2">
              Unlock Premium Insights
            </h4>
            <p className="text-xs text-muted mb-4">
              Get detailed analytics, priority matching, and recruiter visibility
            </p>
            <motion.button
              className="btn btn-accent w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Upgrade to Premium
            </motion.button>
          </div>
        </motion.div>

        {/* Trust indicators */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted">
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Verified Only</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
