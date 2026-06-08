import React from "react";
import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";

const SPRING = { mass: 0.5, stiffness: 120, damping: 14 };

// Frames (relative to ProcessLayout mount) when each step activates
const STEP_TIMES = [0, 300, 600];

const STEPS = [
  {
    number: "01",
    title: "Identify Redundancy",
    sub: "Map every manual touchpoint",
    accentColor: "#6366f1",
  },
  {
    number: "02",
    title: "Deploy Automation",
    sub: "Target the highest-friction step first",
    accentColor: "#8b5cf6",
  },
  {
    number: "03",
    title: "Measure ROI",
    sub: "Track time saved × hourly cost",
    accentColor: "#a78bfa",
  },
];

interface StepCardProps {
  step: (typeof STEPS)[0];
  stepIndex: number;
  globalFrame: number;
  fps: number;
}

const StepCard: React.FC<StepCardProps> = ({
  step,
  stepIndex,
  globalFrame,
  fps,
}) => {
  const activateAt = STEP_TIMES[stepIndex];
  const isActive = globalFrame >= activateAt;
  const frameAfterActivate = Math.max(0, globalFrame - activateAt);

  // Whether a later step has appeared (this one dims down)
  const nextActivateAt = STEP_TIMES[stepIndex + 1] ?? Infinity;
  const hasSuccessor = globalFrame >= nextActivateAt;

  // Enter spring
  const enter = spring({
    frame: frameAfterActivate,
    fps,
    config: SPRING,
  });
  const enterX = interpolate(enter, [0, 1], [-50, 0]);
  const enterOpacity = interpolate(enter, [0, 0.35], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Dim when successor activates
  const dimProgress = spring({
    frame: Math.max(0, globalFrame - nextActivateAt),
    fps,
    config: { ...SPRING, stiffness: 80 },
  });
  const dimOpacity = interpolate(dimProgress, [0, 1], [1, 0.45]);
  const dimScale = interpolate(dimProgress, [0, 1], [1, 0.97]);

  if (!isActive) return null;

  return (
    <div
      style={{
        transform: `translateX(${enterX}px) scale(${dimScale})`,
        opacity: enterOpacity * dimOpacity,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 28,
        background: "rgba(10,10,20,0.82)",
        border: `1px solid rgba(255,255,255,0.08)`,
        borderRadius: 22,
        padding: "28px 36px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Left accent glow */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 5,
          background: step.accentColor,
          borderRadius: "22px 0 0 22px",
          boxShadow: `0 0 20px ${step.accentColor}cc`,
        }}
      />

      {/* Number */}
      <span
        style={{
          fontSize: 64,
          fontWeight: 900,
          color: step.accentColor,
          fontFamily: "'Inter', system-ui, sans-serif",
          letterSpacing: "-0.04em",
          lineHeight: 1,
          flexShrink: 0,
          opacity: 0.9,
          marginLeft: 16,
        }}
      >
        {step.number}
      </span>

      {/* Divider */}
      <div
        style={{
          width: 1,
          height: 60,
          background: "rgba(255,255,255,0.1)",
          flexShrink: 0,
        }}
      />

      {/* Text */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span
          style={{
            fontSize: 46,
            fontWeight: 800,
            color: "#ffffff",
            fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
          }}
        >
          {step.title}
        </span>
        <span
          style={{
            fontSize: 26,
            fontWeight: 400,
            color: "rgba(255,255,255,0.45)",
            fontFamily: "'Inter', system-ui, sans-serif",
            letterSpacing: "0em",
          }}
        >
          {step.sub}
        </span>
      </div>
    </div>
  );
};

interface ProcessLayoutProps {
  duration: number;
}

export const ProcessLayout: React.FC<ProcessLayoutProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Header slides in immediately
  const headerSpring = spring({ frame, fps, config: SPRING });
  const headerY = interpolate(headerSpring, [0, 1], [-30, 0]);
  const headerOpacity = interpolate(headerSpring, [0, 0.4], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Collective exit
  const EXIT_START = duration - 30;
  const exitProgress = spring({
    frame: Math.max(0, frame - EXIT_START),
    fps,
    config: { ...SPRING, stiffness: 200 },
  });
  const exitOpacity = 1 - interpolate(exitProgress, [0, 1], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "80%",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 60%, transparent 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: 72,
          right: 72,
          opacity: exitOpacity,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* Section header */}
        <div
          style={{
            transform: `translateY(${headerY}px)`,
            opacity: headerOpacity,
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.35)",
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            The Framework
          </span>
        </div>

        {/* Step cards */}
        {STEPS.map((step, i) => (
          <StepCard
            key={i}
            step={step}
            stepIndex={i}
            globalFrame={frame}
            fps={fps}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};
