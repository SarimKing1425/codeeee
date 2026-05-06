"use client";

import dynamic from "next/dynamic";

const KyrieKiosk = dynamic(() => import("@/components/KyrieKiosk"), {
  ssr: false,
});

export default function Page() {
  return <KyrieKiosk />;
}
