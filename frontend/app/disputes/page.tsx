"use client";
import React, { useState } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { Plus, Search, Filter, Calendar, Folder, Clock, CheckCircle, CurrencyIcon, AlertTriangle, ArrowRight, Gavel, Phone, HelpCircle, ChevronRight, Sync, XCircle, Info, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

const disputes = [
  {
    id: "DSP2026-00458",
    title: "Unauthorized Transaction",
    status: "Open",
    amount: "₹12,400",
    merchant: "Unknown Online Store",
    raisedAt: "2 days ago",
    icon: "alert",
  },
  {
    id: "DSP2026-00392",
    title: "Failed Transfer",
    status: "Under Investigation",
    amount: "₹25,000",
    merchant: "Rahul Kumar",
    merchantLabel: "Recipient",
    raisedAt: "5 days ago",
    icon: "swap",
    steps: ["Raised", "Reviewed", "Investigation", "Resolution"],
    currentStep: 2,
  },
  {
    id: "DSP2026-00215",
    title: "Wrong Amount Debited",
    status: "Resolved",
    amount: "₹1,500",
    raisedAt: "Closed 12 May 2026",
    icon: "currency",
    resolution: "Refund of ₹1,500 credited to account ending in 4920 on 12 May 2026.",
  },
  {
    id: "DSP2026-00184",
    title: "Card Fraud",
    status: "Rejected",
    amount: "₹8,999",
    raisedAt: "Closed 01 May 2026",
    icon: "card",
    reason: "Transaction was verified with an OTP delivered to the registered mobile number. No fraud detected.",
  },
];

const statusConfig: Record<string, { color: string; bg: string; dot?: string; icon: React.ReactNode }> = {
  "Open": {
    color: "text-primary",
    bg: "bg-primary/10",
    dot: "bg-primary",
    icon: <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block mr-1"></span>,
  },
  "Under Investigation": {
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    icon: <span className="material-symbols-outlined text-[14px] mr-0.5" style={{fontSize:'14px'}}>sync</span>,
  },
  "Resolved": {
    color: "text-[#2DD4BF]",
    bg: "bg-[#2DD4BF]/10",
    icon: <CheckCircle2 size={14} className="mr-0.5" />,
  },
  "Rejected": {
    color: "text-error",
    bg: "bg-error/10",
    icon: <XCircle size={14} className="mr-0.5" />,
  },
};

const tabs = ["All Disputes", "Open (1)", "In Progress (2)", "Resolved (11)", "Rejected (0)"];

export default function DisputesPage() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      <Sidebar />
      <div className="flex-1 lg:ml-[230px] flex flex-col min-h-screen transition-all duration-300">
        <Header />
        
        <main className="flex-1 p-4 md:p-8 mt-[72px] overflow-y-auto max-w-[1400px] mx-auto w-full">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative mb-8 pt-4">
            <div className="flex flex-col gap-2 z-10">
              <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-1 tracking-wider uppercase font-medium">
                <span className="hover:text-primary transition-colors cursor-pointer">Support</span>
                <ChevronRight size={14} />
                <span className="text-primary font-bold">Disputes</span>
              </div>
              <div className="flex items-center gap-3">
                <Gavel className="text-primary w-8 h-8" />
                <h1 className="text-4xl md:text-5xl font-bold text-on-surface m-0 leading-tight">Disputes & Complaints</h1>
              </div>
              <p className="text-base text-on-surface-variant mt-1">Raise, track, and resolve transaction issues securely.</p>
            </div>
            <button className="group flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-semibold hover:bg-primary-fixed-dim hover:shadow-[0_0_20px_rgba(240,180,41,0.4)] transition-all duration-300 z-10 w-fit relative overflow-hidden">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              <Plus size={20} className="relative z-10 group-hover:rotate-90 transition-transform" />
              <span className="relative z-10">Raise New Dispute</span>
            </button>
            <div className="absolute -top-8 -right-8 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
          </div>

          {/* Summary Strip */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Disputes", value: "14", color: "text-on-surface", bgIcon: "bg-surface-container-high", iconColor: "text-on-surface", icon: <Folder size={20} /> },
              { label: "Open / In Progress", value: "3", color: "text-primary", bgIcon: "bg-primary/10", iconColor: "text-primary", icon: <Clock size={20} /> },
              { label: "Resolved", value: "11", color: "text-[#2DD4BF]", bgIcon: "bg-[#2DD4BF]/10", iconColor: "text-[#2DD4BF]", icon: <CheckCircle size={20} /> },
              { label: "Disputed Amount", value: "₹48,250", color: "text-on-surface", bgIcon: "bg-surface-container", iconColor: "text-on-surface", icon: <span className="font-bold text-base">₹</span> },
            ].map((card, i) => (
              <div key={i} className="bg-surface-container rounded-2xl p-6 relative overflow-hidden group">
                <div className="flex justify-between items-start mb-6">
                  <p className={`text-xs font-semibold uppercase tracking-widest ${card.color}`}>{card.label}</p>
                  <div className={`w-10 h-10 rounded-full ${card.bgIcon} flex items-center justify-center ${card.iconColor}`}>{card.icon}</div>
                </div>
                <h2 className={`text-4xl font-bold m-0 ${card.color}`}>{card.value}</h2>
                <div className={`absolute -bottom-4 -right-4 ${card.iconColor} opacity-5 group-hover:opacity-10 transition-opacity`}>
                  <div className="w-[120px] h-[120px] flex items-center justify-center text-[80px]">{card.icon}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: List */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Tabs + Search */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-1 border-b border-surface-container-high pb-0">
                  {tabs.map((tab, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTab(i)}
                      className={`px-4 py-3 rounded-t-lg text-xs font-semibold transition-colors relative ${
                        activeTab === i
                          ? "bg-surface-container-high text-on-surface after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input
                      type="text"
                      placeholder="Search by dispute ID or reference..."
                      className="w-full bg-surface-container rounded-xl py-3 pl-12 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary transition-all border border-transparent focus:border-primary/30"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button className="bg-surface-container text-on-surface px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-surface-container-high transition-colors border border-surface-container-highest">
                      <Filter size={16} />
                      Type
                    </button>
                    <button className="bg-surface-container text-on-surface px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-surface-container-high transition-colors border border-surface-container-highest">
                      <Calendar size={16} />
                      Date
                    </button>
                  </div>
                </div>
              </div>

              {/* Dispute Cards */}
              <div className="flex flex-col gap-4">
                
                {/* Card 1: Open */}
                <div className="bg-surface-container rounded-2xl p-6 flex flex-col gap-5 hover:shadow-[0_0_20px_rgba(240,180,41,0.06)] transition-all border border-transparent hover:border-primary/10">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center text-error shrink-0">
                        <AlertTriangle size={22} fill="currentColor" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <h3 className="text-lg font-semibold text-on-surface m-0">Unauthorized Transaction</h3>
                        <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                          <span className="font-mono text-on-surface/70 text-xs">DSP2026-00458</span>
                          <span className="w-1 h-1 rounded-full bg-on-surface-variant/50 inline-block"></span>
                          <span>Raised 2 days ago</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-lg font-semibold text-on-surface">₹12,400</span>
                      <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block"></span>
                        Open
                      </div>
                    </div>
                  </div>
                  <div className="bg-background/50 border border-surface-container-highest p-4 rounded-xl flex items-center justify-between text-sm">
                    <span className="text-on-surface-variant">Merchant: <span className="text-on-surface font-medium">Unknown Online Store</span></span>
                    <button className="text-primary hover:text-primary-fixed-dim transition-colors font-medium flex items-center gap-1">
                      View Details <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Card 2: Under Investigation */}
                <div className="bg-surface-container rounded-2xl p-6 flex flex-col gap-5 hover:shadow-[0_0_20px_rgba(240,180,41,0.06)] transition-all border border-transparent hover:border-primary/10">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <ArrowRight size={22} className="rotate-[45deg]" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <h3 className="text-lg font-semibold text-on-surface m-0">Failed Transfer</h3>
                        <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                          <span className="font-mono text-on-surface/70 text-xs">DSP2026-00392</span>
                          <span className="w-1 h-1 rounded-full bg-on-surface-variant/50 inline-block"></span>
                          <span>Raised 5 days ago</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-lg font-semibold text-on-surface">₹25,000</span>
                      <div className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-spin inline-block" style={{animationDuration:'2s'}}></span>
                        Under Investigation
                      </div>
                    </div>
                  </div>
                  <div className="bg-background/50 border border-surface-container-highest p-4 rounded-xl text-sm mb-1">
                    <span className="text-on-surface-variant">Recipient: <span className="text-on-surface font-medium">Rahul Kumar</span></span>
                  </div>
                  {/* Progress Stepper */}
                  <div className="relative flex justify-between items-start px-2">
                    <div className="absolute left-6 right-6 top-3 h-0.5 bg-surface-container-high -z-10"></div>
                    {["Raised", "Reviewed", "Investigation", "Resolution"].map((step, si) => (
                      <div key={si} className="flex flex-col items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          si < 2 ? "bg-[#2DD4BF] text-[#003731]" :
                          si === 2 ? "bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]" :
                          "bg-surface-container-high border border-outline-variant"
                        }`}>
                          {si < 2 ? "✓" : si === 2 ? <div className="w-2 h-2 bg-white rounded-full"></div> : ""}
                        </div>
                        <span className={`text-[10px] font-medium ${si === 2 ? "text-blue-400" : si < 2 ? "text-on-surface" : "text-on-surface-variant"}`}>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card 3: Resolved */}
                <div className="bg-surface-container rounded-2xl p-6 flex flex-col gap-5 hover:shadow-[0_0_15px_rgba(240,180,41,0.05)] transition-all opacity-75 hover:opacity-100 border border-transparent hover:border-[#2DD4BF]/10">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                        <span className="font-bold text-lg">₹</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <h3 className="text-lg font-semibold text-on-surface m-0 line-through decoration-on-surface-variant/50">Wrong Amount Debited</h3>
                        <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                          <span className="font-mono text-on-surface/70 text-xs">DSP2026-00215</span>
                          <span className="w-1 h-1 rounded-full bg-on-surface-variant/50 inline-block"></span>
                          <span>Closed 12 May 2026</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-lg font-semibold text-on-surface">₹1,500</span>
                      <div className="px-3 py-1 rounded-full bg-[#2DD4BF]/10 text-[#2DD4BF] text-xs font-semibold flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        Resolved
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#2DD4BF]/5 border border-[#2DD4BF]/20 p-4 rounded-xl text-sm text-on-surface flex items-start gap-3">
                    <Info size={16} className="text-[#2DD4BF] shrink-0 mt-0.5" />
                    <p className="m-0"><strong>Resolution:</strong> Refund of ₹1,500 credited to account ending in 4920 on 12 May 2026.</p>
                  </div>
                </div>

                {/* Card 4: Rejected */}
                <div className="bg-surface-container rounded-2xl p-6 flex flex-col gap-5 hover:shadow-[0_0_15px_rgba(240,180,41,0.05)] transition-all opacity-75 hover:opacity-100 border border-transparent hover:border-error/10">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                        <span className="text-lg">💳</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <h3 className="text-lg font-semibold text-on-surface m-0 line-through decoration-on-surface-variant/50">Card Fraud</h3>
                        <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                          <span className="font-mono text-on-surface/70 text-xs">DSP2026-00184</span>
                          <span className="w-1 h-1 rounded-full bg-on-surface-variant/50 inline-block"></span>
                          <span>Closed 01 May 2026</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-lg font-semibold text-on-surface">₹8,999</span>
                      <div className="px-3 py-1 rounded-full bg-error/10 text-error text-xs font-semibold flex items-center gap-1">
                        <XCircle size={12} />
                        Rejected
                      </div>
                    </div>
                  </div>
                  <div className="bg-error/5 border border-error/20 p-4 rounded-xl text-sm text-on-surface flex items-start gap-3">
                    <Info size={16} className="text-error shrink-0 mt-0.5" />
                    <p className="m-0"><strong>Reason:</strong> Transaction was verified with an OTP delivered to the registered mobile number. No fraud detected.</p>
                  </div>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center pt-2 text-sm text-on-surface-variant">
                  <span>Showing 1-4 of 14 disputes</span>
                  <div className="flex gap-2">
                    <button className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors">
                      <ChevronRight size={16} className="rotate-180" />
                    </button>
                    <button className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Fraud Alert Box */}
              <div className="bg-gradient-to-br from-[#1a1111] to-surface-container border border-error/20 rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-error/10 rounded-full blur-xl pointer-events-none"></div>
                <div className="flex items-center gap-3 text-error relative z-10">
                  <AlertTriangle size={28} fill="currentColor" />
                  <h3 className="text-lg font-semibold m-0">Fraud Suspected?</h3>
                </div>
                <p className="text-sm text-on-surface/80 m-0 relative z-10">If you notice unauthorized transactions, block your card immediately to prevent further loss.</p>
                <button className="w-full bg-error text-on-error py-3 rounded-xl font-semibold hover:bg-error/90 transition-colors shadow-lg shadow-error/20 relative z-10">
                  Block Card Instantly
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
                    Most disputes are investigated and resolved within <strong className="text-primary font-medium">7-10 business days</strong>. Complex cases may take up to 45 days.
                  </p>
                </div>
              </div>

              {/* Quick Help FAQ */}
              <div className="bg-surface-container rounded-2xl p-6 flex flex-col gap-4">
                <h4 className="text-lg font-semibold text-on-surface flex items-center gap-2 m-0">
                  <HelpCircle className="text-primary" size={20} />
                  Quick Help
                </h4>
                {["What evidence do I need?", "Can I cancel a dispute?", "Will I get a provisional credit?"].map((q, i) => (
                  <div key={i} className={`flex flex-col cursor-pointer group ${i < 2 ? "border-b border-surface-container-high pb-4" : ""}`}>
                    <div className="flex justify-between items-center text-sm text-on-surface font-medium group-hover:text-primary transition-colors">
                      <span>{q}</span>
                      <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Security Banner */}
              <div className="rounded-2xl overflow-hidden h-48 relative border border-surface-container-high">
                <div
                  className="w-full h-full bg-cover bg-center mix-blend-luminosity opacity-40"
                  style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBUWMandc-GzznDc8MNuWlS2ep4-jbuyijK9aPKeeh3PS3wsariZcgw0OTsRX63At5lfQVdgGet_PC9b3Ga8ikE-RCUIltiPzBohrmOSm3OW9n3SPrUHG6hZfMwERd3mTeMXJwFQlp8D34rw31zbqiH7fhaqmi2af3aohHr573cbUBtF1u227W9NHVi9V7DZEjqp3gpUTO_Ctbs5KCRqv-yauS4yvza1evAxd63YnKCinLliFLzjolp8g')` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-[10px] text-primary uppercase tracking-widest mb-1 font-semibold">Your Security</p>
                  <p className="text-sm text-on-surface m-0">We employ bank-grade encryption to ensure your claims are processed securely.</p>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
