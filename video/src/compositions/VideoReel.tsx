import React from "react";
import {
  AbsoluteFill, Sequence, Video, staticFile,
  useCurrentFrame, useVideoConfig, interpolate, continueRender, delayRender,
} from "remotion";
import { BottomGradient } from "../components/BottomGradient";
import { SceneLowerThird } from "../components/SceneLowerThird";
import { IdeaStack } from "../components/IdeaStack";
import { AlertBox } from "../components/AlertBox";
import { ProcessLayout } from "../components/ProcessLayout";
import { waitUntilDone } from "../fonts";

// ─── Scene timing (60fps) — shift everything +300 frames (5 sec) ─────────────
const S1_START  = 300;   // 5s  – lower third card
const S1_END    = 480;   // 8s

const S2_START  = 480;   // 8s  – idea stack
const S2_END    = 1080;  // 18s

const ALERT_START = 960; // 16s – alert (overlaps end of S2)
const ALERT_END   = 1080;// 18s

const S3_START  = 1080;  // 18s – process layout
const S3_END    = 1980;  // 33s

export const VIDEO_REEL_FRAMES = 2901; // 48.35s × 60fps

export interface VideoReelProps { accentColor: string }

export const VideoReel: React.FC<VideoReelProps> = ({ accentColor }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Wait for font before rendering
  const [handle] = React.useState(() => delayRender("font"));
  React.useEffect(() => {
    waitUntilDone().then(() => continueRender(handle));
  }, [handle]);

  const globalOpacity = interpolate(
    frame,
    [0, 20, durationInFrames - 20, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ background: "#000", opacity: globalOpacity }}>

      {/* Primary footage */}
      <Video
        src={staticFile("clip_h264.mp4")}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />

      <BottomGradient />

      {/* SCENE 1 · 5s–8s · Lower third */}
      <Sequence from={S1_START} durationInFrames={S1_END - S1_START}>
        <SceneLowerThird
          tag="Strategy"
          text="ROI-Driven Automation"
          duration={S1_END - S1_START}
          accentColor={accentColor}
        />
      </Sequence>

      {/* SCENE 2 · 8s–18s · Idea stack */}
      <Sequence from={S2_START} durationInFrames={S2_END - S2_START}>
        <IdeaStack duration={S2_END - S2_START} accentColor={accentColor} />
      </Sequence>

      {/* Alert · 16s–18s */}
      <Sequence from={ALERT_START} durationInFrames={ALERT_END - ALERT_START}>
        <AlertBox duration={ALERT_END - ALERT_START} />
      </Sequence>

      {/* SCENE 3 · 18s–33s · Process layout */}
      <Sequence from={S3_START} durationInFrames={S3_END - S3_START}>
        <ProcessLayout duration={S3_END - S3_START} />
      </Sequence>

    </AbsoluteFill>
  );
};
