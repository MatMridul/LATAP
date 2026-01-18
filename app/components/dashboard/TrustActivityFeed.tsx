'use client';

import { motion } from 'framer-motion';
import { mockActivityFeed } from '../../../frontend/mocks/dashboard.mock';

export function TrustActivityFeed() {
  const getIcon = (iconName: string, type: string) => {
    const getIconColor = () => {
      switch (type) {
        case 'verification': return 'var(--success-500)';
        case 'application': return 'var(--accent-500)';
        case 'opportunity': return 'var(--navy-600)';
        default: return 'var(--text-muted)';
      }
    };

    const icons = {
      'shield-check': (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      'document-text': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      'users': (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    };

    return (
      <div 
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ 
          background: `${getIconColor()}20`,
          color: getIconColor()
        }}
      >
        {icons[iconName as keyof typeof icons] || icons['document-text']}
      </div>
    );
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return time.toLocaleDateString();
  };

  return (
    <motion.div 
      className="card card-elevated"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-primary">Trust & Activity</h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success-500"></div>
            <span className="text-xs text-muted">Live</span>
          </div>
        </div>

        <div className="space-y-4">
          {mockActivityFeed.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + (index * 0.1) }}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-50 transition-colors"
            >
              {getIcon(item.icon, item.type)}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-primary mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-muted mb-2 leading-relaxed">
                  {item.description}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-subtle">
                    {formatTimeAgo(item.timestamp)}
                  </span>
                  {item.type === 'verification' && (
                    <span 
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ 
                        background: 'var(--success-50)',
                        color: 'var(--success-600)'
                      }}
                    >
                      Trusted
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-surface-200">
          <button className="w-full text-sm text-accent-600 hover:text-accent-700 font-medium">
            View All Activity
          </button>
        </div>
      </div>
    </motion.div>
  );
}
