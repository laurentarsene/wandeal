"use client";

import { useRef, useEffect } from "react";

export function HublotVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  return (
    <div className="mx-auto w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] rounded-full overflow-hidden shadow-[0_0_0_6px_#e5e7eb,0_0_0_8px_#d1d5db] relative">
      <video
        ref={videoRef}
        src="/hero-travel.mp4"
        autoPlay
        loop
        muted
        playsInline
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
      {/* Glass glare */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: "linear-gradient(145deg, rgba(255,255,255,0.3) 0%, transparent 45%, rgba(255,255,255,0.05) 100%)",
        }}
      />
    </div>
  );
}
