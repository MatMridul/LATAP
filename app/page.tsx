'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { useAuth } from './contexts/AuthContext'

// Premium animation variants
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
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12
    }
  }
};

const magneticVariants = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: {
      type: "spring" as const,
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
      ease: "easeInOut" as const
    }
  }
};

// Typewriter component
const TypewriterText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentIndex < text.length) {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }
    }, delay + currentIndex * 0.000000000000000000001);

    return () => clearTimeout(timer);
  }, [currentIndex, text, delay]);

  return (
    <span>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
        className="inline-block w-0.5 h-8 bg-primary ml-1"
      />
    </span>
  );
};

export default function Home() {
  const { user, logout } = useAuth()
  const [isLoaded, setIsLoaded] = useState(false)
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, -50])
  const y2 = useTransform(scrollY, [0, 300], [0, -100])

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  }

  return (
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
            <Link href="/about" className="btn btn-ghost btn-sm">
              About Platform
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="btn btn-ghost btn-sm">
                  Dashboard
                </Link>
                <button onClick={logout} className="btn btn-primary btn-sm">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost btn-sm">
                  Sign In
                </Link>
                <Link href="/signup" className="btn btn-primary btn-sm">
                  Get Started
                </Link>
              </>
            )}
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
                <img 
                  src="/indian-flag.svg" 
                  alt="Indian Flag" 
                  style={{ width: '20px', height: '13px' }}
                />
                Digital India Platform
              </div>
            </motion.div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-4xl font-bold text-primary" 
              style={{ 
                marginBottom: '1.5rem',
                lineHeight: '1.1',
                letterSpacing: '-0.025em'
              }}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.6, 
                delay: 1.2,
                ease: [0.4, 0, 0.2, 1]
              }}
            >
              Enterprise-Grade Talent Verification
            </motion.h1>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl text-secondary" 
              style={{ 
                marginBottom: '3rem',
                maxWidth: '600px',
                margin: '0 auto 3rem'
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
              Connect verified professionals through India's Digital Public Infrastructure. 
              Build trust with institutional verification and digital credential systems.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              style={{ 
                display: 'flex', 
                gap: '1rem', 
                justifyContent: 'center', 
                flexWrap: 'wrap',
                marginBottom: '4rem'
              }}
            >
              <motion.div
                variants={magneticVariants}
                initial="rest"
                whileHover="hover"
                whileTap={{ scale: 0.95 }}
              >
                {user ? (
                  <Link href="/dashboard" className="btn btn-primary btn-lg">
                    Go to Dashboard
                  </Link>
                ) : (
                  <Link href="/signup" className="btn btn-primary btn-lg">
                    Sign Up
                  </Link>
                )}
              </motion.div>
              <motion.div
                variants={magneticVariants}
                initial="rest"
                whileHover="hover"
                whileTap={{ scale: 0.95 }}
              >
                {!user && (
                  <Link href="/login" className="btn btn-secondary btn-lg">
                    Login
                  </Link>
                )}
              </motion.div>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              style={{ 
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gridTemplateRows: '1fr 1fr',
                gap: '2rem',
                maxWidth: '500px', 
                margin: '0 auto'
              }}
            >
              <motion.div 
                style={{ textAlign: 'center' }}
                whileHover={{ 
                  y: -5, 
                  scale: 1.05,
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div 
                  className="text-2xl font-bold text-primary"
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.1,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                >
                  99.8%
                </motion.div>
                <motion.div 
                  className="text-sm text-muted"
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.2,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                >
                  Verification Accuracy
                </motion.div>
              </motion.div>
              <motion.div 
                style={{ textAlign: 'center' }}
                whileHover={{ 
                  y: -5, 
                  scale: 1.05,
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div 
                  className="text-2xl font-bold text-primary"
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.3,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                >
                  2min
                </motion.div>
                <motion.div 
                  className="text-sm text-muted"
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.4,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                >
                  Average Processing
                </motion.div>
              </motion.div>
              <motion.div 
                style={{ textAlign: 'center' }}
                whileHover={{ 
                  y: -5, 
                  scale: 1.05,
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div 
                  className="text-2xl font-bold text-primary"
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.5,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                >
                  500K+
                </motion.div>
                <motion.div 
                  className="text-sm text-muted"
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.6,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                >
                  Verified Profiles
                </motion.div>
              </motion.div>
              <motion.div 
                style={{ textAlign: 'center' }}
                whileHover={{ 
                  y: -5, 
                  scale: 1.05,
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div 
                  className="text-2xl font-bold text-primary"
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.7,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                >
                  1,200+
                </motion.div>
                <motion.div 
                  className="text-sm text-muted"
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.8,
                    ease: [0.4, 0, 0.2, 1]
                  }}
                >
                  Partner Institutions
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section" style={{ background: 'var(--white)' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <motion.h2 
              className="text-3xl font-semibold text-primary" 
              style={{ marginBottom: '1rem' }}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.6, 
                delay: 0.1,
                ease: [0.4, 0, 0.2, 1]
              }}
            >
              Verification Excellence
            </motion.h2>
            <motion.p 
              className="text-lg text-secondary"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.6, 
                delay: 0.2,
                ease: [0.4, 0, 0.2, 1]
              }}
            >
              Built for enterprises that demand the highest standards
            </motion.p>
          </motion.div>

          <div className="grid grid-3">
            {[
              {
                title: "For Professionals",
                description: "Showcase verified credentials from DigiLocker and institutional databases."
              },
              {
                title: "For Organizations", 
                description: "Access verified talent with authenticated credentials."
              },
              {
                title: "Enterprise Security",
                description: "Built on India's Digital Public Infrastructure."
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20, rotateX: -15 }}
                whileInView={{ 
                  opacity: 1, 
                  y: 0, 
                  rotateX: 0,
                  transition: { 
                    duration: 0.5, 
                    delay: index * 0.1,
                    ease: [0.4, 0, 0.2, 1] 
                  }
                }}
                whileHover={{ 
                  y: -10, 
                  rotateX: 5,
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                viewport={{ once: true }}
                className="card card-elevated"
                style={{ 
                  transformStyle: 'preserve-3d',
                  perspective: '1000px'
                }}
              >
                <div className="card-body">
                  <h3 className="text-xl font-semibold text-primary" style={{ marginBottom: '1rem' }}>
                    {feature.title}
                  </h3>
                  <p className="text-secondary">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="mt-32 py-8 border-t border-navy-800/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              © 2026 Infinitra Innovations. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
