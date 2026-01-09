'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { motion, AnimatePresence } from 'framer-motion'

export default function Dashboard() {
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('userData')
    if (!stored) {
      const demoUser = {
        name: 'Demo User',
        email: 'demo@example.com',
        role: 'student',
        institution: 'Demo University',
        verificationStatus: 'unverified',
        credibilityScore: 40,
        verificationMethod: null,
        verificationDate: null
      }
      localStorage.setItem('userData', JSON.stringify(demoUser))
      setUserData(demoUser)
    } else {
      setUserData(JSON.parse(stored))
    }
    setIsLoaded(true)
  }, [])

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <div className="status-badge status-verified">
            <div style={{ width: '6px', height: '6px', background: 'var(--success-500)', borderRadius: '50%' }}></div>
            Verified
          </div>
        )
      case 'pending':
        return (
          <div className="status-badge status-pending">
            <div className="animate-pulse" style={{ width: '6px', height: '6px', background: 'var(--warning-500)', borderRadius: '50%' }}></div>
            Pending Review
          </div>
        )
      default:
        return (
          <div className="status-badge status-unverified">
            <div style={{ width: '6px', height: '6px', background: 'var(--text-muted)', borderRadius: '50%' }}></div>
            Unverified
          </div>
        )
    }
  }

  const getCredibilityColor = (score: number) => {
    if (score >= 80) return 'var(--success-500)'
    if (score >= 60) return 'var(--warning-500)'
    return 'var(--error-500)'
  }

  if (!userData || !isLoaded) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--surface-50)'
      }}>
        <div className="animate-pulse">Loading dashboard...</div>
      </div>
    )
  }

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
        duration: 0.5,
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
              <div className="nav-subtitle">Professional Dashboard</div>
            </div>
          </Link>
          <div className="nav-actions">
            <Link href="/verification" className="btn btn-ghost btn-sm">
              Verification
            </Link>
            <button 
              onClick={() => {
                localStorage.clear()
                router.push('/')
              }}
              className="btn btn-ghost btn-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="container section">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ maxWidth: '1000px', margin: '0 auto' }}
        >
          {/* Welcome Header */}
          <motion.div variants={itemVariants} style={{ marginBottom: '3rem' }}>
            <h1 className="text-3xl font-bold text-primary" style={{ marginBottom: '0.5rem' }}>
              Welcome back, {userData.name}
            </h1>
            <p className="text-lg text-secondary">
              Manage your professional profile and verification status
            </p>
          </motion.div>

          {/* Status Overview */}
          <motion.div variants={itemVariants} className="grid grid-3" style={{ marginBottom: '3rem' }}>
            <motion.div 
              className="card card-floating"
              whileHover={{ 
                y: -5, 
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 className="font-medium text-secondary">Verification Status</h3>
                  {getVerificationBadge(userData.verificationStatus)}
                </div>
                <div className="text-2xl font-semibold text-primary">
                  {userData.verificationStatus === 'verified' ? 'Verified' : 
                   userData.verificationStatus === 'pending' ? 'In Review' : 'Not Started'}
                </div>
              </div>
            </div>

            <div className="card card-floating">
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 className="font-medium text-secondary">Credibility Score</h3>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: getCredibilityColor(userData.credibilityScore)
                  }}></div>
                </div>
                <div className="text-2xl font-semibold text-primary">
                  {userData.credibilityScore}/100
                </div>
                <div style={{
                  width: '100%',
                  height: '4px',
                  background: 'var(--surface-200)',
                  borderRadius: '2px',
                  marginTop: '0.5rem',
                  overflow: 'hidden'
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${userData.credibilityScore}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    style={{
                      height: '100%',
                      background: getCredibilityColor(userData.credibilityScore),
                      borderRadius: '2px'
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="card card-floating">
              <div className="card-body">
                <h3 className="font-medium text-secondary" style={{ marginBottom: '1rem' }}>
                  Profile Completion
                </h3>
                <div className="text-2xl font-semibold text-primary">
                  85%
                </div>
                <div style={{
                  width: '100%',
                  height: '4px',
                  background: 'var(--surface-200)',
                  borderRadius: '2px',
                  marginTop: '0.5rem',
                  overflow: 'hidden'
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '85%' }}
                    transition={{ duration: 1, delay: 0.7 }}
                    style={{
                      height: '100%',
                      background: 'var(--accent-600)',
                      borderRadius: '2px'
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid grid-2" style={{ gap: '2rem' }}>
            {/* Profile Information */}
            <motion.div variants={itemVariants}>
              <div className="card card-elevated">
                <div className="card-body-lg">
                  <h2 className="text-xl font-semibold text-primary" style={{ marginBottom: '1.5rem' }}>
                    Profile Information
                  </h2>
                  
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <div>
                      <div className="text-sm font-medium text-secondary">Email</div>
                      <div className="text-primary">{userData.email}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-secondary">Role</div>
                      <div className="text-primary" style={{ textTransform: 'capitalize' }}>
                        {userData.role}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-secondary">Institution</div>
                      <div className="text-primary">{userData.institution}</div>
                    </div>
                  </div>

                  {userData.verificationStatus === 'unverified' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 }}
                      style={{ marginTop: '1.5rem' }}
                    >
                      <Link href="/verification" className="btn btn-primary" style={{ width: '100%' }}>
                        Start Verification Process
                      </Link>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
              <div className="card card-elevated">
                <div className="card-body-lg">
                  <h2 className="text-xl font-semibold text-primary" style={{ marginBottom: '1.5rem' }}>
                    Quick Actions
                  </h2>
                  
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Link 
                        href="/verification" 
                        className="card"
                        style={{ 
                          display: 'block',
                          textDecoration: 'none',
                          padding: '1rem',
                          border: '1px solid var(--surface-200)',
                          transition: 'all var(--transition-fast)'
                        }}
                      >
                        <div className="font-medium text-primary">Manage Verification</div>
                        <div className="text-sm text-muted">Update or check verification status</div>
                      </Link>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div 
                        className="card"
                        style={{ 
                          padding: '1rem',
                          border: '1px solid var(--surface-200)',
                          opacity: 0.6,
                          cursor: 'not-allowed'
                        }}
                      >
                        <div className="font-medium text-primary">Browse Network</div>
                        <div className="text-sm text-muted">Connect with verified professionals</div>
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div 
                        className="card"
                        style={{ 
                          padding: '1rem',
                          border: '1px solid var(--surface-200)',
                          opacity: 0.6,
                          cursor: 'not-allowed'
                        }}
                      >
                        <div className="font-medium text-primary">Job Opportunities</div>
                        <div className="text-sm text-muted">Explore verified job postings</div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Verification Journey */}
          <AnimatePresence>
            {userData.verificationStatus === 'unverified' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                style={{ marginTop: '3rem' }}
              >
                <div className="card card-floating" style={{ 
                  background: 'linear-gradient(135deg, var(--accent-50) 0%, var(--surface-100) 100%)',
                  border: '1px solid var(--accent-200)'
                }}>
                  <div className="card-body-lg">
                    <h2 className="text-xl font-semibold text-primary" style={{ marginBottom: '1rem' }}>
                      Complete Your Verification
                    </h2>
                    <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>
                      Unlock the full potential of LATAP by verifying your academic credentials. 
                      Verified profiles get priority access to opportunities and higher credibility scores.
                    </p>
                    <Link href="/verification" className="btn btn-accent btn-lg">
                      Begin Verification Journey →
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
