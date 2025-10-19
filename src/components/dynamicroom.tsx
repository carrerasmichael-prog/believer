import { useParams } from 'react-router-dom';
import { rooms } from '../rooms/roomlist';
import RoomTemplate from './roomtemplate';

const DynamicRoom = () => {
  const { roomid } = useParams<{ roomid: string }>();
  const config = rooms[roomid?.toLowerCase() || 'lobby'];

  if (!config) return <div>Room not found</div>;

  return <RoomTemplate config={config} />;
};

export default DynamicRoom;
