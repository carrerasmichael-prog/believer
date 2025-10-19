// src/utils/playSound.ts
export const playSound = (src: string): void => {
  try {
    const audio = new Audio(src);
    audio
      .play()
      .then(() => {
        console.log(`Playing sound: ${src}`);
      })
      .catch((error) => {
        console.error(`Error playing sound ${src}:`, error);
        alert(`Failed to play sound: ${src}. Check console for details.`);
      });
  } catch (error) {
    console.error(`Error creating audio for ${src}:`, error);
    alert(`Failed to create audio: ${src}. Check console for details.`);
  }
};