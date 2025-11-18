// src/navigation/Router.tsx
import {Suspense, useEffect} from "react"
import {useNavigation} from "./hooks"
import {routes} from "./routes"
import {matchPath} from "./utils"
import {LoadingFallback} from "@/shared/components/LoadingFallback"
import {RouteProvider} from "./RouteContext"
import {RouteBaseContext} from "./contexts"
import ErrorBoundary from "@/shared/components/ui/ErrorBoundary"
import Threshold from "@/pages/landing/Threshold" // ← NOW THRESHOLD
import {
  useHasSeenThreshold,
  useDefaultRoom,
  useIsLoggedIn,
  useMarkThresholdSeen,
} from "@/stores/user"

interface StackItem {
  url: string
  index: number
  state?: unknown
}

export const Router = () => {
  const {stack, currentIndex, replace} = useNavigation()

  const hasSeenThreshold = useHasSeenThreshold()
  const defaultRoom = useDefaultRoom()
  const isLoggedIn = useIsLoggedIn()
  const markThresholdSeen = useMarkThresholdSeen()

  const effectiveStack: StackItem[] = stack.length > 0 ? stack : [{url: "/", index: 0}]

  useEffect(() => {
    const currentUrl = effectiveStack[currentIndex]?.url || "/"

    if (!hasSeenThreshold && currentUrl === "/") {
      replace("/")
      markThresholdSeen()
      return
    }

    if (hasSeenThreshold && isLoggedIn && currentUrl === "/") {
      const isDesktop = window.innerWidth >= 1200
      const targetUrl = isDesktop ? "/room/square" : `/room/${defaultRoom}`
      replace(targetUrl)
    }
  }, [
    hasSeenThreshold,
    isLoggedIn,
    defaultRoom,
    currentIndex,
    effectiveStack,
    replace,
    markThresholdSeen,
  ])

  return (
    <>
      {effectiveStack.map((item, index) => {
        let matchedRoute = null
        let params: Record<string, string> = {}
        let basePath = ""

        if (item.url === "/" && !hasSeenThreshold) {
          matchedRoute = {component: Threshold}
        } else {
          for (const route of routes) {
            const match = matchPath(item.url, route.path)
            if (match) {
              matchedRoute = route
              params = match.params
              if (route.path.endsWith("/*")) {
                basePath = route.path.slice(0, -2)
              }
              break
            }
          }
        }

        const RouteComponent = matchedRoute?.component || Threshold

        const routeKey =
          "state" in item && item.state ? `stack-${item.index}` : `url-${item.url}`

        return (
          <div
            key={routeKey}
            style={{
              display: index === currentIndex ? "flex" : "none",
              flexDirection: "column",
              flex: 1,
              minHeight: 0,
            }}
          >
            <RouteProvider params={params} url={item.url}>
              <RouteBaseContext.Provider value={basePath}>
                <ErrorBoundary>
                  <Suspense fallback={<LoadingFallback />}>
                    <RouteComponent {...params} />
                  </Suspense>
                </ErrorBoundary>
              </RouteBaseContext.Provider>
            </RouteProvider>
          </div>
        )
      })}
    </>
  )
}
