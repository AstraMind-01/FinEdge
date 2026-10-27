"use client";

import React, { useState } from "react";
import Link from "next/link";

// ---------- Data ----------
const kpiCards = [
  {
    label: "Total Users",
    value: "1,24,582",
    trend: "+2.4% this week",
    trendUp: true,
    icon: "group",
    iconColor: "text-[#c6bfff]",
    iconBg: "bg-[#4331b4]/20",
    borderColor: "",
  },
  {
    label: "Active Sessions",
    value: "3,841",
    trend: "Current real-time",
    trendUp: null,
    icon: "bolt",
    iconColor: "text-[#57f1db]",
    iconBg: "bg-[#2dd4bf]/20",
    borderColor: "",
  },
  {
    label: "Txns Today",
    value: "Rs 48.2 Cr",
    trend: "+14% vs yesterday",
    trendUp: true,
    icon: "payments",
    iconColor: "text-[#f0b429]",
    iconBg: "bg-[#f0b429]/20",
    borderColor: "border-b-2 border-[#f0b429]",
  },
  {
    label: "Fraud Alerts",
    value: "12",
    trend: "Requires immediate action",
    trendUp: false,
    icon: "warning",
    iconColor: "text-[#ffb4ab]",
    iconBg: "bg-[#93000a]/20",
    borderColor: "border-b-2 border-[#ffb4ab]",
    danger: true,
  },
];

const transactions = [
  { id: "#TX-9982A", customer: "Arjun Mehta",      amount: "₹ 2,45,000",  time: "10:42 AM", status: "Success",  flagged: false },
  { id: "#TX-9981F", customer: "Rahul Sharma",     amount: "₹ 15,00,000", time: "10:38 AM", status: "Flagged",  flagged: true  },
  { id: "#TX-9980C", customer: "Priya Desai",      amount: "₹ 12,500",    time: "10:15 AM", status: "Pending",  flagged: false },
  { id: "#TX-9979S", customer: "Tech Solutions Ltd",amount: "₹ 8,90,000",  time: "09:55 AM", status: "Success",  flagged: false },
  { id: "#TX-9978A", customer: "Kiran Verma",      amount: "₹ 45,000",    time: "09:30 AM", status: "Success",  flagged: false },
  { id: "#TX-9977P", customer: "Global Traders",   amount: "₹ 1,20,000",  time: "09:12 AM", status: "Pending",  flagged: false },
  { id: "#TX-9976F", customer: "Unknown Entity",   amount: "₹ 5,00,000",  time: "08:45 AM", status: "Flagged",  flagged: true  },
  { id: "#TX-9975S", customer: "Nita Ambani",      amount: "₹ 95,000",    time: "08:20 AM", status: "Success",  flagged: false },
];

const fraudAlerts = [
  {
    icon: "location_off",
    title: "Unusual Login Location",
    time: "2m ago",
    desc: "User 'rahul_99' logged in from IP 192.168.1.1 (Russia) - usually India.",
    actions: ["Review", "Lock Account"],
  },
  {
    icon: "speed",
    title: "High Velocity Txns",
    time: "15m ago",
    desc: "5 transactions > ₹1L in 3 mins on Acct ending #4452.",
    actions: ["Review", "Halt Txns"],
  },
  {
    icon: "credit_card_off",
    title: "Card Skimming Suspected",
    time: "1h ago",
    desc: "Multiple failed CVV attempts at ATM ID #MM092.",
    actions: ["Review"],
  },
];

const kycItems = [
  { name: "Vikram Singh",   sub: "Tier 2 Verification",   icon: "badge"  },
  { name: "Alpha Corp Ltd", sub: "Corporate Onboarding",   icon: "domain" },
  { name: "Neha Gupta",     sub: "Tier 1 Verification",    icon: "badge"  },
];

const navItems = [
  { icon: "dashboard",     label: "Dashboard Overview",    href: "/admin",             active: true  },
  { icon: "group",         label: "User Management",       href: "/admin/users",       active: false },
  { icon: "receipt_long",  label: "Transaction Monitoring",href: "/admin/transactions",active: false },
  { icon: "report_problem",label: "Fraud Alerts",          href: "/admin/fraud-alerts",active: false },
  { icon: "verified_user", label: "KYC Approvals",         href: "/admin/kyc-approvals",active: false },
  { icon: "settings",      label: "System Settings",       href: "/admin/settings",    active: false },
  { icon: "bar_chart",     label: "Reports",               href: "/admin/reports",     active: false },
];

