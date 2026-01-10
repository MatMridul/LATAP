'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'
import ProtectedRoute from '../components/ProtectedRoute'

interface VerificationMethod {
  id: string
  title: string
  description: string
  credibilityBoost: number
  processingTime: string
  icon: string
  recommended?: boolean
}

const verificationMethods: VerificationMethod[] = [
  {
    id: 'digilocker',
    title: 'DigiLocker Verification',
    description: 'Instant verification using digital credential systems',
    credibilityBoost: 40,
    processingTime: 'Instant',
    icon: 'DL',
    recommended: true
  },
  {
    id: 'document',
    title: 'Document Upload',
    description: 'Upload academic certificates and transcripts for manual verification',
    credibilityBoost: 20,
    processingTime: '2-4 hours',
    icon: 'DOC'
  },
  {
    id: 'skip',
    title: 'Skip for Now',
    description: 'Complete verification later with limited platform access',
    credibilityBoost: 0,
    processingTime: 'N/A',
    icon: 'SKIP'
  }
]

export default function Verification() {
  return (
    <ProtectedRoute>
      <VerificationContent />
    </ProtectedRoute>
  )
}

function VerificationContent() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [isAnimated, setIsAnimated] = useState(false)

  useEffect(() => {
    setIsAnimated(true)
  }, [])

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId)
  }

  const handleContinue = () => {
    if (!selectedMethod) return

    switch (selectedMethod) {
      case 'digilocker':
        router.push('/verification/process?method=digilocker')
        break
      case 'document':
        router.push('/verification/upload')
        break
      case 'skip':
        router.push('/dashboard')
        break
    }
  }

  const getSelectedMethod = () => {
    return verificationMethods.find(method => method.id === selectedMethod)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-50)' }}>
      {/* Navigation */}
      <nav style={{ 
        background: 'var(--white)', 
        borderBottom: 'var(--border-subtle)',
        padding: '1rem 0'
      }}>
        <div className="container" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center'
        }}>
          <Link href="/" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem',
            textDecoration: 'none'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'var(--midnight-800)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--white)',
              fontWeight: 600,
              fontSize: '0.875rem'
            }}>L</div>
            <div className="text-lg font-semibold text-primary">LATAP</div>
          </Link>
          
          <div className="status-badge status-pending">
            Verification Required
          </div>
        </div>
      </nav>

      <div className="container section">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '3rem',
            opacity: isAnimated ? 1 : 0,
            transform: isAnimated ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <h1 className="text-3xl font-semibold text-primary" style={{ marginBottom: '1rem' }}>
              Choose Verification Method
            </h1>
            <p className="text-lg text-subtle" style={{ maxWidth: '500px', margin: '0 auto' }}>
              Hello {user?.firstName}, select how you'd like to verify your credentials. Higher verification levels 
              unlock more platform features and increase your credibility score.
            </p>
          </div>

          {/* Verification Methods */}
          <div className="grid" style={{ 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem'
          }}>
            {verificationMethods.map((method, index) => (
              <div
                key={method.id}
                className={`card ${selectedMethod === method.id ? 'card-elevated' : ''}`}
                onClick={() => handleMethodSelect(method.id)}
                style={{
                  cursor: 'pointer',
                  border: selectedMethod === method.id ? '2px solid var(--midnight-800)' : 'var(--border-subtle)',
                  position: 'relative',
                  opacity: isAnimated ? 1 : 0,
                  transform: isAnimated ? 'translateY(0)' : 'translateY(30px)',
                  transition: `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`
                }}
              >
                {method.recommended && (
                  <div style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '1rem',
                    background: 'var(--accent-600)',
                    color: 'var(--white)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.025em'
                  }}>
                    Recommended
                  </div>
                )}

                <div className="card-body">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{
                      fontSize: '2rem',
                      width: '60px',
                      height: '60px',
                      background: 'var(--surface-100)',
                      borderRadius: 'var(--radius-lg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {method.icon}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <h3 className="text-xl font-semibold text-primary" style={{ marginBottom: '0.5rem' }}>
                        {method.title}
                      </h3>
                      <p className="text-subtle" style={{ marginBottom: '1rem' }}>
                        {method.description}
                      </p>
                      
                      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-600)" strokeWidth="2">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                          </svg>
                          <span className="text-sm font-medium">+{method.credibilityBoost} points</span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--surface-500)" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12,6 12,12 16,14"/>
                          </svg>
                          <span className="text-sm text-muted">{method.processingTime}</span>
                        </div>
                      </div>
                    </div>

                    <div className={`radio-button ${selectedMethod === method.id ? 'selected' : ''}`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Method Details */}
          {selectedMethod && (
            <div className="card card-elevated" style={{
              background: 'var(--surface-50)',
              border: '2px solid var(--navy-900)',
              color: 'var(--navy-900)',
              opacity: isAnimated ? 1 : 0,
              transform: isAnimated ? 'translateY(0)' : 'translateY(20px)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.2s'
            }}>
              <div className="card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--navy-900)" strokeWidth="2">
                    <path d="M9 12l2 2 4-4"/>
                    <circle cx="12" cy="12" r="10"/>
                  </svg>
                  <div>
                    <div className="text-lg font-semibold">
                      {getSelectedMethod()?.title} Selected
                    </div>
                    <div className="text-sm" style={{ color: 'var(--surface-600)' }}>
                      Processing time: {getSelectedMethod()?.processingTime}
                    </div>
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div>
                    <div className="text-sm" style={{ color: 'var(--surface-600)', marginBottom: '0.25rem' }}>
                      Credibility Boost
                    </div>
                    <div className="text-2xl font-bold">
                      +{getSelectedMethod()?.credibilityBoost} points
                    </div>
                  </div>

                  <button
                    onClick={handleContinue}
                    className="btn btn-primary btn-lg"
                  >
                    {selectedMethod === 'digilocker' && 'Connect DigiLocker'}
                    {selectedMethod === 'document' && 'Upload Documents'}
                    {selectedMethod === 'skip' && 'Continue to Dashboard'}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div style={{
            background: 'var(--surface-100)',
            border: 'var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            marginTop: '2rem',
            opacity: isAnimated ? 1 : 0,
            transform: isAnimated ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.4s'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--midnight-600)" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <div>
                <div className="font-medium text-primary" style={{ marginBottom: '0.5rem' }}>
                  Your Security is Our Priority
                </div>
                <div className="text-sm text-subtle">
                  All verification processes use enterprise-grade encryption. Your documents 
                  are processed securely and deleted after verification completion. We comply 
                  with GDPR and Indian data protection regulations.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
