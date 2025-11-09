import React, { useRef, useEffect, useState } from "react"
import { useNavigate } from "@/navigation"
import { playSound } from "@/utils/playSound"
import { townSquareSlices, TownSquareSlice } from "@/constants/townSquareSlices"
import { ROOM_CONFIGS } from "@/rooms/roomConfig"  // ← NEW: Import config
import HomeFeed from "@/pages/home/feed/components/HomeFeed"

const BASE_WIDTH = 1920
const BASE_HEIGHT = 1080

const DEBUG_MODE = false

const TownSquare: React.FC = () => {
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [draggingSlice, setDraggingSlice] = useState<string | null>(null)
  const [slices, setSlices] = useState<TownSquareSlice[]>(townSquareSlices)

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

  const updateScale = () => {
    if (!containerRef.current) {
      console.log("No container ref found")
      setScale(1)
      return
    }
    const { width, height } = containerRef.current.getBoundingClientRect()
    console.log("Container size:", width, height)

    const img = containerRef.current.querySelector("img.town-square")
    if (!img) {
      console.log("No town square image found, using fallback scale: 1")
      setScale(1)
      return
    }
    const { width: imgWidth, height: imgHeight } = img.getBoundingClientRect()
    const uniformScale = Math.min(imgWidth / BASE_WIDTH, imgHeight / BASE_HEIGHT)
    console.log("Image size:", imgWidth, imgHeight, "Scale:", uniformScale)
    setScale(uniformScale || 1)
  }

  useEffect(() => {
    const img = containerRef.current?.querySelector("img.town-square") as HTMLImageElement | null
    if (!img) return

    const handleLoad = () => updateScale()
    img.addEventListener("load", handleLoad)
    window.addEventListener("resize", updateScale)

    if (img.complete) handleLoad()

    return () => {
      img.removeEventListener("load", handleLoad)
      window.removeEventListener("resize", updateScale)
    }
  }, [])

  // NEW: Unified click handler
  const handleClick = (slice: TownSquareSlice) => {
  if (DEBUG_MODE) return

  const roomId = slice.src.split('/').pop()!

  // CASE 1: Sound slice (old system)
  if (slice.isSound) {
    playSound(slice.src)
    return
  }

  // CASE 2: Room slice
  if (slice.isRoom) {
    const config = ROOM_CONFIGS[roomId]

    // PLAY SOUND FIRST
    if (config?.sound) {
      const audio = new Audio(`/${config.sound}`)
      audio.volume = 0.6
      audio.play().catch(() => {})  // Ignore autoplay errors
    }

    navigate(`/room/${roomId}`)
    return
  }
}

  const handleMouseDown = (id: string) => (e: React.MouseEvent) => {
    if (!DEBUG_MODE) return
    e.preventDefault()
    setDraggingSlice(id)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!DEBUG_MODE || !draggingSlice || !containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const newLeft = (e.clientX - containerRect.left) / scale
    const newTop = (e.clientY - containerRect.top) / scale

    setSlices((prev) =>
      prev.map((s) =>
        s.id === draggingSlice
          ? {
              ...s,
              left: Math.max(0, Math.min(BASE_WIDTH - s.width, newLeft)),
              top: Math.max(0, Math.min(BASE_HEIGHT - s.height, newTop)),
            }
          : s
      )
    )
  }

  const handleMouseUp = () => {
    if (!DEBUG_MODE) return
    if (draggingSlice) {
      console.log("Updated slice positions:", slices)
    }
    setDraggingSlice(null)
  }

  useEffect(() => {
    if (!DEBUG_MODE) return
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [draggingSlice, scale])

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: `${BASE_WIDTH}px`,
        margin: "0 auto",
        overflow: "auto",
        height: "100vh",
      }}
    >
      <img
        src="/images/town-square-base.png"
        alt="Town Square"
        className="town-square"
        style={{
          width: "100%",
          height: "auto",
          display: "block",
        }}
      />
      {DEBUG_MODE && (
        <button
          onClick={() => {
            const json = slices.map((slice) => ({
              id: slice.id,
              topPercent: ((slice.top / BASE_HEIGHT) * 100).toFixed(2) + "%",
              leftPercent: ((slice.left / BASE_WIDTH) * 100).toFixed(2) + "%",
              widthPercent: ((slice.width / BASE_WIDTH) * 100).toFixed(2) + "%",
              heightPercent: ((slice.height / BASE_HEIGHT) * 100).toFixed(2) + "%",
              isSound: slice.isSound,
              isRoom: slice.isRoom,
              src: slice.src,
            }))
            console.log("Exported JSON:", JSON.stringify(json, null, 2))
            navigator.clipboard.writeText(JSON.stringify(json, null, 2))
            alert("JSON copied to clipboard!")
          }}
          style={{
            position: "absolute",
            top: "1vh",
            right: "5vw",
            zIndex: 10,
            padding: "8px 16px",
            fontSize: "14px",
          }}
        >
          Save Button Positions
        </button>
      )}
      {/* CLEAN SLICES — NO ICONS, TOOLTIPS KEPT */}
      {slices.map((slice) => {
        const scaledTop = slice.top * scale
        const scaledLeft = slice.left * scale
        const scaledWidth = slice.width * scale
        const scaledHeight = slice.height * scale

        return (
          <div
            key={slice.id}
            onClick={() => handleClick(slice)}
            title={capitalize(slice.id)}
            onMouseDown={handleMouseDown(slice.id)}
            style={{
              position: "absolute",
              top: scaledTop,
              left: scaledLeft,
              width: scaledWidth,
              height: scaledHeight,
              cursor: DEBUG_MODE ? "move" : "pointer",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "transparent",
              textAlign: "center",
              fontSize: `${scaledWidth * 0.3}px`,
              borderRadius: "6px",
              transition: "transform 0.15s, box-shadow 0.15s",
              zIndex: 5,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)"
              e.currentTarget.style.boxShadow = "0 0 25px rgba(255, 255, 0, 1)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)"
              e.currentTarget.style.boxShadow = "0 0 0 0"
            }}
          />
        )
      })}
      <div className="mt-8">
        <HomeFeed />
      </div>
    </div>
  )
}

export default TownSquare