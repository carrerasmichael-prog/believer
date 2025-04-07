import Embed, {EmbedProps} from "../index.ts"
import Carousel from "./Carousel.tsx"

export const IMAGE_REGEX =
  /(https?:\/\/[^\s]+?\.(?:jpg|jpeg|png|gif|webp)(?:\?[^\s#]*)?(?:#[^\s]*)?(?:\s+https?:\/\/[^\s]+?\.(?:jpg|jpeg|png|gif|webp)(?:\?[^\s#]*)?(?:#[^\s]*)?)*)/gi
export const VIDEO_REGEX =
  /(https?:\/\/[^\s]+?\.(?:mp4|webm|ogg|mov|m3u8)(?:\?[^\s#]*)?(?:#[^\s]*)?(?:\s+https?:\/\/[^\s]+?\.(?:mp4|webm|ogg|mov|m3u8)(?:\?[^\s#]*)?(?:#[^\s]*)?)*)/gi

// Define the MediaItem type to match the one in Carousel
interface MediaItem {
  url: string
  type: "image" | "video"
  imeta?: string[]
}

const MediaEmbed: Embed = {
  settingsKey: "mediaEmbed",
  regex:
    /(https?:\/\/[^\s]+?\.(?:jpg|jpeg|png|gif|webp|mp4|webm|ogg|mov|m3u8)(?:\?[^\s#]*)?(?:#[^\s]*)?(?:\s+https?:\/\/[^\s]+?\.(?:jpg|jpeg|png|gif|webp|mp4|webm|ogg|mov|m3u8)(?:\?[^\s#]*)?(?:#[^\s]*)?)*)/gi,
  component: ({match, event}: EmbedProps) => {
    const urls = match.trim().split(/\s+/)

    // Extract imeta tags for each URL
    const mediaItems: MediaItem[] = urls.map((url) => {
      // Find imeta tag for this URL
      const imetaTag = event?.tags.find(
        (tag) => tag[0] === "imeta" && tag[1].includes(url)
      )

      return {
        url,
        type: url.match(/\.(mp4|webm|ogg|mov|m3u8)(?:\?|$)/) ? "video" : "image",
        imeta: imetaTag ? imetaTag : undefined,
      }
    })

    return <Carousel media={mediaItems} event={event} />
  },
}

export default MediaEmbed
