import React from "react";
import { playSound } from "@/utils/playSound";
import { useNavigate } from "react-router-dom";
import { rooms } from "@/rooms/roomlist";

const TownSquare: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = (sliceId: string) => {
    const soundSlices = [
      "church-bell",
      "atheism-flag",
      "buddha",
      "muhammad",
      "brahma",
      "star-of-david",
    ];

    if (soundSlices.includes(sliceId)) {
      playSound(`/sounds/${sliceId}.mp3`);
    } else {
      navigate(`/room/${sliceId}`);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Background */}
      <img
        src="/images/town-square-base.png"
        alt="Believer Town Square"
        className="w-full h-auto select-none"
      />

      {/* Room slices */}
      {Object.keys(rooms).map((roomId) => (
        <img
          key={roomId}
          src={`/images/slices/rooms/${roomId}-slice.png`}
          alt={`${rooms[roomId].name} room door`}
          className="absolute cursor-pointer"
          style={{ top: rooms[roomId].top, left: rooms[roomId].left, width: rooms[roomId].width }}
          onClick={() => handleClick(roomId)}
        />
      ))}

      {/* Sound slices (not linked to rooms) */}
      {[
        { id: "church-bell", top: "100px", left: "200px", width: "50px" },
        { id: "atheism-flag", top: "150px", left: "400px", width: "50px" },
        { id: "buddha", top: "200px", left: "300px", width: "50px" },
        { id: "muhammad", top: "250px", left: "500px", width: "50px" },
        { id: "brahma", top: "300px", left: "600px", width: "50px" },
        { id: "star-of-david", top: "350px", left: "700px", width: "50px" },
      ].map((slice) => (
        <img
          key={slice.id}
          src={`/images/slices/sounds/${slice.id}-slice.png`} // placeholder image
          alt={slice.id}
          className="absolute cursor-pointer"
          style={{ top: slice.top, left: slice.left, width: slice.width }}
          onClick={() => handleClick(slice.id)}
        />
      ))}
    </div>
  );
};

export default TownSquare;

