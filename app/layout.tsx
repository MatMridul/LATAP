import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LATAP - Localized Alumni & Talent Acquisition Platform',
  description: 'Digital India-enabled talent platform connecting students, alumni, and hirers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  )
}
