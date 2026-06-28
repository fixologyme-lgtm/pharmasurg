import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PharmaBridge — Supremus × Siam Surgery',
  description: 'Pharmacy–GP clinical triage bridge',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'PharmaBridge' },
}

export const viewport: Viewport = {
  width: 1024,
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <div id="app-frame">{children}</div>
      </body>
    </html>
  )
}
