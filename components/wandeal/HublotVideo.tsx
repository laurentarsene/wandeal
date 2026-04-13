"use client";

import { useRef, useEffect } from "react";

export function HublotVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;

    const tryPlay = () => {
      video.play().catch(() => {});
    };

    tryPlay();
    video.addEventListener("loadeddata", tryPlay);

    const onInteraction = () => {
      tryPlay();
      cleanup();
    };
    const cleanup = () => {
      window.removeEventListener("scroll", onInteraction);
      window.removeEventListener("touchstart", onInteraction);
      window.removeEventListener("click", onInteraction);
    };
    window.addEventListener("scroll", onInteraction, { once: true, passive: true });
    window.addEventListener("touchstart", onInteraction, { once: true, passive: true });
    window.addEventListener("click", onInteraction, { once: true });

    return () => {
      video.removeEventListener("loadeddata", tryPlay);
      cleanup();
    };
  }, []);

  return (
    <div className="mx-auto w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] rounded-full overflow-hidden shadow-[0_0_0_6px_#e5e7eb,0_0_0_8px_#d1d5db] relative">
      <video
        ref={videoRef}
        src="/hero-travel.mp4"
        poster="/hero-travel-poster.jpg"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
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
