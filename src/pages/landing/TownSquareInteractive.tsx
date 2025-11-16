// src/pages/landing/TownSquareInteractive.tsx
import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "@/navigation";
import { playSound } from "@/utils/playSound";
import { townSquareSlices, TownSquareSlice } from "@/constants/townSquareSlices";

const BASE_WIDTH = 1920;
const BASE_HEIGHT = 1080;
const DEBUG_MODE = false;

const TownSquareInteractive: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [draggingSlice, setDraggingSlice] = useState<string | null>(null);
  const [slices, setSlices] = useState<TownSquareSlice[]>(townSquareSlices);

  const updateScale = () => {
    if (!containerRef.current) return;
    const img = containerRef.current.querySelector("img.town-square");
    if (!img) return;

    const { width: imgWidth, height: imgHeight } = img.getBoundingClientRect();
    const uniformScale = Math.min(imgWidth / BASE_WIDTH, imgHeight / BASE_HEIGHT);
    setScale(uniformScale || 1);
  };

  useEffect(() => {
    const img = containerRef.current?.querySelector("img.town-square") as HTMLImageElement | null;
    if (!img) return;

    const handleLoad = () => updateScale();
    img.addEventListener("load", handleLoad);
    window.addEventListener("resize", updateScale);

    if (img.complete) handleLoad();

    return () => {
      img.removeEventListener("load", handleLoad);
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  const handleClick = (slice: TownSquareSlice) => {
    if (!DEBUG_MODE) {
      if (slice.isSound) playSound(slice.src);
      else if (slice.isRoom) navigate(slice.src);
    }
  };

  const handleMouseDown = (id: string) => (e: React.MouseEvent) => {
    if (!DEBUG_MODE) return;
    e.preventDefault();
    setDraggingSlice(id);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!DEBUG_MODE || !draggingSlice || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newLeft = (e.clientX - containerRect.left) / scale;
    const newTop = (e.clientY - containerRect.top) / scale;

    setSlices((prev) =>
      prev.map((s) =>
        s.id === draggingSlice
          ? {
              ...s,
              left: Math.max(0, Math.min(BASE_WIDTH - s.width, newLeft)),
              top: Math.max(0, Math.min(BASE_HEIGHT - s.height, newTop)),
            }
          : s
      )
    );
  };

  const handleMouseUp = () => {
    if (!DEBUG_MODE) return;
    setDraggingSlice(null);
  };

  useEffect(() => {
    if (!DEBUG_MODE) return;
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingSlice, scale, slices]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: `${BASE_WIDTH}px`,
        margin: "0 auto",
        overflow: "auto",
        height: "100vh",
      }}
    >
      <img
        src="/images/town-square-base.png"
        alt="Town Square"
        className="town-square"
        style={{
          width: "100%",
          height: "auto",
          display: "block",
        }}
      />
      {DEBUG_MODE && (
        <button
          onClick={() => {
            const json = slices.map((slice) => ({
              id: slice.id,
              topPercent: ((slice.top / BASE_HEIGHT) * 100).toFixed(2) + "%",
              leftPercent: ((slice.left / BASE_WIDTH) * 100).toFixed(2) + "%",
              widthPercent: ((slice.width / BASE_WIDTH) * 100).toFixed(2) + "%",
              heightPercent: ((slice.height / BASE_HEIGHT) * 100).toFixed(2) + "%",
              isSound: slice.isSound,
              isRoom: slice.isRoom,
              src: slice.src,
            }));
            navigator.clipboard.writeText(JSON.stringify(json, null, 2));
            alert("JSON copied to clipboard!");
          }}
          style={{
            position: "absolute",
            top: "1vh",
            right: "5vw",
            zIndex: 10,
            padding: "8px 16px",
            fontSize: "14px",
          }}
        >
          Save Button Positions
        </button>
      )}
      {slices.map((slice) => {
        const scaledTop = slice.top * scale;
        const scaledLeft = slice.left * scale;
        const scaledWidth = slice.width * scale;
        const scaledHeight = slice.height * scale;

        return (
          <div
            key={slice.id}
            onClick={() => handleClick(slice)}
            title={slice.id}
            onMouseDown={handleMouseDown(slice.id)}
            style={{
              position: "absolute",
              top: scaledTop,
              left: scaledLeft,
              width: scaledWidth,
              height: scaledHeight,
              cursor: DEBUG_MODE ? "move" : "pointer",
              background: slice.isRoom ? `url(/images/slices/rooms/${slice.id}.png)` : "transparent",  // ← COMMA HERE
              backgroundSize: "cover",  // ← NOW VALID — NO ERROR
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "transparent",
              textAlign: "center",
              fontSize: `${scaledWidth * 0.3}px`,
              borderRadius: "6px",
              transition: "transform 0.15s, box-shadow 0.15s",
              zIndex: 5,
          }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 0 25px rgba(255, 255, 0, 1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 0 0px rgba(255, 255, 0, 0)";
            }}
          />
        );
      })}
    </div>
  );
};

export default TownSquareInteractive;