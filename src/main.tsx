import "@/index.css"

import {RouterProvider} from "react-router"
import {useUserStore} from "./stores/user"
import ReactDOM from "react-dom/client"

import {subscribeToDMNotifications, subscribeToNotifications} from "./utils/notifications"
import {migrateUserState, migratePublicChats} from "./utils/migration"
import {useSettingsStore} from "@/stores/settings"
import {useUserRecordsStore} from "@/stores/userRecords"
import {
  subscribeToOwnDeviceInvites,
  resetDeviceInvitesInitialization,
} from "@/stores/privateChats"
import {ndk} from "./utils/ndk"
import {router} from "@/pages"
import socialGraph from "./utils/socialGraph"
import DebugManager from "./utils/DebugManager"

ndk()

// Initialize debug system
DebugManager

// Initialize chat modules if we have a public key
const state = useUserStore.getState()
if (state.publicKey) {
  console.log("Initializing chat modules with existing user data")
  subscribeToNotifications()
  subscribeToDMNotifications()
  migratePublicChats()
  socialGraph().recalculateFollowDistances()
  useUserRecordsStore.getState().createDefaultInvites()
  subscribeToOwnDeviceInvites().catch(console.error)
}

document.title = CONFIG.appName

// Initialize theme from settings store
const {appearance} = useSettingsStore.getState()
document.documentElement.setAttribute(
  "data-theme",
  appearance.theme || CONFIG.defaultTheme
)

// Perform migration before rendering the app
migrateUserState()

ReactDOM.createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
)

// Subscribe to public key changes from the user store
useUserStore.subscribe((state) => {
  const prevPublicKey = localStorage.getItem("localState/user/publicKey")
  let parsedPrevKey = ""
  if (prevPublicKey) {
    try {
      const parsed = JSON.parse(prevPublicKey)
      parsedPrevKey =
        parsed && typeof parsed === "object" && "value" in parsed ? parsed.value : parsed
    } catch (e) {
      console.error("Error parsing prevPublicKey:", e)
    }
  }

  if (state.publicKey && state.publicKey !== parsedPrevKey) {
    console.log("Public key changed, initializing chat modules")
    resetDeviceInvitesInitialization() // Reset to allow re-initialization
    subscribeToNotifications()
    subscribeToDMNotifications()
    migratePublicChats()
    useUserRecordsStore.getState().createDefaultInvites()
    subscribeToOwnDeviceInvites().catch(console.error)
  }
})

// Subscribe to theme changes
useSettingsStore.subscribe((state) => {
  if (typeof state.appearance.theme === "string") {
    document.documentElement.setAttribute("data-theme", state.appearance.theme)
  }
})
