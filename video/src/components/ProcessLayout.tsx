import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { FONT } from "../fonts";

const SPRING = { mass: 0.5, stiffness: 120, damping: 14 };

// Relative frames (from ProcessLayout mount) when each step activates
const STEP_TRIGGERS = [0, 300, 600];

const STEPS = [
  { num: "01", title: "Identify Redundancy", sub: "Map every manual touchpoint", color: "#6366f1" },
  { num: "02", title: "Deploy Automation",   sub: "Target highest-friction step first", color: "#818cf8" },
  { num: "03", title: "Measure ROI",         sub: "Track time saved × hourly cost", color: "#a5b4fc" },
];

const StepCard: React.FC<{
  step: typeof STEPS[0];
  stepIndex: number;
  frame: number;
  fps: number;
  isLast: boolean;
}> = ({ step, stepIndex, frame, fps, isLast }) => {
  const activateAt = STEP_TRIGGERS[stepIndex];
  const f = Math.max(0, frame - activateAt);
  if (frame < activateAt) return null;

  const enter = spring({ frame: f, fps, config: SPRING });
  const x = interpolate(enter, [0, 1], [-44, 0]);
  const opacity = interpolate(enter, [0, 0.4], [0, 1], { extrapolateRight: "clamp" });

  // Dim when next step activates
  const nextAt = STEP_TRIGGERS[stepIndex + 1] ?? Infinity;
  const dimF = Math.max(0, frame - nextAt);
  const dimProg = spring({ frame: dimF, fps, config: { ...SPRING, stiffness: 80 } });
  const dimOp = interpolate(dimProg, [0, 1], [1, 0.4]);
  const dimScale = interpolate(dimProg, [0, 1], [1, 0.98]);

  // Connector line between cards
  const lineF = Math.max(0, frame - activateAt - 12);
  const lineProg = spring({ frame: lineF, fps, config: { ...SPRING, stiffness: 160 } });
  const lineScale = interpolate(lineProg, [0, 1], [0, 1]);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{
        transform: `translateX(${x}px) scale(${dimScale})`,
        opacity: opacity * dimOp,
        display: "flex", flexDirection: "row", alignItems: "center", gap: 20,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14, padding: "20px 24px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Left glow bar */}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 3,
          background: step.color, borderRadius: "14px 0 0 14px",
          boxShadow: `0 0 14px ${step.color}aa`,
        }} />

        {/* Number */}
        <span style={{
          fontFamily: FONT, fontSize: 52, fontWeight: 800,
          color: step.color, letterSpacing: "-0.04em", lineHeight: 1,
          flexShrink: 0, marginLeft: 10, opacity: 0.95,
        }}>{step.num}</span>

        <div style={{ width: 1, height: 44, background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          <span style={{
            fontFamily: FONT, fontSize: 38, fontWeight: 700,
            color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1.1,
          }}>{step.title}</span>
          <span style={{
            fontFamily: FONT, fontSize: 22, fontWeight: 400,
            color: "rgba(255,255,255,0.4)", letterSpacing: "0em",
          }}>{step.sub}</span>
        </div>
      </div>

      {/* Connector dot-line between steps */}
      {!isLast && (
        <div style={{
          marginLeft: 36, marginTop: 2, marginBottom: 2,
          width: 1, height: 14,
          background: "rgba(255,255,255,0.15)",
          transform: `scaleY(${lineScale})`, transformOrigin: "top center",
        }} />
      )}
    </div>
  );
};

export const ProcessLayout: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const header = spring({ frame, fps, config: SPRING });
  const headerY = interpolate(header, [0, 1], [-24, 0]);
  const headerOp = interpolate(header, [0, 0.4], [0, 1], { extrapolateRight: "clamp" });

  const EXIT = duration - 28;
  const exitProg = spring({ frame: Math.max(0, frame - EXIT), fps, config: { ...SPRING, stiffness: 200 } });
  const exitOp = 1 - interpolate(exitProg, [0, 1], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "82%",
        background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.55) 65%, transparent 100%)",
      }} />

      <div style={{
        position: "absolute", bottom: 80, left: 56, right: 56,
        display: "flex", flexDirection: "column", gap: 0,
        opacity: exitOp,
      }}>
        {/* Header label */}
        <div style={{
          transform: `translateY(${headerY}px)`, opacity: headerOp,
          marginBottom: 16,
        }}>
          <span style={{
            fontFamily: FONT, fontSize: 16, fontWeight: 600,
            letterSpacing: "0.22em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.3)",
          }}>The Framework</span>
        </div>

        {STEPS.map((step, i) => (
          <StepCard
            key={i}
            step={step}
            stepIndex={i}
            frame={frame}
            fps={fps}
            isLast={i === STEPS.length - 1}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
