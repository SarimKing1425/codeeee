import Vapi from "@vapi-ai/web";

let vapiInstance: Vapi | null = null;

export function getVapi(): Vapi {
  if (typeof window === "undefined") {
    throw new Error("VAPI can only be used in the browser");
  }
  if (!vapiInstance) {
    const key = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    if (!key) throw new Error("Missing NEXT_PUBLIC_VAPI_PUBLIC_KEY");
    vapiInstance = new Vapi(key);
  }
  return vapiInstance;
}
