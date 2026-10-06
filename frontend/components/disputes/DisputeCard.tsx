"use client";

import React from "react";
import { ArrowRight, Info, AlertTriangle, RefreshCw, CreditCard, DollarSign } from "lucide-react";
import { statusConfig } from "./disputeData";

interface DisputeItem {
  id: string;
  title: string;
  status: string;
  amount: string;
  merchant?: string;
  merchantLabel?: string;
  raisedAt: string;
  icon?: string;
  steps?: string[];
  currentStep?: number;
  resolution?: string;
  reason?: string;
}

interface DisputeCardProps {
  item: DisputeItem;
  onViewDetails: (item: DisputeItem) => void;
}

export default function DisputeCard({ item, onViewDetails }: DisputeCardProps) {
  const getIcon = () => {
    switch (item.icon) {
      case "alert":
        return <AlertTriangle size={18} className="text-primary" />;
      case "swap":
        return <RefreshCw size={18} className="text-blue-400" />;
      case "card":
        return <CreditCard size={18} className="text-error" />;
      default:
        return <DollarSign size={18} className="text-[#2DD4BF]" />;
    }
  };

  const getIconBg = () => {
    switch (item.icon) {
      case "alert":
        return "bg-primary/10 border-primary/20";
      case "swap":
        return "bg-blue-500/10 border-blue-500/20";
      case "card":
        return "bg-error/10 border-error/20";
      default:
        return "bg-[#2DD4BF]/10 border-[#2DD4BF]/20";
    }
  };

  return (
    <div className="bg-surface-container rounded-2xl p-6 flex flex-col gap-5 border border-outline-variant/10 hover:border-outline-variant/30 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 mt-0.5 ${getIconBg()}`}>
            {getIcon()}
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-semibold text-on-surface m-0">
              {item.title}
            </h3>
            <div className="flex items-center gap-3 text-sm text-on-surface-variant">
              <span className="font-mono text-on-surface/70 text-xs">{item.id}</span>
              <span className="w-1 h-1 rounded-full bg-on-surface-variant/50 inline-block"></span>
              <span>Raised {item.raisedAt}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-lg font-semibold text-on-surface">{item.amount}</span>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
            statusConfig[item.status]?.bg || "bg-surface-container-high"
          } ${statusConfig[item.status]?.color || "text-on-surface"}`}>
            {statusConfig[item.status]?.icon}
            {item.status}
          </div>
        </div>
      </div>

      {item.merchant && (
        <div className="bg-background/50 border border-surface-container-highest p-4 rounded-xl flex items-center justify-between text-sm">
          <span className="text-on-surface-variant">{item.merchantLabel || "Merchant"}: <span className="text-on-surface font-medium">{item.merchant}</span></span>
          <button 
            onClick={() => onViewDetails(item)}
            className="text-primary hover:text-primary-fixed-dim transition-colors font-medium flex items-center gap-1 text-xs cursor-pointer"
          >
            View Details <ArrowRight size={14} />
          </button>
        </div>
      )}

      {item.steps && (
        <div className="relative flex justify-between items-start px-2 pt-2">
          <div className="absolute left-6 right-6 top-5 h-0.5 bg-surface-container-high -z-10"></div>
          {item.steps.map((step, si) => (
            <div key={si} className="flex flex-col items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                si < (item.currentStep || 0) ? "bg-[#2DD4BF] text-[#003731]" :
                si === (item.currentStep || 0) ? "bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]" :
                "bg-surface-container-high border border-outline-variant"
              }`}>
                {si < (item.currentStep || 0) ? "✓" : si === (item.currentStep || 0) ? <div className="w-2 h-2 bg-white rounded-full"></div> : ""}
              </div>
              <span className={`text-[10px] font-medium ${si === (item.currentStep || 0) ? "text-blue-400" : si < (item.currentStep || 0) ? "text-on-surface" : "text-on-surface-variant"}`}>{step}</span>
            </div>
          ))}
        </div>
      )}

      {item.resolution && (
        <div className="bg-[#2DD4BF]/5 border border-[#2DD4BF]/20 p-4 rounded-xl text-sm text-on-surface flex items-start gap-3">
          <Info size={16} className="text-[#2DD4BF] shrink-0 mt-0.5" />
          <p className="m-0"><strong>Resolution:</strong> {item.resolution}</p>
        </div>
      )}

      {item.reason && (
        <div className="bg-error/5 border border-error/20 p-4 rounded-xl text-sm text-on-surface flex items-start gap-3">
          <Info size={16} className="text-error shrink-0 mt-0.5" />
          <p className="m-0"><strong>Reason:</strong> {item.reason}</p>
        </div>
      )}
    </div>
  );
}
