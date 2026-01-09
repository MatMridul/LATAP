'use client'

import Link from 'next/link'

interface NavigationProps {
  title?: string
  subtitle?: string
  showBackButton?: boolean
  backHref?: string
}

export default function Navigation({ 
  title = "LATAP", 
  subtitle,
  showBackButton = false,
  backHref = "/"
}: NavigationProps) {
  return (
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
          <div>
            <div className="text-lg font-semibold text-primary">{title}</div>
            {subtitle && (
              <div className="text-xs text-muted">{subtitle}</div>
            )}
          </div>
        </Link>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {showBackButton && (
            <Link href={backHref} className="btn btn-ghost btn-sm">
              ← Back
            </Link>
          )}
          <Link href="/about" className="btn btn-ghost btn-sm">
            About
          </Link>
          <Link href="/dashboard" className="btn btn-ghost btn-sm">
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  )
}
