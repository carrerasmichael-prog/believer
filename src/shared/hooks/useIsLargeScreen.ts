// src/shared/hooks/useIsLargeScreen.ts
import { useState, useEffect } from "react"

export function useIsLargeScreen() {
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 1200)

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1200px)")

    const handleChange = (e: MediaQueryListEvent) => {
      setIsLargeScreen(e.matches)
    }

    setIsLargeScreen(mediaQuery.matches)
    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  return isLargeScreen
}
