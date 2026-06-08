import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { GradientBg } from "../components/GradientBg";

export interface CodeWindowProps {
  code: string;
  language: string;
  accentColor: string;
}

export const CodeWindow: React.FC<CodeWindowProps> = ({ code, accentColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scaleProgress = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 80, mass: 1 },
  });

  const scale = interpolate(scaleProgress, [0, 1], [0.85, 1]);
  const opacity = interpolate(scaleProgress, [0, 0.3], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Typewriter: reveal one char at a time after frame 20
  const charsToShow = Math.floor(
    interpolate(frame, [20, 160], [0, code.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );
  const visibleCode = code.slice(0, charsToShow);

  // Cursor blink
  const showCursor = charsToShow < code.length || Math.floor(frame / 20) % 2 === 0;

  return (
    <AbsoluteFill>
      <GradientBg accentColor={accentColor} />
      <AbsoluteFill
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 160px",
        }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            opacity,
            width: "100%",
            background: "rgba(15, 15, 25, 0.95)",
            borderRadius: 20,
            border: `1px solid rgba(255,255,255,0.1)`,
            boxShadow: `0 0 80px ${accentColor}33, 0 40px 100px rgba(0,0,0,0.6)`,
            overflow: "hidden",
          }}
        >
          {/* Window chrome */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "16px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => (
              <div
                key={i}
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: c,
                  opacity: 0.9,
                }}
              />
            ))}
            <div
              style={{
                marginLeft: 12,
                color: "rgba(255,255,255,0.3)",
                fontSize: 13,
                fontFamily: "monospace",
              }}
            >
              agent.ts
            </div>
          </div>

          {/* Code body */}
          <div
            style={{
              padding: "40px 48px",
              fontFamily: "'Fira Code', 'JetBrains Mono', 'Cascadia Code', monospace",
              fontSize: 28,
              lineHeight: 1.8,
              color: "#e2e8f0",
              whiteSpace: "pre",
              minHeight: 300,
            }}
          >
            <CodeHighlight code={visibleCode} accentColor={accentColor} />
            {showCursor && (
              <span
                style={{
                  display: "inline-block",
                  width: 3,
                  height: "1.2em",
                  background: accentColor,
                  verticalAlign: "text-bottom",
                  marginLeft: 2,
                }}
              />
            )}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Minimal syntax highlighter — colours keywords, strings, comments
const CodeHighlight: React.FC<{ code: string; accentColor: string }> = ({
  code,
  accentColor,
}) => {
  const tokens = tokenize(code, accentColor);
  return (
    <>
      {tokens.map((t, i) => (
        <span key={i} style={{ color: t.color }}>
          {t.text}
        </span>
      ))}
    </>
  );
};

interface Token { text: string; color: string }

function tokenize(code: string, accent: string): Token[] {
  const keywords = /\b(const|let|var|new|await|async|return|import|from|export|type|interface|function)\b/g;
  const strings = /(".*?"|'.*?'|`[^`]*`)/g;
  const comments = /(\/\/.*)/g;

  const result: Token[] = [];
  let last = 0;

  const regions: Array<{ start: number; end: number; color: string }> = [];

  for (const re of [comments, strings, keywords]) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(code)) !== null) {
      const color =
        re === comments
          ? "#64748b"
          : re === strings
          ? "#86efac"
          : accent;
      regions.push({ start: m.index, end: m.index + m[0].length, color });
    }
  }

  regions.sort((a, b) => a.start - b.start);

  // Merge non-overlapping
  const merged: typeof regions = [];
  for (const r of regions) {
    if (merged.length === 0 || r.start >= merged[merged.length - 1].end) {
      merged.push(r);
    }
  }

  for (const { start, end, color } of merged) {
    if (start > last) result.push({ text: code.slice(last, start), color: "#e2e8f0" });
    result.push({ text: code.slice(start, end), color });
    last = end;
  }
  if (last < code.length) result.push({ text: code.slice(last), color: "#e2e8f0" });

  return result;
}
