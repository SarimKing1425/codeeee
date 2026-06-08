import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";

interface FloatingParticlesProps {
  accentColor: string;
}

const PARTICLES = [
  { x: 10, y: 20, size: 3, speed: 0.3, phase: 0 },
  { x: 25, y: 70, size: 2, speed: 0.2, phase: 1.2 },
  { x: 45, y: 15, size: 4, speed: 0.15, phase: 2.4 },
  { x: 60, y: 80, size: 2, speed: 0.25, phase: 0.6 },
  { x: 75, y: 35, size: 3, speed: 0.35, phase: 1.8 },
  { x: 85, y: 60, size: 2, speed: 0.2, phase: 3.0 },
  { x: 90, y: 10, size: 5, speed: 0.1, phase: 0.9 },
  { x: 15, y: 50, size: 2, speed: 0.4, phase: 2.1 },
  { x: 50, y: 45, size: 3, speed: 0.18, phase: 1.5 },
  { x: 70, y: 90, size: 2, speed: 0.22, phase: 0.3 },
];

export const FloatingParticles: React.FC<FloatingParticlesProps> = ({ accentColor }) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {PARTICLES.map((p, i) => {
        const drift = Math.sin(frame * p.speed * 0.05 + p.phase) * 30;
        const opacity = interpolate(
          Math.sin(frame * p.speed * 0.08 + p.phase),
          [-1, 1],
          [0.1, 0.5]
        );

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `calc(${p.y}% + ${drift}px)`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: accentColor,
              opacity,
              boxShadow: `0 0 ${p.size * 4}px ${accentColor}88`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
