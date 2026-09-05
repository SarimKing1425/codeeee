"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

/**
 * The escape hatch, on the kiosk itself.
 *
 * A client who is fighting with voice recognition can tap this, scan the code,
 * and finish the same intake by typing on their own phone. It stays available
 * in every kiosk state — idle, mid-conversation, and after the call — because
 * the moment someone gives up is exactly the moment they need it.
 *
 * Pass `token` when the kiosk knows which record this person belongs to; the
 * code then carries their saved answers across to their phone. With no token
 * the code opens a fresh intake, which is the right behaviour for a walk-up.
 */
export default function ContinueOnPhone({ token }: { token?: string }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const base = `${window.location.origin}/intake`;
    setUrl(token ? `${base}?token=${encodeURIComponent(token)}` : base);
  }, [token]);

  // Escape closes, matching what anyone expects from a dialog.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={[
          "absolute bottom-5 right-5 z-30 inline-flex items-center gap-2",
          "min-h-[52px] px-5 rounded-full",
          "bg-white/90 backdrop-blur border border-kyrie-blue/25 text-kyrie-blue",
          "text-sm font-semibold shadow-lg shadow-kyrie-blue/10",
          "hover:bg-white active:scale-[0.98] transition",
        ].join(" ")}
      >
        <PhoneIcon />
        I&apos;d rather type it
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-kyrie-ink/40 backdrop-blur-sm px-6 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="continue-on-phone-title"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="continue-on-phone-title" className="text-2xl font-semibold text-kyrie-ink">
              Finish on your phone
            </h2>
            <p className="mt-3 text-kyrie-gray leading-relaxed">
              Point your phone&apos;s camera at this code. You can type your answers instead
              of speaking them.
            </p>

            <div className="my-7 flex items-center justify-center">
              <div className="rounded-2xl border border-kyrie-blueLight bg-white p-4">
                {url ? (
                  <QRCodeSVG value={url} size={208} level="M" marginSize={0} />
                ) : (
                  <div className="w-[208px] h-[208px] rounded-xl bg-kyrie-blueLight/40" />
                )}
              </div>
            </div>

            {token && (
              <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 mb-5">
                Everything you have already told us is saved. You will not be asked any of it
                again.
              </p>
            )}

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full min-h-[56px] rounded-full border border-kyrie-gray/30 text-kyrie-gray font-medium active:scale-[0.98] transition-transform"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden>
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" stroke="currentColor" strokeWidth="2" />
      <path d="M11 18.5h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
