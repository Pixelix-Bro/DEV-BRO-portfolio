import 'aos/dist/aos.css'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import ContourBackground from './backgraund'
import './globals.css'
import Navbar from './Navbar/Navbar'

const siteUrl = 'https://pixelix.uz'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#7C3AED' },
    { media: '(prefers-color-scheme: dark)', color: '#0f0c29' },
  ],
  colorScheme: 'dark light',
}

export const metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: 'Pixelix — Portfolio & Web Development',
    template: '%s | Pixelix',
  },
  description:
    "Pixelix — zamonaviy veb-saytlar va ilovalar yaratuvchi dasturchi portfolio sahifasi. Loyihalar, ko'nikmalar va bog'lanish uchun ma'lumotlar.",
  keywords: [
    'Pixelix',
    'portfolio',
    'web developer',
    'frontend developer',
    'fullstack developer',
    'dasturchi',
    'veb dasturlash',
    'veb sayt yaratish',
    'Uzbekistan developer',
    'Tashkent developer',
    'React developer',
    'Next.js developer',
  ],

  applicationName: 'Pixelix',
  generator: 'Next.js',
  category: 'technology',
  classification: 'Portfolio',

  authors: [{ name: 'Pixelix', url: siteUrl }],
  creator: 'Pixelix',
  publisher: 'Pixelix',

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: ['/favicon.png'],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },

  manifest: '/site.webmanifest',

  openGraph: {
    type: 'website',
    locale: 'uz_UZ',
    alternateLocale: ['en_US', 'ru_RU'],
    url: siteUrl,
    siteName: 'Pixelix',
    title: 'Pixelix — Portfolio & Web Development',
    description:
      'Pixelix — zamonaviy veb-saytlar va ilovalar yaratuvchi dasturchi portfolio sahifasi.',
    images: [
      {
        url: './og-banner.png',
        width: 1200,
        height: 630,
        alt: 'Pixelix — Portfolio',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    site: '@pixelix',
    creator: '@pixelix',
    title: 'Pixelix — Portfolio & Web Development',
    description:
      'Pixelix — zamonaviy veb-saytlar va ilovalar yaratuvchi dasturchi portfolio sahifasi.',
    images: ['/og-banner.png'],
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  alternates: {
    canonical: siteUrl,
    languages: {
      'uz-UZ': siteUrl,
      'en-US': `${siteUrl}/en`,
      'ru-RU': `${siteUrl}/ru`,
    },
  },

  appleWebApp: {
    capable: true,
    title: 'Pixelix',
    statusBarStyle: 'black-translucent',
  },

  verification: {
    google: 'google-site-verification-kodingiz',
    yandex: 'yandex-verification-kodingiz',
  },

  referrer: 'origin-when-cross-origin',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  mainEntity: {
    '@type': 'Person',
    name: 'Pixelix',
    url: siteUrl,
    image: `${siteUrl}/logo.png`,
    jobTitle: 'Web Developer',
    sameAs: [
      'https://github.com/Pixelix-Bro',
      'https://t.me/Pixeelix',
      'https://www.instagram.com/pixelixbro/',
    ],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="uz" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col items-center justify-center contenr bg-black ">
        <Toaster position="top-center" />
        <ContourBackground />
        <Navbar />
        <main className="min-h-full flex flex-col lg:mt-[120px] mt-[120px] w-full max-w-[1300px]">
          {children}
        </main>
      </body>
    </html>
  )
}
