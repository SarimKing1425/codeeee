import Vapi from "@vapi-ai/web";
import { VAPI_PUBLIC_KEY } from "./config";

let vapiInstance: Vapi | null = null;

export function getVapi(): Vapi {
  if (typeof window === "undefined") {
    throw new Error("VAPI can only be used in the browser");
  }
  if (!vapiInstance) {
    vapiInstance = new Vapi(VAPI_PUBLIC_KEY);
  }
  return vapiInstance;
}
