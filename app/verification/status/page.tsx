'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function VerificationStatus() {
  const router = useRouter()
  const [requestId, setRequestId] = useState<string | null>(null)
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [appealReason, setAppealReason] = useState('')
  const [submittingAppeal, setSubmittingAppeal] = useState(false)

  useEffect(() => {
    const storedRequestId = localStorage.getItem('verificationRequestId')
    if (!storedRequestId) {
      router.push('/verification/claim')
      return
    }
    setRequestId(storedRequestId)
    fetchStatus(storedRequestId)

    // Poll for status updates
    const interval = setInterval(() => {
      fetchStatus(storedRequestId)
    }, 5000)

    return () => clearInterval(interval)
  }, [router])

  const fetchStatus = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/verification/status/${id}`)
      const data = await response.json()
      
      if (response.ok) {
        setStatus(data)
        setError('')
        
        // Update user data in localStorage when verification is approved
        if (data.status === 'APPROVED') {
          const userData = localStorage.getItem('userData')
          if (userData) {
            const user = JSON.parse(userData)
            const updatedUser = {
              ...user,
              verificationStatus: 'verified',
              verificationMethod: 'documents',
              verificationDate: new Date().toISOString(),
              credibilityScore: Math.min(100, user.credibilityScore + 30)
            }
            localStorage.setItem('userData', JSON.stringify(updatedUser))
          }
        }
      } else {
        setError(data.error || 'Failed to fetch status')
      }
    } catch (error) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleAppeal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!requestId || !appealReason.trim()) return

    setSubmittingAppeal(true)
    try {
      const response = await fetch(`http://localhost:3001/api/verification/appeal/${requestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: appealReason })
      })

      const result = await response.json()
      if (response.ok) {
        setAppealReason('')
        fetchStatus(requestId)
      } else {
        setError(result.error || 'Appeal failed')
      }
    } catch (error) {
      setError('Network error')
    } finally {
      setSubmittingAppeal(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return 'PROCESSING'
      case 'PROCESSING': return '🔄'
      case 'APPROVED': return '✅'
      case 'REJECTED': return '❌'
      case 'MANUAL_REVIEW': return '👥'
      default: return '❓'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return '#059669'
      case 'REJECTED': return '#dc2626'
      case 'MANUAL_REVIEW': return '#d97706'
      case 'PROCESSING': return '#667eea'
      default: return '#64748b'
    }
  }

  const getStatusGradient = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
      case 'REJECTED': return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
      case 'MANUAL_REVIEW': return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
      case 'PROCESSING': return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      default: return 'linear-gradient(135deg, #64748b 0%, #475569 100%)'
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <header className="header">
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <h1>LATAP</h1>
            </Link>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
              Verification Status
            </div>
          </div>
        </header>
        <main className="container" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
          <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
            <div className="loading-spinner" style={{ margin: '2rem auto' }}></div>
            <p style={{ color: '#64748b' }}>Loading verification status...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <header className="header">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h1>LATAP</h1>
          </Link>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
            Verification Status & Results
          </div>
        </div>
      </header>

      <main className="container" style={{ padding: '3rem 1rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="card animate-fade-in-up">
            {/* Status Header */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div style={{ 
                fontSize: '4rem', 
                marginBottom: '1rem',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
              }}>
                {getStatusIcon(status?.status)}
              </div>
              <h2 style={{ 
                fontSize: '2.5rem',
                background: getStatusGradient(status?.status),
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '0.5rem'
              }}>
                {status?.status?.replace('_', ' ')}
              </h2>
              <div style={{ 
                background: 'rgba(100, 116, 139, 0.1)',
                padding: '0.5rem 1rem',
                borderRadius: '2rem',
                display: 'inline-block',
                fontSize: '0.9rem',
                color: '#64748b'
              }}>
                Request ID: {requestId}
              </div>
            </div>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: '2rem' }}>
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  borderRadius: '50%', 
                  background: 'var(--warning-100)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginRight: '0.5rem'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--warning-600)" strokeWidth="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                {error}
              </div>
            )}

            {status && (
              <>
                {/* Verification Details */}
                <div style={{ marginBottom: '3rem' }}>
                  <h3 style={{ 
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span>📊</span> Verification Details
                  </h3>
                  <div className="grid grid-2" style={{ gap: '1.5rem' }}>
                    <div style={{ 
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                      padding: '1.5rem',
                      borderRadius: '1rem',
                      border: '1px solid rgba(102, 126, 234, 0.2)'
                    }}>
                      <div style={{ fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                        📈 Total Attempts
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>
                        {status.totalAttempts}
                      </div>
                    </div>
                    <div style={{ 
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
                      padding: '1.5rem',
                      borderRadius: '1rem',
                      border: '1px solid rgba(16, 185, 129, 0.2)'
                    }}>
                      <div style={{ fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                        <div className="text-sm font-medium text-secondary">Submitted</div>
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: '600', color: '#10b981' }}>
                        {new Date(status.createdAt).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                        {new Date(status.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                    {status.lastAttempt && (
                      <>
                        <div style={{ 
                          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
                          padding: '1.5rem',
                          borderRadius: '1rem',
                          border: '1px solid rgba(245, 158, 11, 0.2)'
                        }}>
                          <div style={{ fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                            🕒 Last Updated
                          </div>
                          <div style={{ fontSize: '1rem', fontWeight: '600', color: '#f59e0b' }}>
                            {new Date(status.lastAttempt.completedAt).toLocaleDateString()}
                          </div>
                          <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                            {new Date(status.lastAttempt.completedAt).toLocaleTimeString()}
                          </div>
                        </div>
                        {status.lastAttempt.failureReason && (
                          <div style={{ 
                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
                            padding: '1.5rem',
                            borderRadius: '1rem',
                            border: '1px solid rgba(239, 68, 68, 0.2)'
                          }}>
                            <div style={{ fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                              ❌ Failure Reason
                            </div>
                            <div style={{ fontSize: '0.9rem', color: '#ef4444' }}>
                              {status.lastAttempt.failureReason}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Matching Results */}
                {status.lastAttempt?.matchingResults && (
                  <div style={{ marginBottom: '3rem' }}>
                    <h3 style={{ 
                      marginBottom: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <div className="font-medium text-primary">Matching Results</div>
                    </h3>
                    <div style={{ 
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
                      backdropFilter: 'blur(10px)',
                      padding: '2rem',
                      borderRadius: '1rem',
                      border: '1px solid rgba(226, 232, 240, 0.5)'
                    }}>
                      <div className="grid grid-2" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
                        {[
                          { key: 'institutionMatch', label: 'Institution', icon: 'INST' },
                          { key: 'nameMatch', label: 'Name', icon: '👤' },
                          { key: 'timelineMatch', label: 'Timeline', icon: '📅' },
                          { key: 'programMatch', label: 'Program', icon: '📚' }
                        ].map(({ key, label, icon }) => {
                          const match = status.lastAttempt.matchingResults[key]
                          const score = Math.round(match.score * 100)
                          return (
                            <div key={key} style={{ 
                              background: match.passed ? 
                                'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)' :
                                'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)',
                              padding: '1.5rem',
                              borderRadius: '0.75rem',
                              border: `1px solid ${match.passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                            }}>
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginBottom: '0.75rem'
                              }}>
                                <span style={{ 
                                  fontWeight: '600', 
                                  color: '#374151',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem'
                                }}>
                                  {icon} {label}
                                </span>
                                <div style={{ 
                                  background: match.passed ? '#10b981' : '#ef4444',
                                  color: 'white',
                                  padding: '0.25rem 0.75rem',
                                  borderRadius: '1rem',
                                  fontSize: '0.875rem',
                                  fontWeight: '600'
                                }}>
                                  {score}%
                                </div>
                              </div>
                              <div style={{ 
                                fontSize: '0.875rem', 
                                color: match.passed ? '#059669' : '#dc2626',
                                lineHeight: '1.4'
                              }}>
                                {match.details}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      
                      {/* Overall Score */}
                      <div style={{ 
                        textAlign: 'center',
                        padding: '2rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '1rem',
                        color: 'white'
                      }}>
                        <h4 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Overall Verification Score</h4>
                        <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                          {Math.round(status.lastAttempt.matchingResults.overallScore * 100)}%
                        </div>
                        <div style={{ opacity: 0.9 }}>
                          {status.lastAttempt.matchingResults.overallScore >= 0.8 ? 'Excellent Match' :
                           status.lastAttempt.matchingResults.overallScore >= 0.6 ? 'Good Match' :
                           status.lastAttempt.matchingResults.overallScore >= 0.4 ? 'Partial Match' : 'Poor Match'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Appeal Form */}
                {status.canAppeal && status.status === 'REJECTED' && (
                  <div style={{ marginBottom: '3rem' }}>
                    <h3 style={{ 
                      marginBottom: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span>📝</span> Submit Appeal
                    </h3>
                    <div style={{ 
                      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
                      padding: '2rem',
                      borderRadius: '1rem',
                      border: '1px solid rgba(245, 158, 11, 0.2)'
                    }}>
                      <form onSubmit={handleAppeal}>
                        <div className="form-group">
                          <label className="form-label">
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              💬 Appeal Reason
                            </span>
                          </label>
                          <textarea
                            className="form-input"
                            value={appealReason}
                            onChange={(e) => setAppealReason(e.target.value)}
                            placeholder="Explain why you believe the verification should be reconsidered. Be specific about any discrepancies or issues with the document processing."
                            style={{ minHeight: '120px', resize: 'vertical' }}
                            required
                          />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={submittingAppeal}
                          >
                            {submittingAppeal ? (
                              <>
                                <div className="loading-spinner" style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }}></div>
                                Submitting Appeal...
                              </>
                            ) : (
                              <>
                                Submit Appeal
                                <span style={{ marginLeft: '0.5rem' }}>📤</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Manual Review Notice */}
                {status.status === 'MANUAL_REVIEW' && (
                  <div className="alert alert-warning" style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <span style={{ fontSize: '2rem' }}>👥</span>
                      <div>
                        <h4 style={{ color: '#d97706', marginBottom: '0.75rem' }}>Manual Review Required</h4>
                        <p style={{ color: '#92400e', lineHeight: '1.5' }}>
                          Your verification has been escalated to manual review by an institution administrator. 
                          This typically takes 1-3 business days. You will be notified once the review is complete.
                        </p>
                        <div style={{ 
                          marginTop: '1rem',
                          padding: '1rem',
                          background: 'rgba(245, 158, 11, 0.1)',
                          borderRadius: '0.5rem'
                        }}>
                          <p style={{ color: '#92400e', fontSize: '0.9rem', margin: 0 }}>
                            💡 <strong>What happens next:</strong> An administrator will review your document manually 
                            and make a final decision on your verification request.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {status.status === 'APPROVED' && (
                  <div className="alert alert-success" style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <span style={{ fontSize: '2rem' }}>🎉</span>
                      <div>
                        <h4 style={{ color: '#065f46', marginBottom: '0.75rem' }}>Verification Successful!</h4>
                        <p style={{ color: '#047857', lineHeight: '1.5' }}>
                          Congratulations! Your academic credentials have been successfully verified. 
                          Your credibility score has been updated and you now have access to all platform features.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                  <Link href="/dashboard" className="btn btn-secondary">
                    <span style={{ marginRight: '0.5rem' }}>←</span>
                    Back to Dashboard
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
