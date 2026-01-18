'use client';

import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useState } from 'react';

export default function VerificationPage() {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 300], [0, -50]);

  const verificationMethods = [
    {
      id: 'digilocker',
      title: 'DigiLocker',
      subtitle: 'Government Digital Credentials',
      description: 'Instant verification through India\'s official digital document platform',
      processingTime: 90,
      confidence: 95,
      security: 'Government-grade',
      recommended: true
    },
    {
      id: 'document',
      title: 'Document Upload',
      subtitle: 'Academic Certificate Review',
      description: 'Manual verification of official transcripts and degree certificates',
      processingTime: 300,
      confidence: 85,
      security: 'Enterprise-grade',
      recommended: false
    },
    {
      id: 'manual',
      title: 'Manual Review',
      subtitle: 'Human Verification',
      description: 'Direct verification with institution registrar or alumni office',
      processingTime: 1440,
      confidence: 98,
      security: 'Institution-direct',
      recommended: false
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3
      }
    }
  };

  const sectionVariants = {
    hidden: { y: 32, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 1440)}d`;
  };

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
        
        <motion.div 
          className="flex min-h-screen"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Context Rail */}
          <motion.div 
            className="w-80 p-8 border-r border-surface-200"
            style={{ background: 'var(--white)' }}
            variants={sectionVariants}
          >
            <div className="sticky top-24">
              <div className="mb-8">
                <div className="w-12 h-1 bg-accent-500 rounded-full mb-4"></div>
                <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                  Verification Status
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Current Level</span>
                    <span className="text-sm font-medium px-2 py-1 rounded" 
                          style={{ background: 'var(--surface-100)', color: 'var(--text-secondary)' }}>
                      Unverified
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Network Access</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Limited</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Trust Score</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>30/100</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-surface-200 pt-6">
                <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
                  Post-Verification Benefits
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-success-500"></div>
                    <span style={{ color: 'var(--text-secondary)' }}>Access to 2,500+ opportunities</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-success-500"></div>
                    <span style={{ color: 'var(--text-secondary)' }}>Direct messaging with alumni</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-success-500"></div>
                    <span style={{ color: 'var(--text-secondary)' }}>Premium matching algorithms</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-success-500"></div>
                    <span style={{ color: 'var(--text-secondary)' }}>Institution-verified profile</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Central Primary Content Spine */}
          <motion.div 
            className="flex-1 p-8"
            variants={sectionVariants}
            style={{ y: parallaxY }}
          >
            <div className="max-w-3xl">
              {/* Header */}
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent-500)' }}>
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span className="text-sm font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Identity Verification
                  </span>
                </div>
                <h1 className="text-4xl font-semibold leading-tight mb-4" style={{ color: 'var(--text-primary)' }}>
                  Establish Your Professional Identity
                </h1>
                <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Choose your verification method to unlock the full alumni network and access premium opportunities.
                </p>
              </div>

              {/* Verification Methods - Stacked Information Flow */}
              <div className="space-y-4">
                {verificationMethods.map((method, index) => (
                  <motion.div
                    key={method.id}
                    className={`relative cursor-pointer transition-all duration-300 ${
                      selectedMethod === method.id ? 'transform translate-x-2' : 'hover:translate-x-1'
                    }`}
                    onClick={() => setSelectedMethod(method.id)}
                    whileHover={{ 
                      scale: 1.005,
                      transition: { duration: 0.2 }
                    }}
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ 
                      x: 0, 
                      opacity: 1,
                      transition: { 
                        delay: index * 0.1,
                        duration: 0.5,
                        ease: [0.25, 0.46, 0.45, 0.94]
                      }
                    }}
                  >
                    <div className={`bg-white rounded-lg border-l-4 p-6 shadow-sm transition-all duration-200 ${
                      selectedMethod === method.id 
                        ? 'border-l-accent-500 shadow-lg bg-accent-50' 
                        : 'border-l-surface-300 hover:border-l-accent-300 hover:shadow-md'
                    }`}>
                      <div className="flex items-start justify-between">
                        {/* Method Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <div style={{ color: 'var(--accent-500)' }}>
                              {method.id === 'digilocker' && (
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                                </svg>
                              )}
                              {method.id === 'document' && (
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                                </svg>
                              )}
                              {method.id === 'manual' && (
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H11V21H5V3H13V9H21Z"/>
                                </svg>
                              )}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                                {method.title}
                              </h3>
                              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                                {method.subtitle}
                              </p>
                            </div>
                            {method.recommended && (
                              <span className="text-xs font-medium px-2 py-1 rounded-full" 
                                    style={{ 
                                      background: 'var(--accent-500)', 
                                      color: 'white'
                                    }}>
                                Recommended
                              </span>
                            )}
                          </div>
                          <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                            {method.description}
                          </p>
                        </div>

                        {/* Confidence Score */}
                        <div className="text-right ml-6">
                          <div className="text-3xl font-bold mb-1" style={{ color: 'var(--accent-600)' }}>
                            {method.confidence}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            TRUST SCORE
                          </div>
                        </div>
                      </div>

                      {/* Data Strip */}
                      <div className="flex items-center gap-8 pt-4 mt-4 border-t border-surface-100">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--success-500)' }}>
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                            {formatTime(method.processingTime)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--accent-500)' }}>
                            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                          </svg>
                          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                            {method.security}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            selectedMethod === method.id ? 'bg-accent-500' : 'bg-surface-300'
                          }`}></div>
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {selectedMethod === method.id ? 'SELECTED' : 'AVAILABLE'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Selection Confirmation */}
              {selectedMethod && (
                <motion.div 
                  className="mt-8 p-6 rounded-lg border-l-4 border-l-accent-500"
                  style={{ 
                    background: 'var(--accent-50)',
                    border: '1px solid var(--accent-200)'
                  }}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ 
                    opacity: 1, 
                    height: 'auto',
                    transition: { 
                      duration: 0.4,
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                        {verificationMethods.find(m => m.id === selectedMethod)?.title} Selected
                      </h4>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Processing time: {formatTime(verificationMethods.find(m => m.id === selectedMethod)?.processingTime || 0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold" style={{ color: 'var(--accent-600)' }}>
                        +{verificationMethods.find(m => m.id === selectedMethod)?.confidence}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        TRUST POINTS
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Right Insight/Action Rail */}
          <motion.div 
            className="w-96 p-8"
            style={{ background: 'var(--surface-100)' }}
            variants={sectionVariants}
          >
            <div className="sticky top-24">
              {/* Action Panel */}
              <div className="mb-8">
                <h3 className="text-sm font-medium mb-6 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Verification Action
                </h3>
                
                <motion.button
                  className={`w-full btn btn-primary py-4 text-base font-semibold ${!selectedMethod ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!selectedMethod || isSubmitting}
                  whileHover={selectedMethod ? { 
                    scale: 1.02,
                    boxShadow: "0 12px 32px rgba(59, 130, 246, 0.4)",
                    transition: { duration: 0.2 }
                  } : {}}
                  whileTap={selectedMethod ? { scale: 0.98 } : {}}
                  onClick={() => {
                    if (selectedMethod) {
                      setIsSubmitting(true);
                      setTimeout(() => {
                        if (selectedMethod === 'digilocker') {
                          window.location.href = '/verification/digilocker';
                        } else if (selectedMethod === 'document') {
                          window.location.href = '/verification/upload';
                        } else {
                          window.location.href = '/dashboard';
                        }
                      }, 600);
                    }
                  }}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Initializing...
                    </div>
                  ) : (
                    selectedMethod ? 'Begin Verification Process' : 'Select Method Above'
                  )}
                </motion.button>

                {selectedMethod && (
                  <motion.p 
                    className="text-xs mt-4 text-center"
                    style={{ color: 'var(--text-muted)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    Secure processing • Auto-deletion • GDPR compliant
                  </motion.p>
                )}
              </div>

              {/* Security Panel */}
              <div className="border border-surface-200 rounded-lg p-6" style={{ background: 'var(--white)' }}>
                <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
                  Security & Privacy
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--success-500)' }}>
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                    </svg>
                    <span style={{ color: 'var(--text-secondary)' }}>End-to-end encryption</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--success-500)' }}>
                      <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z"/>
                    </svg>
                    <span style={{ color: 'var(--text-secondary)' }}>Zero document retention</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--success-500)' }}>
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span style={{ color: 'var(--text-secondary)' }}>SOC 2 Type II compliant</span>
                  </div>
                </div>
              </div>

              {/* Stats Panel */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg" style={{ background: 'var(--white)' }}>
                  <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                    47,000+
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    VERIFIED ALUMNI
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ background: 'var(--white)' }}>
                  <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                    99.2%
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    SUCCESS RATE
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <footer className="py-8 text-center border-t border-surface-200" style={{ background: 'var(--white)' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            © 2026 Infinitra Innovations. All rights reserved.
          </p>
        </footer>
      </div>
    </ProtectedRoute>
  );
}
