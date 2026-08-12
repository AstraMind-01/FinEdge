"use client";

import React, { useState } from "react";
import Link from "next/link";

// ---------- Data ----------
const summaryCards = [
  { label: "Active Alerts", value: "142", trend: "Requires attention", trendUp: null, icon: "warning", iconColor: "text-[#ffb4ab]", iconBg: "bg-[#93000a]/20", borderColor: "border-b-2 border-[#ffb4ab]", danger: true },
  { label: "Critical Severity", value: "18", trend: "Immediate action required", trendUp: null, icon: "gavel", iconColor: "text-[#ff8b7e]", iconBg: "bg-[#ff8b7e]/20", borderColor: "border-b-2 border-[#ff8b7e]", critical: true },
  { label: "Under Invest.", value: "45", trend: "+12 vs yesterday", trendUp: true, icon: "find_in_page", iconColor: "text-[#f0b429]", iconBg: "bg-[#f0b429]/20", borderColor: "" },
  { label: "Resolved (Week)", value: "892", trend: "+5% completion rate", trendUp: true, icon: "check_circle", iconColor: "text-[#57f1db]", iconBg: "bg-[#2dd4bf]/20", borderColor: "" },
  { label: "False Positives", value: "24%", trend: "-2.1% this month", trendUp: false, icon: "rule", iconColor: "text-[#d4c5ad]", iconBg: "bg-[#33394a]", borderColor: "" },
];

type AlertSeverity = "Critical" | "High" | "Medium" | "Low";
type AlertStatus = "Open" | "Investigating" | "Resolved" | "Dismissed";

type FraudAlert = {
  id: string;
  type: string;
  customerName: string;
  avatar: string;
  accountInfo: string;
  amount?: string;
  severity: AlertSeverity;
  status: AlertStatus;
  time: string;
  assignedTo: string;
  reasoning: string;
  riskScore: number;
  factors: string[];
};

const mockAlerts: FraudAlert[] = [
  {
    id: "FA-88902",
    type: "Velocity Check Failed",
    customerName: "Rahul Sharma",
    avatar: "RS",
    accountInfo: "Acct: ...8812",
    amount: "₹ 15,00,000",
    severity: "Critical",
    status: "Open",
    time: "Detected 4 mins ago",
    assignedTo: "Unassigned",
    reasoning: "Multiple high-value transfers to new beneficiaries initiated within 3 minutes of login. Pattern matches known ATO (Account Takeover) profile.",
    riskScore: 94,
    factors: ["3 transfers > ₹5L in 3 mins", "New payee added 10 mins ago", "Login from untrusted device"],
  },
  {
    id: "FA-88895",
    type: "Card Not Present Fraud",
    customerName: "Unknown Entity",
    avatar: "UE",
    accountInfo: "Card: ...4421",
    amount: "₹ 85,000",
    severity: "High",
    status: "Investigating",
    time: "Detected 22 mins ago",
    assignedTo: "Priya Admin",
    reasoning: "International transaction on a card that was used domestically 2 hours ago. High probability of card cloning or compromised details.",
    riskScore: 82,
    factors: ["Impossible travel velocity (India to Russia)", "Card not present", "First time merchant"],
  },
  {
    id: "FA-88880",
    type: "Unusual Login Location",
    customerName: "Neha Gupta",
    avatar: "NG",
    accountInfo: "User ID: neha.g",
    severity: "Medium",
    status: "Resolved",
    time: "Detected 1 day ago",
    assignedTo: "Amit Security",
    reasoning: "Login from new device in Mumbai, 2 hours after login from Delhi. User confirmed travel.",
    riskScore: 65,
    factors: ["Geolocation mismatch", "New device fingerprint"],
  },
  {
    id: "FA-88842",
    type: "Minor Velocity Flag",
    customerName: "Arjun Mehta",
    avatar: "AM",
    accountInfo: "Acct: ...4452",
    amount: "₹ 2,500",
    severity: "Low",
    status: "Dismissed",
    time: "Detected 2 days ago",
    assignedTo: "System Auto",
    reasoning: "User made 5 small transactions within an hour. Evaluated as normal utility bill payment behavior. Auto-dismissed.",
    riskScore: 35,
    factors: ["High transaction frequency"],
  },
];

