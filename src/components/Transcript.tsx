"use client";

import { useEffect, useRef } from "react";
import type { TranscriptEntry } from "@/hooks/useVapi";

type Props = {
  entries: TranscriptEntry[];
};

export default function Transcript({ entries }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [entries]);

  // Show last 8 max for kiosk readability
  const visible = entries.slice(-8);

  return (
    <div
      ref={scrollRef}
      className="w-full max-w-3xl mx-auto h-[22vh] sm:h-[26vh] overflow-y-auto px-4 pb-2 space-y-2 sm:space-y-3 scroll-smooth"
      style={{
        maskImage: "linear-gradient(to bottom, transparent 0%, black 12%, black 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 12%, black 100%)",
      }}
    >
      {visible.length === 0 && (
        <p className="text-center text-kyrie-gray text-lg pt-8 animate-fade-in">
          Listening...
        </p>
      )}
      {visible.map((e, i) => {
        const isUser = e.role === "user";
        return (
          <div
            key={`${i}-${e.text.slice(0, 12)}`}
            className={`flex animate-slide-up ${isUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={[
                "max-w-[80%] px-5 py-3 rounded-2xl text-lg leading-snug shadow-sm",
                isUser
                  ? "bg-kyrie-blue text-white rounded-br-md"
                  : "bg-kyrie-blueLight text-kyrie-ink rounded-bl-md border border-kyrie-blue/10",
              ].join(" ")}
            >
              {e.text}
            </div>
          </div>
        );
      })}
    </div>
  );
}
