// src/rooms/room.tsx
import { useParams } from "@/navigation";
import { ROOM_CONFIGS } from "@/rooms/roomConfig";
import { ndk } from "@/utils/ndk";
import { useEffect, useState } from "react";

const Room = () => {
  const { roomid = 'lobby' } = useParams();
  const roomId = roomid.toLowerCase().trim();
  const config = ROOM_CONFIGS[roomId];

  // === PLAY SOUND ON ENTER WITH RETRY ===
  useEffect(() => {
    if (roomId && config?.sound) {
      console.log('[room.tsx] Playing sound for:', roomId);
      const playSoundWithRetry = async (soundPath: string, retries = 3, delay = 500) => {
        for (let i = 0; i < retries; i++) {
          try {
            const audio = new Audio(soundPath);
            audio.volume = 0.6;
            await audio.play();
            console.log('[room.tsx] Sound played successfully:', soundPath);
            return;
          } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.log(`[room.tsx] Autoplay blocked or failed (attempt ${i + 1}):`, errorMessage);
            if (i < retries - 1) {
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        }
        console.warn('[room.tsx] Failed to play sound after retries:', soundPath);
      };
      playSoundWithRetry(`/${config.sound}`); // Use correct path: /sounds/market.mp3
    }
  }, [roomId, config?.sound]);

  // === ROOM NOT FOUND ===
  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-base-content/50">
        <h2 className="text-xl mb-2">Room not found</h2>
        <p>Try Lobby or another room.</p>
      </div>
    );
  }

  // === EXTERNAL URL (News → OANN) ===
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
    );
  }

  // === NOSTR FEED (ALL OTHER ROOMS) ===
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const sub = ndk().subscribe(
      { kinds: [1], "#t": config.tags },
      { relayUrls: config.relayUrl ? [config.relayUrl] : undefined }
    );

    sub.on("event", (event: any) => {
      setPosts(prev => [...prev, event]);
    });

    return () => sub.stop();
  }, [config]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-base-300 text-center bg-base-100">
        <h1 className="text-2xl font-bold">{config.name}</h1>
        <p className="text-sm text-base-content/70 mt-1">{config.subtitle}</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {posts.length ? (
          posts.map(post => (
            <div key={post.id} className="p-4 bg-base-200 rounded-lg">
              <p className="text-base-content break-words">{post.content}</p>
              <small className="text-base-content/60">
                {post.pubkey.slice(0, 8)}...
              </small>
            </div>
          ))
        ) : (
          <p className="text-center text-base-content/50">No posts yet.</p>
        )}
      </div>
    </div>
  );
};

export default Room;