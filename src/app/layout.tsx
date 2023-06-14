import { Inter } from 'next/font/google'
import { Providers } from './providers'
import NavBar from '@/components/NavBar'
import { Footer } from '@/components/Footer'
import NextTopLoader from 'nextjs-toploader'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Archive Forever',
  description: "Archive a url's html and screenshot to Arweave"
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
          <div style={{ marginTop: '70px', minHeight: 'calc(100vh - 70px)' }}>
            {children}
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
