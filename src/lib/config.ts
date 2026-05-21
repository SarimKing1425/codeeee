// VAPI connection config.
// These are PUBLIC, non-secret values (the public key is exposed in the browser
// by design, and the assistant ID is not sensitive). They are hardcoded here so
// the kiosk works on any deployment without depending on dashboard env vars.
//
// To point the kiosk at a different VAPI assistant, change ASSISTANT_ID below.

export const VAPI_PUBLIC_KEY = "7687ccd8-e4a8-45cf-a421-238a85049776";

// "Kyrie Inbound Receptionist - Main" in the socalaiagent@gmail.com VAPI org.
export const VAPI_ASSISTANT_ID = "7aeb26f1-9e19-4f5b-b2cd-9f95d0572a85";
