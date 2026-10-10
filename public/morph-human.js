/*!
 * <morph-human> — zarrachalardan yaratilgan raqamli odam komponenti
 * Yuradi, boshqariladi va har N soniyada boshqa shaklga aylanadi.
 *
 * Ishlatish:
 *   <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
 *   <script src="morph-human.js"></script>
 *   <morph-human style="height:560px"></morph-human>
 *
 * Atributlar:
 *   interval="10"      shakl almashish vaqti (soniya)
 *   auto="false"       avtomatik almashishni o'chirish
 *   labels="false"     nom va nuqtalarni yashirish
 *   controls="false"   sensorli joystikni yashirish
 *   zoom               g'ildirak bilan yaqinlashtirishni yoqish
 *   theme="mono-dark"   qora fonda oq zarrachalar (oq-qora sayt)
 *   theme="mono-light"  oq fonda qora zarrachalar (oq-qora sayt)
 *   (CSS: --mh-bg, --mh-text, --mh-accent bilan ranglarni o'zgartirish mumkin)
 *
 * Metodlar:  el.next()  el.prev()  el.goTo(i)
 * Hodisa:    "shapechange"  (detail: { index, id, label })
 *
 * Boshqaruv (komponent ustida turganda): W A S D / strelkalar, Shift, Space.
 */
