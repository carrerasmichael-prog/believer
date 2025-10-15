import { useNavigate } from 'react-router-dom';
import { rooms } from '../rooms/roomlist';

const TownSquare = () => {
  const navigate = useNavigate();

  return (
    <div className="town-square">
      <img src="/images/town-square.png" alt="Town Square" style={{ width: '100%' }} />

      {Object.keys(rooms).map(roomid => (
        <div
          key={roomid}
          onClick={() => navigate(`/room/${roomid}`)}
          style={{ position: 'absolute', left: '20%', top: '50%', width: '10%', height: '15%' }}
        >
          <img
            src={`/images/${roomid}-slice.png`}
            alt={`${rooms[roomid].name} room door`}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      ))}
    </div>
  );
};

export default TownSquare;
