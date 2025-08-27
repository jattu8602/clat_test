import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Metadata } from 'next'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata = {
  title: {
    default: 'OUTLAWED | CLAT Exam Tests | CLAT Exam Preparation',
    template: '%s | Hackwave',
  },
  description:
    'Where the boldest builders come to play. Join Hackwave, the ultimate hackathon experience for innovators, creators, and tech enthusiasts.',
  keywords: [
    'Hackwave',
    'Hackathon',
    'Indore',
    'Tech Event',
    'Developers',
    'Innovation',
    'Builders',
    'Coding',
    'Competition',
    '2025',
  ],
  metadataBase: new URL('https://hackwave-site.vercel.app/'),
  openGraph: {
    title: 'Hackwave | Join the Movement',
    description:
      'Where the boldest builders come to play. Join Hackwave, the ultimate hackathon experience for innovators, creators, and tech enthusiasts.',
    url: 'https://hackwave-site.vercel.app/',
    siteName: 'Hackwave',
    // images: [
    //   {
    //     url: "/assets/hackwave title.png",
    //     width: 1200,
    //     height: 630,
    //     alt: "Hackwave Hackathon Banner",
    //   },
    // ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hackwave | Join the Movement',
    description:
      'Where the boldest builders come to play. Join Hackwave, the ultimate hackathon experience for innovators, creators, and tech enthusiasts.',
    images: ['/assets/hackwave title.png'],
    site: '@hackwavein',
    creator: '@hackwavein',
  },
  icons: {
    icon: [
      { url: '/favicon_io/favicon.ico' },
      {
        url: '/favicon_io/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: '/favicon_io/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: '/favicon_io/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    shortcut: [{ url: '/favicon_io/favicon.ico' }],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <meta
        name="google-site-verification"
        content="23j7kqfTKi8Qhtb7WXt4RA1xX_I1q83sxv4IFsW_kes"
      />

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
