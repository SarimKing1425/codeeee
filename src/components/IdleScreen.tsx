"use client";

import Avatar from "./Avatar";

type Props = {
  onStart: () => void;
  errorMessage?: string | null;
};

export default function IdleScreen({ onStart, errorMessage }: Props) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full animate-fade-in">
      <div className="text-center mb-6">
        <p className="uppercase tracking-[0.4em] text-kyrie-blueLight/70 text-sm">
          Kyrie &mdash; AI Intake Specialist
        </p>
        <h1 className="mt-3 text-5xl md:text-6xl font-semibold text-white">
          How can I help you today?
        </h1>
      </div>

      <div className="my-4">
        <Avatar state="idle" isSpeaking={false} volumeLevel={0} />
      </div>

      <button
        onClick={onStart}
        className={[
          "mt-8 group relative inline-flex items-center justify-center",
          "min-h-[64px] min-w-[260px] px-10 py-5 rounded-full",
          "text-xl font-semibold tracking-wide",
          "bg-gradient-to-r from-kyrie-blueLight to-white text-kyrie-ink",
          "shadow-2xl shadow-kyrie-blueLight/30",
          "hover:scale-[1.03] active:scale-[0.98] transition-transform duration-200",
        ].join(" ")}
      >
        <span className="absolute inset-0 rounded-full ring-4 ring-kyrie-blueLight/30 group-hover:ring-kyrie-blueLight/60 transition" />
        <span className="relative flex items-center gap-3">
          <MicIcon />
          Tap to Begin
        </span>
      </button>

      {errorMessage && (
        <p className="mt-6 text-rose-200/80 text-sm max-w-md text-center">
          {errorMessage}
        </p>
      )}

      <p className="mt-10 text-kyrie-blueLight/50 text-sm">
        Your conversation is private and secure.
      </p>
    </div>
  );
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden>
      <path
        d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 11a7 7 0 0 0 14 0M12 19v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
