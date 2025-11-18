// src/pages/mobile-home/index.tsx
import {usePublicKey} from "@/stores/user"
import {useNavigate} from "@/navigation"
import ProfileCard from "@/shared/components/user/ProfileCard"
import {useIsLargeScreen} from "@/shared/hooks/useIsLargeScreen"
import {useEffect} from "react"

const MobileHome = () => {
  const pubKey = usePublicKey()
  const navigate = useNavigate()
  const isLargeScreen = useIsLargeScreen()

  // Redirect desktop to TownSquare
  useEffect(() => {
    if (isLargeScreen) {
      navigate("/", {replace: true})
    }
  }, [isLargeScreen, navigate])

  if (!pubKey) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to Believer.go</h1>
        <p className="text-lg mb-6">Sign in to begin your journey.</p>
        <button onClick={() => navigate("/settings")} className="btn btn-primary">
          Sign In
        </button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-base-200">
      <div className="p-6 pb-0">
        <ProfileCard pubKey={pubKey} showAbout={true} showFollows={false} />
      </div>
      <div className="flex-1" />
      <div className="p-6 pt-4 flex gap-3">
        <button onClick={() => navigate("/settings")} className="flex-1 btn btn-outline">
          Edit Profile
        </button>
        <button onClick={() => navigate("/")} className="flex-1 btn btn-primary">
          Explore Rooms
        </button>
      </div>
    </div>
  )
}

export default MobileHome
