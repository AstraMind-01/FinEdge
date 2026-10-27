"use client";

import React, { useState } from "react";
import Link from "next/link";

// ---------- Data ----------
const summaryCards = [
  { label: "Pending Review", value: "245", trend: "Requires attention", trendUp: null, icon: "hourglass_empty", iconColor: "text-[#f0b429]", iconBg: "bg-[#f0b429]/20", borderColor: "border-b-2 border-[#f0b429]", highlight: true },
  { label: "Approved Today", value: "1,432", trend: "+12% vs yesterday", trendUp: true, icon: "verified", iconColor: "text-[#57f1db]", iconBg: "bg-[#2dd4bf]/20", borderColor: "", highlight: false },
  { label: "Rejected Today", value: "48", trend: "-5% vs yesterday", trendUp: false, icon: "block", iconColor: "text-[#ffb4ab]", iconBg: "bg-[#93000a]/20", borderColor: "", highlight: false },
  { label: "Avg Process Time", value: "4.2 hrs", trend: "Target: < 24 hrs", trendUp: null, icon: "timer", iconColor: "text-[#c6bfff]", iconBg: "bg-[#4331b4]/20", borderColor: "", highlight: false },
  { label: "Re-KYC Due (Mo)", value: "8,410", trend: "Periodic update", trendUp: null, icon: "sync", iconColor: "text-[#ff8b7e]", iconBg: "bg-[#ff8b7e]/20", borderColor: "", highlight: false },
];

type KycStatus = "Pending Review" | "Under Verification" | "Approved" | "Rejected" | "Re-KYC Required";

type KycApp = {
  id: string;
  customerName: string;
  avatar: string;
  accountType: string;
  status: KycStatus;
  submissionDate: string;
  pendingTime: string;
  urgent: boolean;
  assignedTo: string | null;
  rejectionReason?: string;
  docs: { type: string, uploaded: boolean }[];
  summary: string;
};

const mockApps: KycApp[] = [
  {
    id: "APP-99824",
    customerName: "Sneha Rao",
    avatar: "SR",
    accountType: "Premium Savings",
    status: "Pending Review",
    submissionDate: "10 Aug 2024",
    pendingTime: "52 hours",
    urgent: true,
    assignedTo: null,
    docs: [
      { type: "Aadhaar", uploaded: true },
      { type: "PAN", uploaded: true },
      { type: "Selfie", uploaded: true },
      { type: "Address", uploaded: true },
    ],
    summary: "Aadhaar OCR match: 98%. Face match confidence: 95%. PAN requires manual check.",
  },
  {
    id: "APP-99810",
    customerName: "Vikram Singh",
    avatar: "VS",
    accountType: "Current Account",
    status: "Under Verification",
    submissionDate: "12 Aug 2024",
    pendingTime: "4 hours",
    urgent: false,
    assignedTo: "Priya Admin",
    docs: [
      { type: "Aadhaar", uploaded: true },
      { type: "PAN", uploaded: true },
      { type: "Selfie", uploaded: true },
      { type: "Address", uploaded: false },
    ],
    summary: "Business incorporation documents pending verification.",
  },
  {
    id: "APP-99755",
    customerName: "Anjali Desai",
    avatar: "AD",
    accountType: "Savings",
    status: "Approved",
    submissionDate: "12 Aug 2024",
    pendingTime: "Approved at 10:15 AM",
    urgent: false,
    assignedTo: "Amit Security",
    docs: [
      { type: "Aadhaar", uploaded: true },
      { type: "PAN", uploaded: true },
      { type: "Selfie", uploaded: true },
    ],
    summary: "Auto-verified by system with 99% overall confidence.",
  },
  {
    id: "APP-99732",
    customerName: "Rahul Kapoor",
    avatar: "RK",
    accountType: "Savings",
    status: "Rejected",
    submissionDate: "11 Aug 2024",
    pendingTime: "Rejected 1 day ago",
    urgent: false,
    assignedTo: "Neha T.",
    rejectionReason: "Face mismatch (Confidence < 40%)",
    docs: [
      { type: "Aadhaar", uploaded: true },
      { type: "PAN", uploaded: true },
      { type: "Selfie", uploaded: true },
    ],
    summary: "Significant discrepancy between Aadhaar photo and live selfie.",
  },
];

