import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Zuck AI - Facebook Ad Strategist Assistant',
  description: 'Ivy League-level AI assistant for Facebook Ads. Upload your ad creative and get intelligent GPT-powered analysis with 2-5 new campaign recommendations.',
  keywords: 'Facebook Ads, AI, Marketing, Ad Strategy, GPT, Campaign Optimization',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
} 