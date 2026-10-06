"use client";

import React from "react";
import { Sparkles } from "lucide-react";

interface CardLivePreviewProps {
  theme: { bg: string; border: string };
  variant: string;
  engravedName: string;
}

export default function CardLivePreview({ theme, variant, engravedName }: CardLivePreviewProps) {
  return (
    <div className={`relative w-full h-44 rounded-2xl p-5 border shadow-xl flex flex-col justify-between overflow-hidden transition-all duration-300 ${theme.bg} ${theme.border}`}>
      <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 rounded-full bg-white/5 blur-xl pointer-events-none" />

      <div className="flex justify-between items-start z-10">
        <div className="flex items-center gap-2">
          <span className="font-headline-lg font-bold text-base text-primary tracking-wide">FinEdge</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-on-surface-variant font-mono">EMV CHIP</span>
        </div>
        <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
          {variant}
        </span>
      </div>

      <div className="my-1 z-10">
        <p className="font-mono text-base tracking-[0.25em] text-on-surface font-bold drop-shadow">
          •••• •••• •••• 4599
        </p>
      </div>

      <div className="flex justify-between items-end z-10">
        <div className="flex flex-col">
          <span className="text-[8px] text-on-surface-variant uppercase tracking-wider">Cardholder Name</span>
          <span className="font-mono text-xs font-bold text-on-surface uppercase tracking-wide truncate max-w-[180px]">
            {engravedName || "YOUR NAME"}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[8px] text-on-surface-variant uppercase tracking-wider">Expires / CVV</span>
          <span className="font-mono text-xs font-bold text-on-surface">08/31 • •••</span>
        </div>
      </div>
    </div>
  );
}
