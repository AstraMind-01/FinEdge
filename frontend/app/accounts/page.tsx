"use client";
import React from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import AccountsHeader from '../../components/accounts/AccountsHeader';
import AccountsSummaryStrip from '../../components/accounts/AccountsSummaryStrip';
import AccountList from '../../components/accounts/AccountList';
import AccountsRightSidebar from '../../components/accounts/AccountsRightSidebar';
import AccountTypesFooter from '../../components/accounts/AccountTypesFooter';
import { AccountProvider, useAccounts } from '../../context/AccountContext';
import AccountVerificationDialog from '../../components/AccountVerificationDialog';

function AccountsContent() {
  const { verificationStates, requestVerification } = useAccounts();
  const accountIdToVerify = Object.keys(verificationStates).find(id => verificationStates[id] === "VERIFICATION_REQUIRED");

  return (
    <div className="flex-1 flex flex-col lg:pl-[230px] w-full min-h-screen">
      <Header />
      <main className="flex-1 mt-[72px] flex flex-col w-full max-w-[1600px] mx-auto p-6 lg:p-8 gap-6 overflow-x-hidden">
        <AccountsHeader />
        <AccountsSummaryStrip />
        
        <div className="flex flex-col lg:flex-row gap-6 w-full items-start">
          <div className="flex-1 flex flex-col w-full gap-6">
            <AccountList />
            <AccountTypesFooter />
          </div>
          <AccountsRightSidebar />
        </div>
      </main>
      <AccountVerificationDialog 
        accountId={accountIdToVerify || null} 
        onClose={() => requestVerification("")} 
      />
    </div>
  );
}

export default function AccountsPage() {
  return (
    <AccountProvider>
      <div className="bg-background font-body-md text-on-surface min-h-screen flex">
        <Sidebar />
        <AccountsContent />
      </div>
    </AccountProvider>
  );
}
