"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";
import { BankCard } from "../../../types";

interface CardResultViewProps {
  resultData: any;
  createdCard: BankCard | null;
  selectedTheme: { bg: string; border: string };
  selectedVariant: string;
  engravedName: string;
  onDone: () => void;
}

export default function CardResultView({
  resultData,
  createdCard,
  selectedTheme,
  selectedVariant,
  engravedName,
  onDone
}: CardResultViewProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <div className="w-16 h-16 rounded-full bg-tertiary/10 border border-tertiary/30 flex items-center justify-center text-tertiary animate-bounce">
        <CheckCircle2 size={36} />
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-bold text-on-surface">
          {resultData.status === "APPROVED" ? "Application Approved & Card Issued!" : "Application Submitted under Review"}
        </h3>
        <p className="text-xs font-mono text-primary font-semibold">
          Application ID: {resultData.applicationId}
        </p>
      </div>

      {/* Issued Card Preview */}
      <div className={`relative w-full h-44 rounded-2xl p-5 border shadow-xl flex flex-col justify-between overflow-hidden text-left ${selectedTheme.bg} ${selectedTheme.border}`}>
        <div className="flex justify-between items-start z-10">
          <span className="font-headline-lg font-bold text-base text-primary">FinEdge</span>
          <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">{selectedVariant}</span>
        </div>
        <div className="my-1 z-10">
          <p className="font-mono text-sm tracking-[0.25em] text-on-surface font-bold">
            {createdCard?.cardNumber || "•••• •••• •••• 4599"}
          </p>
        </div>
        <div className="flex justify-between items-end z-10">
          <div className="flex flex-col">
            <span className="text-[8px] text-on-surface-variant uppercase">Engraved Name</span>
            <span className="font-mono text-xs font-bold text-on-surface uppercase">{engravedName}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] text-on-surface-variant uppercase">Expiry / CVV</span>
            <span className="font-mono text-xs font-bold text-on-surface">08/31 • {createdCard?.cvv || "782"}</span>
          </div>
        </div>
      </div>

      <button
        onClick={onDone}
        className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl text-xs hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] transition-all cursor-pointer mt-2"
      >
        Done &amp; View Cards
      </button>
    </div>
  );
}
