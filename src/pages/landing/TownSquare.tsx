// src/pages/landing/TownSquare.tsx
import React, { useRef, useState } from "react"
import { useNavigate } from "@/navigation"
import { useUIStore } from "@/stores/ui"
import { useIsLoggedIn, useMarkThresholdSeen } from "@/stores/user"
import DestinyMenu from "@/components/DestinyMenu"

const TownSquare: React.FC = () => {
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const [showDestiny, setShowDestiny] = useState(false)

  // Login + Threshold
  const isLoggedIn = useIsLoggedIn()
  const markThresholdSeen = useMarkThresholdSeen()

  // UI store for modal
  const setShowLoginDialog = useUIStore((state) => state.setShowLoginDialog)

  // Guest → Town Square + mark seen
  const handleBrowseAsGuest = () => {
    markThresholdSeen()
    navigate("/room/square")
  }

  // Sign In → open modal
  const handleSignIn = () => {
    setShowLoginDialog(true)
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen flex flex-col items-center justify-center bg-black text-white overflow-hidden"
      style={{
        backgroundImage: "url('/images/town-square-base.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-70 z-10" />

      {/* Content */}
      <div className="relative z-20 text-center px-6 max-w-lg">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
          What do you believe?
        </h1>
        <p className="text-xl md:text-2xl mb-12 text-yellow-300 font-medium">
          Faith off the chain.
        </p>

        <div className="flex flex-col gap-4">
          {/* Conditional Buttons */}
          {!isLoggedIn ? (
            <>
              <button
                onClick={handleBrowseAsGuest}
                className="w-full py-4 px-8 bg-gray-800 hover:bg-gray-700 text-white text-lg font-semibold rounded-lg transition-all duration-200 shadow-lg"
              >
                Browse as Guest
              </button>

              <button
                onClick={handleSignIn}
                className="w-full py-4 px-8 bg-yellow-500 hover:bg-yellow-600 text-black text-lg font-semibold rounded-lg transition-all duration-200 shadow-lg"
              >
                Sign In / Sign Up
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowDestiny(true)}
              className="w-full py-4 px-8 bg-yellow-500 hover:bg-yellow-600 text-black text-lg font-semibold rounded-lg transition-all duration-200 shadow-lg"
            >
              Destiny
            </button>
          )}
        </div>
      </div>

      {/* Destiny Menu Modal */}
      {showDestiny && <DestinyMenu onClose={() => setShowDestiny(false)} />}
    </div>
  )
}

export default TownSquare