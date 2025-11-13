// src/shared/components/user/ProfileCard.tsx
import { FollowButton } from "@/shared/components/button/FollowButton"
import { ProfileAbout } from "@/shared/components/user/ProfileAbout"
import { UserRow } from "@/shared/components/user/UserRow"
import FollowedBy from "./FollowedBy"
import MutedBy from "./MutedBy"
import socialGraph from "@/utils/socialGraph"
import { usePublicKey, useUserStore } from "@/stores/user"
import { useMemo } from "react"

const ProfileCard = ({
  pubKey,
  showAbout = true,
  showFollows = false,
  showHoverCard = false,
}: {
  pubKey: string
  showAbout?: boolean
  showFollows?: boolean
  showHoverCard?: boolean
}) => {
  const myPubKey = usePublicKey()
  const identity = useUserStore((s) => s.identity || { state: "nomad" })

  const followsMe = useMemo(() => {
    const follows = Array.from(socialGraph().getFollowedByUser(pubKey))
    return follows?.includes(myPubKey)
  }, [pubKey, myPubKey])

  const identityLabel = () => {
    if (identity.state === "believer" && identity.room) {
      return `Believer in ${identity.room}`
    }
    return identity.state.charAt(0).toUpperCase() + identity.state.slice(1)
  }

  return (
    <div className="flex flex-col font-normal text-base gap-3 profile-card bg-base-100 p-5 rounded-2xl shadow-lg">
      <div className="flex flex-row items-center justify-between gap-3">
        <UserRow pubKey={pubKey} showHoverCard={showHoverCard} />
        {pubKey !== myPubKey && <FollowButton pubKey={pubKey} />}
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className="badge badge-lg badge-primary">{identityLabel()}</span>
      </div>

      {showAbout && <ProfileAbout pubKey={pubKey} className="mb-2" />}
      <MutedBy pubkey={pubKey} />
      {showFollows && <FollowedBy pubkey={pubKey} />}
      {showFollows && followsMe && (
        <span className="badge badge-neutral">Follows you</span>
      )}
    </div>
  )
}

export default ProfileCard
