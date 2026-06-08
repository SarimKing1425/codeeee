import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";

interface AnimatedHeadlineProps {
  title: string;
  subtitle: string;
  accentColor: string;
}

export const AnimatedHeadline: React.FC<AnimatedHeadlineProps> = ({
  title,
  subtitle,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100, mass: 0.9 },
  });

  const subtitleSpring = spring({
    frame: frame - 18,
    fps,
    config: { damping: 16, stiffness: 90, mass: 0.8 },
  });

  const lineSpring = spring({
    frame: frame - 10,
    fps,
    config: { damping: 20, stiffness: 120 },
  });

  const titleY = interpolate(titleSpring, [0, 1], [80, 0]);
  const titleOpacity = interpolate(titleSpring, [0, 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  const subtitleY = interpolate(subtitleSpring, [0, 1], [40, 0]);
  const subtitleOpacity = interpolate(subtitleSpring, [0, 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  const lineWidth = interpolate(lineSpring, [0, 1], [0, 120]);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        padding: "0 160px",
      }}
    >
      {/* Accent line */}
      <div
        style={{
          width: lineWidth,
          height: 4,
          borderRadius: 2,
          background: accentColor,
          marginBottom: 8,
        }}
      />

      {/* Title */}
      <div
        style={{
          transform: `translateY(${titleY}px)`,
          opacity: titleOpacity,
          fontSize: 120,
          fontWeight: 900,
          fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
          color: "#ffffff",
          letterSpacing: "-0.04em",
          lineHeight: 1,
          textAlign: "center",
        }}
      >
        {title}
      </div>

      {/* Subtitle */}
      <div
        style={{
          transform: `translateY(${subtitleY}px)`,
          opacity: subtitleOpacity,
          fontSize: 36,
          fontWeight: 400,
          fontFamily: "'Inter', system-ui, sans-serif",
          color: "rgba(255,255,255,0.5)",
          letterSpacing: "0.01em",
          textAlign: "center",
        }}
      >
        {subtitle}
      </div>
    </AbsoluteFill>
  );
};
