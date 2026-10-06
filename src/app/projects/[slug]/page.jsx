import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ExternalLink, ArrowLeft, ArrowUpRight } from 'lucide-react'
import { Icon } from '@iconify/react'
import { projects } from '@/data/portfolioData'
import SkillIcon from '@/components/SkillIcon'

export async function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }))
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const project = projects.find((p) => p.slug === slug)
  if (!project) return { title: 'Project Not Found' }

  return {
    title: `${project.title} — Selected Project`,
    description: project.caption,
  }
}

export default async function ProjectDetailPage({ params }) {
  const { slug } = await params
  const project = projects.find((p) => p.slug === slug)

  if (!project) {
    notFound()
  }

  // Find next project
  const currentIndex = projects.findIndex((p) => p.slug === slug)
  const nextProject = projects[(currentIndex + 1) % projects.length]

  return (
    <div className="w-full flex flex-col container-editorial pt-8 pb-32">
      {/* Top Breadcrumb & Back Link */}
      <div className="flex items-center justify-between py-6 border-b border-white/10 text-xs font-mono text-neutral-400">
        <Link
          href="/projects"
          className="flex items-center gap-2 hover:text-white transition group"
          data-cursor="link"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>BACK TO ALL PROJECTS</span>
        </Link>

        <div className="flex items-center gap-4">
          <span>PROJECT {project.number} / 03</span>
          <span className="hidden sm:inline text-neutral-600">//</span>
          <span className="hidden sm:inline text-white font-semibold">{project.year}</span>
        </div>
      </div>

      {/* Editorial Title Block */}
      <div className="flex flex-col gap-6 py-16">
        <div className="flex items-center gap-3 font-mono text-xs text-neutral-500 uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-white" />
          <span>{project.category}</span>
        </div>

        <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tight text-white leading-none">
          {project.title}
        </h1>

        <p className="text-xl md:text-2xl font-light text-neutral-300 max-w-4xl leading-relaxed pt-4">
          {project.caption}
        </p>
      </div>

      {/* Main Project Imagery */}
      <div className="w-full aspect-video md:aspect-[21/9] rounded-3xl overflow-hidden border border-white/20 bg-neutral-900 shadow-2xl relative my-8">
        <img
          src={project.photo}
          alt={project.title}
          className="w-full h-full object-cover"
          data-cursor="view"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Specification & Tech Architecture Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 py-16 border-t border-white/10 items-start">
        {/* Left: Metadata list */}
        <div className="lg:col-span-5 flex flex-col gap-8 font-mono text-xs">
          <div className="flex flex-col gap-2 pb-6 border-b border-white/10">
            <span className="text-neutral-500 uppercase tracking-widest">ROLE & SCOPE</span>
            <span className="text-white text-sm font-medium">{project.role}</span>
          </div>

          <div className="flex flex-col gap-2 pb-6 border-b border-white/10">
            <span className="text-neutral-500 uppercase tracking-widest">TECHNOLOGIES</span>
            <div className="flex flex-wrap gap-2 pt-1">
              {project.texnologiya.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 rounded-full border border-white/15 bg-white/5 text-white flex items-center gap-1.5"
                >
                  <SkillIcon name={t} size={14} className="shrink-0" />
                  <span>{t}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-2">
            <span className="text-neutral-500 uppercase tracking-widest">EXTERNAL LINKS</span>
            <div className="flex flex-wrap gap-3">
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-bold uppercase tracking-widest hover:bg-neutral-200 transition"
                data-cursor="link"
              >
                <ExternalLink size={13} />
                <span>LAUNCH DEMO</span>
              </a>

              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 bg-white/5 text-white uppercase tracking-widest hover:border-white transition"
                data-cursor="link"
              >
                <Icon icon="simple-icons:github" />
                <span>SOURCE CODE</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right: Detailed contextual explanation */}
        <div className="lg:col-span-7 flex flex-col gap-6 lg:pl-8">
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">
            PROJECT OVERVIEW & ANALYSIS
          </span>
          <p className="text-base md:text-lg text-neutral-300 font-light leading-relaxed">
            {project.caption}
          </p>
          <div className="p-6 rounded-2xl border border-white/10 bg-neutral-950/70 font-mono text-xs text-neutral-400 leading-relaxed mt-4">
            <p className="text-white mb-2 font-semibold">// IMPLEMENTATION DETAILS</p>
            <p>
              Built utilizing modern component paradigms, high efficiency responsive layouts, and production-tested state management. Fully integrated with {project.texnologiya.join(', ')}.
            </p>
          </div>
        </div>
      </div>

      {/* Next Project Carousel Navigation */}
      <div className="pt-20 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <Link
          href="/projects"
          className="font-mono text-xs uppercase tracking-widest text-neutral-400 hover:text-white"
          data-cursor="link"
        >
          ALL PROJECTS
        </Link>

        <Link
          href={`/projects/${nextProject.slug}`}
          className="group flex items-center gap-4 text-right"
          data-cursor="project"
        >
          <div className="flex flex-col">
            <span className="font-mono text-[10px] uppercase tracking-widest text-neutral-500">
              NEXT PROJECT
            </span>
            <span className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-white group-hover:text-neutral-300 transition-colors">
              {nextProject.title}
            </span>
          </div>
          <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white group-hover:bg-white group-hover:text-black transition-all">
            <ArrowUpRight size={18} />
          </div>
        </Link>
      </div>
    </div>
  )
}
