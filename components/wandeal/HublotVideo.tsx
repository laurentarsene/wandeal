"use client";

import { useRef, useEffect } from "react";

export function HublotVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  return (
    <div className="relative w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] mx-auto shrink-0">
      {/* Frame ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#c9cfd4] via-[#e2e5e9] to-[#f0f1f3] shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]" />

      {/* Video inside the window */}
      <div className="absolute inset-[6px] rounded-full overflow-hidden">
        <video
          ref={videoRef}
          src="/hero-travel.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Glass glare */}
      <div
        className="absolute inset-[6px] rounded-full pointer-events-none"
        style={{
          background: "linear-gradient(145deg, rgba(255,255,255,0.35) 0%, transparent 45%, rgba(255,255,255,0.05) 100%)",
        }}
      />
    </div>
  );
}
