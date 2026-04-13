"use client";

import { useRef, useEffect, useState } from "react";

export function HublotVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.setAttribute("muted", "");

    const tryPlay = () => {
      if (!video.paused) { setPlaying(true); return; }
      video.play().then(() => setPlaying(true)).catch(() => {});
    };

    tryPlay();
    video.addEventListener("canplay", tryPlay);

    const onInteraction = () => tryPlay();
    window.addEventListener("scroll", onInteraction, { once: true, passive: true });
    window.addEventListener("touchstart", onInteraction, { once: true, passive: true });
    window.addEventListener("click", onInteraction, { once: true });
    window.addEventListener("mousemove", onInteraction, { once: true, passive: true });

    return () => {
      video.removeEventListener("canplay", tryPlay);
      window.removeEventListener("scroll", onInteraction);
      window.removeEventListener("touchstart", onInteraction);
      window.removeEventListener("click", onInteraction);
      window.removeEventListener("mousemove", onInteraction);
    };
  }, []);

  return (
    <div
      className="mx-auto rounded-full overflow-hidden relative w-[140px] h-[140px] sm:w-[200px] sm:h-[200px]"
      style={{ boxShadow: "0 0 0 5px #e5e7eb, 0 0 0 7px #d1d5db" }}
    >
      {/* Poster image as base — always visible */}
      <img
        src="/hero-travel-poster.jpg"
        alt=""
        style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
      />
      {/* Video overlay — fades in when playing */}
      <video
        ref={videoRef}
        src="/hero-travel.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        style={{
          position: "absolute",
          top: 0, left: 0, width: "100%", height: "100%",
          objectFit: "cover",
          opacity: playing ? 1 : 0,
          transition: "opacity 0.5s",
        }}
      />
      {/* Glass glare */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0, bottom: 0,
          borderRadius: "50%",
          pointerEvents: "none",
          background: "linear-gradient(145deg, rgba(255,255,255,0.25) 0%, transparent 40%, rgba(255,255,255,0.05) 100%)",
        }}
      />
    </div>
  );
}
