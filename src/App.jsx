import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

const USER = 'javoxirrazoqov'
const NAME = 'MR.PRINCE'
const NAMES = ['MR.PRINCE', 'JAVOHIRR']
/* Kartadagi ma'lumotlar shu yerdan o'zgartiriladi */
const PROFILE = {
  stats: [
    { label: 'Repos', value: 26 },
    { label: 'Followers', value: 7 },
    { label: 'Following', value: 12 },
  ],
  roles: ['Frontend Developer', 'React Enthusiast', 'UI Experimenter'],
  skills: ['React', 'JavaScript', 'CSS'],
}
const MIN_SCALE = 0.6
const HARD_MAX = 1.8

const DAYS = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba']
const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr']

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const pad = (n) => String(n).padStart(2, '0')

/* ---------- Raqam sanash ---------- */
function useCountUp(target, duration = 1100) {
  const [value, setValue] = useState(0)
  const current = useRef(0)

  useEffect(() => {
    if (reduceMotion()) {
      current.current = target
      setValue(target)
      return
    }
    const from = current.current
    const start = performance.now()
    let raf
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      current.current = Math.round(from + (target - from) * (1 - Math.pow(1 - t, 3)))
      setValue(current.current)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return value
}

function Stat({ value, label }) {
  const shown = useCountUp(value)
  return (
    <div className="stat">
      <strong>{shown}</strong>
      <span>{label}</span>
    </div>
  )
}

/* ---------- Yozib o'chiriladigan lavozim ---------- */
function Typewriter({ words }) {
  const [text, setText] = useState(reduceMotion() ? words[0] : '')

  useEffect(() => {
    if (reduceMotion()) return
    let w = 0
    let i = 0
    let deleting = false
    let timer

    const tick = () => {
      const word = words[w]
      if (!deleting) {
        i++
        setText(word.slice(0, i))
        if (i === word.length) {
          deleting = true
          timer = setTimeout(tick, 1900)
          return
        }
        timer = setTimeout(tick, 75)
      } else {
        i--
        setText(word.slice(0, i))
        if (i === 0) {
          deleting = false
          w = (w + 1) % words.length
          timer = setTimeout(tick, 350)
          return
        }
        timer = setTimeout(tick, 35)
      }
    }
    timer = setTimeout(tick, 1000)
    return () => clearTimeout(timer)
  }, [words])

  return (
    <p className="role">
      <span className="sr-only">{words.join(', ')}</span>
      <span aria-hidden="true">{text}</span>
      <i className="caret" aria-hidden="true" />
    </p>
  )
}

/* ---------- Ism har 5 soniyada silliq almashadi ---------- */
function NameSwap({ names }) {
  const [i, setI] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % names.length), 5000)
    return () => clearInterval(id)
  }, [names])

  return (
    <h1 className="name" aria-label={names.join(' / ')}>
      {names.map((n, k) => (
        <span key={n} className={`name-item${k === i ? ' active' : ''}`} aria-hidden="true">
          {n}
        </span>
      ))}
    </h1>
  )
}

/* ---------- Soat ---------- */
function Clock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="clock" role="timer" aria-label="Joriy vaqt">
      <div className="clock-time">
        <span>{pad(now.getHours())}</span>
        <i>:</i>
        <span>{pad(now.getMinutes())}</span>
        <i>:</i>
        <small>{pad(now.getSeconds())}</small>
      </div>
      <div className="clock-date">
        {DAYS[now.getDay()]}, {now.getDate()}-{MONTHS[now.getMonth()]}
      </div>
    </div>
  )
}

/* ---------- Neon zarralar ---------- */
function makeSprite(rgb) {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const g = c.getContext('2d')
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.16, `rgba(${rgb},.95)`)
  grad.addColorStop(0.5, `rgba(${rgb},.24)`)
  grad.addColorStop(1, `rgba(${rgb},0)`)
  g.fillStyle = grad
  g.fillRect(0, 0, 64, 64)
  return c
}

