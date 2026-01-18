'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminReview() {
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reviewingId, setReviewingId] = useState<string | null>(null)

  useEffect(() => {
    fetchPendingRequests()
  }, [])

  const fetchPendingRequests = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:3001/api/verification/admin/pending', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      
      if (response.ok) {
        setPendingRequests(data.pendingRequests)
        setError('')
      } else {
        setError(data.error || 'Failed to fetch pending requests')
      }
    } catch (error) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const handleReview = async (requestId: string, decision: 'APPROVED' | 'REJECTED') => {
    setReviewingId(requestId)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3001/api/verification/admin/review/${requestId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          decision, 
          notes: `Manual review completed: ${decision}` 
        })
      })

      const result = await response.json()
      if (response.ok) {
        setPendingRequests(prev => prev.filter(req => req.requestId !== requestId))
      } else {
        setError(result.error || 'Review failed')
      }
    } catch (error) {
      setError('Network error')
    } finally {
      setReviewingId(null)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <header className="header">
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <h1>LATAP Admin</h1>
            </Link>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
              Manual Review System
            </div>
          </div>
        </header>
        <main className="container" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
          <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
            <div className="loading-spinner" style={{ margin: '2rem auto' }}></div>
            <p style={{ color: '#64748b' }}>Loading pending reviews...</p>
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
            <h1>LATAP Admin</h1>
          </Link>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}>
            Manual Review System
          </div>
        </div>
      </header>

      <main className="container" style={{ padding: '3rem 1rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div className="card animate-fade-in-up">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>👥</div>
              <h2 className="text-gradient" style={{ fontSize: '2.25rem', marginBottom: '1rem' }}>
                Manual Review Queue
              </h2>
              <p style={{ color: '#64748b', fontSize: '1.1rem', lineHeight: '1.6' }}>
                Review verification requests that require manual approval from institution administrators.
              </p>
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

            {pendingRequests.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '4rem 2rem',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
                borderRadius: '1rem',
                border: '1px solid rgba(16, 185, 129, 0.2)'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>✅</div>
                <h3 style={{ color: '#059669', marginBottom: '1rem' }}>All Caught Up!</h3>
                <p style={{ color: '#64748b' }}>No pending reviews at this time. Great work!</p>
              </div>
            ) : (
              <>
                <div style={{ 
                  marginBottom: '2rem',
                  padding: '1rem 1.5rem',
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(59, 130, 246, 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>📊</span>
                    <div>
                      <h4 style={{ color: '#1e40af', marginBottom: '0.25rem' }}>
                        {pendingRequests.length} Request{pendingRequests.length !== 1 ? 's' : ''} Pending Review
                      </h4>
                      <p style={{ color: '#3b82f6', fontSize: '0.9rem' }}>
                        These requests have exceeded automatic verification attempts and require manual review.
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  {pendingRequests.map((request, index) => (
                    <div 
                      key={request.requestId}
                      className="card"
                      style={{ 
                        padding: '2rem',
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                        border: '1px solid rgba(226, 232, 240, 0.8)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Request Number Badge */}
                      <div style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '2rem',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                      }}>
                        #{index + 1}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'start' }}>
                        <div>
                          <h3 style={{ 
                            marginBottom: '1rem', 
                            fontSize: '1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                          }}>
                            <div style={{ 
                              width: '40px', 
                              height: '40px', 
                              borderRadius: '50%', 
                              background: 'var(--surface-100)', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              marginRight: '1rem'
                            }}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                              </svg>
                            </div>
                            {request.claimedName}
                          </h3>
                          
                          <div className="grid grid-2" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ 
                              background: 'rgba(102, 126, 234, 0.1)',
                              padding: '1rem',
                              borderRadius: '0.75rem',
                              border: '1px solid rgba(102, 126, 234, 0.2)'
                            }}>
                              <div style={{ fontWeight: '600', color: '#374151', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                                <div className="text-sm font-medium text-secondary">INSTITUTION</div>
                              </div>
                              <div style={{ color: '#667eea', fontWeight: '600' }}>{request.claimedInstitution}</div>
                            </div>
                            <div style={{ 
                              background: 'rgba(16, 185, 129, 0.1)',
                              padding: '1rem',
                              borderRadius: '0.75rem',
                              border: '1px solid rgba(16, 185, 129, 0.2)'
                            }}>
                              <div style={{ fontWeight: '600', color: '#374151', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                                📚 PROGRAM
                              </div>
                              <div style={{ color: '#10b981', fontWeight: '600' }}>{request.claimedProgram}</div>
                            </div>
                          </div>

                          <div style={{ 
                            display: 'flex', 
                            gap: '2rem', 
                            color: '#64748b', 
                            fontSize: '0.9rem',
                            flexWrap: 'wrap'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span>🔄</span>
                              <strong>{request.totalAttempts}</strong> attempts
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div className="text-sm font-medium text-secondary">Timeline</div>
                              {new Date(request.createdAt).toLocaleDateString()}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span>🆔</span>
                              <code style={{ 
                                background: 'rgba(100, 116, 139, 0.1)',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.25rem',
                                fontSize: '0.8rem'
                              }}>
                                {request.requestId.slice(-8)}
                              </code>
                            </div>
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '140px' }}>
                          <button
                            onClick={() => handleReview(request.requestId, 'APPROVED')}
                            disabled={reviewingId === request.requestId}
                            className="btn btn-success"
                            style={{ fontSize: '0.9rem' }}
                          >
                            {reviewingId === request.requestId ? (
                              <div className="loading-spinner" style={{ width: '1rem', height: '1rem' }}></div>
                            ) : (
                              <>
                                <span style={{ marginRight: '0.5rem' }}>✅</span>
                                Approve
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleReview(request.requestId, 'REJECTED')}
                            disabled={reviewingId === request.requestId}
                            className="btn btn-danger"
                            style={{ fontSize: '0.9rem' }}
                          >
                            {reviewingId === request.requestId ? (
                              <div className="loading-spinner" style={{ width: '1rem', height: '1rem' }}></div>
                            ) : (
                              <>
                                <span style={{ marginRight: '0.5rem' }}>❌</span>
                                Reject
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <Link href="/dashboard" className="btn btn-secondary">
                <span style={{ marginRight: '0.5rem' }}>←</span>
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
