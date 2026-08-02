import 'aos/dist/aos.css'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import ContourBackground from './backgraund'
import './globals.css'
import Navbar from './Navbar/Navbar'
import 'velore/velore.css'

const siteUrl = 'https://pixelix.uz'
const authorName = 'Ubaydulloh Dadaxanov'
const siteName = 'Pixelix'

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
    "Pixelix — Ubaydulloh Dadaxanov tomonidan yaratilgan zamonaviy veb-saytlar va ilovalar portfolio sahifasi. React, Next.js va fullstack loyihalar, ko'nikmalar va bog'lanish ma'lumotlari.",
  keywords: [
    'Pixelix',
    'Ubaydulloh Dadaxanov',
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
    'Tailwind CSS',
  ],
  applicationName: siteName,
  generator: 'Next.js',
  category: 'technology',
  classification: 'Portfolio',
  authors: [{ name: authorName, url: siteUrl }],
  creator: authorName,
  publisher: authorName,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/icon-120x120.png', sizes: '120x120', type: 'image/png' },
      { url: '/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icon-167x167.png', sizes: '167x167', type: 'image/png' },
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/logo.png',
        color: '#7C3AED',
      },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'uz_UZ',
    alternateLocale: ['en_US', 'ru_RU'],
    url: siteUrl,
    siteName,
    title: 'Pixelix — Portfolio & Web Development',
    description:
      'Pixelix — Ubaydulloh Dadaxanov tomonidan yaratilgan zamonaviy veb-saytlar va ilovalar portfolio sahifasi.',
    images: [
      {
        url: '/og-banner.png',
        width: 1200,
        height: 630,
        alt: 'Pixelix — Portfolio & Web Development',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@pixelix',
    creator: '@pixelix',
    title: 'Pixelix — Portfolio & Web Development',
    description:
      'Pixelix — Ubaydulloh Dadaxanov tomonidan yaratilgan zamonaviy veb-saytlar va ilovalar portfolio sahifasi.',
    images: [
      {
        url: '/og-banner.png',
        alt: 'Pixelix — Portfolio & Web Development',
      },
    ],
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
      'x-default': siteUrl,
    },
  },
  appleWebApp: {
    capable: true,
    title: siteName,
    statusBarStyle: 'black-translucent',
  },
  verification: {
    google: 'FaHcjtLEfbXFTu0cGOo0h-XP8DvASdtFqo3EXieANak',
  },
  referrer: 'origin-when-cross-origin',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  '@id': `${siteUrl}/#profilepage`,
  url: siteUrl,
  name: `${authorName} — Pixelix`,
  description:
    "Pixelix — Ubaydulloh Dadaxanov tomonidan yaratilgan zamonaviy veb-saytlar va ilovalar portfolio sahifasi.",
  inLanguage: 'uz-UZ',
  mainEntity: {
    '@type': 'Person',
    '@id': `${siteUrl}/#person`,
    name: authorName,
    alternateName: ['Pixelix', 'Pixelix Bro'],
    url: siteUrl,
    image: `${siteUrl}/logo.png`,
    jobTitle: 'Web Developer / Fullstack Developer',
    description:
      "React, Next.js va zamonaviy texnologiyalar asosida veb-saytlar va ilovalar yaratuvchi dasturchi.",
    knowsAbout: [
      'React',
      'Next.js',
      'Frontend Development',
      'Fullstack Development',
      'Tailwind CSS',
      'Node.js',
    ],
    sameAs: [
      'https://github.com/Pixelix-Bro',
      'https://t.me/Pixeelix',
      'https://www.instagram.com/pixelixbro/',
      'https://www.linkedin.com/in/ubaydulloh-dadahanov',
    ],
    nationality: {
      '@type': 'Country',
      name: 'Uzbekistan',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Tashkent',
      addressCountry: 'UZ',
    },
  },
}

export default function RootLayout({ children }) {
  return (
    <html
      lang="uz"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      </head>

      <body className="min-h-full flex flex-col items-center justify-center bg-black">
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
