import React from "react";
import {
  AbsoluteFill,
  Sequence,
  Video,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { BottomGradient } from "../components/BottomGradient";
import { SceneLowerThird } from "../components/SceneLowerThird";
import { IdeaStack } from "../components/IdeaStack";
import { AlertBox } from "../components/AlertBox";
import { ProcessLayout } from "../components/ProcessLayout";

// ─────────────────────────────────────────────────────────────────────────────
// SCENE MAP  (edit these frame numbers to nudge timing)
// ─────────────────────────────────────────────────────────────────────────────
const S1_START = 0;
const S1_END   = 180;   // Lower-third card

const S2_START = 180;
const S2_END   = 780;   // Idea stack
const ALERT_START = 660;
const ALERT_END   = 780;

const S3_START = 780;
const S3_END   = 1680;  // Process layout

// Set this to your video's actual frame count (fps × seconds)
export const VIDEO_REEL_FRAMES = 1800;

export interface VideoReelProps {
  accentColor: string;
}

export const VideoReel: React.FC<VideoReelProps> = ({ accentColor }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const globalOpacity = interpolate(
    frame,
    [0, 20, durationInFrames - 20, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ background: "#000", opacity: globalOpacity }}>

      {/* ── Primary footage ──────────────────────────────────────────────── */}
      <Video
        src={staticFile("clip.mp4")}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />

      {/* ── Always-on base gradient ──────────────────────────────────────── */}
      <BottomGradient />

      {/* ── SCENE 1 · Frames 0–180 ───────────────────────────────────────── */}
      {/* Sleek lower-third: 📊 ROI-Driven Automation                        */}
      <Sequence from={S1_START} durationInFrames={S1_END - S1_START}>
        <SceneLowerThird
          emoji="📊"
          text="ROI-Driven Automation"
          duration={S1_END - S1_START}
          accentColor={accentColor}
        />
      </Sequence>

      {/* ── SCENE 2 · Frames 180–780 ─────────────────────────────────────── */}
      {/* Sequential idea cards building a chaotic stack                     */}
      <Sequence from={S2_START} durationInFrames={S2_END - S2_START}>
        <IdeaStack duration={S2_END - S2_START} accentColor={accentColor} />
      </Sequence>

      {/* Alert box at frame 660 — sits on top of idea stack */}
      <Sequence from={ALERT_START} durationInFrames={ALERT_END - ALERT_START}>
        <AlertBox duration={ALERT_END - ALERT_START} />
      </Sequence>

      {/* ── SCENE 3 · Frames 780–1680 ────────────────────────────────────── */}
      {/* Three-step process: each step activates 300 frames apart           */}
      <Sequence from={S3_START} durationInFrames={S3_END - S3_START}>
        <ProcessLayout duration={S3_END - S3_START} />
      </Sequence>

    </AbsoluteFill>
  );
};
