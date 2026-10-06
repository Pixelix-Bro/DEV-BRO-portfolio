'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Icon } from '@iconify/react'
import {
  ArrowDown,
  ArrowUpRight,
  Download,
  Info,
  Terminal,
  Layers,
  Sparkles,
  ExternalLink,
  Code2,
} from 'lucide-react'

import {
  personalInfo,
  projects,
  skills,
  capabilities,
} from '@/data/portfolioData'
import SkillIcon, { skillColors } from '@/components/SkillIcon'

gsap.registerPlugin(ScrollTrigger)

export default function HomePage() {
  const containerRef = useRef(null)
  const heroRef = useRef(null)
  const heroTextRef = useRef(null)
  const heroWatermarkRef = useRef(null)
  const pinnedProjectsRef = useRef(null)
  const horizontalSectionRef = useRef(null)
  const horizontalTrackRef = useRef(null)

  useEffect(() => {
    document.title = `${personalInfo.brandFullName} | Portfolio & Web Architecture`
  }, [])

  useGSAP(
    () => {
      // 1. HERO ENTRANCE ANIMATION
      const heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } })

      heroTl
        .from('.hero-badge', {
          y: -30,
          opacity: 0,
          duration: 0.8,
          delay: 0.2,
        })
        .from(
          '.hero-line',
          {
            yPercent: 120,
            opacity: 0,
            duration: 1.2,
            stagger: 0.15,
            ease: 'power4.out',
          },
          '-=0.5'
        )
        .from(
          '.hero-image-wrap',
          {
            scale: 0.85,
            opacity: 0,
            duration: 1.4,
            ease: 'expo.out',
          },
          '-=1.0'
        )
        .from(
          '.hero-meta',
          {
            y: 40,
            opacity: 0,
            duration: 0.9,
            stagger: 0.1,
          },
          '-=0.8'
        )

      // 2. HERO SCROLLTRIGGER SCRUB
      gsap.to(heroRef.current, {
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
        yPercent: -20,
        scale: 0.94,
        opacity: 0.25,
        ease: 'none',
      })

      // Background watermark parallax
      if (heroWatermarkRef.current) {
        gsap.to(heroWatermarkRef.current, {
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2,
          },
          yPercent: 35,
          rotate: 15,
          ease: 'none',
        })
      }

      // 3. EDITORIAL INTRO STATEMENT WORD-REVEAL SCRUB
      const introWords = gsap.utils.toArray('.intro-word')
      if (introWords.length) {
        gsap.fromTo(
          introWords,
          { color: '#333333' },
          {
            color: '#FFFFFF',
            stagger: 0.05,
            scrollTrigger: {
              trigger: '.intro-section',
              start: 'top 75%',
              end: 'bottom 45%',
              scrub: true,
            },
          }
        )
      }

      // Responsive GSAP MatchMedia (Section 31)
      const mm = gsap.matchMedia()

      // DESKTOP: FULL PINNED SHOWCASE & HORIZONTAL SCROLL
      mm.add('(min-width: 1024px)', () => {
        const projectPanels = gsap.utils.toArray('.desktop-pinned-card')
        if (projectPanels.length && pinnedProjectsRef.current) {
          const pinTl = gsap.timeline({
            scrollTrigger: {
              trigger: pinnedProjectsRef.current,
              start: 'top top',
              end: `+=${projectPanels.length * 100}%`,
              pin: true,
              scrub: 1,
              anticipatePin: 1,
            },
          })

          projectPanels.forEach((panel, index) => {
            if (index === 0) return

            if (index === 1) {
              // Project 2: rotation + Y movement
              pinTl.fromTo(
                panel,
                { yPercent: 100, rotate: 3, opacity: 0 },
                {
                  yPercent: 0,
                  rotate: 0,
                  opacity: 1,
                  duration: 1,
                  ease: 'power2.inOut',
                }
              )
            } else if (index === 2) {
              // Project 3: clip-path reveal + scale
              pinTl.fromTo(
                panel,
                {
                  clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
                  scale: 0.9,
                  opacity: 0,
                },
                {
                  clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                  scale: 1,
                  opacity: 1,
                  duration: 1,
                  ease: 'power2.inOut',
                }
              )
            }
          })
        }

        // Horizontal scroll track for capabilities
        if (horizontalSectionRef.current && horizontalTrackRef.current) {
          const track = horizontalTrackRef.current
          const scrollDist = track.scrollWidth - window.innerWidth + 160

          if (scrollDist > 0) {
            gsap.to(track, {
              x: -scrollDist,
              ease: 'none',
              scrollTrigger: {
                trigger: horizontalSectionRef.current,
                start: 'top top',
                end: `+=${scrollDist}`,
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true,
              },
            })
          }
        }
      })

      // MOBILE & TABLET: NATURAL FLUID STACKS WITH ENTRANCE REVEALS
      mm.add('(max-width: 1023px)', () => {
        gsap.from('.mobile-project-card', {
          scrollTrigger: {
            trigger: '.mobile-projects-wrapper',
            start: 'top 85%',
          },
          y: 40,
          opacity: 0,
          stagger: 0.2,
          duration: 0.8,
          ease: 'power3.out',
        })
      })

      // LINE STAGGERS FOR ABOUT TEASER
      const aboutLines = gsap.utils.toArray('.about-line-anim')
      if (aboutLines.length) {
        gsap.from(aboutLines, {
          scrollTrigger: {
            trigger: '.about-teaser-section',
            start: 'top 80%',
          },
          x: (i) => (i % 2 === 0 ? -60 : 60),
          opacity: 0,
          duration: 1,
          stagger: 0.15,
          ease: 'power3.out',
        })
      }
    },
    { scope: containerRef }
  )

  const bioWords = personalInfo.heroBio.split(' ')

  return (
    <div ref={containerRef} className="w-full flex flex-col relative selection:bg-white selection:text-black">
      {/* ------------------------------------------------------------------------- */}
      {/* SECTION 1: HERO (Massive Editorial Typography, Whitespace, Parallax)     */}
      {/* ------------------------------------------------------------------------- */}
      <section
        ref={heroRef}
        className="min-h-[92vh] w-full flex flex-col justify-between container-editorial pt-8 pb-16 relative overflow-hidden"
      >
        {/* Oversized Circular Background Element */}
        <div
          ref={heroWatermarkRef}
          className="absolute -top-12 -right-24 md:-top-24 md:-right-36 w-[450px] md:w-[750px] h-[450px] md:h-[750px] rounded-full border border-white/[0.04] pointer-events-none select-none flex items-center justify-center -z-10"
        >
          <div className="w-[80%] h-[80%] rounded-full border border-dashed border-white/[0.03]" />
          <span className="absolute font-mono text-[140px] md:text-[240px] font-black text-white/[0.02] tracking-widest">
            PX
          </span>
        </div>

        {/* Top Meta Header */}
        <div className="hero-badge flex flex-wrap items-center justify-between gap-4 py-4 border-b border-white/10 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-neutral-400 uppercase tracking-widest">
              PORTFOLIO EDITION // {new Date().getFullYear()}
            </span>
          </div>
          <div className="text-neutral-500 hidden sm:flex items-center gap-6">
            <span>LOCATED IN {personalInfo.location.toUpperCase()}</span>
            <span>AVAILABLE WORLDWIDE</span>
          </div>
        </div>

        {/* Main Hero Typography & Portrait Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto py-12">
          {/* Left: Giant Typography */}
          <div ref={heroTextRef} className="lg:col-span-8 flex flex-col gap-6">
            <div className="overflow-hidden">
              <span className="hero-line block font-mono text-sm md:text-base uppercase tracking-widest text-neutral-400">
                {personalInfo.heroGreeting}
              </span>
            </div>

            <div className="overflow-hidden">
              <h1 className="hero-line text-huge font-extrabold uppercase tracking-tighter text-white leading-[0.88]">
                UBAYDULLOH
              </h1>
            </div>

            <div className="overflow-hidden">
              <h1 className="hero-line text-huge font-extrabold uppercase tracking-tighter text-white/90 leading-[0.88]">
                DADAXANOV
              </h1>
            </div>

            <div className="overflow-hidden pt-2">
              <div className="hero-line flex flex-wrap items-center gap-3 text-xs md:text-sm font-mono text-neutral-400">
                <span className="px-3 py-1 rounded-full border border-white/20 bg-white/5 text-white">
                  {personalInfo.role.toUpperCase()}
                </span>
                <span>//</span>
                <span>JAVASCRIPT & WEB ARCHITECTURE</span>
                <span>//</span>
                <span className="text-white font-semibold">NEXT.JS & VUE.JS</span>
              </div>
            </div>
          </div>

          {/* Right: Portrait & Status Badge */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-end gap-6">
            <div className="hero-image-wrap relative group w-[220px] md:w-[280px] aspect-[4/5] rounded-2xl overflow-hidden border border-white/20 bg-neutral-900 shadow-2xl">
              <img
                src={personalInfo.avatar}
                alt={personalInfo.name}
                className="w-full h-full object-cover grayscale contrast-125 transition-transform duration-700 group-hover:scale-105 group-hover:grayscale-0"
                data-cursor="view"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-white/90">
                <span>{personalInfo.brandName}</span>
                <span className="border border-white/30 px-2 py-0.5 rounded-full text-[9px] bg-black/50">
                  DEVELOPER
                </span>
              </div>
            </div>

            {/* Quick action buttons (CV Download, About Link) */}
            <div className="hero-meta flex flex-wrap items-center justify-center lg:justify-end gap-3 w-full">
              <Link
                href="/about"
                className="flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-xs font-mono uppercase tracking-widest text-white hover:bg-white hover:text-black hover:border-white transition-all duration-300"
                data-cursor="link"
              >
                <Info size={14} />
                <span>ABOUT ME</span>
              </Link>

              <a
                href={personalInfo.resumePdf}
                download
                className="flex items-center gap-2 px-6 py-3 rounded-full border border-white bg-white text-black text-xs font-mono uppercase tracking-widest font-semibold hover:bg-neutral-200 transition-all duration-300"
                data-cursor="link"
              >
                <Download size={14} />
                <span>DOWNLOAD CV</span>
              </a>
            </div>
          </div>
        </div>

        {/* Hero Footer Bar: Social Links & Scroll Indicator */}
        <div className="hero-meta flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-white/10 text-xs font-mono text-neutral-400">
          <div className="flex items-center gap-6">
            <span className="text-neutral-600 hidden sm:inline">CONNECT:</span>
            {personalInfo.socials.slice(0, 3).map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition flex items-center gap-1 group"
                data-cursor="link"
              >
                <span>{s.name}</span>
                <ArrowUpRight size={12} className="opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 text-neutral-500 animate-bounce">
            <span>SCROLL TO EXPLORE</span>
            <ArrowDown size={14} />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------------- */}
      {/* SECTION 2: EDITORIAL INTRO STATEMENT (Word reveal with Scroll Scrub)     */}
      {/* ------------------------------------------------------------------------- */}
      <section className="intro-section w-full py-32 border-y border-white/10 bg-black/60 relative">
        <div className="container-editorial flex flex-col gap-10">
          <div className="flex items-center gap-3">
            <Terminal size={16} className="text-white" />
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">
              STATEMENT & SPECIALIZATION // 01
            </span>
          </div>

          <p className="text-subhead md:text-3xl lg:text-4xl font-light text-neutral-300 leading-relaxed max-w-5xl">
            {bioWords.map((word, i) => (
              <span key={i} className="intro-word inline-block mr-2 transition-colors">
                {word}
              </span>
            ))}
          </p>

          <div className="flex flex-wrap gap-8 pt-8 border-t border-white/10 text-xs font-mono text-neutral-400">
            <div>
              <span className="text-neutral-600 block mb-1">CORE ECOSYSTEM</span>
              <span className="text-white">JavaScript (ES6+), React.js, Next.js, Vue.js</span>
            </div>
            <div>
              <span className="text-neutral-600 block mb-1">STYLING & ARCHITECTURE</span>
              <span className="text-white">Tailwind CSS, Modular Systems, Vite</span>
            </div>
            <div>
              <span className="text-neutral-600 block mb-1">INTERACTION DESIGN</span>
              <span className="text-white">GSAP Motion, Smooth Physics, Creative Dev</span>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------------- */}
      {/* SECTION 3: PINNED PROJECT SHOWCASE (Desktop Pinned + Mobile Stacked)      */}
      {/* ------------------------------------------------------------------------- */}
      {/* DESKTOP PINNED EXPERIENCE */}
      <section
        ref={pinnedProjectsRef}
        className="hidden lg:flex relative w-full h-screen bg-black overflow-hidden flex-col justify-center"
      >
        {/* Section Header overlay */}
        <div className="absolute top-8 left-0 right-0 z-20 container-editorial flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-3">
            <Layers size={16} className="text-white" />
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
              PINNED SHOWCASE // SELECTED WORKS ({projects.length})
            </span>
          </div>
          <Link
            href="/projects"
            className="font-mono text-xs uppercase tracking-widest text-neutral-400 hover:text-white pointer-events-auto flex items-center gap-1 group"
            data-cursor="link"
          >
            <span>VIEW ALL PROJECTS</span>
            <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* Stacked Project Panels */}
        <div className="relative w-full h-full flex items-center justify-center">
          {projects.map((proj, idx) => (
            <div
              key={proj.id}
              className={`desktop-pinned-card absolute inset-0 w-full h-full flex items-center justify-center p-12 ${
                idx === 0 ? 'z-10' : idx === 1 ? 'z-20' : 'z-30'
              }`}
            >
              <div className="w-full max-w-6xl rounded-3xl border border-white/20 bg-neutral-950/90 backdrop-blur-2xl p-12 grid grid-cols-12 gap-8 items-center shadow-[0_0_80px_rgba(0,0,0,0.8)]">
                {/* Project Details (Left) */}
                <div className="col-span-6 flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-3xl font-bold text-white/40">
                      {proj.number}
                    </span>
                    <span className="font-mono text-xs uppercase tracking-widest text-neutral-400 border border-white/15 px-3 py-1 rounded-full">
                      {proj.category || 'Featured Web Project'}
                    </span>
                  </div>

                  <h2 className="text-5xl font-black uppercase tracking-tight text-white">
                    {proj.title}
                  </h2>

                  <p className="text-base text-neutral-300 leading-relaxed font-light line-clamp-4">
                    {proj.caption}
                  </p>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {proj.texnologiya.map((t) => (
                      <span
                        key={t}
                        className="font-mono text-xs px-3 py-1 rounded-full border border-white/15 bg-white/5 text-neutral-200"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/10">
                    <a
                      href={proj.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-mono text-xs uppercase font-bold tracking-widest hover:bg-neutral-200 transition"
                      data-cursor="link"
                    >
                      <ExternalLink size={14} />
                      <span>LIVE DEMO</span>
                    </a>

                    <a
                      href={proj.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 bg-white/5 text-white font-mono text-xs uppercase tracking-widest hover:border-white transition"
                      data-cursor="link"
                    >
                      <Icon icon="simple-icons:github" />
                      <span>GITHUB REPO</span>
                    </a>

                    <Link
                      href={`/projects/${proj.slug}`}
                      className="font-mono text-xs uppercase tracking-widest text-neutral-400 hover:text-white underline underline-offset-4 ml-auto"
                      data-cursor="link"
                    >
                      EXPLORE DETAILS
                    </Link>
                  </div>
                </div>

                {/* Project Screenshot (Right) */}
                <div className="col-span-6 relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/20 bg-neutral-900 group">
                  <img
                    src={proj.photo}
                    alt={proj.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    data-cursor="project"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full font-mono text-xs text-white border border-white/20">
                    PROJECT {proj.number}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MOBILE / TABLET ADAPTIVE SHOWCASE */}
      <section className="lg:hidden mobile-projects-wrapper w-full py-20 container-editorial flex flex-col gap-10">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-white" />
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
              FEATURED WORKS ({projects.length})
            </span>
          </div>
          <Link
            href="/projects"
            className="font-mono text-xs uppercase text-neutral-400 hover:text-white flex items-center gap-1"
          >
            <span>ALL</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>

        <div className="flex flex-col gap-10">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="mobile-project-card p-6 rounded-3xl border border-white/15 bg-neutral-950 flex flex-col gap-6"
            >
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/10">
                <img
                  src={proj.photo}
                  alt={proj.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-3 left-3 font-mono text-xs bg-black/80 px-2.5 py-0.5 rounded-full border border-white/20 text-white">
                  {proj.number}
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="text-2xl font-bold uppercase text-white">
                  {proj.title}
                </h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {proj.caption}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {proj.texnologiya.map((t) => (
                    <span
                      key={t}
                      className="font-mono text-[10px] px-2 py-0.5 rounded border border-white/10 text-neutral-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/10 text-xs font-mono">
                <a
                  href={proj.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full bg-white text-black font-bold uppercase"
                >
                  LIVE DEMO
                </a>
                <a
                  href={proj.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-full border border-white/20 text-white uppercase"
                >
                  GITHUB
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------------- */}
      {/* SECTION 4: WHAT I DO (Horizontal on Desktop, Grid on Mobile)              */}
      {/* ------------------------------------------------------------------------- */}
      <section
        ref={horizontalSectionRef}
        className="relative w-full min-h-screen bg-black overflow-hidden py-24 flex flex-col justify-center border-t border-white/10"
      >
        <div className="container-editorial mb-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles size={16} className="text-white" />
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">
              SERVICES & CAPABILITIES // 02
            </span>
          </div>
          <span className="font-mono text-xs text-neutral-500 hidden lg:inline">
            SCROLL TO NAVIGATE HORIZONTALLY
          </span>
        </div>

        {/* Desktop Horizontal Track */}
        <div
          ref={horizontalTrackRef}
          className="hidden lg:flex gap-8 px-16 w-max items-stretch"
        >
          {capabilities.map((cap) => (
            <div
              key={cap.num}
              className="w-[440px] p-10 rounded-3xl border border-white/15 bg-neutral-950/80 backdrop-blur-xl flex flex-col justify-between gap-10 hover:border-white transition-colors duration-300"
              data-cursor="view"
            >
              <div className="flex flex-col gap-4">
                <span className="font-mono text-2xl font-bold text-neutral-500">
                  {cap.num}
                </span>
                <h3 className="text-3xl font-bold uppercase tracking-tight text-white">
                  {cap.title}
                </h3>
                <p className="text-base text-neutral-400 font-light leading-relaxed">
                  {cap.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-6 border-t border-white/10">
                {cap.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="font-mono text-[11px] px-2.5 py-1 rounded-md border border-white/10 bg-white/5 text-neutral-300"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Mobile / Tablet Grid */}
        <div className="lg:hidden container-editorial grid grid-cols-1 md:grid-cols-2 gap-6">
          {capabilities.map((cap) => (
            <div
              key={cap.num}
              className="p-8 rounded-3xl border border-white/15 bg-neutral-950 flex flex-col justify-between gap-6"
            >
              <div className="flex flex-col gap-3">
                <span className="font-mono text-xl font-bold text-neutral-500">{cap.num}</span>
                <h3 className="text-2xl font-bold uppercase text-white">{cap.title}</h3>
                <p className="text-sm text-neutral-400 font-light leading-relaxed">{cap.description}</p>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-4 border-t border-white/10">
                {cap.keywords.map((kw) => (
                  <span key={kw} className="font-mono text-[10px] px-2 py-0.5 rounded border border-white/10 text-neutral-300">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------------- */}
      {/* SECTION 5: INTERACTIVE SKILLS (Section 21: Spotlight interactive list)    */}
      {/* ------------------------------------------------------------------------- */}
      <section className="w-full py-32 border-t border-white/10 bg-black relative">
        <div className="container-editorial flex flex-col gap-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
            <div className="flex flex-col gap-3">
              <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">
                TECHNOLOGY MATRIX // 03
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-white">
                VERIFIED TECH STACK
              </h2>
            </div>
            <p className="font-mono text-xs text-neutral-400 max-w-sm">
              Hands-on technical stack utilized across modern production systems and web applications.
            </p>
          </div>

          {/* Large Interactive Skill List */}
          <div className="skills-group flex flex-col divide-y divide-white/10">
            {skills.map((skill, i) => {
              const color = skillColors[skill.name] || '#FFFFFF'
              return (
                <div
                  key={skill.name}
                  style={{ '--hover-color': color }}
                  className="group py-6 md:py-8 flex items-center justify-between transition-all duration-300 cursor-pointer"
                  data-cursor="view"
                >
                  <div className="flex items-center gap-6 md:gap-12">
                    <span className="font-mono text-xs md:text-sm text-neutral-600 group-hover:text-white transition-colors">
                      0{i + 1}
                    </span>
                    <div className="flex items-center gap-4">
                      <SkillIcon name={skill.name} size={32} className="shrink-0 transition-transform group-hover:scale-125" />
                      <span className="text-2xl md:text-5xl font-light tracking-tight text-neutral-300 group-hover:text-[var(--hover-color)] group-hover:font-medium group-hover:translate-x-3 transition-all duration-300">
                        {skill.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className="font-mono text-xs uppercase tracking-widest border border-white/10 px-3 py-1 rounded-full text-neutral-400 group-hover:border-[var(--hover-color)] transition-colors"
                    >
                      {skill.category}
                    </span>
                    <ArrowUpRight size={18} className="text-neutral-600 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------------- */}
      {/* SECTION 6: INFINITE MONOCHROME MARQUEE (Section 23)                       */}
      {/* ------------------------------------------------------------------------- */}
      <section className="marquee-container w-full py-12 border-y border-white/10 bg-black overflow-hidden relative select-none">
        {/* Track 1: Left */}
        <div className="animate-marquee-track flex items-center gap-8 text-3xl md:text-6xl font-black uppercase tracking-tighter text-white">
          <span>{personalInfo.name}</span>
          <span className="text-neutral-600 font-light">—</span>
          <span>FRONTEND DEVELOPER</span>
          <span className="text-neutral-600 font-light">—</span>
          <span>NEXT.JS & VUE.JS SPECIALIST</span>
          <span className="text-neutral-600 font-light">—</span>
          <span>{personalInfo.brandName}</span>
          <span className="text-neutral-600 font-light">—</span>
          <span>Namangan, UZBEKISTAN</span>
          <span className="text-neutral-600 font-light">—</span>
          <span>HIGH-PERFORMANCE WEB APPS</span>
          <span className="text-neutral-600 font-light">—</span>
          {/* Repeat */}
          <span>{personalInfo.name}</span>
          <span className="text-neutral-600 font-light">—</span>
          <span>FRONTEND DEVELOPER</span>
          <span className="text-neutral-600 font-light">—</span>
          <span>NEXT.JS & VUE.JS SPECIALIST</span>
          <span className="text-neutral-600 font-light">—</span>
          <span>{personalInfo.brandName}</span>
          <span className="text-neutral-600 font-light">—</span>
          <span>Namangan, UZBEKISTAN</span>
          <span className="text-neutral-600 font-light">—</span>
          <span>HIGH-PERFORMANCE WEB APPS</span>
          <span className="text-neutral-600 font-light">—</span>
        </div>

        {/* Track 2: Reverse Direction */}
        <div className="animate-marquee-track-reverse flex items-center gap-8 text-xl md:text-3xl font-mono uppercase tracking-widest text-neutral-500 mt-4">
          <span>JAVASCRIPT (ES6+)</span>
          <span>///</span>
          <span>REACT.JS</span>
          <span>///</span>
          <span>TAILWIND CSS</span>
          <span>///</span>
          <span>GSAP ANIMATION</span>
          <span>///</span>
          <span>VITE ECOSYSTEM</span>
          <span>///</span>
          <span>RESPONSIVE ENGINEERING</span>
          <span>///</span>
          <span>CLEAN ARCHITECTURE</span>
          <span>///</span>
          {/* Repeat */}
          <span>JAVASCRIPT (ES6+)</span>
          <span>///</span>
          <span>REACT.JS</span>
          <span>///</span>
          <span>TAILWIND CSS</span>
          <span>///</span>
          <span>GSAP ANIMATION</span>
          <span>///</span>
          <span>VITE ECOSYSTEM</span>
          <span>///</span>
          <span>RESPONSIVE ENGINEERING</span>
          <span>///</span>
          <span>CLEAN ARCHITECTURE</span>
          <span>///</span>
        </div>
      </section>

      {/* ------------------------------------------------------------------------- */}
      {/* SECTION 7: EDITORIAL ABOUT TEASER (Section 14 & 28)                       */}
      {/* ------------------------------------------------------------------------- */}
      <section className="about-teaser-section w-full py-32 container-editorial flex flex-col gap-12">
        <div className="flex items-center gap-3">
          <Code2 size={16} className="text-white" />
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">
            BACKGROUND & FOCUS // 04
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 flex flex-col gap-6">
            <h2 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-white leading-tight">
              COMMITTED TO DIGITAL EXCELLENCE.
            </h2>
            <p className="font-mono text-xs text-neutral-400">
              Transforming functional concepts into sleek, fluid digital systems with emphasis on code quality, responsiveness, and performance.
            </p>
            <div className="pt-4">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white text-xs font-mono uppercase tracking-widest text-white hover:bg-white hover:text-black transition duration-300"
                data-cursor="link"
              >
                <span>READ FULL STORY</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col gap-6 border-l border-white/10 pl-6 md:pl-12">
            <p className="about-line-anim text-lg md:text-2xl text-neutral-300 font-light leading-relaxed">
              "{personalInfo.aboutBio}"
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-8 border-t border-white/10 text-xs font-mono">
              <div>
                <span className="text-neutral-500 block mb-1">LOCATION</span>
                <span className="text-white">Namangan, UZB</span>
              </div>
              <div>
                <span className="text-neutral-500 block mb-1">FOCUS</span>
                <span className="text-white">Frontend & UI</span>
              </div>
              <div>
                <span className="text-neutral-500 block mb-1">STATUS</span>
                <span className="text-white">Ready for hire</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------------- */}
      {/* SECTION 8: PROJECTS DIRECT ACCESS GRID (Section 15, 17)                   */}
      {/* ------------------------------------------------------------------------- */}
      <section className="w-full py-28 border-t border-white/10 bg-neutral-950/60 relative">
        <div className="container-editorial flex flex-col gap-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
            <div>
              <span className="font-mono text-xs uppercase tracking-widest text-neutral-500 block mb-2">
                INDEX // 05
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-white">
                PROJECT CATALOG
              </h2>
            </div>
            <Link
              href="/projects"
              className="font-mono text-xs uppercase tracking-widest text-neutral-400 hover:text-white flex items-center gap-1.5"
              data-cursor="link"
            >
              <span>EXPLORE ALL ARCHIVES</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {projects.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col justify-between rounded-3xl border border-white/15 bg-black p-6 hover:border-white transition-all duration-300"
              >
                <div className="flex flex-col gap-4">
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden border border-white/10 bg-neutral-900">
                    <img
                      src={item.photo}
                      alt={item.title}
                      className="w-full h-full object-cover grayscale contrast-125 transition-transform duration-500 group-hover:scale-105 group-hover:grayscale-0"
                      data-cursor="project"
                    />
                    <span className="absolute top-3 left-3 font-mono text-[10px] bg-black/80 px-2.5 py-0.5 rounded-full border border-white/20 text-white">
                      {item.number}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-2">
                    <h3 className="text-2xl font-bold uppercase tracking-tight text-white group-hover:text-neutral-300 transition-colors">
                      {item.title}
                    </h3>
                    <span className="font-mono text-xs text-neutral-500">{item.year}</span>
                  </div>

                  <p className="text-xs text-neutral-400 font-light leading-relaxed line-clamp-3">
                    {item.caption}
                  </p>
                </div>

                <div className="flex flex-col gap-4 pt-6 border-t border-white/10 mt-6">
                  <div className="flex flex-wrap gap-1.5">
                    {item.texnologiya.map((t) => (
                      <span
                        key={t}
                        className="font-mono text-[10px] px-2 py-0.5 rounded-md border border-white/10 text-neutral-400"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono pt-2">
                    <a
                      href={item.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:underline underline-offset-4 flex items-center gap-1"
                      data-cursor="link"
                    >
                      <span>DEMO</span>
                      <ExternalLink size={11} />
                    </a>
                    <a
                      href={item.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-400 hover:text-white flex items-center gap-1"
                      data-cursor="link"
                    >
                      <span>CODE</span>
                      <Icon icon="simple-icons:github" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
