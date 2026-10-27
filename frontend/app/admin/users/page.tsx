"use client";

import React, { useState } from "react";
import Link from "next/link";

// ---------- Data ----------
const summaryCards = [
  {
    label: "Total Users",
    value: "1,24,582",
    trend: "+2.4% this month",
    trendUp: true,
    icon: "group",
    iconColor: "text-[#c6bfff]",
    iconBg: "bg-[#4331b4]/20",
    borderColor: "",
  },
  {
    label: "Active Users",
    value: "98,241",
    trend: "+1.2% this month",
    trendUp: true,
    icon: "how_to_reg",
    iconColor: "text-[#57f1db]",
    iconBg: "bg-[#2dd4bf]/20",
    borderColor: "border-b-2 border-[#57f1db]",
  },
  {
    label: "Suspended/Blocked",
    value: "452",
    trend: "-5% this month",
    trendUp: false,
    icon: "block",
    iconColor: "text-[#ffb4ab]",
    iconBg: "bg-[#93000a]/20",
    borderColor: "border-b-2 border-[#ffb4ab]",
  },
  {
    label: "Pending KYC",
    value: "1,205",
    trend: "Requires review",
    trendUp: null,
    icon: "pending_actions",
    iconColor: "text-[#f0b429]",
    iconBg: "bg-[#f0b429]/20",
    borderColor: "border-b-2 border-[#f0b429]",
  },
  {
    label: "New Signups Today",
    value: "342",
    trend: "+12% vs yesterday",
    trendUp: true,
    icon: "person_add",
    iconColor: "text-[#ffd481]",
    iconBg: "bg-[#f0b429]/10",
    borderColor: "",
  },
];

type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "Active" | "Suspended" | "Dormant" | "Closed";
  kyc: "Verified" | "Pending" | "Rejected";
  balance: string;
  regDate: string;
  lastLogin: string;
  avatar: string;
  type: string;
};

const mockUsers: User[] = [
  { id: "CUST-8832", name: "Rohan Sharma", email: "rohan.s@example.com", phone: "+91 98765 43210", status: "Active", kyc: "Verified", balance: "₹ 4,50,000", regDate: "12 Jan 2024", lastLogin: "Today, 10:45 AM", avatar: "RS", type: "Premium" },
  { id: "CUST-8831", name: "Priya Desai", email: "priya.d@example.com", phone: "+91 87654 32109", status: "Pending", kyc: "Pending", balance: "₹ 15,000", regDate: "11 Aug 2024", lastLogin: "Today, 09:12 AM", avatar: "PD", type: "Savings" },
  { id: "CUST-8830", name: "Amit Verma", email: "amit.v@example.com", phone: "+91 76543 21098", status: "Suspended", kyc: "Rejected", balance: "₹ 2,10,000", regDate: "05 Mar 2023", lastLogin: "10 Aug 2024, 11:30 PM", avatar: "AV", type: "Current" },
  { id: "CUST-8829", name: "Neha Gupta", email: "neha.g@example.com", phone: "+91 65432 10987", status: "Active", kyc: "Verified", balance: "₹ 8,90,500", regDate: "22 Nov 2023", lastLogin: "Yesterday, 04:20 PM", avatar: "NG", type: "Premium" },
  { id: "CUST-8828", name: "Vikram Singh", email: "vikram.s@example.com", phone: "+91 54321 09876", status: "Dormant", kyc: "Verified", balance: "₹ 5,200", regDate: "15 Jul 2022", lastLogin: "01 Jan 2024, 08:00 AM", avatar: "VS", type: "Savings" },
  { id: "CUST-8827", name: "Ananya Patel", email: "ananya.p@example.com", phone: "+91 43210 98765", status: "Active", kyc: "Verified", balance: "₹ 1,25,000", regDate: "30 May 2024", lastLogin: "Today, 07:15 AM", avatar: "AP", type: "Savings" },
  { id: "CUST-8826", name: "Rahul Kapoor", email: "rahul.k@example.com", phone: "+91 32109 87654", status: "Active", kyc: "Pending", balance: "₹ 45,000", regDate: "09 Aug 2024", lastLogin: "Yesterday, 09:45 PM", avatar: "RK", type: "Savings" },
];

