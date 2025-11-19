// src/stores/walletProvider.ts
import {create} from "zustand"
import {persist} from "zustand/middleware"
import {SimpleWebLNWallet} from "@/utils/webln"
import {SimpleNWCWallet} from "@/utils/nwc"
import throttle from "lodash/throttle"
import {initializeNWC} from "@/utils/npubcash"

export type WalletProviderType = "native" | "nwc" | "disabled" | undefined

export interface NWCConnection {
  id: string
  name: string
  connectionString: string
  wallet?: SimpleNWCWallet
  lastUsed?: number
  balance?: number
  isLocalCashuWallet?: boolean
}

interface WalletProviderState {
  activeProviderType: WalletProviderType
  activeNWCId?: string
  nativeWallet: SimpleWebLNWallet | null
  activeWallet: SimpleWebLNWallet | SimpleNWCWallet | null
  nwcConnections: NWCConnection[]
  setActiveProviderType: (type: WalletProviderType) => void
  setActiveNWCId: (id: string) => void
  setNativeWallet: (wallet: SimpleWebLNWallet | null) => void
  setActiveWallet: (wallet: SimpleWebLNWallet | SimpleNWCWallet | null) => void
  addNWCConnection: (connection: Omit<NWCConnection, "id">) => string
  removeNWCConnection: (id: string) => void
  updateNWCConnection: (id: string, updates: Partial<NWCConnection>) => void
  connectToNWC: (id: string) => Promise<boolean>
  disconnectCurrentProvider: () => Promise<void>
  initializeProviders: () => Promise<void>
  refreshActiveProvider: () => Promise<void>
  startCashuNWCChecking: () => void
  checkCashuNWCConnection: () => boolean
  cleanup: () => void
  sendPayment: (invoice: string) => Promise<{preimage?: string}>
  createInvoice: (amount: number, description?: string) => Promise<{invoice: string}>
  getBalance: () => Promise<number | null | undefined>
  getInfo: () => Promise<Record<string, unknown> | null>
}

let isNWCInitialized: Record<string, boolean> = {}

