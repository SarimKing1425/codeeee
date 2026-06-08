import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";

interface FeatureSlideProps {
  icon: string;
  heading: string;
  body: string;
  accentColor: string;
  direction: "left" | "right";
}

export const FeatureSlide: React.FC<FeatureSlideProps> = ({
  icon,
  heading,
  body,
  accentColor,
  direction,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const slideIn = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 80, mass: 1.1 },
  });

  const iconSpring = spring({
    frame: frame - 12,
    fps,
    config: { damping: 12, stiffness: 150, mass: 0.6 },
  });

  const textSpring = spring({
    frame: frame - 20,
    fps,
    config: { damping: 18, stiffness: 90 },
  });

  const xFrom = direction === "left" ? -120 : 120;
  const slideX = interpolate(slideIn, [0, 1], [xFrom, 0]);
  const opacity = interpolate(slideIn, [0, 0.4], [0, 1], {
    extrapolateRight: "clamp",
  });

  const iconScale = interpolate(iconSpring, [0, 1], [0, 1]);
  const textY = interpolate(textSpring, [0, 1], [30, 0]);
  const textOpacity = interpolate(textSpring, [0, 0.5], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 200px",
      }}
    >
      <div
        style={{
          transform: `translateX(${slideX}px)`,
          opacity,
          display: "flex",
          flexDirection: "column",
          alignItems: direction === "left" ? "flex-start" : "flex-end",
          gap: 32,
          maxWidth: 900,
        }}
      >
        {/* Icon badge */}
        <div
          style={{
            transform: `scale(${iconScale})`,
            width: 100,
            height: 100,
            borderRadius: 28,
            background: `${accentColor}22`,
            border: `2px solid ${accentColor}44`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 48,
            boxShadow: `0 0 40px ${accentColor}33`,
          }}
        >
          {icon}
        </div>

        {/* Heading */}
        <div
          style={{
            transform: `translateY(${textY}px)`,
            opacity: textOpacity,
            fontSize: 80,
            fontWeight: 800,
            fontFamily: "'Inter', system-ui, sans-serif",
            color: "#ffffff",
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
            textAlign: direction === "left" ? "left" : "right",
          }}
        >
          {heading}
        </div>

        {/* Body */}
        <div
          style={{
            transform: `translateY(${textY}px)`,
            opacity: textOpacity * 0.8,
            fontSize: 32,
            fontWeight: 400,
            fontFamily: "'Inter', system-ui, sans-serif",
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.6,
            textAlign: direction === "left" ? "left" : "right",
          }}
        >
          {body}
        </div>

        {/* Accent underline */}
        <div
          style={{
            opacity: textOpacity,
            width: 80,
            height: 3,
            borderRadius: 2,
            background: accentColor,
            alignSelf: direction === "left" ? "flex-start" : "flex-end",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
