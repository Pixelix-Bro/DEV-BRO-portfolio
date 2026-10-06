'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { personalInfo } from '@/data/portfolioData'

gsap.registerPlugin(ScrollTrigger)

const navLinks = [
  { num: '01', title: 'Home', href: '/' },
  { num: '02', title: 'About', href: '/about' },
  { num: '03', title: 'Projects', href: '/projects' },
  { num: '04', title: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const pathname = usePathname()
  const navRef = useRef(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const nav = navRef.current
    if (!nav) return

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > 100) {
        if (currentScrollY > lastScrollY.current && !mobileOpen) {
          // Scrolling down -> hide navbar
          gsap.to(nav, { yPercent: -120, duration: 0.35, ease: 'power3.out' })
        } else {
          // Scrolling up -> reveal navbar
          gsap.to(nav, { yPercent: 0, duration: 0.35, ease: 'power3.out' })
        }
      } else {
        gsap.to(nav, { yPercent: 0, duration: 0.35, ease: 'power3.out' })
      }
      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [mobileOpen])

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <>
      <header
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 md:py-6 px-6 md:px-12 flex justify-center pointer-events-none"
      >
        <div className="w-full max-w-7xl flex items-center justify-between pointer-events-auto">
          {/* Logo / Monogram */}
          <Link
            href="/"
            className="group flex items-center gap-3 text-white transition-opacity"
            data-cursor="link"
          >
            <div className="w-9 h-9 rounded-full border border-white/20 bg-black/60 backdrop-blur-md flex items-center justify-center font-mono text-xs font-bold tracking-tighter group-hover:border-white transition-colors duration-300">
              P
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-xs tracking-widest uppercase font-semibold text-white group-hover:text-neutral-300 transition-colors">
                {personalInfo.brandName}
              </span>
              <span className="font-mono text-[9px] text-neutral-500 tracking-wider hidden sm:inline">
                Namangan, UZ
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1 px-4 py-2 rounded-full border border-white/10 bg-black/70 backdrop-blur-xl shadow-2xl">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group relative px-4 py-1.5 text-xs font-mono uppercase tracking-widest transition-all duration-300 rounded-full flex items-center gap-1.5 ${
                    isActive
                      ? 'text-black bg-white font-bold'
                      : 'text-neutral-400 hover:text-white hover:tracking-[0.18em]'
                  }`}
                  data-cursor="link"
                >
                  <span className={`text-[10px] ${isActive ? 'text-black/60' : 'text-neutral-600 group-hover:text-neutral-400'}`}>
                    {link.num}
                  </span>
                  <span>{link.title}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right Action / Mobile Button */}
          <div className="flex items-center gap-3">
            <Link
              href="/rezume/Rezume_My.pdf"
              download
              className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-xs font-mono tracking-widest text-white hover:bg-white hover:text-black hover:border-white transition-all duration-300"
              data-cursor="link"
            >
              RESUME.PDF
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation"
              className="md:hidden w-11 h-11 rounded-full border border-white/20 bg-black/70 backdrop-blur-md flex flex-col items-center justify-center gap-1.5 transition hover:border-white"
            >
              <span
                className={`w-5 h-[1.5px] bg-white transition-transform duration-300 ${
                  mobileOpen ? 'rotate-45 translate-y-[4.5px]' : ''
                }`}
              />
              <span
                className={`w-5 h-[1.5px] bg-white transition-transform duration-300 ${
                  mobileOpen ? '-rotate-45 -translate-y-[4.5px]' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Editorial Drawer */}
      <div
        className={`fixed inset-0 z-40 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-8 pt-28 transition-all duration-500 md:hidden ${
          mobileOpen ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none -translate-y-8'
        }`}
      >
        <div className="flex flex-col gap-6">
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-500">
            NAVIGATION INDEX
          </p>
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-baseline gap-4 py-2 border-b border-white/10 text-2xl font-light tracking-tight ${
                  pathname === link.href ? 'text-white pl-3 border-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span className="font-mono text-xs text-neutral-600">{link.num}</span>
                <span>{link.title}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-4 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
            <span>RESUME</span>
            <a
              href="/rezume/Rezume_My.pdf"
              download
              className="text-white underline underline-offset-4"
              onClick={() => setMobileOpen(false)}
            >
              DOWNLOAD CV
            </a>
          </div>
          <div className="flex gap-4 pt-2 text-xs font-mono text-neutral-400">
            <a href="https://github.com/Pixelix-Bro" target="_blank" rel="noopener noreferrer">
              GITHUB
            </a>
            <a href="https://t.me/Pixeelix" target="_blank" rel="noopener noreferrer">
              TELEGRAM
            </a>
            <a href="https://www.linkedin.com/in/ubaydulloh-dadahanov" target="_blank" rel="noopener noreferrer">
              LINKEDIN
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
