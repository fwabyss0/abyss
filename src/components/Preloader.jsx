import React from 'react'

/* Cinematic preloader.
   Progress is real: it tracks the portrait images and the window load event,
   then eases toward the true value so the bar never jumps. A failsafe
   guarantees the page always opens, even if an asset stalls.
   Fully respects prefers-reduced-motion by skipping the intro entirely. */
export default function Preloader({ onDone }) {
  const [visible, setVisible] = React.useState(true)
  const [leaving, setLeaving] = React.useState(false)
  const [shown, setShown] = React.useState(0)
  const [status, setStatus] = React.useState('Descending')
  const rootRef = React.useRef(null)
  const glyphRef = React.useRef(null)
  const haloRef = React.useRef(null)
  const doneRef = React.useRef(false)

  React.useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setShown(100)
      setVisible(false)
      onDone?.()
      return
    }

    let target = 0
    let raf = 0

    const setTarget = (v, label) => {
      if (v > target) target = v
      if (label) setStatus(label)
    }

    const paint = () => {
      setShown((prev) => {
        const next = prev + (target - prev) * 0.1
        const snapped = target - next < 0.4 ? target : next
        return snapped
      })
      if (target < 99.5 || doneRef.current) raf = requestAnimationFrame(paint)
    }
    raf = requestAnimationFrame(paint)

    let tracked = 0
    let settled = 0
    const settle = () => {
      if (++settled >= tracked) setTarget(100, 'Almost there')
    }
    const imgs = ['/assets/alish-900.jpg', '/assets/alish-900.webp', '/assets/alish-1100.webp']
    tracked = imgs.length
    imgs.forEach((src) => {
      const im = new Image()
      im.onload = im.onerror = settle
      im.src = src
    })

    setTarget(18, 'Descending')
    const t1 = setTimeout(() => setTarget(58, 'The light fades'), 260)
    const t2 = setTimeout(() => setTarget(82, 'Something stirs'), 700)

    const finish = () => {
      if (doneRef.current) return
      doneRef.current = true
      clearTimeout(t1)
      clearTimeout(t2)
      setShown(100)
      setStatus('Eyes open')
      setLeaving(true)
      setTimeout(() => {
        setVisible(false)
        onDone?.()
      }, 620)
    }

    const REVEAL = 900
    if (document.readyState === 'complete') setTarget(100, 'Almost there')
    else {
      window.addEventListener('load', () => setTarget(100, 'Almost there'), { once: true })
    }
    // Failsafe: however slow or broken the assets are, the page opens.
    const failsafe = setTimeout(finish, 4200 + REVEAL)
    window.addEventListener('load', () => setTimeout(finish, 600), { once: true })

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(failsafe)
      window.removeEventListener('load', () => {})
    }
  }, [onDone])

  // CSS keyframes drive the glyph/halo; this only sets the entering class.
  React.useEffect(() => {
    if (!visible || leaving) return
    rootRef.current?.classList.add('is-live')
  }, [visible, leaving])

  if (!visible) return null

  const pct = Math.round(shown)
  const chars = 'Alish Shrestha'.split('')

  return (
    <div className={'loader' + (leaving ? ' is-in' : '')} ref={rootRef} aria-hidden="true">
      <div className="loader__stage">
        <div className="loader__mark">
          <span className="loader__glyph" ref={glyphRef}>A</span>
          <span className="loader__halo" ref={haloRef}></span>
        </div>
      </div>

      <div className="loader__foot">
        <p className="loader__name" aria-label="Alish Shrestha">
          <span className="loader__name-inner">
            {chars.map((c, i) => (
              <span key={i} className="loader__char" style={{ '--i': i }}>
                {c === ' ' ? '\u00A0' : c}
              </span>
            ))}
          </span>
        </p>

        <div className="loader__meter">
          <div className="loader__track"><i style={{ width: pct + '%' }} /></div>
          <p className="loader__pct">{pct}%</p>
        </div>

        <p className="loader__status">{status}</p>
      </div>
    </div>
  )
}
