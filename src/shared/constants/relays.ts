// src/shared/constants/relays.ts

const LOCAL_RELAY = ["ws://localhost:7777"]
const TEST_RELAY = ["wss://temp.iris.to/"]

// NOVEMBER 2025 – only fast, reliable relays
const PRODUCTION_RELAYS = [
  "wss://relay.damus.io",
  "wss://relay.nostr.band",
  "wss://relay.snort.social",
  "wss://nostr.wine",
  "wss://brb.io", // ultra-fast paid relay (free tier is great)
  "wss://nos.lol", // official replacement for relay.nos.lol
  "wss://nostr.rocks", // super fast public relay
  "wss://relayable.org", // high-uptime community relay
] satisfies string[]

function getDefaultRelays() {
  if (
    import.meta.env.VITE_USE_LOCAL_RELAY === "true" ||
    import.meta.env.VITE_USE_LOCAL_RELAY === true
  ) {
    return LOCAL_RELAY
  }
  if (
    import.meta.env.VITE_USE_TEST_RELAY === "true" ||
    import.meta.env.VITE_USE_TEST_RELAY === true
  ) {
    console.warn("USING TEST relay — only for debugging Iris.to features")
    return TEST_RELAY
  }
  return PRODUCTION_RELAYS
}

export const DEFAULT_RELAYS = getDefaultRelays()
export {PRODUCTION_RELAYS}
