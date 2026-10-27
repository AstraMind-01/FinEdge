import { CreditCard, Smartphone, ShieldCheck } from "lucide-react";

export const CARD_CATEGORIES = [
  {
    type: "CREDIT",
    title: "Credit Card",
    desc: "Earn 5x rewards, lounge access & lifestyle perks",
    icon: CreditCard,
    color: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    variants: ["Signature Infinite", "Titanium Cashback", "Millennia Rewards"]
  },
  {
    type: "DEBIT",
    title: "Debit Card",
    desc: "Zero international markup & instant ATM access",
    icon: CreditCard,
    color: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    variants: ["Platinum Privilege", "Classic Rewards", "Business Debit"]
  },
  {
    type: "VIRTUAL",
    title: "Virtual Pass",
    desc: "Instantly generated for secure online shopping",
    icon: Smartphone,
    color: "text-teal-400 bg-teal-400/10 border-teal-400/20",
    variants: ["Cyber Instant Pass", "One-Time Burner", "Subscription Shield"]
  },
  {
    type: "FOREX",
    title: "Prepaid Forex",
    desc: "Multi-currency pass for international travel",
    icon: ShieldCheck,
    color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    variants: ["Global Rupee Pass", "INR World Pass", "Rupee Traveller"]
  }
];

export const CARD_THEMES = [
  { id: "purple-gold", name: "Signature Obsidian", bg: "bg-gradient-to-br from-[#1c1536] via-[#2a1b4e] to-[#0d0a1a]", border: "border-amber-500/40", badge: "Obsidian", colorCircle: "from-purple-600 to-amber-400" },
  { id: "gold", name: "Gold Elite Metallic", bg: "bg-gradient-to-br from-[#4a3b10] via-[#85671d] to-[#261e05]", border: "border-yellow-300/50", badge: "Gold", colorCircle: "from-yellow-400 to-amber-600" },
  { id: "teal-silver", name: "Cyber Neon Teal", bg: "bg-gradient-to-br from-[#0b2b28] via-[#124d47] to-[#041412]", border: "border-teal-400/40", badge: "Teal", colorCircle: "from-teal-400 to-cyan-600" },
  { id: "navy-gold", name: "Royal Sapphire", bg: "bg-gradient-to-br from-[#0f1c3f] via-[#1a2f66] to-[#070e20]", border: "border-indigo-400/40", badge: "Sapphire", colorCircle: "from-blue-600 to-indigo-400" },
  { id: "silver", name: "Titanium Minimal", bg: "bg-gradient-to-br from-[#27272a] via-[#3f3f46] to-[#18181b]", border: "border-zinc-300/30", badge: "Titanium", colorCircle: "from-zinc-400 to-slate-200" }
];
