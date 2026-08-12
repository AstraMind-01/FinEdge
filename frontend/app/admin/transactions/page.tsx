"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

// ---------- Data ----------
const summaryCards = [
  { label: "Total Txns Today", value: "3,84,192", trend: "+12% vs yesterday", trendUp: true, icon: "receipt_long", iconColor: "text-[#c6bfff]", iconBg: "bg-[#4331b4]/20", borderColor: "" },
  { label: "Total Volume", value: "₹ 142.8 Cr", trend: "+5% vs yesterday", trendUp: true, icon: "payments", iconColor: "text-[#57f1db]", iconBg: "bg-[#2dd4bf]/20", borderColor: "border-b-2 border-[#57f1db]" },
  { label: "Flagged/High-Risk", value: "842", trend: "Requires manual review", trendUp: null, icon: "warning", iconColor: "text-[#ffb4ab]", iconBg: "bg-[#93000a]/20", borderColor: "border-b-2 border-[#ffb4ab]", danger: true },
  { label: "Failed Txns", value: "1,205", trend: "Mostly network issues", trendUp: null, icon: "error", iconColor: "text-[#f0b429]", iconBg: "bg-[#f0b429]/20", borderColor: "border-b-2 border-[#f0b429]" },
  { label: "Avg Txn Value", value: "₹ 3,715", trend: "-2% vs yesterday", trendUp: false, icon: "analytics", iconColor: "text-[#ffd481]", iconBg: "bg-[#f0b429]/10", borderColor: "" },
];

type Transaction = {
  id: string;
  time: string;
  customerName: string;
  avatar: string;
  type: string;
  amount: string;
  fromAcc: string;
  toAcc: string;
  status: "Success" | "Pending" | "Failed" | "Flagged";
  risk: "Low" | "Medium" | "High";
  isNew?: boolean;
};

const initialTransactions: Transaction[] = [
  { id: "TX-9982", time: "10:42:15 AM", customerName: "Arjun Mehta", avatar: "AM", type: "Transfer", amount: "₹ 2,45,000", fromAcc: "...4452", toAcc: "...9910", status: "Success", risk: "Low" },
  { id: "TX-9981", time: "10:42:08 AM", customerName: "Rahul Sharma", avatar: "RS", type: "Withdrawal", amount: "₹ 15,00,000", fromAcc: "...8812", toAcc: "ATM-192", status: "Flagged", risk: "High" },
  { id: "TX-9980", time: "10:41:55 AM", customerName: "Priya Desai", avatar: "PD", type: "Card Payment", amount: "₹ 12,500", fromAcc: "...3310", toAcc: "Amazon.in", status: "Pending", risk: "Low" },
  { id: "TX-9979", time: "10:41:30 AM", customerName: "Tech Solutions", avatar: "TS", type: "Deposit", amount: "₹ 8,90,000", fromAcc: "NEFT", toAcc: "...5511", status: "Success", risk: "Low" },
  { id: "TX-9978", time: "10:41:12 AM", customerName: "Kiran Verma", avatar: "KV", type: "Transfer", amount: "₹ 45,000", fromAcc: "...1122", toAcc: "...3344", status: "Failed", risk: "Medium" },
  { id: "TX-9977", time: "10:40:45 AM", customerName: "Global Traders", avatar: "GT", type: "Loan Disburse", amount: "₹ 50,00,000", fromAcc: "Loan Acct", toAcc: "...7788", status: "Success", risk: "Medium" },
  { id: "TX-9976", time: "10:40:20 AM", customerName: "Unknown Entity", avatar: "UE", type: "Transfer", amount: "₹ 5,00,000", fromAcc: "...9999", toAcc: "CryptoEx", status: "Flagged", risk: "High" },
];

const flaggedQueue = [
  { id: "TX-9981", customer: "Rahul Sharma", details: "₹ 15,00,000 to ATM-192", reason: "Velocity check failed (3rd large ATM w/d today)", risk: "High" },
  { id: "TX-9976", customer: "Unknown Entity", details: "₹ 5,00,000 to CryptoEx", reason: "New device + unusual amount for account", risk: "High" },
  { id: "TX-9950", customer: "Neha Gupta", details: "₹ 2,00,000 to ...1122", reason: "Geolocation mismatch (IP in Russia)", risk: "High" },
  { id: "TX-9912", customer: "Amit Verma", details: "₹ 50,000 to Amazon", reason: "Multiple failed CVV attempts prior", risk: "Medium" },
];

