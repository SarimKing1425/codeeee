import React from "react";
import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";

const SPRING = { mass: 0.5, stiffness: 120, damping: 14 };
const STAGGER = 90; // frames between each idea popping in

const IDEAS = [
  "Automate this",
  "Automate that",
  "And this too",
  "All of it",
  "Just hit deploy",
  "Move fast, break things",
];

interface IdeaStackProps {
  duration: number;
  accentColor?: string;
}

const IdeaCard: React.FC<{
  text: string;
  index: number;
  totalDuration: number;
}> = ({ text, index, totalDuration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = index * STAGGER;
  const adjustedFrame = Math.max(0, frame - delay);

  const enter = spring({ frame: adjustedFrame, fps, config: SPRING });
  const enterX = interpolate(enter, [0, 1], [60, 0]);
  const enterOpacity = interpolate(enter, [0, 0.4], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Scale down slightly when older (newer items feel "fresher")
  const ageRatio = Math.min(1, (frame - delay) / 300);
  const ageDim = interpolate(ageRatio, [0, 1], [1, 0.55]);

  // Collective exit: all fade out last 30 frames
  const EXIT_START = totalDuration - 30;
  const exitProgress = spring({
    frame: Math.max(0, frame - EXIT_START),
    fps,
    config: { ...SPRING, stiffness: 200 },
  });
  const exitOpacity = 1 - interpolate(exitProgress, [0, 1], [0, 1], {
    extrapolateRight: "clamp",
  });

  if (adjustedFrame <= 0) return null;

  return (
    <div
      style={{
        transform: `translateX(${enterX}px)`,
        opacity: enterOpacity * ageDim * exitOpacity,
        background: "rgba(12,12,22,0.80)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 14,
        padding: "18px 28px",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      {/* Bullet */}
      <div
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.25)",
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontSize: 38,
          fontWeight: 600,
          color: "rgba(255,255,255,0.88)",
          fontFamily: "'Inter', system-ui, sans-serif",
          letterSpacing: "-0.015em",
        }}
      >
        {text}
      </span>
    </div>
  );
};

export const IdeaStack: React.FC<IdeaStackProps> = ({ duration }) => {
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "65%",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: 160,
          left: 72,
          right: 72,
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {IDEAS.map((idea, i) => (
          <IdeaCard
            key={i}
            text={idea}
            index={i}
            totalDuration={duration}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
