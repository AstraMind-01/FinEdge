"use client";

import React, { useState } from "react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import SupportChatModal from "../../components/modals/SupportChatModal";
import { Plus, Search, Filter, Calendar, Folder, Clock, CheckCircle, ChevronRight, Gavel } from "lucide-react";
import Link from "next/link";
import { initialDisputes, tabs, faqs } from "../../components/disputes/disputeData";
import DisputeCard from "../../components/disputes/DisputeCard";
import DisputeRightPanel from "../../components/disputes/DisputeRightPanel";
import {
  RaiseDisputeModal,
  BlockCardModal,
  DisputeDetailsModal,
  DisputeTypeFilterModal,
  DisputeDateFilterModal,
} from "../../components/disputes/DisputeModals";

export default function DisputesPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [disputeList, setDisputeList] = useState(initialDisputes);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Popup Modals State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBlockCardModalOpen, setIsBlockCardModalOpen] = useState(false);
  const [cardBlocked, setCardBlocked] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<any | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedDateRange, setSelectedDateRange] = useState<string>("ALL");

  const [txnId, setTxnId] = useState("");
  const [reason, setReason] = useState("Unauthorized Online Transaction");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [selectedHelpQuestion, setSelectedHelpQuestion] = useState<string | undefined>(undefined);

  const handleRaiseDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/banking/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DISPUTE_TRANSACTION",
          payload: { transactionId: txnId || `TXN-${Date.now()}`, reason },
        }),
      });
      const data = await res.json();
      if (data.success) {
        const newDispute = {
          id: data.ticketId || `DSP2026-${Math.floor(10000 + Math.random() * 90000)}`,
          title: reason,
          status: "Open",
          amount: "₹" + Math.floor(1000 + Math.random() * 20000).toLocaleString("en-IN"),
          merchant: txnId || "Online Transaction",
          raisedAt: "Just now",
          icon: "alert",
        };
        setDisputeList([newDispute, ...disputeList]);
        setSuccessMsg(data.message || "Dispute registered successfully!");
        setTimeout(() => {
          setIsModalOpen(false);
          setSuccessMsg(null);
          setTxnId("");
        }, 1800);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDisputes = disputeList.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.merchant && item.merchant.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === 1 && item.status !== "Open") return false;
    if (activeTab === 2 && item.status !== "Under Investigation") return false;
    if (activeTab === 3 && item.status !== "Resolved") return false;
    if (activeTab === 4 && item.status !== "Rejected") return false;

    if (selectedType !== "ALL" && !item.title.toLowerCase().includes(selectedType.toLowerCase())) return false;

    return true;
  });

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      <Sidebar />
      <div className="flex-1 lg:pl-[230px] w-full min-w-0 max-w-full flex flex-col min-h-screen transition-all duration-300 overflow-x-hidden">
        <Header />

        <main className="flex-1 p-4 md:p-8 mt-[72px] overflow-y-auto max-w-[1400px] mx-auto w-full">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative mb-8 pt-4">
            <div className="flex flex-col gap-2 z-10">
              <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-1 tracking-wider uppercase font-medium">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                <span>/</span>
                <span className="text-primary font-bold">Disputes</span>
              </div>
              <div className="flex items-center gap-3">
                <Gavel className="text-primary w-8 h-8" />
                <h1 className="text-4xl md:text-5xl font-bold text-on-surface m-0 leading-tight">Disputes &amp; Complaints</h1>
              </div>
              <p className="text-base text-on-surface-variant mt-1">Raise, track, and resolve transaction issues securely.</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="group flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-on-primary font-semibold hover:bg-primary-fixed-dim hover:shadow-[0_0_20px_rgba(240,180,41,0.4)] transition-all duration-300 z-10 w-fit relative overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              <Plus size={20} className="relative z-10 group-hover:rotate-90 transition-transform" />
              <span className="relative z-10">Raise New Dispute</span>
            </button>
            <div className="absolute -top-8 -right-8 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
          </div>

          {/* Summary Strip */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Disputes", value: disputeList.length, color: "text-on-surface", bgIcon: "bg-surface-container-high", iconColor: "text-on-surface", icon: <Folder size={20} /> },
              { label: "Open / In Progress", value: disputeList.filter((d) => d.status === "Open" || d.status === "Under Investigation").length, color: "text-primary", bgIcon: "bg-primary/10", iconColor: "text-primary", icon: <Clock size={20} /> },
              { label: "Resolved", value: disputeList.filter((d) => d.status === "Resolved").length, color: "text-[#2DD4BF]", bgIcon: "bg-[#2DD4BF]/10", iconColor: "text-[#2DD4BF]", icon: <CheckCircle size={20} /> },
              { label: "Disputed Amount", value: "₹48,250", color: "text-on-surface", bgIcon: "bg-surface-container", iconColor: "text-on-surface", icon: <span className="font-bold text-base">₹</span> },
            ].map((card, i) => (
              <div key={i} className="bg-surface-container rounded-2xl p-6 relative overflow-hidden group">
                <div className="flex justify-between items-start mb-6">
                  <p className={`text-xs font-semibold uppercase tracking-widest ${card.color}`}>{card.label}</p>
                  <div className={`w-10 h-10 rounded-full ${card.bgIcon} flex items-center justify-center ${card.iconColor}`}>{card.icon}</div>
                </div>
                <h2 className={`text-4xl font-bold m-0 ${card.color}`}>{card.value}</h2>
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
                  {["All Disputes", `Open (${disputeList.filter((d) => d.status === "Open").length})`, `In Progress (${disputeList.filter((d) => d.status === "Under Investigation").length})`, `Resolved (${disputeList.filter((d) => d.status === "Resolved").length})`, `Rejected (${disputeList.filter((d) => d.status === "Rejected").length})`].map((tab, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTab(i)}
                      className={`px-4 py-3 rounded-t-lg text-xs font-semibold transition-colors relative cursor-pointer ${
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
                      placeholder="Search by dispute ID, title, or reference..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-surface-container rounded-xl py-3 pl-12 pr-4 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary transition-all border border-transparent focus:border-primary/30"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsTypeModalOpen(true)}
                      className={`bg-surface-container text-on-surface px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-surface-container-high transition-colors border ${
                        selectedType !== "ALL" ? "border-primary text-primary" : "border-surface-container-highest"
                      } cursor-pointer`}
                    >
                      <Filter size={16} />
                      {selectedType === "ALL" ? "Type" : selectedType}
                    </button>
                    <button
                      onClick={() => setIsDateModalOpen(true)}
                      className={`bg-surface-container text-on-surface px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-surface-container-high transition-colors border ${
                        selectedDateRange !== "ALL" ? "border-primary text-primary" : "border-surface-container-highest"
                      } cursor-pointer`}
                    >
                      <Calendar size={16} />
                      {selectedDateRange === "ALL" ? "Date" : selectedDateRange}
                    </button>
                  </div>
                </div>
              </div>

              {/* Dispute Cards */}
              <div className="flex flex-col gap-4">
                {filteredDisputes.length === 0 ? (
                  <div className="bg-surface-container rounded-2xl p-12 flex flex-col items-center justify-center gap-3 text-center border border-outline-variant/10">
                    <Folder size={40} className="text-on-surface-variant/40" />
                    <p className="text-base font-semibold text-on-surface m-0">No disputes found</p>
                    <p className="text-xs text-on-surface-variant m-0">No records match your selected filter criteria.</p>
                  </div>
                ) : (
                  filteredDisputes.map((item) => (
                    <DisputeCard
                      key={item.id}
                      item={item}
                      onViewDetails={(d) => {
                        setSelectedDispute(d);
                        setIsDetailsModalOpen(true);
                      }}
                    />
                  ))
                )}

                {/* Pagination */}
                <div className="flex justify-between items-center pt-2 text-sm text-on-surface-variant">
                  <span>Showing 1-{filteredDisputes.length} of {disputeList.length} disputes</span>
                  <div className="flex gap-2">
                    <button className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors cursor-pointer">
                      <ChevronRight size={16} className="rotate-180" />
                    </button>
                    <button className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors cursor-pointer">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <DisputeRightPanel
              cardBlocked={cardBlocked}
              onBlockCardClick={() => setIsBlockCardModalOpen(true)}
              expandedFaq={expandedFaq}
              onSelectFaq={(q) => {
                setSelectedHelpQuestion(q);
                setIsSupportOpen(true);
              }}
              faqs={faqs}
            />
          </div>
        </main>

        <RaiseDisputeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleRaiseDispute}
          txnId={txnId}
          setTxnId={setTxnId}
          reason={reason}
          setReason={setReason}
          isSubmitting={isSubmitting}
          successMsg={successMsg}
        />

        <BlockCardModal
          isOpen={isBlockCardModalOpen}
          onClose={() => setIsBlockCardModalOpen(false)}
          onConfirm={() => {
            setCardBlocked(true);
            setIsBlockCardModalOpen(false);
          }}
        />

        <DisputeDetailsModal
          isOpen={isDetailsModalOpen}
          dispute={selectedDispute}
          onClose={() => setIsDetailsModalOpen(false)}
        />

        <DisputeTypeFilterModal
          isOpen={isTypeModalOpen}
          onClose={() => setIsTypeModalOpen(false)}
          selectedVal={selectedType}
          onSelect={(val) => setSelectedType(val)}
        />

        <DisputeDateFilterModal
          isOpen={isDateModalOpen}
          onClose={() => setIsDateModalOpen(false)}
          selectedVal={selectedDateRange}
          onSelect={(val) => setSelectedDateRange(val)}
        />

        <SupportChatModal
          isOpen={isSupportOpen}
          onClose={() => setIsSupportOpen(false)}
          initialQuestion={selectedHelpQuestion}
          contextPage="Disputes & Claims Page"
        />
      </div>
    </div>
  );
}
