// Client for the Kyrie intake webhooks (n8n workflows 11 and 12).
//
// Nothing secret lives here. The browser never sees an Airtable or VAPI key —
// every call goes to an n8n webhook that holds the credentials server-side.
// The token in the URL is the client's only credential, which is why it is
// never logged, never put in a page title, and never sent anywhere but n8n.

export const N8N_WEBHOOK_BASE = "https://socalai.app.n8n.cloud/webhook";

export type QuestionType =
  | "text"
  | "textarea"
  | "email"
  | "tel"
  | "date"
  | "time"
  | "choice"
  | "yesno"
  | "checkbox";

export type Question = {
  key: string;
  label: string;
  type: QuestionType;
  optional: boolean;
  choices?: string[];
};

export type Section = {
  key: string;
  title: string;
  questions: Question[];
};

export type IntakeForm = {
  found: true;
  formName: string;
  fullName: string;
  sections: Section[];
  answers: Record<string, string>;
  needsReview: string[];
  completedThrough: string;
  answeredCount: number;
  requiredCount: number;
};

export type IntakeFormError = { found: false; reason: string };

export type LoadResult = IntakeForm | IntakeFormError;

/** Kyrie writes this marker when it could not make out an answer twice running. */
export const UNCLEAR_MARKER = "[UNCLEAR";

export function isUnclear(value: string | undefined): boolean {
  return !!value && value.toUpperCase().includes(UNCLEAR_MARKER);
}

/** An unclear value is not an answer — it is a question we still have to ask. */
export function isAnswered(value: string | undefined): boolean {
  return !!value && value.trim() !== "" && !isUnclear(value);
}

async function postJson<T>(path: string, body: unknown, timeoutMs = 20000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${N8N_WEBHOOK_BASE}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    // 404 carries a meaningful body (expired link), so parse before throwing.
    const text = await res.text();
    let parsed: unknown = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = null;
    }
    if (parsed === null && !res.ok) {
      throw new Error(`Request failed (${res.status})`);
    }
    return parsed as T;
  } finally {
    clearTimeout(timer);
  }
}

export function loadIntake(token: string): Promise<LoadResult> {
  return postJson<LoadResult>("kyrie-intake-load", { token });
}

export type SaveResult = {
  saved: boolean;
  savedSection?: string;
  resumeToken?: string;
  reason?: string;
};

export function saveProgress(args: {
  token: string;
  sectionKey: string;
  answers: Record<string, string>;
  completedThrough: string;
}): Promise<SaveResult> {
  return postJson<SaveResult>("kyrie-intake-progress", {
    resumeToken: args.token,
    sectionKey: args.sectionKey,
    answers: args.answers,
    completedThrough: args.completedThrough,
    channel: "Web",
  });
}

export type SubmitResult = { submitted: boolean; recordId?: string; reason?: string };

export function submitIntake(args: {
  token: string;
  answers: Record<string, string>;
  completedThrough: string;
}): Promise<SubmitResult> {
  return postJson<SubmitResult>(
    "kyrie-intake-submit",
    {
      token: args.token,
      answers: args.answers,
      completedThrough: args.completedThrough,
    },
    // The submit hop also triggers PDF generation upstream, so allow longer.
    45000,
  );
}

export type StartResult = { started: boolean; token?: string; reason?: string };

export function startIntake(args: { fullName: string; phone: string }): Promise<StartResult> {
  return postJson<StartResult>("kyrie-intake-start", args);
}

/**
 * Best-effort save when the page is being closed or backgrounded.
 * sendBeacon survives navigation where fetch does not, which is what stops a
 * client losing the screen they were on when they lock their phone.
 */
export function beaconProgress(args: {
  token: string;
  sectionKey: string;
  answers: Record<string, string>;
  completedThrough: string;
}): void {
  try {
    const payload = JSON.stringify({
      resumeToken: args.token,
      sectionKey: args.sectionKey,
      answers: args.answers,
      completedThrough: args.completedThrough,
      channel: "Web",
    });
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon(`${N8N_WEBHOOK_BASE}/kyrie-intake-progress`, blob);
  } catch {
    // A failed beacon is not worth surfacing: the debounced save already ran.
  }
}
