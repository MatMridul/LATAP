'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const router = useRouter()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await login(formData.email, formData.password)
      router.push('/dashboard')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = () => {
    return formData.email && formData.password
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
              <div className="nav-subtitle">Sign In</div>
            </div>
          </Link>
          <div className="nav-actions">
            <Link href="/signup" className="btn btn-ghost btn-sm">
              Create Account
            </Link>
          </div>
        </div>
      </nav>

      <div className="container section">
        <div style={{ maxWidth: '450px', margin: '0 auto' }}>
          <motion.div 
            className="card card-floating"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="card-body-xl">
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '600', 
                  color: 'var(--text-primary)', 
                  marginBottom: '0.5rem' 
                }}>
                  Welcome Back
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Sign in to your LATAP account
                </p>
              </div>

              {error && (
                <div style={{
                  background: 'var(--error-50)',
                  border: '1px solid var(--error-200)',
                  color: 'var(--error-600)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.5rem',
                  fontSize: '0.875rem'
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label required">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="john.doe@example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-input"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Enter your password"
                      style={{ paddingRight: '3rem' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        padding: '0.25rem'
                      }}
                    >
                      {showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={!isFormValid() || isLoading}
                  style={{ width: '100%' }}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              <div style={{
                textAlign: 'center',
                marginTop: '2rem',
                paddingTop: '2rem',
                borderTop: 'var(--border-subtle)'
              }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Don't have an account?{' '}
                  <Link href="/signup" style={{ color: 'var(--accent-600)', fontWeight: '500', textDecoration: 'none' }}>
                    Create one here
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Footer */}
          <footer className="mt-16 py-8 text-center">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              © 2026 Infinitra Innovations. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}
