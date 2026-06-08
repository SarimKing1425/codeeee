import React from "react";
import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";

const SPRING = { mass: 0.5, stiffness: 120, damping: 14 };

interface SceneLowerThirdProps {
  emoji: string;
  text: string;
  duration: number;
  accentColor?: string;
}

export const SceneLowerThird: React.FC<SceneLowerThirdProps> = ({
  emoji,
  text,
  duration,
  accentColor = "#6366f1",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Enter
  const enter = spring({ frame, fps, config: SPRING });
  const enterY = interpolate(enter, [0, 1], [80, 0]);
  const enterOpacity = interpolate(enter, [0, 0.35], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Exit
  const EXIT_START = duration - 28;
  const exit = spring({
    frame: Math.max(0, frame - EXIT_START),
    fps,
    config: SPRING,
  });
  const exitY = interpolate(exit, [0, 1], [0, 60]);
  const exitOpacity = interpolate(exit, [0, 0.5], [1, 0], {
    extrapolateRight: "clamp",
  });

  const translateY = enterY + exitY;
  const opacity = enterOpacity * exitOpacity;

  // Accent bar grows in with its own spring
  const barScale = spring({ frame, fps, config: { ...SPRING, stiffness: 180 } });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Dark backdrop so card pops on any footage */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "28%",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.82) 0%, transparent 100%)",
        }}
      />

      {/* Card */}
      <div
        style={{
          position: "absolute",
          bottom: 160,
          left: 72,
          right: 72,
          transform: `translateY(${translateY}px)`,
          opacity,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          background: "rgba(10,10,18,0.78)",
          border: `1px solid rgba(255,255,255,0.09)`,
          borderRadius: 20,
          padding: "28px 32px",
          gap: 20,
        }}
      >
        {/* Left accent bar */}
        <div
          style={{
            width: 5,
            height: 64,
            borderRadius: 3,
            background: accentColor,
            flexShrink: 0,
            transform: `scaleY(${barScale})`,
            transformOrigin: "top center",
            boxShadow: `0 0 16px ${accentColor}99`,
          }}
        />

        {/* Emoji */}
        <span style={{ fontSize: 48, lineHeight: 1, flexShrink: 0 }}>{emoji}</span>

        {/* Text */}
        <span
          style={{
            fontSize: 52,
            fontWeight: 800,
            color: "#ffffff",
            fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
            letterSpacing: "-0.025em",
            lineHeight: 1.1,
          }}
        >
          {text}
        </span>
      </div>
    </AbsoluteFill>
  );
};
