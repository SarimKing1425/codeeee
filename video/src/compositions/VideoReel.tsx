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
import { LowerThird } from "../components/LowerThird";
import { BottomGradient } from "../components/BottomGradient";

// ─────────────────────────────────────────────────────────────────────────────
// EDIT THESE to match your video's actual duration and your audio timestamps.
// Duration = fps × seconds.  Default: 60fps × 45s = 2700 frames.
// Check your video length in the Studio timeline and adjust accordingly.
// ─────────────────────────────────────────────────────────────────────────────
export const VIDEO_REEL_FRAMES = 2700; // ← adjust to your clip length

const FPS = 60;
const s = (seconds: number) => Math.round(seconds * FPS);

// Lower third cue sheet — edit timestamps (in seconds) freely
const LOWER_THIRDS = [
  {
    label: "Strategy",
    title: "ROI-Based Decisions",
    startFrame: s(3),
    endFrame: s(8),
  },
  {
    label: "Operations",
    title: "Automate One Step at a Time",
    startFrame: s(12),
    endFrame: s(18),
  },
  {
    label: "Growth",
    title: "Scale What Works",
    startFrame: s(22),
    endFrame: s(27),
  },
  {
    label: "Mindset",
    title: "Measure Everything",
    startFrame: s(31),
    endFrame: s(36),
  },
];

export interface VideoReelProps {
  accentColor: string;
}

export const VideoReel: React.FC<VideoReelProps> = ({ accentColor }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Global fade-in (first 20 frames) and fade-out (last 20 frames)
  const globalOpacity = interpolate(
    frame,
    [0, 20, durationInFrames - 20, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ background: "#000", opacity: globalOpacity }}>

      {/* ── Primary video track ──────────────────────────────────────────── */}
      <Video
        src={staticFile("clip.mp4")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      {/* ── Cinematic gradient overlays ──────────────────────────────────── */}
      <BottomGradient />

      {/* ── Lower thirds ─────────────────────────────────────────────────── */}
      {LOWER_THIRDS.map((lt, i) => {
        const duration = lt.endFrame - lt.startFrame;
        return (
          <Sequence
            key={i}
            from={lt.startFrame}
            durationInFrames={duration}
          >
            <LowerThird
              label={lt.label}
              title={lt.title}
              duration={duration}
              accentColor={accentColor}
            />
          </Sequence>
        );
      })}

    </AbsoluteFill>
  );
};
