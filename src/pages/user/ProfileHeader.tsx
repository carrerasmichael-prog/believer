import {PublicKey} from "@/shared/utils/PublicKey"
import {useMemo, useState, useEffect} from "react"
import {Link, useNavigate} from "@/navigation"
import {useUserStore} from "@/stores/user"
import {Invite} from "nostr-double-ratchet/src"
import {ndk} from "@/utils/ndk"
import {Filter, VerifiedEvent} from "nostr-tools"

import PublicKeyQRCodeButton from "@/shared/components/user/PublicKeyQRCodeButton"
import ProfileDropdownButton from "@/shared/components/user/ProfileDropdownButton"
import {FollowButton} from "@/shared/components/button/FollowButton.tsx"
import ProfileDetails from "@/pages/user/components/ProfileDetails.tsx"
import FollowerCount from "@/pages/user/components/FollowerCount.tsx"
import FollowsCount from "@/pages/user/components/FollowsCount.tsx"
import {PROFILE_AVATAR_WIDTH} from "@/shared/components/user/const"
import FollowedBy from "@/shared/components/user/FollowedBy"
import {Avatar} from "@/shared/components/user/Avatar.tsx"
import ProxyImg from "@/shared/components/ProxyImg.tsx"
import Header from "@/shared/components/header/Header"
import {Name} from "@/shared/components/user/Name.tsx"
import useProfile from "@/shared/hooks/useProfile.ts"
import Modal from "@/shared/components/ui/Modal.tsx"
import Icon from "@/shared/components/Icons/Icon"
import {Helmet} from "react-helmet"

const ProfileHeader = ({
  pubKey,
  showHeader = true,
}: {
  pubKey: string
  showHeader?: boolean
}) => {
  const profile = useProfile(pubKey, true)
  const pubKeyHex = useMemo(
    () => (pubKey ? new PublicKey(pubKey).toString() : ""),
    [pubKey]
  )
  const myPubKey = useUserStore((state) => state.publicKey)

  const [showProfilePhotoModal, setShowProfilePhotoModal] = useState(false)
  const [showBannerModal, setShowBannerModal] = useState(false)
  const [hasInvites, setHasInvites] = useState(false)

  const navigate = useNavigate()

  // Subscribe function for nostr events
  const subscribe = (filter: Filter, onEvent: (event: VerifiedEvent) => void) => {
    const sub = ndk().subscribe(filter)
    sub.on("event", (e) => onEvent(e as unknown as VerifiedEvent))
    return () => sub.stop()
  }

  // Check for invites from other users
  useEffect(() => {
    // Only check for invites if this is not our own profile and we have a pubkey
    if (!myPubKey || myPubKey === pubKeyHex || !pubKeyHex) {
      return
    }

    console.log("Checking for invites from user:", pubKeyHex)

    const unsubscribe = Invite.fromUser(pubKeyHex, subscribe, (invite) => {
      console.log("Found invite from user:", pubKeyHex, invite)
      setHasInvites(true)
    })

    // Cleanup subscription on unmount
    return () => {
      console.log("Cleaning up invite subscription for user:", pubKeyHex)
      unsubscribe()
    }
  }, [pubKeyHex, myPubKey])

  const handleStartChat = () => {
    // Navigate directly to chat with userPubKey
    // The chats store will handle session creation automatically
    navigate("/chats/chat", {
      state: {id: pubKeyHex},
    })
  }

  return (
    <>
      {showHeader && (
        <Header slideUp={false}>
          <Name pubKey={pubKeyHex} />
        </Header>
      )}
      <div className="flex flex-col gap-4 w-full break-all">
        <div className="w-full h-36 md:h-72 bg-gradient-to-r from-primary to-primary-dark">
          {profile?.banner && (
            <ProxyImg
              src={profile?.banner}
              className="w-full h-36 md:h-72 object-cover cursor-pointer select-none"
              alt=""
              onClick={() => setShowBannerModal(true)}
              hideBroken={true}
              width={655}
            />
          )}
        </div>
        {showBannerModal && (
          <Modal onClose={() => setShowBannerModal(false)} hasBackground={false}>
            <ProxyImg
              src={String(profile?.banner)}
              className="max-h-screen max-w-screen"
              alt="Banner"
            />
          </Modal>
        )}
        <div className="flex flex-col gap-4 px-4 -mt-16">
          <div className="flex flex-row items-end gap-8 mt-4 justify-between select-none">
            <span
              onClick={() => profile?.picture && setShowProfilePhotoModal(true)}
              className="cursor-pointer"
            >
              <Avatar pubKey={pubKey} showBadge={false} width={PROFILE_AVATAR_WIDTH} />
            </span>
            {showProfilePhotoModal && (
              <Modal
                onClose={() => setShowProfilePhotoModal(false)}
                hasBackground={false}
              >
                <ProxyImg
                  src={String(profile?.picture)}
                  className="max-h-screen max-w-screen"
                  alt="Profile"
                />
              </Modal>
            )}

            <div className="flex flex-row gap-2" data-testid="profile-header-actions">
              {myPubKey && (myPubKey === pubKeyHex || hasInvites) && (
                <button className="btn btn-circle btn-neutral" onClick={handleStartChat}>
                  <Icon name="mail-outline" className="w-6 h-6" />
                </button>
              )}
              <PublicKeyQRCodeButton publicKey={pubKey} data-testid="profile-qr-button" />
              {myPubKey && myPubKey === pubKeyHex ? (
                <Link to="/settings/profile" className="btn btn-neutral">
                  Edit profile
                </Link>
              ) : (
                <>
                  {/* Show Follow button only when logged in and not self */}
                  {myPubKey && myPubKey !== pubKeyHex && (
                    <FollowButton pubKey={pubKey} small={false} />
                  )}
                </>
              )}
              {/* Show dropdown for all profiles including self */}
              <ProfileDropdownButton pubKey={pubKey} />
            </div>
          </div>
          <div className="text-2xl font-bold">
            <Name pubKey={pubKey} />
          </div>
          <ProfileDetails
            pubKey={pubKey}
            displayProfile={profile || undefined}
            externalIdentities={{github: ""}}
          />
        </div>
        <div className="flex flex-row gap-4 px-4 pb-2 items-end flex-wrap">
          <FollowerCount pubKey={pubKeyHex} />
          <FollowsCount pubKey={pubKeyHex} />
        </div>
        {myPubKey && pubKeyHex !== myPubKey && (
          <div className="flex flex-row gap-4 px-4 mb-4 items-end flex-wrap">
            <FollowedBy pubkey={pubKeyHex} />
          </div>
        )}
        <Helmet>
          <title>
            {profile?.name ||
              profile?.display_name ||
              profile?.username ||
              profile?.nip05?.split("@")[0] ||
              "Profile"}{" "}
          </title>
        </Helmet>
      </div>
    </>
  )
}

export default ProfileHeader
