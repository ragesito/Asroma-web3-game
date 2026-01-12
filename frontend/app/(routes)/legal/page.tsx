import { Suspense } from "react";
import LegalClient from "@/components/legal/legalClient";

export default function LegalPage() {
  return (
    <Suspense fallback={<div className="text-white p-6">Loading...</div>}>
      <LegalClient />
    </Suspense>
  );
}
