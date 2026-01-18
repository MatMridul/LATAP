'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'

export default function ManualVerification() {
  const { logout } = useAuth()
  const [formData, setFormData] = useState({
    institutionName: '',
    graduationYear: '',
    degree: '',
    registrarEmail: '',
    studentId: '',
    additionalInfo: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate manual verification submission
    setTimeout(() => {
      alert('Manual verification request submitted. You will be contacted within 24-48 hours.')
      setIsSubmitting(false)
    }, 2000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
              <div className="nav-subtitle">Manual Verification</div>
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
                  background: 'var(--warning-500)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  color: 'white',
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}>
                  MV
                </div>
                <h1 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '600', 
                  color: 'var(--text-primary)', 
                  marginBottom: '0.5rem' 
                }}>
                  Manual Verification
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                  Direct verification with your institution's registrar or alumni office
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label required">Institution Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.institutionName}
                    onChange={(e) => handleInputChange('institutionName', e.target.value)}
                    placeholder="e.g., Indian Institute of Technology Delhi"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label required">Graduation Year</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.graduationYear}
                      onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                      placeholder="2020"
                      min="1950"
                      max="2030"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Degree</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.degree}
                      onChange={(e) => handleInputChange('degree', e.target.value)}
                      placeholder="B.Tech Computer Science"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label required">Student ID</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.studentId}
                    onChange={(e) => handleInputChange('studentId', e.target.value)}
                    placeholder="Your student/roll number"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Registrar Email (if known)</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.registrarEmail}
                    onChange={(e) => handleInputChange('registrarEmail', e.target.value)}
                    placeholder="registrar@institution.edu"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Additional Information</label>
                  <textarea
                    className="form-input"
                    value={formData.additionalInfo}
                    onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                    placeholder="Any additional details that might help with verification..."
                    rows={4}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !formData.institutionName || !formData.graduationYear || !formData.degree || !formData.studentId}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%' }}
                >
                  {isSubmitting ? 'Submitting Request...' : 'Submit Verification Request'}
                </button>
              </form>

              <div style={{ 
                marginTop: '2rem', 
                padding: '1rem', 
                background: 'var(--warning-50)', 
                border: '1px solid var(--warning-200)', 
                borderRadius: '8px' 
              }}>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--warning-700)', 
                  margin: 0 
                }}>
                  <strong>Processing Time:</strong> Manual verification typically takes 24-48 hours. 
                  Our team will contact your institution directly to verify your credentials.
                </p>
              </div>
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
