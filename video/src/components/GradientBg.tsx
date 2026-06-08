import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

interface GradientBgProps {
  accentColor: string;
}

export const GradientBg: React.FC<GradientBgProps> = ({ accentColor }) => {
  const frame = useCurrentFrame();

  // Slow pulsing glow
  const glowOpacity = interpolate(
    Math.sin(frame * 0.02),
    [-1, 1],
    [0.08, 0.18]
  );

  return (
    <AbsoluteFill style={{ background: "#080810" }}>
      {/* Radial glow top-left */}
      <div
        style={{
          position: "absolute",
          top: -200,
          left: -200,
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: accentColor,
          opacity: glowOpacity,
          filter: "blur(180px)",
          pointerEvents: "none",
        }}
      />
      {/* Radial glow bottom-right */}
      <div
        style={{
          position: "absolute",
          bottom: -200,
          right: -200,
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: "#a855f7",
          opacity: glowOpacity * 0.7,
          filter: "blur(160px)",
          pointerEvents: "none",
        }}
      />
      {/* Subtle grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />
    </AbsoluteFill>
  );
};
