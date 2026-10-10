/*!
 * <morph-human> v3 — oq-qora, fonsiz, REALISTIK zarrachali komponent
 * Telefon, noutbuk, miya, Yer (bulut, atmosfera, Oy),
 * raketa (olov, tutun) va dizayn mольберти (qalam, qog'oz) — hammasi real yoritish bilan.
 *
 * Ishlatish:
 *   <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
 *   <script src="morph-human.js"></script>
 *   <morph-human style="height:620px"></morph-human>
 *
 * Atributlar: interval="10"  auto="false"  labels="false"  controls="false"  zoom
 *             count="45000" (zarrachalar soni, ko'p = realistikroq)
 *             theme="mono-dark" (oq zarrachalar, standart) | "mono-light" (qora zarrachalar)
 *             floor (zamin nuqtalarini yoqish), controls="true" (W A S D bilan siljitish)
 *             Fon shaffof; rang uchun CSS: --mh-bg
 * Metodlar:   el.next()  el.prev()  el.goTo(i)       Hodisa: "shapechange"
 * Boshqaruv:  W A S D / strelkalar, Shift, Space, sichqoncha bilan aylantirish.
 */
;(function () {
  'use strict'
  var THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
  var TAU = Math.PI * 2,
    rnd = Math.random

  /* ================= Matematika ================= */
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
    var u = norm3(cross(d, ax))
    return [u, cross(d, u)]
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
  function H(h, s, l) {
    var o = [0, 0, 0]
    hsl(h, s, l, o, 0)
    return o
  }
  function hash3(x, y, z) {
    var h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453
    return h - Math.floor(h)
  }
  function vnoise(x, y, z) {
    var xi = Math.floor(x),
      yi = Math.floor(y),
      zi = Math.floor(z),
      xf = x - xi,
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

  /* ================= Primitivlar =================
     s(out) -> out[0..2]=pozitsiya, [3..5]=normal, [6]=rang parametri
     o.spec = yaltiroqlik, o.em = nur sochish (1 = yorqin, 2 = tungi chiroq, 3 = atmosfera) */
  function P(o, w, s) {
    return { w: w * (o.boost || 1), meta: o.meta, col: o.col, spec: o.spec, em: o.em, s: s }
  }

  function tube(a, b, r0, r1, o) {
    o = o || {}
    var d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]],
      len = Math.hypot(d[0], d[1], d[2]),
      dn = [d[0] / len, d[1] / len, d[2] / len]
    var uv = basis(dn),
      u = uv[0],
      v = uv[1],
      side = Math.PI * (r0 + r1) * len,
      cap = o.noCap ? 0 : 2 * Math.PI * (r0 * r0 + r1 * r1),
      rm = Math.max(r0, r1),
      kk = (r0 - r1) / len
    return P(o, side + cap, function (out) {
      var nx, ny, nz, l
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
        out[0] = a[0] + d[0] * t + nx * r
        out[1] = a[1] + d[1] * t + ny * r
        out[2] = a[2] + d[2] * t + nz * r
        nx += dn[0] * kk
        ny += dn[1] * kk
        nz += dn[2] * kk
        out[6] = t
      } else {
        var atB = rnd() * (r0 * r0 + r1 * r1) > r0 * r0,
          rr = atB ? r1 : r0,
          e = atB ? b : a,
          sg = atB ? 1 : -1,
          q = unit()
        if ((q[0] * dn[0] + q[1] * dn[1] + q[2] * dn[2]) * sg < 0) q = [-q[0], -q[1], -q[2]]
        nx = q[0]
        ny = q[1]
        nz = q[2]
        out[0] = e[0] + nx * rr
        out[1] = e[1] + ny * rr
        out[2] = e[2] + nz * rr
        out[6] = atB ? 1 : 0
      }
      l = Math.hypot(nx, ny, nz) || 1
      out[3] = nx / l
      out[4] = ny / l
      out[5] = nz / l
    })
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
    return P(o, area, function (out) {
      var q = unit(),
        n = norm3([q[0] / r[0], q[1] / r[1], q[2] / r[2]])
      out[0] = c[0] + q[0] * r[0]
      out[1] = c[1] + q[1] * r[1]
      out[2] = c[2] + q[2] * r[2]
      out[3] = n[0]
      out[4] = n[1]
      out[5] = n[2]
      out[6] = q[1] * 0.5 + 0.5
    })
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
    return P(o, tot, function (out) {
      var q = rnd() * tot,
        k = 0
      while (k < segs.length - 1 && q > segs[k]) {
        q -= segs[k]
        k++
      }
      var a = sec[k],
        b = sec[k + 1],
        t = rnd(),
        dy = b[0] - a[0] || 1e-4
      var rx = Math.max(a[1] + (b[1] - a[1]) * t, 1e-3),
        rz = Math.max(a[2] + (b[2] - a[2]) * t, 1e-3),
        cz = (a[3] || 0) + ((b[3] || 0) - (a[3] || 0)) * t
      var th = rnd() * TAU,
        c = Math.cos(th),
        s = Math.sin(th),
        rxp = (b[1] - a[1]) / dy,
        rzp = (b[2] - a[2]) / dy
      var n = norm3([c / rx, -((c * c * rxp) / rx + (s * s * rzp) / rz), s / rz])
      out[0] = rx * c
      out[1] = a[0] + (b[0] - a[0]) * t
      out[2] = cz + rz * s
      out[3] = n[0]
      out[4] = n[1]
      out[5] = n[2]
      out[6] = out[1]
    })
  }
  function tri(A, B, C, th, o) {
    o = o || {}
    var e1 = [B[0] - A[0], B[1] - A[1], B[2] - A[2]],
      e2 = [C[0] - A[0], C[1] - A[1], C[2] - A[2]]
    var cr = cross(e1, e2),
      area = Math.hypot(cr[0], cr[1], cr[2]),
      n = norm3(cr)
    return P(o, area, function (out) {
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
    })
  }
  function disc(c, R, o) {
    o = o || {}
    return P(o, Math.PI * R * R, function (out) {
      var r = R * Math.sqrt(rnd()),
        th = rnd() * TAU
      out[0] = c[0] + r * Math.cos(th)
      out[1] = c[1] + r * Math.sin(th)
      out[2] = c[2]
      out[3] = 0
      out[4] = 0
      out[5] = 1
      out[6] = r / R
    })
  }
  function ringY(y, R, r, o) {
    o = o || {}
    return P(o, 4 * Math.PI * Math.PI * R * r, function (out) {
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
    })
  }
  function cub(c, h, o) {
    // h = [hx,hy,hz]
    o = o || {}
    var wx = 4 * h[1] * h[2],
      wy = 4 * h[0] * h[2],
      wz = 4 * h[0] * h[1],
      tt = wx + wy + wz
    return P(o, 2 * tt, function (out) {
      var r = rnd() * tt,
        ax = r < wx ? 0 : r < wx + wy ? 1 : 2,
        sg = rnd() < 0.5 ? -1 : 1,
        p = [(rnd() * 2 - 1) * h[0], (rnd() * 2 - 1) * h[1], (rnd() * 2 - 1) * h[2]]
      p[ax] = sg * h[ax]
      out[0] = c[0] + p[0]
      out[1] = c[1] + p[1]
      out[2] = c[2] + p[2]
      out[3] = ax === 0 ? sg : 0
      out[4] = ax === 1 ? sg : 0
      out[5] = ax === 2 ? sg : 0
      out[6] = (p[0] / h[0] + 1) / 2
    })
  }
  function line(a, b, lw, o) {
    o = o || {}
    var len = dist(a, b)
    return P(o, len * lw, function (out) {
      var t = rnd(),
        j = o.jit == null ? 0.004 : o.jit,
        n = o.nrm || unit()
      out[0] = a[0] + (b[0] - a[0]) * t + (rnd() - 0.5) * j
      out[1] = a[1] + (b[1] - a[1]) * t + (rnd() - 0.5) * j
      out[2] = a[2] + (b[2] - a[2]) * t + (rnd() - 0.5) * j
      out[3] = n[0]
      out[4] = n[1]
      out[5] = n[2]
      out[6] = t
    })
  }
  function curve(fn, steps, r, o) {
    o = o || {}
    var Pt = [],
      L = [0],
      i
    for (i = 0; i <= steps; i++) Pt.push(fn(i / steps))
    for (i = 1; i <= steps; i++) L[i] = L[i - 1] + dist(Pt[i], Pt[i - 1])
    var len = L[steps]
    return P(o, TAU * r * len, function (out) {
      var u = rnd() * len,
        k = 1
      while (k < steps && L[k] < u) k++
      var a = Pt[k - 1],
        b = Pt[k],
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
    })
  }
  function hex(a, b, r, o) {
    // oltiburchakli prizma (qalam tanasi)
    o = o || {}
    var d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]],
      len = Math.hypot(d[0], d[1], d[2]),
      uv = basis(norm3(d)),
      U = uv[0],
      V = uv[1],
      ap = r * 0.8660254
    return P(o, 6 * r * len, function (out) {
      var k = Math.floor(rnd() * 6),
        th = (k * Math.PI) / 3 + Math.PI / 6,
        c = Math.cos(th),
        s = Math.sin(th),
        u = rnd(),
        w = (rnd() - 0.5) * r
      var rx = c * U[0] + s * V[0],
        ry = c * U[1] + s * V[1],
        rz = c * U[2] + s * V[2],
        tx = -s * U[0] + c * V[0],
        ty = -s * U[1] + c * V[1],
        tz = -s * U[2] + c * V[2]
      out[0] = a[0] + d[0] * u + rx * ap + tx * w
      out[1] = a[1] + d[1] * u + ry * ap + ty * w
      out[2] = a[2] + d[2] * u + rz * ap + tz * w
      out[3] = rx
      out[4] = ry
      out[5] = rz
      out[6] = u + k
    })
  }
  function rotX(p, pv, ang) {
    // primitivni X o'qi atrofida aylantirish
    var c = Math.cos(ang),
      s = Math.sin(ang),
      f = p.s
    return {
      w: p.w,
      meta: p.meta,
      col: p.col,
      spec: p.spec,
      em: p.em,
      s: function (out) {
        f(out)
        var y = out[1] - pv[1],
          z = out[2] - pv[2]
        out[1] = pv[1] + y * c - z * s
        out[2] = pv[2] + y * s + z * c
        var ny = out[4],
          nz = out[5]
        out[4] = ny * c - nz * s
        out[5] = ny * s + nz * c
      },
    }
  }

  function buildShape(prims, N, dynStart, onMeta) {
    var pos = new Float32Array(N * 3),
      col = new Float32Array(N * 3),
      nrm = new Float32Array(N * 3),
      mat = new Float32Array(N * 2)
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
      var i3 = i * 3
      pos[i3] = out[0]
      pos[i3 + 1] = out[1]
      pos[i3 + 2] = out[2]
      nrm[i3] = out[3]
      nrm[i3 + 1] = out[4]
      nrm[i3 + 2] = out[5]
      var c = p.col ? p.col(out[0], out[1], out[2], out[6]) : [0.6, 0.6, 0.6]
      col[i3] = c[0]
      col[i3 + 1] = c[1]
      col[i3 + 2] = c[2]
      mat[i * 2] = p.spec == null ? 0.15 : p.spec
      mat[i * 2 + 1] = p.em || 0
      if (onMeta && p.meta) onMeta(i, p.meta)
    }
    for (i = dynStart; i < N; i++) {
      nrm[i * 3 + 1] = 1
      col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = 0.5
    }
    return {
      pos: pos,
      col: col,
      nrm: nrm,
      mat: mat,
      dynStart: dynStart,
      dyn: null,
      mode: 'spin',
      sz: clamp(1.55 * Math.sqrt(tot / Math.max(1, dynStart)), 0.007, 0.03),
    }
  }

  /* ================= 1. TELEFON — titan korpus, shisha ekran, ilovalar, orqada kamera bloki ================= */
  function buildPhone(N) {
    var prims = [],
      r,
      c,
      X = 0.36,
      Y0 = 0.2,
      Y1 = 1.7,
      CY = 0.95,
      ZF = 0.0375
    var TI = function (x, y, z) {
      var v = 1 + (vnoise(x * 110, y * 110, z * 110) - 0.5) * 0.07
      return [0.55 * v, 0.56 * v, 0.6 * v]
    }
    var GL = function () {
      return [0.012, 0.014, 0.03]
    }
    prims.push(cub([0, CY, 0], [X, 0.75, 0.037], { col: TI, spec: 0.6, boost: 1.1 })) // korpus
    ;[-X, X].forEach(function (x) {
      prims.push(tube([x, Y0, 0], [x, Y1, 0], 0.037, 0.037, { col: TI, spec: 0.7, boost: 1.4 }))
    })
    ;[Y0, Y1].forEach(function (y) {
      prims.push(tube([-X, y, 0], [X, y, 0], 0.037, 0.037, { col: TI, spec: 0.7, boost: 1.4 }))
    })
    prims.push(cub([0, CY, ZF + 0.001], [0.335, 0.72, 0.0012], { col: GL, spec: 0.9, boost: 3 })) // ekran shishasi
    prims.push(
      ell([0, 1.64, ZF + 0.002], [0.05, 0.018, 0.004], {
        col: function () {
          return [0, 0, 0]
        },
        spec: 1,
        boost: 4,
      })
    ) // Dynamic Island
    var pal = [
      [1, 0.35, 0.4],
      [0.3, 0.8, 1],
      [0.5, 0.95, 0.5],
      [1, 0.8, 0.25],
      [0.8, 0.5, 1],
      [1, 1, 1],
    ]
    function icon(x, y, col, h) {
      prims.push(
        cub([x, y, ZF + 0.003], [h, h, 0.0015], {
          col: function () {
            return col
          },
          em: 1,
          boost: 3,
        })
      )
    }
    for (r = 0; r < 5; r++)
      for (c = 0; c < 4; c++)
        icon((c - 1.5) * 0.15, 1.25 - r * 0.16, pal[(r * 4 + c) % pal.length], 0.05)
    for (c = 0; c < 4; c++) icon((c - 1.5) * 0.15, 0.31, pal[(c + 2) % pal.length], 0.05) // dok
    prims.push(
      line([-0.12, 1.5, ZF + 0.003], [0.12, 1.5, ZF + 0.003], 0.05, {
        col: function () {
          return [1, 1, 1]
        },
        em: 1,
        jit: 0.002,
        nrm: [0, 0, 1],
        boost: 3,
      })
    ) // soat
    prims.push(
      line([-0.08, 1.44, ZF + 0.003], [0.08, 1.44, ZF + 0.003], 0.02, {
        col: function () {
          return [0.7, 0.75, 0.85]
        },
        em: 1,
        jit: 0.002,
        nrm: [0, 0, 1],
        boost: 3,
      })
    )
    // Orqa tomon: kamera bloki
    prims.push(
      cub([-0.17, 1.47, -0.047], [0.15, 0.15, 0.011], {
        col: function () {
          return [0.3, 0.31, 0.34]
        },
        spec: 0.8,
        boost: 1.4,
      })
    )
    ;[
      [-0.24, 1.54],
      [-0.24, 1.4],
      [-0.1, 1.47],
    ].forEach(function (p) {
      prims.push(
        ell([p[0], p[1], -0.062], [0.055, 0.055, 0.008], {
          col: function () {
            return [0.7, 0.72, 0.76]
          },
          spec: 0.9,
          boost: 2,
        })
      )
      prims.push(ell([p[0], p[1], -0.067], [0.04, 0.04, 0.01], { col: GL, spec: 1, boost: 3 }))
    })
    prims.push(
      ell([-0.1, 1.56, -0.06], [0.015, 0.015, 0.006], {
        col: function () {
          return [1, 0.95, 0.8]
        },
        em: 1,
        boost: 4,
      })
    ) // chaqmoq
    prims.push(
      disc([0, 0.95, -0.0375], 0.06, {
        col: function () {
          return [0.8, 0.8, 0.84]
        },
        spec: 0.7,
        boost: 2,
      })
    ) // logotip dog'i
    var sh = buildShape(prims, N, N)
    sh.spin = 0.45
    return sh
  }

  /* ================= 2. KOD — noutbuk + ekranda kod + gologramma ================= */
  function buildCode(N) {
    var prims = [],
      PV = [0, 0.052, -0.33],
      TILT = -0.28,
      i,
      r,
      c
    var ALU = [0.72, 0.74, 0.78],
      KEY = [0.04, 0.045, 0.055]
    var alu = function (x, y, z) {
      var v = 1 + (vnoise(x * 120, y * 120, z * 120) - 0.5) * 0.08
      return [ALU[0] * v, ALU[1] * v, ALU[2] * v]
    }
    prims.push(cub([0, 0.03, 0.05], [0.55, 0.022, 0.38], { col: alu, spec: 0.55, boost: 1.2 })) // asos
    prims.push(
      cub([0, 0.0535, 0.285], [0.15, 0.0008, 0.1], {
        col: function () {
          return [0.6, 0.62, 0.66]
        },
        spec: 0.6,
        boost: 2,
      })
    ) // trekped
    for (r = 0; r < 5; r++)
      for (c = 0; c < 14; c++)
        prims.push(
          cub([(c - 6.5) * 0.066, 0.058, -0.25 + r * 0.066], [0.0245, 0.006, 0.0245], {
            col: function () {
              return KEY
            },
            spec: 0.5,
            boost: 1.6,
          })
        )
    prims.push(
      cub([0, 0.058, 0.08], [0.2, 0.006, 0.0245], {
        col: function () {
          return KEY
        },
        spec: 0.5,
        boost: 1.6,
      })
    )
    prims.push(
      tube([-0.4, 0.058, -0.335], [0.4, 0.058, -0.335], 0.014, 0.014, {
        col: function () {
          return [0.15, 0.15, 0.17]
        },
        spec: 0.5,
      })
    )
    prims.push(
      rotX(
        cub([0, 0.392, -0.33], [0.55, 0.34, 0.009], { col: alu, spec: 0.55, boost: 1.4 }),
        PV,
        TILT
      )
    ) // qopqoq
    prims.push(
      rotX(
        cub([0, 0.415, -0.3205], [0.51, 0.31, 0.0012], {
          col: function () {
            return [0.015, 0.02, 0.04]
          },
          spec: 0.7,
          boost: 2.5,
        }),
        PV,
        TILT
      )
    ) // ekran
    var KW = [1, 0.38, 0.62],
      FN = [0.42, 0.72, 1],
      ST = [0.62, 0.92, 0.48],
      NM = [1, 0.72, 0.3],
      CM = [0.45, 0.52, 0.65],
      TX = [0.9, 0.92, 1]
    var pal = [KW, FN, ST, NM, TX, TX, FN, CM],
      ind = [0, 0, 1, 1, 2, 2, 2, 1, 1, 0, 0, 1, 2, 2, 1, 0]
    function codeRow(y, x0, segs) {
      var tot = 0,
        st = []
      segs.forEach(function (s) {
        st.push(x0 + tot)
        tot += s[0]
      })
      return {
        w: tot * 0.03,
        em: 1,
        col: function (x, yy, z, k) {
          return segs[k][1]
        },
        s: function (out) {
          var q = rnd() * tot,
            k = 0,
            acc = 0
          while (k < segs.length - 1 && q > acc + segs[k][0]) {
            acc += segs[k][0]
            k++
          }
          out[0] = st[k] + rnd() * (segs[k][0] - 0.012)
          out[1] = y + (rnd() - 0.5) * 0.009
          out[2] = -0.318
          out[3] = 0
          out[4] = 0
          out[5] = 1
          out[6] = k
        },
      }
    }
    for (r = 0; r < 16; r++) {
      var segs = [],
        n = 2 + Math.floor(rnd() * 4)
      for (i = 0; i < n; i++) segs.push([0.05 + rnd() * 0.12, pal[Math.floor(rnd() * pal.length)]])
      prims.push(rotX(codeRow(0.665 - r * 0.034, -0.46 + ind[r] * 0.07, segs), PV, TILT))
    }
    // Havodagi neon </> gologrammasi
    var s = 0.22
    function Q(x, y) {
      return [x * s, 1.2 + (y - 0.95) * s, -0.25]
    }
    var o1 = function (cc) {
      return {
        col: function () {
          return cc
        },
        em: 1,
        boost: 1.6,
      }
    }
    prims.push(
      tube(Q(-0.46, 1.5), Q(-0.98, 0.95), 0.014, 0.014, o1(H(0.5, 0.9, 0.58))),
      tube(Q(-0.98, 0.95), Q(-0.46, 0.4), 0.014, 0.014, o1(H(0.5, 0.9, 0.58)))
    )
    prims.push(tube(Q(-0.12, 0.25), Q(0.14, 1.65), 0.014, 0.014, o1(H(0.92, 0.85, 0.62))))
    prims.push(
      tube(Q(0.46, 1.5), Q(0.98, 0.95), 0.014, 0.014, o1(H(0.76, 0.85, 0.6))),
      tube(Q(0.98, 0.95), Q(0.46, 0.4), 0.014, 0.014, o1(H(0.76, 0.85, 0.6)))
    )
    var dc = Math.round(N * 0.05),
      ds = N - dc,
      sx = [],
      sp = [],
      so = [],
      cc2 = []
    for (i = 0; i < dc; i++) {
      sx.push((rnd() * 2 - 1) * 0.42)
      sp.push(0.1 + rnd() * 0.2)
      so.push(rnd())
      cc2.push(rnd())
    }
    var sh = buildShape(prims, N, ds)
    sh.mode = 'sway'
    sh.dyn = function (i, t) {
      var k = i - ds,
        u = fract(t * sp[k] + so[k]),
        j = i * 3,
        lum = Math.sin(u * Math.PI)
      sh.pos[j] = sx[k]
      sh.pos[j + 1] = 0.72 + u * 0.7
      sh.pos[j + 2] = -0.29 + Math.sin(u * 6 + k) * 0.03
      var cl = H(0.5 + cc2[k] * 0.35, 0.8, 0.55 + 0.2 * lum)
      sh.col[j] = cl[0] * lum
      sh.col[j + 1] = cl[1] * lum
      sh.col[j + 2] = cl[2] * lum
      sh.nrm[j] = 0
      sh.nrm[j + 1] = 0
      sh.nrm[j + 2] = 1
      sh.mat[i * 2] = 0
      sh.mat[i * 2 + 1] = 1
    }
    return sh
  }

  /* ================= 3. MIYA — burmalar, egat-ariqlar, miya po'stlog'i, nerv impulslari ================= */
  function brainField(u, sd) {
    var x = u[0],
      y = u[1],
      z = u[2]
    if (y < -0.3) y = -0.3 + (y + 0.3) * 0.45
    var n1 = vnoise(x * 4.2 + sd * 3.7, y * 4.2 + 1.3, z * 4.2 + 8.1),
      n2 = vnoise(x * 9.3 + sd * 1.1, y * 9.3, z * 9.3 + 3.3)
    var g =
      Math.exp(-Math.pow((2 * n1 - 1) / 0.16, 2)) * 0.7 +
      Math.exp(-Math.pow((2 * n2 - 1) / 0.18, 2)) * 0.3 // tor ariqlar
    var f = 1 - 0.1 * g + 0.04 * (n1 - 0.5)
    var px = sd * 0.2 + x * 0.42 * f,
      cl = false
    if (px * sd < 0.02) {
      px = sd * 0.02
      cl = true
    }
    return [px, 1.2 + y * 0.47 * f, z * 0.66 * f, g, cl]
  }
  function buildBrain(N) {
    var prims = [],
      i
    function hemi(sd) {
      return {
        w: 2.4,
        spec: 0.38,
        col: function (x, y, z, g) {
          var m = clamp(g * 1.3, 0, 1),
            v = 1 + (vnoise(x * 18, y * 18, z * 18) - 0.5) * 0.08
          return [(0.88 - 0.42 * m) * v, (0.6 - 0.34 * m) * v, (0.6 - 0.32 * m) * v]
        },
        s: function (out) {
          var u = unit(),
            p0 = brainField(u, sd),
            b = basis(u),
            e = 0.012
          var p1 = brainField(
            norm3([u[0] + b[0][0] * e, u[1] + b[0][1] * e, u[2] + b[0][2] * e]),
            sd
          )
          var p2 = brainField(
            norm3([u[0] + b[1][0] * e, u[1] + b[1][1] * e, u[2] + b[1][2] * e]),
            sd
          )
          var n = cross(
              [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]],
              [p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]]
            ),
            l = Math.hypot(n[0], n[1], n[2])
          if (l < 1e-9 || p0[4]) n = [-sd, 0, 0]
          else {
            n = [n[0] / l, n[1] / l, n[2] / l]
            if (n[0] * (p0[0] - sd * 0.2) + n[1] * (p0[1] - 1.2) + n[2] * p0[2] < 0)
              n = [-n[0], -n[1], -n[2]]
          }
          out[0] = p0[0]
          out[1] = p0[1]
          out[2] = p0[2]
          out[3] = n[0]
          out[4] = n[1]
          out[5] = n[2]
          out[6] = p0[3]
        },
      }
    }
    prims.push(hemi(-1), hemi(1))
    prims.push({
      w: 0.4,
      spec: 0.2, // miyacha
      col: function (x, y) {
        var b = 0.5 + 0.5 * Math.sin(y * 140)
        return [0.62 - 0.12 * b, 0.44 - 0.1 * b, 0.42 - 0.1 * b]
      },
      s: function (out) {
        var q = unit(),
          n = norm3([q[0] / 0.26, q[1] / 0.14, q[2] / 0.2]),
          y = 0.86 + q[1] * 0.14,
          rr = 1 + 0.03 * Math.sin(y * 110)
        out[0] = q[0] * 0.26 * rr
        out[1] = y
        out[2] = -0.4 + q[2] * 0.2 * rr
        out[3] = n[0]
        out[4] = n[1]
        out[5] = n[2]
        out[6] = 0
      },
    })
    prims.push(
      tube([0, 0.93, -0.15], [0, 0.55, -0.28], 0.065, 0.045, {
        col: function () {
          return [0.82, 0.74, 0.66]
        },
        spec: 0.25,
        boost: 1.5,
      })
    )
    // Yuzadagi nerv impulslari
    var paths = [],
      k,
      m
    for (k = 0; k < 40; k++) {
      var sd = rnd() < 0.5 ? -1 : 1,
        u0 = unit(),
        u1 = norm3([
          u0[0] + 0.9 * (rnd() - 0.5) * 2,
          u0[1] + 0.9 * (rnd() - 0.5) * 2,
          u0[2] + 0.9 * (rnd() - 0.5) * 2,
        ])
      var om = Math.acos(clamp(u0[0] * u1[0] + u0[1] * u1[1] + u0[2] * u1[2], -0.99, 0.99)),
        so = Math.sin(om),
        arr = new Float32Array(33 * 3)
      for (m = 0; m < 33; m++) {
        var t = m / 32,
          k1 = Math.sin((1 - t) * om) / so,
          k2 = Math.sin(t * om) / so,
          p = brainField(
            norm3([u0[0] * k1 + u1[0] * k2, u0[1] * k1 + u1[1] * k2, u0[2] * k1 + u1[2] * k2]),
            sd
          )
        arr[m * 3] = p[0] + (p[0] - sd * 0.2) * 0.035
        arr[m * 3 + 1] = p[1] + (p[1] - 1.2) * 0.035
        arr[m * 3 + 2] = p[2] + p[2] * 0.035
      }
      paths.push(arr)
    }
    var dc = Math.round(N * 0.06),
      dst = N - dc,
      pi = [],
      sp = [],
      so2 = []
    for (i = 0; i < dc; i++) {
      pi.push(Math.floor(rnd() * paths.length))
      sp.push(0.25 + rnd() * 0.5)
      so2.push(rnd())
    }
    var sh = buildShape(prims, N, dst)
    sh.spin = 0.35
    sh.dyn = function (i, t) {
      var k = i - dst,
        u = fract(t * sp[k] + so2[k]),
        f = u * 31.999,
        m = Math.floor(f),
        w = f - m,
        a = paths[pi[k]],
        j = i * 3,
        lum = Math.sin(u * Math.PI)
      sh.pos[j] = a[m * 3] + (a[m * 3 + 3] - a[m * 3]) * w
      sh.pos[j + 1] = a[m * 3 + 1] + (a[m * 3 + 4] - a[m * 3 + 1]) * w
      sh.pos[j + 2] = a[m * 3 + 2] + (a[m * 3 + 5] - a[m * 3 + 2]) * w
      sh.col[j] = (0.3 + 0.7 * lum) * lum
      sh.col[j + 1] = (0.2 + 0.8 * lum) * lum
      sh.col[j + 2] = lum
      sh.mat[i * 2] = 0
      sh.mat[i * 2 + 1] = 1
    }
    return sh
  }

  /* ================= 4. DUNYO — okean, qit'alar, muz, bulutlar, atmosfera, tungi shahar chiroqlari, Oy ================= */
  function buildGlobe(N) {
    var R = 0.55,
      TL = 0.41,
      CY = 1.0,
      i,
      prims = []
    function ter(x, y, z) {
      return fbm(x * 1.5 + 3.1, y * 1.5 + 1.7, z * 1.5 + 0.4)
    }
    var A = 4 * Math.PI * R * R
    function surf(wantLand) {
      return {
        w: A * (wantLand ? 0.36 : 0.64),
        spec: wantLand ? 0.05 : 0.7,
        col: function (x, y, z, h) {
          var lat = Math.abs(y / R),
            v = 0.94 + (vnoise(x * 50, y * 50, z * 50) - 0.5) * 0.1
          if (lat > 0.9) return [0.93 * v, 0.95 * v, 0.98 * v] // muz
          if (h > 0.53) {
            var e = clamp((h - 0.53) / 0.22, 0, 1),
              dry =
                clamp(1 - Math.abs(lat - 0.3) * 4, 0, 1) *
                clamp((fbm(x * 6, y * 6, z * 6) - 0.35) * 4, 0, 1)
            var c = [0.16 + 0.5 * dry, 0.4 + 0.16 * dry, 0.14 + 0.2 * dry] // o'rmon -> cho'l
            if (e > 0.45) {
              var m = (e - 0.45) / 0.4
              c = [c[0] + (0.45 - c[0]) * m, c[1] + (0.4 - c[1]) * m, c[2] + (0.34 - c[2]) * m]
            }
            if (e > 0.85) c = [0.95, 0.95, 0.97]
            return [c[0] * v, c[1] * v, c[2] * v]
          }
          var d = clamp((0.53 - h) / 0.2, 0, 1) // okean chuqurligi
          return [(0.06 - 0.05 * d) * v, (0.32 - 0.25 * d) * v, (0.5 - 0.25 * d) * v]
        },
        s: function (out) {
          var u, h, ok
          do {
            u = unit()
            h = ter(u[0], u[1], u[2])
            var land = h > 0.53 || Math.abs(u[1]) > 0.9
            ok = wantLand ? land : !land
          } while (!ok)
          out[0] = u[0] * R
          out[1] = u[1] * R
          out[2] = u[2] * R
          out[3] = u[0]
          out[4] = u[1]
          out[5] = u[2]
          out[6] = h
        },
      }
    }
    prims.push(surf(true), surf(false))
    prims.push({
      w: A * 0.55 * 1.05,
      spec: 0.04,
      col: function (x, y, z, t) {
        var v = 0.88 + 0.12 * t
        return [v, v, v + 0.02]
      }, // bulutlar
      s: function (out) {
        var u, c
        do {
          u = unit()
          c = fbm(u[0] * 2.6 + 9.2, u[1] * 3.2 + 4.4, u[2] * 2.6 + 1.3)
        } while (c < 0.54)
        var rr = R * (1.022 + 0.03 * (c - 0.54) * 3)
        out[0] = u[0] * rr
        out[1] = u[1] * rr
        out[2] = u[2] * rr
        out[3] = u[0]
        out[4] = u[1]
        out[5] = u[2]
        out[6] = clamp((c - 0.54) * 4, 0, 1)
      },
    })
    prims.push({
      w: A * 0.14,
      em: 3,
      col: function () {
        return [0.32, 0.58, 1.0]
      }, // atmosfera
      s: function (out) {
        var u = unit(),
          rr = R * 1.09
        out[0] = u[0] * rr
        out[1] = u[1] * rr
        out[2] = u[2] * rr
        out[3] = u[0]
        out[4] = u[1]
        out[5] = u[2]
        out[6] = 0
      },
    })
    prims.push({
      w: A * 0.03,
      em: 2,
      col: function () {
        return [1, 0.78, 0.42]
      }, // tungi shahar chiroqlari
      s: function (out) {
        var u, h
        do {
          u = unit()
          h = ter(u[0], u[1], u[2])
        } while (
          h < 0.56 ||
          h > 0.7 ||
          fbm(u[0] * 9 + 2, u[1] * 9, u[2] * 9) < 0.56 ||
          Math.abs(u[1]) > 0.8
        )
        out[0] = u[0] * R * 1.004
        out[1] = u[1] * R * 1.004
        out[2] = u[2] * R * 1.004
        out[3] = u[0]
        out[4] = u[1]
        out[5] = u[2]
        out[6] = 0
      },
    })
    // Oy (dinamik): orbitada, Yer aylanishini inobatga olib joylashtiriladi
    var dm = Math.round(N * 0.06),
      dst = N - dm,
      mu = [],
      mcol = [],
      RM = 0.075,
      ORB = 0.95
    var ct = Math.cos(TL),
      st = Math.sin(TL),
      cT = -1,
      mc = [0, 0, 0]
    for (i = 0; i < dm; i++) {
      var q = unit(),
        cr = fbm(q[0] * 9, q[1] * 9, q[2] * 9),
        v = (0.55 + 0.35 * fbm(q[0] * 5, q[1] * 5, q[2] * 5)) * (cr > 0.62 ? 0.7 : 1)
      mu.push(q)
      mcol.push(v)
    }
    var sh = buildShape(prims, N, dst)
    for (i = 0; i < dm; i++) {
      var j0 = (dst + i) * 3
      sh.col[j0] = mcol[i]
      sh.col[j0 + 1] = mcol[i] * 0.98
      sh.col[j0 + 2] = mcol[i] * 0.94
      sh.mat[(dst + i) * 2] = 0.04
    }
    sh.tilt = TL
    sh.cy = CY
    sh.spin = 0.22
    function inv(x, y, z, a, out, o) {
      var xl = x * ct + y * st,
        yl = -x * st + y * ct,
        ca = Math.cos(a),
        sa = Math.sin(a)
      out[o] = xl * ca - z * sa
      out[o + 1] = yl
      out[o + 2] = xl * sa + z * ca
    }
    sh.dyn = function (i, t) {
      var k = i - dst,
        j = i * 3,
        a = sh.curA,
        o = mu[k]
      if (cT !== t) {
        cT = t
        var om = t * 0.16 + 1
        mc[0] = Math.cos(om) * ORB
        mc[1] = Math.sin(om) * ORB * 0.09
        mc[2] = Math.sin(om) * ORB
      }
      inv(mc[0] + o[0] * RM, mc[1] + o[1] * RM, mc[2] + o[2] * RM, a, sh.pos, j)
      inv(o[0], o[1], o[2], a, sh.nrm, j)
    }
    return sh
  }

  /* ================= 5. RAKETA — oq korpus, panel chiziqlari, to'r qanotlar, oyoqlar, jonli olov va tutun ================= */
  function buildRocket(N) {
    var prims = [],
      i,
      k,
      R = 0.105
    function bodyCol(x, y, z) {
      if (y > 1.5 && y < 1.6) return [0.04, 0.04, 0.045] // qora oraliq bo'lim
      if (Math.abs(fract(y / 0.19) - 0.5) > 0.45) return [0.5, 0.51, 0.53] // payvand chiziqlari
      var soot = y < 1.0 ? clamp((1.0 - y) / 0.25, 0, 1) * 0.7 : 0,
        v = 0.92 - soot * 0.8 + (vnoise(x * 40, y * 40, z * 40) - 0.5) * 0.05
      return [v, v, v + 0.01]
    }
    var sec = [
      [0.76, R, R],
      [1.84, R * 0.99, R * 0.99],
    ]
    for (i = 1; i <= 14; i++) {
      var u = i / 14
      sec.push([
        1.84 + u * 0.4,
        R * 0.99 * Math.pow(Math.max(1 - Math.pow(u, 2.2), 0), 0.7),
        R * 0.99 * Math.pow(Math.max(1 - Math.pow(u, 2.2), 0), 0.7),
      ])
    }
    prims.push(loft(sec, { col: bodyCol, spec: 0.35, boost: 1.3 }))
    var DK = function () {
      return [0.1, 0.1, 0.12]
    }
    prims.push(
      tube([0, 0.76, 0], [0, 0.7, 0], R * 0.92, R * 0.92, { noCap: true, col: DK, spec: 0.5 })
    )
    prims.push(ringY(0.76, R, 0.006, { col: DK, spec: 0.4 }))
    for (k = 0; k < 3; k++) {
      // dvigatel soplolari
      var a = (k * TAU) / 3,
        nx = 0.055 * Math.cos(a),
        nz = 0.055 * Math.sin(a)
      prims.push(
        tube([nx, 0.74, nz], [nx, 0.66, nz], 0.022, 0.044, {
          noCap: true,
          col: function () {
            return [0.48, 0.3, 0.2]
          },
          spec: 0.7,
          boost: 2,
        })
      )
    }
    for (k = 0; k < 4; k++) {
      // to'rsimon boshqaruv qanotlari
      var an = (k * Math.PI) / 2,
        ca = Math.cos(an),
        sa = Math.sin(an),
        cx = (R + 0.03) * ca,
        cz = (R + 0.03) * sa
      prims.push(
        cub([cx, 1.46, cz], k % 2 === 0 ? [0.03, 0.034, 0.004] : [0.004, 0.034, 0.03], {
          col: function () {
            return [0.2, 0.2, 0.22]
          },
          spec: 0.5,
          boost: 2,
        })
      )
    }
    for (k = 0; k < 4; k++) {
      // qo'nish oyoqlari
      var an2 = (k * Math.PI) / 2 + Math.PI / 4,
        c2 = Math.cos(an2),
        s2 = Math.sin(an2)
      prims.push(
        tube([R * c2, 1.2, R * s2], [(R + 0.2) * c2, 0.62, (R + 0.2) * s2], 0.012, 0.008, {
          col: function () {
            return [0.1, 0.1, 0.12]
          },
          spec: 0.4,
          boost: 2,
        })
      )
      prims.push(
        ell([(R + 0.2) * c2, 0.615, (R + 0.2) * s2], [0.04, 0.008, 0.04], {
          col: function () {
            return [0.14, 0.14, 0.16]
          },
          spec: 0.4,
        })
      )
    }
    var dc = Math.round(N * 0.2),
      dst = N - dc,
      na = [],
      sa2 = [],
      sr = [],
      sp = [],
      so = []
    for (i = 0; i < dc; i++) {
      na.push(Math.floor(rnd() * 3))
      sa2.push(rnd() * TAU)
      sr.push(Math.sqrt(rnd()))
      sp.push(1.6 + rnd() * 1.4)
      so.push(rnd())
    }
    var sh = buildShape(prims, N, dst)
    sh.dyn = function (i, t) {
      var k = i - dst,
        u = fract(t * sp[k] + so[k]),
        j = i * 3,
        ang = (na[k] * TAU) / 3
      var spread = (0.035 + 0.06 * u + (u > 0.75 ? (u - 0.75) * 0.4 : 0)) * sr[k],
        fl = Math.sin(t * 40 + k) * 0.008 * u
      sh.pos[j] = 0.055 * Math.cos(ang) + Math.cos(sa2[k]) * spread + fl
      sh.pos[j + 1] = 0.66 - u * 0.64
      sh.pos[j + 2] = 0.055 * Math.sin(ang) + Math.sin(sa2[k]) * spread + fl
      var c,
        f = 1 - u * 0.5
      if (u < 0.12) c = [0.85, 0.9, 1]
      else if (u < 0.45) {
        var m = (u - 0.12) / 0.33
        c = [1, 0.95 - 0.17 * m, 0.7 - 0.45 * m]
      } else if (u < 0.75) {
        var m2 = (u - 0.45) / 0.3
        c = [1, 0.78 - 0.43 * m2, 0.25 - 0.17 * m2]
      } else c = [0.26, 0.26, 0.28]
      var fl2 = u < 0.75
      sh.col[j] = c[0] * (fl2 ? f : 1)
      sh.col[j + 1] = c[1] * (fl2 ? f : 1)
      sh.col[j + 2] = c[2] * (fl2 ? f : 1)
      sh.nrm[j] = 0
      sh.nrm[j + 1] = 1
      sh.nrm[j + 2] = 0
      sh.mat[i * 2] = 0
      sh.mat[i * 2 + 1] = fl2 ? 1 : 0
    }
    return sh
  }

  /* ================= 6. DIZAYN — mol'bert, qog'oz, siyoh Bezye, qalam ================= */
  function buildDesign(N) {
    var P0 = [-0.9, 0.5],
      C1 = [-0.4, 0.5],
      C2 = [-0.5, 1.45],
      P1 = [0, 1.1],
      C1b = [0.5, 0.75],
      C2b = [0.4, 1.7],
      P2 = [0.9, 1.65],
      Z = 0.012
    function bez(a, b, c, d, t) {
      var u = 1 - t
      return [
        u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
        u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1],
        Z,
      ]
    }
    var prims = [],
      WOOD = function (x, y, z) {
        var v = 1 + Math.sin(y * 90 + vnoise(x * 5, y * 5, z * 5) * 6) * 0.07
        return [0.55 * v, 0.36 * v, 0.2 * v]
      }
    var W = { col: WOOD, spec: 0.2, boost: 1.2 }
    prims.push(
      tube([-0.95, 0, -0.45], [-0.9, 1.95, -0.07], 0.03, 0.03, W),
      tube([0.95, 0, -0.45], [0.9, 1.95, -0.07], 0.03, 0.03, W),
      tube([0, 0, -0.9], [0, 1.75, -0.1], 0.03, 0.03, W)
    )
    prims.push(cub([0, 0.335, 0.06], [1.2, 0.02, 0.1], W))
    prims.push(
      cub([0, 1.1, -0.02], [1.1, 0.75, 0.02], {
        col: function (x, y, z) {
          var v = 0.93 + (fbm(x * 90, y * 90, z * 90) - 0.5) * 0.08
          return [v, v * 0.98, v * 0.93]
        },
        spec: 0.05,
        boost: 1.4,
      })
    ) // qog'oz
    prims.push({
      w: 0.3,
      col: function () {
        return [0.72, 0.7, 0.66]
      }, // nuqtali to'r
      s: function (out) {
        out[0] = -1.0 + Math.floor(rnd() * 21) * 0.1
        out[1] = 0.45 + Math.floor(rnd() * 14) * 0.1
        out[2] = 0.004
        out[3] = 0
        out[4] = 0
        out[5] = 1
        out[6] = 0
      },
    })
    ;[
      [0.9, 0.2, 0.2],
      [0.95, 0.65, 0.1],
      [0.2, 0.7, 0.35],
      [0.2, 0.5, 0.95],
      [0.55, 0.3, 0.85],
    ].forEach(function (c, k) {
      prims.push(
        disc([-0.9 + k * 0.14, 1.7, 0.004], 0.05, {
          col: function () {
            return c
          },
          spec: 0.3,
          boost: 1.3,
        })
      )
    })
    var ink = function (x, y, z, t) {
      return [0.1 + 0.7 * t, 0.12, 0.3 - 0.1 * t]
    }
    prims.push(
      curve(
        function (t) {
          return bez(P0, C1, C2, P1, t)
        },
        70,
        0.011,
        {
          col: function (x, y, z, t) {
            return ink(x, y, z, t * 0.5)
          },
          spec: 0.5,
          boost: 1.5,
        }
      )
    )
    prims.push(
      curve(
        function (t) {
          return bez(P1, C1b, C2b, P2, t)
        },
        70,
        0.011,
        {
          col: function (x, y, z, t) {
            return ink(x, y, z, 0.5 + t * 0.5)
          },
          spec: 0.5,
          boost: 1.5,
        }
      )
    )
    var BL = function () {
      return [0.2, 0.55, 1]
    }
    ;[
      [P0, C1],
      [P1, C2],
      [P1, C1b],
      [P2, C2b],
    ].forEach(function (p) {
      prims.push(
        line([p[0][0], p[0][1], Z + 0.003], [p[1][0], p[1][1], Z + 0.003], 0.02, {
          col: BL,
          em: 1,
          jit: 0.003,
          nrm: [0, 0, 1],
          boost: 1.5,
        })
      )
      prims.push(
        ell([p[1][0], p[1][1], Z + 0.005], [0.02, 0.02, 0.008], { col: BL, em: 1, boost: 2 })
      )
    })
    ;[P0, P2].forEach(function (p) {
      prims.push(
        cub([p[0], p[1], Z + 0.004], [0.032, 0.032, 0.006], {
          col: function () {
            return [0.95, 0.95, 0.97]
          },
          spec: 0.4,
          boost: 1.6,
        })
      )
    })
    prims.push(
      cub([P1[0], P1[1], Z + 0.004], [0.032, 0.032, 0.006], { col: BL, em: 1, boost: 1.6 })
    )
    // Real qalam
    var T = [0.9, 1.65, Z],
      d = norm3([0.55, 0.45, 0.7])
    function at(s) {
      return [T[0] + d[0] * s, T[1] + d[1] * s, T[2] + d[2] * s]
    }
    prims.push(
      tube(T, at(0.025), 0.002, 0.007, {
        col: function () {
          return [0.18, 0.18, 0.2]
        },
        spec: 0.5,
        boost: 2,
      })
    )
    prims.push(
      tube(at(0.025), at(0.105), 0.007, 0.018, {
        noCap: true,
        col: function () {
          return [0.84, 0.66, 0.45]
        },
        spec: 0.1,
        boost: 1.6,
      })
    )
    prims.push(
      hex(at(0.105), at(0.5), 0.018, {
        spec: 0.45,
        boost: 1.4,
        col: function (x, y, z, t) {
          var f = Math.floor(t) % 2,
            v = f ? 0.9 : 1
          return [0.98 * v, 0.78 * v, 0.1 * v]
        },
      })
    )
    prims.push(
      tube(at(0.5), at(0.555), 0.0195, 0.0195, {
        spec: 0.85,
        boost: 1.4,
        col: function (x, y, z, t) {
          return fract(t * 6) > 0.8 ? [0.45, 0.46, 0.5] : [0.74, 0.75, 0.78]
        },
      })
    )
    prims.push(
      tube(at(0.555), at(0.61), 0.016, 0.016, {
        spec: 0.1,
        boost: 1.4,
        col: function () {
          return [0.9, 0.45, 0.5]
        },
      })
    )
    var sh = buildShape(prims, N, N)
    sh.mode = 'sway'
    return sh
  }

  var SHAPES = [
    { id: 'telefon', label: 'Telefon', build: buildPhone },
    { id: 'kod', label: 'Kod', build: buildCode },
    { id: 'miya', label: "Sun'iy intellekt", build: buildBrain },
    { id: 'dunyo', label: 'Dunyo', build: buildGlobe },
    { id: 'raketa', label: 'Raketa', build: buildRocket },
    { id: 'dizayn', label: 'Dizayn', build: buildDesign },
  ]

  /* ================= Shaderlar: real vaqtli yoritish ================= */
  var VERT = [
    'attribute vec3 aColor; attribute vec3 aNormal; attribute vec2 aMat; attribute float aSeed;',
    'uniform float uTime,uScale,uSize,uMorph,uMono,uLight,uPass; uniform vec3 uLightDir;',
    'varying vec3 vColor;',
    'void main(){',
    '  vec4 mv=modelViewMatrix*vec4(position,1.0);',
    '  vec3 n=normalize(mat3(modelViewMatrix)*aNormal);',
    '  vec3 V=normalize(-mv.xyz);',
    '  float em=aMat.y; bool atmo=em>2.5; bool night=(em>1.5&&em<2.5); bool glowy=(em>0.5&&em<1.5);',
    '  float rim=pow(1.0-abs(dot(n,V)),2.5);',
    '  float sz=uSize*(0.85+0.3*aSeed); vec3 c=vec3(0.0); bool cull=false;',
    '  if(uPass<0.5){',
    '    if(atmo) cull=true;',
    '    else{',
    '      vec3 L=normalize(mat3(viewMatrix)*uLightDir); vec3 L2=normalize(mat3(viewMatrix)*vec3(-0.7,0.2,-0.5));',
    '      float nl=dot(n,L); float wrap=clamp((nl+0.3)/1.3,0.0,1.0); float fill=max(dot(n,L2),0.0);',
    '      float spec=pow(max(dot(n,normalize(L+V)),0.0),38.0)*aMat.x;',
    '      vec3 base=aColor*(0.96+0.08*fract(aSeed*91.7));',
    '      c=base*(0.2+0.1*n.y+0.95*wrap*vec3(1.0,0.96,0.9)+0.3*fill*vec3(0.45,0.6,1.0))+spec*1.3+base*rim*0.3;',
    '      if(glowy) c=aColor*1.3+c*0.1;',
    '      if(night) c+=aColor*smoothstep(0.15,-0.2,nl)*1.6;',
    '      c+=uMorph*0.15*vec3(0.4,0.75,1.0);',
    '      c=1.0-exp(-c*1.3);',
    '    }',
    '  } else {',
    '    if(uLight>0.5) cull=true;',
    '    else if(atmo){ c=aColor*rim*0.55; sz*=3.0; }',
    '    else if(glowy){ c=aColor*0.16; sz*=3.5; }',
    '    else cull=true;',
    '  }',
    '  if(uMono>0.5){ float lum=dot(c,vec3(0.299,0.587,0.114));',
    '    if(uLight>0.5) c=vec3(mix(0.72,0.03,clamp(lum*1.25,0.0,1.0))); else c=vec3(min(lum*1.15,1.0)); }',
    '  vColor=c;',
    '  gl_PointSize=clamp(sz*uScale/(-mv.z),1.0,64.0);',
    '  gl_Position=cull?vec4(2.0,2.0,2.0,1.0):projectionMatrix*mv;',
    '}',
  ].join('\n')
  var FRAG = [
    'uniform float uPass; varying vec3 vColor;',
    'void main(){ float d=length(gl_PointCoord-0.5); if(d>0.5) discard;',
    '  if(uPass<0.5){ gl_FragColor=vec4(vColor*(1.0-0.4*smoothstep(0.2,0.5,d)),1.0); }',
    '  else { float a=pow(smoothstep(0.5,0.0,d),2.0); gl_FragColor=vec4(vColor,a); } }',
  ].join('\n')
  var FVERT = [
    'uniform vec2 uOrigin, uCenter; uniform float uRip, uScale; varying float vA;',
    'void main(){',
    '  vec3 p = position + vec3(uOrigin.x, 0.0, uOrigin.y);',
    '  float d = length(p.xz - uCenter);',
    '  float ring = exp(-pow((d - uRip) * 2.2, 2.0));',
    '  vA = smoothstep(8.5, 1.0, d) * (0.2 + ring * 0.9) * (1.0 - 0.8 * exp(-pow(d / 0.32, 2.0)));',
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

  /* ================= Komponent ================= */
  var CSS = [
    ':host{display:block;position:relative;width:100%;height:100%;min-height:320px;overflow:hidden;outline:none;',
    '  background:var(--mh-bg,transparent);color:var(--mh-text,#e8ecff);--a:var(--mh-accent,#5ef2ff);',
    '  font-family:var(--mh-font,"Syne","Trebuchet MS",system-ui,sans-serif);-webkit-user-select:none;user-select:none}',
    'canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:pan-y;cursor:grab}',
    'canvas:active{cursor:grabbing}',
    '.name{position:absolute;left:clamp(14px,3vw,28px);bottom:clamp(16px,3vw,28px);width:min(380px,60%);pointer-events:none}',
    '.name b{display:block;font-weight:800;font-size:clamp(28px,5vw,52px);line-height:1;letter-spacing:-.02em;margin-bottom:12px}',
    ':host([theme="mono-dark"]){background:var(--mh-bg,transparent);color:var(--mh-text,#fff);--a:var(--mh-accent,#fff)}',
    ':host([theme="mono-light"]){background:var(--mh-bg,transparent);color:var(--mh-text,#0a0a0a);--a:var(--mh-accent,#0a0a0a)}',
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

  var Base = typeof HTMLElement !== 'undefined' ? HTMLElement : function () {}
  class MorphHuman extends Base {
    constructor() {
      super()
      this._started = false
    }
    connectedCallback() {
      if (this._started) return
      this._started = true
      if (!this.hasAttribute('theme')) this.setAttribute('theme', 'mono-dark')
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

    _shape(i) {
      var c = shapeCache[this._N] || (shapeCache[this._N] = [])
      if (!c[i]) {
        var s = SHAPES[i].build(this._N)
        s.id = SHAPES[i].id
        s.label = SHAPES[i].label
        c[i] = s
      }
      return c[i]
    }
    _applyTheme() {
      var THREE = window.THREE,
        th = this.getAttribute('theme') || 'mono-dark'
      var mono = th === 'mono-dark' || th === 'mono-light',
        light = th === 'mono-light'
      this._floorMat.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending
      this._floorMat.needsUpdate = true
      ;[this._matSolid, this._matGlow].forEach(function (m) {
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
      this._move = this.getAttribute('controls') === 'true'
      this._interval = parseFloat(this.getAttribute('interval')) || 10
      this._auto = this.getAttribute('auto') !== 'false'
      var labels = this.getAttribute('labels') !== 'false'
      var coarse = window.matchMedia && matchMedia('(pointer: coarse)').matches
      var N =
        parseInt(this.getAttribute('count'), 10) ||
        (coarse || (navigator.hardwareConcurrency || 8) <= 4 ? 22000 : 45000)
      this._N = N
      if (!this.hasAttribute('tabindex')) this.setAttribute('tabindex', '0')

      root.innerHTML =
        '<style>' +
        CSS +
        '</style><canvas></canvas>' +
        (labels
          ? '<div class="name"><b></b><div class="bar"><i></i></div></div><div class="dots" role="group" aria-label="Shakllar"></div>'
          : '') +
        '<div class="hint">Sudrab aylantiring · Space — keyingi shakl</div><div class="joy"><i></i></div>'
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
      if (this._move) root.querySelector('.joy').classList.add('on')

      var renderer = (this._renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      }))
      renderer.setClearColor(0x000000, 0)
      var scene = (this._scene = new THREE.Scene())
      this._camera = new THREE.PerspectiveCamera(38, 1, 0.05, 100)

      var geo = (this._geo = new THREE.BufferGeometry()),
        i
      var cur = (this._cur = new Float32Array(N * 3)),
        curCol = (this._curCol = new Float32Array(N * 3)),
        curN = (this._curN = new Float32Array(N * 3)),
        curM = (this._curM = new Float32Array(N * 2))
      var seed = new Float32Array(N)
      this._from = new Float32Array(N * 3)
      this._fromCol = new Float32Array(N * 3)
      this._fromN = new Float32Array(N * 3)
      this._fromM = new Float32Array(N * 2)
      this._target = new Float32Array(N * 3)
      this._targetN = new Float32Array(N * 3)
      this._delay = new Float32Array(N)
      this._phase = new Float32Array(N)
      for (i = 0; i < N; i++) {
        seed[i] = rnd()
        this._delay[i] = rnd() * 0.9
        this._phase[i] = rnd() * TAU
        cur[i * 3] = (rnd() - 0.5) * 6
        cur[i * 3 + 1] = rnd() * 3
        cur[i * 3 + 2] = (rnd() - 0.5) * 6
        curCol[i * 3] = curCol[i * 3 + 1] = curCol[i * 3 + 2] = 0.4
        curN[i * 3 + 1] = 1
      }
      geo.setAttribute('position', new THREE.BufferAttribute(cur, 3))
      geo.setAttribute('aColor', new THREE.BufferAttribute(curCol, 3))
      geo.setAttribute('aNormal', new THREE.BufferAttribute(curN, 3))
      geo.setAttribute('aMat', new THREE.BufferAttribute(curM, 2))
      geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
      function mk(pass) {
        return new THREE.ShaderMaterial({
          vertexShader: VERT,
          fragmentShader: FRAG,
          transparent: pass === 1,
          depthWrite: pass === 0,
          blending: pass === 1 ? THREE.AdditiveBlending : THREE.NormalBlending,
          uniforms: {
            uTime: { value: 0 },
            uScale: { value: 600 },
            uSize: { value: 0.011 },
            uMorph: { value: 0 },
            uMono: { value: 0 },
            uLight: { value: 0 },
            uPass: { value: pass },
            uLightDir: { value: new THREE.Vector3(0.5, 0.72, 0.62).normalize() },
          },
        })
      }
      this._matSolid = mk(0)
      this._matGlow = mk(1)
      this._group = new THREE.Group()
      this._group.rotation.order = 'YXZ'
      var solid = new THREE.Points(geo, this._matSolid),
        glow = new THREE.Points(geo, this._matGlow)
      solid.frustumCulled = glow.frustumCulled = false
      glow.renderOrder = 2
      this._glowPts = glow
      this._group.add(solid)
      this._group.add(glow)
      scene.add(this._group)

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
      this._floor.renderOrder = 1
      scene.add(this._floor)
      this._floor.visible = this.hasAttribute('floor')
      this._applyTheme()

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
      this._sz = 0.011
      this._keys = {}
      this._joy = { x: 0, y: 0 }
      this._active = false
      this._from.set(cur)
      this._fromCol.set(curCol)
      this._fromN.set(curN)
      this._fromM.set(curM)
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
      // qolgan shakllarni asta-sekin oldindan tayyorlash (qotib qolmaslik uchun)
      var q = 1
      ;(function pre() {
        if (self._renderer && q < SHAPES.length) {
          self._shape(q++)
          setTimeout(pre, 300)
        }
      })()
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
            self._camDist = clamp(self._camDist + e.deltaY * 0.004, 1.2, 9)
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
      this._fromN.set(this._curN)
      this._fromM.set(this._curM)
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
      this._matSolid.uniforms.uScale.value = sc
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

      var ix = (K['d'] || K['arrowright'] ? 1 : 0) - (K['a'] || K['arrowleft'] ? 1 : 0) + J.x
      var iz = (K['w'] || K['arrowup'] ? 1 : 0) - (K['s'] || K['arrowdown'] ? 1 : 0) + J.y
      if (!this._move) {
        ix = 0
        iz = 0
      }
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

      if (this._morphT < 4) this._morphT += dt
      this._timer += dt
      if (this._auto && this._timer >= this._interval) this.next()
      if (this._fillEl)
        this._fillEl.style.transform =
          'scaleX(' + (this._auto ? clamp(this._timer / this._interval, 0, 1) : 1) + ')'

      var sh = this._shape(this._idx),
        tp = this._target,
        tn = this._targetN
      {
        var a = sh.mode === 'sway' ? Math.sin(t * 0.6) * 0.55 : t * (sh.spin || 0.5)
        sh.curA = a
        if (sh.dyn) for (i = sh.dynStart; i < N; i++) sh.dyn(i, t)
        var c = Math.cos(a),
          s = Math.sin(a),
          tl = sh.tilt || 0,
          ctl = Math.cos(tl),
          stl = Math.sin(tl),
          cyy = sh.cy || 0,
          sp = sh.pos,
          sn = sh.nrm
        for (i = 0; i < N; i++) {
          var j = i * 3,
            x = sp[j],
            y = sp[j + 1],
            z = sp[j + 2],
            x1 = x * c + z * s,
            z1 = -x * s + z * c
          tp[j] = x1 * ctl - y * stl
          tp[j + 1] = x1 * stl + y * ctl + cyy
          tp[j + 2] = z1
          x = sn[j]
          y = sn[j + 1]
          z = sn[j + 2]
          x1 = x * c + z * s
          z1 = -x * s + z * c
          tn[j] = x1 * ctl - y * stl
          tn[j + 1] = x1 * stl + y * ctl
          tn[j + 2] = z1
        }
      }
      var MORPH = 2.5,
        dur = MORPH - 0.9,
        mt = this._morphT
      var cur = this._cur,
        cc = this._curCol,
        cn = this._curN,
        cm = this._curM,
        fr = this._from,
        fc = this._fromCol,
        fn = this._fromN,
        fm = this._fromM,
        dl = this._delay,
        ph = this._phase
      var tc = sh.col,
        tm = sh.mat
      if (mt >= MORPH) {
        cur.set(tp)
        cc.set(tc)
        cn.set(tn)
        cm.set(tm)
      } else {
        for (i = 0; i < N; i++) {
          var q = i * 3,
            r = i * 2,
            p = clamp((mt - dl[i]) / dur, 0, 1),
            e = p >= 1 ? 1 : ease(p)
          var arc = (1 - e) * e * 0.7 * Math.sin(ph[i])
          cur[q] = fr[q] + (tp[q] - fr[q]) * e + arc
          cur[q + 1] = fr[q + 1] + (tp[q + 1] - fr[q + 1]) * e + arc * 0.5
          cur[q + 2] = fr[q + 2] + (tp[q + 2] - fr[q + 2]) * e - arc
          cc[q] = fc[q] + (tc[q] - fc[q]) * e
          cc[q + 1] = fc[q + 1] + (tc[q + 1] - fc[q + 1]) * e
          cc[q + 2] = fc[q + 2] + (tc[q + 2] - fc[q + 2]) * e
          cn[q] = fn[q] + (tn[q] - fn[q]) * e
          cn[q + 1] = fn[q + 1] + (tn[q + 1] - fn[q + 1]) * e
          cn[q + 2] = fn[q + 2] + (tn[q + 2] - fn[q + 2]) * e
          cm[r] = fm[r] + (tm[r] - fm[r]) * e
          cm[r + 1] = fm[r + 1] + (tm[r + 1] - fm[r + 1]) * e
        }
      }
      var at = this._geo.attributes
      at.position.needsUpdate = true
      at.aColor.needsUpdate = true
      at.aNormal.needsUpdate = true
      at.aMat.needsUpdate = true

      this._sz += (sh.sz - this._sz) * Math.min(1, dt * 3)
      var morphGlow = clamp(1 - Math.abs(mt - MORPH * 0.5) / (MORPH * 0.5), 0, 1)
      var u1 = this._matSolid.uniforms,
        u2 = this._matGlow.uniforms
      u1.uTime.value = u2.uTime.value = t
      u1.uMorph.value = u2.uMorph.value = morphGlow
      u1.uSize.value = u2.uSize.value = this._sz

      var bob = Math.sin(t * 1.3) * 0.03
      this._group.position.set(this._pos.x, bob, this._pos.z)
      this._group.rotation.y = this._yaw
      this._group.rotation.x = 0
      var fu = this._floorMat.uniforms
      fu.uOrigin.value.set(
        Math.round(this._pos.x / 0.45) * 0.45,
        Math.round(this._pos.z / 0.45) * 0.45
      )
      fu.uCenter.value.set(this._pos.x, this._pos.z)
      fu.uRip.value = (t * 1.1) % 8

      var asp = this._aspect || 1,
        dist = this._camDist * (asp < 1 ? Math.pow(1 / asp, 0.7) : 1),
        ty = 0.98,
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
        this._geo.dispose()
        this._matSolid.dispose()
        this._matGlow.dispose()
        this._floorMat.dispose()
        this._renderer.dispose()
        this._renderer = null
      }
    }
  }

  MorphHuman._build = { SHAPES: SHAPES }
  if (typeof customElements !== 'undefined' && !customElements.get('morph-human'))
    customElements.define('morph-human', MorphHuman)
  if (typeof window !== 'undefined') window.MorphHuman = MorphHuman
})()
