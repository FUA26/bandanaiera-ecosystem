"use client"

import { useEffect, useState } from "react"

export function ScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      const scrollableHeight = documentHeight - windowHeight
      const scrollPercentage = (scrollTop / scrollableHeight) * 100
      setProgress(Math.min(scrollPercentage, 100))
    }

    // Throttle scroll events for performance
    let ticking = false
    const throttledHandleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", throttledHandleScroll, { passive: true })
    handleScroll() // Initial calculation

    return () => window.removeEventListener("scroll", throttledHandleScroll)
  }, [])

  return (
    <div className="fixed top-0 right-0 left-0 z-[100] h-0.5 bg-primary/10">
      <div
        className="h-full bg-primary transition-transform duration-150 ease-out will-change-transform"
        style={{ transform: `scaleX(${progress / 100})` }}
      />
    </div>
  )
}
