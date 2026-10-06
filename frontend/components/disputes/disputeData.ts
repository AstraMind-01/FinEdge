import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";

export const initialDisputes = [
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

export const statusConfig: Record<string, { color: string; bg: string; dot?: string; icon: React.ReactNode }> = {
  "Open": {
    color: "text-primary",
    bg: "bg-primary/10",
    dot: "bg-primary",
    icon: React.createElement("span", { className: "w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block mr-1" }),
  },
  "Under Investigation": {
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    icon: React.createElement("span", { className: "material-symbols-outlined text-[14px] mr-0.5", style: { fontSize: '14px' } }, "sync"),
  },
  "Resolved": {
    color: "text-[#2DD4BF]",
    bg: "bg-[#2DD4BF]/10",
    icon: React.createElement(CheckCircle2, { size: 14, className: "mr-0.5" }),
  },
  "Rejected": {
    color: "text-error",
    bg: "bg-error/10",
    icon: React.createElement(XCircle, { size: 14, className: "mr-0.5" }),
  },
};

export const tabs = ["All Disputes", "Open (1)", "In Progress (2)", "Resolved (11)", "Rejected (0)"];

export const faqs = [
  {
    q: "How long does a dispute take?",
    a: "Most disputes are resolved within 7-10 business days. Complex merchant arbitrations can take up to 45 days.",
  },
  {
    q: "Will my money be refunded immediately?",
    a: "In cases of clear unauthorized debit, a provisional credit may be posted within 48 hours pending final investigation.",
  },
  {
    q: "What documents are required?",
    a: "Keep your transaction SMS, merchant receipts, cancellation emails, or communication logs handy to upload during review.",
  },
  {
    q: "Can I cancel a raised dispute?",
    a: "Yes, you can cancel any dispute that is in 'Open' status before investigation begins by contacting phone support.",
  },
];
