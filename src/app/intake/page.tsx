import type { Metadata, Viewport } from "next";
import IntakeForm from "@/components/IntakeForm";
import StartIntake from "@/components/StartIntake";

export const metadata: Metadata = {
  title: "Your Intake — SoCal United Professional Services",
  description: "Finish your intake at your own pace.",
  // These URLs carry a client's personal resume token. They must never be indexed.
  robots: { index: false, follow: false, nocache: true },
};

// Deliberately overrides the kiosk's locked viewport: the kiosk suppresses zoom
// so nobody pinches the lobby screen, but a client filling a form on their own
// phone must be able to zoom in on the text.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFFFFF",
};

export default function IntakePage({
  searchParams,
}: {
  searchParams: { token?: string | string[] };
}) {
  const raw = searchParams?.token;
  const token = (Array.isArray(raw) ? raw[0] : raw ?? "").trim();

  // No token means this person has not been sent a link — start them fresh
  // rather than showing them an error they cannot act on.
  if (!token) return <StartIntake />;

  return <IntakeForm token={token} />;
}
