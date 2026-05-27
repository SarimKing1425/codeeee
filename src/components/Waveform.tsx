"use client";

import { useEffect, useMemo, useRef } from "react";

type Props = {
  volumeLevel: number;
  active: boolean;
  bars?: number;
  /** Inner radius in pixels at which bars start, measured from center. */
  innerRadius?: number;
};

export default function Waveform({
  volumeLevel,
  active,
  bars = 56,
  innerRadius = 240,
}: Props) {
  const barRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const seedsRef = useRef<number[]>([]);
  const phaseRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const volumeRef = useRef(0);
  const activeRef = useRef(active);

  const seeds = useMemo(() => {
    if (seedsRef.current.length !== bars) {
      seedsRef.current = Array.from({ length: bars }, () => Math.random());
    }
    return seedsRef.current;
  }, [bars]);

  useEffect(() => {
    volumeRef.current = volumeLevel;
  }, [volumeLevel]);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const tick = () => {
      phaseRef.current += 0.07;
      const v = volumeRef.current;
      const isActive = activeRef.current;
      const baseLen = isActive ? 8 + v * 30 : 4;

      for (let i = 0; i < bars; i++) {
        const el = barRefs.current[i];
        if (!el) continue;
        const seed = seeds[i] ?? 0.5;
        const wobble = Math.sin(phaseRef.current + seed * 6.28318) * 0.5 + 0.5;
        const len = baseLen + (isActive ? wobble * (10 + v * 26) : wobble * 2);
        el.style.height = `${len}px`;
        el.style.opacity = isActive ? `${0.55 + wobble * 0.45}` : "0.3";
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [bars, seeds]);

  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      aria-hidden
    >
      {Array.from({ length: bars }).map((_, i) => {
        const angle = (i / bars) * 360;
        return (
          <div
            key={i}
            className="absolute left-0 top-0"
            style={{
              transform: `rotate(${angle}deg) translateY(-${innerRadius}px)`,
              transformOrigin: "0 0",
            }}
          >
            <span
              ref={(el) => {
                barRefs.current[i] = el;
              }}
              className="block w-[3px] rounded-full bg-gradient-to-t from-kyrie-blue/40 via-kyrie-blue to-kyrie-blue"
              style={{
                height: "4px",
                boxShadow: "0 0 6px rgba(27,79,114,0.35)",
                transformOrigin: "top center",
                transition: "height 90ms ease-out, opacity 120ms ease-out",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
