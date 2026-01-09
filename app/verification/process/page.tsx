'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function VerificationProcess() {
  const router = useRouter()
  const [userData, setUserData] = useState<any>(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('processing')

  useEffect(() => {
    const stored = localStorage.getItem('userData')
    if (!stored) {
      router.push('/signup')
      return
    }
    setUserData(JSON.parse(stored))

    // Simulate verification process
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer)
          setStatus('completed')
          
          // Update user data to verified status
          const updatedData = {
            ...JSON.parse(stored),
            verificationStatus: 'verified',
            verificationDate: new Date().toISOString()
          }
          localStorage.setItem('userData', JSON.stringify(updatedData))
          
          // Auto redirect after 2 seconds
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
          
          return 100
        }
        return prev + 10
      })
    }, 500)

    return () => clearInterval(timer)
  }, [router])

  if (!userData) {
    return <div>Loading...</div>
  }

  const getMethodName = (method: string) => {
    switch (method) {
      case 'digilocker': return 'DigiLocker'
      case 'documents': return 'Document Upload'
      default: return 'Unknown'
    }
  }

  return (
    <div>
      <header className="header">
        <div className="container">
          <Link href="/" style={{ color: 'white', textDecoration: 'none' }}>
            <h1>LATAP</h1>
          </Link>
        </div>
      </header>

      <main className="container" style={{ padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            {status === 'processing' ? (
              <>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔄</div>
                <h2 style={{ marginBottom: '1rem' }}>Verifying Your Identity</h2>
                <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                  Processing your {getMethodName(userData.verificationMethod)} verification...
                </p>
                
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ background: '#e2e8f0', height: '12px', borderRadius: '6px', marginBottom: '0.5rem' }}>
                    <div 
                      style={{ 
                        background: '#3b82f6', 
                        height: '100%', 
                        width: `${progress}%`, 
                        borderRadius: '6px',
                        transition: 'width 0.5s ease'
                      }}
                    ></div>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#64748b' }}>{progress}% Complete</p>
                </div>

                <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #bfdbfe' }}>
                  <p style={{ color: '#1e40af', fontSize: '0.875rem', margin: 0 }}>
                    💡 This usually takes 30-60 seconds. Please don't close this page.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <h2 style={{ marginBottom: '1rem', color: '#059669' }}>Verification Complete!</h2>
                <p style={{ color: '#64748b', marginBottom: '2rem' }}>
                  Your identity has been successfully verified through {getMethodName(userData.verificationMethod)}.
                </p>
                
                <div style={{ background: '#ecfdf5', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #a7f3d0', marginBottom: '2rem' }}>
                  <p style={{ color: '#059669', fontSize: '0.875rem', margin: 0 }}>
                    🎉 Your credibility score has been updated to {userData.credibilityScore}/100
                  </p>
                </div>

                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  Redirecting to your dashboard...
                </p>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
