import {Outlet, useLocation, useNavigate, useNavigationType} from "react-router"
import NoteCreator from "@/shared/components/create/NoteCreator.tsx"
import LoginDialog from "@/shared/components/user/LoginDialog"
import NavSideBar from "@/shared/components/nav/NavSideBar"
import {clearNotifications} from "@/utils/notifications"
import {socialGraphLoaded} from "@/utils/socialGraph"
import Modal from "@/shared/components/ui/Modal.tsx"
import Footer from "@/shared/components/Footer.tsx"
import {useSettingsStore} from "@/stores/settings"
import ErrorBoundary from "./ui/ErrorBoundary"
import {trackEvent} from "@/utils/IrisAPI"
import {useWalletProviderStore} from "@/stores/walletProvider"
import {useUIStore} from "@/stores/ui"
import {Helmet} from "react-helmet"
import {useEffect} from "react"

const openedAt = Math.floor(Date.now() / 1000)

interface ServiceWorkerMessage {
  type: "NAVIGATE_REACT_ROUTER"
  url: string
}

const Layout = () => {
  const newPostOpen = useUIStore((state) => state.newPostOpen)
  const setNewPostOpen = useUIStore((state) => state.setNewPostOpen)
  const {privacy} = useSettingsStore()
  const goToNotifications = useUIStore((state) => state.goToNotifications)
  const showLoginDialog = useUIStore((state) => state.showLoginDialog)
  const setShowLoginDialog = useUIStore((state) => state.setShowLoginDialog)
  const activeProviderType = useWalletProviderStore((state) => state.activeProviderType)
  const initializeProviders = useWalletProviderStore((state) => state.initializeProviders)
  const navigate = useNavigate()
  const navigationType = useNavigationType()
  const location = useLocation()

  socialGraphLoaded.then() // just make sure we start loading social the graph

  // Initialize wallet providers on app startup
  useEffect(() => {
    console.log("🔍 Layout: Initializing wallet providers")
    initializeProviders()
  }, [initializeProviders])

  useEffect(() => {
    if (goToNotifications > openedAt) {
      navigate("/notifications")
    }
  }, [navigate, goToNotifications])

  useEffect(() => {
    if (navigationType === "PUSH") {
      window.scrollTo(0, 0)
    }

    const isMessagesRoute = location.pathname.startsWith("/chats/")
    const isSearchRoute = location.pathname.startsWith("/search/")
    if (
      CONFIG.features.analytics &&
      privacy.enableAnalytics &&
      !isMessagesRoute &&
      !isSearchRoute
    ) {
      trackEvent("pageview")
    }
  }, [location, navigationType])

  useEffect(() => {
    const handleServiceWorkerMessage = (event: MessageEvent<ServiceWorkerMessage>) => {
      if (event.data?.type === "NAVIGATE_REACT_ROUTER") {
        const url = new URL(event.data.url)
        if (url.pathname.match(/^\/chats\/[^/]+$/)) {
          const chatId = url.pathname.split("/").pop()
          navigate("/chats/chat", {state: {id: chatId}})
        } else {
          navigate(url.pathname + url.search + url.hash)
        }
      }
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage)
      return () => {
        navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage)
      }
    }
  }, [navigate])

  useEffect(() => {
    // clear potential push notifications when the app is opened
    clearNotifications()

    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        await clearNotifications()
      }
    }

    const handleFocus = async () => {
      await clearNotifications()
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleFocus)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleFocus)
    }
  }, [])

  return (
    <div className="relative flex flex-col w-full max-w-screen-xl min-h-screen overscroll-none">
      <div
        className="flex relative min-h-screen flex-1 overscroll-none"
        id="main-content"
      >
        <NavSideBar />
        <div className="relative flex-1 min-h-screen py-16 md:py-0 overscroll-none mt-[env(safe-area-inset-top)] mb-[env(safe-area-inset-bottom)]">
          <ErrorBoundary>
            <Outlet />
            {activeProviderType !== "disabled" && (
              <iframe
                id="cashu-wallet"
                title="Background Cashu Wallet"
                src="/cashu/index.html#/"
                className="fixed top-0 left-0 w-0 h-0 border-none"
                style={{zIndex: -1}}
                referrerPolicy="no-referrer"
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            )}
          </ErrorBoundary>
        </div>
      </div>
      <ErrorBoundary>
        {newPostOpen && (
          <Modal onClose={() => setNewPostOpen(false)} hasBackground={false}>
            <div
              className="w-full max-w-prose rounded-2xl bg-base-100"
              onClick={(e) => e.stopPropagation()}
            >
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
      <Helmet titleTemplate={`%s / ${CONFIG.appName}`} defaultTitle={CONFIG.appName}>
        <title>{CONFIG.appName}</title>
      </Helmet>
    </div>
  )
}

export default Layout
