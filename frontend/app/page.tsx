"use client";
import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import SummaryCards from '../components/SummaryCards';
import AccountOverview from '../components/AccountOverview';
import QuickActions from '../components/QuickActions';
import RecentTransactions from '../components/RecentTransactions';
import SpendingAnalytics from '../components/SpendingAnalytics';
import PendingApprovals from '../components/PendingApprovals';
import DiscoverMore from '../components/DiscoverMore';
import { AccountProvider, useAccounts } from '../context/AccountContext';
import AccountVerificationDialog from '../components/AccountVerificationDialog';

function DashboardContent() {
  const { verificationStates, requestVerification } = useAccounts();
  const accountIdToVerify = Object.keys(verificationStates).find(id => verificationStates[id] === "VERIFICATION_REQUIRED");

  return (
    <div className="flex-1 flex flex-col lg:pl-[230px] w-full min-h-screen">
      <Header />
      <main className="flex-1 mt-[72px] flex flex-col w-full max-w-[1600px] mx-auto p-6 lg:p-8 gap-6 overflow-x-hidden">
        <SummaryCards />
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch">
          <AccountOverview />
          <QuickActions />
        </section>
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-stretch">
          <RecentTransactions />
          <SpendingAnalytics />
          <PendingApprovals />
        </section>
        <DiscoverMore />
      </main>
      <AccountVerificationDialog 
        accountId={accountIdToVerify || null} 
        onClose={() => requestVerification("") /* will just reset if handled in a better way, but we can do a local clear if needed. Let's fix this in context */} 
      />
    </div>
  );
}

export default function Dashboard() {
  return (
    <AccountProvider>
      <div className="bg-background font-body-md text-on-surface min-h-screen flex">
        <Sidebar />
        <DashboardContent />
      </div>
    </AccountProvider>
  );
}