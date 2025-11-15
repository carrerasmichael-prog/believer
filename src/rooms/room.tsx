// src/rooms/room.tsx
import { useParams } from "@/navigation";
import { ROOM_CONFIGS } from "@/rooms/roomConfig";
import { ndk } from "@/utils/ndk";
import { useEffect, useState } from "react";
import { useSettingsStore } from "@/stores/settings";

const Room = () => {
  const { roomid = 'square' } = useParams();
  const roomId = roomid.toLowerCase().trim();
  const config = ROOM_CONFIGS[roomId];
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  
  // REACTIVE: Subscribe to mute state
  const mute = useSettingsStore((state) => state.mute);

  // === PLAY SOUND WITH LIVE MUTE ===
  useEffect(() => {
    if (roomId && config?.sound) {
      console.log('[room.tsx] Preparing sound for:', roomId);

      const audio = new Audio(`/${config.sound}`);
      audio.volume = mute ? 0 : 0.6;
      setCurrentAudio(audio);

      audio.play().catch(err => {
        console.warn('[room.tsx] Autoplay blocked:', err);
      });

      // Cleanup on room leave
      return () => {
        audio.pause();
        audio.src = '';
        setCurrentAudio(null);
      };
    } else {
      // No sound → stop any playing
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
        setCurrentAudio(null);
      }
    }
  }, [roomId, config?.sound]);

  // === INSTANT MUTE ON CHANGE ===
  useEffect(() => {
    if (currentAudio) {
      currentAudio.volume = mute ? 0 : 0.6;
      console.log('[room.tsx] Mute updated:', mute ? 'OFF' : 'ON', 'Volume:', currentAudio.volume);
    }
  }, [currentAudio, mute]);

  // === ROOM NOT FOUND ===
  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-base-content/50">
        <h2 className="text-xl mb-2">Room not found</h2>
        <p>Try Town Square or another room.</p>
      </div>
    );
  }

  // === EXTERNAL URL (News to OANN) ===
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