import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { FONT } from "../fonts";

const SPRING = { mass: 0.5, stiffness: 120, damping: 14 };

interface SceneLowerThirdProps {
  text: string;
  tag: string;
  duration: number;
  accentColor?: string;
}

export const SceneLowerThird: React.FC<SceneLowerThirdProps> = ({
  text, tag, duration, accentColor = "#6366f1",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: SPRING });
  const enterY = interpolate(enter, [0, 1], [48, 0]);
  const enterOpacity = interpolate(enter, [0, 0.4], [0, 1], { extrapolateRight: "clamp" });

  const EXIT = duration - 24;
  const exit = spring({ frame: Math.max(0, frame - EXIT), fps, config: { ...SPRING, stiffness: 180 } });
  const exitOpacity = 1 - interpolate(exit, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  const tagEnter = spring({ frame: frame - 8, fps, config: SPRING });
  const tagY = interpolate(tagEnter, [0, 1], [14, 0]);
  const tagOpacity = interpolate(tagEnter, [0, 0.5], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "38%",
        background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 55%, transparent 100%)",
      }} />

      <div style={{
        position: "absolute", bottom: 100, left: 60, right: 60,
        transform: `translateY(${enterY}px)`,
        opacity: enterOpacity * exitOpacity,
      }}>
        {/* Tag */}
        <div style={{
          transform: `translateY(${tagY}px)`, opacity: tagOpacity,
          display: "inline-flex", alignItems: "center", marginBottom: 14,
          background: `${accentColor}20`, border: `1px solid ${accentColor}50`,
          borderRadius: 6, padding: "5px 14px",
        }}>
          <span style={{
            fontFamily: FONT, fontSize: 18, fontWeight: 600,
            letterSpacing: "0.16em", textTransform: "uppercase", color: accentColor,
          }}>{tag}</span>
        </div>

        {/* Main line */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{
            width: 3, height: 52, borderRadius: 2, background: accentColor,
            boxShadow: `0 0 12px ${accentColor}`, flexShrink: 0,
          }} />
          <span style={{
            fontFamily: FONT, fontSize: 52, fontWeight: 700, color: "#ffffff",
            letterSpacing: "-0.03em", lineHeight: 1.1,
          }}>{text}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
