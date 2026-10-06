'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Download,
  ArrowUpRight,
  Terminal,
  Cpu,
  CheckCircle2,
} from 'lucide-react'
import { personalInfo, skills } from '@/data/portfolioData'
import SkillIcon, { skillColors } from '@/components/SkillIcon'

gsap.registerPlugin(ScrollTrigger)

// Categories for structured filtering
const categories = ['ALL', 'CORE', 'FRONTEND', 'FRAMEWORK', 'STYLING', 'ROUTING', 'BUILD TOOL']

export default function AboutPage() {
  const containerRef = useRef(null)
  const [activeCategory, setActiveCategory] = useState('ALL')

  useEffect(() => {
    document.title = 'Pixelix | About & Engineering'
  }, [])

  useGSAP(
    () => {
      // Editorial Header & Bio text entrance
      const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 1.0 } })

      tl.from('.about-title-reveal', {
        y: 60,
        opacity: 0,
        stagger: 0.1,
      })
      .from(
        '.about-line-1',
        {
          x: -50,
          opacity: 0,
        },
        '-=0.6'
      )
      .from(
        '.about-line-2',
        {
          x: 50,
          opacity: 0,
        },
        '-=0.6'
      )
      .from(
        '.about-line-3',
        {
          y: 50,
          opacity: 0,
        },
        '-=0.6'
      )
      .from(
        '.about-line-4',
        {
          scale: 0.92,
          opacity: 0,
        },
        '-=0.6'
      )
    },
    { scope: containerRef }
  )

  const filteredSkills =
    activeCategory === 'ALL'
      ? skills
      : skills.filter((s) => s.category.toUpperCase() === activeCategory)

  return (
    <div ref={containerRef} className="w-full flex flex-col container-editorial pt-8 pb-32">
      {/* ------------------------------------------------------------------------- */}
      {/* SECTION 1: EDITORIAL HEADER                                              */}
      {/* ------------------------------------------------------------------------- */}
      <div className="flex flex-col gap-6 border-b border-white/10 pb-12">
        <div className="flex items-center justify-between text-xs font-mono text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white" />
            <span>EDITORIAL BIOGRAPHY // 02</span>
          </div>
          <span>UBAYDULLOH DADAXANOV</span>
        </div>

        <div className="overflow-hidden">
          <h1 className="about-title-reveal text-giant font-extrabold uppercase tracking-tight text-white leading-none">
            ABOUT ME.
          </h1>
        </div>
      </div>

      {/* ------------------------------------------------------------------------- */}
      {/* SECTION 2: PROFILE, BIO & IMMEDIATE ACTIVE SKILLS PILLS                  */}
      {/* ------------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 py-16 items-start border-b border-white/10">
        {/* Left portrait & core stats */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          <div className="about-line-4 relative aspect-[4/5] rounded-3xl overflow-hidden border border-white/20 bg-neutral-900 group shadow-2xl">
            <img
              src={personalInfo.avatar}
              alt={personalInfo.name}
              className="w-full h-full object-cover grayscale contrast-125 transition-transform duration-700 group-hover:scale-105 group-hover:grayscale-0"
              data-cursor="view"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70" />
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between font-mono text-xs text-white">
              <span>{personalInfo.brandFullName}</span>
              <span className="border border-white/30 px-3 py-1 rounded-full bg-black/60">
                {personalInfo.country}
              </span>
            </div>
          </div>

          {/* Quick info list */}
          <div className="grid grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-4 rounded-2xl border border-white/10 bg-neutral-950/60">
              <span className="text-neutral-500 block mb-1">LOCATION</span>
              <span className="text-white font-medium">{personalInfo.location}</span>
            </div>
            <div className="p-4 rounded-2xl border border-white/10 bg-neutral-950/60">
              <span className="text-neutral-500 block mb-1">SPECIALIZATION</span>
              <span className="text-white font-medium">JavaScript / Next / Vue</span>
            </div>
          </div>

          <a
            href={personalInfo.resumePdf}
            download
            className="flex items-center justify-center gap-3 w-full py-4 rounded-full bg-white text-black font-mono text-xs uppercase font-bold tracking-widest hover:bg-neutral-200 transition"
            data-cursor="link"
          >
            <Download size={14} />
            <span>DOWNLOAD CURRICULUM VITAE (PDF)</span>
          </a>
        </div>

        {/* Right editorial story & immediate skills display */}
        <div className="lg:col-span-7 flex flex-col gap-10 lg:pl-6">
          <div className="flex flex-col gap-6">
            <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">
              ORIGIN & PHILOSOPHY
            </span>

            {/* Split sentences per Section 14 requirements */}
            <div className="flex flex-col gap-6 text-xl md:text-3xl font-light text-neutral-200 leading-relaxed">
              <p className="about-line-1">
                "I'm <strong className="font-semibold text-white">Ubaydulloh Dadaxonov</strong>, a passionate Frontend Developer focused on building modern, responsive, and scalable web applications."
              </p>
              <p className="about-line-2 text-neutral-300">
                "I enjoy creating clean and user-friendly digital experiences while continuously learning new technologies and improving my skills."
              </p>
              <p className="about-line-3 text-neutral-400">
                "My goal is to build high-quality software that makes a real impact."
              </p>
            </div>
          </div>

          {/* Extended engineering context from real data */}
          <div className="p-8 rounded-3xl border border-white/10 bg-neutral-950/50 flex flex-col gap-4">
            <div className="flex items-center gap-2 font-mono text-xs text-neutral-400">
              <Terminal size={14} />
              <span>DEVELOPMENT FOCUS</span>
            </div>
            <p className="text-sm md:text-base text-neutral-300 font-light leading-relaxed">
              {personalInfo.heroBio}
            </p>
          </div>

          {/* IMMEDIATE SKILLS BADGES WITH AUTHENTIC BRAND ICONS & ACCENTS */}
          <div className="flex flex-col gap-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-widest text-neutral-400">
                ACTIVE PROFICIENCIES ({skills.length})
              </span>
              <a
                href="#core-technologies"
                className="font-mono text-[11px] text-neutral-400 hover:text-white underline underline-offset-4"
              >
                VIEW FULL MATRIX ↓
              </a>
            </div>

            <div className="flex flex-wrap gap-3">
              {skills.map((skill) => {
                const color = skillColors[skill.name] || '#FFFFFF'
                return (
                  <div
                    key={skill.name}
                    className="group flex items-center gap-3 px-4 py-2.5 rounded-full border border-white/20 bg-neutral-950 text-white font-mono text-xs hover:border-[var(--hover-color)] transition-all duration-300 cursor-pointer shadow-md"
                    style={{ '--hover-color': color }}
                    data-cursor="view"
                  >
                    <SkillIcon name={skill.name} size={20} className="shrink-0 transition-transform group-hover:scale-115" />
                    <span className="font-semibold text-white group-hover:text-[var(--hover-color)] transition-colors">
                      {skill.name}
                    </span>
                    <span
                      className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/10 bg-white/5"
                      style={{ color: color }}
                    >
                      {skill.category}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Social connect links */}
          <div className="flex flex-wrap gap-4 pt-4 border-t border-white/10">
            {personalInfo.socials.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/5 font-mono text-xs text-neutral-300 hover:text-white hover:border-white transition"
                data-cursor="link"
              >
                <span>{s.name}</span>
                <ArrowUpRight size={11} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------------- */}
      {/* SECTION 3: CORE TECHNOLOGIES (EXPANSIVE CATEGORIZED SHOWCASE)            */}
      {/* ------------------------------------------------------------------------- */}
      <div
        id="core-technologies"
        className="core-tech-section flex flex-col gap-12 py-24 border-b border-white/10"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-neutral-500">
              <Cpu size={15} className="text-white" />
              <span>ENGINEERING ARSENAL</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-extrabold uppercase tracking-tight text-white">
              CORE TECHNOLOGIES
            </h2>
          </div>
          <p className="font-mono text-xs text-neutral-400 max-w-md">
            Verified technical tools and production libraries deployed to create responsive, scalable, high-speed digital architectures.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-2 pb-2">
          {categories.map((cat) => {
            const count =
              cat === 'ALL'
                ? skills.length
                : skills.filter((s) => s.category.toUpperCase() === cat).length
            if (cat !== 'ALL' && count === 0) return null

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${
                  activeCategory === cat
                    ? 'bg-white text-black font-bold'
                    : 'border border-white/15 bg-white/5 text-neutral-400 hover:text-white hover:border-white/30'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    activeCategory === cat ? 'bg-black text-white' : 'bg-white/10 text-neutral-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Structured Grid of Detailed Skill Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((skill, index) => {
            const color = skillColors[skill.name] || '#FFFFFF'
            return (
              <div
                key={skill.name}
                style={{
                  '--accent-color': color,
                }}
                className="group p-7 rounded-3xl border border-white/15 bg-neutral-950/80 backdrop-blur-xl flex flex-col justify-between gap-6 transition-all duration-300 shadow-lg hover:border-[var(--accent-color)] hover:shadow-[0_0_30px_rgba(0,0,0,0.8)] relative overflow-hidden"
                data-cursor="view"
              >
                {/* Subtle colored glow corner on hover */}
                <div
                  className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
                  style={{ backgroundColor: color }}
                />

                <div className="flex items-start justify-between">
                  <div
                    className="w-16 h-16 rounded-2xl border border-white/15 bg-white/5 flex items-center justify-center p-3 text-white transition-all duration-300 group-hover:scale-110 group-hover:border-[var(--accent-color)]"
                    style={{
                      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                    }}
                  >
                    <SkillIcon name={skill.name} size={34} className="shrink-0 transition-transform group-hover:scale-110" />
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="font-mono text-xs text-neutral-500 group-hover:text-white transition-colors">
                      0{index + 1}
                    </span>
                    <span
                      className="font-mono text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border transition-colors"
                      style={{
                        borderColor: `${color}40`,
                        backgroundColor: `${color}15`,
                        color: color,
                      }}
                    >
                      {skill.category}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <h3 className="text-2xl font-bold uppercase tracking-tight text-white group-hover:text-[var(--accent-color)] transition-colors">
                    {skill.name}
                  </h3>
                  <p className="text-xs text-neutral-400 font-light leading-relaxed">
                    Production-grade development using {skill.name} for high performance, maintainable architectures, and modern web applications.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10 font-mono text-[11px] text-neutral-500">
                  <span className="flex items-center gap-1.5 text-neutral-400">
                    <CheckCircle2 size={13} style={{ color: color }} />
                    <span className="text-white">Verified Stack</span>
                  </span>
                  <span className="group-hover:text-white transition-colors uppercase tracking-wider text-[10px]">
                    Pixelix Ecosystem
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------------------- */}
      {/* SECTION 4: INFINITE SKILLS MARQUEE                                       */}
      {/* ------------------------------------------------------------------------- */}
      <div className="w-full py-12 overflow-hidden border-b border-white/10 select-none">
        <div className="animate-marquee-track flex items-center gap-8">
          {skills.concat(skills).map((skill, i) => {
            const color = skillColors[skill.name] || '#FFFFFF'
            return (
              <div
                key={i}
                className="flex items-center gap-3 px-6 py-3 rounded-full border border-white/20 bg-neutral-950 text-white font-mono text-sm whitespace-nowrap shadow-lg hover:border-[var(--hover-color)] transition-colors"
                style={{ '--hover-color': color }}
              >
                <SkillIcon name={skill.name} size={22} className="shrink-0" />
                <span className="font-semibold">{skill.name}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------------------- */}
      {/* SECTION 5: INITIATE CONTACT CTA                                          */}
      {/* ------------------------------------------------------------------------- */}
      <div className="pt-20 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col gap-2">
          <h3 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-white">
            LOOKING FOR A TALENTED FRONTEND DEVELOPER?
          </h3>
          <p className="font-mono text-xs text-neutral-400">
            Let's collaborate on high-performance interfaces, web apps, and digital platforms.
          </p>
        </div>

        <Link
          href="/contact"
          className="flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-mono text-xs uppercase font-bold tracking-widest hover:bg-neutral-200 transition shrink-0"
          data-cursor="link"
        >
          <span>INITIATE CONTACT</span>
          <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  )
}
