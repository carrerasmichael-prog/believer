// src/shared/components/Layout.tsx
import { useLocation, useNavigate } from "@/navigation"
import { getCurrentRouteInfo } from "@/navigation/utils"
import NoteCreator from "@/shared/components/create/NoteCreator.tsx"
import LoginDialog from "@/shared/components/user/LoginDialog"
import NavSideBar from "@/shared/components/nav/NavSideBar"
import { clearNotifications } from "@/utils/notifications"
import Modal from "@/shared/components/ui/Modal.tsx"
import Footer from "@/shared/components/Footer.tsx"
import { useSettingsStore } from "@/stores/settings"
import ErrorBoundary from "./ui/ErrorBoundary"
import { useWalletProviderStore } from "@/stores/walletProvider"
import { useUIStore } from "@/stores/ui"
import { Helmet } from "react-helmet"
import { useEffect, ReactNode, useRef, useMemo, useState } from "react"
import HomeFeed from "@/pages/home/feed/components/HomeFeed"
import UnifiedSearchContent from "@/shared/components/search/UnifiedSearchContent"
import { ScrollProvider } from "@/contexts/ScrollContext"
import Header from "@/shared/components/header/Header"
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react"
import useFollows from "@/shared/hooks/useFollows"
import { usePublicKey } from "@/stores/user"
import { useFeedStore, useEnabledFeedIds, type FeedConfig } from "@/stores/feed"

const openedAt = Math.floor(Date.now() / 1000)

