// src/rooms/room.tsx
import { useParams } from "@/navigation"
import { ROOM_CONFIGS } from "@/rooms/roomConfig"
import { useEffect, useRef, useState } from "react"
import { useSettingsStore } from "@/stores/settings"
import { ndk } from "@/utils/ndk"                          // ← your factory
import TownSquareInteractive from "@/pages/landing/TownSquareInteractive"
import FeedItem from "@/shared/components/event/FeedItem/FeedItem"
import useFeedEvents from "@/shared/hooks/useFeedEvents"
import { type FeedConfig } from "@/stores/feed"
import type { NDKEvent } from "@nostr-dev-kit/ndk"

// Create the actual NDK instance once
const ndkInstance = ndk()

const DEFAULT_FEED_CONFIG: FeedConfig = {
  id: "room",
  name: "Room",
  hideReplies: false,
  requiresMedia: false,
  requiresReplies: false,
  excludeSeen: true,
}

// Live "People in room" sidebar
const RoomPeopleColumn = ({ roomId }: { roomId: string }) => {
  const [onlinePubkeys, setOnlinePubkeys] = useState<Set<string>>(new Set())

  useEffect(() => {
    const recent = new Set<string>()

    const sub = ndkInstance.subscribe(
      {
        kinds: [1],
        "#t": ROOM_CONFIGS[roomId]?.tags || [],
        since: Math.floor(Date.now() / 1000) - 300, // last 5 min
      },
      { closeOnEose: false }
    )

    sub.on("event", (event: NDKEvent) => {
      if (event.pubkey) recent.add(event.pubkey)
    })

    const interval = setInterval(() => {
      setOnlinePubkeys(new Set(recent))
    }, 8000)

    return () => {
      sub.stop()
      clearInterval(interval)
    }
  }, [roomId])

  if (onlinePubkeys.size === 0) {
    return (
      <div className="p-8 text-center text-base-content/40">
        <p className="text-sm">No one here right now…</p>
      </div>
    )
  }

  return (
    <div className="sticky top-20 p-6 bg-base-100 rounded-xl border border-base-300">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        People Here
        <span className="text-success animate-pulse">●</span>
        <span className="text-sm font-normal text-base-content/70">({onlinePubkeys.size})</span>
      </h3>
      <div className="space-y-3">
        {Array.from(onlinePubkeys)
          .slice(0, 15)
          .map((pubkey) => (
            <div key={pubkey} className="flex items-center gap-3">
              <div className="avatar">
                <div className="w-10 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100">
                  <img
                    src={`https://api.dicebear.com/8.x/identicon/svg?seed=${pubkey}`}
                    alt="avatar"
                  />
                </div>
              </div>
              <div className="text-sm">
                <div className="font-medium truncate max-w-32">
                  {pubkey.slice(0, 12)}…
                </div>
                <div className="text-success text-xs">active now</div>
              </div>
            </div>
          ))}
      </div>
      {onlinePubkeys.size > 15 && (
        <p className="text-center text-xs text-base-content/50 mt-4">
          + {onlinePubkeys.size - 15} more
        </p>
      )}
    </div>
  )
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

  // Audio handling
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
  }, [roomId, config?.sound, mute, currentAudio])

  useEffect(() => {
    if (currentAudio) currentAudio.volume = mute ? 0 : 0.6
  }, [mute, currentAudio])

  const openPortal = () => {
  setSavedScroll(window.pageYOffset)
  setShowPortal(true)
  document.body.classList.add("overflow-hidden")
}

const closePortal = () => {
  setShowPortal(false)
  document.body.classList.remove("overflow-hidden")
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
        <div className="mx-auto max-w-screen-2xl px-4 py-6">
          {/* This is the magic line that restores full responsiveness */}
          <div className={roomId === "news" ? "space-y-6" : "grid gap-8 lg:grid-cols-2 lg:gap-12"}>
            
            {/* LEFT COLUMN — Feed */}
            <div className="space-y-6">
              {events.length === 0 && initialLoadDone ? (
                <p className="text-center text-base-content/50 py-20">
                  No posts yet in {config.name}…
                </p>
              ) : (
                <>
                  {events.map((event) => (
                    <FeedItem key={event.id} event={event} showActions={true} showReplies={3} />
                  ))}
                  <div ref={sentinelRef} className="h-10" />
                  {!initialLoadDone && (
                    <div className="text-center py-10">
                      <span className="loading loading-spinner loading-lg" />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* RIGHT COLUMN — People sidebar (only on lg+ and not news) */}
            {roomId !== "news" && (
              <div className="hidden lg:block">
                <RoomPeopleColumn roomId={roomId} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Town Square Portal */}
      {showPortal && roomId === "square" && !cameFromMap && (
        <div className="fixed inset-0 z-[999999] bg-black/95 flex items-center justify-center p-4 pointer-events-none">
        <div className="relative w-full h-full max-w-7xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl pointer-events-auto">
            <button
              onClick={closePortal}
              className="absolute top-4 right-4 z-50 btn btn-circle btn-ghost text-white hover:bg-white/20"
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