function ParticleField({ emitRef }) {
  const backRef = useRef(null)
  const frontRef = useRef(null)

  useEffect(() => {
    const bc = backRef.current
    const fc = frontRef.current
    const back = bc.getContext('2d')
    const front = fc.getContext('2d')
    const still = reduceMotion()
    const palette = ['54,220,255', '122,107,255', '224,82,255', '110,160,255']
    const sprites = palette.map(makeSprite)
    const mouse = { x: -9999, y: -9999, px: 0, py: 0, tx: 0, ty: 0 }
    let w = 0, h = 0, raf = 0, last = 0, nextMeteor = 1800
    let dust = [], sparks = [], meteors = []
    let linkDist = 120

    function frame(t) {
      const dt = clamp((t - last) / 16.67 || 1, 0.2, 2.5)
      last = t

      mouse.px += (mouse.tx - mouse.px) * 0.05
      mouse.py += (mouse.ty - mouse.py) * 0.05

      back.clearRect(0, 0, w, h)
      back.globalCompositeOperation = 'lighter'

      /* chang zarralari */
      for (const d of dust) {
        if (!still) {
          d.ph += 0.018 * dt
          d.x += (d.bx + d.vx + Math.sin(d.ph * 0.6) * 0.14 * d.z) * dt
          d.y += (d.by + d.vy) * dt
          d.vx *= 0.95
          d.vy *= 0.95
          if (d.y < -40) { d.y = h + 40; d.x = Math.random() * w }
          if (d.y > h + 40) d.y = -40
          if (d.x < -40) d.x = w + 40
          if (d.x > w + 40) d.x = -40
        }
        d.rx = d.x + mouse.px * 46 * d.z
        d.ry = d.y + mouse.py * 46 * d.z

        const dx = d.rx - mouse.x
        const dy = d.ry - mouse.y
        const dist = Math.hypot(dx, dy) || 1
        d.near = clamp(1 - dist / 190, 0, 1)
        if (!still && dist < 130) {
          const f = (1 - dist / 130) * 0.6
          d.vx += (dx / dist) * f
          d.vy += (dy / dist) * f
        }
      }

      /* zarralar orasidagi yorug' chiziqlar (yulduz turkumi) */
      back.lineWidth = 0.8
      for (let i = 0; i < dust.length; i++) {
        const a = dust[i]
        for (let j = i + 1; j < dust.length; j++) {
          const b = dust[j]
          const dx = a.rx - b.rx
          if (dx > linkDist || dx < -linkDist) continue
          const dy = a.ry - b.ry
          const d = Math.hypot(dx, dy)
          if (d > linkDist) continue
          const al = (1 - d / linkDist) * 0.2 + (a.near + b.near) * 0.28
          back.strokeStyle = `rgba(140,150,255,${clamp(al, 0, 0.8)})`
          back.beginPath()
          back.moveTo(a.rx, a.ry)
          back.lineTo(b.rx, b.ry)
          back.stroke()
        }
      }

      /* yorug' sharlar */
      for (const d of dust) {
        const s = d.s * (1 + d.near * 0.9)
        const a = 0.42 + 0.3 * Math.sin(d.ph) + d.near * 0.5
        back.globalAlpha = clamp(a, 0.08, 1)
        back.drawImage(sprites[d.c], d.rx - s / 2, d.ry - s / 2, s, s)
      }
      back.globalAlpha = 1

      /* uchar yulduzlar */
      if (!still) {
        if (t > nextMeteor) {
          nextMeteor = t + 3500 + Math.random() * 5500
          meteors.push({
            x: w * (0.3 + Math.random() * 0.7),
            y: -20,
            vx: -(7 + Math.random() * 5),
            vy: 4 + Math.random() * 3,
            life: 1,
            c: palette[Math.floor(Math.random() * 3)],
          })
        }
        for (const m of meteors) {
          m.x += m.vx * dt
          m.y += m.vy * dt
          m.life -= 0.008 * dt
          const len = Math.hypot(m.vx, m.vy)
          const tx = m.x - (m.vx / len) * 160
          const ty = m.y - (m.vy / len) * 160
          const g = back.createLinearGradient(m.x, m.y, tx, ty)
          g.addColorStop(0, `rgba(255,255,255,${clamp(m.life, 0, 1)})`)
          g.addColorStop(0.3, `rgba(${m.c},${clamp(m.life * 0.55, 0, 1)})`)
          g.addColorStop(1, `rgba(${m.c},0)`)
          back.strokeStyle = g
          back.lineWidth = 2
          back.lineCap = 'round'
          back.beginPath()
          back.moveTo(m.x, m.y)
          back.lineTo(tx, ty)
          back.stroke()
        }
        meteors = meteors.filter((m) => m.life > 0 && m.x > -220 && m.y < h + 220)
      }

      /* uchqunlar (kartaning oldida) */
      front.clearRect(0, 0, w, h)
      front.globalCompositeOperation = 'lighter'
      sparks = sparks.filter((p) => p.life > 0)
      for (const p of sparks) {
        p.vy += 0.07 * dt
        p.vx *= 0.985
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.life -= p.decay * dt
        const s = p.r * 7 * Math.max(0.1, p.life) + 3
        front.globalAlpha = clamp(p.life, 0, 1)
        front.drawImage(sprites[p.c], p.x - s / 2, p.y - s / 2, s, s)
      }
      front.globalAlpha = 1

      if (!still) raf = requestAnimationFrame(frame)
    }

    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      w = window.innerWidth
      h = window.innerHeight
      for (const [c, ctx] of [[bc, back], [fc, front]]) {
        c.width = w * dpr
        c.height = h * dpr
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      }
      const small = w < 600
      linkDist = small ? 95 : 125
      const n = Math.round(clamp((w * h) / 9500, 36, small ? 62 : 130))
      dust = Array.from({ length: n }, () => {
        const z = Math.random() * 0.75 + 0.25
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          z,
          s: 16 + z * 34,
          bx: (Math.random() - 0.5) * 0.25,
          by: -(Math.random() * 0.35 + 0.08) * (0.4 + z),
          vx: 0, vy: 0, rx: 0, ry: 0, near: 0,
          ph: Math.random() * 6.28,
          c: Math.floor(Math.random() * sprites.length),
        }
      })
      if (still) frame(0)
    }

    function onMove(e) {
      mouse.x = e.clientX
      mouse.y = e.clientY
      mouse.tx = e.clientX / w - 0.5
      mouse.ty = e.clientY / h - 0.5
    }

    emitRef.current = (x, y, n = 10, power = 1) => {
      if (still) return
      for (let i = 0; i < n; i++) {
        const a = Math.random() * 6.283
        const sp = (Math.random() * 3 + 1) * power
        sparks.push({
          x, y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 0.8,
          r: Math.random() * 2 + 0.8,
          life: 1,
          decay: 0.012 + Math.random() * 0.02,
          c: Math.floor(Math.random() * sprites.length),
        })
      }
      if (sparks.length > 450) sparks.splice(0, sparks.length - 450)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onMove)
    if (!still) raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      emitRef.current = null
    }
  }, [emitRef])

  return (
    <>
      <canvas ref={backRef} className="particles particles-back" aria-hidden="true" />
      <canvas ref={frontRef} className="particles particles-front" aria-hidden="true" />
    </>
  )
}

