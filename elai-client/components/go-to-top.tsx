'use client'

import { ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'

const SHOW_AFTER = 420

export function GoToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      type="button"
      className={`go-to-top${visible ? ' is-visible' : ''}`}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      onClick={() => {
        const reduce = window.matchMedia(
          '(prefers-reduced-motion: reduce)',
        ).matches
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
      }}
    >
      <ArrowUp size={18} strokeWidth={2.25} aria-hidden />
    </button>
  )
}
