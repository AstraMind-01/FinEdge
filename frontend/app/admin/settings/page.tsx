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
  { icon: "settings",      label: "System Settings",       href: "/admin/settings",    active: true },
  { icon: "bar_chart",     label: "Reports",               href: "/admin/reports",     active: false },
];

const settingsTabs = [
  { id: "general", label: "General", icon: "tune" },
  { id: "security", label: "Security & Auth", icon: "lock" },
  { id: "limits", label: "Transaction Limits", icon: "account_balance_wallet" },
  { id: "fraud", label: "Fraud Detection", icon: "security" },
  { id: "notifications", label: "Notifications", icon: "notifications" },
  { id: "api", label: "API & Integrations", icon: "api" },
  { id: "backup", label: "Backup & Data", icon: "backup" },
  { id: "maintenance", label: "Maintenance Mode", icon: "build", danger: true },
];

const recentChanges = [
  { id: 1, admin: "Priya Admin", setting: "Session Timeout", old: "30 mins", new: "15 mins", time: "2 hrs ago" },
  { id: 2, admin: "Amit Security", setting: "Velocity Check Rule", old: "Disabled", new: "Enabled", time: "Yesterday, 14:30" },
  { id: 3, admin: "System", setting: "Daily DB Backup", old: "-", new: "Success", time: "Yesterday, 02:00" },
];

const systemStatus = [
  { label: "Core Database", status: "Healthy", color: "#57f1db" },
  { label: "Payment Gateway", status: "Degraded", color: "#f0b429" },
  { label: "SMS Service", status: "Healthy", color: "#57f1db" },
  { label: "KYC OCR Engine", status: "Healthy", color: "#57f1db" },
];

const fraudRules = [
  { name: "Velocity Check", desc: "Flags multiple rapid transactions from same account.", active: true, sensitivity: "High" },
  { name: "Geo-fencing", desc: "Blocks logins outside approved country list.", active: true, sensitivity: "Medium" },
  { name: "New Device Alert", desc: "Triggers on login from unknown device fingerprint.", active: false, sensitivity: "Low" },
];

const integrations = [
  { name: "Razorpay Gateway", status: "Connected", latency: "42ms" },
  { name: "Twilio SMS", status: "Connected", latency: "115ms" },
  { name: "Experian Credit Bureau", status: "Disconnected", latency: "-" },
  { name: "Veriff KYC", status: "Connected", latency: "210ms" },
];

