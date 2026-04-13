"use client";

import { useRef, useEffect, useState } from "react";

export function HublotVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Force muted + autoplay attributes for browser policy
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");

    const tryPlay = () => {
      if (!video.paused) {
        setPlaying(true);
        return;
      }
      video.play().then(() => setPlaying(true)).catch(() => {});
    };

    // Load and play
    video.load();
    tryPlay();

    // Retry on various ready events
    video.addEventListener("canplay", tryPlay);
    video.addEventListener("loadedmetadata", tryPlay);

    // Fallback: any user interaction
    const onInteraction = () => {
      tryPlay();
      removeListeners();
    };
    const removeListeners = () => {
      ["scroll", "touchstart", "click", "mousemove", "keydown"].forEach((evt) =>
        window.removeEventListener(evt, onInteraction)
      );
    };
    ["scroll", "touchstart", "click", "mousemove", "keydown"].forEach((evt) =>
      window.addEventListener(evt, onInteraction, { once: true, passive: true })
    );

    return () => {
      video.removeEventListener("canplay", tryPlay);
      video.removeEventListener("loadedmetadata", tryPlay);
      removeListeners();
    };
  }, []);

  return (
    <div className="mx-auto w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] rounded-full overflow-hidden shadow-[0_0_0_6px_#e5e7eb,0_0_0_8px_#d1d5db] relative">
      <img
        src="/hero-travel-poster.jpg"
        alt=""
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${playing ? "opacity-0" : "opacity-100"}`}
      />
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
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: "linear-gradient(145deg, rgba(255,255,255,0.25) 0%, transparent 40%, rgba(255,255,255,0.05) 100%)",
        }}
      />
    </div>
  );
}