;(function () {
  'use strict'

  var THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
  var TAU = Math.PI * 2,
    rnd = Math.random

  /* ================================================================
     Matematika va yuzadan nuqta tanlash
     ================================================================ */
  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v))
  }
  function ease(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }
  function fract(x) {
    return x - Math.floor(x)
  }
  function dist(a, b) {
    return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2])
  }
  function norm3(v) {
    var l = Math.hypot(v[0], v[1], v[2]) || 1
    return [v[0] / l, v[1] / l, v[2] / l]
  }
  function cross(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
  }
  function unit() {
    var u = rnd() * 2 - 1,
      th = rnd() * TAU,
      s = Math.sqrt(1 - u * u)
    return [s * Math.cos(th), u, s * Math.sin(th)]
  }
  function basis(d) {
    var ax = Math.abs(d[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0]
    var u = norm3(cross(d, ax)),
      v = cross(d, u)
    return [u, v]
  }
  function hsl(h, s, l, out, o) {
    h = ((h % 1) + 1) % 1
    var a = s * Math.min(l, 1 - l)
    function f(n) {
      var k = (n + h * 12) % 12
      return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    }
    out[o] = f(0)
    out[o + 1] = f(8)
    out[o + 2] = f(4)
  }
  // 3D qiymat shovqini (qit'alar uchun)
  function hash3(x, y, z) {
    var h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453
    return h - Math.floor(h)
  }
  function vnoise(x, y, z) {
    var xi = Math.floor(x),
      yi = Math.floor(y),
      zi = Math.floor(z)
    var xf = x - xi,
      yf = y - yi,
      zf = z - zi
    var u = xf * xf * (3 - 2 * xf),
      v = yf * yf * (3 - 2 * yf),
      w = zf * zf * (3 - 2 * zf)
    function L(a, b, t) {
      return a + (b - a) * t
    }
    return L(
      L(
        L(hash3(xi, yi, zi), hash3(xi + 1, yi, zi), u),
        L(hash3(xi, yi + 1, zi), hash3(xi + 1, yi + 1, zi), u),
        v
      ),
      L(
        L(hash3(xi, yi, zi + 1), hash3(xi + 1, yi, zi + 1), u),
        L(hash3(xi, yi + 1, zi + 1), hash3(xi + 1, yi + 1, zi + 1), u),
        v
      ),
      w
    )
  }
  function fbm(x, y, z) {
    return (
      0.55 * vnoise(x, y, z) +
      0.3 * vnoise(x * 2.1, y * 2.1, z * 2.1) +
      0.15 * vnoise(x * 4.4, y * 4.4, z * 4.4)
    )
  }

  /* Primitivlar: w = yuza (og'irlik), s(out) = [x,y,z,nx,ny,nz,t] yozadi, col = rang funksiyasi */
  function tube(a, b, r0, r1, o) {
    o = o || {}
    var zs = o.zs || 1
    var d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]],
      len = Math.hypot(d[0], d[1], d[2])
    var dn = [d[0] / len, d[1] / len, d[2] / len],
      uv = basis(dn),
      u = uv[0],
      v = uv[1]
    var side = Math.PI * (r0 + r1) * len,
      cap = o.noCap ? 0 : 2 * Math.PI * (r0 * r0 + r1 * r1),
      rm = Math.max(r0, r1)
    return {
      w: (side + cap) * (o.boost || 1),
      meta: o.meta,
      col: o.col,
      s: function (out) {
        var px, py, pz, nx, ny, nz, l
        if (rnd() * (side + cap) < side) {
          var t
          do {
            t = rnd()
          } while (rnd() * rm > r0 + (r1 - r0) * t)
          var th = rnd() * TAU,
            c = Math.cos(th),
            s = Math.sin(th),
            r = r0 + (r1 - r0) * t
          nx = c * u[0] + s * v[0]
          ny = c * u[1] + s * v[1]
          nz = c * u[2] + s * v[2]
          px = a[0] + d[0] * t + nx * r
          py = a[1] + d[1] * t + ny * r
          pz = a[2] + d[2] * t + nz * r * zs
          out[6] = t
        } else {
          var atB = rnd() * (r0 * r0 + r1 * r1) > r0 * r0,
            rr = atB ? r1 : r0,
            e = atB ? b : a,
            sg = atB ? 1 : -1
          var q = unit()
          if ((q[0] * dn[0] + q[1] * dn[1] + q[2] * dn[2]) * sg < 0) q = [-q[0], -q[1], -q[2]]
          nx = q[0]
          ny = q[1]
          nz = q[2]
          px = e[0] + nx * rr
          py = e[1] + ny * rr
          pz = e[2] + nz * rr * zs
          out[6] = atB ? 1 : 0
        }
        if (zs !== 1) {
          nz /= zs
          l = Math.hypot(nx, ny, nz) || 1
          nx /= l
          ny /= l
          nz /= l
        }
        out[0] = px
        out[1] = py
        out[2] = pz
        out[3] = nx
        out[4] = ny
        out[5] = nz
      },
    }
  }
  function ell(c, r, o) {
    o = o || {}
    var p = 1.6075
    var area =
      4 *
      Math.PI *
      Math.pow(
        (Math.pow(r[0] * r[1], p) + Math.pow(r[0] * r[2], p) + Math.pow(r[1] * r[2], p)) / 3,
        1 / p
      )
    return {
      w: area * (o.boost || 1),
      meta: o.meta,
      col: o.col,
      s: function (out) {
        var q = unit(),
          n = norm3([q[0] / r[0], q[1] / r[1], q[2] / r[2]])
        out[0] = c[0] + q[0] * r[0]
        out[1] = c[1] + q[1] * r[1]
        out[2] = c[2] + q[2] * r[2]
        out[3] = n[0]
        out[4] = n[1]
        out[5] = n[2]
        out[6] = 0
      },
    }
  }
  function loft(sec, o) {
    // sec: [y, rx, rz, cz]
    o = o || {}
    var segs = [],
      tot = 0,
      i
    for (i = 0; i < sec.length - 1; i++) {
      var a = sec[i],
        b = sec[i + 1],
        rxm = (a[1] + b[1]) / 2,
        rzm = (a[2] + b[2]) / 2
      var ar = TAU * Math.sqrt((rxm * rxm + rzm * rzm) / 2) * Math.abs(b[0] - a[0])
      segs.push(ar)
      tot += ar
    }
    return {
      w: tot * (o.boost || 1),
      meta: o.meta,
      col: o.col,
      s: function (out) {
        var q = rnd() * tot,
          k = 0
        while (k < segs.length - 1 && q > segs[k]) {
          q -= segs[k]
          k++
        }
        var a = sec[k],
          b = sec[k + 1],
          t = rnd()
        var rx = a[1] + (b[1] - a[1]) * t,
          rz = a[2] + (b[2] - a[2]) * t
        var cz = (a[3] || 0) + ((b[3] || 0) - (a[3] || 0)) * t
        var th = rnd() * TAU,
          c = Math.cos(th),
          s = Math.sin(th)
        var n = norm3([c / Math.max(rx, 1e-3), 0, s / Math.max(rz, 1e-3)])
        out[0] = rx * c
        out[1] = a[0] + (b[0] - a[0]) * t
        out[2] = cz + rz * s
        out[3] = n[0]
        out[4] = n[1]
        out[5] = n[2]
        out[6] = a[0] + (b[0] - a[0]) * t
      },
    }
  }
  function tri(A, B, C, th, o) {
    o = o || {}
    var e1 = [B[0] - A[0], B[1] - A[1], B[2] - A[2]],
      e2 = [C[0] - A[0], C[1] - A[1], C[2] - A[2]]
    var cr = cross(e1, e2),
      area = Math.hypot(cr[0], cr[1], cr[2]),
      n = norm3(cr)
    return {
      w: area * (o.boost || 1),
      col: o.col,
      s: function (out) {
        var r1 = rnd(),
          r2 = rnd()
        if (r1 + r2 > 1) {
          r1 = 1 - r1
          r2 = 1 - r2
        }
        var sg = rnd() < 0.5 ? 1 : -1
        out[0] = A[0] + e1[0] * r1 + e2[0] * r2 + n[0] * th * sg
        out[1] = A[1] + e1[1] * r1 + e2[1] * r2 + n[1] * th * sg
        out[2] = A[2] + e1[2] * r1 + e2[2] * r2 + n[2] * th * sg
        out[3] = n[0] * sg
        out[4] = n[1] * sg
        out[5] = n[2] * sg
        out[6] = r1
      },
    }
  }
  function disc(c, R, o) {
    o = o || {}
    return {
      w: Math.PI * R * R * (o.boost || 1),
      col: o.col,
      s: function (out) {
        var r = R * Math.sqrt(rnd()),
          th = rnd() * TAU
        out[0] = c[0] + r * Math.cos(th)
        out[1] = c[1] + r * Math.sin(th)
        out[2] = c[2]
        out[3] = 0
        out[4] = 0
        out[5] = 1
        out[6] = r / R
      },
    }
  }
  function ringZ(c, R, r, o) {
    // z o'qi atrofidagi halqa
    o = o || {}
    return {
      w: 4 * Math.PI * Math.PI * R * r * (o.boost || 1),
      col: o.col,
      s: function (out) {
        var ph = rnd() * TAU,
          th = rnd() * TAU,
          cp = Math.cos(ph),
          sp = Math.sin(ph),
          ct = Math.cos(th),
          st = Math.sin(th)
        out[0] = c[0] + (R + r * ct) * cp
        out[1] = c[1] + (R + r * ct) * sp
        out[2] = c[2] + r * st
        out[3] = ct * cp
        out[4] = ct * sp
        out[5] = st
        out[6] = ph / TAU
      },
    }
  }
  function ringY(y, R, r, o) {
    // y o'qi atrofidagi halqa
    o = o || {}
    return {
      w: 4 * Math.PI * Math.PI * R * r * (o.boost || 1),
      col: o.col,
      s: function (out) {
        var ph = rnd() * TAU,
          th = rnd() * TAU,
          cp = Math.cos(ph),
          sp = Math.sin(ph),
          ct = Math.cos(th),
          st = Math.sin(th)
        out[0] = (R + r * ct) * cp
        out[1] = y + r * st
        out[2] = (R + r * ct) * sp
        out[3] = ct * cp
        out[4] = st
        out[5] = ct * sp
        out[6] = ph / TAU
      },
    }
  }
  function box(c, h, o) {
    o = o || {}
    return {
      w: 24 * h * h * (o.boost || 1),
      col: o.col,
      s: function (out) {
        var ax = Math.floor(rnd() * 3),
          sg = rnd() < 0.5 ? -1 : 1,
          p = [(rnd() * 2 - 1) * h, (rnd() * 2 - 1) * h, (rnd() * 2 - 1) * h]
        p[ax] = sg * h
        out[0] = c[0] + p[0]
        out[1] = c[1] + p[1]
        out[2] = c[2] + p[2]
        out[3] = ax === 0 ? sg : 0
        out[4] = ax === 1 ? sg : 0
        out[5] = ax === 2 ? sg : 0
        out[6] = 0
      },
    }
  }
  function line(a, b, lw, o) {
    o = o || {}
    var len = dist(a, b)
    return {
      w: len * lw,
      col: o.col,
      s: function (out) {
        var t = rnd(),
          j = o.jit || 0.004,
          n = unit()
        out[0] = a[0] + (b[0] - a[0]) * t + (rnd() - 0.5) * j
        out[1] = a[1] + (b[1] - a[1]) * t + (rnd() - 0.5) * j
        out[2] = a[2] + (b[2] - a[2]) * t + (rnd() - 0.5) * j
        out[3] = n[0]
        out[4] = n[1]
        out[5] = n[2]
        out[6] = t
      },
    }
  }
  function curve(fn, steps, r, o) {
    o = o || {}
    var P = [],
      L = [0],
      i
    for (i = 0; i <= steps; i++) P.push(fn(i / steps))
    for (i = 1; i <= steps; i++) L[i] = L[i - 1] + dist(P[i], P[i - 1])
    var len = L[steps]
    return {
      w: TAU * r * len * (o.boost || 1),
      col: o.col,
      meta: o.meta,
      s: function (out) {
        var u = rnd() * len,
          k = 1
        while (k < steps && L[k] < u) k++
        var a = P[k - 1],
          b = P[k],
          f = (u - L[k - 1]) / (L[k] - L[k - 1] || 1)
        var d = norm3([b[0] - a[0], b[1] - a[1], b[2] - a[2]]),
          uv = basis(d),
          th = rnd() * TAU,
          c = Math.cos(th),
          s = Math.sin(th)
        var nx = c * uv[0][0] + s * uv[1][0],
          ny = c * uv[0][1] + s * uv[1][1],
          nz = c * uv[0][2] + s * uv[1][2]
        out[0] = a[0] + (b[0] - a[0]) * f + nx * r
        out[1] = a[1] + (b[1] - a[1]) * f + ny * r
        out[2] = a[2] + (b[2] - a[2]) * f + nz * r
        out[3] = nx
        out[4] = ny
        out[5] = nz
        out[6] = (k - 1 + f) / steps
      },
    }
  }

  // Yorug'lik (qotirilgan soya): yuqori-old-o'ngdan
  var LX = 0.37,
    LY = 0.69,
    LZ = 0.72
  function buildShape(prims, N, dynStart, onMeta) {
    var pos = new Float32Array(N * 3),
      col = new Float32Array(N * 3)
    var cum = [],
      tot = 0,
      i
    prims.forEach(function (p) {
      tot += p.w
      cum.push(tot)
    })
    var out = new Float64Array(7)
    for (i = 0; i < dynStart; i++) {
      var r = rnd() * tot,
        lo = 0,
        hi = cum.length - 1
      while (lo < hi) {
        var m = (lo + hi) >> 1
        if (cum[m] < r) lo = m + 1
        else hi = m
      }
      var p = prims[lo]
      out[6] = 0
      p.s(out)
      pos[i * 3] = out[0]
      pos[i * 3 + 1] = out[1]
      pos[i * 3 + 2] = out[2]
      var c = p.col ? p.col(out[0], out[1], out[2], out[6]) : [0.55, 0.8, 0.55]
      var lam = Math.max(0, out[3] * LX + out[4] * LY + out[5] * LZ)
      hsl(c[0], c[1], Math.min(c[2] * (0.6 + 0.7 * lam), 0.9), col, i * 3)
      if (onMeta && p.meta) onMeta(i, p.meta)
    }
    return { pos: pos, col: col, dynStart: dynStart, dyn: null, mode: 'spin' }
  }
  function fn(x) {
    return function () {
      return x
    }
  }

  /* ================================================================
     1. ODAM — anatomik yuklangan tana
     ================================================================ */
  function M(type, side, p1, p2) {
    return { type: type, side: side, y1: p1[0], z1: p1[1], y2: p2[0], z2: p2[1] }
  }
  function buildHuman(N) {
    var H = {
      type: new Uint8Array(N),
      side: new Int8Array(N),
      y1: new Float32Array(N),
      z1: new Float32Array(N),
      y2: new Float32Array(N),
      z2: new Float32Array(N),
    }
    var prims = [],
      M0 = M(0, 0, [0, 0], [0, 0])
    function body(lBoost) {
      return function (x, y) {
        return [
          0.66 - 0.15 * clamp(y / 1.7, 0, 1) + (rnd() - 0.5) * 0.015,
          0.85,
          0.54 + (lBoost || 0),
        ]
      }
    }
    var eyeCol = function () {
      return [0.5, 0.35, 0.93]
    }
    // Tana (ko'krak, bel, chanoq)
    prims.push(
      loft(
        [
          [1.47, 0.07, 0.07, 0],
          [1.43, 0.17, 0.09, 0],
          [1.4, 0.225, 0.108, 0],
          [1.32, 0.225, 0.122, 0.004],
          [1.22, 0.195, 0.115, 0],
          [1.1, 0.165, 0.1, 0],
          [1.02, 0.172, 0.103, 0],
          [0.93, 0.185, 0.105, 0],
          [0.88, 0.17, 0.095, 0],
        ],
        { meta: M0, col: body(0) }
      )
    )
    prims.push(tube([0, 1.43, 0], [0, 1.55, 0.012], 0.052, 0.046, { meta: M0, col: body(0.05) })) // bo'yin
    prims.push(ell([0, 1.675, 0.012], [0.093, 0.117, 0.106], { meta: M0, col: body(0.08) })) // bosh
    prims.push(ell([0, 1.615, 0.04], [0.062, 0.055, 0.062], { meta: M0, col: body(0.08) })) // iyak
    prims.push(ell([0, 1.665, 0.115], [0.014, 0.02, 0.02], { meta: M0, col: body(0.12), boost: 3 })) // burun
    prims.push(
      ell([-0.036, 1.69, 0.097], [0.012, 0.008, 0.007], { meta: M0, col: eyeCol, boost: 7 })
    ) // ko'zlar
    prims.push(
      ell([0.036, 1.69, 0.097], [0.012, 0.008, 0.007], { meta: M0, col: eyeCol, boost: 7 })
    )
    prims.push(
      ell([-0.094, 1.67, 0], [0.012, 0.026, 0.02], { meta: M0, col: body(0.06), boost: 2 })
    ) // quloqlar
    prims.push(ell([0.094, 1.67, 0], [0.012, 0.026, 0.02], { meta: M0, col: body(0.06), boost: 2 }))
    ;[-1, 1].forEach(function (sd) {
      var sh = [sd * 0.255, 1.4, 0],
        el = [sd * 0.285, 1.13, 0.005],
        wr = [sd * 0.292, 0.875, 0.01]
      var m1 = M(1, sd, [1.4, 0], [1.13, 0.005]),
        m2 = M(2, sd, [1.4, 0], [1.13, 0.005])
      prims.push(ell(sh, [0.058, 0.062, 0.058], { meta: m1, col: body(0.02) }))
      prims.push(tube(sh, el, 0.052, 0.041, { meta: m1, col: body(0) }))
      prims.push(tube(el, wr, 0.041, 0.03, { meta: m2, col: body(0) }))
      prims.push(
        ell([sd * 0.293, 0.815, 0.015], [0.032, 0.068, 0.022], { meta: m2, col: body(0.06) })
      )
      prims.push(ell([sd * 0.31, 0.85, 0.045], [0.012, 0.03, 0.014], { meta: m2, col: body(0.06) }))
      var hp = [sd * 0.097, 0.95, 0],
        kn = [sd * 0.1, 0.52, 0.012],
        an = [sd * 0.1, 0.085, -0.005]
      var m3 = M(3, sd, [0.95, 0], [0.52, 0.012]),
        m4 = M(4, sd, [0.95, 0], [0.52, 0.012])
      prims.push(ell(hp, [0.09, 0.085, 0.09], { meta: m3, col: body(0) }))
      prims.push(tube(hp, kn, 0.088, 0.058, { meta: m3, col: body(0) }))
      prims.push(ell(kn, [0.058, 0.06, 0.058], { meta: m4, col: body(0.02) }))
      prims.push(tube(kn, an, 0.058, 0.036, { meta: m4, col: body(0) }))
      prims.push(
        tube([sd * 0.1, 0.07, -0.035], [sd * 0.1, 0.04, 0.16], 0.046, 0.032, {
          meta: m4,
          col: body(0.04),
        })
      )
      prims.push(ell([sd * 0.1, 0.045, 0.16], [0.03, 0.025, 0.025], { meta: m4, col: body(0.06) }))
    })
    var sh = buildShape(prims, N, N, function (i, m) {
      H.type[i] = m.type
      H.side[i] = m.side
      H.y1[i] = m.y1
      H.z1[i] = m.z1
      H.y2[i] = m.y2
      H.z2[i] = m.z2
    })
    sh.human = H
    return sh
  }

  /* ================================================================
     2. KOD — </> belgisi + yozuv kursori + ko'tarilayotgan ma'lumot
     ================================================================ */
  function buildCode(N) {
    var cy = function (x, y, z, t) {
      return [0.5 + (rnd() - 0.5) * 0.02, 0.9, 0.58]
    }
    var pk = function () {
      return [0.92 + (rnd() - 0.5) * 0.02, 0.85, 0.62]
    }
    var vi = function () {
      return [0.76 + (rnd() - 0.5) * 0.02, 0.85, 0.6]
    }
    var am = function () {
      return [0.11, 0.95, 0.6]
    }
    var o = function (c) {
      return { zs: 1.7, col: c }
    }
    var prims = [
      tube([-0.46, 1.5, 0], [-0.98, 0.95, 0], 0.054, 0.054, o(cy)),
      tube([-0.98, 0.95, 0], [-0.46, 0.4, 0], 0.054, 0.054, o(cy)),
      tube([-0.12, 0.25, 0], [0.14, 1.65, 0], 0.054, 0.054, o(pk)),
      tube([0.46, 1.5, 0], [0.98, 0.95, 0], 0.054, 0.054, o(vi)),
      tube([0.98, 0.95, 0], [0.46, 0.4, 0], 0.054, 0.054, o(vi)),
      tube([0.3, 0.02, 0], [0.72, 0.02, 0], 0.036, 0.036, o(am)),
    ]
    var dc = Math.round(N * 0.08),
      ds = N - dc,
      sx = [],
      sz = [],
      sp = [],
      so = []
    for (var k = 0; k < dc; k++) {
      sx.push((rnd() * 2 - 1) * 1.25)
      sz.push((rnd() - 0.5) * 0.5)
      sp.push(0.08 + rnd() * 0.18)
      so.push(rnd())
    }
    var sh = buildShape(prims, N, ds)
    sh.mode = 'sway'
    sh.dyn = function (i, t) {
      var k = i - ds,
        u = fract(t * sp[k] + so[k]),
        j = i * 3
      sh.pos[j] = sx[k]
      sh.pos[j + 1] = 0.05 + u * 2.1
      sh.pos[j + 2] = sz[k]
      hsl(0.5 + (k % 5) * 0.03, 0.7, 0.35 + 0.35 * Math.sin(u * Math.PI), sh.col, j)
    }
    return sh
  }

  /* ================================================================
     3. MIYA — neyron tarmoq (sun'iy intellekt)
     ================================================================ */
  function brainPt(u, sd) {
    var x = u[0],
      y = u[1],
      z = u[2]
    if (y < -0.3) y = -0.3 + (y + 0.3) * 0.45
    var f =
      1 +
      0.07 * Math.sin(9 * x * sd + 4 * y) * Math.sin(8 * z + 2 * x) +
      0.04 * Math.sin(15 * y + 6 * z)
    var px = sd * 0.2 + x * 0.42 * f
    if (px * sd < 0.03) px = sd * 0.03
    return [px, 1.2 + y * 0.47 * f, z * 0.66 * f]
  }
  function buildBrain(N) {
    var nodes = [],
      i,
      j
    for (i = 0; i < 110; i++) nodes.push(brainPt(unit(), rnd() < 0.5 ? -1 : 1))
    for (i = 0; i < 7; i++) nodes.push([(rnd() - 0.5) * 0.05, 0.88 - i * 0.07, -0.18 + i * 0.01])
    var seen = {},
      edges = []
    function addEdge(a, b) {
      var key = a < b ? a + '_' + b : b + '_' + a
      if (!seen[key] && a !== b) {
        seen[key] = 1
        edges.push([nodes[a], nodes[b]])
      }
    }
    for (i = 0; i < nodes.length; i++) {
      var ds = []
      for (j = 0; j < nodes.length; j++) if (j !== i) ds.push([dist(nodes[i], nodes[j]), j])
      ds.sort(function (p, q) {
        return p[0] - q[0]
      })
      for (j = 0; j < 3; j++) addEdge(i, ds[j][1])
    }
    for (i = 0; i < 40; i++) {
      var a = Math.floor(rnd() * nodes.length),
        b = Math.floor(rnd() * nodes.length)
      if (dist(nodes[a], nodes[b]) < 0.95) addEdge(a, b)
    }
    var nodeCol = function () {
      return [0.48 + (rnd() - 0.5) * 0.03, 0.9, 0.68]
    }
    var edgeCol = function (x, y, z, t) {
      return [0.6 + t * 0.2, 0.8, 0.5]
    }
    var hazeCol = function () {
      return [0.62, 0.7, 0.4]
    }
    var prims = []
    nodes.forEach(function (p) {
      prims.push(ell(p, [0.026, 0.026, 0.026], { col: nodeCol, boost: 1.4 }))
    })
    edges.forEach(function (e) {
      prims.push(line(e[0], e[1], 0.022, { col: edgeCol }))
    })
    ;[-1, 1].forEach(function (sd) {
      prims.push({
        w: 0.55,
        col: hazeCol,
        s: function (out) {
          var u = unit(),
            p = brainPt(u, sd)
          out[0] = p[0]
          out[1] = p[1]
          out[2] = p[2]
          out[3] = u[0]
          out[4] = u[1]
          out[5] = u[2]
          out[6] = 0
        },
      })
    })
    prims.push(tube([0, 0.9, -0.18], [0, 0.4, -0.12], 0.07, 0.05, { col: hazeCol, boost: 2 }))
    var dc = Math.round(N * 0.1),
      dst = N - dc,
      ei = [],
      sp = [],
      so = []
    for (i = 0; i < dc; i++) {
      ei.push(edges[Math.floor(rnd() * edges.length)])
      sp.push(0.25 + rnd() * 0.55)
      so.push(rnd())
    }
    var sh = buildShape(prims, N, dst)
    sh.dyn = function (i, t) {
      var k = i - dst,
        u = fract(t * sp[k] + so[k]),
        e = ei[k],
        j = i * 3
      sh.pos[j] = e[0][0] + (e[1][0] - e[0][0]) * u
      sh.pos[j + 1] = e[0][1] + (e[1][1] - e[0][1]) * u
      sh.pos[j + 2] = e[0][2] + (e[1][2] - e[0][2]) * u
      hsl(0.93, 0.8, 0.55 + 0.3 * Math.sin(u * Math.PI), sh.col, j)
    }
    return sh
  }

  /* ================================================================
     4. DUNYO — nuqtali globus, aloqa yoylari, orbita va yo'ldosh
     ================================================================ */
  function buildGlobe(N) {
    var R = 0.85,
      M2 = Math.round(N * 1.2),
      tilt = 0.41,
      ct = Math.cos(tilt),
      st = Math.sin(tilt),
      CY = 1.02,
      i
    function ringFn(t) {
      var a = t * TAU,
        x = 1.22 * Math.cos(a),
        z0 = 1.22 * Math.sin(a)
      return [x, -z0 * Math.sin(0.5), z0 * Math.cos(0.5)]
    }
    var cities = []
    for (i = 0; i < 7; i++) cities.push(unit())
    var pairs = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [0, 3],
      [2, 5],
    ]
    function arcFn(a, b) {
      var om = Math.acos(clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -0.999, 0.999)),
        so = Math.sin(om)
      return function (t) {
        var k1 = Math.sin((1 - t) * om) / so,
          k2 = Math.sin(t * om) / so
        var p = norm3([a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2])
        var h = R + 0.03 + 0.28 * Math.sin(Math.PI * t) * (om / 2)
        return [p[0] * h, p[1] * h, p[2] * h]
      }
    }
    var arcs = pairs.map(function (p) {
      return arcFn(cities[p[0]], cities[p[1]])
    })
    var prims = []
    prims.push({
      w: 10,
      col: function (x, y, z, t) {
        if (Math.abs(y) > R * 0.88) return [0.55, 0.2, 0.85]
        return t > 0.5 ? [0.38 + (rnd() - 0.5) * 0.04, 0.75, 0.56] : [0.6, 0.8, 0.34]
      },
      s: function (out) {
        var px, py, pz, land
        do {
          var j = Math.floor(rnd() * M2),
            yy = 1 - (2 * (j + 0.5)) / M2,
            rr = Math.sqrt(1 - yy * yy),
            ph = j * 2.39996323
          px = rr * Math.cos(ph)
          py = yy
          pz = rr * Math.sin(ph)
          land = fbm(px * 1.5 + 3.1, py * 1.5 + 1.7, pz * 1.5 + 0.4) > 0.53
        } while (!land && rnd() < 0.62)
        out[0] = px * R
        out[1] = py * R
        out[2] = pz * R
        out[3] = px
        out[4] = py
        out[5] = pz
        out[6] = land ? 1 : 0
      },
    })
    prims.push({
      w: 0.8,
      col: function () {
        return [0.58, 0.7, 0.4]
      },
      s: function (out) {
        var u = unit()
        out[0] = u[0] * R * 1.08
        out[1] = u[1] * R * 1.08
        out[2] = u[2] * R * 1.08
        out[3] = u[0]
        out[4] = u[1]
        out[5] = u[2]
        out[6] = 0
      },
    })
    prims.push(
      curve(ringFn, 90, 0.005, {
        col: function () {
          return [0.55, 0.5, 0.7]
        },
        boost: 1.6,
      })
    )
    arcs.forEach(function (f) {
      prims.push(
        curve(f, 48, 0.006, {
          col: function (x, y, z, t) {
            return [0.92 - 0.42 * t, 0.85, 0.62]
          },
          boost: 1.2,
        })
      )
    })
    cities.forEach(function (c) {
      prims.push(
        ell([c[0] * R * 1.01, c[1] * R * 1.01, c[2] * R * 1.01], [0.024, 0.024, 0.024], {
          col: function () {
            return [0.1, 0.9, 0.62]
          },
          boost: 1.4,
        })
      )
    })

    var d1 = Math.round(N * 0.07),
      d2 = Math.round(N * 0.03),
      dst = N - d1 - d2,
      ai = [],
      sp = [],
      so = [],
      off = []
    for (i = 0; i < d1; i++) {
      ai.push(Math.floor(rnd() * arcs.length))
      sp.push(0.12 + rnd() * 0.25)
      so.push(rnd())
    }
    for (i = 0; i < d2; i++) off.push(unit())
    var sh = buildShape(prims, N, dst)
    function xf(x, y, z, arr, j) {
      arr[j] = x * ct - y * st
      arr[j + 1] = x * st + y * ct + CY
      arr[j + 2] = z
    }
    for (i = 0; i < dst; i++) {
      var j0 = i * 3
      xf(sh.pos[j0], sh.pos[j0 + 1], sh.pos[j0 + 2], sh.pos, j0)
    }
    sh.dyn = function (i, t) {
      var j = i * 3,
        k = i - dst,
        p
      if (k < d1) {
        var u = fract(t * sp[k] + so[k])
        p = arcs[ai[k]](u)
        xf(p[0], p[1], p[2], sh.pos, j)
        hsl(0.12, 0.6, 0.6 + 0.25 * Math.sin(u * Math.PI), sh.col, j)
      } else {
        var m = k - d1
        p = ringFn(fract(t * 0.06))
        var o = off[m]
        xf(p[0] + o[0] * 0.045, p[1] + o[1] * 0.045, p[2] + o[2] * 0.045, sh.pos, j)
        hsl(0.52, 0.5, 0.8, sh.col, j)
      }
    }
    return sh
  }

  /* ================================================================
     5. RAKETA — jonli olov bilan
     ================================================================ */
  function buildRocket(N) {
    var prims = [],
      i
    var bodyCol = function (x, y) {
      if (y > 0.93 && y < 1.01) return [0.0, 0.85, 0.6]
      if (y > 1.5) return [0.98, 0.8, 0.62]
      return [0.56, 0.25, 0.78]
    }
    var red = function () {
      return [0.98, 0.8, 0.6]
    }
    var cyan = function () {
      return [0.52, 0.9, 0.7]
    }
    var amber = function () {
      return [0.12, 0.95, 0.62]
    }
    prims.push(
      loft(
        [
          [0.6, 0.19, 0.19],
          [0.66, 0.215, 0.215],
          [0.95, 0.235, 0.235],
          [1.3, 0.235, 0.235],
          [1.5, 0.205, 0.205],
          [1.68, 0.15, 0.15],
          [1.84, 0.085, 0.085],
          [1.96, 0.03, 0.03],
          [2.0, 0.001, 0.001],
        ],
        { col: bodyCol }
      )
    )
    prims.push(ringY(0.975, 0.238, 0.012, { col: amber, boost: 1.4 }))
    prims.push(ringY(1.52, 0.2, 0.01, { col: amber }))
    prims.push(ringY(0.64, 0.21, 0.01, { col: amber }))
    prims.push(disc([0, 1.3, 0.2355], 0.075, { col: cyan, boost: 1.6 }))
    prims.push(ringZ([0, 1.3, 0.236], 0.09, 0.012, { col: amber, boost: 1.4 }))
    for (var k = 0; k < 3; k++) {
      var a = (k * TAU) / 3,
        ca = Math.cos(a),
        sa = Math.sin(a)
      var P = function (r, y) {
        return [r * sa, y, r * ca]
      }
      prims.push(tri(P(0.22, 0.98), P(0.48, 0.6), P(0.58, 0.36), 0.012, { col: red }))
      prims.push(tri(P(0.22, 0.98), P(0.58, 0.36), P(0.22, 0.58), 0.012, { col: red }))
    }
    prims.push(
      tube([0, 0.6, 0], [0, 0.46, 0], 0.13, 0.17, {
        noCap: true,
        col: function () {
          return [0.08, 0.3, 0.5]
        },
      })
    )
    prims.push(ringY(0.46, 0.17, 0.01, { col: amber, boost: 1.5 }))
    var dc = Math.round(N * 0.22),
      dst = N - dc,
      sa2 = [],
      sr = [],
      sp = [],
      so = []
    for (i = 0; i < dc; i++) {
      sa2.push(rnd() * TAU)
      sr.push(Math.sqrt(rnd()))
      sp.push(1.4 + rnd() * 1.2)
      so.push(rnd())
    }
    var sh = buildShape(prims, N, dst)
    sh.dyn = function (i, t) {
      var k = i - dst,
        u = fract(t * sp[k] + so[k]),
        j = i * 3
      var rr = 0.15 * (1 - u * 0.8) * sr[k],
        fl = Math.sin(t * 25 + k) * 0.01
      sh.pos[j] = Math.cos(sa2[k]) * rr + fl
      sh.pos[j + 1] = 0.45 - u * 0.44
      sh.pos[j + 2] = Math.sin(sa2[k]) * rr + fl
      hsl(0.14 * (1 - u) + 0.0, 0.95, 0.88 - 0.38 * u, sh.col, j)
    }
    return sh
  }

  /* ================================================================
     6. DIZAYN — bezye egri chizig'i, langarlar, qalam
     ================================================================ */
  function buildDesign(N) {
    var P0 = [-0.9, 0.5],
      C1 = [-0.4, 0.5],
      C2 = [-0.5, 1.45],
      P1 = [0, 1.1],
      C1b = [0.5, 0.75],
      C2b = [0.4, 1.7],
      P2 = [0.9, 1.65]
    function bez(a, b, c, d, t) {
      var u = 1 - t
      return [
        u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
        u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1],
        0,
      ]
    }
    function path(t) {
      return t < 0.5 ? bez(P0, C1, C2, P1, t * 2) : bez(P1, C1b, C2b, P2, (t - 0.5) * 2)
    }
    var prims = []
    prims.push(
      curve(
        function (t) {
          return bez(P0, C1, C2, P1, t)
        },
        70,
        0.03,
        {
          col: function (x, y, z, t) {
            return [0.9 - 0.2 * t, 0.85, 0.62]
          },
        }
      )
    )
    prims.push(
      curve(
        function (t) {
          return bez(P1, C1b, C2b, P2, t)
        },
        70,
        0.03,
        {
          col: function (x, y, z, t) {
            return [0.7 - 0.2 * t, 0.85, 0.62]
          },
        }
      )
    )
    var hcol = function () {
      return [0.58, 0.3, 0.62]
    }
    var hdot = function () {
      return [0.12, 0.95, 0.62]
    }
    ;[
      [P0, C1],
      [P1, C2],
      [P1, C1b],
      [P2, C2b],
    ].forEach(function (p) {
      prims.push(line([p[0][0], p[0][1], 0], [p[1][0], p[1][1], 0], 0.025, { col: hcol }))
      prims.push(ell([p[1][0], p[1][1], 0], [0.03, 0.03, 0.03], { col: hdot, boost: 1.4 }))
    })
    var acol = function () {
      return [0.52, 0.9, 0.72]
    }
    ;[P0, P2].forEach(function (p) {
      // ichi bo'sh kvadrat langarlar
      var h = 0.06,
        c = [p[0], p[1], 0],
        sgn = [-1, 1],
        x,
        y,
        z
      sgn.forEach(function (sy) {
        sgn.forEach(function (sz2) {
          prims.push(
            tube(
              [c[0] - h, c[1] + sy * h, sz2 * h],
              [c[0] + h, c[1] + sy * h, sz2 * h],
              0.007,
              0.007,
              { col: acol }
            )
          )
          prims.push(
            tube(
              [c[0] + sy * h, c[1] - h, sz2 * h],
              [c[0] + sy * h, c[1] + h, sz2 * h],
              0.007,
              0.007,
              { col: acol }
            )
          )
          prims.push(
            tube(
              [c[0] + sy * h, c[1] + sz2 * h, -h],
              [c[0] + sy * h, c[1] + sz2 * h, h],
              0.007,
              0.007,
              { col: acol }
            )
          )
        })
      })
    })
    prims.push(
      box([P1[0], P1[1], 0], 0.06, {
        col: function () {
          return [0.52, 0.9, 0.78]
        },
        boost: 1.2,
      })
    ) // tanlangan langar
    // qalam
    var T = [0.9, 1.65, 0],
      d = norm3([0.55, 0.84, 0])
    function at(s) {
      return [T[0] + d[0] * s, T[1] + d[1] * s, 0]
    }
    prims.push(
      tube(T, at(0.28), 0.004, 0.075, {
        noCap: true,
        col: function () {
          return [0.12, 0.2, 0.85]
        },
      })
    )
    prims.push(
      tube(at(0.28), at(0.52), 0.075, 0.075, {
        col: function () {
          return [0.76, 0.8, 0.55]
        },
      })
    )
    prims.push(
      tube(at(0.28), at(0.31), 0.082, 0.082, {
        col: function () {
          return [0.12, 0.95, 0.62]
        },
        boost: 1.4,
      })
    )
    // Figma kabi nuqtali tur
    prims.push({
      w: 0.5,
      col: function () {
        return [0.62, 0.5, 0.3]
      },
      s: function (out) {
        out[0] = -1.2 + Math.floor(rnd() * 26) * 0.1
        out[1] = 0.3 + Math.floor(rnd() * 19) * 0.1
        out[2] = -0.12
        out[3] = 0
        out[4] = 0
        out[5] = 1
        out[6] = 0
      },
    })
    var dc = Math.round(N * 0.06),
      dst = N - dc,
      sp = [],
      so = [],
      i
    for (i = 0; i < dc; i++) {
      sp.push(0.1 + rnd() * 0.1)
      so.push(rnd())
    }
    var sh = buildShape(prims, N, dst)
    sh.mode = 'sway'
    sh.dyn = function (i, t) {
      var k = i - dst,
        u = fract(t * sp[k] + so[k]),
        p = path(u),
        j = i * 3
      sh.pos[j] = p[0] + (rnd() - 0.5) * 0.03
      sh.pos[j + 1] = p[1] + (rnd() - 0.5) * 0.03
      sh.pos[j + 2] = (rnd() - 0.5) * 0.05
      hsl(0.1, 0.4, 0.85, sh.col, j)
    }
    return sh
  }

  var SHAPES = [
    { id: 'odam', label: 'Odam', build: buildHuman },
    { id: 'kod', label: 'Kod', build: buildCode },
    { id: 'miya', label: "Sun'iy intellekt", build: buildBrain },
    { id: 'dunyo', label: 'Dunyo', build: buildGlobe },
    { id: 'raketa', label: 'Raketa', build: buildRocket },
    { id: 'dizayn', label: 'Dizayn', build: buildDesign },
  ]

  /* ================================================================
     Yurish animatsiyasi (faqat odam shakli uchun)
     ================================================================ */
  var ang = new Float32Array(8),
    cs = new Float32Array(8),
    sn = new Float32Array(8)
  function animateHuman(sh, target, N, t, move, run, ph) {
    var H = sh.human,
      rest = sh.pos
    var amp = (run ? 1.0 : 0.65) * move
    var hipL = Math.sin(ph) * 0.75 * amp,
      hipR = -hipL
    var kneeL = -Math.max(0, Math.cos(ph)) * amp - 0.04,
      kneeR = -Math.max(0, -Math.cos(ph)) * amp - 0.04
    var breath = Math.sin(t * 1.8) * 0.03 * (1 - Math.min(move, 1))
    var elb = 0.22 + 0.55 * amp
    ang[0] = -hipL * 0.8 + breath
    ang[1] = -hipR * 0.8 - breath
    ang[2] = elb
    ang[3] = elb
    ang[4] = hipL
    ang[5] = hipR
    ang[6] = kneeL
    ang[7] = kneeR
    for (var a = 0; a < 8; a++) {
      cs[a] = Math.cos(ang[a])
      sn[a] = Math.sin(ang[a])
    }
    for (var i = 0; i < N; i++) {
      var i3 = i * 3,
        ty = H.type[i],
        x = rest[i3],
        y = rest[i3 + 1],
        z = rest[i3 + 2]
      if (ty !== 0) {
        var s = H.side[i] < 0 ? 0 : 1,
          y1 = H.y1[i],
          z1 = H.z1[i]
        if (ty === 2 || ty === 4) {
          var ai = (ty === 2 ? 2 : 6) + s,
            y2 = H.y2[i],
            z2 = H.z2[i],
            dy = y - y2,
            dz = z - z2
          y = dy * cs[ai] + dz * sn[ai] + y2
          z = -dy * sn[ai] + dz * cs[ai] + z2
        }
        var aj = (ty <= 2 ? 0 : 4) + s,
          ey = y - y1,
          ez = z - z1
        y = ey * cs[aj] + ez * sn[aj] + y1
        z = -ey * sn[aj] + ez * cs[aj] + z1
      }
      target[i3] = x
      target[i3 + 1] = y
      target[i3 + 2] = z
    }
  }

  /* ================================================================
     Shaderlar
     ================================================================ */
  var VERT = [
    'attribute vec3 aColor; attribute float aSeed;',
    'uniform float uTime, uScale, uSize, uGlow, uScan, uMorph, uMono, uLight;',
    'varying vec3 vColor; varying float vA;',
    'void main(){',
    '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
    '  float tw = 0.8 + 0.2 * sin(uTime * (1.2 + aSeed * 2.5) + aSeed * 60.0);',
    '  float scan = exp(-pow((position.y - uScan) * 7.0, 2.0));',
    '  float sz = uSize * (0.7 + 0.6 * aSeed) * (1.0 + scan * 0.7 + uMorph * 0.7);',
    '  gl_PointSize = clamp(sz * uScale / (-mv.z), 1.0, 48.0);',
    '  vec3 c = aColor * tw + scan * vec3(0.3, 0.55, 0.65);',
    '  float lum = dot(c, vec3(0.299, 0.587, 0.114));',
    '  float a = mix(0.8, 0.07, uGlow);',
    '  if (uMono > 0.5) {',
    '    if (uLight > 0.5) { c = vec3(0.04); a *= clamp(lum * 1.5 + 0.2, 0.0, 1.0) * 1.15; }',
    '    else { c = vec3(min(lum * 1.35, 1.0)); }',
    '  }',
    '  vColor = c; vA = a;',
    '  gl_Position = projectionMatrix * mv;',
    '}',
  ].join('\n')
  var FRAG = [
    'varying vec3 vColor; varying float vA;',
    'void main(){',
    '  float d = length(gl_PointCoord - 0.5);',
    '  if (d > 0.5) discard;',
    '  float a = pow(smoothstep(0.5, 0.04, d), 1.4);',
    '  gl_FragColor = vec4(vColor, a * vA);',
    '}',
  ].join('\n')
  var FVERT = [
    'uniform vec2 uOrigin, uCenter; uniform float uRip, uScale; varying float vA;',
    'void main(){',
    '  vec3 p = position + vec3(uOrigin.x, 0.0, uOrigin.y);',
    '  float d = length(p.xz - uCenter);',
    '  float ring = exp(-pow((d - uRip) * 2.2, 2.0));',
    '  vA = smoothstep(8.5, 1.0, d) * (0.2 + ring * 0.9);',
    '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
    '  gl_PointSize = clamp(0.03 * uScale / (-mv.z) * (1.0 + ring * 1.2), 1.0, 12.0);',
    '  gl_Position = projectionMatrix * mv;',
    '}',
  ].join('\n')
  var FFRAG = [
    'uniform vec3 uFloorCol; varying float vA;',
    'void main(){ float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard;',
    '  gl_FragColor = vec4(uFloorCol, smoothstep(0.5, 0.1, d) * vA); }',
  ].join('\n')

  /* ================================================================
     Komponent
     ================================================================ */
  var CSS = [
    ':host{display:block;position:relative;width:100%;height:100%;min-height:320px;overflow:hidden;outline:none;',
    '  background:var(--mh-bg,#070912);color:var(--mh-text,#e8ecff);--a:var(--mh-accent,#5ef2ff);',
    '  font-family:var(--mh-font,"Syne","Trebuchet MS",system-ui,sans-serif);-webkit-user-select:none;user-select:none}',
    'canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:pan-y;cursor:grab}',
    'canvas:active{cursor:grabbing}',
    '.name{position:absolute;left:clamp(14px,3vw,28px);bottom:clamp(16px,3vw,28px);width:min(380px,60%);pointer-events:none}',
    '.name b{display:block;font-weight:800;font-size:clamp(28px,5vw,52px);line-height:1;letter-spacing:-.02em;margin-bottom:12px}',
    ':host([theme="mono-dark"]){background:var(--mh-bg,#000);color:var(--mh-text,#fff);--a:var(--mh-accent,#fff)}',
    ':host([theme="mono-light"]){background:var(--mh-bg,#fff);color:var(--mh-text,#0a0a0a);--a:var(--mh-accent,#0a0a0a)}',
    '.bar{position:relative;height:2px;border-radius:2px;overflow:hidden}',
    '.bar::before{content:"";position:absolute;inset:0;background:currentColor;opacity:.16}',
    '.bar i{position:relative;display:block;height:100%;transform-origin:left;transform:scaleX(0);background:linear-gradient(90deg,var(--a),#ff5fb0)}',
    ':host([theme^="mono"]) .bar i{background:var(--a)}',
    '.dots{position:absolute;right:clamp(14px,3vw,28px);bottom:clamp(16px,3vw,28px);display:flex;gap:8px;align-items:center}',
    '.dots button{width:10px;height:10px;padding:0;border-radius:50%;border:1px solid currentColor;background:transparent;cursor:pointer;transition:transform .2s,background .2s}',
    '.dots button[aria-current="true"]{background:var(--a);border-color:var(--a);transform:scale(1.35)}',
    '.dots button:focus-visible{outline:2px solid var(--a);outline-offset:3px}',
    '.hint{position:absolute;left:50%;top:14px;transform:translateX(-50%);font:600 12px/1.4 var(--mh-body,"Manrope",system-ui,sans-serif);color:currentColor;opacity:.55;pointer-events:none;transition:opacity .6s;text-align:center;padding:0 12px}',
    '.hint.off{opacity:0 !important}',
    '.joy{position:absolute;left:18px;bottom:96px;width:104px;height:104px;border-radius:50%;border:1px solid currentColor;background:transparent;display:none;touch-action:none}',
    '.joy i{position:absolute;left:50%;top:50%;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;background:var(--a);opacity:.5;border:1px solid var(--a)}',
    '@media (hover:none) and (pointer:coarse){.joy.on{display:block}.hint{display:none}}',
  ].join('')

  function loadThree() {
    if (window.THREE) return Promise.resolve()
    if (window.__mhThree) return window.__mhThree
    window.__mhThree = new Promise(function (res, rej) {
      var s = document.createElement('script')
      s.src = THREE_URL
      s.onload = res
      s.onerror = rej
      document.head.appendChild(s)
    })
    return window.__mhThree
  }

  var shapeCache = {}
  function getShapes(N) {
    if (!shapeCache[N])
      shapeCache[N] = SHAPES.map(function (s) {
        var sh = s.build(N)
        sh.id = s.id
        sh.label = s.label
        return sh
      })
    return shapeCache[N]
  }

  var Base = typeof HTMLElement !== 'undefined' ? HTMLElement : function () {}
  class MorphHuman extends Base {
    constructor() {
      super()
      this._started = false
    }

    connectedCallback() {
      if (this._started) return
      this._started = true
      if (!this.shadowRoot) this.attachShadow({ mode: 'open' })
      var self = this
      loadThree()
        .then(function () {
          if (self.isConnected) self._init()
        })
        .catch(function () {
          self.shadowRoot.innerHTML =
            '<p style="color:#8d94b8;font:14px system-ui;padding:16px">three.js yuklanmadi</p>'
        })
    }
    disconnectedCallback() {
      this._destroy()
      this._started = false
    }

    static get observedAttributes() {
      return ['theme']
    }
    attributeChangedCallback() {
      if (this._renderer) this._applyTheme()
    }

    _applyTheme() {
      var THREE = window.THREE,
        th = this.getAttribute('theme') || 'color'
      var mono = th === 'mono-dark' || th === 'mono-light',
        light = th === 'mono-light'
      var blend = light ? THREE.NormalBlending : THREE.AdditiveBlending
      ;[this._matCore, this._matGlow, this._floorMat].forEach(function (m) {
        m.blending = blend
        m.needsUpdate = true
      })
      ;[this._matCore, this._matGlow].forEach(function (m) {
        m.uniforms.uMono.value = mono ? 1 : 0
        m.uniforms.uLight.value = light ? 1 : 0
      })
      this._glowPts.visible = !light
      var fc = this._floorMat.uniforms.uFloorCol.value
      if (light) fc.set(0.05, 0.05, 0.05)
      else if (mono) fc.set(0.85, 0.85, 0.85)
      else fc.set(0.35, 0.72, 1.0)
    }

    next() {
      this._go((this._idx + 1) % SHAPES.length)
    }
    prev() {
      this._go((this._idx + SHAPES.length - 1) % SHAPES.length)
    }
    goTo(i) {
      this._go(clamp(i | 0, 0, SHAPES.length - 1))
    }
    get index() {
      return this._idx
    }

    _init() {
      var self = this,
        THREE = window.THREE,
        root = this.shadowRoot
      this._interval = parseFloat(this.getAttribute('interval')) || 10
      this._auto = this.getAttribute('auto') !== 'false'
      var labels = this.getAttribute('labels') !== 'false'
      var coarse = window.matchMedia && matchMedia('(pointer: coarse)').matches
      var N = coarse || (navigator.hardwareConcurrency || 8) <= 4 ? 16000 : 30000
      this._N = N
      this._shapes = getShapes(N)
      if (!this.hasAttribute('tabindex')) this.setAttribute('tabindex', '0')

      root.innerHTML =
        '<style>' +
        CSS +
        '</style><canvas></canvas>' +
        (labels
          ? '<div class="name"><b></b><div class="bar"><i></i></div></div><div class="dots" role="group" aria-label="Shakllar"></div>'
          : '') +
        '<div class="hint">W A S D yurish · Shift yugurish · Space keyingi shakl · sudrab aylantiring</div>' +
        '<div class="joy"><i></i></div>'
      var canvas = (this._canvas = root.querySelector('canvas'))
      this._nameEl = root.querySelector('.name b')
      this._fillEl = root.querySelector('.bar i')
      this._hint = root.querySelector('.hint')
      if (labels) {
        var dots = root.querySelector('.dots')
        SHAPES.forEach(function (s, i) {
          var b = document.createElement('button')
          b.type = 'button'
          b.title = s.label
          b.setAttribute('aria-label', s.label)
          b.addEventListener('click', function () {
            self._go(i)
          })
          dots.appendChild(b)
        })
        this._dotEls = dots.children
      }
      if (this.getAttribute('controls') !== 'false') root.querySelector('.joy').classList.add('on')

      // three.js
      var renderer = (this._renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }))
      renderer.setClearColor(0x000000, 0)
      var scene = (this._scene = new THREE.Scene())
      var camera = (this._camera = new THREE.PerspectiveCamera(38, 1, 0.05, 100))

      var geo = (this._geo = new THREE.BufferGeometry())
      var cur = (this._cur = new Float32Array(N * 3)),
        curCol = (this._curCol = new Float32Array(N * 3))
      var seed = new Float32Array(N)
      this._from = new Float32Array(N * 3)
      this._fromCol = new Float32Array(N * 3)
      this._target = new Float32Array(N * 3)
      this._delay = new Float32Array(N)
      this._phase = new Float32Array(N)
      for (var i = 0; i < N; i++) {
        seed[i] = rnd()
        this._delay[i] = rnd() * 0.9
        this._phase[i] = rnd() * TAU
        cur[i * 3] = (rnd() - 0.5) * 6
        cur[i * 3 + 1] = rnd() * 3
        cur[i * 3 + 2] = (rnd() - 0.5) * 6
        curCol[i * 3] = curCol[i * 3 + 1] = curCol[i * 3 + 2] = 0.25
      }
      geo.setAttribute('position', new THREE.BufferAttribute(cur, 3))
      geo.setAttribute('aColor', new THREE.BufferAttribute(curCol, 3))
      geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
      function mk(glow, size) {
        return new THREE.ShaderMaterial({
          vertexShader: VERT,
          fragmentShader: FRAG,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          uniforms: {
            uTime: { value: 0 },
            uScale: { value: 600 },
            uSize: { value: size },
            uGlow: { value: glow },
            uScan: { value: 0 },
            uMorph: { value: 0 },
            uMono: { value: 0 },
            uLight: { value: 0 },
          },
        })
      }
      this._matCore = mk(0, 0.011)
      this._matGlow = mk(1, 0.042)
      this._group = new THREE.Group()
      this._group.rotation.order = 'YXZ'
      var core = new THREE.Points(geo, this._matCore),
        glow = new THREE.Points(geo, this._matGlow)
      core.frustumCulled = glow.frustumCulled = false
      this._glowPts = glow
      this._group.add(glow)
      this._group.add(core)
      scene.add(this._group)

      // zamin: nuqtali to'r
      var fl = [],
        gx,
        gz
      for (gx = -20; gx <= 20; gx++) for (gz = -20; gz <= 20; gz++) fl.push(gx * 0.45, 0, gz * 0.45)
      var fgeo = new THREE.BufferGeometry()
      fgeo.setAttribute('position', new THREE.Float32BufferAttribute(fl, 3))
      this._floorMat = new THREE.ShaderMaterial({
        vertexShader: FVERT,
        fragmentShader: FFRAG,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uOrigin: { value: new THREE.Vector2() },
          uCenter: { value: new THREE.Vector2() },
          uRip: { value: 0 },
          uScale: { value: 600 },
          uFloorCol: { value: new THREE.Vector3(0.35, 0.72, 1.0) },
        },
      })
      this._floor = new THREE.Points(fgeo, this._floorMat)
      this._floor.frustumCulled = false
      scene.add(this._floor)

      this._applyTheme()

      // holat
      this._pos = new THREE.Vector3()
      this._yaw = 0
      this._speed = 0
      this._walk = 0
      this._camYaw = 0.3
      this._camPitch = 0.14
      this._camDist = 3.35
      this._idx = 0
      this._timer = 0
      this._morphT = 0
      this._time = 0
      this._keys = {}
      this._joy = { x: 0, y: 0 }
      this._active = false
      this._from.set(cur)
      this._fromCol.set(curCol)
      this._updateUI()

      this._bind()
      this._ro = new ResizeObserver(function () {
        self._resize()
      })
      this._ro.observe(this)
      this._resize()
      this._io = new IntersectionObserver(function (e) {
        self._visible = e[0].isIntersecting
        if (self._visible && !self._raf) {
          self._last = performance.now()
          self._raf = requestAnimationFrame(self._tickB)
        }
        if (!self._visible && self._raf) {
          cancelAnimationFrame(self._raf)
          self._raf = 0
        }
      })
      this._io.observe(this)
      this._tickB = function (now) {
        self._tick(now)
      }
      this._visible = true
      this._last = performance.now()
      this._raf = requestAnimationFrame(this._tickB)
    }

    _bind() {
      var self = this,
        canvas = this._canvas,
        root = this.shadowRoot
      this._onKeyDown = function (e) {
        if (!self._active) return
        var k = e.key.toLowerCase()
        if (e.code === 'Space') {
          e.preventDefault()
          self.next()
          self._hideHint()
          return
        }
        if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].indexOf(k) > -1) e.preventDefault()
        self._keys[k] = true
        self._hideHint()
      }
      this._onKeyUp = function (e) {
        self._keys[e.key.toLowerCase()] = false
      }
      window.addEventListener('keydown', this._onKeyDown)
      window.addEventListener('keyup', this._onKeyUp)
      this.addEventListener('pointerenter', function () {
        self._active = true
      })
      this.addEventListener('pointerleave', function () {
        if (document.activeElement !== self) {
          self._active = false
          self._keys = {}
        }
      })
      this.addEventListener('focus', function () {
        self._active = true
      })
      this.addEventListener('blur', function () {
        self._active = false
        self._keys = {}
      })

      var drag = null
      canvas.addEventListener('pointerdown', function (e) {
        drag = { x: e.clientX, y: e.clientY }
        canvas.setPointerCapture(e.pointerId)
        self._active = true
      })
      canvas.addEventListener('pointermove', function (e) {
        if (!drag) return
        self._camYaw -= (e.clientX - drag.x) * 0.006
        self._camPitch = clamp(self._camPitch + (e.clientY - drag.y) * 0.004, -0.1, 1.3)
        drag.x = e.clientX
        drag.y = e.clientY
      })
      canvas.addEventListener('pointerup', function () {
        drag = null
      })
      canvas.addEventListener('pointercancel', function () {
        drag = null
      })
      if (this.hasAttribute('zoom'))
        canvas.addEventListener(
          'wheel',
          function (e) {
            e.preventDefault()
            self._camDist = clamp(self._camDist + e.deltaY * 0.004, 1.8, 9)
          },
          { passive: false }
        )

      var joyEl = root.querySelector('.joy'),
        knob = joyEl.firstElementChild,
        jid = null
      function jm(e) {
        var r = joyEl.getBoundingClientRect(),
          dx = (e.clientX - r.left - r.width / 2) / (r.width / 2),
          dy = (e.clientY - r.top - r.height / 2) / (r.height / 2),
          m = Math.hypot(dx, dy)
        if (m > 1) {
          dx /= m
          dy /= m
        }
        self._joy.x = dx
        self._joy.y = -dy
        knob.style.transform = 'translate(' + dx * 30 + 'px,' + dy * 30 + 'px)'
      }
      joyEl.addEventListener('pointerdown', function (e) {
        jid = e.pointerId
        joyEl.setPointerCapture(jid)
        jm(e)
        self._active = true
      })
      joyEl.addEventListener('pointermove', function (e) {
        if (e.pointerId === jid) jm(e)
      })
      function je(e) {
        if (e.pointerId === jid) {
          jid = null
          self._joy.x = self._joy.y = 0
          knob.style.transform = ''
        }
      }
      joyEl.addEventListener('pointerup', je)
      joyEl.addEventListener('pointercancel', je)
    }

    _hideHint() {
      if (this._hint) this._hint.classList.add('off')
    }

    _go(i) {
      this._from.set(this._cur)
      this._fromCol.set(this._curCol)
      this._idx = i
      this._timer = 0
      this._morphT = 0
      this._updateUI()
      this.dispatchEvent(
        new CustomEvent('shapechange', {
          detail: { index: i, id: SHAPES[i].id, label: SHAPES[i].label },
        })
      )
    }
    _updateUI() {
      if (this._nameEl) this._nameEl.textContent = SHAPES[this._idx].label
      if (this._dotEls)
        for (var i = 0; i < this._dotEls.length; i++)
          this._dotEls[i].setAttribute('aria-current', i === this._idx ? 'true' : 'false')
    }

    _resize() {
      var w = this.clientWidth || 600,
        h = this.clientHeight || 400,
        dpr = Math.min(window.devicePixelRatio || 1, 2)
      this._renderer.setPixelRatio(dpr)
      this._renderer.setSize(w, h, false)
      this._camera.aspect = w / h
      this._camera.updateProjectionMatrix()
      var sc = (h * dpr) / (2 * Math.tan((this._camera.fov * Math.PI) / 360))
      this._matCore.uniforms.uScale.value = sc
      this._matGlow.uniforms.uScale.value = sc
      this._floorMat.uniforms.uScale.value = sc
      this._aspect = w / h
    }

    _tick(now) {
      this._raf = requestAnimationFrame(this._tickB)
      var dt = Math.min((now - this._last) / 1000 || 0.016, 0.05)
      this._last = now
      this._time += dt
      var t = this._time,
        N = this._N,
        K = this._keys,
        J = this._joy,
        i

      // kirish
      var ix = (K['d'] || K['arrowright'] ? 1 : 0) - (K['a'] || K['arrowleft'] ? 1 : 0) + J.x
      var iz = (K['w'] || K['arrowup'] ? 1 : 0) - (K['s'] || K['arrowdown'] ? 1 : 0) + J.y
      var il = Math.hypot(ix, iz)
      if (il > 1) {
        ix /= il
        iz /= il
        il = 1
      }
      var run = !!K['shift'] || J.x * J.x + J.y * J.y > 0.8
      this._speed += (il * (run ? 4.6 : 2.0) - this._speed) * Math.min(1, dt * 8)
      if (il > 0.05) {
        var cy = this._camYaw,
          fx = -Math.sin(cy),
          fz = -Math.cos(cy),
          rx = Math.cos(cy),
          rz = -Math.sin(cy)
        var mx = fx * iz + rx * ix,
          mz = fz * iz + rz * ix,
          ml = Math.hypot(mx, mz) || 1
        mx /= ml
        mz /= ml
        var dy = Math.atan2(mx, mz) - this._yaw
        dy = Math.atan2(Math.sin(dy), Math.cos(dy))
        this._yaw += dy * Math.min(1, dt * 10)
        this._pos.x += mx * this._speed * dt
        this._pos.z += mz * this._speed * dt
      }
      var move = clamp(this._speed / 2.0, 0, 1.4)
      this._walk += this._speed * dt * 3.4

      // shakl vaqti
      if (this._morphT < 4) this._morphT += dt
      this._timer += dt
      if (this._auto && this._timer >= this._interval) this.next()
      if (this._fillEl)
        this._fillEl.style.transform =
          'scaleX(' + (this._auto ? clamp(this._timer / this._interval, 0, 1) : 1) + ')'

      // nishon nuqtalar
      var sh = this._shapes[this._idx],
        target = this._target,
        human = sh.id === 'odam'
      if (human) {
        animateHuman(sh, target, N, t, move, run, this._walk)
      } else {
        if (sh.dyn) for (i = sh.dynStart; i < N; i++) sh.dyn(i, t)
        var a = sh.mode === 'sway' ? Math.sin(t * 0.6) * 0.55 : t * 0.5,
          c = Math.cos(a),
          s = Math.sin(a),
          sp = sh.pos
        for (i = 0; i < N; i++) {
          var j = i * 3,
            x = sp[j],
            z = sp[j + 2]
          target[j] = x * c + z * s
          target[j + 1] = sp[j + 1]
          target[j + 2] = -x * s + z * c
        }
      }
      var tc = sh.col,
        MORPH = 2.5,
        dur = MORPH - 0.9,
        mt = this._morphT
      var cur = this._cur,
        cc = this._curCol,
        fr = this._from,
        fc = this._fromCol,
        dl = this._delay,
        ph = this._phase
      for (i = 0; i < N; i++) {
        var q = i * 3,
          p = clamp((mt - dl[i]) / dur, 0, 1),
          e = p >= 1 ? 1 : ease(p)
        var arc = (1 - e) * e * 0.7 * Math.sin(ph[i]),
          jt = Math.sin(t * 2 + ph[i]) * 0.003
        cur[q] = fr[q] + (target[q] - fr[q]) * e + arc + jt
        cur[q + 1] = fr[q + 1] + (target[q + 1] - fr[q + 1]) * e + arc * 0.5 + jt
        cur[q + 2] = fr[q + 2] + (target[q + 2] - fr[q + 2]) * e - arc + jt
        cc[q] = fc[q] + (tc[q] - fc[q]) * e
        cc[q + 1] = fc[q + 1] + (tc[q + 1] - fc[q + 1]) * e
        cc[q + 2] = fc[q + 2] + (tc[q + 2] - fc[q + 2]) * e
      }
      this._geo.attributes.position.needsUpdate = true
      this._geo.attributes.aColor.needsUpdate = true

      var morphGlow = clamp(1 - Math.abs(mt - MORPH * 0.5) / (MORPH * 0.5), 0, 1)
      var u1 = this._matCore.uniforms,
        u2 = this._matGlow.uniforms,
        scan = ((t * 0.45) % 2.6) - 0.3
      u1.uTime.value = u2.uTime.value = t
      u1.uScan.value = u2.uScan.value = scan
      u1.uMorph.value = u2.uMorph.value = morphGlow

      // haykal holati
      var bob = human ? Math.abs(Math.sin(this._walk)) * 0.04 * move : Math.sin(t * 1.3) * 0.04
      this._group.position.set(this._pos.x, bob, this._pos.z)
      this._group.rotation.y = this._yaw
      this._group.rotation.x = human ? 0.05 * clamp(this._speed / 4.6, 0, 1) : 0
      var fu = this._floorMat.uniforms
      fu.uOrigin.value.set(
        Math.round(this._pos.x / 0.45) * 0.45,
        Math.round(this._pos.z / 0.45) * 0.45
      )
      fu.uCenter.value.set(this._pos.x, this._pos.z)
      fu.uRip.value = (t * 1.1) % 8

      // kamera
      var asp = this._aspect || 1,
        dist = this._camDist * (asp < 1 ? Math.pow(1 / asp, 0.7) : 1)
      var ty = 0.98,
        cp = Math.cos(this._camPitch)
      this._camera.position.set(
        this._pos.x + Math.sin(this._camYaw) * cp * dist,
        ty + Math.sin(this._camPitch) * dist,
        this._pos.z + Math.cos(this._camYaw) * cp * dist
      )
      this._camera.lookAt(this._pos.x, ty, this._pos.z)
      this._renderer.render(this._scene, this._camera)
    }

    _destroy() {
      if (this._raf) cancelAnimationFrame(this._raf)
      this._raf = 0
      if (this._ro) this._ro.disconnect()
      if (this._io) this._io.disconnect()
      if (this._onKeyDown) {
        window.removeEventListener('keydown', this._onKeyDown)
        window.removeEventListener('keyup', this._onKeyUp)
      }
      if (this._renderer) {
        this._renderer.dispose()
        this._renderer = null
      }
    }
  }

  MorphHuman._build = { SHAPES: SHAPES, getShapes: getShapes }
  if (typeof customElements !== 'undefined' && !customElements.get('morph-human'))
    customElements.define('morph-human', MorphHuman)
  if (typeof window !== 'undefined') window.MorphHuman = MorphHuman
})()
