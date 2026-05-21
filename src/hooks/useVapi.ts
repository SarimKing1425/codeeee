"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getVapi } from "@/lib/vapi";
import { VAPI_ASSISTANT_ID } from "@/lib/config";

export type KioskState = "idle" | "connecting" | "active" | "ended";
export type TranscriptEntry = { role: "user" | "assistant"; text: string };

export function useVapi() {
  const [state, setState] = useState<KioskState>("idle");
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const vapiRef = useRef<ReturnType<typeof getVapi> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const v = getVapi();
    vapiRef.current = v;

    const onCallStart = () => {
      setState("active");
      setTranscript([]);
      setErrorMessage(null);
    };
    const onCallEnd = () => setState("ended");
    const onVolume = (level: number) => setVolumeLevel(level);
    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    const onMessage = (message: { type?: string; transcriptType?: string; role?: string; transcript?: string }) => {
      if (message?.type === "transcript" && message.transcriptType === "final" && message.transcript) {
        const role = message.role === "user" ? "user" : "assistant";
        setTranscript((prev) => [...prev, { role, text: message.transcript as string }]);
      }
    };
    const onError = (error: unknown) => {
      console.error("VAPI error:", error);
      const msg = error instanceof Error ? error.message : "Connection error";
      setErrorMessage(msg);
      setState("idle");
    };

    v.on("call-start", onCallStart);
    v.on("call-end", onCallEnd);
    v.on("volume-level", onVolume);
    v.on("speech-start", onSpeechStart);
    v.on("speech-end", onSpeechEnd);
    v.on("message", onMessage);
    v.on("error", onError);

    return () => {
      try {
        v.removeAllListeners();
      } catch {
        // noop
      }
    };
  }, []);

  const startCall = useCallback(async () => {
    setErrorMessage(null);
    setState("connecting");
    try {
      const v = vapiRef.current ?? getVapi();
      await v.start(VAPI_ASSISTANT_ID);
    } catch (err) {
      console.error("Failed to start call:", err);
      const msg = err instanceof Error ? err.message : "Failed to start";
      setErrorMessage(msg);
      setState("idle");
    }
  }, []);

  const endCall = useCallback(() => {
    try {
      vapiRef.current?.stop();
    } catch (err) {
      console.error("Failed to end call:", err);
    }
  }, []);

  const resetToIdle = useCallback(() => {
    setState("idle");
    setTranscript([]);
    setVolumeLevel(0);
    setIsSpeaking(false);
    setErrorMessage(null);
  }, []);

  return {
    state,
    volumeLevel,
    transcript,
    isSpeaking,
    errorMessage,
    startCall,
    endCall,
    resetToIdle,
  };
}
