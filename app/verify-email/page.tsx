'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link. Please check your email for the correct link.')
      return
    }

    verifyEmail(token)
  }, [token])

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/auth/verify-email?token=${verificationToken}`)
      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message)
      } else {
        setStatus('error')
        setMessage(data.error || 'Verification failed')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Network error. Please try again later.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-50)' }}>
      {/* Navigation */}
      <nav className="nav-primary">
        <div className="nav-container container">
          <Link href="/" className="nav-brand">
            <div className="nav-logo">L</div>
            <div>
              <div className="nav-title">LATAP</div>
              <div className="nav-subtitle">Email Verification</div>
            </div>
          </Link>
        </div>
      </nav>

      <div className="container section">
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <motion.div 
            className="card card-floating"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="card-body-xl" style={{ textAlign: 'center' }}>
              {status === 'verifying' && (
                <>
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    margin: '0 auto 1.5rem',
                    border: '3px solid var(--surface-200)',
                    borderTop: '3px solid var(--accent-600)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <h1 className="text-xl font-semibold text-primary" style={{ marginBottom: '0.5rem' }}>
                    Verifying Your Email
                  </h1>
                  <p className="text-secondary">
                    Please wait while we verify your email address...
                  </p>
                </>
              )}

              {status === 'success' && (
                <>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    margin: '0 auto 1.5rem',
                    background: 'var(--success-100)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--success-600)" strokeWidth="2">
                      <path d="M9 12l2 2 4-4"/>
                      <circle cx="12" cy="12" r="10"/>
                    </svg>
                  </div>
                  <h1 className="text-xl font-semibold text-primary" style={{ marginBottom: '0.5rem' }}>
                    Email Verified Successfully!
                  </h1>
                  <p className="text-secondary" style={{ marginBottom: '2rem' }}>
                    {message}
                  </p>
                  <Link href="/login" className="btn btn-primary btn-lg">
                    Continue to Sign In
                  </Link>
                </>
              )}

              {status === 'error' && (
                <>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    margin: '0 auto 1.5rem',
                    background: 'var(--error-100)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--error-600)" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                  </div>
                  <h1 className="text-xl font-semibold text-primary" style={{ marginBottom: '0.5rem' }}>
                    Verification Failed
                  </h1>
                  <p className="text-secondary" style={{ marginBottom: '2rem' }}>
                    {message}
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <Link href="/signup" className="btn btn-secondary">
                      Create New Account
                    </Link>
                    <Link href="/login" className="btn btn-primary">
                      Try Signing In
                    </Link>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: 'var(--surface-50)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ 
          width: '60px', 
          height: '60px', 
          border: '3px solid var(--surface-200)',
          borderTop: '3px solid var(--accent-600)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        
        {/* Footer */}
        <footer style={{ position: 'absolute', bottom: '2rem', textAlign: 'center' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            © 2026 Infinitra Innovations. All rights reserved.
          </p>
        </footer>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}
