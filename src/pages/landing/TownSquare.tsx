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
      {/* Background */}
      <img
        src="/images/town-square-base.png"
        alt="Believer Town Square"
        className="w-full h-auto select-none"
      />

      {/* Render slices */}
      {townSquareSlices.map(slice => {
        if (slice.isSound) {
          // Invisible clickable area over sound elements
          return (
            <div
              key={slice.id}
              onClick={() => handleClick(slice)}
              className="absolute cursor-pointer"
              style={{
                top: `${slice.top}px`,
                left: `${slice.left}px`,
                width: "50px", // adjust size as needed for click area
                height: "50px",
              }}
            />
          );
        } else if (slice.isRoom) {
          return (
            <img
              key={slice.id}
              src={slice.src}
              alt={slice.id}
              className="absolute cursor-pointer"
              style={{
                top: `${slice.top}px`,
                left: `${slice.left}px`,
                width: `${slice.width}px`,
                height: `${slice.height}px`,
              }}
              onClick={() => handleClick(slice)}
            />
          );
        }
        return null;
      })}
    </div>
  );
};

export default TownSquare;









