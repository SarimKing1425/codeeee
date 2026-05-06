"use client";

import Image from "next/image";
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
  const glowOpacity = state === "active" ? 0.45 + intensity * 0.5 : state === "connecting" ? 0.5 : 0.25;
  const glowScale = state === "active" ? 1 + intensity * 0.06 : 1;

  return (
    <div className="relative flex items-center justify-center">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 rounded-full blur-3xl transition-all duration-200"
        style={{
          background:
            "radial-gradient(circle, rgba(214,234,248,0.55) 0%, rgba(27,79,114,0.35) 45%, rgba(0,0,0,0) 75%)",
          opacity: glowOpacity,
          transform: `scale(${glowScale})`,
        }}
      />

      {state === "connecting" && (
        <>
          <span className="absolute inset-0 -z-10 rounded-full border-2 border-kyrie-blueLight/60 animate-ring-pulse" />
          <span className="absolute inset-0 -z-10 rounded-full border-2 border-kyrie-blueLight/40 animate-ring-pulse [animation-delay:0.6s]" />
        </>
      )}

      <div
        className={[
          "relative w-[42vh] h-[42vh] min-w-[280px] min-h-[280px] max-w-[520px] max-h-[520px]",
          "rounded-full overflow-hidden",
          "ring-2 ring-kyrie-blueLight/30 shadow-2xl shadow-kyrie-blue/40",
          state === "idle" ? "animate-breathe" : "",
          state === "active" ? "animate-float" : "",
        ].join(" ")}
        style={{
          transform: state === "active" ? `scale(${1 + intensity * 0.03})` : undefined,
          transition: "transform 120ms ease-out",
        }}
      >
        {hasImage ? (
          <Image
            src="/avatar.png"
            alt="Kyrie"
            fill
            priority
            sizes="(max-width: 768px) 80vw, 42vh"
            className="object-cover"
            onError={() => setHasImage(false)}
          />
        ) : (
          <PlaceholderAvatar speaking={isSpeaking && state === "active"} />
        )}

        {state === "active" && (
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 40%, rgba(214,234,248,0.18) 0%, rgba(0,0,0,0) 60%)",
              opacity: 0.4 + intensity * 0.6,
              transition: "opacity 120ms ease-out",
            }}
          />
        )}
      </div>
    </div>
  );
}

function PlaceholderAvatar({ speaking }: { speaking: boolean }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className="absolute inset-0 w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Kyrie placeholder avatar"
    >
      <defs>
        <radialGradient id="bg" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#1B4F72" />
          <stop offset="100%" stopColor="#0A1A2A" />
        </radialGradient>
        <linearGradient id="suit" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1F2A44" />
          <stop offset="100%" stopColor="#0E1626" />
        </linearGradient>
        <linearGradient id="skin" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E8C9A8" />
          <stop offset="100%" stopColor="#C9A07C" />
        </linearGradient>
      </defs>

      <rect width="400" height="400" fill="url(#bg)" />

      {/* Shoulders / suit */}
      <path d="M40 400 C 80 300, 140 270, 200 270 C 260 270, 320 300, 360 400 Z" fill="url(#suit)" />
      {/* Lapels */}
      <path d="M170 285 L200 320 L180 400 L155 400 Z" fill="#0A1220" opacity="0.85" />
      <path d="M230 285 L200 320 L220 400 L245 400 Z" fill="#0A1220" opacity="0.85" />
      {/* Shirt */}
      <path d="M188 290 L200 330 L212 290 Z" fill="#F5F8FA" />
      {/* Tie */}
      <path d="M195 300 L205 300 L210 400 L190 400 Z" fill="#1B4F72" />

      {/* Neck */}
      <rect x="180" y="240" width="40" height="50" fill="url(#skin)" />

      {/* Head */}
      <ellipse cx="200" cy="180" rx="78" ry="92" fill="url(#skin)" />

      {/* Hair */}
      <path
        d="M122 170 C 125 110, 175 80, 200 80 C 235 80, 280 110, 278 170 C 268 145, 240 130, 200 132 C 160 130, 132 145, 122 170 Z"
        fill="#1A1A24"
      />

      {/* Eyes */}
      <ellipse cx="172" cy="180" rx="6" ry="8" fill="#0A1220" />
      <ellipse cx="228" cy="180" rx="6" ry="8" fill="#0A1220" />
      {/* Brows */}
      <rect x="160" y="160" width="26" height="3" rx="1.5" fill="#1A1A24" />
      <rect x="214" y="160" width="26" height="3" rx="1.5" fill="#1A1A24" />

      {/* Mouth — toggles between closed line and open ellipse for "speaking" */}
      {speaking ? (
        <ellipse cx="200" cy="225" rx="14" ry="9" fill="#3A1F1F" />
      ) : (
        <path d="M184 225 Q 200 232 216 225" stroke="#3A1F1F" strokeWidth="3" strokeLinecap="round" fill="none" />
      )}
    </svg>
  );
}