const flaggedAccounts = [
  { name: "Global Traders", flags: 12, id: "ACCT-992" },
  { name: "Vikas Kumar", flags: 8, id: "ACCT-881" },
  { name: "Tech Solutions", flags: 5, id: "ACCT-102" },
];

const detectionRules = [
  { name: "Velocity Check", triggers: 1245, acc: "92%" },
  { name: "Geo-fencing", triggers: 842, acc: "78%" },
  { name: "Device Fingerprinting", triggers: 412, acc: "88%" },
];

const escalatedCases = [
  { id: "CASE-442", status: "Under Review", investigator: "Ravi S." },
  { id: "CASE-440", status: "Action Required", investigator: "Neha T." },
];

const navItems = [
  { icon: "dashboard",     label: "Dashboard Overview",    href: "/admin",             active: false },
  { icon: "group",         label: "User Management",       href: "/admin/users",       active: false },
  { icon: "receipt_long",  label: "Transaction Monitoring",href: "/admin/transactions",active: false },
  { icon: "report_problem",label: "Fraud Alerts",          href: "/admin/fraud-alerts",active: true },
  { icon: "verified_user", label: "KYC Approvals",         href: "/admin/kyc-approvals",active: false },
  { icon: "settings",      label: "System Settings",       href: "/admin/settings",    active: false },
  { icon: "bar_chart",     label: "Reports",               href: "/admin/reports",     active: false },
];

// ---------- Components ----------

function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  let bg = "", text = "", border = "";
  if (severity === "Critical") { bg = "bg-[#ff8b7e]/10"; text = "text-[#ff8b7e]"; border = "border-[#ff8b7e]/30"; }
  else if (severity === "High") { bg = "bg-[#ffb4ab]/10"; text = "text-[#ffb4ab]"; border = "border-[#ffb4ab]/30"; }
  else if (severity === "Medium") { bg = "bg-[#f0b429]/10"; text = "text-[#f0b429]"; border = "border-[#f0b429]/30"; }
  else if (severity === "Low") { bg = "bg-[#c6bfff]/10"; text = "text-[#c6bfff]"; border = "border-[#c6bfff]/30"; }

  return <span className={`inline-flex px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold border ${bg} ${text} ${border}`}>{severity}</span>;
}

function StatusBadge({ status }: { status: AlertStatus }) {
  let bg = "", text = "", border = "";
  if (status === "Open") { bg = "bg-[#ff8b7e]/10"; text = "text-[#ff8b7e]"; border = "border-[#ff8b7e]/20"; }
  else if (status === "Investigating") { bg = "bg-[#f0b429]/10"; text = "text-[#f0b429]"; border = "border-[#f0b429]/20"; }
  else if (status === "Resolved") { bg = "bg-[#57f1db]/10"; text = "text-[#57f1db]"; border = "border-[#57f1db]/20"; }
  else if (status === "Dismissed") { bg = "bg-[#d4c5ad]/10"; text = "text-[#d4c5ad]"; border = "border-[#d4c5ad]/20"; }

  return <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium border ${bg} ${text} ${border}`}>{status}</span>;
}

function SeverityIcon({ severity, pulsing }: { severity: AlertSeverity, pulsing?: boolean }) {
  let bg = "", text = "";
  if (severity === "Critical") { bg = "bg-[#93000a]"; text = "text-[#ff8b7e]"; }
  else if (severity === "High") { bg = "bg-[#93000a]/50"; text = "text-[#ffb4ab]"; }
  else if (severity === "Medium") { bg = "bg-[#f0b429]/20"; text = "text-[#f0b429]"; }
  else if (severity === "Low") { bg = "bg-[#c6bfff]/20"; text = "text-[#c6bfff]"; }

  return (
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg} ${text} ${pulsing ? 'animate-pulse shadow-[0_0_15px_rgba(255,139,126,0.4)] border border-[#ff8b7e]' : ''}`}>
      <span className="material-symbols-outlined text-[20px]">warning</span>
    </div>
  );
}

