"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Wallet, ReceiptText, ArrowLeftRight, 
  CreditCard, Landmark, TrendingUp, UserCheck, 
  Users, ShieldAlert, Bell, BarChart3, ShieldCheck, Headphones
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const getLinkClasses = (path: string) => {
    const isActive = pathname === path;
    return isActive 
      ? "flex items-center px-4 py-3 rounded-xl transition-all group bg-primary-container text-on-primary-container font-medium shadow-[0_0_15px_rgba(240,180,41,0.2)]"
      : "flex items-center px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all";
  };

  return (
    <aside className="fixed hidden lg:flex left-0 top-0 h-full w-[230px] bg-surface-container-low z-50 flex-col">
      <div className="px-6 py-8 flex items-center gap-3">
        <img alt="FinEdge Logo" className="h-8 w-auto object-contain shrink-0" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBA93UJcFlEZSFTrs-M5PKe3T_TmtmlYjPa96Y93tVBUV_UyTwyqG7ib7bWKaCpSBmsg5l4KSFWe4SPdzLzeYNVUWjDjQK6HdYKHVX3Jn1HOQlVeu3B8FfGeRgRevOiGsKnYTGM-388EOt9bZbyw_51OdFq1hbQQPAAwLD_hU4bU6kaQkkvApPF3M5Ztp9D-ND3pfBikbyo7e7XD9h-sIT6NvQ2hiX59wWSEf8cz4iU8vJZExYHw0I4mw"/>
        <span className="font-headline-lg text-[18px] text-primary tracking-tight truncate">FinEdge</span>
      </div>
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto overflow-x-hidden">
        <Link aria-current={pathname === "/" ? "page" : undefined} className={getLinkClasses("/")} href="/">
          <LayoutDashboard className="mr-3 shrink-0" size={18} />
          <span className="text-[13px] truncate">Dashboard</span>
        </Link>
        <Link aria-current={pathname === "/accounts" ? "page" : undefined} className={getLinkClasses("/accounts")} href="/accounts">
          <Wallet className="mr-3 shrink-0" size={18} />
          <span className="text-[13px] truncate">Accounts</span>
        </Link>
        <a className="flex items-center px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all" href="#!">
          <ReceiptText className="mr-3 shrink-0" size={18} />
          <span className="text-[13px] truncate">Transactions</span>
        </a>
        <a className="flex items-center px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all" href="#!">
          <ArrowLeftRight className="mr-3 shrink-0" size={18} />
          <span className="text-[13px] truncate">Transfers</span>
        </a>
        <a className="flex items-center px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all" href="#!">
          <CreditCard className="mr-3 shrink-0" size={18} />
          <span className="text-[13px] truncate">Cards</span>
        </a>
        <a className="flex items-center px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all" href="#!">
          <Landmark className="mr-3 shrink-0" size={18} />
          <span className="text-[13px] truncate">Loans</span>
        </a>
        <a className="flex items-center px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all" href="#!">
          <TrendingUp className="mr-3 shrink-0" size={18} />
          <span className="text-[13px] truncate">Investments</span>
        </a>
        <div className="h-px bg-outline-variant/30 my-4 mx-4"></div>
        <a className="flex items-center px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all" href="#!">
          <UserCheck className="mr-3 shrink-0" size={18} />
          <span className="text-[13px] truncate">KYC &amp; Profile</span>
        </a>
        <a className="flex items-center px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all" href="#!">
          <Users className="mr-3 shrink-0" size={18} />
          <span className="text-[13px] truncate">Beneficiaries</span>
        </a>
        <a className="flex items-center px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all" href="#!">
          <ShieldAlert className="mr-3 shrink-0" size={18} />
          <span className="text-[13px] truncate">Disputes</span>
        </a>
        <a className="flex items-center px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all" href="#!">
          <Bell className="mr-3 shrink-0" size={18} />
          <span className="text-[13px] truncate">Notifications</span>
        </a>
        <a className="flex items-center px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all" href="#!">
          <BarChart3 className="mr-3 shrink-0" size={18} />
          <span className="text-[13px] truncate">Reports &amp; Analytics</span>
        </a>
        <a className="flex items-center px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all" href="#!">
          <ShieldCheck className="mr-3 shrink-0" size={18} />
          <span className="text-[13px] truncate">Admin Panel</span>
        </a>
      </nav>
      <div className="p-6 mt-auto border-t border-white/5">
        <div className="bg-surface-container-high rounded-xl p-4 flex flex-col gap-3 items-center">
          <Headphones className="text-on-surface-variant shrink-0" size={20} />
          <p className="text-[12px] text-on-surface-variant truncate w-full text-center">Need assistance?</p>
          <button className="w-full py-2 bg-primary text-on-primary font-medium rounded-lg hover:shadow-[0_0_10px_rgba(240,180,41,0.4)] transition-all text-[13px] truncate">Contact Support</button>
        </div>
      </div>
    </aside>
  );
}
