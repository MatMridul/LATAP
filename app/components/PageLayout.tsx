interface PageLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  showBackButton?: boolean
  backHref?: string
  className?: string
}

export default function PageLayout({ 
  children, 
  title,
  subtitle,
  showBackButton = false,
  backHref = "/",
  className = ""
}: PageLayoutProps) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-50)' }} className={className}>
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
              <div className="text-lg font-semibold text-primary">{title || "LATAP"}</div>
              {subtitle && (
                <div className="text-xs text-muted">{subtitle}</div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {showBackButton && (
              <a href={backHref} className="btn btn-ghost btn-sm">
                ← Back
              </a>
            )}
            <a href="/about" className="btn btn-ghost btn-sm">
              About
            </a>
            <a href="/dashboard" className="btn btn-ghost btn-sm">
              Dashboard
            </a>
          </div>
        </div>
      </nav>

      <main className="container section">
        {children}
      </main>
    </div>
  )
}
