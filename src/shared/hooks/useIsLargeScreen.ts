// src/shared/hooks/useIsLargeScreen.ts
import { useSyncExternalStore } from "react"

function subscribe(callback: () => void) {
  window.addEventListener("resize", callback)
  // Also listen to orientation change on mobile
  window.addEventListener("orientationchange", callback)
  return () => {
    window.removeEventListener("resize", callback)
    window.removeEventListener("orientationchange", callback)
  }
}

export function useIsLargeScreen() {
  return useSyncExternalStore(
    subscribe,
    () => window.innerWidth >= 1200,  // server / initial
    () => true                                // SSR fallback
  )
}