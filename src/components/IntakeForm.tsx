"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  beaconProgress,
  isAnswered,
  isUnclear,
  loadIntake,
  saveProgress,
  submitIntake,
  type IntakeForm as IntakeFormData,
  type Question,
} from "@/lib/intake";

type Phase = "loading" | "error" | "filling" | "submitting" | "done";

const OFFICE_PHONE_DISPLAY = "951.618.5994";
const OFFICE_PHONE_HREF = "+19516185994";

export default function IntakeForm({ token }: { token: string }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [errorText, setErrorText] = useState("");
  const [form, setForm] = useState<IntakeFormData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);
  const [editing, setEditing] = useState<Set<string>>(new Set());
  const [prefilled, setPrefilled] = useState<Set<string>>(new Set());
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

  // Refs so the debounce and the unload handler always see current values
  // without re-subscribing on every keystroke.
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const stepRef = useRef(step);
  stepRef.current = step;
  const formRef = useRef(form);
  formRef.current = form;

  // Stable identity: a fresh array literal here would re-run the progress
  // calculation on every keystroke.
  const sections = useMemo(() => form?.sections ?? [], [form]);
  const total = sections.length;
  const section = sections[step];

  const completedThrough = useCallback(
    (index: number) => `${Math.min(index + 1, total)} of ${total}`,
    [total],
  );

  // ---- Load ----------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await loadIntake(token);
        if (cancelled) return;
        if (!result || !result.found) {
          setErrorText(
            "This link is no longer valid. It may have expired, or the address may have been copied incompletely.",
          );
          setPhase("error");
          return;
        }
        setForm(result);
        setAnswers(result.answers ?? {});
        setPrefilled(
          new Set(
            Object.keys(result.answers ?? {}).filter((k) => isAnswered(result.answers[k])),
          ),
        );
        setPhase("filling");
      } catch {
        if (cancelled) return;
        setErrorText(
          "We could not reach our system just now. Please check your connection and try again.",
        );
        setPhase("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  // ---- Save the current section -------------------------------------------
  const saveSection = useCallback(
    async (index: number) => {
      const f = formRef.current;
      if (!f) return;
      const sec = f.sections[index];
      if (!sec) return;

      const payload: Record<string, string> = {};
      for (const q of sec.questions) {
        const v = answersRef.current[q.key];
        if (v !== undefined && v !== null && String(v).trim() !== "") payload[q.key] = String(v);
      }
      if (Object.keys(payload).length === 0) return;

      setSaveState("saving");
      try {
        await saveProgress({
          token,
          sectionKey: sec.key,
          answers: payload,
          completedThrough: `${Math.min(index + 1, f.sections.length)} of ${f.sections.length}`,
        });
        setSaveState("saved");
      } catch {
        // Autosave is a safety net, not the submission. A failed save is retried
        // by the next keystroke and by the beacon on unload, so it is not worth
        // interrupting someone mid-answer with an error.
        setSaveState("idle");
      }
    },
    [token],
  );

  // Debounced autosave on every change.
  useEffect(() => {
    if (phase !== "filling") return;
    const t = setTimeout(() => void saveSection(stepRef.current), 900);
    return () => clearTimeout(t);
  }, [answers, phase, saveSection]);

  // Locking the phone or closing the tab must not lose the current screen.
  useEffect(() => {
    if (phase !== "filling") return;
    const flush = () => {
      const f = formRef.current;
      const sec = f?.sections[stepRef.current];
      if (!f || !sec) return;
      const payload: Record<string, string> = {};
      for (const q of sec.questions) {
        const v = answersRef.current[q.key];
        if (v !== undefined && String(v).trim() !== "") payload[q.key] = String(v);
      }
      if (Object.keys(payload).length === 0) return;
      beaconProgress({
        token,
        sectionKey: sec.key,
        answers: payload,
        completedThrough: `${Math.min(stepRef.current + 1, f.sections.length)} of ${f.sections.length}`,
      });
    };
    const onHide = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [phase, token]);

  const setAnswer = useCallback((key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }, []);

  const openForEdit = useCallback((key: string) => {
    setEditing((prev) => new Set(prev).add(key));
  }, []);

  const goTo = useCallback(
    async (next: number) => {
      await saveSection(stepRef.current);
      setStep(next);
      setSaveState("idle");
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [saveSection],
  );

  const onSubmit = useCallback(async () => {
    if (!form) return;
    setPhase("submitting");
    try {
      await saveSection(stepRef.current);
      const result = await submitIntake({
        token,
        answers: answersRef.current,
        completedThrough: `${form.sections.length} of ${form.sections.length}`,
      });
      if (result && result.submitted) {
        setPhase("done");
      } else {
        setErrorText(
          "We saved your answers, but could not finish sending them. Please call our office and we will complete it with you — nothing you entered has been lost.",
        );
        setPhase("error");
      }
    } catch {
      setErrorText(
        "We saved your answers, but could not finish sending them. Please call our office and we will complete it with you — nothing you entered has been lost.",
      );
      setPhase("error");
    }
  }, [form, saveSection, token]);

  // ---- Progress ------------------------------------------------------------
  const { answeredCount, requiredCount } = useMemo(() => {
    let done = 0;
    let need = 0;
    for (const sec of sections) {
      for (const q of sec.questions) {
        if (!q.optional) need += 1;
        if (isAnswered(answers[q.key])) done += 1;
      }
    }
    return { answeredCount: done, requiredCount: need };
  }, [sections, answers]);

  const pct = total > 0 ? Math.round(((step + (phase === "done" ? 1 : 0)) / total) * 100) : 0;

  // ---- Screens -------------------------------------------------------------
  if (phase === "loading") return <Centered><Spinner /><p className="mt-6 text-kyrie-gray">Loading your intake…</p></Centered>;

  if (phase === "error") {
    return (
      <Centered>
        <div className="w-full max-w-md text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center mb-6">
            <span className="text-3xl" aria-hidden>!</span>
          </div>
          <h1 className="text-2xl font-semibold text-kyrie-ink mb-3">We hit a snag</h1>
          <p className="text-kyrie-gray leading-relaxed mb-8">{errorText}</p>
          <a
            href={`tel:${OFFICE_PHONE_HREF}`}
            className="inline-flex items-center justify-center min-h-[60px] px-8 rounded-full bg-kyrie-blue text-white text-lg font-semibold shadow-xl shadow-kyrie-blue/25 active:scale-[0.98] transition-transform"
          >
            Call us · {OFFICE_PHONE_DISPLAY}
          </a>
        </div>
      </Centered>
    );
  }

  if (phase === "done") {
    return (
      <Centered>
        <div className="w-full max-w-md text-center animate-fade-in">
          <div className="mx-auto w-24 h-24 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center mb-8">
            <svg viewBox="0 0 24 24" className="w-12 h-12 text-emerald-600" fill="none" aria-hidden>
              <path d="m5 12 5 5L20 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold text-kyrie-ink mb-4">All done. Thank you.</h1>
          <p className="text-lg text-kyrie-gray leading-relaxed">
            Your intake has been sent to our office. A member of our team will be in touch shortly.
          </p>
          <p className="mt-8 text-sm text-kyrie-gray">You can close this page.</p>
        </div>
      </Centered>
    );
  }

  const isLast = step === total - 1;

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {/* Progress header */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-kyrie-blueLight">
        <div className="mx-auto w-full max-w-2xl px-5 pt-4 pb-3">
          <div className="flex items-baseline justify-between mb-2">
            <p className="text-xs uppercase tracking-[0.2em] text-kyrie-blue/70">
              Step {step + 1} of {total}
            </p>
            <p className="text-xs text-kyrie-gray" aria-live="polite">
              {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : `${answeredCount} of ${requiredCount} answered`}
            </p>
          </div>
          <div className="h-2 w-full rounded-full bg-kyrie-blueLight overflow-hidden">
            <div
              className="h-full bg-kyrie-blue transition-all duration-500"
              style={{ width: `${Math.max(pct, 4)}%` }}
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Intake progress"
            />
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-2xl px-5 py-6">
        <h1 className="text-2xl sm:text-3xl font-semibold text-kyrie-ink mb-1">{section?.title}</h1>
        <p className="text-kyrie-gray mb-6">
          {step === 0
            ? "Anything we already have is filled in for you. You only need to answer what is missing."
            : "Your answers save automatically."}
        </p>

        <div className="space-y-4">
          {section?.questions.map((q) => {
            const value = answers[q.key] ?? "";
            const unclear = isUnclear(value);
            const collapsed = prefilled.has(q.key) && !editing.has(q.key) && isAnswered(value);

            if (collapsed) {
              return (
                <AnsweredRow
                  key={q.key}
                  label={q.label}
                  value={value}
                  onChange={() => openForEdit(q.key)}
                />
              );
            }

            return (
              <Field
                key={q.key}
                question={q}
                value={unclear ? "" : value}
                unclear={unclear}
                onChange={(v) => setAnswer(q.key, v)}
              />
            );
          })}
        </div>
      </main>

      {/* Navigation */}
      <footer className="sticky bottom-0 z-20 bg-white/95 backdrop-blur border-t border-kyrie-blueLight">
        <div className="mx-auto w-full max-w-2xl px-5 py-4 flex items-center gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => void goTo(step - 1)}
              className="min-h-[56px] px-6 rounded-full border border-kyrie-gray/30 text-kyrie-gray font-medium active:scale-[0.98] transition-transform"
            >
              Back
            </button>
          )}
          {isLast ? (
            <button
              type="button"
              onClick={() => void onSubmit()}
              disabled={phase === "submitting"}
              className="flex-1 min-h-[56px] px-6 rounded-full bg-kyrie-blue text-white text-lg font-semibold shadow-xl shadow-kyrie-blue/25 active:scale-[0.98] transition-transform disabled:opacity-60"
            >
              {phase === "submitting" ? "Sending…" : "Finish and send"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void goTo(step + 1)}
              className="flex-1 min-h-[56px] px-6 rounded-full bg-kyrie-blue text-white text-lg font-semibold shadow-xl shadow-kyrie-blue/25 active:scale-[0.98] transition-transform"
            >
              Continue
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

/* ---------------------------------------------------------------- pieces -- */

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-12">{children}</div>
  );
}

function Spinner() {
  return (
    <div className="w-10 h-10 rounded-full border-4 border-kyrie-blueLight border-t-kyrie-blue animate-spin" aria-label="Loading" />
  );
}

function AnsweredRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: () => void;
}) {
  return (
    <div className="rounded-2xl border border-kyrie-blueLight bg-kyrie-blueLight/25 px-4 py-3 flex items-start gap-3">
      <svg viewBox="0 0 24 24" className="w-5 h-5 mt-0.5 text-emerald-600 shrink-0" fill="none" aria-hidden>
        <path d="m5 12 5 5L20 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-kyrie-gray">{label}</p>
        <p className="text-kyrie-ink font-medium break-words">{value}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        className="shrink-0 text-sm font-semibold text-kyrie-blue underline underline-offset-2 min-h-[44px] px-2"
      >
        Change
      </button>
    </div>
  );
}

function Field({
  question,
  value,
  unclear,
  onChange,
}: {
  question: Question;
  value: string;
  unclear: boolean;
  onChange: (v: string) => void;
}) {
  const id = `q-${question.key}`;
  const base =
    "w-full min-h-[56px] rounded-2xl border px-4 py-3 text-lg text-kyrie-ink bg-white outline-none transition focus:border-kyrie-blue focus:ring-4 focus:ring-kyrie-blue/15";
  const border = unclear ? "border-amber-400" : "border-kyrie-gray/25";

  return (
    <div>
      <label htmlFor={id} className="block text-kyrie-ink font-medium mb-2">
        {question.label}
        {question.optional && <span className="ml-2 text-sm font-normal text-kyrie-gray">Optional</span>}
      </label>

      {unclear && (
        <p className="mb-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          We could not make this out on the call. Could you type it for us?
        </p>
      )}

      {question.type === "textarea" && (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
          className={`${base} ${border} resize-y`}
        />
      )}

      {question.type === "yesno" && (
        <ChoiceButtons id={id} options={["Yes", "No"]} value={value} onChange={onChange} />
      )}

      {question.type === "choice" && (
        <ChoiceButtons id={id} options={question.choices ?? []} value={value} onChange={onChange} />
      )}

      {question.type === "checkbox" && (
        <button
          type="button"
          id={id}
          aria-pressed={value === "Yes"}
          onClick={() => onChange(value === "Yes" ? "" : "Yes")}
          className={[
            "w-full min-h-[56px] rounded-2xl border px-4 py-3 text-left text-lg font-medium transition active:scale-[0.99]",
            value === "Yes"
              ? "border-kyrie-blue bg-kyrie-blue text-white"
              : "border-kyrie-gray/25 bg-white text-kyrie-ink",
          ].join(" ")}
        >
          {value === "Yes" ? "Yes — include this" : "Tap if this applies"}
        </button>
      )}

      {["text", "email", "tel", "date", "time"].includes(question.type) && (
        <input
          id={id}
          type={question.type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode={question.type === "tel" ? "tel" : question.type === "email" ? "email" : undefined}
          autoComplete={autoCompleteFor(question.key, question.type)}
          className={`${base} ${border}`}
        />
      )}
    </div>
  );
}

function ChoiceButtons({
  id,
  options,
  value,
  onChange,
}: {
  id: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div id={id} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map((opt) => {
        const active = value.toLowerCase() === opt.toLowerCase();
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            aria-pressed={active}
            className={[
              "min-h-[56px] rounded-2xl border px-4 py-3 text-lg font-medium transition active:scale-[0.99]",
              active
                ? "border-kyrie-blue bg-kyrie-blue text-white"
                : "border-kyrie-gray/25 bg-white text-kyrie-ink",
            ].join(" ")}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function autoCompleteFor(key: string, type: string): string | undefined {
  if (key.includes("first_name")) return "given-name";
  if (key.includes("last_name")) return "family-name";
  if (key.includes("alternate_email")) return "email";
  if (key.includes("email")) return "email";
  if (key.includes("alternate_phone")) return "tel";
  if (key.includes("phone")) return "tel";
  if (key.includes("dob")) return "bday";
  if (key.includes("physical_street") || key.includes("mailing_street")) return "street-address";
  if (key.includes("city")) return "address-level2";
  if (key.includes("zip")) return "postal-code";
  if (type === "date") return undefined;
  return undefined;
}