/* ---------- Rasmni kattalashtirish (avatar joyidan o'sib chiqadi) ---------- */
function Lightbox({ src, from, onClose }) {
  const imgRef = useRef(null)
  const closeBtn = useRef(null)
  const anim = useRef(null)
  const [closing, setClosing] = useState(false)

  const frames = useCallback(() => {
    const to = imgRef.current.getBoundingClientRect()
    const dx = from.left + from.width / 2 - (to.left + to.width / 2)
    const dy = from.top + from.height / 2 - (to.top + to.height / 2)
    const s = from.width / to.width
    return [
      { transform: `translate(${dx}px, ${dy}px) scale(${s})`, borderRadius: '50%' },
      { transform: 'translate(0, 0) scale(1)', borderRadius: '28px' },
    ]
  }, [from])

  useLayoutEffect(() => {
    const [a, b] = frames()
    anim.current = imgRef.current.animate([a, b], {
      duration: reduceMotion() ? 1 : 600,
      easing: 'cubic-bezier(.2, .9, .2, 1)',
    })
    closeBtn.current?.focus({ preventScroll: true })
  }, [frames])

  const close = useCallback(() => {
    if (closing) return
    setClosing(true)
    anim.current?.cancel()
    const [a, b] = frames()
    const out = imgRef.current.animate([b, a], {
      duration: reduceMotion() ? 1 : 430,
      easing: 'cubic-bezier(.5, 0, .2, 1)',
      fill: 'forwards',
    })
    out.onfinish = onClose
  }, [closing, frames, onClose])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  return (
    <div
      className={`lb${closing ? ' closing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Profil rasmi"
      onClick={close}
    >
      <button ref={closeBtn} type="button" className="lb-close" aria-label="Yopish" onClick={close}>
        ×
      </button>
      <div className="lb-stage" onClick={(e) => e.stopPropagation()}>
        <img ref={imgRef} className="lb-img" src={src} alt={`${NAME} profil rasmi`} draggable="false" />
      </div>
      <p className="lb-caption">
        <strong>{NAME}</strong>
        <span>@{USER}</span>
      </p>
    </div>
  )
}

/* ---------- Sokin musiqa: fayl kerak emas, brauzerning o'zida yaratiladi ---------- */
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12)
const CHORDS = [
  [48, 55, 59, 62, 64], /* Cmaj9 */
  [45, 52, 55, 59, 60], /* Am9 */
  [41, 48, 52, 57, 60], /* Fmaj7 */
  [43, 50, 57, 59, 62], /* Gadd9 */
]
const BELLS = [72, 74, 76, 79, 81, 84] /* pentatonika */

function makeImpulse(ctx, sec, decay) {
  const len = Math.floor(ctx.sampleRate * sec)
  const buf = ctx.createBuffer(2, len, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay)
  }
  return buf
}

function createEngine() {
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  const ctx = new AC()

  const master = ctx.createGain()
  master.gain.value = 0
  const comp = ctx.createDynamicsCompressor()
  const analyser = ctx.createAnalyser()
  analyser.fftSize = 512
  const bus = ctx.createGain()
  const dry = ctx.createGain()
  dry.gain.value = 0.55
  const wet = ctx.createGain()
  wet.gain.value = 0.6
  const verb = ctx.createConvolver()
  verb.buffer = makeImpulse(ctx, 5, 3)

  bus.connect(dry)
  bus.connect(verb)
  verb.connect(wet)
  dry.connect(master)
  wet.connect(master)
  master.connect(comp)
  comp.connect(analyser)
  analyser.connect(ctx.destination)

  const data = new Uint8Array(analyser.fftSize)
  let on = false
  let step = 0
  let chordTimer = 0
  let bellTimer = 0
  let suspendTimer = 0

  const panner = (x) => {
    if (!ctx.createStereoPanner) return null
    const p = ctx.createStereoPanner()
    p.pan.value = x
    return p
  }

  function pad(freq, t, dur, vol) {
    const g = ctx.createGain()
    const f = ctx.createBiquadFilter()
    f.type = 'lowpass'
    f.frequency.value = 900
    f.Q.value = 0.4
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(vol, t + 3)
    g.gain.setTargetAtTime(0, t + dur, 1.8)

    const out = panner((Math.random() - 0.5) * 0.8)
    f.connect(g)
    if (out) { g.connect(out); out.connect(bus) } else g.connect(bus)

    for (const [type, det] of [['sine', -6], ['triangle', 7]]) {
      const o = ctx.createOscillator()
      o.type = type
      o.frequency.value = freq
      o.detune.value = det
      o.connect(f)
      o.start(t)
      o.stop(t + dur + 9)
    }
  }

  function bell(freq, t) {
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.05, t + 0.03)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 4.5)
    const out = panner((Math.random() - 0.5) * 1.4)
    if (out) { g.connect(out); out.connect(bus) } else g.connect(bus)
    for (const [mul, vol] of [[1, 1], [2.01, 0.25]]) {
      const o = ctx.createOscillator()
      const og = ctx.createGain()
      og.gain.value = vol
      o.type = 'sine'
      o.frequency.value = freq * mul
      o.connect(og)
      og.connect(g)
      o.start(t)
      o.stop(t + 4.6)
    }
  }

  function nextChord() {
    const t = ctx.currentTime + 0.1
    CHORDS[step++ % CHORDS.length].forEach((m, i) =>
      pad(mtof(m), t + i * 0.3, 11, i === 0 ? 0.07 : 0.035)
    )
    chordTimer = setTimeout(nextChord, 9000)
  }

  function nextBell() {
    const m = BELLS[Math.floor(Math.random() * BELLS.length)]
    bell(mtof(m), ctx.currentTime + 0.05)
    bellTimer = setTimeout(nextBell, 2400 + Math.random() * 4200)
  }

  return {
    start(volume) {
      clearTimeout(suspendTimer)
      ctx.resume()
      if (!on) {
        on = true
        nextChord()
        bellTimer = setTimeout(nextBell, 3500)
      }
      master.gain.cancelScheduledValues(ctx.currentTime)
      master.gain.setTargetAtTime(volume * 0.7, ctx.currentTime, 1.2)
    },
    stop() {
      on = false
      clearTimeout(chordTimer)
      clearTimeout(bellTimer)
      master.gain.cancelScheduledValues(ctx.currentTime)
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.5)
      suspendTimer = setTimeout(() => ctx.suspend(), 2600)
    },
    volume(v) {
      if (on) master.gain.setTargetAtTime(v * 0.7, ctx.currentTime, 0.1)
    },
    level() {
      analyser.getByteTimeDomainData(data)
      let sum = 0
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128
        sum += v * v
      }
      return Math.sqrt(sum / data.length)
    },
    close() {
      clearTimeout(chordTimer)
      clearTimeout(bellTimer)
      clearTimeout(suspendTimer)
      ctx.close()
    },
  }
}

function useAmbient(pageRef) {
  const engine = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.6)
  const [invited, setInvited] = useState(true)

  const toggle = useCallback(() => {
    if (!engine.current) engine.current = createEngine()
    const e = engine.current
    if (!e) return
    setInvited(false)
    if (playing) {
      e.stop()
      setPlaying(false)
    } else {
      e.start(volume)
      setPlaying(true)
    }
  }, [playing, volume])

  useEffect(() => {
    engine.current?.volume(volume)
  }, [volume])

  /* Musiqa balandligi karta orqasidagi nurni "nafas oldiradi" */
  useEffect(() => {
    const el = pageRef.current
    if (!playing || !el || reduceMotion()) return
    let raf
    let smooth = 0
    const loop = () => {
      smooth += (engine.current.level() - smooth) * 0.08
      el.style.setProperty('--beat', smooth.toFixed(3))
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => {
      cancelAnimationFrame(raf)
      el.style.setProperty('--beat', 0)
    }
  }, [playing, pageRef])

  useEffect(() => () => engine.current?.close(), [])

  return { playing, volume, setVolume, toggle, invited }
}

/* ================== Asosiy ilova ================== */
export default function App() {
  const dragRef = useRef(null)
  const glassRef = useRef(null)
  const avatarRef = useRef(null)
  const scaleRef = useRef(1)
  const emitRef = useRef(null)
  const pageRef = useRef(null)
  const music = useAmbient(pageRef)
  const motion = useRef({
    x: 0, y: 0, vx: 0, vy: 0, lx: 0, ly: 0, lt: 0,
    raf: 0, dragging: false, travel: 0, downAvatar: false, lastTap: 0,
  })

  const [scale, setScale] = useState(1)
  const [maxScale, setMaxScale] = useState(HARD_MAX)
  const [dragging, setDragging] = useState(false)
  const [moved, setMoved] = useState(false)
  const [avatar, setAvatar] = useState('/github.profile.jpg')
  const [copied, setCopied] = useState(false)
  const [lightbox, setLightbox] = useState(null)

  const setVar = (name, value) => glassRef.current?.style.setProperty(name, value)

  /* ---------- Chegaralar ---------- */
  const bounds = useCallback((s = scaleRef.current) => {
    const el = glassRef.current
    const w = el.offsetWidth * s
    const h = el.offsetHeight * s
    return {
      mx: Math.max(0, (window.innerWidth - w) / 2 - 12),
      my: Math.max(0, (window.innerHeight - h) / 2 - 26), /* suzish uchun joy */
    }
  }, [])

  const apply = useCallback(() => {
    const m = motion.current
    dragRef.current.style.transform = `translate3d(${m.x}px, ${m.y}px, 0)`
  }, [])

  const place = useCallback((x, y) => {
    const b = bounds()
    const m = motion.current
    m.x = clamp(x, -b.mx, b.mx)
    m.y = clamp(y, -b.my, b.my)
    apply()
  }, [bounds, apply])

  /* ---------- Inersiya ---------- */
  const glide = useCallback(() => {
    const m = motion.current
    const b = bounds()
    m.x += m.vx
    m.y += m.vy
    m.vx *= 0.94
    m.vy *= 0.94
    if (Math.abs(m.x) > b.mx) { m.x = Math.sign(m.x) * b.mx; m.vx *= -0.5 }
    if (Math.abs(m.y) > b.my) { m.y = Math.sign(m.y) * b.my; m.vy *= -0.5 }
    apply()
    setVar('--rz', `${clamp(m.vx * 0.9, -10, 10)}deg`)
    if (Math.hypot(m.vx, m.vy) > 0.15) m.raf = requestAnimationFrame(glide)
    else setVar('--rz', '0deg')
  }, [bounds, apply])

  /* ---------- Joyiga qaytarish ---------- */
  const reset = useCallback(() => {
    const m = motion.current
    cancelAnimationFrame(m.raf)
    const el = dragRef.current
    const r = glassRef.current.getBoundingClientRect()
    emitRef.current?.(r.left + r.width / 2, r.top + r.height / 2, 30, 1.2)
    el.classList.add('snap')
    m.x = 0
    m.y = 0
    apply()
    setTimeout(() => el.classList.remove('snap'), 700)
  }, [apply])

  /* ---------- Lightbox ---------- */
  function openLightbox() {
    const r = avatarRef.current.getBoundingClientRect()
    emitRef.current?.(r.left + r.width / 2, r.top + r.height / 2, 26, 1.2)
    setLightbox({ left: r.left, top: r.top, width: r.width, height: r.height })
  }

  const closeLightbox = useCallback(() => {
    setLightbox(null)
    glassRef.current?.focus({ preventScroll: true })
  }, [])

  /* ---------- Pointer ---------- */
  function onPointerDown(e) {
    if (e.target.closest('button, a')) return
    const m = motion.current
    cancelAnimationFrame(m.raf)
    e.currentTarget.setPointerCapture(e.pointerId)
    m.dragging = true
    m.travel = 0
    m.downAvatar = !!e.target.closest('.avatar')
    m.lx = e.clientX
    m.ly = e.clientY
    m.lt = e.timeStamp
    m.vx = 0
    m.vy = 0
    setDragging(true)
  }

  function onPointerMove(e) {
    const m = motion.current

    if (m.dragging) {
      const dt = Math.max(1, e.timeStamp - m.lt)
      const dx = e.clientX - m.lx
      const dy = e.clientY - m.ly
      m.travel += Math.hypot(dx, dy)
      if (m.travel > 6) setMoved(true)
      m.vx = m.vx * 0.6 + ((dx / dt) * 16) * 0.4
      m.vy = m.vy * 0.6 + ((dy / dt) * 16) * 0.4
      m.lx = e.clientX
      m.ly = e.clientY
      m.lt = e.timeStamp
      place(m.x + dx, m.y + dy)
      setVar('--rz', `${clamp(m.vx * 0.9, -10, 10)}deg`)
      if (Math.hypot(m.vx, m.vy) > 2) emitRef.current?.(e.clientX, e.clientY, 2, 0.5)
      return
    }

    if (e.pointerType === 'touch') return

    const r = glassRef.current.getBoundingClientRect()
    const px = clamp((e.clientX - r.left) / r.width, 0, 1)
    const py = clamp((e.clientY - r.top) / r.height, 0, 1)
    setVar('--ry', `${(px - 0.5) * 16}deg`)
    setVar('--rx', `${(0.5 - py) * 16}deg`)
    setVar('--mx', `${px * 100}%`)
    setVar('--my', `${py * 100}%`)
    setVar('--ang', `${Math.atan2(py - 0.5, px - 0.5) * (180 / Math.PI) + 90}deg`)
  }

  function endDrag(e, cancelled = false) {
    const m = motion.current
    if (!m.dragging) return
    m.dragging = false
    setDragging(false)

    /* Bosish (sudramasdan): avatar -> rasm, boshqa joy -> ikki marta bosish = qaytarish */
    if (!cancelled && m.travel < 6) {
      setVar('--rz', '0deg')
      if (m.downAvatar) {
        openLightbox()
      } else if (e.timeStamp - m.lastTap < 320) {
        m.lastTap = 0
        reset()
      } else {
        m.lastTap = e.timeStamp
      }
      return
    }

    if (e.timeStamp - m.lt > 80 || reduceMotion()) { m.vx = 0; m.vy = 0 }
    if (Math.hypot(m.vx, m.vy) > 1) m.raf = requestAnimationFrame(glide)
    else setVar('--rz', '0deg')
  }

  function onPointerLeave() {
    if (motion.current.dragging) return
    setVar('--rx', '0deg')
    setVar('--ry', '0deg')
    setVar('--mx', '50%')
    setVar('--my', '25%')
  }

  /* ---------- Klaviatura ---------- */
  function onKeyDown(e) {
    const step = e.shiftKey ? 60 : 24
    const m = motion.current
    const keys = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    }
    if (keys[e.key]) {
      e.preventDefault()
      setMoved(true)
      place(m.x + keys[e.key][0], m.y + keys[e.key][1])
    } else if (e.key === '+' || e.key === '=') zoom(0.1)
    else if (e.key === '-') zoom(-0.1)
    else if (e.key === 'Home' || e.key === '0') reset()
  }

  function onAvatarKey(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      e.stopPropagation()
      openLightbox()
    }
  }

  function zoom(delta) {
    setScale((s) => clamp(+(s + delta).toFixed(2), MIN_SCALE, maxScale))
  }

  async function copyHandle(e) {
    try { await navigator.clipboard.writeText(USER) } catch { /* ruxsat yo'q */ }
    emitRef.current?.(e.clientX, e.clientY, 18, 0.9)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  /* ---------- Responsive: karta ekranga sig'ishi uchun ---------- */
  useEffect(() => {
    const fit = () => {
      const el = glassRef.current
      const max = clamp(
        Math.min(HARD_MAX, (window.innerWidth - 24) / el.offsetWidth, (window.innerHeight - 64) / el.offsetHeight),
        MIN_SCALE,
        HARD_MAX
      )
      setMaxScale(max)
      setScale((s) => Math.min(s, max))
    }
    fit()
    window.addEventListener('resize', fit)
    window.addEventListener('orientationchange', fit)
    return () => {
      window.removeEventListener('resize', fit)
      window.removeEventListener('orientationchange', fit)
      cancelAnimationFrame(motion.current.raf)
    }
  }, [])

  useEffect(() => {
    scaleRef.current = scale
    place(motion.current.x, motion.current.y)
  }, [scale, maxScale, place])

  useEffect(() => {
    const onResize = () => place(motion.current.x, motion.current.y)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [place])

  return (
    <main ref={pageRef} className="page">
      <div className="sky" aria-hidden="true" />
      <div className="orb orb-a" aria-hidden="true" />
      <div className="orb orb-b" aria-hidden="true" />
      <ParticleField emitRef={emitRef} />

      <div ref={dragRef} className="drag">
        <div className={`float${dragging ? ' held' : ''}`} style={{ '--s': scale }}>
          <div className="halo" aria-hidden="true" />
          <div className="floor" aria-hidden="true" />

          <section
            ref={glassRef}
            className={`glass${dragging ? ' dragging' : ''}${lightbox ? ' lb-open' : ''}`}
            tabIndex={0}
            aria-label="GitHub profil kartasi. Strelka tugmalari bilan siljiting, plyus va minus bilan o'lchamini o'zgartiring."
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={(e) => endDrag(e, true)}
            onPointerLeave={onPointerLeave}
            onKeyDown={onKeyDown}
          >
            <Clock />

            <div
              ref={avatarRef}
              className="avatar"
              role="button"
              tabIndex={0}
              aria-label="Profil rasmini kattalashtirish"
              onKeyDown={onAvatarKey}
            >
              <img
                src={avatar}
                alt="Javohir profil rasmi"
                draggable="false"
                onError={() => setAvatar(`https://github.com/${USER}.png`)}
              />
            </div>

            <NameSwap names={NAMES} />
            <button
              type="button"
              className={`handle${copied ? ' copied' : ''}`}
              onClick={copyHandle}
              title="Nusxalash"
            >
              {copied ? 'Nusxalandi ✓' : `@${USER}`}
            </button>

            <Typewriter words={PROFILE.roles} />

            <div className="stats">
              {PROFILE.stats.map((st, i) => (
                <Fragment key={st.label}>
                  {i > 0 && <span className="stats-divider" aria-hidden="true" />}
                  <Stat value={st.value} label={st.label} />
                </Fragment>
              ))}
            </div>

            <ul className="skills" aria-label="Texnologiyalar">
              {PROFILE.skills.map((sk) => (
                <li key={sk}>{sk}</li>
              ))}
            </ul>

            <a
              className="follow"
              href={`https://github.com/${USER}`}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => emitRef.current?.(e.clientX, e.clientY, 26, 1.1)}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              Follow
            </a>

            <div className="zoom" role="group" aria-label="Karta o'lchami">
              <button type="button" aria-label="Kichraytirish" onClick={() => zoom(-0.1)} disabled={scale <= MIN_SCALE + 0.001}>
                −
              </button>
              <output aria-live="polite">{Math.round(scale * 100)}%</output>
              <button type="button" aria-label="Kattalashtirish" onClick={() => zoom(0.1)} disabled={scale >= maxScale - 0.001}>
                +
              </button>
            </div>
          </section>
        </div>
      </div>

      <div className={`music${music.playing ? ' on' : ''}${music.invited ? ' invite' : ''}`}>
        <button
          type="button"
          className="music-btn"
          aria-pressed={music.playing}
          aria-label={music.playing ? "Musiqani o'chirish" : 'Sokin musiqani yoqish'}
          title={music.playing ? "Musiqani o'chirish" : 'Sokin musiqani yoqish'}
          onClick={(e) => {
            music.toggle()
            emitRef.current?.(e.clientX, e.clientY, 14, 0.8)
          }}
        >
          <span className="eq" aria-hidden="true">
            <i /><i /><i /><i />
          </span>
        </button>
        <span className="music-label">Sokin musiqa</span>
        <input
          className="music-vol"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={music.volume}
          onChange={(e) => music.setVolume(+e.target.value)}
          aria-label="Ovoz balandligi"
        />
      </div>

      {lightbox && <Lightbox src={avatar} from={lightbox} onClose={closeLightbox} />}

      <p className={`hint${moved ? ' gone' : ''}`}>
        Sudrang va tashlang · ikki marta bosib joyiga qaytaring · rasmni bosing
      </p>
    </main>
  )
}