// ---------- Status chip ----------
function StatusChip({ status, flagged }: { status: string; flagged: boolean }) {
  if (flagged)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-[#ffb4ab]/10 text-[#ffb4ab] border border-[#ffb4ab]/20">
        <span className="material-symbols-outlined text-[12px]">warning</span> Flagged
      </span>
    );
  if (status === "Pending")
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#f0b429]/10 text-[#f0b429] border border-[#f0b429]/20">
        Pending
      </span>
    );
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#57f1db]/10 text-[#57f1db] border border-[#57f1db]/20">
      Success
    </span>
  );
}

// ---------- Page ----------
export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className="min-h-screen flex overflow-x-hidden antialiased"
      style={{ background: "#0d1322", color: "#dde2f8", fontFamily: "Inter, sans-serif" }}
    >
      {/* Google Fonts + Material Symbols */}
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
      `}</style>

      {/* ── Sidebar ── */}
      <aside
        className={`fixed left-0 top-0 h-screen z-40 flex flex-col py-4 px-6 border-r transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        style={{ width: 280, background: "#0d1322", borderColor: "#2f3445" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#f0b429", color: "#412d00" }}>
            <span className="material-symbols-outlined fill-icon text-[18px]">account_balance</span>
          </div>
          <div>
            <h1 className="headline-font font-bold leading-none" style={{ color: "#ffd481", fontSize: 20 }}>FinEdge</h1>
            <p className="mono-font text-[10px] tracking-wider mt-0.5" style={{ color: "#d4c5ad" }}>Institutional Admin</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                    item.active
                      ? "font-bold border-r-4"
                      : "hover:opacity-80"
                  }`}
                  style={
                    item.active
                      ? { color: "#ffd481", borderColor: "#f0b429", background: "#191f2f" }
                      : { color: "#d4c5ad" }
                  }
                >
                  <span className={`material-symbols-outlined text-[20px] ${item.active ? "fill-icon" : ""}`}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom actions */}
        <div className="mt-auto pt-4">
          <button
            className="w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold transition-colors hover:opacity-90"
            style={{ background: "#f0b429", color: "#412d00" }}
          >
            <span className="material-symbols-outlined text-[18px]">analytics</span>
            Generate Report
          </button>
          <ul className="mt-3 space-y-1 pt-3" style={{ borderTop: "1px solid #2f3445" }}>
            <li>
              <a href="#" className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors hover:opacity-80" style={{ color: "#d4c5ad" }}>
                <span className="material-symbols-outlined text-[18px]">help</span> Support
              </a>
            </li>
            <li>
              <a href="/login" className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors hover:opacity-80" style={{ color: "#ffb4ab" }}>
                <span className="material-symbols-outlined text-[18px]">logout</span> Logout
              </a>
            </li>
          </ul>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col" style={{ marginLeft: 0 }}>
        <div className="md:ml-[280px]">

          {/* Header */}
          <header
            className="fixed top-0 right-0 h-16 flex justify-between items-center px-8 z-30"
            style={{
              width: "100%",
              background: "rgba(13,19,34,0.7)",
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid #2f3445",
              left: 0,
            }}
          >
            <div className="flex items-center gap-4 md:ml-[280px]">
              <button className="md:hidden" onClick={() => setSidebarOpen(true)} style={{ color: "#ffd481" }}>
                <span className="material-symbols-outlined">menu</span>
              </button>
              <h2 className="headline-font font-bold hidden md:block" style={{ color: "#ffd481", fontSize: 18 }}>Admin Console</h2>
            </div>
            <div className="flex items-center gap-5 mr-0">
              {/* Search */}
              <div className="relative hidden sm:block">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px]" style={{ color: "#9c8f7a" }}>search</span>
                <input
                  type="text"
                  placeholder="Search accounts, txns..."
                  className="rounded-full py-1.5 pl-10 pr-4 text-sm outline-none transition-all"
                  style={{ background: "#242a3a", border: "1px solid #2f3445", color: "#dde2f8", width: 240 }}
                />
              </div>
              {/* Notification */}
              <button className="relative" style={{ color: "#ffd481" }}>
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                <span className="absolute top-0 right-0 w-2 h-2 rounded-full ring-2" style={{ background: "#ffb4ab", boxShadow: "0 0 0 2px #0d1322" }} />
              </button>
              {/* Admin */}
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ background: "#f0b429", color: "#412d00" }}>
                  PA
                </div>
                <div className="hidden sm:block text-right">
                  <p className="mono-font text-xs font-medium" style={{ color: "#dde2f8" }}>Priya Admin</p>
                  <p className="mono-font text-[10px]" style={{ color: "#d4c5ad" }}>Super Admin</p>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="mt-16 p-6 md:p-8 max-w-[1440px] mx-auto w-full">
            {/* Page title */}
            <div className="mb-6">
              <h3 className="headline-font font-semibold mb-1" style={{ color: "#dde2f8", fontSize: 24 }}>Dashboard Overview</h3>
              <p className="text-sm" style={{ color: "#d4c5ad" }}>Real-time platform metrics and alerts.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {kpiCards.map((card) => (
                <div key={card.label} className={`glass-panel p-6 rounded-xl flex flex-col justify-between glow-hover transition-all ${card.borderColor}`}>
                  <div className="flex justify-between items-start mb-3">
                    <span className="mono-font text-xs uppercase tracking-wider" style={{ color: card.danger ? "#ffb4ab" : "#d4c5ad", fontWeight: card.danger ? 600 : 400 }}>
                      {card.label}
                    </span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${card.iconBg} ${card.iconColor}`}>
                      <span className="material-symbols-outlined text-[18px]">{card.icon}</span>
                    </div>
                  </div>
                  <div>
                    <div className="headline-font font-bold text-3xl mb-1" style={{ color: card.danger ? "#ffb4ab" : card.label === "Txns Today" ? "#f0b429" : "#dde2f8" }}>
                      {card.value}
                    </div>
                    {card.trendUp !== null ? (
                      <div className="flex items-center gap-1 text-xs" style={{ color: card.trendUp ? "#57f1db" : "#d4c5ad" }}>
                        {card.trendUp && <span className="material-symbols-outlined text-[14px]">trending_up</span>}
                        {card.trend}
                      </div>
                    ) : (
                      <div className="text-xs" style={{ color: "#d4c5ad" }}>{card.trend}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Recent Transactions (2 cols) */}
              <div className="lg:col-span-2 glass-panel rounded-xl overflow-hidden flex flex-col" style={{ height: 500 }}>
                <div className="px-6 py-4 flex justify-between items-center" style={{ borderBottom: "1px solid #2f3445", background: "rgba(25,31,47,0.5)" }}>
                  <h4 className="headline-font font-semibold" style={{ color: "#dde2f8", fontSize: 16 }}>Recent Transactions</h4>
                  <button className="text-xs flex items-center gap-1 transition-colors hover:opacity-80" style={{ color: "#ffd481" }}>
                    View All <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
                <div className="flex-1 overflow-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10" style={{ background: "#242a3a" }}>
                      <tr>
                        {["Txn ID", "Customer", "Amount", "Time", "Status"].map((h) => (
                          <th key={h} className={`px-6 py-3 mono-font text-xs uppercase tracking-wider font-medium ${h === "Amount" ? "text-right" : ""}`} style={{ color: "#9c8f7a" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr
                          key={tx.id}
                          className="transition-colors cursor-default group"
                          style={{
                            borderBottom: "1px solid #2f3445",
                            background: tx.flagged ? "rgba(255,180,171,0.03)" : "transparent",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(47,52,69,0.3)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = tx.flagged ? "rgba(255,180,171,0.03)" : "transparent")}
                        >
                          <td className="px-6 py-3 mono-font text-xs" style={{ color: "#9c8f7a" }}>{tx.id}</td>
                          <td className="px-6 py-3 text-sm" style={{ color: "#dde2f8" }}>{tx.customer}</td>
                          <td className={`px-6 py-3 mono-font text-xs text-right font-medium`} style={{ color: tx.flagged ? "#ffb4ab" : "#dde2f8" }}>{tx.amount}</td>
                          <td className="px-6 py-3 mono-font text-xs" style={{ color: "#9c8f7a" }}>{tx.time}</td>
                          <td className="px-6 py-3">
                            <StatusChip status={tx.status} flagged={tx.flagged} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right column */}
              <div className="flex flex-col gap-4">
                {/* Fraud Alerts */}
                <div className="glass-panel rounded-xl overflow-hidden flex flex-col flex-1" style={{ borderTop: "2px solid #ffb4ab" }}>
                  <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid #2f3445", background: "rgba(25,31,47,0.5)" }}>
                    <span className="material-symbols-outlined text-[18px]" style={{ color: "#ffb4ab" }}>gavel</span>
                    <h4 className="headline-font font-semibold text-sm" style={{ color: "#ffb4ab" }}>Action Required</h4>
                  </div>
                  <div className="p-4 flex-1 overflow-y-auto space-y-3">
                    {fraudAlerts.map((alert) => (
                      <div key={alert.title} className="p-3 rounded-lg flex gap-3 items-start" style={{ background: "rgba(36,42,58,0.5)", border: "1px solid rgba(255,180,171,0.2)" }}>
                        <span className="material-symbols-outlined text-[20px] mt-0.5" style={{ color: "#ffb4ab" }}>{alert.icon}</span>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h5 className="mono-font text-xs font-medium" style={{ color: "#dde2f8" }}>{alert.title}</h5>
                            <span className="text-[10px]" style={{ color: "#9c8f7a" }}>{alert.time}</span>
                          </div>
                          <p className="text-xs mt-0.5 leading-snug" style={{ color: "#d4c5ad" }}>{alert.desc}</p>
                          <div className="mt-2 flex gap-2">
                            {alert.actions.map((action, i) => (
                              <button
                                key={action}
                                className="px-2 py-1 rounded text-[10px] transition-colors hover:opacity-80"
                                style={
                                  i === 0
                                    ? { background: "#2f3445", color: "#dde2f8", border: "1px solid #504534" }
                                    : { background: "#93000a", color: "#ffdad6" }
                                }
                              >
                                {action}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* KYC Pending */}
                <div className="glass-panel rounded-xl overflow-hidden flex flex-col flex-1" style={{ borderTop: "2px solid #c6bfff" }}>
                  <div className="px-4 py-3 flex justify-between items-center" style={{ borderBottom: "1px solid #2f3445", background: "rgba(25,31,47,0.5)" }}>
                    <h4 className="headline-font font-semibold text-sm" style={{ color: "#dde2f8" }}>KYC Pending</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: "#4331b4", color: "#b7afff" }}>24 in queue</span>
                  </div>
                  <div className="p-4 flex-1 overflow-y-auto space-y-3">
                    {kycItems.map((item, idx) => (
                      <div key={item.name} className="flex items-center justify-between pb-3" style={idx < kycItems.length - 1 ? { borderBottom: "1px solid #2f3445" } : {}}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded flex items-center justify-center" style={{ background: "#33394a", color: "#d4c5ad" }}>
                            <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                          </div>
                          <div>
                            <p className="mono-font text-xs font-medium" style={{ color: "#dde2f8" }}>{item.name}</p>
                            <p className="text-[11px]" style={{ color: "#9c8f7a" }}>{item.sub}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            title="Reject"
                            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
                            style={{ background: "#2f3445", color: "#d4c5ad" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#93000a"; (e.currentTarget as HTMLButtonElement).style.color = "#ffb4ab"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#2f3445"; (e.currentTarget as HTMLButtonElement).style.color = "#d4c5ad"; }}
                          >
                            <span className="material-symbols-outlined text-[14px]">close</span>
                          </button>
                          <button
                            title="Approve"
                            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
                            style={{ background: "#2f3445", color: "#d4c5ad" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#2dd4bf"; (e.currentTarget as HTMLButtonElement).style.color = "#003731"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#2f3445"; (e.currentTarget as HTMLButtonElement).style.color = "#d4c5ad"; }}
                          >
                            <span className="material-symbols-outlined text-[14px]">check</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
