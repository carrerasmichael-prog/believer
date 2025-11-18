// src/components/DestinyMenu.tsx
import {useState} from "react"
import {useUserStore, useSetIdentity, useSyncKind0} from "@/stores/user"
import {ndk} from "@/utils/ndk"
import {NDKEvent} from "@nostr-dev-kit/ndk"
import Icon from "@/shared/components/Icons/Icon.tsx" // make sure this path is correct

interface Room {
  id: string
  name: string
  belief: string
  state: "nomad" | "believer" | "atheist"
}

const ROOMS: Room[] = [
  {id: "square", name: "Town Square", belief: "Nomad", state: "nomad"},
  {id: "temple", name: "Temple", belief: "Believer in Temple", state: "believer"},
  {id: "mosque", name: "Mosque", belief: "Believer in Mosque", state: "believer"},
  {id: "church", name: "Church", belief: "Believer in Church", state: "believer"},
  {
    id: "synagogue",
    name: "Synagogue",
    belief: "Believer in Synagogue",
    state: "believer",
  },
  {id: "market", name: "Market", belief: "Believer in Market", state: "believer"},
  {id: "news", name: "News", belief: "Believer in News", state: "believer"},
  {id: "atheism", name: "Atheism", belief: "Atheist", state: "atheist"},
  {id: "mathris", name: "Mathris", belief: "Believer in Mathris", state: "believer"},
]

interface DestinyMenuProps {
  onClose: () => void
}

export default function DestinyMenu({onClose}: DestinyMenuProps) {
  const {publicKey, identity} = useUserStore()
  const setIdentity = useSetIdentity()
  const syncKind0 = useSyncKind0()
  const [loading, setLoading] = useState(false)

  const handleSelect = async (room: Room) => {
    if (!publicKey || loading) return
    setLoading(true)

    try {
      const newIdentity = {
        state: room.state,
        room: room.id === "square" ? undefined : room.id,
        default_room: room.id,
      } as const

      setIdentity(newIdentity)

      const event = new NDKEvent(ndk())
      event.kind = 0
      event.content = JSON.stringify({
        name:
          room.id === "square" ? "Nomad" : room.id === "atheism" ? "Atheist" : "Believer",
        belief: room.belief,
        default_room: room.id,
      })
      await event.sign()
      await event.publish()

      await syncKind0(ndk())
      onClose()
    } catch (error) {
      console.error("Destiny update failed:", error)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-base-100 rounded-xl shadow-2xl max-w-md w-full p-6">
        {/* Header with icon on large screens */}
        <div className="flex items-center justify-center mb-2">
          <h2 className="text-2xl font-bold text-center mr-2">Choose Your Destiny</h2>
          <div className="hidden lg:block">
            <Icon name="mail-outline" className="w-6 h-6 text-base-content/80" />
          </div>
        </div>

        <p className="text-sm text-base-content/70 text-center mb-6">
          This sets your belief and home room.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {ROOMS.map((room) => {
            const isActive = identity.default_room === room.id
            return (
              <button
                key={room.id}
                onClick={() => handleSelect(room)}
                disabled={loading || isActive}
                className={`
                  p-4 rounded-lg border-2 transition-all text-left text-sm
                  ${
                    isActive
                      ? "border-yellow-500 bg-yellow-500/10 text-yellow-300 font-bold"
                      : "border-base-300 hover:border-yellow-500 hover:bg-base-200"
                  }
                  ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                {room.name}
              </button>
            )
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full btn btn-ghost text-sm"
          disabled={loading}
        >
          Close
        </button>
      </div>
    </div>
  )
}
