"use client";

import { useRef, useEffect } from "react";

export function HublotVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Safari needs these attributes set programmatically
    video.setAttribute("webkit-playsinline", "true");
    video.setAttribute("x-webkit-airplay", "deny");
    video.muted = true;
    video.playsInline = true;

    const tryPlay = () => {
      const p = video.play();
      if (p) p.catch(() => {});
    };

    // Try immediately
    tryPlay();

    // Retry on loadeddata
    video.addEventListener("loadeddata", tryPlay);

    // Fallback: play on first user interaction (scroll, touch, click)
    const onInteraction = () => {
      tryPlay();
      window.removeEventListener("scroll", onInteraction);
      window.removeEventListener("touchstart", onInteraction);
      window.removeEventListener("click", onInteraction);
    };
    window.addEventListener("scroll", onInteraction, { once: true, passive: true });
    window.addEventListener("touchstart", onInteraction, { once: true, passive: true });
    window.addEventListener("click", onInteraction, { once: true });

    return () => {
      video.removeEventListener("loadeddata", tryPlay);
      window.removeEventListener("scroll", onInteraction);
      window.removeEventListener("touchstart", onInteraction);
      window.removeEventListener("click", onInteraction);
    };
  }, []);

  return (
    <div className="mx-auto w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] rounded-full overflow-hidden shadow-[0_0_0_6px_#e5e7eb,0_0_0_8px_#d1d5db] relative">
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={videoRef}
        poster="/hero-travel-poster.jpg"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      >
        <source src="/hero-travel.mp4" type="video/mp4" />
      </video>
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
