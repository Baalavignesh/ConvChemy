import React, { useState, useEffect } from "react";
import bgaudio from "../../assets/audio/bgmusic.mp3";

const MyFooter: React.FC = () => {
  const [audio] = useState(new Audio(bgaudio));
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = async () => {
    try {
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  useEffect(() => {
    // playAudio();
    const handleUserInteraction = () => {
      playAudio();
      document.removeEventListener("click", handleUserInteraction);
    };

    document.addEventListener("click", handleUserInteraction);
    return () => {
      document.removeEventListener("click", handleUserInteraction);
    };
  }, [audio]);

  useEffect(() => {
    audio.loop = true;
  }, [audio]);

  const handleAudio = async () => {
    console.log("change");
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      await audio.play();
    } else {
      audio.pause();
    }
  };

  return (
    <div
      className={`absolute bottom-0 p-4 left-0 z-50 flex cursor-pointer w-fit ${isPlaying ? "text-red-400" : "text-white"}`}
      onClick={() => handleAudio()}
    >
      <button className="mr-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z"
          />
        </svg>
      </button>
      <p className="amatic text-3xl">
        {isPlaying ? "Mute Music" : "Play Music"}
      </p>
    </div>
  );
};

export default MyFooter;