const suspiciousPatterns = [
  { pattern: "5 txns > ₹1L from IP 192.168.x.x in 2 mins", severity: "High" },
  { pattern: "Unusual withdrawal pattern - Account #4521", severity: "High" },
  { pattern: "Multiple failed logins followed by large transfer", severity: "Medium" },
  { pattern: "Card skimming suspected at ATM #MM092", severity: "High" },
];

const navItems = [
  { icon: "dashboard",     label: "Dashboard Overview",    href: "/admin",             active: false },
  { icon: "group",         label: "User Management",       href: "/admin/users",       active: false },
  { icon: "receipt_long",  label: "Transaction Monitoring",href: "/admin/transactions",active: true },
  { icon: "report_problem",label: "Fraud Alerts",          href: "/admin/fraud-alerts",active: false },
  { icon: "verified_user", label: "KYC Approvals",         href: "/admin/kyc-approvals",active: false },
  { icon: "settings",      label: "System Settings",       href: "/admin/settings",    active: false },
  { icon: "bar_chart",     label: "Reports",               href: "/admin/reports",     active: false },
];

// ---------- Components ----------

function StatusBadge({ status }: { status: string }) {
  let bg = "", text = "", border = "";
  if (status === "Success") { bg = "bg-[#57f1db]/10"; text = "text-[#57f1db]"; border = "border-[#57f1db]/20"; }
  else if (status === "Failed") { bg = "bg-[#ffb4ab]/10"; text = "text-[#ffb4ab]"; border = "border-[#ffb4ab]/20"; }
  else if (status === "Flagged") { bg = "bg-[#ff8b7e]/10"; text = "text-[#ff8b7e]"; border = "border-[#ff8b7e]/20"; }
  else if (status === "Pending") { bg = "bg-[#f0b429]/10"; text = "text-[#f0b429]"; border = "border-[#f0b429]/20"; }

  return <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium border ${bg} ${text} ${border}`}>{status}</span>;
}

function RiskBadge({ risk }: { risk: string }) {
  let bg = "", text = "", border = "";
  if (risk === "Low") { bg = "bg-[#57f1db]/10"; text = "text-[#57f1db]"; border = "border-[#57f1db]/20"; }
  else if (risk === "Medium") { bg = "bg-[#f0b429]/10"; text = "text-[#f0b429]"; border = "border-[#f0b429]/20"; }
  else if (risk === "High") { bg = "bg-[#ffb4ab]/10"; text = "text-[#ffb4ab]"; border = "border-[#ffb4ab]/20"; }

  return <span className={`inline-flex px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold border ${bg} ${text} ${border}`}>{risk} RISK</span>;
}

function TxnIcon({ type }: { type: string }) {
  let icon = "sync_alt";
  if (type === "Withdrawal") icon = "money_off";
  if (type === "Deposit") icon = "account_balance_wallet";
  if (type === "Card Payment") icon = "credit_card";
  if (type === "Loan Disburse") icon = "real_estate_agent";
  return <span className="material-symbols-outlined text-[16px] text-[#9c8f7a]">{icon}</span>;
}

// ---------- Main Page ----------
export default function TransactionMonitoring() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [expandedTxn, setExpandedTxn] = useState<string | null>(null);
  const [detailTxn, setDetailTxn] = useState<Transaction | null>(null);

  // Simulate Live Feed
  useEffect(() => {
    const interval = setInterval(() => {
      setTransactions((prev) => {
        const newId = `TX-${9983 + Math.floor(Math.random() * 100)}`;
        const types = ["Transfer", "Card Payment", "Deposit"];
        const statuses: Transaction["status"][] = ["Success", "Success", "Success", "Pending", "Failed"];
        
        const newTxn: Transaction = {
          id: newId,
          time: new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute:'2-digit', second:'2-digit' }),
          customerName: "New User " + Math.floor(Math.random() * 99),
          avatar: "NU",
          type: types[Math.floor(Math.random() * types.length)],
          amount: `₹ ${Math.floor(Math.random() * 50000)}`,
          fromAcc: "...00" + Math.floor(Math.random() * 99),
          toAcc: "...99" + Math.floor(Math.random() * 99),
          status: statuses[Math.floor(Math.random() * statuses.length)],
          risk: "Low",
          isNew: true, // For animation
        };
        // Remove isNew flag after animation
        setTimeout(() => {
          setTransactions(t => t.map(x => x.id === newId ? { ...x, isNew: false } : x));
        }, 2000);
        return [newTxn, ...prev].slice(0, 50); // Keep max 50
      });
    }, 5000); // New txn every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex overflow-x-hidden antialiased" style={{ background: "#0d1322", color: "#dde2f8", fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=Geist:wght@500&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined { font-variation-settings: 'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; font-family: 'Material Symbols Outlined'; }
        .fill-icon { font-variation-settings: 'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24; }
        .glass-panel { background: rgba(47,52,69,0.4); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(156,143,122,0.1); }
        .glow-hover:hover { box-shadow: 0 0 15px rgba(240,180,41,0.1); }
        .headline-font { font-family: 'Hanken Grotesk', sans-serif; }
        .mono-font { font-family: 'Geist', monospace; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #504534; border-radius: 4px; }
        
        @keyframes slideDownFadeIn {
          from { opacity: 0; transform: translateY(-10px); background: rgba(87, 241, 219, 0.2); }
          to { opacity: 1; transform: translateY(0); background: transparent; }
        }
        .animate-new-row { animation: slideDownFadeIn 1.5s ease-out forwards; }
        @keyframes pulse-dot {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(87, 241, 219, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(87, 241, 219, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(87, 241, 219, 0); }
        }
        .live-dot { animation: pulse-dot 2s infinite; }
      `}</style>

      {/* ── Sidebar ── */}
      <aside className={`fixed left-0 top-0 h-screen z-40 flex flex-col py-4 px-6 border-r transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`} style={{ width: 280, background: "#0d1322", borderColor: "#2f3445" }}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#f0b429", color: "#412d00" }}>
            <span className="material-symbols-outlined fill-icon text-[18px]">account_balance</span>
          </div>
          <div>
            <h1 className="headline-font font-bold leading-none" style={{ color: "#ffd481", fontSize: 20 }}>FinEdge</h1>
            <p className="mono-font text-[10px] tracking-wider mt-0.5" style={{ color: "#d4c5ad" }}>Institutional Admin</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${item.active ? "font-bold border-r-4" : "hover:opacity-80"}`} style={item.active ? { color: "#ffd481", borderColor: "#f0b429", background: "#191f2f" } : { color: "#d4c5ad" }}>
                  <span className={`material-symbols-outlined text-[20px] ${item.active ? "fill-icon" : ""}`}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto pt-4">
          <button className="w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-colors hover:opacity-90" style={{ background: "#f0b429", color: "#412d00" }}>
            <span className="material-symbols-outlined text-[18px]">analytics</span> Generate Report
          </button>
          <ul className="mt-3 space-y-1 pt-3" style={{ borderTop: "1px solid #2f3445" }}>
            <li><Link href="/login" className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors hover:opacity-80" style={{ color: "#ffb4ab" }}><span className="material-symbols-outlined text-[18px]">logout</span> Logout</Link></li>
          </ul>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col" style={{ marginLeft: 0 }}>
        <div className="md:ml-[280px]">

          {/* Header */}
          <header className="fixed top-0 right-0 h-16 flex justify-between items-center px-8 z-30" style={{ width: "100%", background: "rgba(13,19,34,0.7)", backdropFilter: "blur(20px)", borderBottom: "1px solid #2f3445", left: 0 }}>
            <div className="flex items-center gap-4 md:ml-[280px]">
              <button className="md:hidden" onClick={() => setSidebarOpen(true)} style={{ color: "#ffd481" }}><span className="material-symbols-outlined">menu</span></button>
              <h2 className="headline-font font-bold hidden md:block" style={{ color: "#ffd481", fontSize: 18 }}>Admin Console</h2>
            </div>
            <div className="flex items-center gap-5 mr-0">
              <div className="relative hidden sm:block">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px]" style={{ color: "#9c8f7a" }}>search</span>
                <input type="text" placeholder="Search accounts, txns..." className="rounded-full py-1.5 pl-10 pr-4 text-sm outline-none transition-all" style={{ background: "#242a3a", border: "1px solid #2f3445", color: "#dde2f8", width: 240 }} />
              </div>
              <button className="relative" style={{ color: "#ffd481" }}><span className="material-symbols-outlined text-[22px]">notifications</span><span className="absolute top-0 right-0 w-2 h-2 rounded-full ring-2" style={{ background: "#ffb4ab", ringColor: "#0d1322" }} /></button>
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: "#f0b429", color: "#412d00" }}>PA</div>
                <div className="hidden sm:block text-right">
                  <p className="mono-font text-xs font-medium" style={{ color: "#dde2f8" }}>Priya Admin</p>
                  <p className="mono-font text-[10px]" style={{ color: "#d4c5ad" }}>Super Admin</p>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="mt-16 p-6 md:p-8 max-w-[1600px] mx-auto w-full">
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div>
                <h3 className="headline-font font-bold mb-1 flex items-center gap-3" style={{ color: "#ffffff", fontSize: 28 }}>
                  Transaction Monitoring
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border" style={{ background: "#003731", color: "#57f1db", borderColor: "#57f1db/30" }}>
                    <span className="w-2 h-2 rounded-full bg-[#57f1db] live-dot"></span> Live
                  </span>
                </h3>
                <p className="text-sm" style={{ color: "#9c8f7a" }}>Real-time oversight of platform-wide transactions</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[#242a3a]" style={{ border: "1px solid #504534", color: "#d4c5ad" }}>
                  <span className="material-symbols-outlined text-[18px]">download</span> Export Report
                </button>
              </div>
            </div>

            {/* Summary Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {summaryCards.map((card) => (
                <div key={card.label} className={`glass-panel p-5 rounded-xl flex flex-col justify-between glow-hover transition-all ${card.borderColor}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="mono-font text-[11px] uppercase tracking-wider font-medium" style={{ color: card.danger ? "#ffb4ab" : "#d4c5ad" }}>{card.label}</span>
                    <div className={`w-7 h-7 rounded flex items-center justify-center ${card.iconBg} ${card.iconColor}`}>
                      <span className="material-symbols-outlined text-[16px]">{card.icon}</span>
                    </div>
                  </div>
                  <div>
                    <div className="headline-font font-bold text-2xl mb-1" style={{ color: card.danger ? "#ffb4ab" : "#dde2f8" }}>{card.value}</div>
                    <div className="flex items-center gap-1 text-[10px]" style={{ color: card.trendUp === true ? "#57f1db" : card.trendUp === false ? "#ffb4ab" : "#9c8f7a" }}>
                      {card.trendUp !== null && <span className="material-symbols-outlined text-[12px]">{card.trendUp ? "trending_up" : "trending_down"}</span>}
                      {card.trend}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Filter & Search */}
            <div className="glass-panel p-4 rounded-xl mb-6 flex flex-col xl:flex-row xl:items-center gap-4 justify-between">
              <div className="flex flex-1 items-center gap-3 w-full max-w-md relative">
                <span className="material-symbols-outlined absolute left-3 text-[18px]" style={{ color: "#9c8f7a" }}>search</span>
                <input type="text" placeholder="Search by txn ID, customer, account..." className="w-full rounded-lg py-2 pl-10 pr-4 text-sm outline-none transition-all" style={{ background: "#191f2f", border: "1px solid #2f3445", color: "#dde2f8" }} />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <select className="rounded-lg py-2 px-3 text-sm outline-none cursor-pointer appearance-none pr-8 relative" style={{ background: "#191f2f", border: "1px solid #2f3445", color: "#d4c5ad" }}>
                  <option>Transaction Type</option><option>Transfer</option><option>Deposit</option><option>Withdrawal</option>
                </select>
                <select className="rounded-lg py-2 px-3 text-sm outline-none cursor-pointer appearance-none pr-8" style={{ background: "#191f2f", border: "1px solid #2f3445", color: "#d4c5ad" }}>
                  <option>Status</option><option>Success</option><option>Flagged</option><option>Failed</option>
                </select>
                <div className="h-6 w-px mx-1" style={{ background: "#2f3445" }}></div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors bg-[#ffb4ab]/10 text-[#ffb4ab]" style={{ borderColor: "#ffb4ab/20" }}>High Risk Only</button>
                  <button className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors hover:bg-[#242a3a]" style={{ borderColor: "#2f3445", color: "#9c8f7a" }}>Above ₹1L</button>
                </div>
              </div>
            </div>

            {/* Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* LEFT COLUMN (70%) */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                
                {/* Live Feed Table */}
                <div className="glass-panel rounded-xl flex flex-col h-[600px] overflow-hidden">
                  <div className="px-6 py-4 flex justify-between items-center" style={{ borderBottom: "1px solid #2f3445", background: "rgba(25,31,47,0.5)" }}>
                    <h4 className="headline-font font-semibold text-lg flex items-center gap-2" style={{ color: "#dde2f8" }}>
                      Live Feed
                    </h4>
                    <div className="flex items-center gap-2">
                      <button className="text-xs flex items-center gap-1 font-medium px-2 py-1 rounded" style={{ background: "#2f3445", color: "#d4c5ad" }}><span className="material-symbols-outlined text-[14px]">pause</span> Pause</button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                      <thead className="sticky top-0 z-10" style={{ background: "#191f2f" }}>
                        <tr>
                          {["Time", "Customer", "Txn Type", "Amount", "Status", "Risk", ""].map((h) => (
                            <th key={h} className={`px-4 py-3 mono-font text-[10px] uppercase tracking-wider font-medium ${h === "Amount" ? "text-right" : ""}`} style={{ color: "#9c8f7a" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((tx) => (
                          <React.Fragment key={tx.id}>
                            <tr 
                              className={`transition-colors cursor-pointer hover:bg-[#2f3445]/40 ${tx.isNew ? "animate-new-row" : ""}`}
                              style={{ borderBottom: "1px solid #2f3445", background: tx.status === "Flagged" ? "rgba(255,180,171,0.03)" : "transparent" }}
                              onClick={() => setExpandedTxn(expandedTxn === tx.id ? null : tx.id)}
                            >
                              <td className="px-4 py-3">
                                <div className="mono-font text-xs font-medium" style={{ color: "#dde2f8" }}>{tx.id}</div>
                                <div className="text-[10px] mt-0.5" style={{ color: "#9c8f7a" }}>{tx.time}</div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: "#33394a", color: "#ffd481" }}>{tx.avatar}</div>
                                  <span className="font-medium text-xs" style={{ color: "#dde2f8" }}>{tx.customerName}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1.5">
                                  <TxnIcon type={tx.type} />
                                  <span className="text-xs" style={{ color: "#d4c5ad" }}>{tx.type}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 mono-font text-sm font-semibold text-right" style={{ color: tx.status === "Flagged" || tx.status === "Failed" ? "#ffb4ab" : "#ffffff" }}>
                                {tx.amount}
                              </td>
                              <td className="px-4 py-3"><StatusBadge status={tx.status} /></td>
                              <td className="px-4 py-3"><RiskBadge risk={tx.risk} /></td>
                              <td className="px-4 py-3 text-right">
                                <button className="text-[#9c8f7a] hover:text-[#ffd481] transition-colors" onClick={(e) => { e.stopPropagation(); setDetailTxn(tx); }}>
                                  <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                                </button>
                              </td>
                            </tr>
                            {/* Inline Expansion */}
                            {expandedTxn === tx.id && (
                              <tr style={{ background: "rgba(13, 19, 34, 0.5)" }}>
                                <td colSpan={7} className="p-0 border-b border-[#2f3445]">
                                  <div className="p-4 flex gap-8 animate-in slide-in-from-top-2">
                                    <div className="space-y-1">
                                      <p className="mono-font text-[10px] text-[#9c8f7a] uppercase">Route</p>
                                      <p className="text-xs text-[#dde2f8] flex items-center gap-1">
                                        {tx.fromAcc} <span className="material-symbols-outlined text-[14px] text-[#504534]">arrow_forward</span> {tx.toAcc}
                                      </p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="mono-font text-[10px] text-[#9c8f7a] uppercase">Device / IP</p>
                                      <p className="text-xs text-[#dde2f8]">iPhone 14 Pro • 192.168.1.45</p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="mono-font text-[10px] text-[#9c8f7a] uppercase">Location</p>
                                      <p className="text-xs text-[#dde2f8]">Mumbai, IN</p>
                                    </div>
                                    <div className="ml-auto flex items-center gap-2">
                                      <button className="px-3 py-1.5 rounded text-xs font-medium border border-[#504534] text-[#d4c5ad] hover:bg-[#242a3a]">Add Note</button>
                                      <button className="px-3 py-1.5 rounded text-xs font-medium bg-[#f0b429] text-[#412d00] hover:opacity-90" onClick={() => setDetailTxn(tx)}>Full Details</button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Transaction Volume Chart */}
                <div className="glass-panel p-6 rounded-xl">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="headline-font font-semibold" style={{ color: "#dde2f8" }}>Transaction Volume</h4>
                    <div className="flex bg-[#191f2f] rounded-lg p-1 border" style={{ borderColor: "#2f3445" }}>
                      <button className="px-3 py-1 text-xs font-medium rounded shadow" style={{ background: "#2f3445", color: "#dde2f8" }}>Hourly</button>
                      <button className="px-3 py-1 text-xs font-medium rounded hover:bg-[#242a3a]" style={{ color: "#9c8f7a" }}>Daily</button>
                    </div>
                  </div>
                  <div className="h-48 w-full border border-dashed rounded-lg flex flex-col items-center justify-center opacity-70" style={{ borderColor: "#504534", background: "rgba(25,31,47,0.3)" }}>
                    {/* Placeholder for SVG Chart */}
                    <span className="material-symbols-outlined text-4xl mb-2" style={{ color: "#f0b429" }}>bar_chart</span>
                    <p className="text-xs" style={{ color: "#d4c5ad" }}>Volume chart visualization loading...</p>
                    <p className="text-[10px] mt-1" style={{ color: "#ffb4ab" }}>Includes markers for flagged spikes</p>
                  </div>
                </div>

                {/* Flagged Queue */}
                <div className="glass-panel rounded-xl overflow-hidden flex flex-col border-l-4" style={{ borderLeftColor: "#ffb4ab" }}>
                  <div className="px-6 py-4 flex justify-between items-center" style={{ borderBottom: "1px solid #2f3445", background: "rgba(25,31,47,0.5)" }}>
                    <h4 className="headline-font font-semibold text-lg flex items-center gap-2" style={{ color: "#ffb4ab" }}>
                      <span className="material-symbols-outlined">gavel</span> Flagged Transactions Queue
                    </h4>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#93000a]/30 text-[#ffb4ab] border border-[#ffb4ab]/20">{flaggedQueue.length} Pending</span>
                  </div>
                  <div className="p-4 space-y-3">
                    {flaggedQueue.map((item) => (
                      <div key={item.id} className="p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4" style={{ background: "#191f2f", border: "1px solid rgba(255,180,171,0.15)" }}>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <RiskBadge risk={item.risk} />
                            <span className="mono-font text-xs font-bold" style={{ color: "#dde2f8" }}>{item.id}</span>
                            <span className="text-xs font-medium" style={{ color: "#d4c5ad" }}>• {item.customer}</span>
                          </div>
                          <p className="text-sm font-semibold" style={{ color: "#ffffff" }}>{item.details}</p>
                          <p className="text-xs mt-1 flex items-start gap-1" style={{ color: "#ffb4ab" }}>
                            <span className="material-symbols-outlined text-[14px]">error</span> {item.reason}
                          </p>
                        </div>
                        <div className="flex sm:flex-col gap-2">
                          <button className="px-3 py-1.5 rounded text-xs font-bold bg-[#93000a]/20 text-[#ffb4ab] border border-[#ffb4ab]/30 hover:bg-[#93000a]/40 w-full text-center">Block & Escalate</button>
                          <button className="px-3 py-1.5 rounded text-xs font-medium border border-[#504534] text-[#d4c5ad] hover:bg-[#242a3a] w-full text-center" onClick={() => setDetailTxn(initialTransactions[0])}>Investigate</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN (30%) */}
              <div className="flex flex-col gap-6">
                
                {/* Risk Distribution */}
                <div className="glass-panel p-6 rounded-xl">
                  <h4 className="headline-font font-semibold mb-4" style={{ color: "#dde2f8" }}>Risk Distribution</h4>
                  <div className="flex items-center gap-6">
                    {/* Fake Donut Chart */}
                    <div className="relative w-24 h-24 rounded-full flex items-center justify-center" style={{ background: "conic-gradient(#ffb4ab 0 10%, #f0b429 10% 25%, #57f1db 25% 100%)" }}>
                      <div className="w-16 h-16 rounded-full" style={{ background: "#151b2b" }}></div>
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex justify-between text-xs"><span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#57f1db]"></div>Low</span><span className="font-mono text-[#dde2f8]">75%</span></div>
                      <div className="flex justify-between text-xs"><span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#f0b429]"></div>Medium</span><span className="font-mono text-[#dde2f8]">15%</span></div>
                      <div className="flex justify-between text-xs"><span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#ffb4ab]"></div>High</span><span className="font-mono text-[#dde2f8]">10%</span></div>
                    </div>
                  </div>
                </div>

                {/* Top Transaction Types */}
                <div className="glass-panel p-6 rounded-xl">
                  <h4 className="headline-font font-semibold mb-4" style={{ color: "#dde2f8" }}>Top Transaction Types</h4>
                  <div className="space-y-4">
                    {[
                      { type: "Transfers", pct: 45, val: "₹ 64.2 Cr" },
                      { type: "Card Payments", pct: 30, val: "₹ 42.8 Cr" },
                      { type: "Bill Payments", pct: 15, val: "₹ 21.4 Cr" },
                      { type: "Withdrawals", pct: 10, val: "₹ 14.4 Cr" }
                    ].map(item => (
                      <div key={item.type}>
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{ color: "#d4c5ad" }}>{item.type}</span>
                          <span className="mono-font font-medium" style={{ color: "#dde2f8" }}>{item.val}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "#2f3445" }}>
                          <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: "#f0b429" }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suspicious Patterns Alert */}
                <div className="glass-panel p-6 rounded-xl border-l-2" style={{ borderLeftColor: "#ffb4ab" }}>
                  <h4 className="headline-font font-semibold mb-3 flex items-center gap-2" style={{ color: "#ffb4ab" }}>
                    <span className="material-symbols-outlined text-[18px]">policy</span> Suspicious Patterns
                  </h4>
                  <ul className="space-y-3">
                    {suspiciousPatterns.map((pat, i) => (
                      <li key={i} className="flex gap-2 text-xs p-2 rounded" style={{ background: "rgba(36,42,58,0.3)" }}>
                        <span className="material-symbols-outlined text-[16px] mt-0.5" style={{ color: pat.severity === "High" ? "#ffb4ab" : "#f0b429" }}>radar</span>
                        <div>
                          <p style={{ color: "#dde2f8" }}>{pat.pattern}</p>
                          <button className="text-[10px] underline mt-1" style={{ color: "#ffd481" }}>Investigate Cluster</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Geographic Heatmap Placeholder */}
                <div className="glass-panel p-6 rounded-xl flex flex-col">
                  <h4 className="headline-font font-semibold mb-3" style={{ color: "#dde2f8" }}>Geographic Heatmap</h4>
                  <div className="flex-1 rounded-lg border border-dashed flex flex-col items-center justify-center p-6 text-center opacity-70" style={{ borderColor: "#504534", background: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxwb2x5Z29uIHBvaW50cz0iMCwwIDEwMCwxMDAiIGZpbGw9IiMzMzM5NGEiLz48L3N2Zz4=')" }}>
                    <span className="material-symbols-outlined text-3xl mb-2" style={{ color: "#9c8f7a" }}>map</span>
                    <p className="text-xs text-[#d4c5ad]">Map view loading...</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="glass-panel p-6 rounded-xl">
                  <h4 className="headline-font font-semibold mb-3" style={{ color: "#dde2f8" }}>Quick Actions</h4>
                  <div className="space-y-2">
                    <button className="w-full py-2 px-4 rounded-lg text-sm font-medium border flex items-center justify-between group transition-colors hover:bg-[#242a3a]" style={{ borderColor: "#504534", color: "#d4c5ad" }}>
                      Freeze Suspicious Account <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                    <button className="w-full py-2 px-4 rounded-lg text-sm font-medium border flex items-center justify-between group transition-colors hover:bg-[#242a3a]" style={{ borderColor: "#504534", color: "#d4c5ad" }}>
                      Generate Fraud Report <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                    <button className="w-full py-2 px-4 rounded-lg text-sm font-medium border flex items-center justify-between group transition-colors hover:bg-[#242a3a]" style={{ borderColor: "#504534", color: "#d4c5ad" }}>
                      Set New Risk Rule <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>

      {/* ── Transaction Detail Modal/Drawer ── */}
      {detailTxn && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDetailTxn(null)} />
          <div className="relative w-full max-w-lg h-full flex flex-col shadow-2xl animate-in slide-in-from-right" style={{ background: "#111827", borderLeft: "1px solid #2f3445" }}>
            
            <div className="px-6 py-5 flex justify-between items-start" style={{ borderBottom: "1px solid #2f3445", background: "#191f2f" }}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="headline-font font-bold text-xl" style={{ color: "#ffffff" }}>{detailTxn.id}</h3>
                  <StatusBadge status={detailTxn.status} />
                  <RiskBadge risk={detailTxn.risk} />
                </div>
                <p className="text-xs" style={{ color: "#9c8f7a" }}>{detailTxn.time} • {detailTxn.type}</p>
              </div>
              <button onClick={() => setDetailTxn(null)} className="text-[#9c8f7a] hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Main Amount */}
              <div className="text-center py-6 rounded-xl border border-dashed" style={{ borderColor: "#504534", background: "rgba(25,31,47,0.3)" }}>
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#9c8f7a" }}>Transaction Amount</p>
                <h2 className="mono-font text-4xl font-bold" style={{ color: detailTxn.status === "Flagged" ? "#ffb4ab" : "#dde2f8" }}>{detailTxn.amount}</h2>
              </div>

              {/* Path */}
              <div className="space-y-3">
                <h4 className="mono-font text-[11px] uppercase tracking-wider font-semibold" style={{ color: "#9c8f7a" }}>Transaction Path</h4>
                <div className="glass-panel p-4 rounded-lg flex items-center justify-between">
                  <div className="text-center w-1/3">
                    <div className="w-10 h-10 mx-auto rounded-full mb-2 flex items-center justify-center text-sm font-bold" style={{ background: "#33394a", color: "#ffd481" }}>{detailTxn.avatar}</div>
                    <p className="text-sm font-medium" style={{ color: "#dde2f8" }}>{detailTxn.customerName}</p>
                    <p className="mono-font text-xs" style={{ color: "#d4c5ad" }}>{detailTxn.fromAcc}</p>
                  </div>
                  <div className="w-1/3 flex flex-col items-center text-[#9c8f7a]">
                    <span className="material-symbols-outlined text-[24px]">trending_flat</span>
                    <span className="text-[10px] mt-1">IMPS Transfer</span>
                  </div>
                  <div className="text-center w-1/3">
                    <div className="w-10 h-10 mx-auto rounded-full mb-2 flex items-center justify-center" style={{ background: "#242a3a", color: "#d4c5ad" }}><span className="material-symbols-outlined">account_balance</span></div>
                    <p className="text-sm font-medium" style={{ color: "#dde2f8" }}>Recipient</p>
                    <p className="mono-font text-xs" style={{ color: "#d4c5ad" }}>{detailTxn.toAcc}</p>
                  </div>
                </div>
              </div>

              {/* Risk Analysis */}
              <div className="space-y-3">
                <h4 className="mono-font text-[11px] uppercase tracking-wider font-semibold" style={{ color: "#9c8f7a" }}>Risk Analysis</h4>
                <div className="glass-panel p-4 rounded-lg space-y-3 border-l-2" style={{ borderLeftColor: detailTxn.risk === "High" ? "#ffb4ab" : detailTxn.risk === "Medium" ? "#f0b429" : "#57f1db" }}>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "#9c8f7a" }}>Device/Browser</span>
                    <span style={{ color: "#dde2f8" }}>iPhone 14 Pro / Safari Mobile</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "#9c8f7a" }}>IP Address</span>
                    <span style={{ color: detailTxn.risk === "High" ? "#ffb4ab" : "#dde2f8" }}>192.168.1.45 (Russia - Anomaly)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "#9c8f7a" }}>Velocity</span>
                    <span style={{ color: "#f0b429" }}>3 txns in 5 mins</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Action Footer */}
            <div className="p-6 flex gap-3" style={{ borderTop: "1px solid #2f3445", background: "#191f2f" }}>
              <button className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-[#93000a]/20 text-[#ffb4ab] border border-[#ffb4ab]/30 hover:bg-[#93000a]/40 transition-colors">
                Block Account
              </button>
              <button className="flex-1 py-2.5 rounded-lg text-sm font-bold shadow-lg transition-colors hover:opacity-90" style={{ background: "#f0b429", color: "#412d00" }}>
                Approve Txn
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
