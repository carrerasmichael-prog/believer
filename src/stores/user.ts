// src/stores/user.ts
import { getDefaultServers } from "@/pages/settings/mediaservers-utils"
import { create } from "zustand"
import { PRODUCTION_RELAYS } from "@/shared/constants/relays"
import NDK from "@nostr-dev-kit/ndk"
import { NDKUser, NDKEvent } from "@nostr-dev-kit/ndk"

type MediaServerProtocol = "blossom" | "nip96"

interface MediaServer {
  url: string
  protocol: MediaServerProtocol
  isDefault?: boolean
}

export interface RelayConfig {
  url: string
  disabled?: boolean
}

export interface UserIdentity {
  state: "nomad" | "believer" | "atheist"
  room?: string
  default_room?: string
  hasSeenThreshold?: boolean
}

interface UserState {
  publicKey: string
  privateKey: string
  nip07Login: boolean
  DHTPublicKey: string
  DHTPrivateKey: string
  relays: string[]
  relayConfigs: RelayConfig[]
  mediaservers: MediaServer[]
  defaultMediaserver: MediaServer | null
  walletConnect: boolean
  defaultZapAmount: number
  defaultZapComment: string
  ndkOutboxModel: boolean
  hasHydrated: boolean

  identity: UserIdentity
  isLoggedIn: boolean
  hasSeenThreshold: boolean

  // Actions
  setPublicKey: (publicKey: string) => void
  setPrivateKey: (privateKey: string) => void
  setNip07Login: (nip07Login: boolean) => void
  setDHTPublicKey: (DHTPublicKey: string) => void
  setDHTPrivateKey: (DHTPrivateKey: string) => void
  setRelays: (relays: string[]) => void
  setRelayConfigs: (configs: RelayConfig[]) => void
  toggleRelayConnection: (url: string) => void
  addRelay: (url: string, disabled?: boolean) => void
  removeRelay: (url: string) => void
  setMediaservers: (mediaservers: MediaServer[]) => void
  setDefaultMediaserver: (server: MediaServer) => void
  addMediaserver: (server: MediaServer) => void
  removeMediaserver: (url: string) => void
  setWalletConnect: (walletConnect: boolean) => void
  setDefaultZapAmount: (defaultZapAmount: number) => void
  setDefaultZapComment: (defaultZapComment: string) => void
  setNdkOutboxModel: (ndkOutboxModel: boolean) => void
  reset: () => void
  ensureDefaultMediaserver: (isSubscriber: boolean) => void
  awaitHydration: () => Promise<void>
  completeHydration: () => void
  setIdentity: (identity: Partial<UserIdentity>) => void
  markThresholdSeen: () => void
  syncKind0: (ndk: NDK) => Promise<void>
}

let hydrationPromise: Promise<void> | null = null
let resolveHydration: (() => void) | null = null

// Permanently banish known-dead relays forever
const DEAD_RELAYS = [
  "wss://brb.io",
  "wss://nostr.rocks",
  "wss://relay.8333.space",
] as const

const filterDeadRelays = (relays: string[]): string[] =>
  relays.filter((r) => !DEAD_RELAYS.some((dead) => r.includes(dead)))

// Seed clean relays on first visit AND clean any old saved ones
const getInitialRelays = (): string[] => {
  const raw = localStorage.getItem("user-storage")
  if (raw) {
    try {
      const parsed = JSON.parse(raw)
      const state = parsed.state || parsed
      if (state.relays && Array.isArray(state.relays) && state.relays.length > 0) {
        // Clean any legacy dead relays from old users
        return filterDeadRelays(state.relays)
      }
    } catch (e) {
      console.warn("Failed to parse saved relays, using defaults")
    }
  }

  console.log("First-time user → seeding clean production relays")
  return filterDeadRelays(PRODUCTION_RELAYS)
}

