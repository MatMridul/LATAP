'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function VerificationClaim() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    claimedName: '',
    claimedInstitution: '',
    claimedProgram: '',
    claimedStartYear: '',
    claimedEndYear: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem('verificationClaim', JSON.stringify(formData))
    router.push('/verification/upload')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy-50)' }}>
      <header className="header">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div>
              <h1>LATAP</h1>
              <div className="header-subtitle">Academic Verification</div>
            </div>
          </Link>
          <div className="progress-steps" style={{ margin: 0, flex: 1, maxWidth: '400px' }}>
            <div className="progress-step completed">
              <div className="progress-step-indicator">1</div>
              <div className="progress-step-label">Method</div>
            </div>
            <div className="progress-step active">
              <div className="progress-step-indicator">2</div>
              <div className="progress-step-label">Claims</div>
            </div>
            <div className="progress-step">
              <div className="progress-step-indicator">3</div>
              <div className="progress-step-label">Upload</div>
            </div>
            <div className="progress-step">
              <div className="progress-step-indicator">4</div>
              <div className="progress-step-label">Verify</div>
            </div>
          </div>
        </div>
      </header>

      <main className="container" style={{ padding: '2rem 1rem', maxWidth: '900px' }}>
        {/* Step Container */}
        <div className="step-container">
          <div className="step-header">
            <h2 className="step-title">Academic Credential Claims</h2>
            <div className="step-counter">Step 2 of 4</div>
          </div>
          
          <div className="step-content">
            <p style={{ color: 'var(--navy-600)', marginBottom: '2rem', fontSize: '1rem', lineHeight: '1.6' }}>
              Enter your academic details exactly as they appear on your official documents. 
              Our AI system will verify these claims against your uploaded certificates.
            </p>

            <form onSubmit={handleSubmit}>
              {/* Personal Identity Section */}
              <div className="section-card">
                <div className="section-header">
                  <h3 className="section-title">
                    Personal Identity
                  </h3>
                  <p className="section-subtitle">
                    Enter your name exactly as it appears on your academic certificate
                  </p>
                </div>
                <div className="section-content">
                  <div className="form-row single">
                    <div className="field-group">
                      <label className="field-label required">Full Legal Name</label>
                      <input
                        type="text"
                        className="field-input"
                        value={formData.claimedName}
                        onChange={(e) => setFormData({...formData, claimedName: e.target.value})}
                        placeholder="Enter your complete name as printed on certificate"
                        required
                      />
                      <div className="field-helper">
                        Include all names, middle names, and suffixes exactly as shown on your official document
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Institutional Details Section */}
              <div className="section-card">
                <div className="section-header">
                  <h3 className="section-title">
                    Institutional Details
                  </h3>
                  <p className="section-subtitle">
                    Provide information about your educational institution and program
                  </p>
                </div>
                <div className="section-content">
                  <div className="form-row single">
                    <div className="field-group">
                      <label className="field-label required">Institution Name</label>
                      <input
                        type="text"
                        className="field-input"
                        value={formData.claimedInstitution}
                        onChange={(e) => setFormData({...formData, claimedInstitution: e.target.value})}
                        placeholder="e.g., Indian Institute of Technology Delhi"
                        required
                      />
                      <div className="field-helper">
                        Enter the complete official name of your educational institution
                      </div>
                    </div>
                  </div>

                  <div className="form-row single">
                    <div className="field-group">
                      <label className="field-label required">Program / Degree</label>
                      <input
                        type="text"
                        className="field-input"
                        value={formData.claimedProgram}
                        onChange={(e) => setFormData({...formData, claimedProgram: e.target.value})}
                        placeholder="e.g., Bachelor of Technology in Computer Science"
                        required
                      />
                      <div className="field-helper">
                        Include the full degree title and specialization as listed on your certificate
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Timeline Section */}
              <div className="section-card">
                <div className="section-header">
                  <h3 className="section-title">
                    Academic Timeline
                  </h3>
                  <p className="section-subtitle">
                    Specify the duration of your academic program
                  </p>
                </div>
                <div className="section-content">
                  <div className="form-row">
                    <div className="field-group">
                      <label className="field-label required">Start Year</label>
                      <input
                        type="number"
                        className="field-input"
                        value={formData.claimedStartYear}
                        onChange={(e) => setFormData({...formData, claimedStartYear: e.target.value})}
                        min="1950"
                        max="2030"
                        placeholder="2018"
                        required
                      />
                      <div className="field-helper">
                        Year you began this program
                      </div>
                    </div>
                    <div className="field-group">
                      <label className="field-label required">End Year</label>
                      <input
                        type="number"
                        className="field-input"
                        value={formData.claimedEndYear}
                        onChange={(e) => setFormData({...formData, claimedEndYear: e.target.value})}
                        min="1950"
                        max="2030"
                        placeholder="2022"
                        required
                      />
                      <div className="field-helper">
                        Year you completed or graduated
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verification Process Information */}
              <div className="collapsible">
                <div className="collapsible-header" onClick={(e) => {
                  const collapsible = e.currentTarget.parentElement;
                  collapsible?.classList.toggle('open');
                }}>
                  <h4 className="collapsible-title">How Verification Works</h4>
                  <span className="collapsible-icon">▾</span>
                </div>
                <div className="collapsible-content">
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    <div className="info-card">
                      <div className="info-label">Step 1: OCR Extraction</div>
                      <div className="info-value">AI extracts text from your uploaded document</div>
                    </div>
                    <div className="info-card">
                      <div className="info-label">Step 2: Data Matching</div>
                      <div className="info-value">Information is matched against your claims</div>
                    </div>
                    <div className="info-card">
                      <div className="info-label">Step 3: Verification</div>
                      <div className="info-value">Institution and timeline are cross-referenced</div>
                    </div>
                    <div className="info-card">
                      <div className="info-label">Step 4: Decision</div>
                      <div className="info-value">Automated approval or manual review</div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Action Bar */}
        <div className="action-bar">
          <div className="action-secondary">
            <Link href="/verification" className="btn btn-secondary">
              ← Back to Methods
            </Link>
          </div>
          <div className="action-primary">
            <button 
              onClick={handleSubmit}
              className="btn btn-primary"
              style={{ padding: '0.875rem 2rem' }}
            >
              Continue to Upload →
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
