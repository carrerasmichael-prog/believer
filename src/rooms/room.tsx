// src/rooms/room.tsx
import { useParams } from "@/navigation"
import { ROOM_CONFIGS } from "@/rooms/roomConfig"
import { useEffect, useRef, useState } from "react"
import { useSettingsStore } from "@/stores/settings"
import TownSquareInteractive from "@/pages/landing/TownSquareInteractive"
import FeedItem from "@/shared/components/event/FeedItem/FeedItem"
import useFeedEvents from "@/shared/hooks/useFeedEvents"
import { type FeedConfig } from "@/stores/feed"

const DEFAULT_FEED_CONFIG: FeedConfig = {
  id: "room",
  name: "Room",
  hideReplies: false,
  requiresMedia: false,
  requiresReplies: false,
  excludeSeen: true,
}

const Room = () => {
  const { roomid = "square" } = useParams()
  const roomId = roomid.toLowerCase().trim()
  const config = ROOM_CONFIGS[roomId]
  const mute = useSettingsStore((state) => state.mute)
  const cameFromMap = new URLSearchParams(window.location.search).get("map") === "1"

  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [showPortal, setShowPortal] = useState(false)
  const [savedScroll, setSavedScroll] = useState(0)

  // 1. Create / destroy room audio + initial volume
  useEffect(() => {
    if (roomId && config?.sound) {
      const audio = new Audio(`/${config.sound}`)
      audio.volume = mute ? 0 : 0.6
      audio.loop = false
      setCurrentAudio(audio)
      audio.play().catch(() => {})
      return () => {
        audio.pause()
        audio.src = ""
        setCurrentAudio(null)
      }
    } else if (currentAudio) {
      currentAudio.pause()
      currentAudio.src = ""
      setCurrentAudio(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, config?.sound, mute])

  // 2. React to mute changes – intentionally omit currentAudio from deps
  useEffect(() => {
    if (currentAudio) {
      currentAudio.volume = mute ? 0 : 0.6
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mute])

  const openPortal = () => {
    setSavedScroll(window.scrollY)
    setShowPortal(true)
    document.body.style.overflow = "hidden"
  }

  const closePortal = () => {
    setShowPortal(false)
    document.body.style.overflow = ""
    window.scrollTo({ top: savedScroll, behavior: "instant" })
  }

  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-base-content/50">
        <h2 className="text-xl mb-2">Room not found</h2>
        <p>Try Town Square or another room.</p>
      </div>
    )
  }

  if (config.externalUrl) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-base-300 text-center bg-base-100">
          <h1 className="text-2xl font-bold">{config.name}</h1>
          <p className="text-sm text-base-content/70 mt-1">{config.subtitle}</p>
        </div>
        <iframe
          src={config.externalUrl}
          className="flex-1 w-full border-0"
          title={config.name}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          loading="lazy"
        />
      </div>
    )
  }

  // ——— INSTANT ROOM FEED ———
  const feedConfig: FeedConfig = {
    ...DEFAULT_FEED_CONFIG,
    name: config.name,
    relayUrls: config.relayUrl ? [config.relayUrl] : undefined,
  }

  const { filteredEvents, loadMoreItems, initialLoadDone } = useFeedEvents({
    filters: { kinds: [1], "#t": config.tags },
    cacheKey: `room-${roomId}`,
    displayCount: 100,
    feedConfig,
    relayUrls: config.relayUrl ? [config.relayUrl] : undefined,
  })

  const events = Array.from(filteredEvents)

  const sentinelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!sentinelRef.current || !initialLoadDone) return
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && loadMoreItems(),
      { rootMargin: "1000px" }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [initialLoadDone, loadMoreItems])

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-base-300 text-center bg-base-100 relative">
        <h1
          className={`text-2xl font-bold cursor-pointer hover:underline transition ${
            roomId === "square" ? "text-primary" : ""
          }`}
          onClick={() => roomId === "square" && openPortal()}
        >
          {config.name}
        </h1>
        <p className="text-sm text-base-content/70 mt-1">{config.subtitle}</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-screen-2xl px-4 py-6 lg:grid lg:grid-cols-2 lg:gap-8">
          {events.length === 0 && initialLoadDone ? (
            <p className="col-span-2 text-center text-base-content/50 py-20">
              No posts yet in {config.name}…
            </p>
          ) : (
            <>
              {events.map((event) => (
                <FeedItem key={event.id} event={event} showActions={true} showReplies={3} />
              ))}

              <div ref={sentinelRef} className="col-span-2 h-10" />
              {!initialLoadDone && (
                <div className="col-span-2 text-center py-10">
                  <span className="loading loading-spinner loading-lg" />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Town Square Portal */}
      {showPortal && roomId === "square" && !cameFromMap && (
        <div className="fixed inset-0 z-[999999] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-700">
          <div className="relative w-full h-full max-w-7xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl">
            <button
              onClick={closePortal}
              className="absolute top-4 right-4 z-50 btn btn-circle btn-ghost text-white hover:bg-white/20"
              aria-label="Close portal"
            >
              X
            </button>
            <div className="w-full h-full">
              <TownSquareInteractive />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Room