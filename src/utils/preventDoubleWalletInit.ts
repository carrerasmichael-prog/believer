// src/utils/preventDoubleWalletInit.ts
let hasAttemptedWalletInit = false

export const allowWalletInit = (): boolean => {
  if (hasAttemptedWalletInit) {
    console.log("Second mount detected — blocking wallet init")
    return false
  }
  hasAttemptedWalletInit = true
  console.log("First mount — allowing wallet init")
  return true
}

export const resetWalletInitGuard = () => {
  hasAttemptedWalletInit = false
}