import React from "react";
import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";

const SPRING = { mass: 0.5, stiffness: 120, damping: 14 };

interface AlertBoxProps {
  duration: number;
}

export const AlertBox: React.FC<AlertBoxProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Snappy entrance — drops in from above
  const enter = spring({ frame, fps, config: SPRING });
  const enterY = interpolate(enter, [0, 1], [-60, 0]);
  const enterScale = interpolate(enter, [0, 1], [0.88, 1]);
  const enterOpacity = interpolate(enter, [0, 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Exit
  const EXIT_START = duration - 24;
  const exit = spring({
    frame: Math.max(0, frame - EXIT_START),
    fps,
    config: { ...SPRING, stiffness: 180 },
  });
  const exitOpacity = 1 - interpolate(exit, [0, 1], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Pulse: subtle red glow pulse on the border
  const pulse = 0.5 + 0.5 * Math.sin((frame / fps) * Math.PI * 2 * 1.2);
  const glowOpacity = interpolate(pulse, [0, 1], [0.3, 0.8]);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: 260,
          left: 72,
          right: 72,
          transform: `translateY(${enterY}px) scale(${enterScale})`,
          opacity: enterOpacity * exitOpacity,
        }}
      >
        {/* Glow behind */}
        <div
          style={{
            position: "absolute",
            inset: -12,
            borderRadius: 28,
            background: `rgba(220,38,38,${glowOpacity * 0.18})`,
            filter: "blur(20px)",
          }}
        />

        {/* Card */}
        <div
          style={{
            background: "rgba(20,5,5,0.90)",
            border: `1.5px solid rgba(220,38,38,${0.5 + glowOpacity * 0.4})`,
            borderRadius: 20,
            padding: "30px 36px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 24,
            boxShadow: `0 0 40px rgba(220,38,38,${glowOpacity * 0.35})`,
          }}
        >
          {/* Icon */}
          <span style={{ fontSize: 52, flexShrink: 0, lineHeight: 1 }}>⚠️</span>

          {/* Text */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span
              style={{
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(220,38,38,0.85)",
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              System Warning
            </span>
            <span
              style={{
                fontSize: 46,
                fontWeight: 800,
                color: "#ffffff",
                fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
                letterSpacing: "-0.025em",
                lineHeight: 1.1,
              }}
            >
              Workflow Collapse
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
