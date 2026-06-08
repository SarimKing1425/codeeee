import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { GradientBg } from "../components/GradientBg";
import { FloatingParticles } from "../components/FloatingParticles";
import { AnimatedHeadline } from "../components/AnimatedHeadline";
import { StatCard } from "../components/StatCard";
import { FeatureSlide } from "../components/FeatureSlide";
import { OutroSlide } from "../components/OutroSlide";

export const TECH_REEL_DURATION_FRAMES = 1800; // 30s at 60fps

export interface TechReelProps {
  title: string;
  subtitle: string;
  accentColor: string;
}

export const TechReel: React.FC<TechReelProps> = ({
  title,
  subtitle,
  accentColor,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [TECH_REEL_DURATION_FRAMES - 30, TECH_REEL_DURATION_FRAMES],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ opacity: globalOpacity }}>
      <GradientBg accentColor={accentColor} />
      <FloatingParticles accentColor={accentColor} />

      {/* SCENE 1: Hero intro — 0 to 3s */}
      <Sequence from={0} durationInFrames={fps * 3}>
        <AnimatedHeadline
          title={title}
          subtitle={subtitle}
          accentColor={accentColor}
        />
      </Sequence>

      {/* SCENE 2: Stats — 3s to 9s */}
      <Sequence from={fps * 3} durationInFrames={fps * 6}>
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 60,
            padding: "0 120px",
          }}
        >
          <StatCard value="10x" label="Faster Shipping" delay={0} accentColor={accentColor} />
          <StatCard value="99%" label="Uptime" delay={10} accentColor={accentColor} />
          <StatCard value="<2s" label="Response Time" delay={20} accentColor={accentColor} />
        </AbsoluteFill>
      </Sequence>

      {/* SCENE 3: Feature 1 — 9s to 15s */}
      <Sequence from={fps * 9} durationInFrames={fps * 6}>
        <FeatureSlide
          icon="⚡"
          heading="Instant deployment"
          body="Push code. It ships. No waiting, no ops overhead, no excuses."
          accentColor={accentColor}
          direction="left"
        />
      </Sequence>

      {/* SCENE 4: Feature 2 — 15s to 21s */}
      <Sequence from={fps * 15} durationInFrames={fps * 6}>
        <FeatureSlide
          icon="🧠"
          heading="AI at the core"
          body="Not bolted on. Every layer, from infra to UX, thinks."
          accentColor={accentColor}
          direction="right"
        />
      </Sequence>

      {/* SCENE 5: Feature 3 — 21s to 27s */}
      <Sequence from={fps * 21} durationInFrames={fps * 6}>
        <FeatureSlide
          icon="🔒"
          heading="Secure by default"
          body="Zero trust architecture. Your data stays yours."
          accentColor={accentColor}
          direction="left"
        />
      </Sequence>

      {/* SCENE 6: Outro CTA — 27s to 30s */}
      <Sequence from={fps * 27} durationInFrames={fps * 3}>
        <OutroSlide
          cta="Try it free →"
          accentColor={accentColor}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