const assignedCases = [
  { id: "APP-99810", name: "Vikram Singh", type: "Current" },
  { id: "APP-99780", name: "Alpha Corp Ltd", type: "Corporate" },
];

const reKycReminders = [
  { acc: "...4452", name: "Kiran Verma", due: "15 Aug 2024" },
  { acc: "...9910", name: "Arjun Mehta", due: "20 Aug 2024" },
];

const navItems = [
  { icon: "dashboard",     label: "Dashboard Overview",    href: "/admin",             active: false },
  { icon: "group",         label: "User Management",       href: "/admin/users",       active: false },
  { icon: "receipt_long",  label: "Transaction Monitoring",href: "/admin/transactions",active: false },
  { icon: "report_problem",label: "Fraud Alerts",          href: "/admin/fraud-alerts",active: false },
  { icon: "verified_user", label: "KYC Approvals",         href: "/admin/kyc-approvals",active: true },
  { icon: "settings",      label: "System Settings",       href: "/admin/settings",    active: false },
  { icon: "bar_chart",     label: "Reports",               href: "/admin/reports",     active: false },
];

// ---------- Components ----------

function StatusBadge({ status }: { status: KycStatus }) {
  let bg = "", text = "", border = "";
  if (status === "Pending Review") { bg = "bg-[#f0b429]/10"; text = "text-[#f0b429]"; border = "border-[#f0b429]/20"; }
  else if (status === "Under Verification") { bg = "bg-[#57f1db]/10"; text = "text-[#57f1db]"; border = "border-[#57f1db]/20"; } // Blueish/teal
  else if (status === "Approved") { bg = "bg-[#2dd4bf]/10"; text = "text-[#2dd4bf]"; border = "border-[#2dd4bf]/20"; } // Greenish
  else if (status === "Rejected") { bg = "bg-[#ffb4ab]/10"; text = "text-[#ffb4ab]"; border = "border-[#ffb4ab]/20"; }
  else if (status === "Re-KYC Required") { bg = "bg-[#ff8b7e]/10"; text = "text-[#ff8b7e]"; border = "border-[#ff8b7e]/20"; } // Orange

  return <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium border ${bg} ${text} ${border}`}>{status}</span>;
}

// ---------- Main Page ----------
export default function KycApprovals() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedApp, setExpandedApp] = useState<string | null>(null);
  const [reviewingApp, setReviewingApp] = useState<KycApp | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

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
                <input type="text" placeholder="Search applications..." className="rounded-full py-1.5 pl-10 pr-4 text-sm outline-none transition-all" style={{ background: "#242a3a", border: "1px solid #2f3445", color: "#dde2f8", width: 240 }} />
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
                  KYC Approvals
                </h3>
                <p className="text-sm" style={{ color: "#9c8f7a" }}>Review and verify customer identity documents</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[#242a3a]" style={{ border: "1px solid #504534", color: "#d4c5ad" }}>
                  <span className="material-symbols-outlined text-[18px]">done_all</span> Bulk Approve Selected
                </button>
                <button className="flex items-center justify-center w-10 h-10 rounded-lg transition-colors hover:bg-[#242a3a]" style={{ border: "1px solid #504534", color: "#d4c5ad" }}>
                  <span className="material-symbols-outlined text-[20px]">settings</span>
                </button>
              </div>
            </div>

            {/* Summary Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              {summaryCards.map((card) => (
                <div key={card.label} className={`glass-panel p-5 rounded-xl flex flex-col justify-between glow-hover transition-all ${card.borderColor}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="mono-font text-[11px] uppercase tracking-wider font-medium" style={{ color: card.highlight ? "#f0b429" : "#d4c5ad" }}>{card.label}</span>
                    <div className={`w-7 h-7 rounded flex items-center justify-center ${card.iconBg} ${card.iconColor}`}>
                      <span className="material-symbols-outlined text-[16px]">{card.icon}</span>
                    </div>
                  </div>
                  <div>
                    <div className="headline-font font-bold text-2xl mb-1" style={{ color: card.highlight ? "#f0b429" : "#dde2f8" }}>{card.value}</div>
                    <div className="flex items-center gap-1 text-[10px]" style={{ color: card.trendUp === true ? "#57f1db" : card.trendUp === false ? "#ffb4ab" : "#9c8f7a" }}>
                      {card.trendUp !== null && <span className="material-symbols-outlined text-[12px]">{card.trendUp ? "trending_up" : "trending_down"}</span>}
                      {card.trend}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Filter & Search */}
            {!reviewingApp && (
              <div className="glass-panel p-4 rounded-xl mb-6 flex flex-col xl:flex-row xl:items-center gap-4 justify-between">
                <div className="flex flex-1 items-center gap-3 w-full max-w-md relative">
                  <span className="material-symbols-outlined absolute left-3 text-[18px]" style={{ color: "#9c8f7a" }}>search</span>
                  <input type="text" placeholder="Search by name, ID, application..." className="w-full rounded-lg py-2 pl-10 pr-4 text-sm outline-none transition-all" style={{ background: "#191f2f", border: "1px solid #2f3445", color: "#dde2f8" }} />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <select className="rounded-lg py-2 px-3 text-sm outline-none cursor-pointer appearance-none pr-8 relative" style={{ background: "#191f2f", border: "1px solid #2f3445", color: "#d4c5ad" }}>
                    <option>Status</option><option>Pending Review</option><option>Approved</option><option>Rejected</option>
                  </select>
                  <select className="rounded-lg py-2 px-3 text-sm outline-none cursor-pointer appearance-none pr-8 relative" style={{ background: "#191f2f", border: "1px solid #2f3445", color: "#d4c5ad" }}>
                    <option>Document Type</option><option>Aadhaar</option><option>PAN</option>
                  </select>
                  <div className="h-6 w-px mx-1" style={{ background: "#2f3445" }}></div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors bg-[#f0b429]/10 text-[#f0b429]" style={{ borderColor: "#f0b429/20" }}>Urgent (&gt;48h)</button>
                    <button className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors hover:bg-[#242a3a]" style={{ borderColor: "#2f3445", color: "#9c8f7a" }}>Unassigned</button>
                  </div>
                </div>
              </div>
            )}

            {/* Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* LEFT COLUMN (70%) */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                
                {!reviewingApp ? (
                  /* Pending KYC Queue List */
                  <div className="glass-panel rounded-xl flex flex-col min-h-[600px]">
                    <div className="px-6 py-4 flex justify-between items-center" style={{ borderBottom: "1px solid #2f3445", background: "rgba(25,31,47,0.5)" }}>
                      <h4 className="headline-font font-semibold text-lg flex items-center gap-2" style={{ color: "#dde2f8" }}>
                        Pending KYC Queue
                      </h4>
                      <span className="text-xs text-[#9c8f7a]">Sorted by Age</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {mockApps.map((app) => (
                        <div key={app.id} className="rounded-xl overflow-hidden border transition-all" style={{ background: "#151b2b", borderColor: app.urgent ? "#ffb4ab" : "#2f3445", borderLeftWidth: app.urgent ? 4 : 1, borderLeftColor: app.urgent ? "#ffb4ab" : "#2f3445" }}>
                          
                          {/* Main Card Header */}
                          <div className="p-4 flex gap-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg" style={{ background: "#242a3a", color: "#ffd481" }}>{app.avatar}</div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold" style={{ color: "#ffffff" }}>{app.customerName}</span>
                                  <span className="mono-font text-xs" style={{ color: "#9c8f7a" }}>{app.id}</span>
                                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#33394a] text-[#d4c5ad]">{app.accountType}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={`text-xs ${app.urgent ? "text-[#ffb4ab] font-bold" : "text-[#9c8f7a]"}`}>{app.pendingTime}</span>
                                  <StatusBadge status={app.status} />
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between mt-3">
                                {/* Document thumbnails row */}
                                <div className="flex items-center gap-2">
                                  {app.docs.map((doc, idx) => (
                                    <div key={idx} className="flex items-center gap-1.5 bg-[#191f2f] border border-[#2f3445] px-2 py-1 rounded text-[10px]" style={{ color: "#d4c5ad" }}>
                                      <span className="material-symbols-outlined text-[12px]">{doc.type === "Selfie" ? "face" : doc.type === "Aadhaar" ? "fingerprint" : "description"}</span>
                                      {doc.type}
                                      <span className={`w-1.5 h-1.5 rounded-full ${doc.uploaded ? "bg-[#57f1db]" : "bg-[#ffb4ab]"}`}></span>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex items-center gap-2">
                                  {app.status === "Pending Review" && (
                                    <button className="px-4 py-1.5 rounded text-xs font-bold transition-colors hover:opacity-90" style={{ background: "#f0b429", color: "#412d00" }} onClick={() => setReviewingApp(app)}>Review</button>
                                  )}
                                  {app.status === "Under Verification" && (
                                    <button className="px-4 py-1.5 rounded text-xs font-bold border transition-colors hover:bg-[#242a3a]" style={{ borderColor: "#f0b429", color: "#f0b429" }} onClick={() => setReviewingApp(app)}>Continue</button>
                                  )}
                                  <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#242a3a] text-[#9c8f7a]" onClick={() => setExpandedApp(expandedApp === app.id ? null : app.id)}>
                                    <span className="material-symbols-outlined text-[20px]">{expandedApp === app.id ? "expand_less" : "expand_more"}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Expandable Content */}
                          {expandedApp === app.id && (
                            <div className="p-4 border-t animate-in slide-in-from-top-2" style={{ borderTopColor: "#2f3445", background: "rgba(36,42,58,0.3)" }}>
                              <div className="flex gap-6">
                                <div className="flex-1 space-y-2">
                                  <p className="mono-font text-[10px] text-[#9c8f7a] uppercase mb-1">Auto-Verification Summary</p>
                                  <p className="text-sm text-[#dde2f8]">{app.summary}</p>
                                  {app.rejectionReason && (
                                    <p className="text-sm font-medium mt-1" style={{ color: "#ffb4ab" }}>Reason: {app.rejectionReason}</p>
                                  )}
                                </div>
                                <div className="w-1/3 border-l pl-4" style={{ borderColor: "#2f3445" }}>
                                  <p className="mono-font text-[10px] text-[#9c8f7a] uppercase mb-1">Assignment</p>
                                  {app.assignedTo ? (
                                    <p className="text-sm text-[#dde2f8] flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">person</span> {app.assignedTo}</p>
                                  ) : (
                                    <button className="text-sm text-[#ffd481] underline">Assign to Me</button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: "1px solid #2f3445", background: "rgba(36,42,58,0.5)" }}>
                      <span className="text-xs" style={{ color: "#9c8f7a" }}>Showing 1-4 of 245 applications</span>
                      <div className="flex gap-1">
                        <button className="w-7 h-7 rounded border flex items-center justify-center transition-colors hover:bg-[#33394a]" style={{ borderColor: "#2f3445", color: "#d4c5ad" }}><span className="material-symbols-outlined text-[16px]">chevron_left</span></button>
                        <button className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold" style={{ background: "#f0b429", color: "#412d00" }}>1</button>
                        <button className="w-7 h-7 rounded flex items-center justify-center text-xs hover:bg-[#33394a]" style={{ color: "#d4c5ad" }}>2</button>
                        <button className="w-7 h-7 rounded border flex items-center justify-center transition-colors hover:bg-[#33394a]" style={{ borderColor: "#2f3445", color: "#d4c5ad" }}><span className="material-symbols-outlined text-[16px]">chevron_right</span></button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Document Review Panel */
                  <div className="glass-panel rounded-xl flex flex-col min-h-[700px] animate-in fade-in zoom-in-95 duration-200">
                    {/* Panel Header */}
                    <div className="px-6 py-4 flex justify-between items-center" style={{ borderBottom: "1px solid #2f3445", background: "rgba(25,31,47,0.5)" }}>
                      <div className="flex items-center gap-4">
                        <button onClick={() => setReviewingApp(null)} className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-[#242a3a] transition-colors" style={{ color: "#d4c5ad" }}>
                          <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <div>
                          <h4 className="headline-font font-bold text-lg flex items-center gap-2" style={{ color: "#ffffff" }}>
                            Reviewing {reviewingApp.customerName}
                          </h4>
                          <p className="mono-font text-xs" style={{ color: "#9c8f7a" }}>{reviewingApp.id}</p>
                        </div>
                      </div>
                      <StatusBadge status={reviewingApp.status} />
                    </div>

                    <div className="flex-1 flex flex-col xl:flex-row">
                      {/* Image Viewer (Left) */}
                      <div className="xl:w-3/5 p-6 border-b xl:border-b-0 xl:border-r flex flex-col" style={{ borderColor: "#2f3445", background: "#0d1322" }}>
                        <div className="flex justify-between items-center mb-4">
                          <h5 className="font-semibold text-sm" style={{ color: "#dde2f8" }}>Document Viewer: Aadhaar Card</h5>
                          <div className="flex gap-2">
                            <button className="w-8 h-8 rounded border flex items-center justify-center hover:bg-[#242a3a]" style={{ borderColor: "#2f3445", color: "#9c8f7a" }}><span className="material-symbols-outlined text-[18px]">zoom_in</span></button>
                            <button className="w-8 h-8 rounded border flex items-center justify-center hover:bg-[#242a3a]" style={{ borderColor: "#2f3445", color: "#9c8f7a" }}><span className="material-symbols-outlined text-[18px]">zoom_out</span></button>
                          </div>
                        </div>
                        
                        {/* Fake Document Image */}
                        <div className="flex-1 rounded-xl border border-dashed flex items-center justify-center relative overflow-hidden" style={{ borderColor: "#504534", background: "#151b2b" }}>
                           <div className="absolute inset-4 rounded border-2 p-6 flex flex-col justify-between" style={{ borderColor: "rgba(87,241,219,0.3)", background: "rgba(36,42,58,0.5)" }}>
                             <div className="flex justify-between">
                               <div className="w-16 h-4 bg-[#2f3445] rounded"></div>
                               <div className="w-24 h-24 bg-[#242a3a] rounded-lg"></div> {/* Photo slot */}
                             </div>
                             <div className="space-y-2 mt-8">
                               <div className="w-1/2 h-3 bg-[#2f3445] rounded"></div>
                               <div className="w-3/4 h-3 bg-[#2f3445] rounded"></div>
                               <div className="w-1/3 h-3 bg-[#2f3445] rounded"></div>
                             </div>
                             <div className="mt-8 text-center border-t pt-2" style={{ borderColor: "rgba(156,143,122,0.2)" }}>
                               <div className="w-full h-4 bg-[#2f3445] rounded mx-auto"></div>
                             </div>
                           </div>
                        </div>

                        {/* Thumbnail Strip */}
                        <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                          {["Aadhaar Front", "Aadhaar Back", "PAN Card", "Live Selfie"].map((doc, i) => (
                            <div key={i} className={`shrink-0 w-24 h-16 rounded border cursor-pointer flex items-center justify-center text-[10px] font-medium transition-colors ${i === 0 ? "border-[#f0b429] bg-[#f0b429]/10 text-[#ffd481]" : "border-[#2f3445] bg-[#191f2f] text-[#9c8f7a] hover:border-[#504534]"}`}>
                              {doc}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Extracted Data & Actions (Right) */}
                      <div className="xl:w-2/5 flex flex-col" style={{ background: "#151b2b" }}>
                        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                          
                          {/* Face Match */}
                          <div>
                            <h5 className="font-semibold text-xs uppercase tracking-wider mb-3" style={{ color: "#9c8f7a" }}>Biometric Verification</h5>
                            <div className="p-4 rounded-lg flex items-center justify-between" style={{ background: "#191f2f", border: "1px solid #2f3445" }}>
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded bg-[#242a3a] border border-[#504534]"></div>
                                <span className="material-symbols-outlined text-[#9c8f7a]">compare_arrows</span>
                                <div className="w-12 h-12 rounded bg-[#242a3a] border border-[#504534]"></div>
                              </div>
                              <div className="text-right">
                                <p className="text-[10px] text-[#9c8f7a] uppercase mb-0.5">Face Match</p>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#57f1db]/10 text-[#57f1db] border border-[#57f1db]/20">
                                  95% Match
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Extracted Data */}
                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <h5 className="font-semibold text-xs uppercase tracking-wider" style={{ color: "#9c8f7a" }}>Extracted Data (OCR)</h5>
                              <button className="text-[10px] text-[#ffd481] hover:underline">Edit Fields</button>
                            </div>
                            <div className="space-y-3">
                              {[
                                { label: "Full Name", val: reviewingApp.customerName, match: true },
                                { label: "Date of Birth", val: "14 May 1992", match: true },
                                { label: "ID Number", val: "xxxx xxxx 4921", match: true },
                                { label: "Address", val: "42 MG Road, Bangalore...", match: false },
                              ].map((f, i) => (
                                <div key={i} className="flex flex-col gap-1">
                                  <label className="text-[10px] text-[#9c8f7a]">{f.label}</label>
                                  <div className="flex items-center gap-2">
                                    <input type="text" readOnly value={f.val} className="flex-1 bg-[#191f2f] border rounded px-3 py-1.5 text-sm outline-none" style={{ borderColor: "#2f3445", color: "#dde2f8" }} />
                                    <span className="material-symbols-outlined text-[16px]" style={{ color: f.match ? "#57f1db" : "#ffb4ab" }}>
                                      {f.match ? "check_circle" : "warning"}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Checklist */}
                          <div>
                            <h5 className="font-semibold text-xs uppercase tracking-wider mb-3" style={{ color: "#9c8f7a" }}>Verification Checklist</h5>
                            <div className="space-y-2">
                              {["Name matches exact document", "DOB matches document", "Address verified via DB", "Photo quality acceptable"].map((chk, i) => (
                                <label key={i} className="flex items-center gap-3 p-2 rounded hover:bg-[#191f2f] cursor-pointer transition-colors">
                                  <input type="checkbox" defaultChecked={i !== 2} className="w-4 h-4 accent-[#f0b429]" />
                                  <span className="text-sm" style={{ color: "#dde2f8" }}>{chk}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Action Bar */}
                        <div className="p-6 flex flex-col gap-3" style={{ borderTop: "1px solid #2f3445", background: "rgba(25,31,47,0.5)" }}>
                          <button className="w-full py-3 rounded-lg text-sm font-bold shadow-lg transition-transform active:scale-95" style={{ background: "#f0b429", color: "#412d00" }}>
                            Approve KYC
                          </button>
                          <div className="flex gap-3">
                            <button 
                              className="flex-1 py-2 rounded-lg text-xs font-bold border transition-colors hover:bg-[#93000a]/20" 
                              style={{ borderColor: "#ffb4ab", color: "#ffb4ab" }}
                              onClick={() => setRejectModalOpen(true)}
                            >
                              Reject
                            </button>
                            <button className="flex-1 py-2 rounded-lg text-xs font-medium border transition-colors hover:bg-[#242a3a]" style={{ borderColor: "#504534", color: "#d4c5ad" }}>
                              Request Re-upload
                            </button>
                          </div>
                          <button className="text-[10px] underline mt-1 mx-auto" style={{ color: "#9c8f7a" }}>Escalate for Manual Review</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN (30%) */}
              <div className="flex flex-col gap-6">
                
                {/* SLA Compliance */}
                <div className="glass-panel p-6 rounded-xl">
                  <h4 className="headline-font font-semibold mb-4" style={{ color: "#dde2f8" }}>SLA Compliance</h4>
                  <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24 rounded-full flex items-center justify-center" style={{ background: "conic-gradient(#57f1db 0 85%, #2f3445 85% 100%)" }}>
                      <div className="absolute inset-2 rounded-full flex items-center justify-center flex-col" style={{ background: "#151b2b" }}>
                        <span className="text-xl font-bold" style={{ color: "#57f1db" }}>85%</span>
                        <span className="text-[8px] uppercase tracking-wider text-[#9c8f7a]">On Time</span>
                      </div>
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex justify-between text-xs"><span className="text-[#9c8f7a]">Target:</span><span className="font-mono text-[#dde2f8]">{"< 24h"}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-[#9c8f7a]">Overdue:</span><span className="font-mono font-bold text-[#ffb4ab]">34 cases</span></div>
                    </div>
                  </div>
                </div>

                {/* Rejection Reasons Breakdown */}
                <div className="glass-panel p-6 rounded-xl">
                  <h4 className="headline-font font-semibold mb-4" style={{ color: "#dde2f8" }}>Rejection Reasons</h4>
                  <div className="space-y-4">
                    {[
                      { type: "Blurry Document", pct: 40 },
                      { type: "Face Mismatch", pct: 25 },
                      { type: "Info Mismatch", pct: 20 },
                      { type: "Expired ID", pct: 15 }
                    ].map(item => (
                      <div key={item.type}>
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{ color: "#d4c5ad" }}>{item.type}</span>
                          <span className="mono-font font-medium" style={{ color: "#dde2f8" }}>{item.pct}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "#2f3445" }}>
                          <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: "#ffb4ab" }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Auto-Verification Stats */}
                <div className="glass-panel p-6 rounded-xl">
                  <h4 className="headline-font font-semibold mb-3" style={{ color: "#dde2f8" }}>Auto-Verification</h4>
                  <div className="flex gap-4 text-center">
                    <div className="flex-1 p-3 rounded bg-[#191f2f] border border-[#2f3445]">
                      <p className="text-[10px] text-[#9c8f7a] uppercase mb-1">Auto-Approved</p>
                      <p className="text-xl font-bold text-[#57f1db]">62%</p>
                    </div>
                    <div className="flex-1 p-3 rounded bg-[#191f2f] border border-[#2f3445]">
                      <p className="text-[10px] text-[#9c8f7a] uppercase mb-1">Manual Review</p>
                      <p className="text-xl font-bold text-[#f0b429]">38%</p>
                    </div>
                  </div>
                </div>

                {/* My Assigned Cases */}
                <div className="glass-panel p-6 rounded-xl border-l-2" style={{ borderLeftColor: "#f0b429" }}>
                  <h4 className="headline-font font-semibold mb-3 flex items-center gap-2" style={{ color: "#f0b429" }}>
                    My Assigned Cases
                  </h4>
                  <ul className="space-y-3">
                    {assignedCases.map((acc, i) => (
                      <li key={i} className="flex justify-between items-center text-xs p-2 rounded" style={{ background: "rgba(36,42,58,0.3)" }}>
                        <div>
                          <p className="font-medium" style={{ color: "#dde2f8" }}>{acc.name}</p>
                          <p className="mono-font mt-0.5" style={{ color: "#9c8f7a" }}>{acc.id} • {acc.type}</p>
                        </div>
                        <button className="text-[#ffd481] hover:underline" onClick={() => setReviewingApp(mockApps[1])}>Continue</button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Re-KYC Reminders */}
                <div className="glass-panel p-6 rounded-xl">
                  <h4 className="headline-font font-semibold mb-3 flex items-center justify-between" style={{ color: "#dde2f8" }}>
                    Re-KYC Due
                    <button className="text-[10px] underline text-[#ffd481]">Send Bulk Reminder</button>
                  </h4>
                  <div className="space-y-3">
                    {reKycReminders.map((rem, i) => (
                      <div key={i} className="flex justify-between items-center p-2 rounded border border-[#2f3445]" style={{ background: "#191f2f" }}>
                        <div>
                          <p className="text-xs font-medium text-[#dde2f8]">{rem.name}</p>
                          <p className="mono-font text-[10px] mt-0.5 text-[#9c8f7a]">Acct: {rem.acc}</p>
                        </div>
                        <span className="text-[10px] text-[#ffb4ab] font-mono">Due: {rem.due}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>

      {/* ── Reject Modal Overlay ── */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setRejectModalOpen(false)} />
          <div className="relative w-full max-w-sm rounded-xl shadow-2xl p-6 animate-in zoom-in-95" style={{ background: "#151b2b", border: "1px solid #2f3445" }}>
            <h3 className="headline-font font-bold text-xl mb-1 text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ffb4ab]">block</span> Reject Application
            </h3>
            <p className="text-xs text-[#9c8f7a] mb-5">Please provide a reason for rejecting this KYC application. This will be sent to the customer.</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#9c8f7a] mb-1.5">Reason Category</label>
                <select className="w-full bg-[#191f2f] border rounded-lg px-3 py-2 text-sm outline-none" style={{ borderColor: "#2f3445", color: "#dde2f8" }}>
                  <option>Document Unclear / Blurry</option>
                  <option>Information Mismatch</option>
                  <option>Expired Document</option>
                  <option>Face Mismatch</option>
                  <option>Suspected Fraud</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#9c8f7a] mb-1.5">Internal Notes (Optional)</label>
                <textarea className="w-full bg-[#191f2f] border rounded-lg px-3 py-2 text-sm outline-none resize-none h-20" placeholder="Add specific details..." style={{ borderColor: "#2f3445", color: "#dde2f8" }}></textarea>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-[#242a3a]" style={{ borderColor: "#504534", color: "#d4c5ad" }} onClick={() => setRejectModalOpen(false)}>
                Cancel
              </button>
              <button className="flex-1 py-2 rounded-lg text-sm font-bold transition-colors hover:bg-[#b3000c]" style={{ background: "#93000a", color: "#ffb4ab" }} onClick={() => setRejectModalOpen(false)}>
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
