import NDK, {
  NDKConstructorParams,
  NDKNip07Signer,
  NDKPrivateKeySigner,
  NDKRelay,
  NDKRelayAuthPolicies,
  NDKUser,
} from "@nostr-dev-kit/ndk"
import {useUserStore} from "@/stores/user"
import {DEFAULT_RELAYS} from "@/shared/constants/relays"

let ndkInstance: NDK | null = null
let privateKeySigner: NDKPrivateKeySigner | undefined
let nip07Signer: NDKNip07Signer | undefined

function normalizeRelayUrl(url: string): string {
  return url.endsWith("/") ? url : url + "/"
}

export {DEFAULT_RELAYS}

export const ndk = (opts?: NDKConstructorParams): NDK => {
  if (!ndkInstance) {
    const store = useUserStore.getState()
    const relays = opts?.explicitRelayUrls || store.relays

    if (import.meta.env.VITE_USE_TEST_RELAY) {
      console.log("Using test relay only: wss://temp.iris.to/")
    }

    const options: NDKConstructorParams = {
      explicitRelayUrls: relays,
      enableOutboxModel: import.meta.env.VITE_USE_LOCAL_RELAY
        ? false
        : store.ndkOutboxModel,
    }

    ndkInstance = new NDK(options)

    // FIX #1: Apply timeout to all existing relays
    ndkInstance.pool.relays.forEach((relay) => {
      ;(relay as any).connectTimeout = 8000
      ;(relay as any).reconnect = true
    })

    // Apply timeout to every relay that starts connecting (correct event name for current NDK versions)
    ndkInstance.pool.on("relay:connecting", (relay: NDKRelay) => {
      ;(relay as any).connectTimeout = 8000 // 8-second connect timeout
      ;(relay as any).reconnect = true // keep trying if it fails
    })

    // Signer setup (unchanged)
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
    ndkInstance.relayAuthDefaultPolicy = NDKRelayAuthPolicies.signIn({ndk: ndkInstance})

    // FIX #3: Safe global connect with 9-second fallback
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
// Everything below is YOUR original code — unchanged except one tiny line
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
    if (event.persisted) {
      handleVisibilityChange()
    }
  })

  window.addEventListener("focus", () => {
    if (wasHidden) {
      handleVisibilityChange()
    }
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
        nip07Signer
          .user()
          .then((user) => {
            useUserStore.getState().setPublicKey(user.pubkey)
          })
          .catch((e) => {
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
          : state.relays.map((url) => ({url}))

      if (Array.isArray(relayList)) {
        const normalizedPoolUrls = Array.from(instance.pool.relays.keys()).map(
          normalizeRelayUrl
        )

        relayList.forEach((config) => {
          const relayConfig = typeof config === "string" ? {url: config} : config
          const isEnabled = !("disabled" in relayConfig) || !relayConfig.disabled
          const normalizedUrl = normalizeRelayUrl(relayConfig.url)
          const existsInPool = normalizedPoolUrls.includes(normalizedUrl)

          if (isEnabled && !existsInPool) {
            const relay = new NDKRelay(relayConfig.url, undefined, instance)
            // This one tiny addition → fixes new relays too
            ;(relay as any).connectTimeout = 8000
            ;(relay as any).reconnect = true
            instance.pool.addRelay(relay)
            relay.connect()
          } else if (!isEnabled && existsInPool) {
            const relay =
              instance.pool.relays.get(relayConfig.url) ||
              instance.pool.relays.get(normalizedUrl)
            if (relay) {
              relay.disconnect()
            }
          } else if (isEnabled && existsInPool) {
            const relay =
              instance.pool.relays.get(relayConfig.url) ||
              instance.pool.relays.get(normalizedUrl)
            if (relay && relay.status !== 1) {
              relay.connect()
            }
          }
        })
      }
    }

    if (state.publicKey !== prevState.publicKey) {
      instance.activeUser = state.publicKey
        ? new NDKUser({hexpubkey: state.publicKey})
        : undefined
    }
  })
}
