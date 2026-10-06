"use client";

import React from "react";
import { X, Receipt, TrendingUp, Landmark, CreditCard, Download, FileText, CheckCircle2 } from "lucide-react";
import { generateAndDownloadCentralPDF } from "../../lib/pdfService";
import { useAccounts } from "../../context/AccountContext";

export interface DeepDiveReportType {
  title: string;
  desc: string;
  category: "TAX" | "INVESTMENT" | "LOAN" | "CREDIT";
}

interface DeepDiveModalProps {
  report: DeepDiveReportType | null;
  onClose: () => void;
}

export default function DeepDiveModal({ report, onClose }: DeepDiveModalProps) {
  const { transactions, accounts } = useAccounts();

  if (!report) return null;

  const handleDownloadPDF = () => {
    switch (report.category) {
      case "TAX":
        generateAndDownloadCentralPDF({ documentType: 'TAX_STATEMENT', period: 'AY 2025-26' });
        break;
      case "INVESTMENT":
        generateAndDownloadCentralPDF({ documentType: 'INVESTMENT_REPORT' });
        break;
      case "LOAN":
        generateAndDownloadCentralPDF({ documentType: 'LOAN_AMORTIZATION', entityId: 'LN-2026-8819' });
        break;
      case "CREDIT":
      default:
        generateAndDownloadCentralPDF({ documentType: 'MONTHLY_SUMMARY', period: 'Credit Performance Report' });
        break;
    }
  };

  const getIcon = () => {
    switch (report.category) {
      case "TAX": return <Receipt className="text-error" size={24} />;
      case "INVESTMENT": return <TrendingUp className="text-tertiary" size={24} />;
      case "LOAN": return <Landmark className="text-secondary" size={24} />;
      case "CREDIT": return <CreditCard className="text-primary" size={24} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-surface-container-high flex items-center justify-center">
              {getIcon()}
            </div>
            <div>
              <h2 className="text-[18px] font-headline-lg font-bold text-on-surface">{report.title}</h2>
              <p className="text-[12px] text-on-surface-variant">{report.desc}</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {report.category === "TAX" && (
            <div className="space-y-4">
              <div className="p-4 bg-surface-container-low rounded-xl border border-white/10 space-y-2">
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-on-surface-variant">Assessment Year:</span>
                  <span className="font-semibold text-on-surface">AY 2025-26 (FY 2024-25)</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-on-surface-variant">Total Taxable Income:</span>
                  <span className="font-semibold text-on-surface">₹10,38,000</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-on-surface-variant">Section 80C Deductions:</span>
                  <span className="font-semibold text-tertiary">₹1,50,000 (Maxed)</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-on-surface-variant">TDS Deducted:</span>
                  <span className="font-semibold text-error">₹45,200</span>
                </div>
              </div>
              <p className="text-[13px] text-on-surface-variant leading-relaxed">
                Your tax report is synchronized with Form 26AS and CKYC records. All interest earned on savings and fixed deposits has been categorized for easy tax filing.
              </p>
            </div>
          )}

          {report.category === "INVESTMENT" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-surface-container-low rounded-xl border border-white/10">
                  <span className="text-[11px] text-on-surface-variant uppercase">Portfolio Value</span>
                  <p className="text-[18px] font-bold text-on-surface mt-1">₹1,24,000</p>
                  <span className="text-[12px] text-tertiary font-medium">+5.1% vs last mo.</span>
                </div>
                <div className="p-3.5 bg-surface-container-low rounded-xl border border-white/10">
                  <span className="text-[11px] text-on-surface-variant uppercase">Active SIPs</span>
                  <p className="text-[18px] font-bold text-on-surface mt-1">₹15,000 / mo</p>
                  <span className="text-[12px] text-primary font-medium">3 Funds Active</span>
                </div>
              </div>
              <p className="text-[13px] text-on-surface-variant leading-relaxed">
                Asset Allocation: 68.5% Equity Mutual Funds, 31.5% Fixed Deposits & Debt Instruments. Total annual return tracking at +14.2% CAGR.
              </p>
            </div>
          )}

          {report.category === "LOAN" && (
            <div className="space-y-4">
              <div className="p-4 bg-surface-container-low rounded-xl border border-white/10 space-y-2">
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-on-surface-variant">Home Loan Outstanding:</span>
                  <span className="font-semibold text-on-surface">₹24,50,000</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-on-surface-variant">Monthly EMI:</span>
                  <span className="font-semibold text-primary">₹23,500</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-on-surface-variant">Next Due Date:</span>
                  <span className="font-semibold text-on-surface">15th August 2026</span>
                </div>
              </div>
              <p className="text-[13px] text-on-surface-variant leading-relaxed">
                You have maintained a 100% on-time EMI payment record across all credit lines and loans.
              </p>
            </div>
          )}

          {report.category === "CREDIT" && (
            <div className="space-y-4">
              <div className="p-4 bg-surface-container-low rounded-xl border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[12px] text-on-surface-variant uppercase font-medium">Current Credit Score</span>
                  <p className="text-[32px] font-bold text-primary leading-none mt-1">782 <span className="text-[14px] text-tertiary font-normal">Excellent</span></p>
                </div>
                <div className="text-right">
                  <span className="text-[12px] text-tertiary font-medium">+18 pts in 6 mos</span>
                  <p className="text-[11px] text-on-surface-variant/70 mt-1">CIBIL / Experian Verified</p>
                </div>
              </div>
              <p className="text-[13px] text-on-surface-variant leading-relaxed">
                Key Factors: Low credit utilization ratio (14%), zero late payments, 4.2 years average credit account age.
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-surface-container-low flex justify-between items-center">
          <div className="flex items-center gap-2 text-[12px] text-tertiary">
            <CheckCircle2 size={16} />
            <span>Verified FinEdge Record</span>
          </div>
          <button
            type="button"
            onClick={handleDownloadPDF}
            className="px-5 py-2.5 bg-primary text-on-primary font-semibold text-[13px] rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] transition-all cursor-pointer flex items-center gap-2"
          >
            <Download size={15} />
            <span>Download Statement PDF</span>
          </button>
        </div>

      </div>
    </div>
  );
}
