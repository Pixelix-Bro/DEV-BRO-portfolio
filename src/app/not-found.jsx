import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="w-full min-h-[75vh] flex flex-col items-center justify-center container-editorial text-center gap-6 py-24">
      <div className="font-mono text-xs uppercase tracking-widest text-neutral-500 border border-white/10 px-4 py-1.5 rounded-full">
        ERROR // 404
      </div>

      <h1 className="text-giant font-extrabold uppercase tracking-tight text-white leading-none">
        NOT FOUND.
      </h1>

      <p className="font-mono text-sm text-neutral-400 max-w-md">
        The requested resource or directory does not exist or has been relocated within the architecture.
      </p>

      <Link
        href="/"
        className="mt-6 flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-black font-mono text-xs uppercase font-bold tracking-widest hover:bg-neutral-200 transition"
        data-cursor="link"
      >
        <ArrowLeft size={14} />
        <span>RETURN TO HOME</span>
      </Link>
    </div>
  )
}
