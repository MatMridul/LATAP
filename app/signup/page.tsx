'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

interface FormData {
  fullName: string
  email: string
  phone: string
  role: string
  institution: string
  graduationYear: string
  program: string
  currentPosition: string
}

export default function Signup() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    role: '',
    institution: '',
    graduationYear: '',
    program: '',
    currentPosition: ''
  })

  const totalSteps = 3

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    } else {
      localStorage.setItem('userProfile', JSON.stringify(formData))
      router.push('/verification')
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Personal Information'
      case 2: return 'Academic Background'
      case 3: return 'Professional Details'
      default: return ''
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 1: return 'Let\'s start with your basic information'
      case 2: return 'Tell us about your educational background'
      case 3: return 'Share your current professional status'
      default: return ''
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName && formData.email && formData.phone && formData.role
      case 2:
        return formData.institution && formData.graduationYear && formData.program
      case 3:
        return formData.currentPosition
      default:
        return false
    }
  }

  const stepVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
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
              <div className="nav-subtitle">Account Registration</div>
            </div>
          </Link>
          <div className="nav-actions">
            <Link href="/" className="btn btn-ghost btn-sm">
              ← Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="container section">
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          {/* Progress Indicator */}
          <motion.div 
            className="progress-container"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {[1, 2, 3].map((step) => (
              <div 
                key={step}
                className={`progress-step ${
                  step < currentStep ? 'completed' : 
                  step === currentStep ? 'active' : ''
                }`}
              >
                <div className="progress-indicator">{step}</div>
                <div className="progress-label">
                  Step {step}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Form Card */}
          <motion.div 
            className="card card-floating"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="card-body-xl">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                style={{ textAlign: 'center', marginBottom: '2rem' }}
              >
                <h1 className="text-2xl font-semibold text-primary" style={{ marginBottom: '0.5rem' }}>
                  {getStepTitle()}
                </h1>
                <p className="text-secondary">
                  {getStepDescription()}
                </p>
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                >
                  {currentStep === 1 && (
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                      <div className="form-group">
                        <label className="form-label required">Full Name</label>
                        <input
                          type="text"
                          className="form-input"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          placeholder="Enter your complete name"
                        />
                      </div>
                      
                      <div className="grid grid-2">
                        <div className="form-group">
                          <label className="form-label required">Email Address</label>
                          <input
                            type="email"
                            className="form-input"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="your.email@example.com"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label required">Phone Number</label>
                          <input
                            type="tel"
                            className="form-input"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="+91 98765 43210"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label required">Role</label>
                        <select
                          className="form-input"
                          value={formData.role}
                          onChange={(e) => handleInputChange('role', e.target.value)}
                        >
                          <option value="">Select your role</option>
                          <option value="student">Current Student</option>
                          <option value="alumni">Alumni</option>
                          <option value="professional">Working Professional</option>
                          <option value="recruiter">Recruiter/HR</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {currentStep === 2 && (
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                      <div className="form-group">
                        <label className="form-label required">Institution</label>
                        <input
                          type="text"
                          className="form-input"
                          value={formData.institution}
                          onChange={(e) => handleInputChange('institution', e.target.value)}
                          placeholder="e.g., Indian Institute of Technology Delhi"
                        />
                      </div>

                      <div className="grid grid-2">
                        <div className="form-group">
                          <label className="form-label required">Graduation Year</label>
                          <input
                            type="number"
                            className="form-input"
                            value={formData.graduationYear}
                            onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                            placeholder="2024"
                            min="1950"
                            max="2030"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label required">Program/Degree</label>
                          <input
                            type="text"
                            className="form-input"
                            value={formData.program}
                            onChange={(e) => handleInputChange('program', e.target.value)}
                            placeholder="B.Tech Computer Science"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep === 3 && (
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                      <div className="form-group">
                        <label className="form-label required">Current Position</label>
                        <input
                          type="text"
                          className="form-input"
                          value={formData.currentPosition}
                          onChange={(e) => handleInputChange('currentPosition', e.target.value)}
                          placeholder="e.g., Software Engineer at Google"
                        />
                      </div>

                      <div className="card" style={{ 
                        background: 'var(--accent-50)', 
                        border: '1px solid var(--accent-200)',
                        padding: '1.5rem'
                      }}>
                        <h3 className="font-medium text-primary" style={{ marginBottom: '0.5rem' }}>
                          Next: Credential Verification
                        </h3>
                        <p className="text-sm text-secondary">
                          After registration, you'll be guided through our secure verification process 
                          to authenticate your academic credentials.
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Action Buttons */}
              <motion.div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginTop: '2rem',
                  paddingTop: '2rem',
                  borderTop: 'var(--border-subtle)'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.6 }}
              >
                <button
                  onClick={handleBack}
                  className="btn btn-ghost"
                  disabled={currentStep === 1}
                >
                  ← Previous
                </button>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: step <= currentStep ? 'var(--accent-600)' : 'var(--surface-300)',
                        transition: 'all var(--transition-medium)'
                      }}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  className="btn btn-primary"
                  disabled={!isStepValid()}
                >
                  {currentStep === totalSteps ? 'Complete Registration' : 'Continue →'}
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
