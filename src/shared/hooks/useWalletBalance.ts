// src/hooks/useWalletBalance.ts
import {useWalletStore} from "@/stores/wallet"
import {useWalletProviderStore} from "@/stores/walletProvider"
import {useEffect, useRef, useState} from "react"

export const useWalletBalance = () => {
  const {balance, setBalance} = useWalletStore()
  const {activeWallet, activeProviderType, activeNWCId, getBalance} =
    useWalletProviderStore()
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [isFetching, setIsFetching] = useState(false)

  useEffect(() => {
    console.log("🔍 useWalletBalance effect triggered:", {
      activeProviderType,
      activeNWCId,
      hasActiveWallet: !!activeWallet,
      walletType: activeWallet?.constructor?.name,
      currentBalance: balance,
    })

    // Clear existing interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }

    // Handle disabled provider
    if (activeProviderType === "disabled") {
      console.log("🔍 Wallet disabled, clearing balance")
      setBalance(null)
      return
    }

    // Skip if no wallet
    if (activeProviderType === undefined || !activeWallet) {
      console.log("🔍 Wallet not ready, keeping existing balance")
      return
    }

    const updateBalance = async () => {
      if (isFetching) {
        console.log("🔍 Skipping balance check: already fetching")
        return
      }

      setIsFetching(true)
      try {
        console.log("🔍 useWalletBalance: calling getBalance()")
        const newBalance = await getBalance()
        console.log("🔍 useWalletBalance: getBalance returned:", newBalance)

        if (typeof newBalance === "number") {
          setBalance(newBalance)
        } else {
          console.log(
            "🔍 Keeping existing balance:",
            balance,
            "because new value is:",
            newBalance
          )
        }
      } catch (error) {
        if (error instanceof Error && !error.message.includes("rate-limited")) {
          console.warn("Failed to get balance:", error)
        }
      } finally {
        setIsFetching(false)
      }
    }

    // Initial call
    updateBalance()

    // Poll every 30 seconds
    pollIntervalRef.current = setInterval(updateBalance, 30000)

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [activeWallet, activeProviderType, activeNWCId, setBalance, getBalance])

  return {balance}
}
