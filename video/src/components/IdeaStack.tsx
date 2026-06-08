import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { FONT } from "../fonts";

const SPRING = { mass: 0.5, stiffness: 120, damping: 14 };
const STAGGER = 85;

const IDEAS = [
  "Automate this",
  "Automate that",
  "And this too",
  "All of it",
  "Just ship it",
  "Don't measure anything",
];

const IdeaItem: React.FC<{ text: string; index: number; totalDuration: number }> = ({
  text, index, totalDuration,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = index * STAGGER;
  const f = Math.max(0, frame - delay);
  if (f <= 0) return null;

  const enter = spring({ frame: f, fps, config: SPRING });
  const x = interpolate(enter, [0, 1], [50, 0]);
  const opacity = interpolate(enter, [0, 0.4], [0, 1], { extrapolateRight: "clamp" });

  // Each card dims as stack grows — oldest = most dim
  const age = Math.min(1, (frame - delay) / 400);
  const ageDim = interpolate(age, [0, 1], [1, 0.38]);

  const EXIT = totalDuration - 28;
  const exitProg = spring({ frame: Math.max(0, frame - EXIT), fps, config: { ...SPRING, stiffness: 200 } });
  const exitOp = 1 - interpolate(exitProg, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{
      transform: `translateX(${x}px)`,
      opacity: opacity * ageDim * exitOp,
      display: "flex", alignItems: "center", gap: 14,
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 10, padding: "14px 22px",
    }}>
      {/* Strike line over text */}
      <div style={{ position: "relative", flex: 1 }}>
        <span style={{
          fontFamily: FONT, fontSize: 34, fontWeight: 500,
          color: "rgba(255,255,255,0.75)", letterSpacing: "-0.01em",
        }}>{text}</span>
        {/* Strikethrough animates in after 0.5s */}
        {frame - delay > 30 && (
          <div style={{
            position: "absolute", top: "50%", left: 0,
            height: 2, background: "rgba(255,80,80,0.7)", borderRadius: 1,
            width: `${Math.min(100, ((frame - delay - 30) / 30) * 100)}%`,
          }} />
        )}
      </div>
    </div>
  );
};

export const IdeaStack: React.FC<{ duration: number; accentColor?: string }> = ({ duration }) => {
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "72%",
        background: "linear-gradient(to top, rgba(0,0,0,0.86) 0%, transparent 100%)",
      }} />
      <div style={{
        position: "absolute", bottom: 80, left: 56, right: 56,
        display: "flex", flexDirection: "column", gap: 10,
      }}>
        {IDEAS.map((idea, i) => (
          <IdeaItem key={i} text={idea} index={i} totalDuration={duration} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
