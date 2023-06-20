import { Inter } from 'next/font/google'
import { Providers } from './providers'
import NavBar from '@/components/Navigation/NavBar'
import { Footer } from '@/components/Navigation/Footer'
import NextTopLoader from 'nextjs-toploader'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'PermaTok: Save Tiktok to Arweave',
  description: 'Save a Tiktok video to Arweave'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <NextTopLoader />
          <NavBar />
          <div
            style={{
              marginTop: '80px',
              minHeight: 'calc(100vh - 150px)',
              overflowY: 'auto'
            }}
          >
            {children}
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
