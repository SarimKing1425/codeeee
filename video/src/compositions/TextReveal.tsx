import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { GradientBg } from "../components/GradientBg";

export interface TextRevealProps {
  lines: string[];
  accentColor: string;
}

export const TextReveal: React.FC<TextRevealProps> = ({ lines, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      <GradientBg accentColor={accentColor} />
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
          padding: "0 120px",
        }}
      >
        {lines.map((line, i) => {
          const delay = i * 18;
          const progress = spring({
            frame: frame - delay,
            fps,
            config: { damping: 18, stiffness: 120, mass: 0.8 },
          });

          const translateY = interpolate(progress, [0, 1], [60, 0]);
          const opacity = interpolate(progress, [0, 0.4], [0, 1], {
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={i}
              style={{
                transform: `translateY(${translateY}px)`,
                opacity,
                fontSize: 96,
                fontWeight: 900,
                fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
                color: i === lines.length - 1 ? accentColor : "#ffffff",
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
                textAlign: "center",
              }}
            >
              {line}
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
