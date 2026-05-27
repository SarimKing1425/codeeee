"use client";

import Avatar from "./Avatar";

type Props = {
  onStart: () => void;
  errorMessage?: string | null;
};

export default function IdleScreen({ onStart, errorMessage }: Props) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full py-[2vh] animate-fade-in">
      <div className="text-center shrink-0">
        <p className="uppercase tracking-[0.3em] sm:tracking-[0.4em] text-kyrie-blue/70 text-xs sm:text-sm">
          Kyrie &mdash; AI Intake Specialist
        </p>
        <h1 className="mt-2 sm:mt-3 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-kyrie-ink">
          How can I help you today?
        </h1>
      </div>

      <div className="flex-1 min-h-0 w-full flex items-center justify-center my-2 sm:my-4">
        <Avatar state="idle" isSpeaking={false} volumeLevel={0} />
      </div>

      <div className="shrink-0 flex flex-col items-center">
        <button
          onClick={onStart}
          className={[
            "group relative inline-flex items-center justify-center",
            "min-h-[60px] sm:min-h-[64px] min-w-[240px] sm:min-w-[260px] px-8 sm:px-10 py-4 sm:py-5 rounded-full",
            "text-lg sm:text-xl font-semibold tracking-wide",
            "bg-kyrie-blue text-white",
            "shadow-xl shadow-kyrie-blue/25",
            "hover:scale-[1.03] active:scale-[0.98] transition-transform duration-200",
          ].join(" ")}
        >
          <span className="absolute inset-0 rounded-full ring-4 ring-kyrie-blue/15 group-hover:ring-kyrie-blue/30 transition" />
          <span className="relative flex items-center gap-3">
            <MicIcon />
            Tap to Begin
          </span>
        </button>

        {errorMessage && (
          <p className="mt-4 text-rose-600 text-sm max-w-md text-center">
            {errorMessage}
          </p>
        )}

        <p className="mt-4 sm:mt-6 text-kyrie-gray text-sm">
          Your conversation is private and secure.
        </p>
      </div>
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
