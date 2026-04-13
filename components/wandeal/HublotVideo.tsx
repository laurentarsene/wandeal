"use client";

import { useRef, useEffect } from "react";

// Airplane window (hublot) shape via clip-path
// Slightly elongated oval with a flat bottom — like looking out a plane window
const HUBLOT_CLIP = "ellipse(48% 46% at 50% 48%)";

export function HublotVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Ensure autoplay works on mobile
    videoRef.current?.play().catch(() => {});
  }, []);

  return (
    <div className="relative w-[180px] h-[200px] sm:w-[220px] sm:h-[240px] mx-auto shrink-0">
      {/* Outer ring — window frame */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#d1d5db] via-[#e5e7eb] to-[#f3f4f6] rounded-[50%]"
        style={{ clipPath: HUBLOT_CLIP }}
      />

      {/* Video — clipped to window shape, slightly inset */}
      <div
        className="absolute inset-[6px] overflow-hidden"
        style={{ clipPath: HUBLOT_CLIP }}
      >
        <video
          ref={videoRef}
          src="/hero-travel.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-110"
        />
      </div>

      {/* Glare overlay — subtle reflection like real glass */}
      <div
        className="absolute inset-[6px] pointer-events-none"
        style={{
          clipPath: HUBLOT_CLIP,
          background: "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)",
        }}
      />
    </div>
  );
}
