'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  mockInstitutionOpportunities, 
  mockApplicationStatuses 
} from '../../../frontend/mocks/dashboard.mock';

export function OpportunityInsights() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'shortlisted': return 'var(--success-500)';
      case 'submitted': return 'var(--accent-500)';
      case 'rejected': return 'var(--error-500)';
      case 'accepted': return 'var(--success-600)';
      default: return 'var(--text-muted)';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'shortlisted': return 'var(--success-50)';
      case 'submitted': return 'var(--accent-50)';
      case 'rejected': return 'var(--error-50)';
      case 'accepted': return 'var(--success-50)';
      default: return 'var(--surface-100)';
    }
  };

  const applicationSummary = mockApplicationStatuses.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <motion.div 
      className="card card-elevated"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-primary">Opportunity Insights</h2>
          <Link href="/opportunities" className="text-sm text-accent-600 hover:text-accent-700">
            View All
          </Link>
        </div>

        {/* Institution Opportunities */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-secondary mb-3">From Your Institution</h3>
          <div className="space-y-3">
            {mockInstitutionOpportunities.map((opportunity, index) => (
              <motion.div
                key={opportunity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + (index * 0.1) }}
                className="flex items-center justify-between p-3 rounded-lg border border-surface-200 hover:bg-surface-50 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-primary">{opportunity.title}</h4>
                  <p className="text-xs text-muted">{opportunity.company_name}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-accent-600">
                    {opportunity.applications_count} apps
                  </div>
                  <div className="text-xs text-muted">
                    {new Date(opportunity.posted_date).toLocaleDateString()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Application Status Summary */}
        <div>
          <h3 className="text-sm font-medium text-secondary mb-3">My Application Status</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(applicationSummary).map(([status, count], index) => (
              <motion.div
                key={status}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 + (index * 0.1) }}
                className="p-3 rounded-lg text-center"
                style={{ 
                  background: getStatusBg(status),
                  border: `1px solid ${getStatusColor(status)}20`
                }}
              >
                <div 
                  className="text-lg font-bold mb-1"
                  style={{ color: getStatusColor(status) }}
                >
                  {count}
                </div>
                <div className="text-xs font-medium capitalize text-secondary">
                  {status}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
