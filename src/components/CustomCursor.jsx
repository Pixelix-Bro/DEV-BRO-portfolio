'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

export default function CustomCursor() {
  const cursorRef = useRef(null)
  const textRef = useRef(null)
  const [cursorText, setCursorText] = useState('')
  const [cursorState, setCursorState] = useState('default') // 'default' | 'hover' | 'project' | 'drag' | 'hidden'

  useEffect(() => {
    // Only enable on desktop with fine pointer
    if (typeof window === 'undefined') return
    const isTouch = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 1024
    if (isTouch) return

    document.body.classList.add('custom-cursor-active')

    const cursor = cursorRef.current
    if (!cursor) return

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.18, ease: 'power3.out' })
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.18, ease: 'power3.out' })

    const onMouseMove = (e) => {
      pos.x = e.clientX
      pos.y = e.clientY
      xTo(pos.x)
      yTo(pos.y)

      // Detect hover target
      const target = e.target.closest('[data-cursor]')
      if (target) {
        const type = target.getAttribute('data-cursor')
        if (type === 'project') {
          setCursorState('project')
          setCursorText('VIEW PROJECT')
        } else if (type === 'view') {
          setCursorState('project')
          setCursorText('VIEW')
        } else if (type === 'drag') {
          setCursorState('project')
          setCursorText('DRAG')
        } else if (type === 'pointer' || type === 'link') {
          setCursorState('hover')
          setCursorText('')
        }
      } else {
        const isClickable = e.target.closest('a, button, [role="button"], input, textarea, select')
        if (isClickable) {
          setCursorState('hover')
          setCursorText('')
        } else {
          setCursorState('default')
          setCursorText('')
        }
      }
    }

    const onMouseLeave = () => {
      setCursorState('hidden')
    }

    const onMouseEnter = () => {
      setCursorState('default')
    }

    window.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('mouseenter', onMouseEnter)

    return () => {
      document.body.classList.remove('custom-cursor-active')
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('mouseenter', onMouseEnter)
    }
  }, [])

  return (
    <div
      ref={cursorRef}
      className={`fixed top-0 left-0 pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-300 hidden lg:flex items-center justify-center mix-blend-difference ${
        cursorState === 'hidden' ? 'opacity-0' : 'opacity-100'
      } ${
        cursorState === 'default'
          ? 'w-3.5 h-3.5 bg-white'
          : cursorState === 'hover'
          ? 'w-12 h-12 bg-white/20 border border-white backdrop-blur-[2px] scale-110'
          : cursorState === 'project'
          ? 'w-28 h-28 bg-white text-black font-mono text-[11px] font-bold tracking-widest'
          : 'w-4 h-4 bg-white'
      }`}
    >
      {cursorState === 'project' && (
        <span
          ref={textRef}
          className="uppercase tracking-widest text-center select-none leading-none px-2"
        >
          {cursorText}
        </span>
      )}
    </div>
  )
}
