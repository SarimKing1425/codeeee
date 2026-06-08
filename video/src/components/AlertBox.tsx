import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { FONT } from "../fonts";

const SPRING = { mass: 0.5, stiffness: 120, damping: 14 };

export const AlertBox: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: SPRING });
  const scale = interpolate(enter, [0, 1], [0.9, 1]);
  const y = interpolate(enter, [0, 1], [-40, 0]);
  const opacity = interpolate(enter, [0, 0.35], [0, 1], { extrapolateRight: "clamp" });

  const EXIT = duration - 22;
  const exit = spring({ frame: Math.max(0, frame - EXIT), fps, config: { ...SPRING, stiffness: 200 } });
  const exitOp = 1 - interpolate(exit, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  // Breathing glow
  const pulse = 0.5 + 0.5 * Math.sin((frame / fps) * Math.PI * 2 * 1.1);
  const glow = interpolate(pulse, [0, 1], [0.25, 0.6]);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{
        position: "absolute", top: "28%", left: 44, right: 44,
        transform: `translateY(${y}px) scale(${scale})`,
        opacity: opacity * exitOp,
      }}>
        {/* Outer glow */}
        <div style={{
          position: "absolute", inset: -8, borderRadius: 22,
          background: `rgba(239,68,68,${glow * 0.15})`, filter: "blur(16px)",
        }} />

        <div style={{
          background: "rgba(12,4,4,0.92)",
          border: `1px solid rgba(239,68,68,${0.4 + glow * 0.4})`,
          borderRadius: 16, padding: "24px 28px",
          display: "flex", flexDirection: "column", gap: 10,
          boxShadow: `0 0 32px rgba(239,68,68,${glow * 0.3})`,
        }}>
          {/* Top row */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24, lineHeight: 1 }}>⚠️</span>
            <span style={{
              fontFamily: FONT, fontSize: 16, fontWeight: 700,
              letterSpacing: "0.2em", textTransform: "uppercase",
              color: "rgba(239,68,68,0.8)",
            }}>System Warning</span>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "rgba(239,68,68,0.18)" }} />

          {/* Title */}
          <span style={{
            fontFamily: FONT, fontSize: 44, fontWeight: 700,
            color: "#ffffff", letterSpacing: "-0.025em", lineHeight: 1.1,
          }}>Workflow Collapse</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
