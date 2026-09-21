import { useEffect } from 'react'

/** Deliberate upward scrolling at the settled home page enters the sky.
 * Returning to the top from the résumé must not launch on scroll momentum. */
export function useSkyEntry(enabled: boolean, enter: () => void) {
  useEffect(() => {
    if (!enabled) return
    let lastAway = performance.now(), lastWheel = 0, intent = 0, launched = false
    let armed = window.scrollY <= 2
    let armTimer = 0
    let touch: { x: number; y: number; eligible: boolean } | null = null
    const blocked = (target: EventTarget | null) => target instanceof Element && !!target.closest('button,a,input,textarea,select,[role="dialog"],[contenteditable="true"]')
    const launch = () => { if (!launched) { launched = true; enter() } }
    const scroll = () => { if (window.scrollY > 2) { lastAway = performance.now(); intent = 0; armed = false } }
    const wheel = (event: WheelEvent) => {
      const now = performance.now()
      const gap = now - lastWheel
      lastWheel = now
      if (!armed) {
        window.clearTimeout(armTimer)
        armTimer = window.setTimeout(() => { if (window.scrollY <= 2) armed = true }, 1500)
        return
      }
      if (window.scrollY > 2 || now - lastAway < 700 || event.ctrlKey || blocked(event.target)) { intent = 0; return }
      if (event.deltaY >= 0 || Math.abs(event.deltaX) > Math.abs(event.deltaY)) { intent = 0; return }
      if (gap > 350) intent = 0
      intent += -event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1)
      if (intent >= 100) launch()
    }
    const start = (event: TouchEvent) => {
      const point = event.touches[0]
      touch = point && event.touches.length === 1 ? { x: point.clientX, y: point.clientY, eligible: window.scrollY <= 2 && performance.now() - lastAway > 700 && !blocked(event.target) } : null
    }
    const end = (event: TouchEvent) => {
      const point = event.changedTouches[0]
      // Pulling the page down at its top is the touch equivalent of scrolling upward.
      if (touch?.eligible && point && window.scrollY <= 2 && point.clientY - touch.y > 100 && Math.abs(point.clientX - touch.x) < 60) launch()
      touch = null
    }
    window.addEventListener('scroll', scroll, { passive: true })
    window.addEventListener('wheel', wheel, { passive: true })
    window.addEventListener('touchstart', start, { passive: true })
    window.addEventListener('touchend', end, { passive: true })
    return () => {
      window.clearTimeout(armTimer)
      window.removeEventListener('scroll', scroll)
      window.removeEventListener('wheel', wheel)
      window.removeEventListener('touchstart', start)
      window.removeEventListener('touchend', end)
    }
  }, [enabled, enter])
}
