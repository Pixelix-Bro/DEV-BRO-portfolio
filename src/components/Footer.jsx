'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, ArrowUp } from 'lucide-react'
import { personalInfo } from '@/data/portfolioData'

export default function Footer() {
  const [tashkentTime, setTashkentTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      // Tashkent is UTC+5
      const options = {
        timeZone: 'Asia/Tashkent',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }
      setTashkentTime(new Intl.DateTimeFormat('en-GB', options).format(now))
    }
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  const scrollToTop = () => {
    if (typeof window !== 'undefined' && window.__lenis) {
      window.__lenis.scrollTo(0, { duration: 1.2 })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <footer className="w-full border-t border-white/10 bg-black text-white pt-24 pb-12 relative overflow-hidden z-10">
      <div className="container-editorial flex flex-col gap-20">
        {/* Massive Call to Action */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
              AVAILABLE FOR NEW OPPORTUNITIES & FREELANCE
            </span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <Link
              href="/contact"
              className="group block"
              data-cursor="project"
            >
              <h2 className="text-giant font-bold tracking-tighter text-white group-hover:text-neutral-400 transition-colors duration-500 uppercase">
                LET'S TALK
              </h2>
            </Link>

            <div className="flex flex-col gap-2 pb-2">
              <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                DIRECT INQUIRIES
              </span>
              <a
                href={`mailto:${personalInfo.contactChannels[1].value}`}
                className="font-mono text-lg md:text-2xl text-neutral-200 hover:text-white underline underline-offset-8 transition-colors"
                data-cursor="link"
              >
                {personalInfo.contactChannels[1].value}
              </a>
              <a
                href={personalInfo.contactChannels[0].href}
                className="font-mono text-sm md:text-base text-neutral-400 hover:text-white transition-colors"
                data-cursor="link"
              >
                {personalInfo.contactChannels[0].value}
              </a>
            </div>
          </div>
        </div>

        {/* Separator grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-12 border-t border-white/10">
          {/* Col 1: Identity */}
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">
              DEVELOPER
            </span>
            <p className="text-sm font-light text-neutral-200">
              {personalInfo.name}
            </p>
            <p className="text-xs text-neutral-500">
              {personalInfo.role} & Creative Web Specialist
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">
              SITEMAP
            </span>
            <div className="flex flex-col gap-1.5 text-xs font-mono">
              <Link href="/" className="text-neutral-400 hover:text-white transition">
                01 / HOME
              </Link>
              <Link href="/about" className="text-neutral-400 hover:text-white transition">
                02 / ABOUT
              </Link>
              <Link href="/projects" className="text-neutral-400 hover:text-white transition">
                03 / PROJECTS
              </Link>
              <Link href="/contact" className="text-neutral-400 hover:text-white transition">
                04 / CONTACT
              </Link>
            </div>
          </div>

          {/* Col 3: Social Network */}
          <div className="flex flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">
              SOCIAL CONNECT
            </span>
            <div className="flex flex-col gap-1.5 text-xs font-mono">
              {personalInfo.socials.map((s) => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-neutral-400 hover:text-white transition group"
                  data-cursor="link"
                >
                  <span>{s.name.toUpperCase()}</span>
                  <ArrowUpRight size={12} className="opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          {/* Col 4: Local time and Back to top */}
          <div className="flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                LOCAL TIME (UZB)
              </span>
              <p className="font-mono text-lg text-white font-medium" suppressHydrationWarning>
                {tashkentTime || '17:30:00'} <span className="text-xs text-neutral-500">Namangan UTC+5</span>
              </p>
            </div>

            <button
              type="button"
              onClick={scrollToTop}
              className="self-start md:self-end flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-neutral-900/60 hover:bg-white hover:text-black hover:border-white transition-all text-xs font-mono tracking-widest"
              data-cursor="link"
            >
              <span>BACK TO TOP</span>
              <ArrowUp size={13} />
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10 text-xs font-mono text-neutral-500">
          <p>© {new Date().getFullYear()} {personalInfo.name} ({personalInfo.brandName}). All rights reserved.</p>
          <p className="text-neutral-600">EDITORIAL BLACK & WHITE EDITION</p>
        </div>
      </div>
    </footer>
  )
}