const Layout = ({ children }: { children: ReactNode }) => {
  const middleColumnRef = useRef<HTMLDivElement>(null)
  const newPostOpen = useUIStore(s => s.newPostOpen)
  const setNewPostOpen = useUIStore(s => s.setNewPostOpen)
  const navItemClicked = useUIStore(s => s.navItemClicked)
  const { appearance, updateAppearance } = useSettingsStore()
  const goToNotifications = useUIStore(s => s.goToNotifications)
  const showLoginDialog = useUIStore(s => s.showLoginDialog)
  const setShowLoginDialog = useUIStore(s => s.setShowLoginDialog)
  const initializeProviders = useWalletProviderStore(s => s.initializeProviders)
  const navigate = useNavigate()
  const location = useLocation()

  // THIS IS THE ONLY THING THAT MATTERS — REAL STATE
  const [width, setWidth] = useState(1200)
  useEffect(() => {
    const update = () => setWidth(window.innerWidth)
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  const isLargeScreen = width >= 1200
  const isTwoColumnLayout = !appearance.singleColumnLayout && isLargeScreen
  const isInRoom = location.pathname.startsWith("/room/")
  const isLanding = location.pathname === "/"

  const [middleColumnContent, setMiddleColumnContent] = useState<"home" | "search">("home")
  const [lastSearchRoute, setLastSearchRoute] = useState("/u")

  const myPubKey = usePublicKey()
  const follows = useFollows(myPubKey, true)
  const { activeFeed, getAllFeedConfigs, loadFeedConfig } = useFeedStore()
  const enabledFeedIds = useEnabledFeedIds()

  const allFeeds = useMemo(() => getAllFeedConfigs(), [getAllFeedConfigs])
  const feeds = useMemo(() => {
    const map = new Map(allFeeds.map(f => [f.id, f]))
    return enabledFeedIds
      .map(id => map.get(id))
      .filter((f): f is FeedConfig => f !== undefined)
  }, [allFeeds, enabledFeedIds])
  const activeFeedItem = useMemo(() => feeds.find(f => f.id === activeFeed) || feeds[0] || null, [feeds, activeFeed])
  const activeFeedConfig = useMemo(() => loadFeedConfig(activeFeed), [loadFeedConfig, activeFeed])
  const feedName = follows.length <= 1 ? "Home" : activeFeedConfig?.customName || activeFeedItem?.name || "Following"

  const middleColumnTitle = middleColumnContent === "home" ? feedName : lastSearchRoute.startsWith("/map") ? "Map" : lastSearchRoute.startsWith("/relay") ? "Relay" : lastSearchRoute.startsWith("/u") ? "People" : lastSearchRoute.startsWith("/search") ? "Search" : lastSearchRoute.startsWith("/m") ? "Market" : "Search"

  const shouldShowMainFeed = isTwoColumnLayout && isLargeScreen && !isLanding && !location.pathname.startsWith("/settings") && !location.pathname.startsWith("/chats") && !isInRoom

  useEffect(() => { initializeProviders() }, [initializeProviders])

  useEffect(() => {
    if (navItemClicked.signal === 0 || !shouldShowMainFeed) return
    if (navItemClicked.path === "/") {
      setMiddleColumnContent("home")
      middleColumnRef.current?.scrollTo({ top: 0, behavior: "instant" })
    } else if (["/u", "/search", "/m", "/map", "/relay"].includes(navItemClicked.path)) {
      setLastSearchRoute(navItemClicked.path)
      setMiddleColumnContent("search")
      middleColumnRef.current?.scrollTo({ top: 0, behavior: "instant" })
    }
  }, [navItemClicked, shouldShowMainFeed])

  useEffect(() => {
    if (!shouldShowMainFeed) return
    const routeInfo = getCurrentRouteInfo(location.pathname)
    if (routeInfo.type === "home") setMiddleColumnContent("home")
    else if (routeInfo.baseRoute) {
      setLastSearchRoute(routeInfo.baseRoute)
      setMiddleColumnContent("search")
    }
  }, [location.pathname, shouldShowMainFeed])

  useEffect(() => { if (goToNotifications > openedAt) navigate("/notifications") }, [navigate, goToNotifications])

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "NAVIGATE_REACT_ROUTER") {
        const url = new URL(e.data.url)
        if (url.pathname.match(/^\/chats\/[^/]+$/)) {
          navigate("/chats/chat", { state: { id: url.pathname.split("/").pop() } })
        } else {
          navigate(url.pathname + url.search + url.hash)
        }
      }
    }
    navigator.serviceWorker?.addEventListener("message", handler)
    return () => navigator.serviceWorker?.removeEventListener("message", handler)
  }, [navigate])

  useEffect(() => {
    clearNotifications()
    const onVis = () => document.visibilityState === "visible" && clearNotifications()
    const onFocus = () => clearNotifications()
    document.addEventListener("visibilitychange", onVis)
    window.addEventListener("focus", onFocus)
    return () => {
      document.removeEventListener("visibilitychange", onVis)
      window.removeEventListener("focus", onFocus)
    }
  }, [])

  return (
    <div className={`relative flex flex-col w-full min-h-screen ${appearance.limitedMaxWidth ? "max-w-screen-2xl mx-auto" : ""}`}>
      <div className="flex relative flex-1 min-w-0 w-full" id="main-content">
        <NavSideBar />

        {!appearance.singleColumnLayout && isLargeScreen && !isLanding && shouldShowMainFeed && (
          <div className="flex-1 min-w-0 border-r border-base-300 flex flex-col hidden xl:flex">
            <Header showBack={false} showNotifications={true}>
              <div className="flex items-center justify-between w-full">
                <span className="md:px-3 md:py-2">{middleColumnTitle}</span>
                <button
                  className="p-2 bg-base-100 hover:bg-base-200 rounded-full transition-colors mt-1"
                  onClick={() => updateAppearance({ singleColumnLayout: !appearance.singleColumnLayout })}
                >
                  {appearance.singleColumnLayout ? <RiArrowLeftSLine className="w-5 h-5" /> : <RiArrowRightSLine className="w-5 h-5" />}
                </button>
              </div>
            </Header>
            <div ref={middleColumnRef} className="flex-1 overflow-y-scroll overflow-x-hidden scrollbar-hide">
              {middleColumnContent === "home" ? (
                <ScrollProvider scrollContainerRef={middleColumnRef}>
                  <HomeFeed />
                </ScrollProvider>
              ) : (
                <UnifiedSearchContent searchRoute={lastSearchRoute} />
              )}
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <div className={`flex-1 flex flex-col min-h-0 overflow-auto ${!isLargeScreen && isLanding ? "landing-fullscreen pb-mobile-nav" : ""}`}>
            {children}
          </div>

          {useWalletProviderStore.getState().activeProviderType !== "disabled" && (
            <iframe
              id="cashu-wallet"
              title="Background Cashu Wallet"
              src="/cashu/index.html#/"
              className="fixed top-0 left-0 w-0 h-0 border-none"
              style={{ zIndex: -1 }}
              referrerPolicy="no-referrer"
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          )}
        </div>
      </div>

      <ErrorBoundary>
        {newPostOpen && (
          <Modal onClose={() => setNewPostOpen(false)} hasBackground={false}>
            <div className="w-[600px] max-w-[90vw] rounded-2xl bg-base-100" onClick={e => e.stopPropagation()}>
              <NoteCreator handleClose={() => setNewPostOpen(false)} />
            </div>
          </Modal>
        )}
        {showLoginDialog && (
          <Modal onClose={() => setShowLoginDialog(false)}>
            <LoginDialog />
          </Modal>
        )}
      </ErrorBoundary>

      <Footer />
      <Helmet><title>Believer</title></Helmet>
    </div>
  )
}

export default Layout