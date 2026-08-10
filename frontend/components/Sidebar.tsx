"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Wallet, ReceiptText, ArrowLeftRight, 
  CreditCard, Landmark, TrendingUp, UserCheck, 
  Users, ShieldAlert, Bell, BarChart3, ShieldCheck, Headphones,
  ChevronDown, ChevronUp, Send, CalendarClock, Globe2, PiggyBank
} from 'lucide-react';
import SupportChatModal from './modals/SupportChatModal';

export default function Sidebar() {
  const pathname = usePathname();
  const isTransfersRoute = pathname.startsWith('/transfers');
  const [isTransfersExpanded, setIsTransfersExpanded] = useState<boolean>(true);
  const [isSupportOpen, setIsSupportOpen] = useState<boolean>(false);

  const isMainActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const getLinkClasses = (active: boolean) => {
    return active 
      ? "flex items-center px-4 py-3 rounded-xl transition-all group bg-primary-container text-on-primary-container font-medium shadow-[0_0_15px_rgba(240,180,41,0.2)]"
      : "flex items-center px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all";
  };

  const getSubLinkClasses = (active: boolean) => {
    return active
      ? "flex items-center pl-10 pr-4 py-2.5 rounded-xl text-[13px] font-semibold text-primary transition-all bg-primary/10"
      : "flex items-center pl-10 pr-4 py-2.5 rounded-xl text-[13px] font-medium text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60 transition-all";
  };

  return (
    <>
      <aside className="fixed hidden lg:flex left-0 top-0 h-full w-[230px] bg-surface-container-low z-50 flex-col">
        <div className="px-6 py-8 flex items-center gap-3">
          <img alt="FinEdge Logo" className="h-8 w-auto object-contain shrink-0" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBA93UJcFlEZSFTrs-M5PKe3T_TmtmlYjPa96Y93tVBUV_UyTwyqG7ib7bWKaCpSBmsg5l4KSFWe4SPdzLzeYNVUWjDjQK6HdYKHVX3Jn1HOQlVeu3B8FfGeRgRevOiGsKnYTGM-388EOt9bZbyw_51OdFq1hbQQPAAwLD_hU4bU6kaQkkvApPF3M5Ztp9D-ND3pfBikbyo7e7XD9h-sIT6NvQ2hiX59wWSEf8cz4iU8vJZExYHw0I4mw"/>
          <span className="font-headline-lg text-[18px] text-primary tracking-tight truncate">FinEdge</span>
        </div>
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto overflow-x-hidden">
          {/* Main Navigation */}
          <Link aria-current={pathname === "/" ? "page" : undefined} className={getLinkClasses(isMainActive("/"))} href="/">
            <LayoutDashboard className="mr-3 shrink-0" size={18} />
            <span className="text-[13px] truncate">Dashboard</span>
          </Link>

          <Link aria-current={pathname === "/accounts" ? "page" : undefined} className={getLinkClasses(pathname === "/accounts")} href="/accounts">
            <Wallet className="mr-3 shrink-0" size={18} />
            <span className="text-[13px] truncate">Accounts</span>
          </Link>

          <Link aria-current={pathname === "/transactions" ? "page" : undefined} className={getLinkClasses(pathname === "/transactions")} href="/transactions">
            <ReceiptText className="mr-3 shrink-0" size={18} />
            <span className="text-[13px] truncate">Transactions</span>
          </Link>

          {/* Transfers Accordion Menu */}
          <div className="flex flex-col gap-1">
            <div 
              onClick={() => setIsTransfersExpanded(!isTransfersExpanded)}
              className={`cursor-pointer ${getLinkClasses(isTransfersRoute)} flex items-center justify-between`}
            >
              <div className="flex items-center">
                <ArrowLeftRight className="mr-3 shrink-0" size={18} />
                <span className="text-[13px] font-semibold truncate">Transfers</span>
              </div>
              {isTransfersExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>

            {/* Expanded Sub-links */}
            {isTransfersExpanded && (
              <div className="flex flex-col gap-1 my-1 pl-1">
                <Link className={getSubLinkClasses(pathname === "/transfers/fund-transfer")} href="/transfers/fund-transfer">
                  <Send className="mr-2.5 shrink-0 text-primary/80" size={15} />
                  <span className="truncate">Fund Transfer</span>
                </Link>

                <Link className={getSubLinkClasses(pathname === "/transfers/scheduled")} href="/transfers/scheduled">
                  <CalendarClock className="mr-2.5 shrink-0 text-primary/80" size={15} />
                  <span className="truncate">Scheduled Transfers</span>
                </Link>

                <Link className={getSubLinkClasses(pathname === "/transfers/international")} href="/transfers/international">
                  <Globe2 className="mr-2.5 shrink-0 text-primary/80" size={15} />
                  <span className="truncate">International Transfer</span>
                </Link>
              </div>
            )}
          </div>

          {/* Secondary Services */}
          <Link aria-current={pathname === "/cards" ? "page" : undefined} className={getLinkClasses(pathname === "/cards")} href="/cards">
            <CreditCard className="mr-3 shrink-0" size={18} />
            <span className="text-[13px] truncate">Cards</span>
          </Link>

          <Link aria-current={pathname === "/loans" ? "page" : undefined} className={getLinkClasses(pathname === "/loans")} href="/loans">
            <Landmark className="mr-3 shrink-0" size={18} />
            <span className="text-[13px] truncate">Loans</span>
          </Link>

          <Link aria-current={pathname === "/investments" ? "page" : undefined} className={getLinkClasses(pathname === "/investments")} href="/investments">
            <TrendingUp className="mr-3 shrink-0" size={18} />
            <span className="text-[13px] truncate">Investments</span>
          </Link>

          <Link aria-current={pathname === "/deposits" ? "page" : undefined} className={getLinkClasses(pathname === "/deposits")} href="/deposits">
            <PiggyBank className="mr-3 shrink-0" size={18} />
            <span className="text-[13px] truncate">Deposits</span>
          </Link>

          <div className="h-px bg-outline-variant/30 my-4 mx-4"></div>

          <Link aria-current={pathname === "/kyc-profile" ? "page" : undefined} className={getLinkClasses(pathname === "/kyc-profile")} href="/kyc-profile">
            <UserCheck className="mr-3 shrink-0" size={18} />
            <span className="text-[13px] truncate">KYC &amp; Profile</span>
          </Link>

          <Link aria-current={pathname === "/beneficiaries" ? "page" : undefined} className={getLinkClasses(pathname === "/beneficiaries")} href="/beneficiaries">
            <Users className="mr-3 shrink-0" size={18} />
            <span className="text-[13px] truncate">Beneficiaries</span>
          </Link>

          <Link aria-current={pathname === "/disputes" ? "page" : undefined} className={getLinkClasses(pathname === "/disputes")} href="/disputes">
            <ShieldAlert className="mr-3 shrink-0" size={18} />
            <span className="text-[13px] truncate">Disputes</span>
          </Link>

          <Link aria-current={pathname === "/notifications" ? "page" : undefined} className={getLinkClasses(pathname === "/notifications")} href="/notifications">
            <Bell className="mr-3 shrink-0" size={18} />
            <span className="text-[13px] truncate">Notifications</span>
          </Link>

          <Link aria-current={pathname === "/reports" ? "page" : undefined} className={getLinkClasses(pathname === "/reports")} href="/reports">
            <BarChart3 className="mr-3 shrink-0" size={18} />
            <span className="text-[13px] truncate">Reports &amp; Analytics</span>
          </Link>

          <Link className={getLinkClasses(false)} href="/accounts">
            <ShieldCheck className="mr-3 shrink-0" size={18} />
            <span className="text-[13px] truncate">Admin Panel</span>
          </Link>
        </nav>

        <div className="p-6 mt-auto border-t border-white/5">
          <div className="bg-surface-container-high rounded-xl p-4 flex flex-col gap-3 items-center">
            <Headphones className="text-on-surface-variant shrink-0" size={20} />
            <p className="text-[12px] text-on-surface-variant truncate w-full text-center">Need assistance?</p>
            <button 
              type="button"
              onClick={() => setIsSupportOpen(true)}
              className="w-full py-2 bg-primary text-on-primary font-medium rounded-lg hover:shadow-[0_0_10px_rgba(240,180,41,0.4)] transition-all text-[13px] truncate"
            >
              Contact Support
            </button>
          </div>
        </div>
      </aside>

      <SupportChatModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />
    </>
  );
}
