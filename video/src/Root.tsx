import React from "react";
import { Composition, registerRoot } from "remotion";
import { TechReel, TECH_REEL_DURATION_FRAMES } from "./compositions/TechReel";
import { TextReveal } from "./compositions/TextReveal";
import { CodeWindow } from "./compositions/CodeWindow";
import { VideoReel, VIDEO_REEL_FRAMES } from "./compositions/VideoReel";

const FPS = 60;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComp = React.ComponentType<any>;

export const RemotionRoot = () => {
  return (
    <>
      {/* Main full tech reel — 30s at 60fps */}
      <Composition
        id="TechReel"
        component={TechReel as AnyComp}
        durationInFrames={TECH_REEL_DURATION_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{
          title: "Built different.",
          subtitle: "Your product. Your story.",
          accentColor: "#6366f1",
        }}
      />

      {/* Short clip: text reveal — great for title cards */}
      <Composition
        id="TextReveal"
        component={TextReveal as AnyComp}
        durationInFrames={120}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{
          lines: ["Ship faster.", "Stay sharp.", "Build with Claude."],
          accentColor: "#6366f1",
        }}
      />

      {/* Code window with typewriter effect */}
      <Composition
        id="CodeWindow"
        component={CodeWindow as AnyComp}
        durationInFrames={180}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{
          code: `const agent = new ClaudeAgent({\n  model: "claude-sonnet-4-6",\n  tools: [search, code, deploy],\n});\n\nawait agent.run("ship it");`,
          language: "typescript",
          accentColor: "#6366f1",
        }}
      />

      {/* ── YOUR VIDEO with lower thirds ── */}
      <Composition
        id="VideoReel"
        component={VideoReel as AnyComp}
        durationInFrames={VIDEO_REEL_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{
          accentColor: "#6366f1",
        }}
      />

      {/* Vertical 9:16 format for Reels/TikTok/Shorts */}
      <Composition
        id="TechReelVertical"
        component={TechReel as AnyComp}
        durationInFrames={TECH_REEL_DURATION_FRAMES}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={{
          title: "Built different.",
          subtitle: "Your product. Your story.",
          accentColor: "#6366f1",
        }}
      />
    </>
  );
};

registerRoot(RemotionRoot);
