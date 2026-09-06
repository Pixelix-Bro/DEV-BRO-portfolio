'use client'

import { useEffect, useRef } from 'react';

export default function Background() {
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
    let running = true
    let lastTime = performance.now()
    let time = 0

    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    const getQuality = () => {
      if (reducedMotion) {
        return {
          particles: 30,
          dust: 20,
          stars: 8,
          nodes: 0,
          orbs: 0,
          rays: 0,
          shootingStars: 0,
          connections: false,
          portal: false,
          waves: false,
          grid: false,
          mouse: false,
        }
      }

      if (width < 640) {
        return {
          particles: 55,
          dust: 35,
          stars: 12,
          nodes: 4,
          orbs: 2,
          rays: 3,
          shootingStars: 1,
          connections: true,
          portal: true,
          waves: false,
          grid: false,
          mouse: !isTouch,
        }
      }

      if (width < 1024) {
        return {
          particles: 95,
          dust: 65,
          stars: 20,
          nodes: 7,
          orbs: 3,
          rays: 5,
          shootingStars: 2,
          connections: true,
          portal: true,
          waves: true,
          grid: true,
          mouse: !isTouch,
        }
      }

      return {
        particles: 150,
        dust: 100,
        stars: 35,
        nodes: 10,
        orbs: 4,
        rays: 8,
        shootingStars: 3,
        connections: true,
        portal: true,
        waves: true,
        grid: true,
        mouse: !isTouch,
      }
    }

    let QUALITY = getQuality()

    const particles = []
    const dust = []
    const stars = []
    const nodes = []
    const orbs = []
    const shootingStars = []

    const mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      active: false,
      radius: 220,
    }

    const random = (min, max) => Math.random() * (max - min) + min

    const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

    const distance = (a, b) => {
      const dx = a.x - b.x
      const dy = a.y - b.y

      return Math.sqrt(dx * dx + dy * dy)
    }

    const createParticle = () => {
      const depth = random(0.15, 1)

      return {
        x: random(0, width),
        y: random(0, height),

        vx: random(-0.06, 0.06) * depth,
        vy: random(-0.06, 0.06) * depth,

        size: random(0.45, 1.45),
        depth,

        phase: random(0, Math.PI * 2),
        speed: random(0.0007, 0.002),

        color:
          Math.random() > 0.82 ? '140,120,255' : Math.random() > 0.5 ? '80,210,255' : '120,180,255',
      }
    }

    const createDust = () => ({
      x: random(0, width),
      y: random(0, height),

      vx: random(-0.025, 0.025),
      vy: random(-0.02, 0.02),

      size: random(0.2, 0.8),
      alpha: random(0.04, 0.15),

      phase: random(0, Math.PI * 2),
      depth: random(0.2, 1),
    })

    /* --------------------------------------------------
       STARS
    -------------------------------------------------- */

    const createStar = () => ({
      x: random(0, width),
      y: random(0, height),

      size: random(0.35, 1.5),
      depth: random(0.2, 1),

      phase: random(0, Math.PI * 2),
      twinkle: random(0.0008, 0.003),
    })

    const createNode = () => ({
      x: random(0, width),
      y: random(0, height),

      vx: random(-0.12, 0.12),
      vy: random(-0.08, 0.08),

      size: random(1.2, 2.8),
      phase: random(0, Math.PI * 2),
    })

    const createOrb = (index) => ({
      angle: random(0, Math.PI * 2),

      radius: Math.min(width, height) * random(0.18, 0.42),

      speed: random(0.00008, 0.00025) * (index % 2 === 0 ? 1 : -1),

      size: random(35, 85),

      phase: random(0, Math.PI * 2),

      color: index % 3 === 0 ? '70,150,255' : index % 3 === 1 ? '0,220,255' : '120,90,255',
    })

    const createShootingStar = () => ({
      x: random(-width, width),
      y: random(-height * 0.2, height * 0.6),

      length: random(60, 180),
      speed: random(7, 14),

      angle: random(Math.PI * 0.12, Math.PI * 0.3),

      life: random(0, 1),

      delay: random(0, 500),
    })

    const setupObjects = () => {
      particles.length = 0
      dust.length = 0
      stars.length = 0
      nodes.length = 0
      orbs.length = 0
      shootingStars.length = 0

      for (let i = 0; i < QUALITY.particles; i++) {
        particles.push(createParticle())
      }

      for (let i = 0; i < QUALITY.dust; i++) {
        dust.push(createDust())
      }

      for (let i = 0; i < QUALITY.stars; i++) {
        stars.push(createStar())
      }

      for (let i = 0; i < QUALITY.nodes; i++) {
        nodes.push(createNode())
      }

      for (let i = 0; i < QUALITY.orbs; i++) {
        orbs.push(createOrb(i))
      }

      for (let i = 0; i < QUALITY.shootingStars; i++) {
        shootingStars.push(createShootingStar())
      }
    }

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight

      const mobile = width < 640

      dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.15 : 1.5)

      canvas.width = Math.floor(width * dpr)

      canvas.height = Math.floor(height * dpr)

      canvas.style.width = `${width}px`

      canvas.style.height = `${height}px`

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      mouse.x = width / 2
      mouse.y = height / 2

      mouse.targetX = width / 2
      mouse.targetY = height / 2

      const oldQuality = QUALITY

      QUALITY = getQuality()

      if (
        oldQuality.particles !== QUALITY.particles ||
        oldQuality.dust !== QUALITY.dust ||
        oldQuality.stars !== QUALITY.stars ||
        oldQuality.nodes !== QUALITY.nodes
      ) {
        setupObjects()
      }
    }

    const drawBackground = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, height)

      gradient.addColorStop(0, '#020817')

      gradient.addColorStop(0.35, '#010615')

      gradient.addColorStop(0.7, '#00040d')

      gradient.addColorStop(1, '#000106')

      ctx.fillStyle = gradient

      ctx.fillRect(0, 0, width, height)
    }

    /* --------------------------------------------------
       NEBULA
    -------------------------------------------------- */

    const drawNebula = () => {
      const cx = width * 0.5 + Math.sin(time * 0.00012) * width * 0.16

      const cy = height * 0.43 + Math.cos(time * 0.00009) * height * 0.08

      const radius = Math.max(width, height) * 0.72

      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)

      gradient.addColorStop(0, 'rgba(20,100,255,0.10)')

      gradient.addColorStop(0.22, 'rgba(0,190,255,0.055)')

      gradient.addColorStop(0.45, 'rgba(90,60,255,0.035)')

      gradient.addColorStop(0.72, 'rgba(10,50,150,0.018)')

      gradient.addColorStop(1, 'rgba(0,0,0,0)')

      ctx.fillStyle = gradient

      ctx.fillRect(0, 0, width, height)
    }

    /* --------------------------------------------------
       SECONDARY NEBULA
    -------------------------------------------------- */

    const drawSecondaryNebula = () => {
      const positions = [
        {
          x: width * (0.15 + Math.sin(time * 0.00008) * 0.04),

          y: height * 0.3,

          color: '80,80,255',
        },

        {
          x: width * (0.85 + Math.cos(time * 0.00007) * 0.04),

          y: height * 0.68,

          color: '0,190,255',
        },

        {
          x: width * 0.5,

          y: height * (0.85 + Math.sin(time * 0.0001) * 0.03),

          color: '30,90,255',
        },
      ]

      for (const item of positions) {
        const radius = Math.min(width, height) * 0.45

        const gradient = ctx.createRadialGradient(item.x, item.y, 0, item.x, item.y, radius)

        gradient.addColorStop(0, `rgba(${item.color},0.045)`)

        gradient.addColorStop(0.4, `rgba(${item.color},0.018)`)

        gradient.addColorStop(1, 'rgba(0,0,0,0)')

        ctx.fillStyle = gradient

        ctx.fillRect(item.x - radius, item.y - radius, radius * 2, radius * 2)
      }
    }

    /* --------------------------------------------------
       STARS
    -------------------------------------------------- */

    const drawStars = () => {
      if (!stars.length) return

      ctx.save()

      ctx.globalCompositeOperation = 'lighter'

      for (const star of stars) {
        const pulse = Math.sin(time * star.twinkle + star.phase) * 0.5 + 0.5

        const parallaxX = (mouse.x - width / 2) * star.depth * 0.004

        const parallaxY = (mouse.y - height / 2) * star.depth * 0.004

        const alpha = 0.15 + pulse * 0.55

        ctx.fillStyle = `rgba(180,225,255,${alpha})`

        ctx.beginPath()

        ctx.arc(star.x - parallaxX, star.y - parallaxY, star.size + pulse * 0.35, 0, Math.PI * 2)

        ctx.fill()

        if (pulse > 0.85 && star.size > 0.9) {
          ctx.strokeStyle = `rgba(130,210,255,${alpha * 0.25})`

          ctx.lineWidth = 0.4

          ctx.beginPath()

          ctx.moveTo(star.x - 4, star.y)

          ctx.lineTo(star.x + 4, star.y)

          ctx.moveTo(star.x, star.y - 4)

          ctx.lineTo(star.x, star.y + 4)

          ctx.stroke()
        }
      }

      ctx.restore()
    }

    /* --------------------------------------------------
       DUST
    -------------------------------------------------- */

    const updateDust = (delta) => {
      const dt = clamp(delta / 16.67, 0.5, 2)

      for (const item of dust) {
        item.x += item.vx * dt

        item.y += item.vy * dt

        if (item.x < -10) item.x = width + 10

        if (item.x > width + 10) item.x = -10

        if (item.y < -10) item.y = height + 10

        if (item.y > height + 10) item.y = -10
      }
    }

    const drawDust = () => {
      if (!dust.length) return

      ctx.save()

      ctx.globalCompositeOperation = 'lighter'

      for (const item of dust) {
        const pulse = Math.sin(time * 0.001 + item.phase) * 0.5 + 0.5

        ctx.fillStyle = `rgba(100,180,255,${item.alpha + pulse * 0.04})`

        ctx.beginPath()

        ctx.arc(item.x, item.y, item.size, 0, Math.PI * 2)

        ctx.fill()
      }

      ctx.restore()
    }

    /* --------------------------------------------------
       PARTICLE UPDATE
    -------------------------------------------------- */

    const updateParticles = (delta) => {
      const centerX = width / 2 + Math.sin(time * 0.00018) * 35

      const centerY = height / 2 + Math.cos(time * 0.00015) * 25

      const dt = clamp(delta / 16.67, 0.5, 2)

      for (const particle of particles) {
        const dx = centerX - particle.x

        const dy = centerY - particle.y

        const dist = Math.sqrt(dx * dx + dy * dy) || 1

        /* orbital force */

        const orbitalForce = 0.00016 * particle.depth

        particle.vx += (-dy / dist) * orbitalForce * dt

        particle.vy += (dx / dist) * orbitalForce * dt

        /* soft center gravity */

        const gravity = Math.min(dist / 1000, 1) * 0.000025 * particle.depth

        particle.vx += (dx / dist) * gravity * dt

        particle.vy += (dy / dist) * gravity * dt

        /* mouse */

        if (QUALITY.mouse && mouse.active) {
          const mx = mouse.x - particle.x

          const my = mouse.y - particle.y

          const md = Math.sqrt(mx * mx + my * my) || 1

          if (md < mouse.radius) {
            const force = (1 - md / mouse.radius) * 0.0032 * particle.depth

            particle.vx += (mx / md) * force

            particle.vy += (my / md) * force
          }
        }

        particle.vx *= 0.988
        particle.vy *= 0.988

        particle.x += particle.vx * dt * 2

        particle.y += particle.vy * dt * 2

        if (particle.x < -30) particle.x = width + 30

        if (particle.x > width + 30) particle.x = -30

        if (particle.y < -30) particle.y = height + 30

        if (particle.y > height + 30) particle.y = -30
      }
    }

    /* --------------------------------------------------
       PARTICLES DRAW
    -------------------------------------------------- */

    const drawParticles = () => {
      ctx.save()

      ctx.globalCompositeOperation = 'lighter'

      for (const particle of particles) {
        const pulse = Math.sin(time * particle.speed + particle.phase) * 0.5 + 0.5

        const parallaxX = (mouse.x - width / 2) * particle.depth * 0.004

        const parallaxY = (mouse.y - height / 2) * particle.depth * 0.004

        const radius = particle.size + pulse * 0.45

        ctx.fillStyle = `rgba(${particle.color},${0.12 + pulse * 0.45})`

        ctx.beginPath()

        ctx.arc(
          particle.x - parallaxX,

          particle.y - parallaxY,

          radius,

          0,
          Math.PI * 2
        )

        ctx.fill()
      }

      ctx.restore()
    }

    /* --------------------------------------------------
       PARTICLE CONNECTIONS
    -------------------------------------------------- */

    const drawConnections = () => {
      if (!QUALITY.connections) return

      const maxDistance = 125
      const maxDistanceSquared = maxDistance * maxDistance

      const cellSize = maxDistance

      const grid = new Map()

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        const cellX = Math.floor(p.x / cellSize)

        const cellY = Math.floor(p.y / cellSize)

        const key = `${cellX}:${cellY}`

        if (!grid.has(key)) grid.set(key, [])

        grid.get(key).push(i)
      }

      ctx.save()

      ctx.globalCompositeOperation = 'lighter'

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        const cellX = Math.floor(p.x / cellSize)

        const cellY = Math.floor(p.y / cellSize)

        for (let ox = -1; ox <= 1; ox++) {
          for (let oy = -1; oy <= 1; oy++) {
            const bucket = grid.get(`${cellX + ox}:${cellY + oy}`)

            if (!bucket) continue

            for (const index of bucket) {
              if (index <= i) continue

              const other = particles[index]

              const dx = p.x - other.x

              const dy = p.y - other.y

              const d2 = dx * dx + dy * dy

              if (d2 > maxDistanceSquared) continue

              const d = Math.sqrt(d2)

              const alpha = (1 - d / maxDistance) * 0.065

              ctx.strokeStyle = `rgba(80,190,255,${alpha})`

              ctx.lineWidth = 0.45

              ctx.beginPath()

              ctx.moveTo(p.x, p.y)

              ctx.lineTo(other.x, other.y)

              ctx.stroke()
            }
          }
        }
      }

      ctx.restore()
    }

    /* --------------------------------------------------
       NODES
    -------------------------------------------------- */

    const updateNodes = (delta) => {
      const dt = clamp(delta / 16.67, 0.5, 2)

      for (const node of nodes) {
        node.x += node.vx * dt

        node.y += node.vy * dt

        node.vx += Math.sin(time * 0.0003 + node.phase) * 0.0003

        node.vy += Math.cos(time * 0.00025 + node.phase) * 0.0003

        node.vx *= 0.998
        node.vy *= 0.998

        if (node.x < -50) node.x = width + 50

        if (node.x > width + 50) node.x = -50

        if (node.y < -50) node.y = height + 50

        if (node.y > height + 50) node.y = -50
      }
    }

    const drawNodes = () => {
      if (!nodes.length) return

      ctx.save()

      ctx.globalCompositeOperation = 'lighter'

      for (const node of nodes) {
        const pulse = Math.sin(time * 0.002 + node.phase) * 0.5 + 0.5

        const radius = node.size + pulse * 0.8

        const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 7)

        glow.addColorStop(0, `rgba(100,220,255,${0.35 + pulse * 0.25})`)

        glow.addColorStop(1, 'rgba(0,0,0,0)')

        ctx.fillStyle = glow

        ctx.beginPath()

        ctx.arc(node.x, node.y, radius * 7, 0, Math.PI * 2)

        ctx.fill()

        ctx.fillStyle = `rgba(150,235,255,${0.35 + pulse * 0.4})`

        ctx.beginPath()

        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)

        ctx.fill()
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]

          const d = distance(a, b)

          if (d > 280) continue

          const alpha = (1 - d / 280) * 0.11

          ctx.strokeStyle = `rgba(70,180,255,${alpha})`

          ctx.lineWidth = 0.5

          ctx.beginPath()

          ctx.moveTo(a.x, a.y)

          ctx.lineTo(b.x, b.y)

          ctx.stroke()
        }
      }

      ctx.restore()
    }

    /* --------------------------------------------------
       ORBS
    -------------------------------------------------- */

    const updateOrbs = (delta) => {
      const dt = clamp(delta / 16.67, 0.5, 2)

      for (const orb of orbs) {
        orb.angle += orb.speed * dt * 60
      }
    }

    const drawOrbs = () => {
      if (!orbs.length) return

      const cx = width / 2

      const cy = height / 2

      ctx.save()

      ctx.globalCompositeOperation = 'lighter'

      for (const orb of orbs) {
        const x = cx + Math.cos(orb.angle) * orb.radius

        const y = cy + Math.sin(orb.angle * 0.72) * orb.radius * 0.58

        const pulse = Math.sin(time * 0.0015 + orb.phase) * 0.5 + 0.5

        const size = orb.size * (0.8 + pulse * 0.25)

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size)

        gradient.addColorStop(0, `rgba(${orb.color},0.13)`)

        gradient.addColorStop(0.25, `rgba(${orb.color},0.055)`)

        gradient.addColorStop(1, 'rgba(0,0,0,0)')

        ctx.fillStyle = gradient

        ctx.beginPath()

        ctx.arc(x, y, size, 0, Math.PI * 2)

        ctx.fill()
      }

      ctx.restore()
    }

    /* --------------------------------------------------
       PORTAL
    -------------------------------------------------- */

    const drawPortal = () => {
      if (!QUALITY.portal) return

      const cx = width / 2 + Math.sin(time * 0.00022) * 22

      const cy = height / 2 + Math.cos(time * 0.00027) * 15

      const base = Math.min(width, height) * 0.2

      ctx.save()

      ctx.translate(cx, cy)

      ctx.globalCompositeOperation = 'lighter'

      /* outer aura */

      const aura = ctx.createRadialGradient(0, 0, 0, 0, 0, base * 2)

      aura.addColorStop(0, 'rgba(40,180,255,0.09)')

      aura.addColorStop(0.35, 'rgba(40,100,255,0.045)')

      aura.addColorStop(1, 'rgba(0,0,0,0)')

      ctx.fillStyle = aura

      ctx.beginPath()

      ctx.arc(0, 0, base * 2, 0, Math.PI * 2)

      ctx.fill()

      /* rings */

      for (let i = 0; i < 6; i++) {
        const radius = base * (0.45 + i * 0.12)

        const rotation = time * (0.00008 + i * 0.000025)

        ctx.save()

        ctx.rotate(rotation * (i % 2 ? -1 : 1))

        ctx.beginPath()

        ctx.ellipse(0, 0, radius * (1.5 + i * 0.04), radius * 0.22, 0, 0, Math.PI * 2)

        ctx.strokeStyle = `rgba(${i % 2 ? '70,170,255' : '80,220,255'},${0.035 + i * 0.012})`

        ctx.lineWidth = i === 2 ? 1.1 : 0.55

        ctx.stroke()

        ctx.restore()
      }

      /* central energy */

      const pulse = Math.sin(time * 0.0025) * 0.5 + 0.5

      const core = ctx.createRadialGradient(0, 0, 0, 0, 0, base * 0.65)

      core.addColorStop(0, `rgba(160,240,255,${0.12 + pulse * 0.1})`)

      core.addColorStop(0.25, `rgba(60,180,255,${0.07 + pulse * 0.05})`)

      core.addColorStop(1, 'rgba(0,0,0,0)')

      ctx.fillStyle = core

      ctx.beginPath()

      ctx.arc(0, 0, base * 0.65, 0, Math.PI * 2)

      ctx.fill()

      /* core ring */

      ctx.strokeStyle = `rgba(140,235,255,${0.08 + pulse * 0.12})`

      ctx.lineWidth = 1

      ctx.beginPath()

      ctx.arc(0, 0, base * 0.35, 0, Math.PI * 2)

      ctx.stroke()

      ctx.restore()
    }

    /* --------------------------------------------------
       AURORA WAVES
    -------------------------------------------------- */

    const drawWaves = () => {
      if (!QUALITY.waves) return

      ctx.save()

      ctx.globalCompositeOperation = 'screen'

      const layers = [
        {
          y: 0.68,
          amp: 20,
          freq: 0.006,
          speed: 0.0004,
          alpha: 0.035,
        },

        {
          y: 0.76,
          amp: 30,
          freq: 0.004,
          speed: -0.00025,
          alpha: 0.025,
        },

        {
          y: 0.58,
          amp: 13,
          freq: 0.009,
          speed: 0.0006,
          alpha: 0.022,
        },
      ]

      for (const layer of layers) {
        ctx.beginPath()

        for (let x = 0; x <= width; x += 18) {
          const y =
            height * layer.y +
            Math.sin(x * layer.freq + time * layer.speed) * layer.amp +
            Math.sin(x * 0.002 - time * layer.speed * 0.6) * layer.amp * 0.5

          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }

        const gradient = ctx.createLinearGradient(0, 0, width, 0)

        gradient.addColorStop(0, 'rgba(0,160,255,0)')

        gradient.addColorStop(0.25, `rgba(40,190,255,${layer.alpha})`)

        gradient.addColorStop(0.5, `rgba(100,160,255,${layer.alpha * 1.4})`)

        gradient.addColorStop(0.75, `rgba(40,190,255,${layer.alpha})`)

        gradient.addColorStop(1, 'rgba(0,160,255,0)')

        ctx.strokeStyle = gradient

        ctx.lineWidth = 1

        ctx.stroke()
      }

      ctx.restore()
    }

    /* --------------------------------------------------
       PERSPECTIVE GRID
    -------------------------------------------------- */

    const drawGrid = () => {
      if (!QUALITY.grid) return

      ctx.save()

      ctx.globalAlpha = 0.025

      const horizon = height * 0.58

      const spacing = 55

      ctx.strokeStyle = 'rgba(80,170,255,1)'

      ctx.lineWidth = 0.5

      /* horizontal */

      for (let y = horizon; y < height; y += spacing) {
        const perspective = (y - horizon) / (height - horizon)

        const alpha = perspective

        ctx.globalAlpha = alpha * 0.035

        ctx.beginPath()

        ctx.moveTo(0, y)

        ctx.lineTo(width, y)

        ctx.stroke()
      }

      /* vertical perspective */

      ctx.globalAlpha = 0.025

      const center = width / 2

      for (let x = -width; x <= width * 2; x += spacing) {
        ctx.beginPath()

        ctx.moveTo(center, horizon)

        ctx.lineTo(x, height)

        ctx.stroke()
      }

      ctx.restore()
    }

    /* --------------------------------------------------
       SHOOTING STARS
    -------------------------------------------------- */

    const updateShootingStars = (delta) => {
      if (!shootingStars.length) return

      const dt = delta / 16.67

      for (const star of shootingStars) {
        star.life += 0.003 * dt

        if (star.life > 1 || star.delay > 0) {
          if (star.delay > 0) star.delay -= delta

          if (star.life > 1) {
            star.x = random(-width * 0.5, width)

            star.y = random(-height * 0.3, height * 0.5)

            star.life = 0

            star.delay = random(1000, 5000)
          }

          continue
        }

        star.x += Math.cos(star.angle) * star.speed * dt

        star.y += Math.sin(star.angle) * star.speed * dt
      }
    }

    const drawShootingStars = () => {
      if (!shootingStars.length) return

      ctx.save()

      ctx.globalCompositeOperation = 'lighter'

      for (const star of shootingStars) {
        if (star.delay > 0) continue

        const x = star.x

        const y = star.y

        const tx = x - Math.cos(star.angle) * star.length

        const ty = y - Math.sin(star.angle) * star.length

        const gradient = ctx.createLinearGradient(tx, ty, x, y)

        gradient.addColorStop(0, 'rgba(80,190,255,0)')

        gradient.addColorStop(0.7, 'rgba(120,220,255,0.12)')

        gradient.addColorStop(1, 'rgba(200,245,255,0.5)')

        ctx.strokeStyle = gradient

        ctx.lineWidth = 1

        ctx.beginPath()

        ctx.moveTo(tx, ty)

        ctx.lineTo(x, y)

        ctx.stroke()
      }

      ctx.restore()
    }

    /* --------------------------------------------------
       MOUSE ENERGY
    -------------------------------------------------- */

    const drawMouse = () => {
      if (!QUALITY.mouse || !mouse.active) return

      const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, mouse.radius)

      gradient.addColorStop(0, 'rgba(60,210,255,0.075)')

      gradient.addColorStop(0.2, 'rgba(40,150,255,0.045)')

      gradient.addColorStop(0.55, 'rgba(60,80,255,0.018)')

      gradient.addColorStop(1, 'rgba(0,0,0,0)')

      ctx.fillStyle = gradient

      ctx.beginPath()

      ctx.arc(mouse.x, mouse.y, mouse.radius, 0, Math.PI * 2)

      ctx.fill()

      /* cursor halo */

      ctx.strokeStyle = 'rgba(100,220,255,0.045)'

      ctx.lineWidth = 0.7

      ctx.beginPath()

      ctx.arc(mouse.x, mouse.y, 45 + Math.sin(time * 0.003) * 5, 0, Math.PI * 2)

      ctx.stroke()
    }

    /* --------------------------------------------------
       LIGHT RAYS
    -------------------------------------------------- */

    const drawLightRays = () => {
      if (!QUALITY.rays) return

      ctx.save()

      ctx.translate(width / 2, height * 0.45)

      ctx.globalCompositeOperation = 'screen'

      for (let i = 0; i < QUALITY.rays; i++) {
        const rotation = time * 0.00002 + (Math.PI * 2 * i) / QUALITY.rays

        ctx.save()

        ctx.rotate(rotation)

        const gradient = ctx.createLinearGradient(0, -height * 0.6, 0, height * 0.6)

        gradient.addColorStop(0, 'rgba(50,150,255,0)')

        gradient.addColorStop(0.45, 'rgba(50,150,255,0.012)')

        gradient.addColorStop(0.55, 'rgba(100,180,255,0.018)')

        gradient.addColorStop(1, 'rgba(50,150,255,0)')

        ctx.fillStyle = gradient

        ctx.beginPath()

        ctx.moveTo(-25, -height)

        ctx.lineTo(25, -height)

        ctx.lineTo(90, height)

        ctx.lineTo(-90, height)

        ctx.closePath()

        ctx.fill()

        ctx.restore()
      }

      ctx.restore()
    }

    /* --------------------------------------------------
       VIGNETTE
    -------------------------------------------------- */

    const drawVignette = () => {
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.2,

        width / 2,
        height / 2,
        Math.max(width, height) * 0.78
      )

      gradient.addColorStop(0, 'rgba(0,0,0,0)')

      gradient.addColorStop(0.58, 'rgba(0,0,0,0.05)')

      gradient.addColorStop(0.8, 'rgba(0,0,0,0.18)')

      gradient.addColorStop(1, 'rgba(0,0,0,0.58)')

      ctx.fillStyle = gradient

      ctx.fillRect(0, 0, width, height)
    }

    /* --------------------------------------------------
       COLOR GRADE
    -------------------------------------------------- */

    const drawColorGrade = () => {
      const gradient = ctx.createLinearGradient(0, 0, width, height)

      gradient.addColorStop(0, 'rgba(0,50,120,0.025)')

      gradient.addColorStop(0.5, 'rgba(0,0,0,0)')

      gradient.addColorStop(1, 'rgba(20,0,90,0.025)')

      ctx.fillStyle = gradient

      ctx.fillRect(0, 0, width, height)
    }

    /* --------------------------------------------------
       MOUSE
    -------------------------------------------------- */

    const handleMouseMove = (event) => {
      if (!QUALITY.mouse) return

      mouse.targetX = event.clientX

      mouse.targetY = event.clientY

      mouse.active = true
    }

    const handleMouseLeave = () => {
      mouse.active = false
    }

    /* --------------------------------------------------
       VISIBILITY
    -------------------------------------------------- */

    const handleVisibility = () => {
      if (document.hidden) {
        running = false

        cancelAnimationFrame(animationFrame)

        return
      }

      running = true

      lastTime = performance.now()

      animationFrame = requestAnimationFrame(animate)
    }

    /* --------------------------------------------------
       REDUCED MOTION
    -------------------------------------------------- */

    const handleMotionChange = (event) => {
      reducedMotion = event.matches

      QUALITY = getQuality()

      setupObjects()
    }

    /* --------------------------------------------------
       ANIMATION
    -------------------------------------------------- */

    const animate = (now) => {
      if (!running) return

      const delta = Math.min(now - lastTime, 40)

      lastTime = now

      time = now

      /* mouse smoothing */

      mouse.x += (mouse.targetX - mouse.x) * 0.055

      mouse.y += (mouse.targetY - mouse.y) * 0.055

      /* render */

      drawBackground()

      drawNebula()

      drawSecondaryNebula()

      drawLightRays()

      drawGrid()

      drawStars()

      updateDust(delta)

      drawDust()

      updateParticles(delta)

      drawConnections()

      drawParticles()

      updateNodes(delta)

      drawNodes()

      updateOrbs(delta)

      drawOrbs()

      drawWaves()

      updateShootingStars(delta)

      drawShootingStars()

      drawPortal()

      drawMouse()

      drawColorGrade()

      drawVignette()

      animationFrame = requestAnimationFrame(animate)
    }

    /* --------------------------------------------------
       INIT
    -------------------------------------------------- */

    resize()

    setupObjects()

    window.addEventListener('resize', resize, {
      passive: true,
    })

    window.addEventListener('mousemove', handleMouseMove, {
      passive: true,
    })

    window.addEventListener('mouseleave', handleMouseLeave)

    document.addEventListener('visibilitychange', handleVisibility)

    reducedMotionQuery.addEventListener('change', handleMotionChange)

    animationFrame = requestAnimationFrame(animate)

    /* --------------------------------------------------
       CLEANUP
    -------------------------------------------------- */

    return () => {
      running = false

      cancelAnimationFrame(animationFrame)

      window.removeEventListener('resize', resize)

      window.removeEventListener('mousemove', handleMouseMove)

      window.removeEventListener('mouseleave', handleMouseLeave)

      document.removeEventListener('visibilitychange', handleVisibility)

      reducedMotionQuery.removeEventListener('change', handleMotionChange)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#000106]"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Cinematic color atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_0%,rgba(0,20,70,0.05)_45%,rgba(0,0,8,0.42)_100%)]" />

      {/* Top atmospheric glow */}
      <div className="absolute left-1/2 top-[-420px] h-[760px] w-[1100px] -translate-x-1/2 rounded-full bg-blue-500/[0.025] blur-[180px]" />

      {/* Cyan atmospheric glow */}
      <div className="absolute left-[-300px] top-[20%] h-[600px] w-[600px] rounded-full bg-cyan-500/[0.012] blur-[170px]" />

      {/* Purple atmospheric glow */}
      <div className="absolute right-[-300px] top-[35%] h-[650px] w-[650px] rounded-full bg-indigo-500/[0.012] blur-[180px]" />

      {/* Bottom glow */}
      <div className="absolute bottom-[-400px] left-1/2 h-[700px] w-[1100px] -translate-x-1/2 rounded-full bg-cyan-500/[0.015] blur-[180px]" />

      {/* Final cinematic overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.05),transparent_25%,transparent_75%,rgba(0,0,0,0.22))]" />
    </div>
  )
}