export const useUserStore = create<UserState>()((set, get) => {
  const initialState = {
    publicKey: "",
    privateKey: "",
    nip07Login: false,
    DHTPublicKey: "",
    DHTPrivateKey: "",
    relays: getInitialRelays(),
    relayConfigs: getInitialRelays().map((url) => ({ url })),
    mediaservers: [],
    defaultMediaserver: null,
    walletConnect: false,
    defaultZapAmount: 0,
    defaultZapComment: "",
    ndkOutboxModel: !import.meta.env.VITE_USE_LOCAL_RELAY,
    hasHydrated: false,
    identity: {
      state: "nomad",
      default_room: "square",
      hasSeenThreshold: false,
    } as UserIdentity,
    isLoggedIn: false,
    hasSeenThreshold: false,
  }

  const actions = {
    setPublicKey: (publicKey: string) =>
      set({ publicKey, isLoggedIn: publicKey !== "" }),

    setPrivateKey: (privateKey: string) => set({ privateKey }),
    setNip07Login: (nip07Login: boolean) => set({ nip07Login }),
    setDHTPublicKey: (DHTPublicKey: string) => set({ DHTPublicKey }),
    setDHTPrivateKey: (DHTPrivateKey: string) => set({ DHTPrivateKey }),

    setRelays: (relays: string[]) => {
      const clean = filterDeadRelays(relays)
      set((state) => {
        const existing = new Map(state.relayConfigs.map((c) => [c.url, c]))
        const newConfigs = clean.map((url) => existing.get(url) || { url })
        return { relays: clean, relayConfigs: newConfigs }
      })
    },

    setRelayConfigs: (configs: RelayConfig[]) => {
      const cleanConfigs = configs.filter((c) => !DEAD_RELAYS.some((d) => c.url.includes(d)))
      const enabled = cleanConfigs.filter((c) => !c.disabled).map((c) => c.url)
      set({ relayConfigs: cleanConfigs, relays: enabled })
    },

    toggleRelayConnection: (url: string) => {
      if (DEAD_RELAYS.some((d) => url.includes(d))) return // silently ignore dead ones
      set((state) => {
        const configs = state.relayConfigs.map((c) =>
          c.url === url ? { ...c, disabled: !c.disabled } : c
        )
        const enabled = configs.filter((c) => !c.disabled).map((c) => c.url)
        return { relayConfigs: configs, relays: enabled }
      })
    },

    addRelay: (url: string, disabled = false) => {
      if (DEAD_RELAYS.some((d) => url.includes(d))) return // block adding dead relays
      set((state) => {
        if (state.relayConfigs.some((c) => c.url === url)) return state
        const newConfig = disabled ? { url, disabled } : { url }
        const configs = [...state.relayConfigs, newConfig]
        const enabled = configs.filter((c) => !c.disabled).map((c) => c.url)
        return { relayConfigs: configs, relays: enabled }
      })
    },

    removeRelay: (url: string) => {
      set((state) => {
        const configs = state.relayConfigs.filter((c) => c.url !== url)
        const enabled = configs.filter((c) => !c.disabled).map((c) => c.url)
        return { relayConfigs: configs, relays: enabled }
      })
    },

    // ... (all other actions unchanged – they’re already perfect)
    setMediaservers: (mediaservers: MediaServer[]) => set({ mediaservers }),
    setDefaultMediaserver: (server: MediaServer) => set({ defaultMediaserver: server }),
    addMediaserver: (server: MediaServer) =>
      set((state) => ({
        mediaservers: [...new Set([...state.mediaservers, server])],
      })),
    removeMediaserver: (url: string) =>
      set((state) => ({
        mediaservers: state.mediaservers.filter((s) => s.url !== url),
      })),
    setWalletConnect: (walletConnect: boolean) => set({ walletConnect }),
    setDefaultZapAmount: (defaultZapAmount: number) => set({ defaultZapAmount }),
    setDefaultZapComment: (defaultZapComment: string) => set({ defaultZapComment }),
    setNdkOutboxModel: (ndkOutboxModel: boolean) => set({ ndkOutboxModel }),
    reset: () => set(initialState),
    ensureDefaultMediaserver: (isSubscriber: boolean) =>
      set((state) => {
        if (state.defaultMediaserver) return {}
        const defaults = getDefaultServers(isSubscriber)
        return { mediaservers: defaults, defaultMediaserver: defaults[0] }
      }),
    awaitHydration: () => {
      if (get().hasHydrated) return Promise.resolve()
      if (!hydrationPromise) {
        hydrationPromise = new Promise<void>((resolve) => {
          resolveHydration = resolve
        })
      }
      return hydrationPromise
    },
    completeHydration: () => {
      resolveHydration?.()
      resolveHydration = null
      hydrationPromise = null
      set({ hasHydrated: true })
    },
    setIdentity: (updates: Partial<UserIdentity>) =>
      set((state) => ({
        identity: { ...state.identity, ...updates },
      })),
    markThresholdSeen: () =>
      set((state) => ({
        identity: { ...state.identity, hasSeenThreshold: true },
        hasSeenThreshold: true,
      })),
    syncKind0: async (ndk: NDK) => {
      const { publicKey } = get()
      if (!publicKey || !ndk) return

      try {
        const user = new NDKUser({ pubkey: publicKey })
        user.ndk = ndk
        const profileEvent = await user.fetchProfile()

        if (profileEvent?.content) {
          let parsedContent: Record<string, string> = {}
          try {
            parsedContent = JSON.parse(profileEvent.content as string)
          } catch (e) {
            console.warn("Failed to parse kind:0 content", e)
          }

          const belief = parsedContent.belief ?? "nomad"
          const default_room = parsedContent.default_room ?? "square"

          const newState: "nomad" | "believer" | "atheist" =
            belief.toLowerCase().includes("believer")
              ? "believer"
              : belief.toLowerCase().includes("atheist")
              ? "atheist"
              : "nomad"

          set((state) => ({
            identity: {
              ...state.identity,
              state: newState,
              room: newState === "believer" ? belief.split(" in ")[1]?.toLowerCase() : undefined,
              default_room,
            },
          }))
        } else {
          const event = new NDKEvent(ndk)
          event.kind = 0
          event.content = JSON.stringify({
            name: "Nomad",
            belief: "Nomad",
            default_room: "square",
          })
          await event.sign()
          await event.publish()
        }
      } catch (error) {
        console.warn("kind:0 sync failed:", error)
      }
    },
  }

  return {
    ...initialState,
    ...actions,
  }
})

// Export hooks
export const usePublicKey = () => useUserStore((s) => s.publicKey)
export const useIsLoggedIn = () => useUserStore((s) => s.isLoggedIn)
export const useHasSeenThreshold = () => useUserStore((s) => s.identity.hasSeenThreshold)
export const useDefaultRoom = () => useUserStore((s) => s.identity.default_room || "square")
export const useSetIdentity = () => useUserStore((s) => s.setIdentity)
export const useSyncKind0 = () => useUserStore((s) => s.syncKind0)
export const useMarkThresholdSeen = () => useUserStore((s) => s.markThresholdSeen)
export const useCompleteHydration = () => useUserStore((s) => s.completeHydration)
