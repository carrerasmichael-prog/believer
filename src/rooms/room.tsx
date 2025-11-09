// src/rooms/room.tsx
import { useParams } from "@/navigation";
import { ROOM_CONFIGS } from "@/rooms/roomConfig.ts";  // ← CENTRAL CONFIG
import { ndk } from "@/utils/ndk";
import { useEffect, useState } from "react";

const Room = () => {
  const { roomid = 'lobby' } = useParams();
  const roomId = roomid.toLowerCase();
  const config = ROOM_CONFIGS[roomId];

  // === PLAY SOUND ON ENTER ===
  useEffect(() => {
    if (config?.sound) {
      const audio = new Audio(`/${config.sound}`);
      audio.play().catch(() => {});
    }
  }, [config?.sound]);

  // === EXTERNAL URL (News → OANN) ===
  if (config?.externalUrl) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-base-300 flex items-center gap-3">
          {config.icon && <img src={`/${config.icon}`} className="w-8 h-8 rounded" alt={config.name} />}
          <div>
            <h1 className="text-2xl font-bold">{config.name}</h1>
            <p className="text-sm text-base-content/70">{config.subtitle}</p>
          </div>
        </div>
        <iframe
          src={config.externalUrl}
          className="flex-1 w-full border-0"
          title={config.name}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    );
  }

  // === NOSTR FEED ===
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    if (!config) return;

    const sub = ndk().subscribe(
      { kinds: [1], "#t": config.tags },
      { relayUrls: config.relayUrl ? [config.relayUrl] : undefined }
    );

    sub.on("event", (event: any) => {
      setPosts(prev => [...prev, event]);
    });

    return () => sub.stop();
  }, [config]);

  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-base-content/50">
        <h2 className="text-xl mb-2">Room not found</h2>
        <p>Try Lobby or another room.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-base-300 flex items-center gap-3">
        {config.icon && <img src={`/${config.icon}`} className="w-8 h-8 rounded" alt={config.name} />}
        <div>
          <h1 className="text-2xl font-bold">{config.name}</h1>
          <p className="text-sm text-base-content/70">{config.subtitle}</p>
        </div>
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