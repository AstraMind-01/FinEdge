"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import MobileQrAuthPage from "@/app/qr-auth/[challengeId]/page";
import { Loader2 } from "lucide-react";

function QrQueryAuthContent() {
  const searchParams = useSearchParams();
  const challengeId = searchParams.get("challenge") || searchParams.get("challengeId") || "";

  if (!challengeId) {
    return (
      <div className="min-h-screen bg-[#0B1120] text-white flex flex-col items-center justify-center p-4">
        <div className="bg-[#131b2e] border border-[#2f3445] p-6 rounded-2xl text-center max-w-sm">
          <h3 className="text-lg font-bold text-[#ef4444] mb-2">Invalid QR Link</h3>
          <p className="text-xs text-[#cbd5e1]">No valid QR challenge reference was found in this URL. Please refresh the QR code on your desktop screen and scan again.</p>
        </div>
      </div>
    );
  }

  return <MobileQrAuthPage />;
}

export default function QrQueryAuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0B1120] text-white flex items-center justify-center">
        <Loader2 className="animate-spin text-[#f0b429]" size={36} />
      </div>
    }>
      <QrQueryAuthContent />
    </Suspense>
  );
}
