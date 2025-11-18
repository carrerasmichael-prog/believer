// src/pages/landing/Threshold.tsx
import React from "react"
import {useUIStore} from "@/stores/ui"
import {useUserStore, useSetIdentity, useMarkThresholdSeen} from "@/stores/user"
import {useNavigate} from "@/navigation"
import {playSound} from "@/utils/playSound"

const Threshold: React.FC = () => {
  const {setShowLoginDialog} = useUIStore()
  const {publicKey} = useUserStore()
  const setIdentity = useSetIdentity()
  const markThresholdSeen = useMarkThresholdSeen()
  const navigate = useNavigate()

  if (publicKey) return null

  const enterAsNomad = () => {
    setIdentity({state: "nomad"})
    localStorage.setItem("userBelief", "Nomad")
    playSound?.("/sounds/town-ambience.mp3")
    markThresholdSeen()
    navigate("/room/square")
  }

  const openWallet = () => {
    setShowLoginDialog(true) // opens Alby sign-up flow
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-black backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 max-w-md w-full mx-auto p-8 text-center">
        {/* Subtle faith icons */}
        <div className="relative mb-8 h-24 flex justify-center items-center overflow-hidden">
          <div className="absolute inset-0 animate-pulse flex gap-2 justify-center items-center">
            <div className="w-5 h-5 bg-blue-400 rounded-full opacity-40"></div>
            <div className="w-5 h-5 bg-green-400 rounded-full opacity-40 rotate-45"></div>
            <div className="w-5 h-5 bg-red-400 rounded-full opacity-40 -rotate-45"></div>
            <div className="w-5 h-5 bg-yellow-400 rounded-full opacity-40"></div>
          </div>
          <h1 className="text-4xl font-bold text-white z-10 drop-shadow-lg">
            Believer.go
          </h1>
        </div>

        <p className="text-slate-300 mb-8 text-lg leading-relaxed">Breaking the chain.</p>

        <div className="space-y-4">
          {/* Nomad */}
          <button
            onClick={enterAsNomad}
            className="w-full border-2 border-white/30 hover:border-white/50 text-white font-semibold py-3 rounded-xl bg-transparent hover:bg-white/5 transition-all"
          >
            Enter as Nomad (Guest)
          </button>

          {/* Sign-Up (replaces Wallet) */}
          <button
            onClick={openWallet}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl"
          >
            Sign up / Sign in
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-6">
          Believer.go is an Iris-client fork powered by Nostr.
        </p>
      </div>
    </div>
  )
}

export default Threshold
