'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface UploadedFile {
  file: File
  preview: string
  status: 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
}

export default function VerificationUpload() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [isAnimated, setIsAnimated] = useState(false)

  useEffect(() => {
    setIsAnimated(true)
  }, [])

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    Array.from(files).forEach(file => {
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        const newFile: UploadedFile = {
          file,
          preview: URL.createObjectURL(file),
          status: 'uploading',
          progress: 0
        }
        
        setUploadedFiles(prev => [...prev, newFile])
        simulateUpload(file.name)
      }
    })
  }

  const simulateUpload = (fileName: string) => {
    const interval = setInterval(() => {
      setUploadedFiles(prev => prev.map(f => {
        if (f.file.name === fileName) {
          if (f.progress < 100) {
            return { ...f, progress: f.progress + 10 }
          } else if (f.status === 'uploading') {
            return { ...f, status: 'processing' }
          } else if (f.status === 'processing') {
            return { ...f, status: 'completed' }
          }
        }
        return f
      }))
    }, 200)

    setTimeout(() => clearInterval(interval), 3000)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const removeFile = (fileName: string) => {
    setUploadedFiles(prev => prev.filter(f => f.file.name !== fileName))
  }

  const handleContinue = () => {
    if (uploadedFiles.some(f => f.status === 'completed')) {
      router.push('/verification/status')
    }
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
              <div className="nav-subtitle">Document Upload</div>
            </div>
          </Link>
          <div className="nav-actions">
            <div className="status-badge status-pending">
              Step 3 of 4
            </div>
          </div>
        </div>
      </nav>

      <div className="container section">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: '3rem' }}
          >
            <h1 className="text-3xl font-semibold text-primary" style={{ marginBottom: '1rem' }}>
              Upload Verification Documents
            </h1>
            <p className="text-lg text-secondary" style={{ maxWidth: '500px', margin: '0 auto' }}>
              Upload your academic certificates, transcripts, or other credential documents 
              for secure verification processing.
            </p>
          </motion.div>

          {/* Upload Area */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card card-floating"
          >
            <motion.div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              animate={{
                borderColor: dragOver ? 'var(--accent-500)' : 'var(--surface-300)',
                backgroundColor: dragOver ? 'var(--accent-50)' : 'var(--surface-50)',
                scale: dragOver ? 1.02 : 1
              }}
              transition={{ duration: 0.2 }}
              style={{
                padding: '3rem 2rem',
                border: '2px dashed var(--surface-300)',
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              <motion.div
                animate={{
                  backgroundColor: dragOver ? 'var(--accent-100)' : 'var(--surface-200)',
                  scale: dragOver ? 1.1 : 1
                }}
                transition={{ duration: 0.2 }}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem'
                }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={dragOver ? 'var(--accent-600)' : 'var(--text-muted)'} strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </motion.div>
              
              <h3 className="text-xl font-semibold text-primary" style={{ marginBottom: '0.5rem' }}>
                {dragOver ? 'Drop files here' : 'Upload Documents'}
              </h3>
              <p className="text-secondary" style={{ marginBottom: '1rem' }}>
                Drag and drop files here, or click to browse
              </p>
              <p className="text-sm text-muted">
                Supports PDF, JPG, PNG • Max 10MB per file
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileSelect(e.target.files)}
                style={{ display: 'none' }}
              />
            </motion.div>
          </motion.div>

          {/* Uploaded Files */}
          <AnimatePresence>
            {uploadedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                style={{ marginTop: '2rem' }}
              >
                <h3 className="text-lg font-semibold text-primary" style={{ marginBottom: '1rem' }}>
                  Uploaded Documents
                </h3>
                
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {uploadedFiles.map((uploadedFile, index) => (
                    <motion.div
                      key={uploadedFile.file.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="card card-elevated"
                    >
                      <div className="card-body">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <motion.div
                            animate={{ 
                              backgroundColor: uploadedFile.status === 'completed' ? 'var(--success-50)' : 'var(--surface-100)'
                            }}
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: 'var(--radius-md)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              fontSize: '1.5rem'
                            }}
                          >
                            {uploadedFile.status === 'completed' ? (
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--success-600)" strokeWidth="2">
                                <polyline points="20,6 9,17 4,12"/>
                              </svg>
                            ) : (
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14,2 14,8 20,8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                                <polyline points="10,9 9,9 8,9"/>
                              </svg>
                            )}
                          </motion.div>
                          
                          <div style={{ flex: 1 }}>
                            <div className="font-medium text-primary" style={{ marginBottom: '0.25rem' }}>
                              {uploadedFile.file.name}
                            </div>
                            <div className="text-sm text-muted" style={{ marginBottom: '0.5rem' }}>
                              {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                            
                            {uploadedFile.status === 'uploading' && (
                              <div>
                                <div style={{
                                  width: '100%',
                                  height: '4px',
                                  background: 'var(--surface-200)',
                                  borderRadius: '2px',
                                  overflow: 'hidden'
                                }}>
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${uploadedFile.progress}%` }}
                                    transition={{ duration: 0.2 }}
                                    style={{
                                      height: '100%',
                                      background: 'var(--accent-600)',
                                      borderRadius: '2px'
                                    }}
                                  />
                                </div>
                                <div className="text-xs text-muted" style={{ marginTop: '0.25rem' }}>
                                  Uploading... {uploadedFile.progress}%
                                </div>
                              </div>
                            )}
                            
                            {uploadedFile.status === 'processing' && (
                              <div className="status-badge status-pending">
                                <div className="animate-pulse" style={{ width: '6px', height: '6px', background: 'var(--warning-500)', borderRadius: '50%' }}></div>
                                Processing
                              </div>
                            )}
                            
                            {uploadedFile.status === 'completed' && (
                              <div className="status-badge status-verified">
                                <div style={{ width: '6px', height: '6px', background: 'var(--success-500)', borderRadius: '50%' }}></div>
                                Ready for Verification
                              </div>
                            )}
                          </div>
                          
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeFile(uploadedFile.file.name)}
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '0.5rem', minWidth: 'auto' }}
                          >
                            ×
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginTop: '3rem'
            }}
          >
            <Link href="/verification/claim" className="btn btn-ghost">
              ← Back to Claims
            </Link>

            <motion.button
              whileHover={{ scale: uploadedFiles.some(f => f.status === 'completed') ? 1.05 : 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleContinue}
              className="btn btn-primary btn-lg"
              disabled={!uploadedFiles.some(f => f.status === 'completed')}
            >
              Continue to Verification →
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
