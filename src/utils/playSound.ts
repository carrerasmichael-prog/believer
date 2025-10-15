export const playSound = (url: string) => {
  const audio = new Audio(url);
  audio.play().catch((err) => console.error("Sound playback failed:", err));
};