export const useWalletProviderStore = create<WalletProviderState>()(
  persist(
    (set, get) => ({
      activeProviderType: undefined,
      activeNWCId: undefined,
      nativeWallet: null,
      activeWallet: null,
      nwcConnections: [],

      setActiveProviderType: (type: WalletProviderType) => {
        console.log("Setting active provider type to:", type)
        const prevType = get().activeProviderType
        console.log("Previous provider type was:", prevType)
        set({activeProviderType: type})
        get().refreshActiveProvider()
      },

      setActiveNWCId: (id: string) => {
        console.log("Setting active NWC ID to:", id)
        set({activeNWCId: id})
        get().refreshActiveProvider()
      },

      setNativeWallet: (wallet: SimpleWebLNWallet | null) => {
        set({nativeWallet: wallet})
        if (get().activeProviderType === "native") {
          set({activeWallet: wallet})
        }
      },

      setActiveWallet: (wallet: SimpleWebLNWallet | SimpleNWCWallet | null) => {
        set({activeWallet: wallet})
      },

      addNWCConnection: (connection: Omit<NWCConnection, "id">) => {
        const id = `nwc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const newConnection: NWCConnection = {
          ...connection,
          id,
          lastUsed: Date.now(),
        }

        set((state) => ({
          nwcConnections: [...state.nwcConnections, newConnection],
        }))

        return id
      },

      removeNWCConnection: (id: string) => {
        const state = get()
        if (state.activeNWCId === id) {
          set({
            activeProviderType: "native",
            activeNWCId: undefined,
            activeWallet: state.nativeWallet,
          })
        }

        set((state) => ({
          nwcConnections: state.nwcConnections.filter((conn) => conn.id !== id),
        }))
        delete isNWCInitialized[id]
      },

      updateNWCConnection: (id: string, updates: Partial<NWCConnection>) => {
        set((state) => ({
          nwcConnections: state.nwcConnections.map((conn) =>
            conn.id === id ? {...conn, ...updates, lastUsed: Date.now()} : conn
          ),
        }))
      },

      connectToNWC: async (id: string): Promise<boolean> => {
        console.log("Starting NWC connection for ID:", id)
        const state = get()
        const connection = state.nwcConnections.find((conn) => conn.id === id)

        if (!connection) {
          console.warn(`NWC connection ${id} not found`)
          return false
        }

        if (isNWCInitialized[id]) {
          console.log("NWC connection already initialized:", id)
          set({
            activeProviderType: "nwc",
            activeNWCId: id,
            activeWallet: connection.wallet,
          })
          return true
        }

        console.log("Found connection:", {
          name: connection.name,
          isLocalCashu: connection.isLocalCashuWallet,
          hasWallet: !!connection.wallet,
          connectionStringLength: connection.connectionString?.length,
        })

        try {
          let pubkey: string | undefined
          let relayUrls: string[] | undefined
          let secret: string | undefined

          try {
            const url = new URL(connection.connectionString)
            pubkey = url.hostname || url.pathname.replace("/", "")
            const relayParam = url.searchParams.get("relay")
            if (relayParam) {
              relayUrls = relayParam
                .split(",")
                .map((r) => r.trim())
                .filter((r) => r.startsWith("wss://"))
            }
            secret = url.searchParams.get("secret") || undefined

            console.log("Parsed NWC parameters:", {pubkey, relayUrls, secret})

            if (!pubkey || !relayUrls || relayUrls.length === 0 || !secret) {
              throw new Error("Missing required NWC parameters: pubkey, relay, or secret")
            }
          } catch (parseError) {
            console.error("Failed to parse NWC connection string:", parseError)
            throw new Error(
              `Invalid NWC connection string format. Expected: nostr+walletconnect://<pubkey>?relay=<relay>&secret=<secret>`
            )
          }

          console.log("Initializing NWC with:", {
            pubkey,
            relayUrls,
            hasSecret: !!secret,
          })
          const success = await initializeNWC({connectionId: id, relayUrls})
          if (!success) {
            throw new Error("NWC initialization failed")
          }

          const wallet = new SimpleNWCWallet({
            pubkey,
            relayUrls,
            secret,
          })

          await wallet.connect()
          console.log("SimpleNWCWallet created and connected:", {
            walletExists: !!wallet,
            walletType: wallet?.constructor?.name,
          })

          get().updateNWCConnection(id, {wallet})
          set({
            activeProviderType: "nwc",
            activeNWCId: id,
            activeWallet: wallet,
          })

          isNWCInitialized[id] = true

          console.log("State after setting wallet:", {
            hasActiveWallet: !!get().activeWallet,
            activeWalletType: get().activeWallet?.constructor?.name,
            activeNWCId: get().activeNWCId,
            activeProviderType: get().activeProviderType,
          })

          console.log("NWC connection successful!")
          return true
        } catch (error) {
          console.error("Failed to connect to NWC:", error)
          return false
        }
      },

      disconnectCurrentProvider: async () => {
        const state = get()
        if (state.activeWallet) {
          // NDK wallets don't need explicit disconnect
        }

        set({
          activeProviderType: "disabled",
          activeNWCId: undefined,
          activeWallet: null,
        })
        isNWCInitialized = {}
      },

      // FINAL FIX — NO MORE AUTO-CONNECT → NO MORE DOUBLE POPUP
      initializeProviders: async () => {
        const state = get()
        console.log("Initializing providers. Current state:", {
          activeProviderType: state.activeProviderType,
          nwcConnectionsCount: state.nwcConnections.length,
          activeNWCId: state.activeNWCId,
          hasActiveWallet: !!state.activeWallet,
          hasNativeWallet: !!state.nativeWallet,
        })

        // ONLY DETECT WebLN — DO NOT CALL .connect() ON STARTUP
        if (window.webln && !state.nativeWallet) {
          console.log("WebLN detected — ready for user to connect")
          const nativeWallet = new SimpleWebLNWallet()
          set({ nativeWallet })
          // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
          // NO await nativeWallet.connect() HERE → NO POPUP
          // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
        }

        // Restore previously selected NWC if any
        if (state.activeProviderType === "nwc" && state.activeNWCId) {
          console.log("Restoring saved NWC connection:", state.activeNWCId)
          await get().connectToNWC(state.activeNWCId)
        }

        get().startCashuNWCChecking()
      },

      refreshActiveProvider: async () => {
        const state = get()
        console.log("Refreshing active provider. Current state:", {
          activeProviderType: state.activeProviderType,
          activeNWCId: state.activeNWCId,
          nwcConnectionsCount: state.nwcConnections.length,
        })

        switch (state.activeProviderType) {
          case "native":
            console.log("Setting native wallet as active")
            set({activeWallet: state.nativeWallet})
            break

          case "nwc":
            if (state.activeNWCId) {
              const connection = state.nwcConnections.find(
                (c) => c.id === state.activeNWCId
              )
              console.log(
                "Looking for NWC connection:",
                state.activeNWCId,
                "found:",
                !!connection,
                "hasWallet:",
                !!connection?.wallet,
                "isLocalCashu:",
                !!connection?.isLocalCashuWallet
              )
              if (connection?.wallet) {
                console.log("Using existing NWC wallet")
                set({activeWallet: connection.wallet})
              } else if (state.activeNWCId) {
                console.log("Reconnecting to NWC:", state.activeNWCId)
                await get().connectToNWC(state.activeNWCId)
              }
            } else {
              console.log("No NWC ID set, clearing wallet")
              set({activeWallet: null})
            }
            break

          case "disabled":
          default:
            console.log("Disabling wallet")
            set({activeWallet: null})
            break
        }
      },

      startCashuNWCChecking: () => {
        const state = get()
        const existingCashuConnection = state.nwcConnections.find(
          (conn) => conn.isLocalCashuWallet
        )

        if (existingCashuConnection) {
          console.log("Already have Cashu NWC connection, skipping check")
          return
        }

        console.log("Starting delayed Cashu NWC checking...")
        const timeoutIds: NodeJS.Timeout[] = []

        const scheduleCheck = (delay: number, attempt: number) => {
          const timeoutId = setTimeout(() => {
            console.log(`Cashu check attempt ${attempt} (${delay / 1000}s)`)
            const found = get().checkCashuNWCConnection()
            if (found) {
              console.log("Cashu NWC connection found, stopping further checks")
              timeoutIds.forEach((id) => clearTimeout(id))
            }
          }, delay)
          timeoutIds.push(timeoutId)
        }

        scheduleCheck(3000, 1)
        scheduleCheck(5000, 2)
        scheduleCheck(10000, 3)
        scheduleCheck(15000, 4)
      },

      checkCashuNWCConnection: (): boolean => {
        const state = get()
        console.log("Checking for Cashu NWC connection in localStorage...")

        try {
          const bcConfigString = localStorage.getItem("bc:config")
          if (bcConfigString) {
            console.log("Found bc:config in localStorage")
            const bcConfig = JSON.parse(bcConfigString)
            const cashuNWCString = bcConfig.nwcUrl

            if (cashuNWCString) {
              console.log(
                "Found Cashu NWC string:",
                cashuNWCString.substring(0, 50) + "..."
              )

              const existingConnection = state.nwcConnections.find(
                (conn) => conn.connectionString === cashuNWCString
              )

              if (existingConnection) {
                console.log("Cashu NWC connection already exists, setting as active")
                if (!existingConnection.isLocalCashuWallet) {
                  console.log("Adding isLocalCashuWallet flag to existing connection")
                  get().updateNWCConnection(existingConnection.id, {
                    isLocalCashuWallet: true,
                  })
                }

                if (state.activeProviderType === undefined) {
                  set({
                    activeProviderType: "nwc",
                    activeNWCId: existingConnection.id,
                  })
                  get().refreshActiveProvider()
                }
                return true
              } else {
                console.log("Adding new Cashu NWC connection")
                const connectionId = get().addNWCConnection({
                  name: "Cashu Wallet",
                  connectionString: cashuNWCString,
                  isLocalCashuWallet: true,
                })

                if (state.activeProviderType === undefined) {
                  console.log("Setting Cashu NWC as active")
                  set({
                    activeProviderType: "nwc",
                    activeNWCId: connectionId,
                  })
                  get().refreshActiveProvider()
                } else {
                  console.log(
                    "Other wallet already active, Cashu NWC added but not set as active"
                  )
                }
                return true
              }
            } else {
              console.log("No nwcUrl found in bc:config")
              return false
            }
          } else {
            console.log("No bc:config found in localStorage")
            return false
          }
        } catch (error) {
          console.warn("Error checking for Cashu NWC connection:", error)
          return false
        }
      },

      cleanup: () => {
        // NDK cleanup is handled automatically
      },

      sendPayment: async (invoice: string) => {
        const {activeWallet, activeProviderType, nativeWallet} = get()

        if (activeProviderType === "nwc" && activeWallet instanceof SimpleNWCWallet) {
          const result = await activeWallet.payInvoice(invoice)
          if (!result) {
            throw new Error("Payment failed")
          }
          return result
        }

        if (
          activeProviderType === "native" &&
          nativeWallet instanceof SimpleWebLNWallet
        ) {
          return await nativeWallet.sendPayment(invoice)
        }

        throw new Error("No active wallet configured for payment")
      },

      createInvoice: async (amount: number, description?: string) => {
        const {activeWallet, activeProviderType} = get()

        if (!activeWallet) {
          throw new Error("No wallet connected")
        }

        if (activeProviderType === "nwc" && activeWallet instanceof SimpleNWCWallet) {
          const result = await activeWallet.makeInvoice(amount, description)
          if (result) {
            return result
          }
          throw new Error("Failed to create invoice")
        }

        if (
          activeProviderType === "native" &&
          activeWallet instanceof SimpleWebLNWallet
        ) {
          return await activeWallet.makeInvoice(amount, description)
        }

        throw new Error("Invoice creation not supported for this wallet type")
      },

      getBalance: throttle(
        async () => {
          try {
            const {activeWallet, activeProviderType} = get()
            console.log(
              "getBalance called (throttled), activeProviderType:",
              activeProviderType,
              "hasActiveWallet:",
              !!activeWallet
            )

            if (!activeWallet) {
              console.log("No active wallet, returning null")
              return null
            }

            if (activeProviderType === "nwc" && activeWallet instanceof SimpleNWCWallet) {
              console.log("Using SimpleNWCWallet for balance request")
              const balance = await activeWallet.getBalance()
              return balance
            }

            if (
              activeProviderType === "native" &&
              activeWallet instanceof SimpleWebLNWallet
            ) {
              console.log("Using SimpleWebLNWallet for balance request")
              const balance = await activeWallet.getBalance()
              return balance
            }

            return 0
          } catch (error) {
            console.error("Failed to get balance:", error)
            return null
          }
        },
        30000,
        {leading: true, trailing: false}
      ),

      getInfo: async () => {
        try {
          const {activeWallet} = get()
          if (!activeWallet) {
            return null
          }
          return null
        } catch (error) {
          console.error("Failed to get wallet info:", error)
          return null
        }
      },
    }),
    {
      name: "wallet-provider-store",
      partialize: (state) => ({
        activeProviderType: state.activeProviderType,
        activeNWCId: state.activeNWCId,
        nwcConnections: state.nwcConnections.map((conn) => ({
          id: conn.id,
          name: conn.name,
          connectionString: conn.connectionString,
          lastUsed: conn.lastUsed,
          balance: conn.balance,
          isLocalCashuWallet: conn.isLocalCashuWallet,
        })),
      }),
    }
  )
)