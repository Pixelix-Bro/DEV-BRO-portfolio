'use client'

import { useEffect, useRef } from 'react'

export default function MonochromeCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true,
    })
    if (!ctx) return

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    let reducedMotion = reducedMotionQuery.matches

    let width = 0
    let height = 0
    let dpr = 1
    let animationFrame = 0
    let lastTime = performance.now()
    let time = 0

    const isTouch = 'ontouchstart' in window || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0)

    const getQuality = () => {
      if (reducedMotion) {
        return {
          particles: 25,
          dust: 15,
          stars: 10,
          nodes: 0,
          connections: false,
          mouse: false,
        }
      }

      if (width < 640) {
        return {
          particles: 40,
          dust: 25,
          stars: 15,
          nodes: 4,
          connections: true,
          mouse: !isTouch,
        }
      }

      if (width < 1024) {
        return {
          particles: 70,
          dust: 45,
          stars: 25,
          nodes: 6,
          connections: true,
          mouse: !isTouch,
        }
      }

      return {
        particles: 110,
        dust: 65,
        stars: 35,
        nodes: 9,
        connections: true,
        mouse: !isTouch,
      }
    }

    let QUALITY = getQuality()

    const particles = []
    const dust = []
    const stars = []
    const nodes = []

    const mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      active: false,
      radius: 200,
    }

    const random = (min, max) => Math.random() * (max - min) + min
    const clamp = (val, min, max) => Math.max(min, Math.min(max, val))

    const createParticle = () => {
      const depth = random(0.2, 1)
      return {
        x: random(0, width),
        y: random(0, height),
        vx: random(-0.05, 0.05) * depth,
        vy: random(-0.05, 0.05) * depth,
        size: random(0.5, 1.4),
        depth,
        phase: random(0, Math.PI * 2),
        speed: random(0.0006, 0.002),
        brightness: random(0.2, 0.75),
      }
    }

    const createDust = () => ({
      x: random(0, width),
      y: random(0, height),
      vx: random(-0.02, 0.02),
      vy: random(-0.02, 0.02),
      size: random(0.3, 0.8),
      alpha: random(0.04, 0.12),
      phase: random(0, Math.PI * 2),
      depth: random(0.2, 1),
    })

    const createStar = () => ({
      x: random(0, width),
      y: random(0, height),
      size: random(0.4, 1.3),
      depth: random(0.2, 1),
      phase: random(0, Math.PI * 2),
      twinkle: random(0.0008, 0.0025),
    })

    const createNode = () => ({
      x: random(0, width),
      y: random(0, height),
      vx: random(-0.1, 0.1),
      vy: random(-0.07, 0.07),
      size: random(1.2, 2.5),
      phase: random(0, Math.PI * 2),
    })

    const setupObjects = () => {
      particles.length = 0
      dust.length = 0
      stars.length = 0
      nodes.length = 0

      for (let i = 0; i < QUALITY.particles; i++) particles.push(createParticle())
      for (let i = 0; i < QUALITY.dust; i++) dust.push(createDust())
      for (let i = 0; i < QUALITY.stars; i++) stars.push(createStar())
      for (let i = 0; i < QUALITY.nodes; i++) nodes.push(createNode())
    }

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 1.5)

      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      mouse.x = width / 2
      mouse.y = height / 2

      QUALITY = getQuality()
      setupObjects()
    }

    resize()

    const onMouseMove = (e) => {
      mouse.targetX = e.clientX
      mouse.targetY = e.clientY
      mouse.active = true
    }

    const onMouseLeave = () => {
      mouse.active = false
    }

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseleave', onMouseLeave)

    const render = (now) => {
      const delta = now - lastTime
      lastTime = now
      time += delta

      mouse.x += (mouse.targetX - mouse.x) * 0.05
      mouse.y += (mouse.targetY - mouse.y) * 0.05

      // Pure black canvas
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, width, height)

      // Very subtle radial vignette centered on mouse or screen center
      const cx = mouse.active ? mouse.x : width / 2
      const cy = mouse.active ? mouse.y : height / 2
      const vignette = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width, height) * 0.6)
      vignette.addColorStop(0, 'rgba(255,255,255,0.025)')
      vignette.addColorStop(0.5, 'rgba(255,255,255,0.008)')
      vignette.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = vignette
      ctx.fillRect(0, 0, width, height)

      const dt = clamp(delta / 16.67, 0.5, 2)

      // Dust
      for (const item of dust) {
        item.x += item.vx * dt
        item.y += item.vy * dt
        if (item.x < -10) item.x = width + 10
        if (item.x > width + 10) item.x = -10
        if (item.y < -10) item.y = height + 10
        if (item.y > height + 10) item.y = -10

        const pulse = Math.sin(time * 0.001 + item.phase) * 0.5 + 0.5
        ctx.fillStyle = `rgba(255,255,255,${item.alpha + pulse * 0.03})`
        ctx.beginPath()
        ctx.arc(item.x, item.y, item.size, 0, Math.PI * 2)
        ctx.fill()
      }

      // Stars
      for (const star of stars) {
        const pulse = Math.sin(time * star.twinkle + star.phase) * 0.5 + 0.5
        const px = (mouse.x - width / 2) * star.depth * 0.003
        const py = (mouse.y - height / 2) * star.depth * 0.003
        const alpha = 0.12 + pulse * 0.45

        ctx.fillStyle = `rgba(255,255,255,${alpha})`
        ctx.beginPath()
        ctx.arc(star.x - px, star.y - py, star.size, 0, Math.PI * 2)
        ctx.fill()
      }

      // Particles
      for (const p of particles) {
        if (QUALITY.mouse && mouse.active) {
          const dx = mouse.x - p.x
          const dy = mouse.y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy) || 1
          if (dist < mouse.radius) {
            const force = (1 - dist / mouse.radius) * 0.002 * p.depth
            p.vx -= (dx / dist) * force
            p.vy -= (dy / dist) * force
          }
        }

        p.vx *= 0.99
        p.vy *= 0.99
        p.x += p.vx * dt * 1.5
        p.y += p.vy * dt * 1.5

        if (p.x < -20) p.x = width + 20
        if (p.x > width + 20) p.x = -20
        if (p.y < -20) p.y = height + 20
        if (p.y > height + 20) p.y = -20

        const pulse = Math.sin(time * p.speed + p.phase) * 0.5 + 0.5
        const px = (mouse.x - width / 2) * p.depth * 0.003
        const py = (mouse.y - height / 2) * p.depth * 0.003

        ctx.fillStyle = `rgba(255,255,255,${p.brightness * 0.2 + pulse * 0.3})`
        ctx.beginPath()
        ctx.arc(p.x - px, p.y - py, p.size, 0, Math.PI * 2)
        ctx.fill()
      }

      // Connections between particles
      if (QUALITY.connections) {
        const maxDist = 95
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const pi = particles[i]
            const pj = particles[j]
            const dx = pi.x - pj.x
            const dy = pi.y - pj.y
            const d = Math.sqrt(dx * dx + dy * dy)
            if (d < maxDist) {
              const alpha = (1 - d / maxDist) * 0.05
              ctx.strokeStyle = `rgba(255,255,255,${alpha})`
              ctx.lineWidth = 0.5
              ctx.beginPath()
              ctx.moveTo(pi.x, pi.y)
              ctx.lineTo(pj.x, pj.y)
              ctx.stroke()
            }
          }
        }
      }

      // Constellation Nodes
      for (const node of nodes) {
        node.x += node.vx * dt
        node.y += node.vy * dt
        node.vx += Math.sin(time * 0.0003 + node.phase) * 0.0002
        node.vy += Math.cos(time * 0.00025 + node.phase) * 0.0002
        node.vx *= 0.998
        node.vy *= 0.998

        if (node.x < -30) node.x = width + 30
        if (node.x > width + 30) node.x = -30
        if (node.y < -30) node.y = height + 30
        if (node.y > height + 30) node.y = -30

        const pulse = Math.sin(time * 0.002 + node.phase) * 0.5 + 0.5
        ctx.fillStyle = `rgba(255,255,255,${0.3 + pulse * 0.4})`
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.size + pulse * 0.6, 0, Math.PI * 2)
        ctx.fill()
      }

      animationFrame = requestAnimationFrame(render)
    }

    animationFrame = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[-1] block w-full h-full"
      aria-hidden="true"
    />
  )
}
