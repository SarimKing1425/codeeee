"use client";

import { useState } from "react";
import { startIntake } from "@/lib/intake";

/**
 * Entry point for someone who never spoke to Kyrie at all — a walk-up at the
 * office, or anyone handed the bare link. Name and phone are the minimum the
 * office needs to be able to call them back, and are also what stops this public
 * endpoint being used to create empty records.
 */
export default function StartIntake() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const digits = phone.replace(/\D/g, "");
  const ready = fullName.trim().length >= 2 && digits.length >= 10;

  async function begin() {
    if (!ready || busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await startIntake({ fullName: fullName.trim(), phone });
      if (result && result.started && result.token) {
        window.location.href = `/intake?token=${encodeURIComponent(result.token)}`;
        return;
      }
      setError("We could not start your intake. Please check your name and phone number.");
    } catch {
      setError("We could not reach our system. Please check your connection and try again.");
    }
    setBusy(false);
  }

  const input =
    "w-full min-h-[56px] rounded-2xl border border-kyrie-gray/25 px-4 py-3 text-lg text-kyrie-ink bg-white outline-none transition focus:border-kyrie-blue focus:ring-4 focus:ring-kyrie-blue/15";

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <p className="uppercase tracking-[0.3em] text-kyrie-blue/70 text-xs mb-2">
          SoCal United Professional Services
        </p>
        <h1 className="text-3xl font-semibold text-kyrie-ink mb-3">Let&apos;s get started</h1>
        <p className="text-kyrie-gray leading-relaxed mb-8">
          Just your name and a phone number to begin. It takes about ten minutes, and your
          answers save as you go — you can stop and come back at any time.
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="start-name" className="block text-kyrie-ink font-medium mb-2">
              Your full name
            </label>
            <input
              id="start-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              className={input}
            />
          </div>
          <div>
            <label htmlFor="start-phone" className="block text-kyrie-ink font-medium mb-2">
              Your phone number
            </label>
            <input
              id="start-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              className={input}
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={() => void begin()}
          disabled={!ready || busy}
          className="mt-8 w-full min-h-[60px] rounded-full bg-kyrie-blue text-white text-lg font-semibold shadow-xl shadow-kyrie-blue/25 active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {busy ? "Starting…" : "Begin my intake"}
        </button>

        <p className="mt-6 text-sm text-kyrie-gray text-center">
          Your information is private and goes only to our office.
        </p>
      </div>
    </div>
  );
}
