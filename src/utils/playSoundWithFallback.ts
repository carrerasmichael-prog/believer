// src/utils/playSoundWithFallback.ts
import {ROOM_CONFIGS} from "@/rooms/roomConfig"

const DEFAULT_SOUND = "door.mp3"
let currentAudio: HTMLAudioElement | null = null

export const playRoomSound = (roomId: string) => {
  console.log("[playRoomSound] Input roomId:", roomId)
  const config = ROOM_CONFIGS[roomId]
  console.log("[playRoomSound] Found config:", config)
  const soundPath = config?.sound || DEFAULT_SOUND
  console.log("[playRoomSound] Final path:", soundPath)

  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
  }

  currentAudio = new Audio(`/${soundPath}`)
  currentAudio.volume = 0.6
  currentAudio.play().catch((err) => {
    console.warn("[playRoomSound] Autoplay blocked:", err)
  })
}

// Optional: expose raw playSound for non-room sounds (if needed later)
export const playSound = (src: string, volume = 0.6) => {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
  }
  currentAudio = new Audio(src)
  currentAudio.volume = volume
  currentAudio.play().catch(() => {})
}
