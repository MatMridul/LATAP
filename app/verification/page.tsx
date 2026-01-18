'use client';

import { useAuth } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function VerificationPage() {
  const { logout } = useAuth();
  const { user } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const magneticVariants = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const verificationMethods = [
    {
      id: 'digilocker',
      title: 'DigiLocker Verification',
      subtitle: 'Government Digital Identity',
      description: 'Instant verification through India\'s official digital document platform with government-grade security.',
      processingTime: '90 seconds',
      confidence: 95,
      security: 'Government-grade',
      recommended: true,
      route: '/verification/digilocker'
    },
    {
      id: 'document',
      title: 'Document Upload',
      subtitle: 'Academic Certificate Review',
      description: 'Upload official transcripts and degree certificates for manual verification by our expert team.',
      processingTime: '5 minutes',
      confidence: 85,
      security: 'Enterprise-grade',
      recommended: false,
      route: '/verification/upload'
    },
    {
      id: 'manual',
      title: 'Institution Verification',
      subtitle: 'Direct Alumni Office Contact',
      description: 'Direct verification with your institution\'s registrar or alumni office for maximum authenticity.',
      processingTime: '24 hours',
      confidence: 98,
      security: 'Institution-direct',
      recommended: false,
      route: '/verification/manual'
    }
  ];

  return (
    <ProtectedRoute>
      <div style={{ minHeight: '100vh', background: 'var(--surface-50)' }}>
        {/* Elite Navigation */}
        <nav className="nav-primary">
          <div className="nav-container container">
            <Link href="/" className="nav-brand">
              <div className="nav-logo">L</div>
              <div>
                <div className="nav-title">LATAP</div>
                <div className="nav-subtitle">Digital Talent Network</div>
              </div>
            </Link>
            <div className="nav-actions">
              <Link href="/dashboard" className="btn btn-ghost btn-sm">
                Dashboard
              </Link>
              <Link href="/opportunities" className="btn btn-ghost btn-sm">
                Opportunities
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

        {/* Hero Section */}
        <section className="section-lg relative overflow-hidden">
          {/* Floating background elements */}
          <motion.div
            variants={floatingVariants}
            animate="animate"
            className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-xl"
          />
          <motion.div
            variants={floatingVariants}
            animate="animate"
            style={{ animationDelay: '2s' }}
            className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-xl"
          />
          
          <div className="container relative z-10">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={isLoaded ? "visible" : "hidden"}
              style={{ 
                maxWidth: '900px', 
                margin: '0 auto', 
                textAlign: 'center',
                y: y1
              }}
            >
              <motion.div variants={itemVariants} style={{ marginBottom: '2rem' }}>
                <div style={{ 
                  marginBottom: '2rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'center'
                }}>
                  <div className="w-2 h-2 rounded-full bg-accent-500"></div>
                  Identity Verification Portal
                </div>
                
                <motion.h1 
                  style={{
                    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                    fontWeight: 'bold',
                    lineHeight: '1.1',
                    marginBottom: '1.5rem',
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.02em'
                  }}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 1.2,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                >
                  Establish Your
                  <br />
                  <span style={{ 
                    background: 'linear-gradient(135deg, var(--accent-500) 0%, var(--accent-600) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    Professional Identity
                  </span>
                </motion.h1>
                
                <motion.p 
                  style={{
                    fontSize: '1.25rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.6',
                    maxWidth: '600px',
                    margin: '0 auto 3rem'
                  }}
                >
                  Choose your verification method to unlock the full alumni network and access premium opportunities with trusted credentials.
                </motion.p>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div 
                variants={itemVariants}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '2rem',
                  marginBottom: '4rem',
                  padding: '2rem',
                  background: 'var(--white)',
                  borderRadius: '16px',
                  border: '1px solid var(--surface-200)'
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '2rem', 
                    fontWeight: 'bold', 
                    color: 'var(--accent-600)',
                    marginBottom: '0.5rem'
                  }}>
                    47,000+
                  </div>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: 'var(--text-muted)',
                    fontWeight: '500'
                  }}>
                    Verified Alumni
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '2rem', 
                    fontWeight: 'bold', 
                    color: 'var(--accent-600)',
                    marginBottom: '0.5rem'
                  }}>
                    99.2%
                  </div>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: 'var(--text-muted)',
                    fontWeight: '500'
                  }}>
                    Success Rate
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '2rem', 
                    fontWeight: 'bold', 
                    color: 'var(--accent-600)',
                    marginBottom: '0.5rem'
                  }}>
                    SOC 2
                  </div>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: 'var(--text-muted)',
                    fontWeight: '500'
                  }}>
                    Compliant
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Verification Methods Section */}
        <section className="section-lg" style={{ background: 'var(--white)', paddingTop: '6rem' }}>
          <div className="container">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              style={{ y: y2 }}
            >
              <motion.div 
                variants={itemVariants}
                style={{ 
                  textAlign: 'center', 
                  marginBottom: '4rem',
                  y: y2
                }}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.6, 
                  delay: 0.3,
                  ease: [0.4, 0, 0.2, 1]
                }}
              >
                <motion.h2 
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    color: 'var(--text-primary)',
                    marginBottom: '1rem'
                  }}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.2,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                >
                  Choose Your Verification Method
                </motion.h2>
                <motion.p 
                  style={{
                    fontSize: '1.125rem',
                    color: 'var(--text-secondary)',
                    maxWidth: '600px',
                    margin: '0 auto'
                  }}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.4,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                >
                  Select the verification approach that best suits your needs and timeline.
                </motion.p>
              </motion.div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '2rem',
                marginBottom: '2rem',
                y: y2
              }}>
                {verificationMethods.map((method, index) => (
                  <motion.div
                    key={method.id}
                    variants={itemVariants}
                    whileHover={{ 
                      scale: 1.02,
                      y: -8,
                      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
                      transition: { duration: 0.3 }
                    }}
                    initial="rest"
                    style={{
                      background: 'var(--surface-50)',
                      border: '1px solid var(--surface-200)',
                      borderRadius: '16px',
                      padding: '2rem',
                      position: 'relative',
                      cursor: 'pointer'
                    }}
                  >
                    {method.recommended && (
                      <div style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'var(--accent-500)',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        Recommended
                      </div>
                    )}

                    <div style={{ marginBottom: '1.5rem' }}>
                      <motion.h3 
                        style={{
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                          color: 'var(--text-primary)',
                          marginBottom: '0.5rem'
                        }}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ 
                          duration: 0.6, 
                          delay: index * 0.1 + 0.2,
                          ease: [0.4, 0, 0.2, 1]
                        }}
                      >
                        {method.title}
                      </motion.h3>
                      <motion.p 
                        style={{
                          fontSize: '1rem',
                          color: 'var(--text-muted)',
                          fontWeight: '500',
                          marginBottom: '1rem'
                        }}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ 
                          duration: 0.6, 
                          delay: index * 0.1 + 0.3,
                          ease: [0.4, 0, 0.2, 1]
                        }}
                      >
                        {method.subtitle}
                      </motion.p>
                      <motion.p 
                        style={{
                          fontSize: '0.875rem',
                          color: 'var(--text-secondary)',
                          lineHeight: '1.6'
                        }}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ 
                          duration: 0.6, 
                          delay: index * 0.1 + 0.4,
                          ease: [0.4, 0, 0.2, 1]
                        }}
                      >
                        {method.description}
                      </motion.p>
                    </div>

                    {/* Trust Score Display */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'var(--white)',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      marginBottom: '1.5rem'
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{
                          fontSize: '3rem',
                          fontWeight: 'bold',
                          color: 'var(--accent-600)',
                          lineHeight: '1'
                        }}>
                          {method.confidence}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                          fontWeight: '600',
                          letterSpacing: '0.05em'
                        }}>
                          TRUST SCORE
                        </div>
                      </div>
                    </div>

                    {/* Method Details */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '1rem',
                      marginBottom: '2rem',
                      fontSize: '0.875rem'
                    }}>
                      <div>
                        <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                          Processing Time
                        </div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                          {method.processingTime}
                        </div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                          Security Level
                        </div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                          {method.security}
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <motion.button
                      variants={magneticVariants}
                      className="btn btn-primary"
                      style={{
                        width: '100%',
                        padding: '1rem 2rem',
                        fontSize: '1rem',
                        fontWeight: '600'
                      }}
                      onClick={() => {
                        window.location.href = method.route;
                      }}
                    >
                      Start {method.title.split(' ')[0]} Process
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Security & Privacy Section */}
        <section className="section-lg" style={{ background: 'var(--surface-50)' }}>
          <div className="container">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              style={{
                maxWidth: '800px',
                margin: '0 auto',
                textAlign: 'center'
              }}
            >
              <motion.div variants={itemVariants}>
                <motion.h2 
                  style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: 'var(--text-primary)',
                    marginBottom: '1rem'
                  }}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.2,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                >
                  Enterprise-Grade Security
                </motion.h2>
                <motion.p 
                  style={{
                    fontSize: '1.125rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '3rem'
                  }}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.4,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                >
                  Your data is protected with the highest security standards in the industry.
                </motion.p>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '2rem'
                }}
              >
                <motion.div 
                  style={{
                    background: 'var(--white)',
                    padding: '2rem',
                    borderRadius: '12px',
                    border: '1px solid var(--surface-200)'
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    y: -8,
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
                    transition: { duration: 0.3 }
                  }}
                >
                  <motion.h3 
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      marginBottom: '0.5rem'
                    }}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 0.2,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                  >
                    End-to-End Encryption
                  </motion.h3>
                  <motion.p 
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)'
                    }}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 0.3,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                  >
                    All data transmitted and stored with military-grade encryption protocols.
                  </motion.p>
                </motion.div>

                <motion.div 
                  style={{
                    background: 'var(--white)',
                    padding: '2rem',
                    borderRadius: '12px',
                    border: '1px solid var(--surface-200)'
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    y: -8,
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
                    transition: { duration: 0.3 }
                  }}
                >
                  <motion.h3 
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      marginBottom: '0.5rem'
                    }}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 0.4,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                  >
                    Zero Document Retention
                  </motion.h3>
                  <motion.p 
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)'
                    }}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 0.5,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                  >
                    Documents are processed and immediately deleted from our systems.
                  </motion.p>
                </motion.div>

                <motion.div 
                  style={{
                    background: 'var(--white)',
                    padding: '2rem',
                    borderRadius: '12px',
                    border: '1px solid var(--surface-200)'
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    y: -8,
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
                    transition: { duration: 0.3 }
                  }}
                >
                  <motion.h3 
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      marginBottom: '0.5rem'
                    }}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 0.6,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                  >
                    SOC 2 Compliance
                  </motion.h3>
                  <motion.p 
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)'
                    }}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 0.7,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                  >
                    Independently audited and certified for enterprise security standards.
                  </motion.p>
                </motion.div>

                <motion.div 
                  style={{
                    background: 'var(--white)',
                    padding: '2rem',
                    borderRadius: '12px',
                    border: '1px solid var(--surface-200)'
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    y: -8,
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
                    transition: { duration: 0.3 }
                  }}
                >
                  <motion.h3 
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      marginBottom: '0.5rem'
                    }}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 0.8,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                  >
                    Rapid Verification
                  </motion.h3>
                  <motion.p 
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)'
                    }}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 0.9,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                  >
                    Lightning-fast processing with results delivered in under 90 seconds.
                  </motion.p>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>

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
    </ProtectedRoute>
  );
}