// ---------- Main Page ----------
export default function SystemSettings() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [hasChanges, setHasChanges] = useState(true);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Reusable Toggle Component
  const Toggle = ({ active, onChange }: { active: boolean, onChange?: () => void }) => (
    <button 
      onClick={onChange}
      className={`w-10 h-6 rounded-full flex items-center px-1 transition-colors ${active ? "bg-[#f0b429]" : "bg-[#2f3445]"}`}
    >
      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${active ? "translate-x-4" : "translate-x-0"}`}></div>
    </button>
  );

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
                <input type="text" placeholder="Search settings..." className="rounded-full py-1.5 pl-10 pr-4 text-sm outline-none transition-all" style={{ background: "#242a3a", border: "1px solid #2f3445", color: "#dde2f8", width: 240 }} />
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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <h3 className="headline-font font-bold mb-1" style={{ color: "#ffffff", fontSize: 28 }}>
                  System Settings
                </h3>
                <p className="text-sm" style={{ color: "#9c8f7a" }}>Configure platform behavior, security, and operational parameters</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[#242a3a]" style={{ border: "1px solid #504534", color: "#d4c5ad" }}>
                  <span className="material-symbols-outlined text-[18px]">history</span> View Change History
                </button>
                {hasChanges && (
                  <button className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold shadow-lg transition-transform active:scale-95" style={{ background: "#f0b429", color: "#412d00" }}>
                    <span className="material-symbols-outlined text-[18px]">save</span> Save All Changes
                  </button>
                )}
              </div>
            </div>

            {/* Three-Column Layout */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              
              {/* LEFT NAV TABS (~220px) */}
              <div className="w-full lg:w-[240px] shrink-0 space-y-1">
                {settingsTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors border-l-4 text-left ${activeTab === tab.id ? "bg-[#191f2f]" : "hover:bg-[#151b2b] border-transparent"}`}
                    style={{
                      borderColor: activeTab === tab.id ? (tab.danger ? "#ffb4ab" : "#f0b429") : "transparent",
                      color: activeTab === tab.id ? (tab.danger ? "#ffb4ab" : "#ffd481") : (tab.danger ? "#ff8b7e" : "#d4c5ad")
                    }}
                  >
                    <span className={`material-symbols-outlined text-[20px] ${activeTab === tab.id ? "fill-icon" : ""}`}>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* MAIN CONTENT AREA */}
              <div className="flex-1 w-full min-w-0 flex flex-col gap-6">
                
                {/* --- TAB: GENERAL --- */}
                {activeTab === "general" && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="glass-panel p-6 rounded-xl">
                      <h4 className="headline-font font-semibold mb-5 flex items-center gap-2 text-lg text-white">
                        <span className="material-symbols-outlined text-[#f0b429]">corporate_fare</span> Platform Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs uppercase tracking-wider text-[#9c8f7a] mb-1.5">Bank/Platform Name</label>
                          <input type="text" defaultValue="FinEdge Intelligent Banking" className="w-full bg-[#191f2f] border rounded-lg px-4 py-2 text-sm outline-none" style={{ borderColor: "#2f3445", color: "#dde2f8" }} />
                        </div>
                        <div>
                          <label className="block text-xs uppercase tracking-wider text-[#9c8f7a] mb-1.5">Support Email</label>
                          <input type="email" defaultValue="support@finedge.com" className="w-full bg-[#191f2f] border rounded-lg px-4 py-2 text-sm outline-none" style={{ borderColor: "#2f3445", color: "#dde2f8" }} />
                        </div>
                        <div>
                          <label className="block text-xs uppercase tracking-wider text-[#9c8f7a] mb-1.5">Support Phone</label>
                          <input type="text" defaultValue="+91 1800-452-9988" className="w-full bg-[#191f2f] border rounded-lg px-4 py-2 text-sm outline-none" style={{ borderColor: "#2f3445", color: "#dde2f8" }} />
                        </div>
                        <div>
                          <label className="block text-xs uppercase tracking-wider text-[#9c8f7a] mb-1.5">Business Hours</label>
                          <input type="text" defaultValue="Mon - Fri, 09:00 AM - 06:00 PM" className="w-full bg-[#191f2f] border rounded-lg px-4 py-2 text-sm outline-none" style={{ borderColor: "#2f3445", color: "#dde2f8" }} />
                        </div>
                      </div>
                    </div>

                    <div className="glass-panel p-6 rounded-xl">
                      <h4 className="headline-font font-semibold mb-5 flex items-center gap-2 text-lg text-white">
                        <span className="material-symbols-outlined text-[#f0b429]">public</span> Regional Settings
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-xs uppercase tracking-wider text-[#9c8f7a] mb-1.5">Default Currency</label>
                          <select className="w-full bg-[#191f2f] border rounded-lg px-4 py-2 text-sm outline-none appearance-none" style={{ borderColor: "#2f3445", color: "#dde2f8" }}>
                            <option>INR (₹) - Indian Rupee</option><option>USD ($) - US Dollar</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs uppercase tracking-wider text-[#9c8f7a] mb-1.5">Time Zone</label>
                          <select className="w-full bg-[#191f2f] border rounded-lg px-4 py-2 text-sm outline-none appearance-none" style={{ borderColor: "#2f3445", color: "#dde2f8" }}>
                            <option>Asia/Kolkata (IST)</option><option>UTC</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs uppercase tracking-wider text-[#9c8f7a] mb-1.5">Date Format</label>
                          <select className="w-full bg-[#191f2f] border rounded-lg px-4 py-2 text-sm outline-none appearance-none" style={{ borderColor: "#2f3445", color: "#dde2f8" }}>
                            <option>DD/MM/YYYY</option><option>MM/DD/YYYY</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs uppercase tracking-wider text-[#9c8f7a] mb-1.5">Default Language</label>
                          <select className="w-full bg-[#191f2f] border rounded-lg px-4 py-2 text-sm outline-none appearance-none" style={{ borderColor: "#2f3445", color: "#dde2f8" }}>
                            <option>English</option><option>Hindi</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="glass-panel p-6 rounded-xl">
                      <h4 className="headline-font font-semibold mb-5 flex items-center gap-2 text-lg text-white">
                        <span className="material-symbols-outlined text-[#f0b429]">palette</span> Branding
                      </h4>
                      <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div>
                          <label className="block text-xs uppercase tracking-wider text-[#9c8f7a] mb-2">Platform Logo</label>
                          <div className="flex items-end gap-4">
                            <div className="w-20 h-20 rounded-xl bg-[#242a3a] border border-[#504534] flex items-center justify-center">
                              <span className="material-symbols-outlined text-3xl text-[#f0b429]">account_balance</span>
                            </div>
                            <button className="px-3 py-1.5 rounded border text-xs transition-colors hover:bg-[#242a3a]" style={{ borderColor: "#2f3445", color: "#d4c5ad" }}>Change Logo</button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs uppercase tracking-wider text-[#9c8f7a] mb-2">Primary Color</label>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full border-2 border-white shadow-lg" style={{ background: "#f0b429" }}></div>
                            <span className="mono-font text-sm text-[#dde2f8]">#F0B429</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- TAB: SECURITY --- */}
                {activeTab === "security" && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="glass-panel p-6 rounded-xl">
                      <h4 className="headline-font font-semibold mb-5 flex items-center gap-2 text-lg text-white">
                        <span className="material-symbols-outlined text-[#f0b429]">password</span> Password Policy
                      </h4>
                      <div className="space-y-5 max-w-lg">
                        <div>
                          <div className="flex justify-between mb-1">
                            <label className="text-sm text-[#dde2f8]">Minimum Length</label>
                            <span className="text-sm text-[#f0b429] font-mono">12 chars</span>
                          </div>
                          <input type="range" min="8" max="24" defaultValue="12" className="w-full accent-[#f0b429]" />
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-[#2f3445]">
                          <span className="text-sm text-[#dde2f8]">Require Special Character (!@#$)</span>
                          <Toggle active={true} />
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-[#2f3445]">
                          <span className="text-sm text-[#dde2f8]">Require Numbers</span>
                          <Toggle active={true} />
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-[#2f3445]">
                          <span className="text-sm text-[#dde2f8]">Require Uppercase</span>
                          <Toggle active={true} />
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-sm text-[#dde2f8]">Password Expiry (Days)</span>
                          <input type="number" defaultValue="90" className="w-20 bg-[#191f2f] border rounded px-3 py-1 text-sm outline-none text-right" style={{ borderColor: "#2f3445", color: "#dde2f8" }} />
                        </div>
                      </div>
                    </div>

                    <div className="glass-panel p-6 rounded-xl">
                      <h4 className="headline-font font-semibold mb-5 flex items-center gap-2 text-lg text-white">
                        <span className="material-symbols-outlined text-[#f0b429]">timer</span> Session Management
                      </h4>
                      <div className="space-y-5 max-w-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[#dde2f8]">Idle Session Timeout</span>
                          <select className="bg-[#191f2f] border rounded-lg px-3 py-1.5 text-sm outline-none" style={{ borderColor: "#2f3445", color: "#dde2f8" }}>
                            <option>15 Minutes</option><option>30 Minutes</option><option>60 Minutes</option>
                          </select>
                        </div>
                        <div className="flex justify-between items-center py-2 border-t border-[#2f3445]">
                          <span className="text-sm text-[#dde2f8]">Force Logout on New Device Login</span>
                          <Toggle active={true} />
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-[#2f3445]">
                          <span className="text-sm text-[#dde2f8]">Max Concurrent Sessions</span>
                          <input type="number" defaultValue="1" className="w-16 bg-[#191f2f] border rounded px-3 py-1 text-sm outline-none text-right" style={{ borderColor: "#2f3445", color: "#dde2f8" }} />
                        </div>
                      </div>
                    </div>

                    <div className="glass-panel p-6 rounded-xl">
                      <h4 className="headline-font font-semibold mb-5 flex items-center gap-2 text-lg text-white">
                        <span className="material-symbols-outlined text-[#f0b429]">verified_user</span> Two-Factor Authentication (2FA)
                      </h4>
                      <div className="space-y-4 max-w-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[#dde2f8]">Enforce 2FA for all Admins</span>
                          <Toggle active={true} />
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[#dde2f8]">Enforce 2FA for all Customers</span>
                          <Toggle active={false} />
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-[#2f3445]">
                          <span className="text-sm text-[#dde2f8]">OTP Validity Duration (Mins)</span>
                          <input type="number" defaultValue="5" className="w-16 bg-[#191f2f] border rounded px-3 py-1 text-sm outline-none text-right" style={{ borderColor: "#2f3445", color: "#dde2f8" }} />
                        </div>
                      </div>
                    </div>

                    <div className="glass-panel p-6 rounded-xl">
                      <div className="flex justify-between items-start mb-5">
                        <h4 className="headline-font font-semibold flex items-center gap-2 text-lg text-white">
                          <span className="material-symbols-outlined text-[#f0b429]">router</span> IP Whitelisting
                        </h4>
                        <button className="px-3 py-1 rounded text-xs font-medium border border-[#f0b429] text-[#f0b429] hover:bg-[#242a3a] transition-colors">+ Add IP</button>
                      </div>
                      <div className="flex justify-between items-center mb-4 p-3 rounded bg-[#191f2f] border border-[#2f3445]">
                        <span className="text-sm text-[#dde2f8]">Restrict Admin Console login to whitelisted IPs only</span>
                        <Toggle active={true} />
                      </div>
                      <div className="space-y-2">
                        {["203.0.113.45 (Corporate VPN)", "198.51.100.12 (Mumbai Office)", "192.168.1.100 (Internal)"].map((ip, i) => (
                          <div key={i} className="flex justify-between items-center p-3 rounded border border-[#2f3445] bg-[#151b2b]">
                            <span className="mono-font text-sm text-[#d4c5ad]">{ip}</span>
                            <button className="text-[#ffb4ab] hover:opacity-80"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* --- TAB: LIMITS (Reference) --- */}
                {activeTab === "limits" && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="glass-panel p-6 rounded-xl">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="headline-font font-semibold text-lg text-white">Transaction Limits & Rules</h4>
                        <button className="px-3 py-1.5 rounded text-xs font-bold bg-[#f0b429] text-[#412d00]">Add Custom Rule</button>
                      </div>
                      <table className="w-full text-left text-sm">
                        <thead className="text-xs uppercase text-[#9c8f7a] border-b border-[#2f3445]">
                          <tr><th className="pb-3 font-medium">Limit Type</th><th className="pb-3 font-medium">Amount</th><th className="pb-3 font-medium">Applies To</th><th className="pb-3 font-medium text-right">Status</th></tr>
                        </thead>
                        <tbody className="divide-y divide-[#2f3445]">
                          <tr>
                            <td className="py-4 text-[#dde2f8]">Daily Transfer Limit</td>
                            <td className="py-4"><input type="text" defaultValue="₹ 5,00,000" className="bg-[#191f2f] border border-[#2f3445] rounded px-2 py-1 w-24 outline-none text-[#dde2f8]" /></td>
                            <td className="py-4 text-[#d4c5ad]">All Accounts</td>
                            <td className="py-4 text-right"><Toggle active={true} /></td>
                          </tr>
                          <tr>
                            <td className="py-4 text-[#dde2f8]">Daily ATM Withdrawal</td>
                            <td className="py-4"><input type="text" defaultValue="₹ 50,000" className="bg-[#191f2f] border border-[#2f3445] rounded px-2 py-1 w-24 outline-none text-[#dde2f8]" /></td>
                            <td className="py-4 text-[#d4c5ad]">Standard Tier</td>
                            <td className="py-4 text-right"><Toggle active={true} /></td>
                          </tr>
                          <tr>
                            <td className="py-4 text-[#dde2f8]">International Transfer</td>
                            <td className="py-4"><input type="text" defaultValue="$ 10,000" className="bg-[#191f2f] border border-[#2f3445] rounded px-2 py-1 w-24 outline-none text-[#dde2f8]" /></td>
                            <td className="py-4 text-[#d4c5ad]">Premium Only</td>
                            <td className="py-4 text-right"><Toggle active={false} /></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* --- TAB: FRAUD (Reference) --- */}
                {activeTab === "fraud" && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="glass-panel p-6 rounded-xl">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="headline-font font-semibold text-lg text-white">Fraud Detection Engines</h4>
                        <button className="px-3 py-1.5 rounded text-xs font-bold bg-[#f0b429] text-[#412d00]">Create New Rule</button>
                      </div>
                      <div className="grid gap-4">
                        {fraudRules.map((rule, i) => (
                          <div key={i} className="p-4 rounded-lg border border-[#2f3445] bg-[#151b2b] flex items-center justify-between">
                            <div className="flex-1">
                              <h5 className="font-semibold text-[#dde2f8] mb-1">{rule.name}</h5>
                              <p className="text-xs text-[#9c8f7a]">{rule.desc}</p>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-right">
                                <p className="text-[10px] uppercase text-[#9c8f7a] mb-1">Sensitivity</p>
                                <span className={`text-xs font-medium px-2 py-0.5 rounded ${rule.sensitivity === 'High' ? 'bg-[#ffb4ab]/10 text-[#ffb4ab]' : 'bg-[#f0b429]/10 text-[#f0b429]'}`}>{rule.sensitivity}</span>
                              </div>
                              <Toggle active={rule.active} />
                              <button className="text-[#ffd481] hover:underline text-xs">Edit Logic</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* --- TAB: MAINTENANCE (Reference) --- */}
                {activeTab === "maintenance" && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="glass-panel p-6 rounded-xl border border-[#ffb4ab]/30">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="material-symbols-outlined text-[28px] text-[#ffb4ab]">build_circle</span>
                        <h4 className="headline-font font-bold text-xl text-[#ffb4ab]">System Maintenance Mode</h4>
                      </div>
                      <p className="text-sm text-[#d4c5ad] mb-6">Activating maintenance mode will immediately lock out all customer traffic and show a downtime page. Admins will retain access.</p>
                      
                      <div className="flex items-center justify-between p-4 rounded-lg bg-[#93000a]/10 border border-[#ffb4ab]/20 mb-6">
                        <span className="font-semibold text-[#dde2f8]">Enable Maintenance Mode</span>
                        <button onClick={() => setConfirmModalOpen(true)} className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${maintenanceMode ? "bg-[#ffb4ab]" : "bg-[#2f3445]"}`}>
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${maintenanceMode ? "translate-x-6" : "translate-x-0"}`}></div>
                        </button>
                      </div>

                      <div className="space-y-4 max-w-xl">
                        <div className="grid grid-cols-2 gap-4">
                          <div><label className="block text-xs text-[#9c8f7a] mb-1">Start Time</label><input type="datetime-local" className="w-full bg-[#191f2f] border-[#2f3445] rounded px-3 py-2 text-sm text-[#dde2f8]" /></div>
                          <div><label className="block text-xs text-[#9c8f7a] mb-1">Estimated End Time</label><input type="datetime-local" className="w-full bg-[#191f2f] border-[#2f3445] rounded px-3 py-2 text-sm text-[#dde2f8]" /></div>
                        </div>
                        <div>
                          <label className="block text-xs text-[#9c8f7a] mb-1">Public Maintenance Message</label>
                          <textarea className="w-full h-24 bg-[#191f2f] border-[#2f3445] border rounded px-3 py-2 text-sm text-[#dde2f8] resize-none" defaultValue="FinEdge is currently undergoing scheduled maintenance to improve your experience. We will be back online shortly." />
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-sm text-[#dde2f8]">Notify users via Email/SMS in advance</span>
                          <Toggle active={false} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- TAB: NOTIFICATIONS, API, BACKUP (Placeholders) --- */}
                {(activeTab === "notifications" || activeTab === "api" || activeTab === "backup") && (
                  <div className="glass-panel p-6 rounded-xl animate-in fade-in flex flex-col items-center justify-center min-h-[400px]">
                    <span className="material-symbols-outlined text-[48px] text-[#2f3445] mb-4">construction</span>
                    <h4 className="headline-font text-lg text-[#9c8f7a]">Section content for {settingsTabs.find(t=>t.id===activeTab)?.label}</h4>
                    <p className="text-sm text-[#504534]">This tab is structured but awaits detailed implementation.</p>
                  </div>
                )}

              </div>

              {/* RIGHT SIDEBAR (300px) */}
              <div className="w-full lg:w-[300px] shrink-0 flex flex-col gap-6">
                
                {/* Recent Changes */}
                <div className="glass-panel p-5 rounded-xl">
                  <h4 className="headline-font font-semibold text-sm mb-4 text-[#dde2f8] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#f0b429]">history</span> Recent Changes
                  </h4>
                  <div className="space-y-4">
                    {recentChanges.map(change => (
                      <div key={change.id} className="relative pl-3 border-l-2 border-[#2f3445]">
                        <p className="text-xs text-[#dde2f8] font-medium mb-0.5">{change.setting}</p>
                        <p className="mono-font text-[10px] text-[#9c8f7a]">
                          <span className="line-through">{change.old}</span> → <span className="text-[#57f1db]">{change.new}</span>
                        </p>
                        <p className="text-[10px] text-[#504534] mt-1">{change.admin} • {change.time}</p>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-4 py-1.5 text-xs text-[#ffd481] hover:underline border border-[#2f3445] rounded transition-colors hover:bg-[#151b2b]">View Full Audit Log</button>
                </div>

                {/* System Status */}
                <div className="glass-panel p-5 rounded-xl">
                  <h4 className="headline-font font-semibold text-sm mb-4 text-[#dde2f8] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#57f1db]">monitor_heart</span> System Status
                  </h4>
                  <ul className="space-y-3">
                    {systemStatus.map((sys, i) => (
                      <li key={i} className="flex justify-between items-center text-xs">
                        <span className="text-[#d4c5ad]">{sys.label}</span>
                        <span className="flex items-center gap-1.5 font-medium" style={{ color: sys.color }}>
                          <span className="w-2 h-2 rounded-full" style={{ background: sys.color }}></span> {sys.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Help */}
                <div className="glass-panel p-5 rounded-xl border border-[#2f3445] bg-[#191f2f]/50 text-center">
                  <span className="material-symbols-outlined text-[24px] text-[#9c8f7a] mb-2">help</span>
                  <p className="text-xs text-[#d4c5ad] mb-3">Need help configuring these settings? Check our admin guide.</p>
                  <button className="text-xs text-[#ffd481] font-medium underline">Read Documentation</button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* ── Confirmation Modal ── */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmModalOpen(false)} />
          <div className="relative w-full max-w-sm rounded-xl shadow-2xl p-6 animate-in zoom-in-95" style={{ background: "#151b2b", border: "1px solid #ffb4ab/30" }}>
            <h3 className="headline-font font-bold text-xl mb-2 text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ffb4ab] text-[28px]">warning</span> Confirm Action
            </h3>
            <p className="text-sm text-[#d4c5ad] mb-6">
              Are you sure you want to toggle Maintenance Mode? This will affect all users immediately and take the application offline.
            </p>
            <div className="flex gap-3">
              <button className="flex-1 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-[#242a3a]" style={{ borderColor: "#504534", color: "#d4c5ad" }} onClick={() => setConfirmModalOpen(false)}>
                Cancel
              </button>
              <button className="flex-1 py-2 rounded-lg text-sm font-bold transition-colors hover:opacity-90" style={{ background: "#f0b429", color: "#412d00" }} onClick={() => { setMaintenanceMode(!maintenanceMode); setConfirmModalOpen(false); }}>
                Confirm Change
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
