'use client';

import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useState } from 'react';

export default function VerificationPage() {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { scrollY } = useScroll();
  const headerY = useTransform(scrollY, [0, 200], [0, -20]);

  const verificationMethods = [
    {
      id: 'digilocker',
      title: 'DigiLocker Integration',
      description: 'Government-issued digital credentials with instant verification',
      processingTime: '< 2 minutes',
      trustLevel: 'Highest',
      confidence: 95,
      recommended: true,
      icon: '🔐'
    },
    {
      id: 'document',
      title: 'Document Verification',
      description: 'Upload official transcripts or degree certificates for review',
      processingTime: '2-5 minutes',
      trustLevel: 'High',
      confidence: 85,
      recommended: false,
      icon: '📄'
    },
    {
      id: 'skip',
      title: 'Continue Unverified',
      description: 'Access basic features with limited networking capabilities',
      processingTime: 'Immediate',
      trustLevel: 'Basic',
      confidence: 30,
      recommended: false,
      icon: '⏭️'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2
      }
    }
  };

  const sectionVariants = {
    hidden: { y: 24, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
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
          className="container section"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Asymmetric Header Layout */}
          <motion.div 
            className="grid grid-cols-12 gap-8 mb-12"
            variants={sectionVariants}
            style={{ y: headerY }}
          >
            {/* Dominant Information Column */}
            <div className="col-span-8">
              <div className="mb-6">
                <div className="inline-flex items-center gap-3 mb-4">
                  <div className="w-2 h-8 bg-accent-500 rounded-full"></div>
                  <span className="text-sm font-medium uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                    Identity Verification
                  </span>
                </div>
                <h1 className="text-4xl font-semibold leading-tight mb-4" style={{ color: 'var(--text-primary)' }}>
                  Establish Your Alumni Identity
                </h1>
                <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Join the verified network of professionals. Your verification status determines 
                  access to opportunities, networking capabilities, and platform trust level.
                </p>
              </div>
            </div>

            {/* Contextual Insight Rail */}
            <div className="col-span-4">
              <div className="bg-white rounded-lg border border-surface-200 p-6">
                <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--text-muted)' }}>
                  Verification Impact
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Network Access</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--accent-600)' }}>+300%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Opportunity Visibility</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--accent-600)' }}>+250%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Profile Trust Score</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--accent-600)' }}>+400%</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Method Selection - Vertical Timeline Layout */}
          <motion.div 
            className="max-w-4xl"
            variants={sectionVariants}
          >
            <div className="relative">
              {/* Vertical Timeline Spine */}
              <div className="absolute left-8 top-0 bottom-0 w-px bg-surface-200"></div>
              
              <div className="space-y-6">
                {verificationMethods.map((method, index) => (
                  <motion.div
                    key={method.id}
                    className={`relative cursor-pointer transition-all duration-300 ${
                      selectedMethod === method.id 
                        ? 'transform translate-x-2' 
                        : 'hover:translate-x-1'
                    }`}
                    onClick={() => setSelectedMethod(method.id)}
                    whileHover={{ 
                      scale: 1.01,
                      transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }
                    }}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ 
                      x: 0, 
                      opacity: 1,
                      transition: { 
                        delay: index * 0.1,
                        duration: 0.4,
                        ease: [0.25, 0.46, 0.45, 0.94]
                      }
                    }}
                  >
                    {/* Timeline Node */}
                    <div className={`absolute left-6 top-6 w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                      selectedMethod === method.id 
                        ? 'bg-accent-500 border-accent-500 shadow-lg shadow-accent-500/30' 
                        : 'bg-white border-surface-300'
                    }`}></div>

                    {/* Method Card */}
                    <div className={`ml-16 bg-white rounded-lg border transition-all duration-200 ${
                      selectedMethod === method.id 
                        ? 'border-accent-500 shadow-lg shadow-accent-500/10' 
                        : 'border-surface-200 hover:border-surface-300 hover:shadow-md'
                    }`}>
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="text-2xl">{method.icon}</div>
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                                  {method.title}
                                </h3>
                                {method.recommended && (
                                  <span className="text-xs font-medium px-2 py-1 rounded-full" 
                                        style={{ 
                                          background: 'var(--accent-100)', 
                                          color: 'var(--accent-700)' 
                                        }}>
                                    Recommended
                                  </span>
                                )}
                              </div>
                              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                {method.description}
                              </p>
                            </div>
                          </div>

                          {/* Confidence Meter */}
                          <div className="text-right">
                            <div className="text-2xl font-bold mb-1" style={{ color: 'var(--accent-600)' }}>
                              {method.confidence}%
                            </div>
                            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              Trust Level
                            </div>
                          </div>
                        </div>

                        {/* Data Strip */}
                        <div className="flex items-center gap-8 pt-4 border-t border-surface-100">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-success-500"></div>
                            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                              {method.processingTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-accent-500"></div>
                            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                              {method.trustLevel} Security
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Action Rail - Magnetic CTA */}
          <motion.div 
            className="mt-12 flex items-center justify-between max-w-4xl"
            variants={sectionVariants}
          >
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Bank-grade encryption</span>
              </div>
              <div>Documents automatically deleted after processing</div>
            </div>
            
            <motion.button
              className={`btn btn-primary px-8 py-3 ${!selectedMethod ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!selectedMethod || isSubmitting}
              whileHover={selectedMethod ? { 
                scale: 1.02,
                boxShadow: "0 8px 25px rgba(59, 130, 246, 0.3)",
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
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing
                </div>
              ) : (
                'Begin Verification'
              )}
            </motion.button>
          </motion.div>

          {/* Progressive Status Reveal */}
          {selectedMethod && (
            <motion.div 
              className="mt-8 p-6 rounded-lg max-w-4xl"
              style={{ 
                background: 'linear-gradient(135deg, var(--accent-50) 0%, var(--surface-50) 100%)',
                border: '1px solid var(--accent-200)'
              }}
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                height: 'auto',
                transition: { 
                  duration: 0.4,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    {verificationMethods.find(m => m.id === selectedMethod)?.title} Selected
                  </h4>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Estimated completion: {verificationMethods.find(m => m.id === selectedMethod)?.processingTime}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold" style={{ color: 'var(--accent-600)' }}>
                    {verificationMethods.find(m => m.id === selectedMethod)?.confidence}%
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Trust Boost
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Footer */}
          <footer className="mt-16 py-8 text-center">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              © 2026 Infinitra Innovations. All rights reserved.
            </p>
          </footer>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}
