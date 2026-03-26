import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'NeuroPulse — EEG Cognitive Assessment',
  description: 'AI-powered EEG analysis for MMSE score prediction and Alzheimer\'s screening support.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <Navbar />
        {children}
        <Footer />
        <Toaster
          theme="dark"
          position="top-right"
          richColors
          toastOptions={{
            style: {
              background: '#0f150f',
              border: '1px solid #253525',
              color: '#f0faf0',
              fontFamily: "'Inter', sans-serif",
              borderRadius: '12px',
            },
          }}
        />
      </body>
    </html>
  )
}