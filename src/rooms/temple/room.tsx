import React from 'react';
import { roomConfig } from './roomConfig';

const Room = () => {
  return (
    <div className="room-container">
      <h1>{roomConfig.name}</h1>
      {/* Feed component here using roomConfig.tag */}
    </div>
  );
};

export default Room;
