// src/utils/webln.ts
import type {WebLNProvider} from "@/types/global"

export interface WebLNWalletBalance {
  amount: number
}

export class SimpleWebLNWallet {
  private provider: WebLNProvider | null = null
  private _balance?: WebLNWalletBalance
  private static isEnabled: boolean = false

  async connect(): Promise<boolean> {
    try {
      if (!window.webln) {
        console.log("WebLN not available")
        return false
      }

      const webln = window.webln

      // Check cached enabled state
      if (SimpleWebLNWallet.isEnabled) {
        console.log("🔍 WebLN already enabled, reusing provider")
        this.provider = webln
        return true
      }

      // Check if already enabled
      const isEnabled = await webln.isEnabled()
      if (isEnabled) {
        SimpleWebLNWallet.isEnabled = true
        this.provider = webln
        console.log("🔍 WebLN already enabled via isEnabled")
        return true
      }

      // Try to enable
      if (webln.enable) {
        await webln.enable()
        SimpleWebLNWallet.isEnabled = true
        this.provider = webln
        console.log("🔍 WebLN enabled successfully")
      }
      return true
    } catch (error) {
      console.error("Failed to connect WebLN:", error)
      SimpleWebLNWallet.isEnabled = false
      return false
    }
  }

  async sendPayment(invoice: string): Promise<{preimage?: string}> {
    if (!this.provider) {
      throw new Error("WebLN provider not connected")
    }
    const result = await this.provider.sendPayment(invoice)
    return result || {}
  }

  async makeInvoice(amount: number, description?: string): Promise<{invoice: string}> {
    if (!this.provider || !this.provider.makeInvoice) {
      throw new Error("WebLN provider not connected or makeInvoice not supported")
    }

    const args = description
      ? {amount: amount.toString(), defaultMemo: description}
      : {amount: amount.toString()}

    const result = await this.provider.makeInvoice(args)
    return {invoice: result.paymentRequest}
  }

  async getBalance(): Promise<number | null> {
    if (!this.provider) {
      return null
    }

    try {
      if (this.provider.getBalance) {
        const result = await this.provider.getBalance()
        this._balance = {amount: result.balance || 0}
        return this._balance.amount
      }
      return null
    } catch (error) {
      console.error("Failed to get WebLN balance:", error)
      return null
    }
  }

  async updateBalance(): Promise<void> {
    await this.getBalance()
  }

  get balance(): WebLNWalletBalance | undefined {
    return this._balance
  }

  get isConnected(): boolean {
    return !!this.provider && SimpleWebLNWallet.isEnabled
  }
}
