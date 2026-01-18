'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      title: 'Post Opportunity',
      description: 'Share a new position',
      icon: 'plus-circle',
      href: '/opportunities/create',
      primary: true,
      requiresVerification: true
    },
    {
      title: 'Browse Opportunities',
      description: 'Find your next role',
      icon: 'search',
      href: '/opportunities',
      primary: false,
      requiresVerification: false
    },
    {
      title: 'My Applications',
      description: 'Track your progress',
      icon: 'document-text',
      href: '/applications',
      primary: false,
      requiresVerification: false
    },
    {
      title: 'My Opportunities',
      description: 'Manage your posts',
      icon: 'briefcase',
      href: '/opportunities/my-posts',
      primary: false,
      requiresVerification: true
    }
  ];

  const getIcon = (iconName: string) => {
    const icons = {
      'plus-circle': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      'search': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      'document-text': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      'briefcase': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
        </svg>
      )
    };
    return icons[iconName as keyof typeof icons] || null;
  };

  return (
    <motion.div 
      className="card card-elevated"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      <div className="card-body">
        <h2 className="text-lg font-semibold text-primary mb-4">Quick Actions</h2>
        <div className="grid grid-4 gap-4">
          {actions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + (index * 0.1) }}
            >
              <Link
                href={action.href}
                className={`block p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                  action.primary 
                    ? 'border-accent-200 bg-accent-50 hover:bg-accent-100' 
                    : 'border-surface-200 bg-white hover:bg-surface-50'
                }`}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div 
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      action.primary 
                        ? 'bg-accent-600 text-white' 
                        : 'bg-surface-100 text-navy-600'
                    }`}
                  >
                    {getIcon(action.icon)}
                  </div>
                  <div>
                    <h3 className={`font-medium text-sm mb-1 ${
                      action.primary ? 'text-accent-700' : 'text-primary'
                    }`}>
                      {action.title}
                    </h3>
                    <p className="text-xs text-muted">{action.description}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
