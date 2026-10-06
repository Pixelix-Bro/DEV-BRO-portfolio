'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Icon } from '@iconify/react'
import { ExternalLink, ArrowUpRight, FolderGit2 } from 'lucide-react'
import { projects } from '@/data/portfolioData'
import SkillIcon from '@/components/SkillIcon'

export default function ProjectsPage() {
  const containerRef = useRef(null)
  const [activeProject, setActiveProject] = useState(null)
  const previewRef = useRef(null)

  useEffect(() => {
    document.title = 'Pixelix | Selected Works & Archive'
  }, [])

  useGSAP(
    () => {
      // Entrance staggered animation
      gsap.from('.proj-hero-reveal', {
        y: 80,
        opacity: 0,
        duration: 1.1,
        stagger: 0.1,
        ease: 'power4.out',
      })

      gsap.from('.project-row', {
        y: 60,
        opacity: 0,
        duration: 1.0,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.3,
      })
    },
    { scope: containerRef }
  )

  // Floating cursor preview movement for desktop
  const handleMouseMove = (e) => {
    if (!previewRef.current) return
    const preview = previewRef.current
    gsap.to(preview, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.25,
      ease: 'power3.out',
    })
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="w-full flex flex-col container-editorial pt-8 pb-32 relative"
    >
      {/* Floating Image Preview Following Mouse (Desktop) */}
      <div
        ref={previewRef}
        className={`fixed top-0 left-0 pointer-events-none z-40 -translate-x-1/2 -translate-y-1/2 w-[340px] md:w-[420px] aspect-[16/10] rounded-2xl overflow-hidden border border-white/30 bg-black/90 shadow-[0_20px_50px_rgba(0,0,0,0.8)] hidden lg:block transition-opacity duration-300 ${
          activeProject ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {activeProject && (
          <img
            src={activeProject.photo}
            alt={activeProject.title}
            className="w-full h-full object-cover transition-transform duration-500 scale-105"
          />
        )}
      </div>

      {/* Editorial Header */}
      <div className="flex flex-col gap-6 border-b border-white/10 pb-12">
        <div className="flex items-center justify-between text-xs font-mono text-neutral-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white" />
            <span>PROJECT CATALOG // 03</span>
          </div>
          <span>REAL COMPLETED WORKS ({projects.length})</span>
        </div>

        <div className="overflow-hidden">
          <h1 className="proj-hero-reveal text-giant font-extrabold uppercase tracking-tight text-white leading-none">
            PROJECTS.
          </h1>
        </div>
      </div>

      {/* Filter / Category Meta */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-8 border-b border-white/10 text-xs font-mono text-neutral-400">
        <div className="flex items-center gap-6">
          <span className="text-white font-bold">ALL ARCHIVES ({projects.length})</span>
          <span>FRONTEND DEVELOPMENT</span>
          <span>UI ENGINEERING</span>
        </div>
        <span className="text-neutral-500 hidden sm:inline">
          HOVER FOR PREVIEWS // CLICK FOR COMPLETE SPECIFICATIONS
        </span>
      </div>

      {/* Editorial Project Rows (Section 15, 17) */}
      <div className="flex flex-col divide-y divide-white/10">
        {projects.map((proj) => (
          <div
            key={proj.id}
            onMouseEnter={() => setActiveProject(proj)}
            onMouseLeave={() => setActiveProject(null)}
            className="project-row group py-12 md:py-16 flex flex-col lg:flex-row justify-between gap-8 transition-colors duration-300 relative"
            data-cursor="project"
          >
            {/* Left: Number, Title, Category */}
            <div className="flex flex-col gap-4 lg:w-[45%]">
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs md:text-sm text-neutral-500 group-hover:text-white transition-colors">
                  {proj.number}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-widest text-neutral-500 border border-white/10 px-3 py-0.5 rounded-full">
                  {proj.category}
                </span>
                <span className="font-mono text-xs text-neutral-600 ml-auto lg:hidden">
                  {proj.year}
                </span>
              </div>

              <Link
                href={`/projects/${proj.slug}`}
                className="text-3xl md:text-6xl font-black uppercase tracking-tight text-neutral-200 group-hover:text-white group-hover:translate-x-3 transition-all duration-300 flex items-center gap-3"
              >
                <span>{proj.title}</span>
                <ArrowUpRight size={28} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>

              {/* Mobile Project Image Inline (since floating preview is hidden on touch) */}
              <div className="lg:hidden w-full aspect-[16/10] rounded-xl overflow-hidden border border-white/15 my-2">
                <img
                  src={proj.photo}
                  alt={proj.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Real project caption */}
              <p className="text-sm md:text-base text-neutral-400 font-light leading-relaxed">
                {proj.caption}
              </p>
            </div>

            {/* Right: Technologies, Actions, Direct Links */}
            <div className="flex flex-col justify-between items-start lg:items-end gap-6 lg:w-[40%]">
              <div className="flex flex-wrap gap-2 lg:justify-end">
                {proj.texnologiya.map((t) => (
                  <span
                    key={t}
                    className="font-mono text-xs px-3 py-1 rounded-full border border-white/10 bg-white/5 text-neutral-300 group-hover:border-white/30 transition-colors flex items-center gap-1.5"
                  >
                    <SkillIcon name={t} size={14} className="shrink-0" />
                    <span>{t}</span>
                  </span>
                ))}
              </div>

              {/* Live demo & Github buttons */}
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <a
                  href={proj.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-mono text-xs uppercase font-bold tracking-widest hover:bg-neutral-200 transition"
                  data-cursor="link"
                >
                  <ExternalLink size={13} />
                  <span>LIVE DEMO</span>
                </a>

                <a
                  href={proj.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 bg-white/5 text-white font-mono text-xs uppercase tracking-widest hover:border-white transition"
                  data-cursor="link"
                >
                  <Icon icon="simple-icons:github" />
                  <span>GITHUB</span>
                </a>

                <Link
                  href={`/projects/${proj.slug}`}
                  className="font-mono text-xs uppercase tracking-widest text-neutral-400 hover:text-white underline underline-offset-4 ml-auto"
                  data-cursor="link"
                >
                  DETAILS
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Navigation CTA */}
      <div className="pt-24 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/10">
        <div>
          <h3 className="text-2xl font-bold uppercase tracking-tight text-white">
            WANT TO DISCUSS A CUSTOM PROJECT?
          </h3>
          <p className="font-mono text-xs text-neutral-400">
            Available for frontend architecture, React/Next.js builds, and design systems.
          </p>
        </div>

        <Link
          href="/contact"
          className="flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-mono text-xs uppercase font-bold tracking-widest hover:bg-neutral-200 transition"
          data-cursor="link"
        >
          <span>GET IN TOUCH</span>
          <ArrowUpRight size={14} />
        </Link>
      </div>
    </div>
  )
}
