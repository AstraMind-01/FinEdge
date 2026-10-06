"use client";

import React from "react";
import { AlertTriangle, Phone, Clock, HelpCircle, ChevronRight } from "lucide-react";

interface DisputeRightPanelProps {
  cardBlocked: boolean;
  onBlockCardClick: () => void;
  expandedFaq: number | null;
  onSelectFaq: (q: string) => void;
  faqs: { q: string; a: string }[];
}

export default function DisputeRightPanel({
  cardBlocked,
  onBlockCardClick,
  expandedFaq,
  onSelectFaq,
  faqs,
}: DisputeRightPanelProps) {
  return (
    <div className="lg:col-span-4 flex flex-col gap-6">
      {/* Fraud Alert Box */}
      <div className="bg-gradient-to-br from-[#1a1111] to-surface-container border border-error/20 rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-error/10 rounded-full blur-xl pointer-events-none"></div>
        <div className="flex items-center gap-3 text-error relative z-10">
          <AlertTriangle size={28} fill="currentColor" />
          <h3 className="text-lg font-semibold m-0">Fraud Suspected?</h3>
        </div>
        <p className="text-sm text-on-surface/80 m-0 relative z-10">
          If you notice unauthorized transactions, block your card immediately to prevent further loss.
        </p>
        <button
          onClick={onBlockCardClick}
          className="w-full bg-error text-on-error py-3 rounded-xl font-semibold hover:bg-error/90 transition-colors shadow-lg shadow-error/20 relative z-10 cursor-pointer"
        >
          {cardBlocked ? "Card Blocked ✓" : "Block Card Instantly"}
        </button>
        <div className="flex items-center justify-center gap-2 pt-2 border-t border-error/10 text-on-surface relative z-10">
          <Phone size={16} className="text-error" />
          <span className="font-mono text-sm font-medium">1800-420-9999</span>
        </div>
      </div>

      {/* SLA Timeline */}
      <div className="bg-surface-container rounded-2xl p-5 flex items-start gap-4 border border-primary/10">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Clock size={20} />
        </div>
        <div className="flex flex-col gap-1">
          <h4 className="text-base font-semibold text-on-surface m-0">Resolution Timeline</h4>
          <p className="text-sm text-on-surface-variant m-0">
            Most disputes are investigated and resolved within{" "}
            <strong className="text-primary font-medium">7-10 business days</strong>. Complex cases may take up to 45 days.
          </p>
        </div>
      </div>

      {/* Quick Help FAQ */}
      <div className="bg-surface-container rounded-2xl p-6 flex flex-col gap-4">
        <h4 className="text-lg font-semibold text-on-surface flex items-center gap-2 m-0">
          <HelpCircle className="text-primary" size={20} />
          Quick Help
        </h4>
        {faqs.map((faq, i) => (
          <div
            key={i}
            className={`flex flex-col cursor-pointer group ${i < faqs.length - 1 ? "border-b border-surface-container-high pb-4" : ""}`}
            onClick={() => onSelectFaq(faq.q)}
          >
            <div className="flex justify-between items-center text-sm text-on-surface font-medium group-hover:text-primary transition-colors">
              <span>{faq.q}</span>
              <ChevronRight
                size={16}
                className={`transition-transform ${expandedFaq === i ? "rotate-90 text-primary" : "group-hover:translate-x-0.5"}`}
              />
            </div>
            {expandedFaq === i && (
              <p className="text-xs text-on-surface-variant mt-2 mb-0 leading-relaxed animate-in fade-in duration-150">
                {faq.a}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Security Banner */}
      <div className="rounded-2xl overflow-hidden h-48 relative border border-surface-container-high">
        <div
          className="w-full h-full bg-cover bg-center mix-blend-luminosity opacity-40"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBUWMandc-GzznDc8MNuWlS2ep4-jbuyijK9aPKeeh3PS3wsariZcgw0OTsRX63At5lfQVdgGet_PC9b3Ga8ikE-RCUIltiPzBohrmOSm3OW9n3SPrUHG6hZfMwERd3mTeMXJwFQlp8D34rw31zbqiH7fhaqmi2af3aohHr573cbUBtF1u227W9NHVi9V7DZEjqp3gpUTO_Ctbs5KCRqv-yauS4yvza1evAxd63YnKCinLliFLzjolp8g')`,
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-[10px] text-primary uppercase tracking-widest mb-1 font-semibold">Your Security</p>
          <p className="text-sm text-on-surface m-0">We employ bank-grade encryption to ensure your claims are processed securely.</p>
        </div>
      </div>
    </div>
  );
}
