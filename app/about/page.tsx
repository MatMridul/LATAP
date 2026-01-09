'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function About() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-50)' }}>
      {/* Navigation */}
      <nav style={{ 
        background: 'var(--white)', 
        borderBottom: 'var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div className="container" style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '1rem 1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
            <div>
              <div className="text-lg font-semibold text-primary">LATAP</div>
              <div className="text-xs text-muted">About Platform</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link href="/" className="btn btn-ghost btn-sm">
              ← Home
            </Link>
            <Link href="/signup" className="btn btn-primary btn-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="container section">
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div className="card card-elevated">
            <div className="card-body" style={{ padding: '3rem' }}>
              <h1 className="text-3xl font-bold text-primary" style={{ marginBottom: '2rem', textAlign: 'center' }}>
                About LATAP
              </h1>
              
              <div style={{ marginBottom: '3rem' }}>
                <h2 className="text-xl font-semibold text-primary" style={{ marginBottom: '1rem' }}>
                  Our Mission
                </h2>
                <p className="text-subtle" style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                  LATAP (Localized Alumni & Talent Acquisition Platform) bridges the trust gap in India's talent ecosystem 
                  by leveraging Digital Public Infrastructure (DPI) and institutional verification systems.
                </p>
              </div>

              <div style={{ marginBottom: '3rem' }}>
                <h2 className="text-xl font-semibold text-primary" style={{ marginBottom: '1rem' }}>
                  Digital Infrastructure Integration
                </h2>
                <p className="text-subtle" style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
                  Unlike traditional platforms, LATAP uses India's robust DPI ecosystem for authentic credential verification:
                </p>
                <div style={{ display: 'grid', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="card" style={{ padding: '1rem' }}>
                    <strong>DigiLocker Integration:</strong> Access to digital academic credentials through India's DPI
                  </div>
                  <div className="card" style={{ padding: '1rem' }}>
                    <strong>Academic Bank of Credits (ABC):</strong> Verified academic records from UGC
                  </div>
                  <div className="card" style={{ padding: '1rem' }}>
                    <strong>CBSE/State Board Records:</strong> Authentic marksheets and certificates
                  </div>
                  <div className="card" style={{ padding: '1rem' }}>
                    <strong>Multi-level Verification:</strong> Credibility scoring based on verification depth
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '3rem' }}>
                <h2 className="text-xl font-semibold text-primary" style={{ marginBottom: '1rem' }}>
                  Key Features
                </h2>
                <div className="grid grid-3" style={{ gap: '1.5rem' }}>
                  <motion.div 
                    className="card card-elevated"
                    whileHover={{ 
                      y: -5, 
                      scale: 1.02,
                      transition: { duration: 0.3 }
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="card-body">
                      <h3 className="font-semibold text-primary" style={{ marginBottom: '0.5rem' }}>
                        For Students & Alumni
                      </h3>
                      <p className="text-sm text-subtle">
                        Showcase verified credentials, connect with opportunities, build trusted professional networks
                      </p>
                    </div>
                  </motion.div>
                  <motion.div 
                    className="card card-elevated"
                    whileHover={{ 
                      y: -5, 
                      scale: 1.02,
                      transition: { duration: 0.3 }
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="card-body">
                      <h3 className="font-semibold text-primary" style={{ marginBottom: '0.5rem' }}>
                        For Hirers & Recruiters
                      </h3>
                      <p className="text-sm text-subtle">
                        Access pre-verified talent pool, reduce hiring risks, connect with authentic candidates
                      </p>
                    </div>
                  </motion.div>
                  <motion.div 
                    className="card card-elevated"
                    whileHover={{ 
                      y: -5, 
                      scale: 1.02,
                      transition: { duration: 0.3 }
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="card-body">
                      <h3 className="font-semibold text-primary" style={{ marginBottom: '0.5rem' }}>
                        For Institutions
                      </h3>
                      <p className="text-sm text-subtle">
                        Strengthen alumni networks, facilitate authentic connections, enhance institutional reputation
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>

              <div style={{ marginBottom: '3rem' }}>
                <h2 className="text-xl font-semibold text-primary" style={{ marginBottom: '1rem' }}>
                  Why LATAP?
                </h2>
                <div className="grid grid-2" style={{ gap: '1.5rem' }}>
                  <div>
                    <h3 className="font-semibold text-primary" style={{ marginBottom: '0.5rem' }}>Trust First</h3>
                    <p className="text-sm text-subtle">
                      Digital verification systems eliminate fake profiles and credentials
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary" style={{ marginBottom: '0.5rem' }}>Localized Focus</h3>
                    <p className="text-sm text-subtle">
                      Built specifically for India's education and employment ecosystem
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary" style={{ marginBottom: '0.5rem' }}>Credibility Scoring</h3>
                    <p className="text-sm text-subtle">
                      Dynamic scoring based on verification levels and platform engagement
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary" style={{ marginBottom: '0.5rem' }}>Seamless Integration</h3>
                    <p className="text-sm text-subtle">
                      One-click verification through existing digital infrastructure
                    </p>
                  </div>
                </div>
              </div>

              <div className="card" style={{ 
                background: 'linear-gradient(135deg, var(--accent-50) 0%, var(--surface-100) 100%)', 
                padding: '2rem',
                border: '1px solid var(--accent-200)'
              }}>
                <h3 className="text-lg font-semibold text-primary" style={{ marginBottom: '1rem' }}>
                  The Future of Verified Talent
                </h3>
                <p className="text-secondary" style={{ lineHeight: '1.6' }}>
                  LATAP represents the next evolution in talent platforms - where trust is built through digital infrastructure, not claims. 
                  By leveraging India's Digital Public Infrastructure initiative, we're creating an ecosystem where 
                  authentic connections drive meaningful career opportunities.
                </p>
              </div>

              <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                <Link href="/signup" className="btn btn-primary btn-lg" style={{ marginRight: '1rem' }}>
                  Join LATAP
                </Link>
                <Link href="/" className="btn btn-secondary btn-lg">
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
