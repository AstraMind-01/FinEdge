"use client";

import React, { useState } from "react";
import Link from "next/link";

// ---------- Data ----------
const navItems = [
  { icon: "dashboard",     label: "Dashboard Overview",    href: "/admin",             active: false },
  { icon: "group",         label: "User Management",       href: "/admin/users",       active: false },
  { icon: "receipt_long",  label: "Transaction Monitoring",href: "/admin/transactions",active: false },
  { icon: "report_problem",label: "Fraud Alerts",          href: "/admin/fraud-alerts",active: false },
  { icon: "verified_user", label: "KYC Approvals",         href: "/admin/kyc-approvals",active: false },
  { icon: "bar_chart",     label: "Reports",               href: "/admin/reports",     active: true },
  { icon: "settings",      label: "System Settings",       href: "/admin/settings",    active: false },
];

const summaryCards = [
  { label: "Reports Generated", value: "342", trend: "+24 this month", icon: "insert_chart", iconColor: "text-[#57f1db]", iconBg: "bg-[#2dd4bf]/20" },
  { label: "Scheduled Reports", value: "18", trend: "3 run today", icon: "event", iconColor: "text-[#f0b429]", iconBg: "bg-[#f0b429]/20" },
  { label: "Last Generated", value: "12m ago", trend: "Compliance Report", icon: "update", iconColor: "text-[#c6bfff]", iconBg: "bg-[#4331b4]/20" },
  { label: "Storage Used", value: "2.4 GB", trend: "of 10 GB limit", icon: "cloud", iconColor: "text-[#ff8b7e]", iconBg: "bg-[#ff8b7e]/20" },
];

const templates = [
  { name: "Revenue Report", desc: "Daily/Weekly/Monthly revenue breakdown.", icon: "payments", color: "text-[#57f1db]", bg: "bg-[#2dd4bf]/20", lastRun: "Today, 08:00 AM" },
  { name: "Transaction Summary", desc: "Volume and value of all platform transactions.", icon: "sync_alt", color: "text-[#f0b429]", bg: "bg-[#f0b429]/20", lastRun: "Yesterday, 18:30" },
  { name: "User Growth", desc: "New registrations, active users, and churn.", icon: "trending_up", color: "text-[#c6bfff]", bg: "bg-[#4331b4]/20", lastRun: "10 Aug 2024" },
  { name: "Loan Portfolio", desc: "Active loans, outstanding balances, NPAs.", icon: "account_balance", color: "text-[#ff8b7e]", bg: "bg-[#ff8b7e]/20", lastRun: "10 Aug 2024" },
  { name: "Compliance (RBI)", desc: "Standard regulatory reporting format.", icon: "gavel", color: "text-[#d4c5ad]", bg: "bg-[#2f3445]", lastRun: "01 Aug 2024" },
  { name: "Fraud & Risk", desc: "Blocked transactions and flagged accounts.", icon: "security", color: "text-[#ffb4ab]", bg: "bg-[#93000a]/20", lastRun: "Today, 10:15 AM" },
  { name: "KYC Status", desc: "Pending, approved, and rejected verifications.", icon: "fact_check", color: "text-[#57f1db]", bg: "bg-[#2dd4bf]/20", lastRun: "Yesterday, 14:00" },
  { name: "Deposit Summary", desc: "CASA and term deposit total balances.", icon: "savings", color: "text-[#f0b429]", bg: "bg-[#f0b429]/20", lastRun: "11 Aug 2024" },
];

const recentReports = [
  { id: "REP-4091", name: "Daily Revenue Recon", type: "Financial", admin: "System", date: "Today, 08:00 AM", format: "excel", size: "1.2 MB", status: "Ready" },
  { id: "REP-4092", name: "Suspicious Activity Q3", type: "Risk & Fraud", admin: "Amit Security", date: "Today, 10:15 AM", format: "pdf", size: "4.5 MB", status: "Processing" },
  { id: "REP-4090", name: "Weekly User Growth", type: "User Activity", admin: "Priya Admin", date: "Yesterday, 18:00", format: "csv", size: "850 KB", status: "Ready" },
  { id: "REP-4088", name: "Card Issuance Batch 9", type: "Operations", admin: "Rahul O.", date: "10 Aug 2024", format: "excel", size: "---", status: "Failed" },
];

