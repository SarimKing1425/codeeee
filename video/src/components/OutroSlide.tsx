import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";

interface OutroSlideProps {
  cta: string;
  accentColor: string;
}

export const OutroSlide: React.FC<OutroSlideProps> = ({ cta, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const mainSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 90, mass: 1 },
  });

  const btnSpring = spring({
    frame: frame - 20,
    fps,
    config: { damping: 16, stiffness: 120, mass: 0.7 },
  });

  const scale = interpolate(mainSpring, [0, 1], [0.8, 1]);
  const opacity = interpolate(mainSpring, [0, 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  const btnScale = interpolate(btnSpring, [0, 1], [0.6, 1]);
  const btnOpacity = interpolate(btnSpring, [0, 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Pulse on the button
  const pulse = interpolate(
    Math.sin(frame * 0.15),
    [-1, 1],
    [0.9, 1.05]
  );

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 48,
      }}
    >
      {/* Main text */}
      <div
        style={{
          transform: `scale(${scale})`,
          opacity,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 500,
            fontFamily: "'Inter', system-ui, sans-serif",
            color: "rgba(255,255,255,0.4)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          The future is
        </div>
        <div
          style={{
            fontSize: 110,
            fontWeight: 900,
            fontFamily: "'Inter', system-ui, sans-serif",
            color: "#ffffff",
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          already{" "}
          <span style={{ color: accentColor }}>here.</span>
        </div>
      </div>

      {/* CTA Button */}
      <div
        style={{
          transform: `scale(${btnScale * pulse})`,
          opacity: btnOpacity,
          background: accentColor,
          borderRadius: 100,
          padding: "24px 64px",
          fontSize: 32,
          fontWeight: 700,
          fontFamily: "'Inter', system-ui, sans-serif",
          color: "#ffffff",
          letterSpacing: "0.01em",
          boxShadow: `0 0 60px ${accentColor}88, 0 20px 40px ${accentColor}44`,
        }}
      >
        {cta}
      </div>
    </AbsoluteFill>
  );
};
