'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function Signup() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [passwordMismatch, setPasswordMismatch] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const validatePassword = (password: string) => {
    const errors = []
    if (password.length < 8) {
      errors.push('At least 8 characters')
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('One uppercase letter')
    }
    if (!/[a-z]/.test(password)) {
      errors.push('One lowercase letter')
    }
    if (!/[0-9]/.test(password)) {
      errors.push('One number')
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('One special character')
    }
    return errors
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
    
    // Real-time password validation
    if (field === 'password') {
      const errors = validatePassword(value)
      setPasswordErrors(errors)
      
      // Check password match if confirm password exists
      if (formData.confirmPassword) {
        setPasswordMismatch(value !== formData.confirmPassword)
      }
    }
    
    // Real-time confirm password validation
    if (field === 'confirmPassword') {
      setPasswordMismatch(value !== formData.password)
    }
    
    // Real-time email validation
    if (field === 'email') {
      if (value && !validateEmail(value)) {
        setEmailError('Please enter a valid email address')
      } else {
        setEmailError('')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validation
    if (passwordErrors.length > 0) {
      setError(`Password must contain: ${passwordErrors.join(', ')}`)
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('http://localhost:3001/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed')
      }

      setSuccess('Account created successfully! Please check your email to verify your account.')
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = () => {
    return formData.firstName && formData.lastName && formData.email && 
           formData.password && formData.confirmPassword && 
           formData.password === formData.confirmPassword &&
           passwordErrors.length === 0 && emailError === ''
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
              <div className="nav-subtitle">Create Account</div>
            </div>
          </Link>
          <div className="nav-actions">
            <Link href="/login" className="btn btn-ghost btn-sm">
              Already have an account?
            </Link>
          </div>
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
            <div className="card-body-xl">
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h1 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '600', 
                  color: 'var(--text-primary)', 
                  marginBottom: '0.5rem' 
                }}>
                  Create Your Account
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Join LATAP to connect with alumni and discover opportunities
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

              {success && (
                <div style={{
                  background: 'var(--success-50)',
                  border: '1px solid var(--success-200)',
                  color: 'var(--success-600)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.5rem',
                  fontSize: '0.875rem'
                }}>
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label required">First Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="John"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Last Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>

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
                  {emailError && (
                    <div style={{
                      marginTop: '0.5rem',
                      fontSize: '0.75rem',
                      color: 'var(--error-600)'
                    }}>
                      {emailError}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label required">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-input"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="At least 8 characters"
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
                  {passwordErrors.length > 0 && (
                    <div style={{
                      marginTop: '0.5rem',
                      fontSize: '0.75rem',
                      color: 'var(--error-600)'
                    }}>
                      Password must contain:
                      <ul style={{ margin: '0.25rem 0 0 1rem', padding: 0 }}>
                        {passwordErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label required">Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="form-input"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Repeat your password"
                      style={{ paddingRight: '3rem' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                      {showConfirmPassword ? (
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
                  {passwordMismatch && formData.confirmPassword && (
                    <div style={{
                      marginTop: '0.5rem',
                      fontSize: '0.75rem',
                      color: 'var(--error-600)'
                    }}>
                      Passwords do not match
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  disabled={!isFormValid() || isLoading}
                  style={{ width: '100%' }}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              <div style={{
                textAlign: 'center',
                marginTop: '2rem',
                paddingTop: '2rem',
                borderTop: 'var(--border-subtle)'
              }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Already have an account?{' '}
                  <Link href="/login" style={{ color: 'var(--accent-600)', fontWeight: '500', textDecoration: 'none' }}>
                    Sign in here
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