const scheduledReports = [
  { name: "Weekly Revenue Summary", frequency: "Every Monday at 06:00", nextRun: "14 Aug 2024", recipients: "finance@finedge.com", active: true },
  { name: "Monthly Compliance", frequency: "1st of every Month", nextRun: "01 Sep 2024", recipients: "compliance@finedge.com", active: true },
  { name: "Daily Txn Exceptions", frequency: "Every day at 23:59", nextRun: "Today, 23:59", recipients: "ops-alerts@finedge.com", active: false },
];

// ---------- Components ----------
function FormatIcon({ format }: { format: string }) {
  if (format === "excel") return <span className="material-symbols-outlined text-[#57f1db] text-[20px]">table_view</span>;
  if (format === "pdf") return <span className="material-symbols-outlined text-[#ffb4ab] text-[20px]">picture_as_pdf</span>;
  return <span className="material-symbols-outlined text-[#f0b429] text-[20px]">data_object</span>; // CSV
}

// ---------- Main Page ----------
export default function ReportsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("All Reports");
  const [builderExpanded, setBuilderExpanded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex overflow-x-hidden antialiased" style={{ background: "#0d1322", color: "#dde2f8", fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=Geist:wght@500&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
        .material-symbols-outlined { font-variation-settings: 'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; font-family: 'Material Symbols Outlined'; }
        .fill-icon { font-variation-settings: 'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24; }
        .glass-panel { background: rgba(47,52,69,0.4); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(156,143,122,0.1); }
        .headline-font { font-family: 'Hanken Grotesk', sans-serif; }
        .mono-font { font-family: 'Geist', monospace; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #504534; border-radius: 4px; }
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
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
                <input type="text" placeholder="Search reports..." className="rounded-full py-1.5 pl-10 pr-4 text-sm outline-none transition-all" style={{ background: "#242a3a", border: "1px solid #2f3445", color: "#dde2f8", width: 240 }} />
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
                <h3 className="headline-font font-bold mb-1" style={{ color: "#ffffff", fontSize: 28 }}>Reports</h3>
                <p className="text-sm" style={{ color: "#9c8f7a" }}>Generate, schedule, and download platform-wide reports</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[#242a3a]" style={{ border: "1px solid #504534", color: "#d4c5ad" }}>
                  <span className="material-symbols-outlined text-[18px]">calendar_month</span> Scheduled Reports
                </button>
                <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold shadow-lg transition-transform active:scale-95 hover:opacity-90" style={{ background: "#f0b429", color: "#412d00" }}>
                  <span className="material-symbols-outlined text-[18px]">add</span> Generate Custom Report
                </button>
              </div>
            </div>

            {/* Summary Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {summaryCards.map((card) => (
                <div key={card.label} className="glass-panel p-5 rounded-xl flex items-center justify-between transition-all hover:bg-[#151b2b]">
                  <div>
                    <span className="mono-font text-[11px] uppercase tracking-wider font-medium text-[#d4c5ad] block mb-2">{card.label}</span>
                    <div className="headline-font font-bold text-2xl text-[#dde2f8] mb-1">{card.value}</div>
                    <div className="text-[10px] text-[#9c8f7a]">{card.trend}</div>
                  </div>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.iconBg} ${card.iconColor}`}>
                    <span className="material-symbols-outlined text-[20px]">{card.icon}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Filter Bar */}
            <div className="glass-panel p-2 rounded-xl mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex overflow-x-auto hide-scrollbar gap-1 px-2">
                {["All Reports", "Financial", "Compliance", "User Activity", "Risk & Fraud", "Custom"].map(tab => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)}
                    className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? "bg-[#191f2f] text-[#ffd481]" : "text-[#9c8f7a] hover:text-[#dde2f8]"}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3 px-2">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px]" style={{ color: "#9c8f7a" }}>search</span>
                  <input type="text" placeholder="Search by name or ID..." className="rounded-lg py-1.5 pl-9 pr-4 text-sm outline-none transition-all w-full lg:w-64" style={{ background: "#191f2f", border: "1px solid #2f3445", color: "#dde2f8" }} />
                </div>
                <div className="relative hidden sm:block">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[16px]" style={{ color: "#9c8f7a" }}>calendar_today</span>
                  <select className="rounded-lg py-1.5 pl-9 pr-4 text-sm outline-none appearance-none cursor-pointer" style={{ background: "#191f2f", border: "1px solid #2f3445", color: "#dde2f8" }}>
                    <option>Last 30 Days</option>
                    <option>This Month</option>
                    <option>Last Quarter</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Two-Column Layout */}
            <div className="flex flex-col xl:flex-row gap-6 items-start">
              
              {/* LEFT COLUMN (~70%) */}
              <div className="w-full xl:w-[70%] flex flex-col gap-6">
                
                {/* Custom Report Builder Inline (Expandable) */}
                <div className="glass-panel rounded-xl overflow-hidden transition-all duration-300">
                  <div className="p-5 flex items-center justify-between cursor-pointer hover:bg-[#151b2b]" onClick={() => setBuilderExpanded(!builderExpanded)}>
                    <h4 className="headline-font font-bold flex items-center gap-3" style={{ color: "#f0b429", fontSize: 16 }}>
                      <span className="material-symbols-outlined text-[20px]">tune</span> Custom Report Builder
                    </h4>
                    <span className="material-symbols-outlined text-[#9c8f7a]">{builderExpanded ? "expand_less" : "expand_more"}</span>
                  </div>
                  
                  {builderExpanded && (
                    <div className="p-6 border-t border-[#2f3445] bg-[#151b2b]/50 animate-in slide-in-from-top-2">
                      <div className="space-y-6">
                        {/* Step 1 */}
                        <div>
                          <p className="text-sm font-semibold text-[#dde2f8] mb-3">1. Select Data Source</p>
                          <div className="flex flex-wrap gap-3">
                            {["Transactions", "Users", "Loans", "Cards", "Deposits"].map(src => (
                              <label key={src} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#2f3445] bg-[#191f2f] cursor-pointer hover:border-[#504534]">
                                <input type="checkbox" className="accent-[#f0b429]" defaultChecked={src === "Transactions"} />
                                <span className="text-sm text-[#d4c5ad]">{src}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Step 2 */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            <p className="text-sm font-semibold text-[#dde2f8] mb-3">2. Date Range</p>
                            <input type="date" className="w-full bg-[#191f2f] border border-[#2f3445] rounded-lg px-3 py-2 text-sm text-[#dde2f8] outline-none" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#dde2f8] mb-3">3. Output Format</p>
                            <div className="flex gap-4">
                              {["PDF", "Excel", "CSV"].map(fmt => (
                                <label key={fmt} className="flex items-center gap-2">
                                  <input type="radio" name="fmt" className="accent-[#f0b429]" defaultChecked={fmt === "Excel"} />
                                  <span className="text-sm text-[#d4c5ad]">{fmt}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Step 3 */}
                        <div>
                          <p className="text-sm font-semibold text-[#dde2f8] mb-3">4. Select Fields to Include</p>
                          <div className="flex flex-wrap gap-2 p-3 border border-[#2f3445] rounded-lg bg-[#0d1322] min-h-[60px] items-center">
                            {["Transaction ID", "Amount", "Status", "Date", "Customer Name", "Currency"].map(field => (
                              <div key={field} className="flex items-center gap-1 bg-[#191f2f] px-2 py-1 rounded-full border border-[#504534] text-xs text-[#d4c5ad]">
                                {field}
                                <span className="material-symbols-outlined text-[14px] cursor-pointer hover:text-[#ffb4ab]">close</span>
                              </div>
                            ))}
                            <button className="text-xs text-[#f0b429] ml-2 font-medium">+ Add Field</button>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2f3445]">
                          <button className="px-4 py-2 text-sm text-[#d4c5ad] hover:text-white">Preview Data</button>
                          <button className="px-6 py-2 rounded-lg text-sm font-bold bg-[#f0b429] text-[#412d00] hover:opacity-90 shadow-lg">Generate Report</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Report Templates Grid */}
                <div className="glass-panel p-6 rounded-xl">
                  <h4 className="headline-font font-semibold text-lg text-white mb-5 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#f0b429]">grid_view</span> Report Templates
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {templates.map((tpl, i) => (
                      <div key={i} className="p-4 rounded-xl border border-[#2f3445] bg-[#151b2b] hover:border-[#504534] transition-all flex flex-col h-full group">
                        <div className="flex justify-between items-start mb-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tpl.bg} ${tpl.color}`}>
                            <span className="material-symbols-outlined">{tpl.icon}</span>
                          </div>
                          <button className="w-6 h-6 rounded-full bg-[#191f2f] flex items-center justify-center text-[#9c8f7a] group-hover:bg-[#242a3a] group-hover:text-[#f0b429] transition-colors">
                            <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                          </button>
                        </div>
                        <h5 className="font-semibold text-sm text-[#dde2f8] mb-1">{tpl.name}</h5>
                        <p className="text-xs text-[#9c8f7a] flex-1 line-clamp-2">{tpl.desc}</p>
                        <p className="text-[10px] text-[#504534] mt-3 pt-3 border-t border-[#2f3445]">Last generated: {tpl.lastRun}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recently Generated Reports Table */}
                <div className="glass-panel rounded-xl overflow-hidden">
                  <div className="px-6 py-4 flex justify-between items-center border-b border-[#2f3445] bg-[#151b2b]">
                    <h4 className="headline-font font-semibold text-lg text-white">Recently Generated Reports</h4>
                    <button className="text-sm text-[#ffd481] hover:underline">View All</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="text-xs uppercase text-[#9c8f7a] bg-[#0d1322]">
                        <tr>
                          <th className="px-6 py-4 font-medium">Report Name</th>
                          <th className="px-6 py-4 font-medium">Type</th>
                          <th className="px-6 py-4 font-medium">Date & Time</th>
                          <th className="px-6 py-4 font-medium">File</th>
                          <th className="px-6 py-4 font-medium">Status</th>
                          <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2f3445]">
                        {recentReports.map(report => (
                          <tr key={report.id} className="hover:bg-[#151b2b] transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-medium text-[#dde2f8]">{report.name}</p>
                              <p className="mono-font text-[10px] text-[#9c8f7a]">{report.id} • by {report.admin}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 rounded text-[10px] bg-[#191f2f] text-[#d4c5ad] border border-[#2f3445]">{report.type}</span>
                            </td>
                            <td className="px-6 py-4 text-[#d4c5ad] text-xs">{report.date}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <FormatIcon format={report.format} />
                                <span className="text-[10px] text-[#9c8f7a]">{report.size}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {report.status === "Ready" && <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-[#2dd4bf]/10 text-[#2dd4bf] border border-[#2dd4bf]/20"><span className="w-1.5 h-1.5 rounded-full bg-[#2dd4bf]"></span> Ready</span>}
                              {report.status === "Processing" && <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-[#f0b429]/10 text-[#f0b429] border border-[#f0b429]/20"><span className="material-symbols-outlined text-[12px] spinner">sync</span> Processing</span>}
                              {report.status === "Failed" && <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-[#ffb4ab]/10 text-[#ffb4ab] border border-[#ffb4ab]/20"><span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab]"></span> Failed</span>}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2 text-[#9c8f7a]">
                                {report.status === "Ready" ? (
                                  <>
                                    <button className="w-8 h-8 rounded-full hover:bg-[#242a3a] hover:text-[#57f1db] flex items-center justify-center transition-colors"><span className="material-symbols-outlined text-[18px]">download</span></button>
                                    <button className="w-8 h-8 rounded-full hover:bg-[#242a3a] hover:text-[#f0b429] flex items-center justify-center transition-colors"><span className="material-symbols-outlined text-[18px]">visibility</span></button>
                                    <button className="w-8 h-8 rounded-full hover:bg-[#242a3a] hover:text-[#c6bfff] flex items-center justify-center transition-colors"><span className="material-symbols-outlined text-[18px]">share</span></button>
                                  </>
                                ) : (
                                  <button className="w-8 h-8 flex items-center justify-center opacity-50 cursor-not-allowed"><span className="material-symbols-outlined text-[18px]">download</span></button>
                                )}
                                <button className="w-8 h-8 rounded-full hover:bg-[#242a3a] hover:text-[#ffb4ab] flex items-center justify-center transition-colors"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-6 py-3 border-t border-[#2f3445] flex items-center justify-between text-xs text-[#9c8f7a] bg-[#0d1322]">
                    <span>Showing 1-4 of 86 reports</span>
                    <div className="flex gap-1">
                      <button className="px-2 py-1 border border-[#2f3445] rounded hover:bg-[#191f2f]">Prev</button>
                      <button className="px-2 py-1 border border-[#2f3445] rounded bg-[#191f2f] text-[#dde2f8]">1</button>
                      <button className="px-2 py-1 border border-[#2f3445] rounded hover:bg-[#191f2f]">2</button>
                      <button className="px-2 py-1 border border-[#2f3445] rounded hover:bg-[#191f2f]">Next</button>
                    </div>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN (~30%) */}
              <div className="w-full xl:w-[30%] flex flex-col gap-6">
                
                {/* Scheduled Reports */}
                <div className="glass-panel p-6 rounded-xl">
                  <h4 className="headline-font font-semibold mb-4 text-[#dde2f8] flex items-center justify-between">
                    Scheduled Reports
                    <button className="text-[10px] uppercase font-bold text-[#f0b429] border border-[#f0b429]/30 px-2 py-1 rounded hover:bg-[#f0b429]/10">Manage</button>
                  </h4>
                  <div className="space-y-4">
                    {scheduledReports.map((sch, i) => (
                      <div key={i} className="p-3 rounded-lg border border-[#2f3445] bg-[#151b2b]">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-semibold text-sm text-[#dde2f8]">{sch.name}</p>
                          <div className={`w-8 h-4 rounded-full flex items-center px-0.5 cursor-pointer ${sch.active ? 'bg-[#f0b429]' : 'bg-[#2f3445]'}`}>
                            <div className={`w-3 h-3 rounded-full bg-white transition-transform ${sch.active ? 'translate-x-4' : 'translate-x-0'}`}></div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs flex items-center gap-2 text-[#d4c5ad]"><span className="material-symbols-outlined text-[14px]">event_repeat</span> {sch.frequency}</p>
                          <p className="text-[10px] text-[#9c8f7a] font-mono">Next: {sch.nextRun}</p>
                          <p className="text-[10px] text-[#9c8f7a] flex items-center gap-1 mt-1"><span className="material-symbols-outlined text-[12px]">mail</span> {sch.recipients}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Compliance Deadlines */}
                <div className="glass-panel p-6 rounded-xl border-l-2 border-l-[#ffb4ab]">
                  <h4 className="headline-font font-semibold mb-4 text-[#dde2f8] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#ffb4ab]">gavel</span> Compliance Deadlines
                  </h4>
                  <div className="p-3 rounded bg-[#93000a]/10 border border-[#ffb4ab]/20 mb-3">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-semibold text-[#ffb4ab]">RBI Quarterly Audit</p>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#ffb4ab] text-[#410002]">DUE</span>
                    </div>
                    <p className="text-xs text-[#dde2f8] mb-2">Required submission of Q3 liquidity and transaction metrics.</p>
                    <p className="text-[10px] text-[#ffb4ab] font-mono flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">timer</span> Due 15 Sep 2026 (3 days left)</p>
                  </div>
                  <div className="p-3 rounded bg-[#191f2f] border border-[#2f3445]">
                    <p className="text-sm font-semibold text-[#d4c5ad]">KYC Monthly Summary</p>
                    <p className="text-[10px] text-[#9c8f7a] mt-1 font-mono">Due 01 Oct 2026</p>
                  </div>
                </div>

                {/* Report Recipients */}
                <div className="glass-panel p-6 rounded-xl">
                  <h4 className="headline-font font-semibold mb-4 text-[#dde2f8] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#57f1db]">group</span> Report Recipients
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-full bg-[#191f2f] border border-[#2f3445] flex items-center justify-center text-[#57f1db]"><span className="material-symbols-outlined text-[16px]">account_balance</span></div>
                      <div>
                        <p className="text-[#dde2f8]">Finance Team</p>
                        <p className="text-[10px] text-[#9c8f7a]">finance@finedge.com (4 users)</p>
                      </div>
                    </li>
                    <li className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-full bg-[#191f2f] border border-[#2f3445] flex items-center justify-center text-[#ffb4ab]"><span className="material-symbols-outlined text-[16px]">security</span></div>
                      <div>
                        <p className="text-[#dde2f8]">Risk & Compliance</p>
                        <p className="text-[10px] text-[#9c8f7a]">compliance@finedge.com (6 users)</p>
                      </div>
                    </li>
                  </ul>
                  <button className="text-xs text-[#ffd481] hover:underline mt-4">Manage Groups</button>
                </div>

                {/* Export Activity Log */}
                <div className="glass-panel p-5 rounded-xl border border-[#2f3445] bg-[#151b2b]">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-[#9c8f7a] mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[14px]">history</span> Export Activity Log
                  </h4>
                  <div className="space-y-3">
                    <div className="text-xs border-l-2 border-[#2f3445] pl-2">
                      <p className="text-[#dde2f8]">Downloaded <span className="text-[#57f1db]">Daily Revenue Recon</span></p>
                      <p className="text-[10px] text-[#9c8f7a]">Amit Security • 10 mins ago</p>
                    </div>
                    <div className="text-xs border-l-2 border-[#2f3445] pl-2">
                      <p className="text-[#dde2f8]">Emailed <span className="text-[#f0b429]">Weekly User Growth</span></p>
                      <p className="text-[10px] text-[#9c8f7a]">System Auto • 08:00 AM</p>
                    </div>
                    <div className="text-xs border-l-2 border-[#2f3445] pl-2">
                      <p className="text-[#dde2f8]">Exported <span className="text-[#ffb4ab]">Customer Data Dump</span></p>
                      <p className="text-[10px] text-[#ffb4ab] font-bold">Priya Admin • Yesterday (Audit Flag)</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>

      {/* ── Generate Custom Report Modal ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-2xl rounded-xl shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh]" style={{ background: "#151b2b", border: "1px solid #2f3445" }}>
            
            {/* Modal Header */}
            <div className="p-6 border-b border-[#2f3445] flex justify-between items-center">
              <div>
                <h3 className="headline-font font-bold text-xl text-white">Generate Custom Report</h3>
                <p className="text-xs text-[#9c8f7a]">Configure parameters to export specific platform data.</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-[#9c8f7a] hover:text-white"><span className="material-symbols-outlined">close</span></button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#9c8f7a] mb-2">Report Name</label>
                <input type="text" placeholder="e.g., Q3 Premium User Transactions" className="w-full bg-[#191f2f] border border-[#2f3445] rounded-lg px-4 py-2.5 text-sm text-[#dde2f8] outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#9c8f7a] mb-2">Data Source</label>
                  <select className="w-full bg-[#191f2f] border border-[#2f3445] rounded-lg px-4 py-2.5 text-sm text-[#dde2f8] outline-none appearance-none">
                    <option>Transactions</option><option>User Accounts</option><option>Loans</option><option>System Audit Logs</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#9c8f7a] mb-2">Date Range</label>
                  <select className="w-full bg-[#191f2f] border border-[#2f3445] rounded-lg px-4 py-2.5 text-sm text-[#dde2f8] outline-none appearance-none">
                    <option>Last 30 Days</option><option>This Quarter</option><option>Custom Range...</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#9c8f7a] mb-2">Select Columns</label>
                <div className="border border-[#2f3445] rounded-lg bg-[#191f2f] p-4 flex flex-wrap gap-3">
                  {["Transaction ID", "User ID", "Amount", "Currency", "Timestamp", "Status", "Merchant"].map((col, i) => (
                    <label key={col} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked={i < 4} className="accent-[#f0b429]" />
                      <span className="text-sm text-[#d4c5ad]">{col}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#9c8f7a] mb-2">File Format</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2"><input type="radio" name="fmt2" className="accent-[#f0b429]" /> <span className="text-sm text-[#d4c5ad]">PDF</span></label>
                    <label className="flex items-center gap-2"><input type="radio" name="fmt2" className="accent-[#f0b429]" defaultChecked /> <span className="text-sm text-[#d4c5ad]">Excel</span></label>
                    <label className="flex items-center gap-2"><input type="radio" name="fmt2" className="accent-[#f0b429]" /> <span className="text-sm text-[#d4c5ad]">CSV</span></label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[#9c8f7a] mb-2">Delivery Option</label>
                  <select className="w-full bg-[#191f2f] border border-[#2f3445] rounded-lg px-4 py-2.5 text-sm text-[#dde2f8] outline-none appearance-none">
                    <option>Download Now</option><option>Email to Me</option><option>Schedule Recurring</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[#2f3445] flex justify-end gap-4 bg-[#0d1322] rounded-b-xl">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-[#d4c5ad] hover:text-white transition-colors">
                Cancel
              </button>
              <button onClick={() => setModalOpen(false)} className="px-6 py-2 rounded-lg text-sm font-bold bg-[#f0b429] text-[#412d00] hover:opacity-90 shadow-lg flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">play_arrow</span> Generate
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
