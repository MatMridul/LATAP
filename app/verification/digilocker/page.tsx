'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'

export default function DigiLockerVerification() {
  const { logout } = useAuth()
  const [isConnecting, setIsConnecting] = useState(false)

  const handleDigiLockerConnect = () => {
    setIsConnecting(true)
    // Simulate DigiLocker integration
    setTimeout(() => {
      alert('DigiLocker integration will be implemented in the next phase')
      setIsConnecting(false)
    }, 2000)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-50)' }}>
      {/* Navigation */}
      <nav className="nav-primary">
        <div className="nav-container">
          <Link href="/" className="nav-brand">
            <div className="nav-logo">L</div>
            <div>
              <div className="nav-title">LATAP</div>
              <div className="nav-subtitle">DigiLocker Verification</div>
            </div>
          </Link>
          <div className="nav-actions">
            <Link href="/verification" className="btn btn-ghost btn-sm">
              Back to Verification
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

      <div className="container section">
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <motion.div 
            className="card card-floating"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="card-body-xl">
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'var(--accent-500)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  color: 'white',
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}>
                  DL
                </div>
                <h1 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '600', 
                  color: 'var(--text-primary)', 
                  marginBottom: '0.5rem' 
                }}>
                  DigiLocker Verification
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Connect your DigiLocker account to instantly verify your academic credentials
                </p>
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: '600', 
                  color: 'var(--text-primary)', 
                  marginBottom: '1rem' 
                }}>
                  What you'll need:
                </h3>
                <ul style={{ 
                  listStyle: 'none', 
                  padding: 0, 
                  color: 'var(--text-secondary)',
                  lineHeight: '1.6'
                }}>
                  <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                    <div style={{ 
                      width: '6px', 
                      height: '6px', 
                      background: 'var(--accent-500)', 
                      borderRadius: '50%', 
                      marginRight: '0.75rem' 
                    }}></div>
                    Valid DigiLocker account
                  </li>
                  <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                    <div style={{ 
                      width: '6px', 
                      height: '6px', 
                      background: 'var(--accent-500)', 
                      borderRadius: '50%', 
                      marginRight: '0.75rem' 
                    }}></div>
                    Academic documents uploaded to DigiLocker
                  </li>
                  <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center' }}>
                    <div style={{ 
                      width: '6px', 
                      height: '6px', 
                      background: 'var(--accent-500)', 
                      borderRadius: '50%', 
                      marginRight: '0.75rem' 
                    }}></div>
                    Mobile number linked to DigiLocker
                  </li>
                </ul>
              </div>

              <button
                onClick={handleDigiLockerConnect}
                disabled={isConnecting}
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginBottom: '1rem' }}
              >
                {isConnecting ? 'Connecting to DigiLocker...' : 'Connect DigiLocker Account'}
              </button>

              <p style={{ 
                fontSize: '0.75rem', 
                color: 'var(--text-muted)', 
                textAlign: 'center' 
              }}>
                Secure connection • Government verified • Instant processing
              </p>
            </div>
          </motion.div>
        </div>
      </div>

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
  )
}
