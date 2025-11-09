// src/components/RoomSelector.tsx
import { ROOM_CONFIGS } from '@/rooms/roomConfig';
import { useNavigate, useParams } from '@/navigation';

const RoomSelector = () => {
  const navigate = useNavigate();
  const { roomid = 'lobby' } = useParams();
  const current = roomid.toLowerCase();

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (ROOM_CONFIGS[id]) {
      // Play sound with retry to handle autoplay blocks
      const playSoundWithRetry = async (roomId: string, retries = 3, delay = 500) => {
        const soundPath = ROOM_CONFIGS[roomId]?.sound || 'sounds/door.mp3';
        for (let i = 0; i < retries; i++) {
          try {
            const audio = new Audio(`/${soundPath}`);
            audio.volume = 0.6;
            await audio.play();
            console.log('[RoomSelector.tsx] Sound played successfully:', soundPath);
            return;
          } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.log(`[RoomSelector.tsx] Autoplay blocked or failed (attempt ${i + 1}):`, errorMessage);
            if (i < retries - 1) {
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        }
        console.warn('[RoomSelector.tsx] Failed to play sound after retries:', soundPath);
      };
      await playSoundWithRetry(id); // Await sound playback before navigating
      navigate(`/room/${id}`);
    }
  };

  return (
    <select
      value={current}
      onChange={handleChange}
      className="select select-bordered select-sm w-full max-w-xs"
    >
      {Object.entries(ROOM_CONFIGS).map(([id, config]) => (
        <option key={id} value={id}>
          {config.name}
        </option>
      ))}
    </select>
  );
};

export default RoomSelector;