import React from "react";
import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";

export interface LowerThirdProps {
  label: string;
  title: string;
  /** Total frames this component is mounted for (from parent Sequence) */
  duration: number;
  accentColor?: string;
}

const EXIT_BUFFER = 25; // frames before unmount to start exit spring

export const LowerThird: React.FC<LowerThirdProps> = ({
  label,
  title,
  duration,
  accentColor = "#6366f1",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Enter ──────────────────────────────────────────────────────────────────
  const enterSpring = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 140, mass: 0.75 },
  });

  const labelSpring = spring({
    frame: frame - 6,
    fps,
    config: { damping: 24, stiffness: 160, mass: 0.6 },
  });

  const titleSpring = spring({
    frame: frame - 12,
    fps,
    config: { damping: 22, stiffness: 130, mass: 0.8 },
  });

  // ── Exit ───────────────────────────────────────────────────────────────────
  const exitFrame = Math.max(0, frame - (duration - EXIT_BUFFER));
  const exitSpring = spring({
    frame: exitFrame,
    fps,
    config: { damping: 20, stiffness: 180, mass: 0.6 },
  });

  // ── Derived values ─────────────────────────────────────────────────────────
  const containerX = interpolate(enterSpring, [0, 1], [-72, 0]) -
    interpolate(exitSpring, [0, 1], [0, 72]);

  const containerOpacity =
    interpolate(enterSpring, [0, 0.25], [0, 1], { extrapolateRight: "clamp" }) *
    (1 - interpolate(exitSpring, [0.6, 1], [0, 1], { extrapolateLeft: "clamp" }));

  const accentBarScaleY = interpolate(enterSpring, [0, 1], [0, 1]);
  const labelY = interpolate(labelSpring, [0, 1], [12, 0]);
  const labelOpacity = interpolate(labelSpring, [0, 0.4], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(titleSpring, [0, 1], [18, 0]);
  const titleOpacity = interpolate(titleSpring, [0, 0.4], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          bottom: 140,
          left: 72,
          transform: `translateX(${containerX}px)`,
          opacity: containerOpacity,
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
        }}
      >
        {/* Left accent bar */}
        <div
          style={{
            width: 4,
            borderRadius: 2,
            background: accentColor,
            marginRight: 20,
            transformOrigin: "top center",
            transform: `scaleY(${accentBarScaleY})`,
          }}
        />

        {/* Text block */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {/* Label pill */}
          <div
            style={{
              transform: `translateY(${labelY}px)`,
              opacity: labelOpacity,
              display: "inline-flex",
              alignItems: "center",
              width: "fit-content",
              background: `${accentColor}28`,
              border: `1px solid ${accentColor}60`,
              borderRadius: 100,
              padding: "5px 16px",
            }}
          >
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: accentColor,
                fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
              }}
            >
              {label}
            </span>
          </div>

          {/* Main title */}
          <div
            style={{
              transform: `translateY(${titleY}px)`,
              opacity: titleOpacity,
            }}
          >
            <span
              style={{
                fontSize: 58,
                fontWeight: 800,
                color: "#ffffff",
                fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
                letterSpacing: "-0.025em",
                lineHeight: 1.1,
                textShadow: "0 2px 20px rgba(0,0,0,0.6)",
              }}
            >
              {title}
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
