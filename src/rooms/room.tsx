// src/rooms/room.tsx
import { useParams } from "@/navigation";
import { ROOM_CONFIGS } from "@/rooms/roomConfig";
import { ndk } from "@/utils/ndk";
import { useEffect, useState } from "react";
import { useSettingsStore } from "@/stores/settings";
import TownSquareInteractive from "@/pages/landing/TownSquareInteractive";

const Room = () => {
  const { roomid = 'square' } = useParams();
  const roomId = roomid.toLowerCase().trim();
  const config = ROOM_CONFIGS[roomId];
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [showPortal, setShowPortal] = useState(false);
  const [savedScroll, setSavedScroll] = useState(0);

  const mute = useSettingsStore((state) => state.mute);

  // === PLAY SOUND ===
  useEffect(() => {
    if (roomId && config?.sound) {
      const audio = new Audio(`/${config.sound}`);
      audio.volume = mute ? 0 : 0.6;
      setCurrentAudio(audio);
      audio.play().catch(() => {});
      return () => { audio.pause(); audio.src = ''; setCurrentAudio(null); };
    } else if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = '';
      setCurrentAudio(null);
    }
  }, [roomId, config?.sound]);

  // === MUTE LIVE ===
  useEffect(() => {
    if (currentAudio) currentAudio.volume = mute ? 0 : 0.6;
  }, [currentAudio, mute]);

  // === PORTAL OPEN ===
  const openPortal = () => {
    setSavedScroll(window.scrollY);
    setShowPortal(true);
    document.body.style.overflow = 'hidden';
  };

  // === PORTAL CLOSE ===
  const closePortal = () => {
    setShowPortal(false);
    document.body.style.overflow = '';
    window.scrollTo(0, savedScroll);
  };

  // === NOT FOUND ===
  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-base-content/50">
        <h2 className="text-xl mb-2">Room not found</h2>
        <p>Try Town Square or another room.</p>
      </div>
    );
  }

  // === EXTERNAL URL ===
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

  // === NOSTR FEED ===
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
      {/* HEADER */}
      <div className="p-4 border-b border-base-300 text-center bg-base-100 relative">
        <h1
          className={`
            text-2xl font-bold cursor-pointer hover:underline transition
            ${roomId === 'square' ? 'text-primary' : ''}
          `}
          onClick={() => roomId === 'square' && openPortal()}
        >
          {config.name}
        </h1>
        <p className="text-sm text-base-content/70 mt-1">{config.subtitle}</p>
      </div>

      {/* FEED */}
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

      {/* PORTAL OVERLAY */}
      {showPortal && roomId === 'square' && (
        <div 
          className="fixed inset-0 z-[999999] bg-black/95 flex items-center justify-center p-4"
          style={{ pointerEvents: 'auto' }}
        >
          <div className="relative w-full h-full max-w-7xl max-h-[90vh] bg-black rounded-3xl overflow-hidden shadow-2xl">
            <button
              onClick={closePortal}
              className="absolute top-4 right-4 z-50 btn btn-circle btn-ghost text-white hover:bg-white/20"
              style={{ pointerEvents: 'auto' }}
        >
              ✕
            </button>
            <div className="w-full h-full">
              <TownSquareInteractive />
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default Room;