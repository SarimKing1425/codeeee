"use client";

import Avatar from "./Avatar";
import Waveform from "./Waveform";
import Transcript from "./Transcript";
import type { KioskState, TranscriptEntry } from "@/hooks/useVapi";

type Props = {
  state: KioskState;
  isSpeaking: boolean;
  volumeLevel: number;
  transcript: TranscriptEntry[];
  onEnd: () => void;
};

export default function ActiveCall({
  state,
  isSpeaking,
  volumeLevel,
  transcript,
  onEnd,
}: Props) {
  const connecting = state === "connecting";

  return (
    <div className="flex flex-col items-center justify-between w-full h-full py-6 animate-fade-in">
      <div className="text-center">
        <p className="uppercase tracking-[0.4em] text-kyrie-blue/70 text-xs">
          {connecting ? "Connecting..." : isSpeaking ? "Kyrie is speaking" : "Listening"}
        </p>
        <div className="mt-2 flex items-center justify-center gap-2">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              connecting ? "bg-amber-500 animate-pulse" : "bg-emerald-500 animate-pulse"
            }`}
          />
          <span className="text-kyrie-gray text-sm">
            {connecting ? "Securing line" : "Live"}
          </span>
        </div>
      </div>

      <div className="relative flex items-center justify-center my-4">
        <Waveform volumeLevel={volumeLevel} active={state === "active"} />
        <Avatar state={state} isSpeaking={isSpeaking} volumeLevel={volumeLevel} />
      </div>

      <div className="w-full">
        <Transcript entries={transcript} />
      </div>

      <button
        onClick={onEnd}
        className={[
          "mt-4 inline-flex items-center justify-center gap-2",
          "min-h-[56px] min-w-[220px] px-8 py-4 rounded-full",
          "text-base font-semibold tracking-wide",
          "bg-rose-600 text-white border border-rose-600",
          "hover:bg-rose-700 active:scale-[0.98] transition",
        ].join(" ")}
      >
        <EndIcon />
        End Conversation
      </button>
    </div>
  );
}

function EndIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden>
      <path
        d="M3 11.5a3 3 0 0 1 1.5-2.6 14 14 0 0 1 15 0A3 3 0 0 1 21 11.5v1.6a2 2 0 0 1-1.6 2l-2.6.5a2 2 0 0 1-2.2-1.2l-.7-1.7a1 1 0 0 0-.5-.5 6 6 0 0 0-4.8 0 1 1 0 0 0-.5.5l-.7 1.7a2 2 0 0 1-2.2 1.2l-2.6-.5A2 2 0 0 1 3 13.1v-1.6Z"
        fill="currentColor"
      />
    </svg>
  );
}
