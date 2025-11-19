// src/utils/ndk.ts
import NDK, {
  NDKConstructorParams,
  NDKNip07Signer,
  NDKPrivateKeySigner,
  NDKRelay,
  NDKRelayAuthPolicies,
  NDKUser,
} from "@nostr-dev-kit/ndk"
import { useUserStore } from "@/stores/user"
import { DEFAULT_RELAYS } from "@/shared/constants/relays"

// Extend the relay type so TypeScript knows about the private properties NDK uses
type NDKRelayWithTimeouts = NDKRelay & {
  connectTimeout?: number
  reconnect?: boolean
}

// ←←← MOVED HERE — now in scope for the entire file
const applyTimeouts = (relay: NDKRelay) => {
  const r = relay as NDKRelayWithTimeouts
  r.connectTimeout = 8000
  r.reconnect = true
}

let ndkInstance: NDK | null = null
let privateKeySigner: NDKPrivateKeySigner | undefined
let nip07Signer: NDKNip07Signer | undefined

function normalizeRelayUrl(url: string): string {
  return url.endsWith("/") ? url : url + "/"
}

export { DEFAULT_RELAYS }

export const ndk = (opts?: NDKConstructorParams): NDK => {
  if (!ndkInstance) {
    const store = useUserStore.getState()

    // CRITICAL FIX: proper fallback chain
    const relays =
      opts?.explicitRelayUrls ||
      (store.relays && store.relays.length > 0 ? store.relays : DEFAULT_RELAYS)

    if (import.meta.env.VITE_USE_TEST_RELAY === "true") {
      console.warn("WARNING: Using test relay only: wss://temp.iris.to/")
    }

    const options: NDKConstructorParams = {
      explicitRelayUrls: relays,
      enableOutboxModel: import.meta.env.VITE_USE_LOCAL_RELAY === "true" ? false : store.ndkOutboxModel,
    }

    ndkInstance = new NDK(options)

    // Apply to already-added relays
    ndkInstance.pool.relays.forEach((relay) => applyTimeouts(relay))

    // Apply to every future relay
    ndkInstance.pool.on("relay:connecting", (relay: NDKRelay) => {
      applyTimeouts(relay)
    })

    // ───── Signer setup (unchanged) ─────
    if (store.privateKey && typeof store.privateKey === "string") {
      try {
        privateKeySigner = new NDKPrivateKeySigner(store.privateKey)
        if (!store.nip07Login) {
          ndkInstance.signer = privateKeySigner
        }
      } catch (e) {
        console.error("Error setting initial private key signer:", e)
      }
    }

    if (store.nip07Login) {
      nip07Signer = new NDKNip07Signer()
      ndkInstance.signer = nip07Signer
    }

    watchLocalSettings(ndkInstance)
    ndkInstance.relayAuthDefaultPolicy = NDKRelayAuthPolicies.signIn({ ndk: ndkInstance })

    ndkInstance.connect(9000).catch((e) => {
      console.info("NDK: Some relays timed out – continuing with connected ones", e)
    })

    setupVisibilityReconnection(ndkInstance)
    console.log("NDK instance initialized with timeout protection", ndkInstance)
  } else if (opts) {
    throw new Error("NDK instance already initialized, cannot pass options")
  }
  return ndkInstance
}

// ——————————————————————————————————————
// Everything below unchanged
// ——————————————————————————————————————

function setupVisibilityReconnection(instance: NDK) {
  let wasHidden = false

  const handleVisibilityChange = () => {
    if (document.hidden) {
      wasHidden = true
      return
    }
    if (wasHidden) {
      wasHidden = false
      console.log("PWA returned to foreground, checking relay connections...")
      for (const relay of instance.pool.relays.values()) {
        if (relay.status !== 1) {
          console.log(`Forcing reconnection to ${relay.url}`)
          relay.connect()
        }
      }
    }
  }

  document.addEventListener("visibilitychange", handleVisibilityChange)
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) handleVisibilityChange()
  })
  window.addEventListener("focus", () => {
    if (wasHidden) handleVisibilityChange()
  })
}

function recreateNDKInstance() {
  if (ndkInstance) {
    for (const relay of ndkInstance.pool.relays.values()) {
      relay.disconnect()
    }
    ndkInstance = null
    privateKeySigner = undefined
    nip07Signer = undefined
  }
  ndk()
}

function watchLocalSettings(instance: NDK) {
  useUserStore.subscribe((state, prevState) => {
    if (state.ndkOutboxModel !== prevState.ndkOutboxModel) {
      console.log("NDK outbox model setting changed, recreating NDK instance")
      recreateNDKInstance()
      return
    }

    if (state.privateKey !== prevState.privateKey) {
      const havePrivateKey = state.privateKey && typeof state.privateKey === "string"
      if (havePrivateKey) {
        try {
          privateKeySigner = new NDKPrivateKeySigner(state.privateKey)
          if (!state.nip07Login) {
            instance.signer = privateKeySigner
          }
        } catch (e) {
          console.error("Error setting private key signer:", e)
        }
      } else {
        privateKeySigner = undefined
        if (!state.nip07Login) {
          instance.signer = undefined
        }
      }
    }

    if (state.nip07Login) {
      if (!nip07Signer) {
        nip07Signer = new NDKNip07Signer()
        instance.signer = nip07Signer
        nip07Signer.user().then((user) => {
          useUserStore.getState().setPublicKey(user.pubkey)
        }).catch((e) => {
          console.error("Error getting NIP-07 user:", e)
          useUserStore.getState().setNip07Login(false)
        })
      }
    } else {
      nip07Signer = undefined
      instance.signer = privateKeySigner
    }

    const shouldUpdateRelays =
      state.relays !== prevState.relays || state.relayConfigs !== prevState.relayConfigs

    if (shouldUpdateRelays) {
      const relayList =
        state.relayConfigs && state.relayConfigs.length > 0
          ? state.relayConfigs
          : state.relays.map((url) => ({ url }))

      if (Array.isArray(relayList)) {
        const normalizedPoolUrls = Array.from(instance.pool.relays.keys()).map(normalizeRelayUrl)

        relayList.forEach((config) => {
          const relayConfig = typeof config === "string" ? { url: config } : config
          const isEnabled = !("disabled" in relayConfig) || !relayConfig.disabled
          const normalizedUrl = normalizeRelayUrl(relayConfig.url)
          const existsInPool = normalizedPoolUrls.includes(normalizedUrl)

          if (isEnabled && !existsInPool) {
            const relay = new NDKRelay(relayConfig.url, undefined, instance)
            applyTimeouts(relay)   // ← now perfectly in scope
            instance.pool.addRelay(relay)
            relay.connect()
          } else if (!isEnabled && existsInPool) {
            const relay = instance.pool.relays.get(relayConfig.url) || instance.pool.relays.get(normalizedUrl)
            relay?.disconnect()
          } else if (isEnabled && existsInPool) {
            const relay = instance.pool.relays.get(relayConfig.url) || instance.pool.relays.get(normalizedUrl)
            if (relay && relay.status !== 1) {
              relay.connect()
            }
          }
        })
      }
    }

    if (state.publicKey !== prevState.publicKey) {
      instance.activeUser = state.publicKey
        ? new NDKUser({ hexpubkey: state.publicKey })
        : undefined
    }
  })
}