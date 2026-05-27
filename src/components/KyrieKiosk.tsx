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
      className="relative w-screen h-screen overflow-hidden text-kyrie-ink select-none"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, #FFFFFF 0%, #FFFFFF 55%, #F1F6FA 100%)",
      }}
    >
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
    </main>
  );
}
