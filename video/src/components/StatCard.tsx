import { spring, useCurrentFrame, useVideoConfig, interpolate } from "remotion";

interface StatCardProps {
  value: string;
  label: string;
  delay: number;
  accentColor: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  value,
  label,
  delay,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 16, stiffness: 100, mass: 0.8 },
  });

  const scale = interpolate(progress, [0, 1], [0.7, 1]);
  const opacity = interpolate(progress, [0, 0.4], [0, 1], {
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(progress, [0, 1], [40, 0]);

  return (
    <div
      style={{
        transform: `scale(${scale}) translateY(${translateY}px)`,
        opacity,
        flex: 1,
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 24,
        padding: "60px 40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        backdropFilter: "blur(20px)",
        boxShadow: `0 0 40px ${accentColor}22`,
      }}
    >
      {/* Accent top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "20%",
          right: "20%",
          height: 3,
          borderRadius: "0 0 3px 3px",
          background: accentColor,
          opacity: 0.8,
        }}
      />

      <div
        style={{
          fontSize: 88,
          fontWeight: 900,
          fontFamily: "'Inter', system-ui, sans-serif",
          color: accentColor,
          letterSpacing: "-0.04em",
          lineHeight: 1,
        }}
      >
        {value}
      </div>

      <div
        style={{
          fontSize: 22,
          fontWeight: 500,
          fontFamily: "'Inter', system-ui, sans-serif",
          color: "rgba(255,255,255,0.5)",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
        }}
      >
        {label}
      </div>
    </div>
  );
};
