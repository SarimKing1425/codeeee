"use client";

import { useEffect } from "react";
import { useVapi } from "@/hooks/useVapi";
import IdleScreen from "./IdleScreen";
import ActiveCall from "./ActiveCall";
import EndScreen from "./EndScreen";

export default function KyrieKiosk() {
  const {
    state,
    volumeLevel,
    transcript,
    isSpeaking,
    errorMessage,
    startCall,
    endCall,
    resetToIdle,
  } = useVapi();

  // Wake Lock — keep the kiosk screen on
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    const acquire = async () => {
      try {
        if ("wakeLock" in navigator) {
          lock = await (navigator as Navigator & {
            wakeLock: { request: (t: "screen") => Promise<WakeLockSentinel> };
          }).wakeLock.request("screen");
        }
      } catch {
        // wake lock not available; ignore
      }
    };
    acquire();
    const onVisibility = () => {
      if (document.visibilityState === "visible") acquire();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      lock?.release().catch(() => {});
    };
  }, []);

  return (
    <main
      className="relative w-screen h-screen overflow-hidden text-white select-none"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, #163A55 0%, #0A1A2A 45%, #050B14 100%)",
      }}
    >
      {/* Subtle grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      <div className="relative z-10 w-full h-full flex items-center justify-center px-6">
        {state === "idle" && (
          <IdleScreen onStart={startCall} errorMessage={errorMessage} />
        )}
        {(state === "connecting" || state === "active") && (
          <ActiveCall
            state={state}
            isSpeaking={isSpeaking}
            volumeLevel={volumeLevel}
            transcript={transcript}
            onEnd={endCall}
          />
        )}
        {state === "ended" && <EndScreen onReset={resetToIdle} />}
      </div>

      {/* Footer brand */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-xs uppercase tracking-[0.3em] text-kyrie-blueLight/30">
        Powered by Kyrie
      </div>
    </main>
  );
}
