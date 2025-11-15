// src/stores/user.ts
import { getDefaultServers } from "@/pages/settings/mediaservers-utils"
import { create } from "zustand"
import { DEFAULT_RELAYS } from "@/shared/constants/relays"
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

  // Identity
  identity: UserIdentity

  // Computed
  isLoggedIn: boolean
  hasSeenThreshold: boolean

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

  // Identity + kind:0
  setIdentity: (identity: Partial<UserIdentity>) => void
  syncKind0: (ndk: any) => Promise<void>
  markThresholdSeen: () => void
}

let hydrationPromise: Promise<void> | null = null
let resolveHydration: (() => void) | null = null

export const useUserStore = create<UserState>()((set, get) => {
  const initialState = {
    publicKey: "",
    privateKey: "",
    nip07Login: false,
    DHTPublicKey: "",
    DHTPrivateKey: "",
    relays: DEFAULT_RELAYS,
    relayConfigs: DEFAULT_RELAYS.map((url) => ({ url })),
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
      hasSeenThreshold: false
    } as UserIdentity,
    isLoggedIn: false,
    hasSeenThreshold: false,
  }

  const actions = {
    setPublicKey: (publicKey: string) => set({ 
      publicKey,
      isLoggedIn: publicKey !== ""
    }),
    setPrivateKey: (privateKey: string) => set({ privateKey }),
    setNip07Login: (nip07Login: boolean) => set({ nip07Login }),
    setDHTPublicKey: (DHTPublicKey: string) => set({ DHTPublicKey }),
    setDHTPrivateKey: (DHTPrivateKey: string) => set({ DHTPrivateKey }),
    setRelays: (relays: string[]) => {
      set((state) => {
        const existingConfigs = new Map(state.relayConfigs.map((c) => [c.url, c]))
        const newConfigs = relays.map(
          (url) => existingConfigs.get(url) || { url }
        )
        return { relays, relayConfigs: newConfigs }
      })
    },
    setRelayConfigs: (configs: RelayConfig[]) => {
      const enabledRelays = configs.filter((c) => !c.disabled).map((c) => c.url)
      set({ relayConfigs: configs, relays: enabledRelays })
    },
    toggleRelayConnection: (url: string) => {
      set((state) => {
        const configs = state.relayConfigs.map((c) =>
          c.url === url ? { ...c, disabled: !c.disabled } : c
        )
        const enabledRelays = configs.filter((c) => !c.disabled).map((c) => c.url)
        return { relayConfigs: configs, relays: enabledRelays }
      })
    },
    addRelay: (url: string, disabled: boolean = false) => {
      set((state) => {
        if (state.relayConfigs.some((c) => c.url === url)) return state
        const newConfig = disabled ? { url, disabled } : { url }
        const configs = [...state.relayConfigs, newConfig]
        const enabledRelays = configs.filter((c) => !c.disabled).map((c) => c.url)
        return { relayConfigs: configs, relays: enabledRelays }
      })
    },
    removeRelay: (url: string) => {
      set((state) => {
        const configs = state.relayConfigs.filter((c) => c.url !== url)
        const enabledRelays = configs.filter((c) => !c.disabled).map((c) => c.url)
        return { relayConfigs: configs, relays: enabledRelays }
      })
    },
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
        if (!state.defaultMediaserver) {
          const defaults = getDefaultServers(isSubscriber)
          return {
            mediaservers: defaults,
            defaultMediaserver: defaults[0],
          }
        }
        return {}
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
      if (resolveHydration) {
        resolveHydration()
        resolveHydration = null
        hydrationPromise = null
      }
      set({ hasHydrated: true })
    },
    setIdentity: (updates: Partial<UserIdentity>) => set((state) => ({
      identity: { ...state.identity, ...updates }
    })),
    markThresholdSeen: () => set((state) => ({
      identity: { ...state.identity, hasSeenThreshold: true },
      hasSeenThreshold: true
    })),
    syncKind0: async (ndk: any) => {
      const { publicKey } = get()
      if (!publicKey || !ndk) return

      try {
        const user = new NDKUser({ pubkey: publicKey })
        user.ndk = ndk
        const profileEvent = await user.fetchProfile()

        if (profileEvent?.content) {
          let content: any = {}
          try {
            content = JSON.parse(profileEvent.content as string)
          } catch (e) {
            console.warn("Failed to parse kind:0 content", e)
          }

          const belief = content.belief ?? "nomad"
          const default_room = content.default_room ?? "square"

          set((state) => ({
            identity: {
              ...state.identity,
              state: belief.includes("Believer") ? "believer" : belief.toLowerCase() as any,
              room: belief.includes("Believer") ? belief.split(" in ")[1]?.toLowerCase() : undefined,
              default_room,
            }
          }))
        } else {
          const event = new NDKEvent(ndk)
          event.kind = 0
          event.content = JSON.stringify({
            name: "Nomad",
            belief: "Nomad",
            default_room: "square"
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
export const usePublicKey = () => useUserStore((state) => state.publicKey)
export const useIsLoggedIn = () => useUserStore((state) => state.isLoggedIn)
export const useHasSeenThreshold = () => useUserStore((state) => state.identity.hasSeenThreshold)
export const useDefaultRoom = () => useUserStore((state) => state.identity.default_room || "square")
export const useSetIdentity = () => useUserStore((state) => state.setIdentity)
export const useSyncKind0 = () => useUserStore((state) => state.syncKind0)
export const useMarkThresholdSeen = () => useUserStore((state) => state.markThresholdSeen)
export const useCompleteHydration = () => useUserStore((state) => state.completeHydration)