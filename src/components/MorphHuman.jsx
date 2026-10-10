'use client'

import Script from 'next/script'
import { useEffect, useRef } from 'react'

export default function MorphHuman({
  height = 560,
  theme = 'color', // 'mono-dark' | 'mono-light' | 'color'
  interval = 10,
  auto = true,
  labels = true,
  controls = true,
  zoom = false,
  onChange,
  style,
  ...rest
}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !onChange) return
    const handler = (e) => onChange(e.detail) // { index, id, label }
    el.addEventListener('shapechange', handler)
    return () => el.removeEventListener('shapechange', handler)
  }, [onChange])

  return (
    <>
      <Script src="/morph-human.js" strategy="afterInteractive" />
      <morph-human
        ref={ref}
        theme={theme}
        interval={String(interval)}
        auto={String(auto)}
        labels={String(labels)}
        controls={String(controls)}
        {...(zoom ? { zoom: '' } : {})}
        style={{ display: 'block', height, ...style }}
        {...rest}
      />
    </>
  )
}