const navItems = [
  { icon: "dashboard",     label: "Dashboard Overview",    href: "/admin",             active: false },
  { icon: "group",         label: "User Management",       href: "/admin/users",       active: true },
  { icon: "receipt_long",  label: "Transaction Monitoring",href: "/admin/transactions",active: false },
  { icon: "report_problem",label: "Fraud Alerts",          href: "/admin/fraud-alerts",active: false },
  { icon: "verified_user", label: "KYC Approvals",         href: "/admin/kyc-approvals",active: false },
  { icon: "settings",      label: "System Settings",       href: "/admin/settings",    active: false },
  { icon: "bar_chart",     label: "Reports",               href: "/admin/reports",     active: false },
];

// ---------- Components ----------

function StatusBadge({ status, type }: { status: string, type: "account" | "kyc" }) {
  let bg = "", text = "", border = "", icon = "";

  if (status === "Active" || status === "Verified") {
    bg = "bg-[#57f1db]/10"; text = "text-[#57f1db]"; border = "border-[#57f1db]/20";
    icon = type === "kyc" ? "verified" : "check_circle";
  } else if (status === "Suspended" || status === "Rejected" || status === "Closed") {
    bg = "bg-[#ffb4ab]/10"; text = "text-[#ffb4ab]"; border = "border-[#ffb4ab]/20";
    icon = type === "kyc" ? "gavel" : "block";
  } else if (status === "Pending") {
    bg = "bg-[#f0b429]/10"; text = "text-[#f0b429]"; border = "border-[#f0b429]/20";
    icon = "schedule";
  } else { // Dormant
    bg = "bg-[#d4c5ad]/10"; text = "text-[#d4c5ad]"; border = "border-[#d4c5ad]/20";
    icon = "snooze";
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${bg} ${text} ${border}`}>
      <span className="material-symbols-outlined text-[12px]">{icon}</span> {status}
    </span>
  );
}

// ---------- Main Page ----------
export default function UserManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [quickViewUser, setQuickViewUser] = useState<User | null>(null);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(mockUsers.map(u => u.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectUser = (id: string) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter(u => u !== id));
      setSelectAll(false);
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  return (
    <div
      className="min-h-screen flex overflow-x-hidden antialiased"
      style={{ background: "#0d1322", color: "#dde2f8", fontFamily: "Inter, sans-serif" }}
    >
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
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                    item.active ? "font-bold border-r-4" : "hover:opacity-80"
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
              <Link href="/login" className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors hover:opacity-80" style={{ color: "#ffb4ab" }}>
                <span className="material-symbols-outlined text-[18px]">logout</span> Logout
              </Link>
            </li>
          </ul>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col" style={{ marginLeft: 0 }}>
        <div className="md:ml-[280px]">

          {/* Header */}
          <header
            className="fixed top-0 right-0 h-16 flex justify-between items-center px-8 z-30"
            style={{ width: "100%", background: "rgba(13,19,34,0.7)", backdropFilter: "blur(20px)", borderBottom: "1px solid #2f3445", left: 0 }}
          >
            <div className="flex items-center gap-4 md:ml-[280px]">
              <button className="md:hidden" onClick={() => setSidebarOpen(true)} style={{ color: "#ffd481" }}>
                <span className="material-symbols-outlined">menu</span>
              </button>
              <h2 className="headline-font font-bold hidden md:block" style={{ color: "#ffd481", fontSize: 18 }}>Admin Console</h2>
            </div>
            <div className="flex items-center gap-5 mr-0">
              <div className="relative hidden sm:block">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px]" style={{ color: "#9c8f7a" }}>search</span>
                <input
                  type="text"
                  placeholder="Search accounts, txns..."
                  className="rounded-full py-1.5 pl-10 pr-4 text-sm outline-none transition-all"
                  style={{ background: "#242a3a", border: "1px solid #2f3445", color: "#dde2f8", width: 240 }}
                />
              </div>
              <button className="relative" style={{ color: "#ffd481" }}>
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                <span className="absolute top-0 right-0 w-2 h-2 rounded-full ring-2" style={{ background: "#ffb4ab", ringColor: "#0d1322" }} />
              </button>
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
                <h3 className="headline-font font-bold mb-1" style={{ color: "#ffffff", fontSize: 28 }}>User Management</h3>
                <p className="text-sm" style={{ color: "#9c8f7a" }}>View, manage, and support all registered customers</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[#242a3a]" style={{ border: "1px solid #504534", color: "#d4c5ad" }}>
                  <span className="material-symbols-outlined text-[18px]">download</span> Export List
                </button>
                <button 
                  onClick={() => setIsAddUserModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors hover:opacity-90 shadow-[0_0_15px_rgba(240,180,41,0.2)]" 
                  style={{ background: "#f0b429", color: "#412d00" }}
                >
                  <span className="material-symbols-outlined text-[18px]">person_add</span> Add New User
                </button>
              </div>
            </div>

            {/* Summary Strip */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              {summaryCards.map((card) => (
                <div key={card.label} className={`glass-panel p-5 rounded-xl flex flex-col justify-between glow-hover transition-all ${card.borderColor}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="mono-font text-[11px] uppercase tracking-wider font-medium" style={{ color: "#d4c5ad" }}>{card.label}</span>
                    <div className={`w-7 h-7 rounded flex items-center justify-center ${card.iconBg} ${card.iconColor}`}>
                      <span className="material-symbols-outlined text-[16px]">{card.icon}</span>
                    </div>
                  </div>
                  <div>
                    <div className="headline-font font-bold text-2xl mb-1" style={{ color: "#dde2f8" }}>{card.value}</div>
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
              <div className="flex flex-1 items-center gap-3 w-full max-w-lg relative">
                <span className="material-symbols-outlined absolute left-3 text-[18px]" style={{ color: "#9c8f7a" }}>search</span>
                <input
                  type="text"
                  placeholder="Search by name, customer ID, email, or phone number..."
                  className="w-full rounded-lg py-2 pl-10 pr-4 text-sm outline-none transition-all"
                  style={{ background: "#191f2f", border: "1px solid #2f3445", color: "#dde2f8" }}
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <select className="rounded-lg py-2 px-3 text-sm outline-none cursor-pointer appearance-none pr-8 relative" style={{ background: "#191f2f", border: "1px solid #2f3445", color: "#d4c5ad" }}>
                  <option>Account Status</option>
                  <option>Active</option>
                  <option>Suspended</option>
                  <option>Dormant</option>
                </select>
                <select className="rounded-lg py-2 px-3 text-sm outline-none cursor-pointer appearance-none pr-8" style={{ background: "#191f2f", border: "1px solid #2f3445", color: "#d4c5ad" }}>
                  <option>KYC Status</option>
                  <option>Verified</option>
                  <option>Pending</option>
                  <option>Rejected</option>
                </select>
                <div className="h-6 w-px mx-1" style={{ background: "#2f3445" }}></div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors hover:bg-[#242a3a]" style={{ borderColor: "#2f3445", color: "#9c8f7a" }}>Premium Customers</button>
                  <button className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors bg-[#ffb4ab]/10 text-[#ffb4ab]" style={{ borderColor: "#ffb4ab/20" }}>Flagged Accounts</button>
                </div>
                <div className="h-6 w-px mx-1" style={{ background: "#2f3445" }}></div>
                <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "#2f3445" }}>
                  <button className="p-1.5 bg-[#2f3445] text-[#ffd481]"><span className="material-symbols-outlined text-[18px]">table_rows</span></button>
                  <button className="p-1.5 text-[#9c8f7a] hover:bg-[#242a3a]"><span className="material-symbols-outlined text-[18px]">grid_view</span></button>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="glass-panel rounded-xl overflow-hidden flex flex-col relative min-h-[500px]">
              
              {/* Bulk Action Bar (shows when items are selected) */}
              {selectedUsers.length > 0 && (
                <div className="absolute top-0 left-0 right-0 h-14 z-20 flex items-center justify-between px-6" style={{ background: "#f0b429", color: "#412d00" }}>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    <span className="font-bold">{selectedUsers.length} users selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 rounded text-xs font-bold transition-colors bg-[#412d00]/10 hover:bg-[#412d00]/20 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">block</span> Suspend
                    </button>
                    <button className="px-3 py-1.5 rounded text-xs font-bold transition-colors bg-[#412d00]/10 hover:bg-[#412d00]/20 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">mail</span> Message
                    </button>
                    <button className="px-3 py-1.5 rounded text-xs font-bold transition-colors bg-[#412d00]/10 hover:bg-[#412d00]/20 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">download</span> Export
                    </button>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead className="sticky top-0 z-10" style={{ background: "#242a3a" }}>
                    <tr>
                      <th className="px-4 py-4 w-10">
                        <input type="checkbox" checked={selectAll} onChange={handleSelectAll} className="w-4 h-4 rounded border-[#504534] bg-[#0d1322] accent-[#f0b429] cursor-pointer" />
                      </th>
                      {["Customer", "Contact", "Account Status", "KYC Status", "Balance", "Registered", "Last Login", ""].map((h) => (
                        <th key={h} className={`px-4 py-4 mono-font text-xs uppercase tracking-wider font-medium ${h === "Balance" ? "text-right" : ""}`} style={{ color: "#9c8f7a" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mockUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="transition-colors group hover:bg-[#2f3445]/40"
                        style={{ borderBottom: "1px solid #2f3445", background: selectedUsers.includes(user.id) ? "rgba(240,180,41,0.05)" : "transparent" }}
                      >
                        <td className="px-4 py-4">
                          <input 
                            type="checkbox" 
                            checked={selectedUsers.includes(user.id)} 
                            onChange={() => handleSelectUser(user.id)} 
                            className="w-4 h-4 rounded border-[#504534] bg-[#0d1322] accent-[#f0b429] cursor-pointer" 
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#33394a", color: "#ffd481" }}>
                              {user.avatar}
                            </div>
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="font-semibold text-sm" style={{ color: "#dde2f8" }}>{user.name}</span>
                                {user.kyc === "Verified" && <span className="material-symbols-outlined fill-icon text-[14px]" style={{ color: "#57f1db" }}>verified</span>}
                              </div>
                              <span className="mono-font text-[10px]" style={{ color: "#9c8f7a" }}>{user.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-xs" style={{ color: "#dde2f8" }}>{user.email}</div>
                          <div className="text-[10px] mt-0.5" style={{ color: "#9c8f7a" }}>{user.phone}</div>
                        </td>
                        <td className="px-4 py-4"><StatusBadge status={user.status} type="account" /></td>
                        <td className="px-4 py-4"><StatusBadge status={user.kyc} type="kyc" /></td>
                        <td className="px-4 py-4 mono-font text-sm font-medium text-right" style={{ color: "#dde2f8" }}>{user.balance}</td>
                        <td className="px-4 py-4 text-xs" style={{ color: "#d4c5ad" }}>{user.regDate}</td>
                        <td className="px-4 py-4 text-xs" style={{ color: "#d4c5ad" }}>{user.lastLogin}</td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setQuickViewUser(user)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#33394a] transition-colors text-[#ffd481]" title="View Profile">
                              <span className="material-symbols-outlined text-[18px]">visibility</span>
                            </button>
                            <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#33394a] transition-colors text-[#d4c5ad]" title="Edit">
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#33394a] transition-colors text-[#d4c5ad]" title="More">
                              <span className="material-symbols-outlined text-[18px]">more_vert</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: "1px solid #2f3445", background: "rgba(36,42,58,0.5)" }}>
                <span className="text-xs" style={{ color: "#9c8f7a" }}>Showing 1-7 of 1,24,582 users</span>
                <div className="flex gap-1">
                  <button className="w-7 h-7 rounded border flex items-center justify-center transition-colors hover:bg-[#33394a]" style={{ borderColor: "#2f3445", color: "#d4c5ad" }}>
                    <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                  </button>
                  <button className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold" style={{ background: "#f0b429", color: "#412d00" }}>1</button>
                  <button className="w-7 h-7 rounded flex items-center justify-center text-xs hover:bg-[#33394a]" style={{ color: "#d4c5ad" }}>2</button>
                  <button className="w-7 h-7 rounded flex items-center justify-center text-xs hover:bg-[#33394a]" style={{ color: "#d4c5ad" }}>3</button>
                  <button className="w-7 h-7 rounded border flex items-center justify-center transition-colors hover:bg-[#33394a]" style={{ borderColor: "#2f3445", color: "#d4c5ad" }}>
                    <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* ── Profile Quick View (Side Panel) ── */}
      {quickViewUser && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setQuickViewUser(null)} />
          <div className="relative w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right" style={{ background: "#111827", borderLeft: "1px solid #2f3445" }}>
            
            {/* Drawer Header */}
            <div className="px-6 py-5 flex justify-between items-start" style={{ borderBottom: "1px solid #2f3445" }}>
              <div className="flex gap-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shadow-lg" style={{ background: "#f0b429", color: "#412d00" }}>
                  {quickViewUser.avatar}
                </div>
                <div>
                  <h3 className="headline-font font-bold text-lg leading-tight flex items-center gap-1" style={{ color: "#ffffff" }}>
                    {quickViewUser.name}
                    {quickViewUser.kyc === "Verified" && <span className="material-symbols-outlined fill-icon text-[16px]" style={{ color: "#57f1db" }}>verified</span>}
                  </h3>
                  <p className="mono-font text-xs mt-1" style={{ color: "#9c8f7a" }}>{quickViewUser.id}</p>
                  <div className="flex gap-2 mt-2">
                    <StatusBadge status={quickViewUser.status} type="account" />
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border" style={{ background: "#c6bfff/10", color: "#c6bfff", borderColor: "#c6bfff/20" }}>{quickViewUser.type}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setQuickViewUser(null)} className="text-[#9c8f7a] hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Action Bar */}
            <div className="px-6 py-3 flex gap-2" style={{ background: "#191f2f", borderBottom: "1px solid #2f3445" }}>
              <button className="flex-1 py-2 rounded text-xs font-semibold border transition-colors hover:bg-[#242a3a]" style={{ borderColor: "#504534", color: "#dde2f8" }}>Message</button>
              <button className="flex-1 py-2 rounded text-xs font-semibold border transition-colors hover:bg-[#242a3a]" style={{ borderColor: "#504534", color: "#dde2f8" }}>Reset PW</button>
              <button className="flex-1 py-2 rounded text-xs font-semibold border transition-colors bg-[#93000a]/20 text-[#ffb4ab] border-[#ffb4ab]/30 hover:bg-[#93000a]/40">Suspend</button>
            </div>

            {/* Drawer Body Tabs */}
            <div className="flex px-6 border-b" style={{ borderColor: "#2f3445" }}>
              {["Overview", "Transactions", "Documents", "Notes"].map((tab, i) => (
                <button key={tab} className={`py-3 mr-6 text-sm font-medium ${i === 0 ? "border-b-2" : "opacity-60 hover:opacity-100"}`} style={i === 0 ? { color: "#ffd481", borderColor: "#f0b429" } : { color: "#d4c5ad" }}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Contact Info */}
              <div className="space-y-3">
                <h4 className="mono-font text-[11px] uppercase tracking-wider font-semibold" style={{ color: "#9c8f7a" }}>Contact Information</h4>
                <div className="glass-panel p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-[18px]" style={{ color: "#d4c5ad" }}>mail</span>
                    <span style={{ color: "#dde2f8" }}>{quickViewUser.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="material-symbols-outlined text-[18px]" style={{ color: "#d4c5ad" }}>call</span>
                    <span style={{ color: "#dde2f8" }}>{quickViewUser.phone}</span>
                  </div>
                </div>
              </div>

              {/* Financials */}
              <div className="space-y-3">
                <h4 className="mono-font text-[11px] uppercase tracking-wider font-semibold" style={{ color: "#9c8f7a" }}>Financial Summary</h4>
                <div className="glass-panel p-4 rounded-lg flex justify-between items-center" style={{ borderLeft: "3px solid #f0b429" }}>
                  <div>
                    <p className="text-xs" style={{ color: "#d4c5ad" }}>Total Balance</p>
                    <p className="headline-font font-bold text-xl mt-1" style={{ color: "#ffffff" }}>{quickViewUser.balance}</p>
                  </div>
                  <button className="text-xs flex items-center gap-1 font-medium" style={{ color: "#ffd481" }}>
                    View Accounts <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  </button>
                </div>
              </div>

              {/* Security Activity */}
              <div className="space-y-3">
                <h4 className="mono-font text-[11px] uppercase tracking-wider font-semibold" style={{ color: "#9c8f7a" }}>Security & Activity</h4>
                <div className="glass-panel p-4 rounded-lg space-y-3">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "#9c8f7a" }}>KYC Status</span>
                    <span className="font-medium" style={{ color: quickViewUser.kyc === "Verified" ? "#57f1db" : "#f0b429" }}>{quickViewUser.kyc}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "#9c8f7a" }}>Registered</span>
                    <span style={{ color: "#dde2f8" }}>{quickViewUser.regDate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "#9c8f7a" }}>Last Login</span>
                    <span style={{ color: "#dde2f8" }}>{quickViewUser.lastLogin}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── Add User Modal ── */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddUserModalOpen(false)} />
          <div className="relative w-full max-w-lg glass-panel rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95" style={{ background: "#111827", border: "1px solid #2f3445" }}>
            
            <div className="px-6 py-4 flex justify-between items-center" style={{ borderBottom: "1px solid #2f3445", background: "#191f2f" }}>
              <h3 className="headline-font font-bold text-lg flex items-center gap-2" style={{ color: "#ffffff" }}>
                <span className="material-symbols-outlined" style={{ color: "#f0b429" }}>person_add</span> Register New User
              </h3>
              <button onClick={() => setIsAddUserModalOpen(false)} className="text-[#9c8f7a] hover:text-white">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium" style={{ color: "#d4c5ad" }}>Full Name</label>
                  <input type="text" placeholder="e.g. Arjun Mehta" className="w-full bg-[#0d1322] border border-[#2f3445] rounded-lg px-3 py-2 text-sm text-[#dde2f8] outline-none focus:border-[#f0b429] transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium" style={{ color: "#d4c5ad" }}>Mobile Number</label>
                  <input type="text" placeholder="+91" className="w-full bg-[#0d1322] border border-[#2f3445] rounded-lg px-3 py-2 text-sm text-[#dde2f8] outline-none focus:border-[#f0b429] transition-colors" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: "#d4c5ad" }}>Email Address</label>
                <input type="email" placeholder="arjun@example.com" className="w-full bg-[#0d1322] border border-[#2f3445] rounded-lg px-3 py-2 text-sm text-[#dde2f8] outline-none focus:border-[#f0b429] transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium" style={{ color: "#d4c5ad" }}>Account Type</label>
                <select className="w-full bg-[#0d1322] border border-[#2f3445] rounded-lg px-3 py-2 text-sm text-[#dde2f8] outline-none focus:border-[#f0b429] transition-colors appearance-none">
                  <option>Premium Savings Account</option>
                  <option>Standard Savings Account</option>
                  <option>Business Current Account</option>
                </select>
              </div>
              
              <div className="mt-4 p-4 rounded-lg border border-dashed border-[#504534] bg-[#191f2f] text-center cursor-pointer hover:border-[#f0b429] transition-colors">
                <span className="material-symbols-outlined text-[24px] mb-2" style={{ color: "#9c8f7a" }}>cloud_upload</span>
                <p className="text-sm font-medium" style={{ color: "#dde2f8" }}>Upload KYC Documents</p>
                <p className="text-xs mt-1" style={{ color: "#9c8f7a" }}>PAN Card, Aadhaar (Max 5MB)</p>
              </div>
            </div>

            <div className="px-6 py-4 flex justify-end gap-3" style={{ borderTop: "1px solid #2f3445", background: "#191f2f" }}>
              <button onClick={() => setIsAddUserModalOpen(false)} className="px-4 py-2 text-sm font-medium hover:underline" style={{ color: "#d4c5ad" }}>Cancel</button>
              <button onClick={() => setIsAddUserModalOpen(false)} className="px-5 py-2 rounded-lg text-sm font-bold shadow-lg" style={{ background: "#f0b429", color: "#412d00" }}>Create User</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
