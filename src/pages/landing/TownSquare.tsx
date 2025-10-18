// src/pages/landing/TownSquare.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { playSound } from "@/utils/playSound";
import { townSquareSlices, TownSquareSlice } from "@/constants/townSquareSlices";

const TownSquare: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = (slice: TownSquareSlice) => {
    if (slice.isSound) {
      playSound(slice.src);
    } else if (slice.isRoom) {
      navigate(`/room/${slice.id}`);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Base Town Square Image */}
      <img
        src="/images/town-square-base.png"
        alt="Believer Town Square"
        className="w-full h-auto select-none"
      />

      {/* Clickable slices */}
      {townSquareSlices.map(slice => (
        <div
          key={slice.id}
          onClick={() => handleClick(slice)}
          className="absolute cursor-pointer transition-all duration-150"
          style={{
            top: `${slice.top}px`,
            left: `${slice.left}px`,
            width: `${slice.width || 50}px`,
            height: `${slice.height || 50}px`,
            // Uncomment the next line to see clickable areas during development
            // backgroundColor: "rgba(255,0,0,0.2)",
          }}
          // Hover feedback for UX
          onMouseEnter={e => {
            const target = e.currentTarget as HTMLDivElement;
            target.style.outline = "2px solid rgba(255,255,255,0.5)";
          }}
          onMouseLeave={e => {
            const target = e.currentTarget as HTMLDivElement;
            target.style.outline = "none";
          }}
        />
      ))}
    </div>
  );
};

export default TownSquare;











