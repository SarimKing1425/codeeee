"use client";

/**
 * The escape hatch, as Xavier actually asked for it:
 *
 *   "they can just click a button and that link send them to the intake sheet
 *    ... for them to manually enter from their computer"
 *
 * One button, one tap, and the intake form opens on the very screen they are
 * already standing at. No QR code, no camera, no second device — clients were
 * not able to use the scan-to-continue flow, which is the whole reason this
 * replaced it.
 *
 * If a conversation is in progress we end it first, so Kyrie is not left talking
 * to an empty room while the client types.
 */
export default function TypeItInstead({ onBeforeLeave }: { onBeforeLeave?: () => void }) {
  const go = () => {
    try {
      onBeforeLeave?.();
    } catch {
      // Ending the call is a courtesy, not a precondition. If it fails we still
      // owe the client the form.
    }
    window.location.href = "/intake";
  };

  return (
    <button
      type="button"
      onClick={go}
      className={[
        "absolute bottom-6 left-1/2 -translate-x-1/2 z-30",
        "inline-flex items-center justify-center gap-3",
        "min-h-[64px] px-9 rounded-full",
        "bg-white border-2 border-kyrie-blue text-kyrie-blue",
        "text-lg sm:text-xl font-semibold",
        "shadow-lg shadow-kyrie-blue/10",
        "hover:bg-kyrie-blueLight/40 active:scale-[0.98] transition",
      ].join(" ")}
    >
      <KeyboardIcon />
      Fill out the form myself
    </button>
  );
}

function KeyboardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden>
      <rect x="2" y="6" width="20" height="12" rx="2.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