// ---------- Main Page ----------
export default function FraudAlerts() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [detailAlert, setDetailAlert] = useState<FraudAlert | null>(null);

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
        
        @keyframes pulse-dot {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 139, 126, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(255, 139, 126, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 139, 126, 0); }
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
                  <p className="mono-font text-[10px]" style={{ color: "#d4c5ad" }}>Security Ops</p>
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
                  Fraud Alerts
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border" style={{ background: "#93000a", color: "#ff8b7e", borderColor: "#ff8b7e/30" }}>
                    <span className="w-2 h-2 rounded-full bg-[#ff8b7e] live-dot"></span> Live Monitoring
                  </span>
                </h3>
                <p className="text-sm" style={{ color: "#9c8f7a" }}>Detect, investigate, and act on suspicious activity</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[#242a3a]" style={{ border: "1px solid #504534", color: "#d4c5ad" }}>
                  <span className="material-symbols-outlined text-[18px]">settings</span> Configure Alert Rules
                </button>
              </div>
            </div>

            {/* Summary Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {summaryCards.map((card) => (
                <div key={card.label} className={`glass-panel p-5 rounded-xl flex flex-col justify-between glow-hover transition-all ${card.borderColor}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="mono-font text-[11px] uppercase tracking-wider font-medium" style={{ color: card.critical ? "#ff8b7e" : card.danger ? "#ffb4ab" : "#d4c5ad" }}>{card.label}</span>
                    <div className={`w-7 h-7 rounded flex items-center justify-center ${card.iconBg} ${card.iconColor}`}>
                      <span className="material-symbols-outlined text-[16px]">{card.icon}</span>
                    </div>
                  </div>
                  <div>
                    <div className="headline-font font-bold text-2xl mb-1" style={{ color: card.critical ? "#ff8b7e" : card.danger ? "#ffb4ab" : "#dde2f8" }}>{card.value}</div>
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
                <input type="text" placeholder="Search by alert ID, customer name..." className="w-full rounded-lg py-2 pl-10 pr-4 text-sm outline-none transition-all" style={{ background: "#191f2f", border: "1px solid #2f3445", color: "#dde2f8" }} />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <select className="rounded-lg py-2 px-3 text-sm outline-none cursor-pointer appearance-none pr-8 relative" style={{ background: "#191f2f", border: "1px solid #2f3445", color: "#d4c5ad" }}>
                  <option>Severity</option><option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
                </select>
                <select className="rounded-lg py-2 px-3 text-sm outline-none cursor-pointer appearance-none pr-8 relative" style={{ background: "#191f2f", border: "1px solid #2f3445", color: "#d4c5ad" }}>
                  <option>Alert Type</option><option>Unusual Login</option><option>Velocity Check Failed</option>
                </select>
                <select className="rounded-lg py-2 px-3 text-sm outline-none cursor-pointer appearance-none pr-8" style={{ background: "#191f2f", border: "1px solid #2f3445", color: "#d4c5ad" }}>
                  <option>Status</option><option>Open</option><option>Investigating</option><option>Resolved</option>
                </select>
                <div className="h-6 w-px mx-1" style={{ background: "#2f3445" }}></div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors bg-[#ff8b7e]/10 text-[#ff8b7e]" style={{ borderColor: "#ff8b7e/20" }}>Critical Only</button>
                  <button className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors hover:bg-[#242a3a]" style={{ borderColor: "#2f3445", color: "#9c8f7a" }}>My Assigned Cases</button>
                </div>
              </div>
            </div>

            {/* Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* LEFT COLUMN (70%) */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                
                {/* Active Fraud Alerts */}
                <div className="glass-panel rounded-xl flex flex-col h-[700px]">
                  <div className="px-6 py-4 flex justify-between items-center" style={{ borderBottom: "1px solid #2f3445", background: "rgba(25,31,47,0.5)" }}>
                    <h4 className="headline-font font-semibold text-lg flex items-center gap-2" style={{ color: "#dde2f8" }}>
                      Active Fraud Alerts
                    </h4>
                    <span className="text-xs text-[#9c8f7a]">Sorted by Severity</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {mockAlerts.map((alert) => (
                      <div key={alert.id} className="rounded-xl overflow-hidden border transition-all" style={{ background: "#151b2b", borderColor: alert.severity === "Critical" ? "#ff8b7e" : alert.severity === "High" ? "rgba(255,180,171,0.3)" : "#2f3445" }}>
                        
                        {/* Main Card Header */}
                        <div className="p-4 flex gap-4">
                          <SeverityIcon severity={alert.severity} pulsing={alert.severity === "Critical" && alert.status === "Open"} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="mono-font text-xs font-bold" style={{ color: "#dde2f8" }}>{alert.id}</span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#33394a] text-[#d4c5ad]">{alert.type}</span>
                                <SeverityBadge severity={alert.severity} />
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs" style={{ color: "#9c8f7a" }}>{alert.time}</span>
                                <StatusBadge status={alert.status} />
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: "#242a3a", color: "#ffd481" }}>{alert.avatar}</div>
                                <div>
                                  <p className="text-sm font-semibold" style={{ color: "#ffffff" }}>{alert.customerName}</p>
                                  <p className="text-xs" style={{ color: "#9c8f7a" }}>{alert.accountInfo} {alert.amount && <span className="ml-2 font-medium" style={{ color: alert.severity === "Critical" ? "#ff8b7e" : "#dde2f8" }}>{alert.amount}</span>}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button className="px-3 py-1.5 rounded text-xs font-medium border border-[#504534] text-[#d4c5ad] hover:bg-[#242a3a]" onClick={() => setDetailAlert(alert)}>Investigate</button>
                                {alert.severity === "Critical" && (
                                  <button className="px-3 py-1.5 rounded text-xs font-bold bg-[#93000a] text-[#ff8b7e] hover:bg-[#b3000c]">Freeze Account</button>
                                )}
                                <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#242a3a] text-[#9c8f7a]" onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}>
                                  <span className="material-symbols-outlined text-[20px]">{expandedAlert === alert.id ? "expand_less" : "expand_more"}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Expandable Content */}
                        {expandedAlert === alert.id && (
                          <div className="p-4 border-t animate-in slide-in-from-top-2" style={{ borderTopColor: "#2f3445", background: "rgba(36,42,58,0.3)" }}>
                            <div className="flex gap-6">
                              <div className="flex-1 space-y-3">
                                <div>
                                  <p className="mono-font text-[10px] text-[#9c8f7a] uppercase mb-1">Reasoning</p>
                                  <p className="text-xs text-[#dde2f8]">{alert.reasoning}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div>
                                    <p className="mono-font text-[10px] text-[#9c8f7a] uppercase mb-1">Assigned To</p>
                                    <p className="text-xs text-[#dde2f8] flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">person</span> {alert.assignedTo}</p>
                                  </div>
                                  <div>
                                    <p className="mono-font text-[10px] text-[#9c8f7a] uppercase mb-1">Action</p>
                                    <button className="text-xs text-[#ffd481] underline">Re-assign</button>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="w-1/3 bg-[#0d1322] rounded-lg p-3 border border-[#2f3445]">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="mono-font text-[10px] text-[#9c8f7a] uppercase">Risk Score</span>
                                  <span className="text-lg font-bold" style={{ color: alert.riskScore > 80 ? "#ff8b7e" : alert.riskScore > 50 ? "#f0b429" : "#57f1db" }}>{alert.riskScore}</span>
                                </div>
                                <ul className="space-y-1">
                                  {alert.factors.map((f, i) => (
                                    <li key={i} className="text-[10px] flex items-start gap-1" style={{ color: "#d4c5ad" }}>
                                      <span className="text-[#ffb4ab] mt-0.5">•</span> {f}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: "1px solid #2f3445", background: "rgba(36,42,58,0.5)" }}>
                    <span className="text-xs" style={{ color: "#9c8f7a" }}>Showing 1-4 of 142 alerts</span>
                    <div className="flex gap-1">
                      <button className="w-7 h-7 rounded border flex items-center justify-center transition-colors hover:bg-[#33394a]" style={{ borderColor: "#2f3445", color: "#d4c5ad" }}><span className="material-symbols-outlined text-[16px]">chevron_left</span></button>
                      <button className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold" style={{ background: "#f0b429", color: "#412d00" }}>1</button>
                      <button className="w-7 h-7 rounded flex items-center justify-center text-xs hover:bg-[#33394a]" style={{ color: "#d4c5ad" }}>2</button>
                      <button className="w-7 h-7 rounded border flex items-center justify-center transition-colors hover:bg-[#33394a]" style={{ borderColor: "#2f3445", color: "#d4c5ad" }}><span className="material-symbols-outlined text-[16px]">chevron_right</span></button>
                    </div>
                  </div>
                </div>

                {/* Fraud Pattern Trends */}
                <div className="glass-panel p-6 rounded-xl">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="headline-font font-semibold" style={{ color: "#dde2f8" }}>Fraud Pattern Trends</h4>
                    <div className="flex bg-[#191f2f] rounded-lg p-1 border" style={{ borderColor: "#2f3445" }}>
                      <button className="px-3 py-1 text-xs font-medium rounded hover:bg-[#242a3a]" style={{ color: "#9c8f7a" }}>Daily</button>
                      <button className="px-3 py-1 text-xs font-medium rounded shadow" style={{ background: "#2f3445", color: "#dde2f8" }}>Weekly</button>
                    </div>
                  </div>
                  <div className="h-48 w-full border border-dashed rounded-lg flex flex-col items-center justify-center opacity-70 mb-4" style={{ borderColor: "#504534", background: "rgba(25,31,47,0.3)" }}>
                    <span className="material-symbols-outlined text-4xl mb-2" style={{ color: "#ffb4ab" }}>ssid_chart</span>
                    <p className="text-xs" style={{ color: "#d4c5ad" }}>Alert volume chart loading...</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {["Velocity Anomalies", "Geo-mismatch", "Device Change"].map(type => (
                      <div key={type}>
                        <div className="flex justify-between text-[10px] mb-1">
                          <span style={{ color: "#9c8f7a" }}>{type}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "#2f3445" }}>
                          <div className="h-full rounded-full" style={{ width: `${Math.random()*60+20}%`, background: "#ffb4ab" }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN (30%) */}
              <div className="flex flex-col gap-6">
                
                {/* Severity Breakdown */}
                <div className="glass-panel p-6 rounded-xl">
                  <h4 className="headline-font font-semibold mb-4" style={{ color: "#dde2f8" }}>Severity Breakdown</h4>
                  <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24 rounded-full flex items-center justify-center" style={{ background: "conic-gradient(#ff8b7e 0 10%, #ffb4ab 10% 40%, #f0b429 40% 70%, #c6bfff 70% 100%)" }}>
                      <div className="w-16 h-16 rounded-full" style={{ background: "#151b2b" }}></div>
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex justify-between text-xs"><span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#ff8b7e]"></div>Critical</span><span className="font-mono text-[#dde2f8]">10%</span></div>
                      <div className="flex justify-between text-xs"><span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#ffb4ab]"></div>High</span><span className="font-mono text-[#dde2f8]">30%</span></div>
                      <div className="flex justify-between text-xs"><span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#f0b429]"></div>Medium</span><span className="font-mono text-[#dde2f8]">30%</span></div>
                      <div className="flex justify-between text-xs"><span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#c6bfff]"></div>Low</span><span className="font-mono text-[#dde2f8]">30%</span></div>
                    </div>
                  </div>
                </div>

                {/* Top Flagged Accounts */}
                <div className="glass-panel p-6 rounded-xl border-l-2" style={{ borderLeftColor: "#ff8b7e" }}>
                  <h4 className="headline-font font-semibold mb-3 flex items-center gap-2" style={{ color: "#ff8b7e" }}>
                    Top Flagged Accounts
                  </h4>
                  <ul className="space-y-3">
                    {flaggedAccounts.map((acc, i) => (
                      <li key={i} className="flex justify-between items-center text-xs p-2 rounded" style={{ background: "rgba(36,42,58,0.3)" }}>
                        <div>
                          <p className="font-medium" style={{ color: "#dde2f8" }}>{acc.name}</p>
                          <p className="mono-font mt-0.5" style={{ color: "#9c8f7a" }}>{acc.id}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-0.5 rounded-full font-bold bg-[#93000a]/20 text-[#ffb4ab]">{acc.flags} flags</span>
                          <button className="text-[#ffd481] hover:underline">View</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Detection Rules Performance */}
                <div className="glass-panel p-6 rounded-xl">
                  <h4 className="headline-font font-semibold mb-3" style={{ color: "#dde2f8" }}>Rules Performance</h4>
                  <div className="space-y-3">
                    {detectionRules.map((rule, i) => (
                      <div key={i} className="text-xs">
                        <div className="flex justify-between mb-1">
                          <span style={{ color: "#dde2f8" }}>{rule.name}</span>
                          <span className="text-[#ffd481] underline cursor-pointer">Edit Rule</span>
                        </div>
                        <div className="flex gap-4 text-[10px]" style={{ color: "#9c8f7a" }}>
                          <span>Triggers: <strong className="text-[#d4c5ad]">{rule.triggers}</strong></span>
                          <span>Accuracy: <strong className="text-[#57f1db]">{rule.acc}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Escalated to Security Team */}
                <div className="glass-panel p-6 rounded-xl">
                  <h4 className="headline-font font-semibold mb-3" style={{ color: "#dde2f8" }}>Escalated Cases</h4>
                  <div className="space-y-3">
                    {escalatedCases.map((caseItem, i) => (
                      <div key={i} className="flex justify-between items-center p-2 rounded border border-[#2f3445]" style={{ background: "#191f2f" }}>
                        <div>
                          <p className="mono-font text-xs font-bold" style={{ color: "#ffb4ab" }}>{caseItem.id}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: "#9c8f7a" }}>Inv: {caseItem.investigator}</p>
                        </div>
                        <StatusBadge status="Investigating" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="glass-panel p-6 rounded-xl">
                  <h4 className="headline-font font-semibold mb-3" style={{ color: "#dde2f8" }}>Quick Actions</h4>
                  <div className="space-y-2">
                    <button className="w-full py-2 px-4 rounded-lg text-sm font-medium border border-[#93000a] text-[#ffb4ab] bg-[#93000a]/10 flex items-center justify-between group transition-colors hover:bg-[#93000a]/30">
                      Block Account <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                    <button className="w-full py-2 px-4 rounded-lg text-sm font-medium border flex items-center justify-between group transition-colors hover:bg-[#242a3a]" style={{ borderColor: "#504534", color: "#d4c5ad" }}>
                      Report to Regulator <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                    <button className="w-full py-2 px-4 rounded-lg text-sm font-medium border flex items-center justify-between group transition-colors hover:bg-[#242a3a]" style={{ borderColor: "#504534", color: "#d4c5ad" }}>
                      Create Custom Rule <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                    <button className="w-full py-2 px-4 rounded-lg text-sm font-medium border flex items-center justify-between group transition-colors hover:bg-[#242a3a]" style={{ borderColor: "#504534", color: "#d4c5ad" }}>
                      Bulk Dismiss FPs <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>

      {/* ── Investigation Detail Drawer ── */}
      {detailAlert && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDetailAlert(null)} />
          <div className="relative w-full max-w-2xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right" style={{ background: "#111827", borderLeft: "1px solid #2f3445" }}>
            
            <div className="px-8 py-6 flex justify-between items-start" style={{ borderBottom: "1px solid #2f3445", background: "#151b2b" }}>
              <div className="flex gap-4">
                <SeverityIcon severity={detailAlert.severity} />
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="headline-font font-bold text-xl" style={{ color: "#ffffff" }}>{detailAlert.id}</h3>
                    <SeverityBadge severity={detailAlert.severity} />
                    <StatusBadge status={detailAlert.status} />
                  </div>
                  <p className="text-sm" style={{ color: "#9c8f7a" }}>{detailAlert.type} • {detailAlert.time}</p>
                </div>
              </div>
              <button onClick={() => setDetailAlert(null)} className="text-[#9c8f7a] hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              
              <div className="flex gap-6">
                {/* Customer Snapshot */}
                <div className="flex-1 p-4 rounded-xl border border-[#2f3445] bg-[#191f2f] flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: "#242a3a", color: "#ffd481" }}>{detailAlert.avatar}</div>
                  <div>
                    <p className="text-lg font-bold text-[#dde2f8]">{detailAlert.customerName}</p>
                    <p className="mono-font text-xs text-[#9c8f7a]">{detailAlert.accountInfo}</p>
                  </div>
                </div>
                {/* Risk Score */}
                <div className="w-1/3 p-4 rounded-xl border border-[#2f3445] bg-[#191f2f] flex flex-col items-center justify-center">
                  <p className="text-xs text-[#9c8f7a] uppercase tracking-wider mb-1">Risk Score</p>
                  <p className="text-3xl font-bold" style={{ color: detailAlert.riskScore > 80 ? "#ff8b7e" : detailAlert.riskScore > 50 ? "#f0b429" : "#57f1db" }}>{detailAlert.riskScore}/100</p>
                </div>
              </div>

              {/* Reasoning */}
              <div className="space-y-3">
                <h4 className="mono-font text-[11px] uppercase tracking-wider font-semibold" style={{ color: "#9c8f7a" }}>Alert Reasoning</h4>
                <div className="p-4 rounded-lg border-l-4" style={{ background: "rgba(255,180,171,0.05)", borderLeftColor: "#ffb4ab" }}>
                  <p className="text-sm text-[#dde2f8] leading-relaxed">{detailAlert.reasoning}</p>
                </div>
              </div>

              {/* Investigation Timeline */}
              <div className="space-y-4">
                <h4 className="mono-font text-[11px] uppercase tracking-wider font-semibold" style={{ color: "#9c8f7a" }}>Suspicious Activity Timeline</h4>
                <div className="relative border-l-2 ml-3 space-y-6" style={{ borderColor: "#2f3445" }}>
                  <div className="relative pl-6">
                    <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#0d1322] border-2 border-[#504534]"></span>
                    <p className="text-xs text-[#9c8f7a]">Today, 09:15 AM</p>
                    <p className="text-sm text-[#dde2f8] mt-1">Normal login from Delhi (trusted device)</p>
                  </div>
                  <div className="relative pl-6">
                    <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#0d1322] border-2 border-[#ffb4ab]"></span>
                    <p className="text-xs text-[#ffb4ab]">Today, 11:30 AM</p>
                    <p className="text-sm font-medium text-[#ffffff] mt-1">Login from Mumbai (unknown device, Safari browser)</p>
                  </div>
                  <div className="relative pl-6">
                    <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#0d1322] border-2 border-[#ff8b7e] animate-pulse"></span>
                    <p className="text-xs text-[#ff8b7e]">Today, 11:32 AM</p>
                    <p className="text-sm font-bold text-[#ff8b7e] mt-1">3 new beneficiaries added</p>
                  </div>
                  <div className="relative pl-6">
                    <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#0d1322] border-2 border-[#ff8b7e]"></span>
                    <p className="text-xs text-[#ff8b7e]">Today, 11:33 AM</p>
                    <p className="text-sm font-bold text-[#ff8b7e] mt-1">Transfer of {detailAlert.amount || "₹ 5,00,000"} initiated</p>
                    <div className="mt-2 inline-flex px-2 py-1 bg-[#93000a]/20 text-[#ffb4ab] text-[10px] rounded border border-[#ffb4ab]/30">Auto-blocked by Velocity Rule</div>
                  </div>
                </div>
              </div>

              {/* Map/IP Visualization */}
              <div className="space-y-3">
                <h4 className="mono-font text-[11px] uppercase tracking-wider font-semibold" style={{ color: "#9c8f7a" }}>Device & Location Context</h4>
                <div className="h-40 w-full rounded-xl border border-[#2f3445] bg-[#191f2f] flex items-center justify-center opacity-80">
                  <span className="material-symbols-outlined text-4xl mb-2" style={{ color: "#504534" }}>public</span>
                  <p className="text-xs text-[#9c8f7a] ml-2">Map visualization showing Delhi ➔ Mumbai impossible travel</p>
                </div>
              </div>

            </div>

            {/* Action Footer */}
            <div className="p-6 flex flex-wrap gap-3" style={{ borderTop: "1px solid #2f3445", background: "#151b2b" }}>
              <button className="flex-1 py-3 px-4 rounded-lg text-sm font-bold bg-[#93000a] text-[#ff8b7e] hover:bg-[#b3000c] transition-colors shadow-lg">
                Confirm Fraud & Freeze
              </button>
              <button className="flex-1 py-3 px-4 rounded-lg text-sm font-bold border border-[#504534] bg-[#191f2f] text-[#d4c5ad] hover:bg-[#242a3a] transition-colors">
                Mark False Positive
              </button>
              <div className="w-full flex gap-3">
                <button className="flex-1 py-2 rounded-lg text-xs font-medium border border-[#2f3445] text-[#9c8f7a] hover:bg-[#242a3a]">Request OTP Verification</button>
                <button className="flex-1 py-2 rounded-lg text-xs font-medium border border-[#2f3445] text-[#9c8f7a] hover:bg-[#242a3a]">Escalate to Sec Team</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
