"use client";

import { useEffect, useState } from "react";

type Props = {
  onReset: () => void;
  resetSeconds?: number;
};

export default function EndScreen({ onReset, resetSeconds = 8 }: Props) {
  const [remaining, setRemaining] = useState(resetSeconds);

  useEffect(() => {
    if (remaining <= 0) {
      onReset();
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onReset]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full text-center animate-fade-in">
      <div className="w-24 h-24 rounded-full bg-emerald-400/15 border border-emerald-300/30 flex items-center justify-center mb-8 animate-glow-pulse">
        <svg viewBox="0 0 24 24" className="w-12 h-12 text-emerald-300" fill="none" aria-hidden>
          <path
            d="m5 12 5 5L20 7"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h2 className="text-5xl md:text-6xl font-semibold text-white mb-4">Thank you.</h2>
      <p className="text-xl text-kyrie-blueLight/80 max-w-xl">
        We&apos;ve received your information. A member of our team will reach out shortly.
      </p>

      <button
        onClick={onReset}
        className="mt-12 px-6 py-3 rounded-full text-sm text-kyrie-blueLight/70 border border-kyrie-blueLight/20 hover:bg-white/5 transition"
      >
        Start over &middot; {remaining}s
      </button>
    </div>
  );
}
