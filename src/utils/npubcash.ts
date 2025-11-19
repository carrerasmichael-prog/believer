// src/utils/npubcash.ts
import NDK, { NDKEvent, NDKRelaySet } from "@nostr-dev-kit/ndk"
import { useUserStore } from "@/stores/user"

// This wallet class is used by walletProvider.ts
export class SimpleNWCWallet {
  private ndk: NDK
  private connectionId: string
  private relayUrls: string[]
  private pubkey: string

  constructor(params: {
    ndk: NDK
    connectionId: string
    relayUrls: string[]
    pubkey: string
  }) {
    this.ndk = params.ndk
    this.connectionId = params.connectionId
    this.relayUrls = params.relayUrls
    this.pubkey = params.pubkey
  }

  async connect(): Promise<void> {
    console.log("Connecting NWC:", this.connectionId)
    const relaySet = NDKRelaySet.fromRelayUrls(this.relayUrls, this.ndk)

    await this.ndk.connect().catch((e: unknown) =>
      console.error("NWC connect error:", e)
    )
    console.log("NWC: Connected to relays", this.relayUrls)

    const sub = this.ndk.subscribe(
      {
        kinds: [23195], // NIP-47 response kind
        authors: [this.pubkey],
        "#p": [useUserStore.getState().publicKey || ""],
      },
      { subId: `nwc-response-${this.connectionId}` },
      relaySet
    )

    sub.on("event", (event: NDKEvent) => {
      console.log("NWC: Received response", event)
    })

    sub.on("eose", () => {
      console.log("NWC: All relays have reached the end of the event stream")
    })
  }
}

// This function is ONLY used to create the wallet instance
// walletProvider.ts will store it and call .connect() when needed
// We return the wallet so walletProvider can save it
export async function initializeNWC(params: {
  connectionId: string
  relayUrls: string[]
}): Promise<SimpleNWCWallet | null> {
  const { connectionId, relayUrls } = params
  const pubkey = useUserStore.getState().publicKey

  if (!pubkey) {
    console.error("NWC: No public key available")
    return null
  }

  try {
    const ndkInstance = new NDK({
      explicitRelayUrls: relayUrls,
    })

    const wallet = new SimpleNWCWallet({
      ndk: ndkInstance,
      connectionId,
      relayUrls,
      pubkey,
    })

    console.log("NWC wallet created successfully:", connectionId)
    return wallet  // walletProvider.ts will store this
  } catch (error) {
    console.error("NWC initialization failed:", error)
    return null
  }
}