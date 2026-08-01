'use client'

import Link from 'next/link'
import { VeloreGlass, VeloreModal } from 'velore'
import 'velore/velore.css'

const links = [
  { title: 'Home', href: '/' },
  { title: 'About', href: '/about' },
  { title: 'Projects', href: '/projects' },
  { title: 'Contact', href: '/contact' },
]

function Bars({ modal, setModal }) {
  if (!modal) return null

  return (
    <VeloreModal
      onClick={() => setModal(false)}
      className="!fixed !inset-0 !z-50 !flex !max-w-none !items-stretch !justify-end !rounded-none !border-0 !bg-transparent !p-0 !shadow-none"
    >
      {/* Orqa dim */}
      <div className="absolute inset-0 bg-black/40" onClick={() => setModal(false)} />

      {/* TO'LIQ glass menu */}
      <VeloreGlass
        variant="liquid"
        dark
        onClick={(e) => e.stopPropagation()}
        className="
          relative z-10
          !flex h-full w-[75%] max-w-sm !flex-col
          !rounded-none
          border-l border-white/25
          !p-6 text-white
          !bg-white/10
          !backdrop-blur-2xl
          !shadow-[0_0_40px_rgba(0,0,0,0.4)]
        "
        style={{
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          backdropFilter: 'blur(40px) saturate(180%)',
          background: 'rgba(255, 255, 255, 0.08)',
        }}
      >
        <img src="/favicon.ico" className="mx-auto mb-10 w-20" alt="logo" />

        <nav className="flex flex-col gap-2">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setModal(false)}
              className="rounded-xl px-4 py-3 text-lg transition hover:bg-white/15"
            >
              {item.title}
            </Link>
          ))}
        </nav>
      </VeloreGlass>
    </VeloreModal>
  )
}

export default Bars
