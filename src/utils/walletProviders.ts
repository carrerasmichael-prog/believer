import {initializeNWC} from "@/utils/npubcash"
import {useUserStore} from "@/stores/user"

export async function initializeWalletProvider() {
  console.log("🔍 Initializing providers...")
  const state = useUserStore.getState()
  const connectionId = `nwc_${Date.now()}_${Math.random().toString(36).slice(2)}`
  const relayUrls = state.relays

  console.log("🔍 Checking conditions for NWC init:", {hasPubkey: !!state.publicKey})

  if (!state.publicKey) {
    console.error("🔍 No public key, skipping NWC init")
    return false
  }

  console.log("🔍 Initializing active NWC connection:", connectionId)
  console.log("🔍 Available NWC connections:", [connectionId])

  const result = await initializeNWC({connectionId, relayUrls})
  console.log("🔍 NWC connection result:", result)
  console.log("🔍 Active wallet after connection:", result)

  return result
}
