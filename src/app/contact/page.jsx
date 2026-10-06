'use client'

import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { toast } from 'sonner'
import {
  ArrowUpRight,
  Send,
  Phone,
  Mail,
  MessageSquare,
  Sparkles,
} from 'lucide-react'

import { personalInfo } from '@/data/portfolioData'
import { SiGithub, SiInstagram, SiTelegram } from 'react-icons/si'
import { SlSocialLinkedin } from 'react-icons/sl'

export default function ContactPage() {
  const containerRef = useRef(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [send, setSend] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.title = 'Pixelix | Contact & Inquiries'
  }, [])

  useGSAP(
    () => {
      // Safe entrance animations with clearProps: 'all' to guarantee NO element disappears
      gsap.fromTo(
        '.contact-hero-reveal',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          clearProps: 'all',
        }
      )

      gsap.fromTo(
        '.contact-channel-item',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power3.out',
          clearProps: 'all',
          delay: 0.2,
        }
      )

      gsap.fromTo(
        '.contact-form-panel',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          clearProps: 'all',
          delay: 0.3,
        }
      )
    },
    { scope: containerRef }
  )

  async function handleSubmit(e) {
    e.preventDefault()

    if (!name.trim() || !email.trim() || !send.trim()) {
      toast.error('Please fill in all required fields.')
      return
    }

    try {
      setLoading(true)

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, send }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Habar Yuborildi! Your message has been sent successfully.')
        setName('')
        setEmail('')
        setSend('')
      } else {
        toast.error('Failed to dispatch message. Please try again or reach out directly.')
      }
    } catch (err) {
      console.error(err)
      toast.error('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      ref={containerRef}
      className="w-full flex flex-col container-editorial pt-8 pb-32 relative z-10"
    >
      {/* ------------------------------------------------------------------------- */}
      {/* SECTION 1: EDITORIAL HEADER                                              */}
      {/* ------------------------------------------------------------------------- */}
      <div className="flex flex-col gap-6 border-b border-white/10 pb-12">
        <div className="flex items-center justify-between text-xs font-mono text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-neutral-400">COMMUNICATION TERMINAL // 04</span>
          </div>
          <span>Namangan, UZBEKISTAN (UTC+5)</span>
        </div>

        <div className="overflow-hidden">
          <h1 className="contact-hero-reveal text-giant font-extrabold uppercase tracking-tight text-white leading-none">
            CONTACT.
          </h1>
        </div>
      </div>

      {/* ------------------------------------------------------------------------- */}
      {/* SECTION 2: DIRECT REACH & FUNCTIONAL TELEGRAM FORM                       */}
      {/* ------------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 py-16 items-start">
        {/* Left: DIRECT REACH (Guaranteed always visible and permanently rendered) */}
        <div className="lg:col-span-5 flex flex-col gap-8 opacity-100">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
                DIRECT REACH
              </span>
            </div>

            <h2 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-white leading-tight">
              GET IN TOUCH DIRECTLY
            </h2>

            <p className="text-sm md:text-base text-neutral-300 font-light leading-relaxed">
              Whether you have an inquiry regarding a new frontend application,
              freelance project, or collaboration, feel free to reach out
              directly through any of the channels below.
            </p>
          </div>

          {/* Contact Cards with Authentic Brand Colors */}
          <div className="flex flex-col gap-4">
            {/* 1. Phone Card */}
            <a
              href="tel:+998906931808"
              className="contact-channel-item group p-6 rounded-2xl border border-white/15 bg-neutral-950/80 backdrop-blur-xl flex items-center justify-between hover:border-emerald-500 hover:shadow-[0_0_25px_rgba(34,197,94,0.15)] transition-all duration-300"
              data-cursor="link"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                  <Phone size={22} />
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider">
                    Contact via phone
                  </span>
                  <span className="text-base md:text-lg font-mono text-white group-hover:text-emerald-400 transition-colors font-semibold">
                    +998906931808
                  </span>
                </div>
              </div>

              <ArrowUpRight
                size={18}
                className="text-neutral-500 group-hover:text-emerald-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"
              />
            </a>

            {/* 2. Email Card */}
            <a
              href="mailto:lazizbekxoljigitov@gmail.com"
              className="contact-channel-item group p-6 rounded-2xl border border-white/15 bg-neutral-950/80 backdrop-blur-xl flex items-center justify-between hover:border-red-500 hover:shadow-[0_0_25px_rgba(239,68,68,0.15)] transition-all duration-300"
              data-cursor="link"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl border border-red-500/30 bg-red-500/10 flex items-center justify-center text-red-400 group-hover:scale-110 group-hover:bg-red-500 group-hover:text-black transition-all">
                  <Mail size={22} />
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider">
                    Contact via message / email
                  </span>
                  <span className="text-sm md:text-base font-mono text-white group-hover:text-red-400 transition-colors font-semibold break-all">
                    lazizbekxoljigitov@gmail.com
                  </span>
                </div>
              </div>

              <ArrowUpRight
                size={18}
                className="text-neutral-500 group-hover:text-red-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"
              />
            </a>

            {/* 3. Telegram Card */}
            <a
              href="https://t.me/Pixeelix"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-channel-item group p-6 rounded-2xl border border-white/15 bg-neutral-950/80 backdrop-blur-xl flex items-center justify-between hover:border-sky-400 hover:shadow-[0_0_25px_rgba(56,189,248,0.15)] transition-all duration-300"
              data-cursor="link"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl border border-sky-400/30 bg-sky-400/10 flex items-center justify-center text-sky-400 group-hover:scale-110 group-hover:bg-sky-400 group-hover:text-black transition-all">
                  <SiTelegram size={22} />
                </div>
                <div className="flex flex-col">
                  <span className="font-mono text-[11px] text-neutral-400 uppercase tracking-wider">
                    Contact via Telegram
                  </span>
                  <span className="text-base md:text-lg font-mono text-white group-hover:text-sky-400 transition-colors font-semibold">
                    @Pixeelix
                  </span>
                </div>
              </div>

              <ArrowUpRight
                size={18}
                className="text-neutral-500 group-hover:text-sky-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"
              />
            </a>
          </div>

          {/* Social Platforms Row */}
          <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">
              SOCIAL PLATFORMS
            </span>
            <div className="flex flex-wrap gap-2.5">
              <a
                href="https://github.com/Pixelix-Bro"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/5 font-mono text-xs text-white hover:border-white hover:bg-white hover:text-black transition"
                data-cursor="link"
              >
                <SiGithub size={14} />
                <span>GitHub</span>
              </a>

              <a
                href="https://www.linkedin.com/in/ubaydulloh-dadahanov"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 font-mono text-xs text-blue-400 hover:border-blue-400 hover:bg-blue-500 hover:text-white transition"
                data-cursor="link"
              >
                <SlSocialLinkedin size={14} />
                <span>LinkedIn</span>
              </a>

              <a
                href="https://t.me/Pixeelix"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-sky-400/30 bg-sky-400/10 font-mono text-xs text-sky-400 hover:border-sky-400 hover:bg-sky-400 hover:text-black transition"
                data-cursor="link"
              >
                <SiTelegram size={14} />
                <span>Telegram</span>
              </a>

              <a
                href="https://www.instagram.com/pixelixbro/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-pink-500/30 bg-pink-500/10 font-mono text-xs text-pink-400 hover:border-pink-400 hover:bg-pink-500 hover:text-white transition"
                data-cursor="link"
              >
                <SiInstagram size={14} />
                <span>Instagram</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right: Functional Telegram-connected Form */}
        <div className="contact-form-panel lg:col-span-7 flex flex-col gap-6 p-8 md:p-12 rounded-3xl border border-white/15 bg-neutral-950/90 backdrop-blur-2xl shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-white" />
              <span className="font-mono text-xs uppercase tracking-widest text-neutral-300">
                DISPATCH FORM // TELEGRAM GATEWAY
              </span>
            </div>
            <span className="font-mono text-[10px] text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>LIVE BOT ACTIVE</span>
            </span>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="font-mono text-xs uppercase tracking-widest text-neutral-300">
                  YOUR NAME <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Smith"
                  className="w-full px-5 py-4 rounded-xl border border-white/15 bg-black text-white font-mono text-sm placeholder:text-neutral-600 focus:outline-none focus:border-white transition"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-mono text-xs uppercase tracking-widest text-neutral-300">
                  YOUR EMAIL <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alex@example.com"
                  className="w-full px-5 py-4 rounded-xl border border-white/15 bg-black text-white font-mono text-sm placeholder:text-neutral-600 focus:outline-none focus:border-white transition"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs uppercase tracking-widest text-neutral-300">
                MESSAGE <span className="text-emerald-400">*</span>
              </label>
              <textarea
                required
                rows={6}
                value={send}
                onChange={(e) => setSend(e.target.value)}
                placeholder="Describe your project, timeline, or inquiry..."
                className="w-full px-5 py-4 rounded-xl border border-white/15 bg-black text-white font-mono text-sm placeholder:text-neutral-600 focus:outline-none focus:border-white transition resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-white text-black font-mono text-xs uppercase font-bold tracking-widest hover:bg-neutral-200 transition flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl mt-2"
              data-cursor="link"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>TRANSMITTING MESSAGE...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>SEND MESSAGE</span>
                </>
              )}
            </button>
          </form>

          <p className="font-mono text-[11px] text-neutral-400 text-center pt-2">
            Dispatches directly to Telegram notification bot. Expected response
            within 24 hours.
          </p>
        </div>
      </div>
    </div>
  )
}
