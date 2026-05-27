"use client";

import { useState } from "react";
import type { KioskState } from "@/hooks/useVapi";

type Props = {
  state: KioskState;
  isSpeaking: boolean;
  volumeLevel: number;
};

export default function Avatar({ state, isSpeaking, volumeLevel }: Props) {
  const [hasImage, setHasImage] = useState(true);

  const intensity = Math.min(1, volumeLevel * 1.6);
  const talking = isSpeaking && state === "active";

  // Subtle "alive while talking" motion. Not real lip sync — a static photo
  // can't move its mouth — but a gentle volume-reactive scale + lean reads as
  // life without distorting the image.
  const scale =
    state === "active" ? 1 + (talking ? intensity * 0.02 : 0) : 1;
  const lift = state === "active" && talking ? intensity * 4 : 0;

  return (
    <div className="relative flex items-center justify-center">
      <div
        className={[
          "relative h-[54vh] min-h-[300px] max-h-[620px] aspect-[3/4]",
          "flex items-end justify-center",
          state === "idle" ? "animate-breathe" : "",
          state === "active" ? "animate-float" : "",
          state === "connecting" ? "opacity-90 animate-glow-pulse" : "",
        ].join(" ")}
        style={{
          transform: `scale(${scale}) translateY(-${lift}px)`,
          transformOrigin: "bottom center",
          transition: "transform 110ms ease-out",
        }}
      >
        {hasImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/avatar.png"
            alt="Kyrie"
            className="h-full w-full object-contain"
            onError={() => setHasImage(false)}
          />
        ) : (
          <PlaceholderAvatar speaking={talking} />
        )}
      </div>
    </div>
  );
}

function PlaceholderAvatar({ speaking }: { speaking: boolean }) {
  return (
    <svg
      viewBox="0 0 400 520"
      className="h-full w-full"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Kyrie placeholder avatar"
    >
      <defs>
        <linearGradient id="suit" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#22365C" />
          <stop offset="100%" stopColor="#162542" />
        </linearGradient>
        <linearGradient id="skin" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8A5A3B" />
          <stop offset="100%" stopColor="#6E4329" />
        </linearGradient>
      </defs>

      {/* Shoulders / navy suit */}
      <path d="M40 520 C 70 410, 140 380, 200 380 C 260 380, 330 410, 360 520 Z" fill="url(#suit)" />
      {/* Lapels */}
      <path d="M168 392 L200 430 L182 520 L150 520 Z" fill="#101B30" />
      <path d="M232 392 L200 430 L218 520 L250 520 Z" fill="#101B30" />
      {/* Light blue shirt */}
      <path d="M186 396 L200 440 L214 396 Z" fill="#D6EAF8" />
      {/* Maroon tie */}
      <path d="M194 405 L206 405 L212 520 L188 520 Z" fill="#7B2D3A" />
      {/* Pocket square */}
      <path d="M300 470 l18 -6 l-2 16 Z" fill="#F5F8FA" />

      {/* Neck */}
      <rect x="180" y="318" width="40" height="70" fill="url(#skin)" />

      {/* Bald head */}
      <ellipse cx="200" cy="220" rx="86" ry="104" fill="url(#skin)" />
      <ellipse cx="172" cy="150" rx="40" ry="26" fill="#ffffff" opacity="0.06" />

      {/* Brows */}
      <rect x="156" y="196" width="30" height="4" rx="2" fill="#2A1A12" />
      <rect x="214" y="196" width="30" height="4" rx="2" fill="#2A1A12" />
      {/* Eyes */}
      <ellipse cx="171" cy="214" rx="7" ry="9" fill="#1A100B" />
      <ellipse cx="229" cy="214" rx="7" ry="9" fill="#1A100B" />
      {/* Goatee hint */}
      <path d="M178 286 Q200 300 222 286 Q210 312 200 314 Q190 312 178 286 Z" fill="#2A1A12" opacity="0.55" />

      {/* Mouth — smile vs. open while speaking */}
      {speaking ? (
        <ellipse cx="200" cy="276" rx="16" ry="10" fill="#3A1F1F" />
      ) : (
        <path d="M178 272 Q200 292 222 272" stroke="#3A1F1F" strokeWidth="4" strokeLinecap="round" fill="none" />
      )}
    </svg>
  );
}
