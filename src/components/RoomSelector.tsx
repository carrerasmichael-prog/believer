// src/components/RoomSelector.tsx
import { ROOM_CONFIGS } from '@/rooms/roomConfig';
import { useNavigate, useParams } from '@/navigation';

const RoomSelector = () => {
  const navigate = useNavigate();
  const { roomid = 'lobby' } = useParams();
  const current = roomid.toLowerCase();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (ROOM_CONFIGS[id]) {
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
