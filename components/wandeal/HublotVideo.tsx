"use client";

import { useRef, useEffect, useState } from "react";

export function HublotVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;

    const tryPlay = () => {
      video.play().then(() => setPlaying(true)).catch(() => {});
    };

    tryPlay();
    video.addEventListener("canplay", tryPlay);

    const onInteraction = () => tryPlay();
    window.addEventListener("scroll", onInteraction, { once: true, passive: true });
    window.addEventListener("touchstart", onInteraction, { once: true, passive: true });
    window.addEventListener("click", onInteraction, { once: true });

    return () => {
      video.removeEventListener("canplay", tryPlay);
      window.removeEventListener("scroll", onInteraction);
      window.removeEventListener("touchstart", onInteraction);
      window.removeEventListener("click", onInteraction);
    };
  }, []);

  return (
    <div className="mx-auto w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] rounded-full overflow-hidden shadow-[0_0_0_6px_#e5e7eb,0_0_0_8px_#d1d5db] relative">
      {/* Poster image — always visible as fallback */}
      <img
        src="/hero-travel-poster.jpg"
        alt=""
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${playing ? "opacity-0" : "opacity-100"}`}
      />
      {/* Video — fades in when playing */}
      <video
        ref={videoRef}
        src="/hero-travel.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${playing ? "opacity-100" : "opacity-0"}`}
      />
      {/* Glass glare */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: "linear-gradient(145deg, rgba(255,255,255,0.25) 0%, transparent 40%, rgba(255,255,255,0.05) 100%)",
        }}
      />
    </div>
  );
}
