import "@/index.css"
import { NavigationProvider, Router } from "@/navigation"
import { useUserStore } from "./stores/user"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { subscribeToDMNotifications, subscribeToNotifications } from "./utils/notifications"
import { migratePublicChats } from "./utils/migration"
import pushNotifications from "./utils/pushNotifications"
import { useSettingsStore } from "@/stores/settings"
import { ndk } from "./utils/ndk"
import socialGraph from "./utils/socialGraph"
import DebugManager from "./utils/DebugManager"
import Layout from "@/shared/components/Layout"
import { usePrivateMessagesStore } from "./stores/privateMessages"
import { getSessionManager } from "./shared/services/PrivateChats"
import { getTag } from "./utils/tagUtils"


let unsubscribeSessionEvents: (() => void) | null = null

// BLOCK WALLET EXTENSIONS FROM AUTO-LAUNCHING TWICE
// Runs FIRST — before ndk(), stores, or anything else
;(() => {
  // ───── 1. Block Alby (most aggressive) ─────
  interface AlbyWallet {
    enable?: () => Promise<unknown>
    getBalance?: () => Promise<unknown>
    makeInvoice?: () => Promise<unknown>
    sendPayment?: () => Promise<unknown>
    sendPaymentAsync?: () => Promise<unknown>
  }

  if ("alby" in window && window.alby && typeof window.alby === "object") {
    console.log("Blocking Alby auto-popup")
    const alby = window.alby as AlbyWallet

    alby.enable = () => {
      console.log("Alby enable() blocked — only Believer controls login")
      return Promise.resolve({ enabled: false })
    }
    alby.getBalance = () => Promise.resolve({ balance: 0 })
    alby.makeInvoice = () => Promise.reject("blocked")
    alby.sendPayment = () => Promise.reject("blocked")
    alby.sendPaymentAsync = () => Promise.reject("blocked")
  }

  // ───── 2. Block any NIP-07 extension (Nos2x, etc.) from auto-calling enable() ─────
  interface Nip07Extension {
    enable?: () => Promise<unknown>
  }

  const nostrExtension = window.nostr as Nip07Extension | undefined

  if (nostrExtension?.enable) {
    const realEnable = nostrExtension.enable.bind(nostrExtension)

    nostrExtension.enable = async () => {
      console.log("Blocked auto wallet enable() from browser extension")
      // We silently succeed here — your real login flow will call it again later
      return realEnable()
    }
  }
})()

const attachSessionEventListener = () => {
  try {
    const sessionManager = getSessionManager()
    if (!sessionManager) {
      console.error("Session manager not available")
      return
    }
    void sessionManager.init().then(() => {
      unsubscribeSessionEvents?.()
      unsubscribeSessionEvents = sessionManager.onEvent((event, pubKey) => {
        const { publicKey } = useUserStore.getState()
        if (!publicKey) return

        const pTag = getTag("p", event.tags)
        if (!pTag) return

        const from = pubKey === publicKey ? pTag : pubKey
        const to = pubKey === publicKey ? publicKey : pTag
        if (!from || !to) return

        void usePrivateMessagesStore.getState().upsert(from, to, event)
      })
    }).catch((error) => {
      console.error("Failed to initialize session manager:", error)
    })
  } catch (error) {
    console.error("Failed to attach session event listener", error)
  }
}

// Initialize app
const initializeApp = () => {
  const ndkInstance = ndk()
  ndkInstance.connect().catch((e) => console.error("NDK connect error:", e))

  DebugManager

  const state = useUserStore.getState()
  if (state.publicKey) {
    console.log("Initializing chat modules with existing user data")
    subscribeToNotifications()
    subscribeToDMNotifications()
    migratePublicChats()
    socialGraph().recalculateFollowDistances()

    if (window.__TAURI__) {
      pushNotifications.init().catch(console.error)
    }

    if (state.privateKey || state.nip07Login) {
      attachSessionEventListener()
    }
  }

  document.title = "Believer"

  // Theme
  const storedTheme = localStorage.getItem("theme")
  const { appearance } = useSettingsStore.getState()
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
  const initialTheme = storedTheme || appearance.theme || (systemPrefersDark ? "dark" : "light")
  document.documentElement.setAttribute("data-theme", initialTheme)
  document.documentElement.classList.toggle("dark", initialTheme === "dark")
}

initializeApp()

const root = ReactDOM.createRoot(document.getElementById("root")!)

root.render(
  <BrowserRouter>
    <NavigationProvider>
      <Layout>
        <Router />
      </Layout>
    </NavigationProvider>
  </BrowserRouter>
)

// Store subscriptions
const unsubscribeUser = useUserStore.subscribe((state, prevState) => {
  if (state.publicKey && state.publicKey !== prevState.publicKey) {
    console.log("Public key changed, initializing chat modules")
    subscribeToNotifications()
    subscribeToDMNotifications()
    migratePublicChats()

    if (state.privateKey || state.nip07Login) {
      attachSessionEventListener()
    }
  }
})

const unsubscribeTheme = useSettingsStore.subscribe((state) => {
  if (typeof state.appearance.theme === "string") {
    document.documentElement.setAttribute("data-theme", state.appearance.theme)
    document.documentElement.classList.toggle("dark", state.appearance.theme === "dark")
    localStorage.setItem("theme", state.appearance.theme)
  }
})

// Prevent flash of wrong theme
const applyInitialTheme = () => {
  const storedTheme = localStorage.getItem("theme")
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
  const theme = storedTheme || (systemPrefersDark ? "dark" : "light")
  document.documentElement.setAttribute("data-theme", theme)
  document.documentElement.classList.toggle("dark", theme === "dark")
}
applyInitialTheme()

// HMR
if (import.meta.hot) {
  import.meta.hot.accept()
  import.meta.hot.dispose(() => {
    unsubscribeUser()
    unsubscribeTheme()
    unsubscribeSessionEvents?.()
  })
}