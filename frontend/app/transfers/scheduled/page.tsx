"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '../../../components/Sidebar';
import Header from '../../../components/Header';
import ScheduledTransfersHeader from '../../../components/transfers/scheduled/ScheduledTransfersHeader';
import ScheduledTransfersSummary from '../../../components/transfers/scheduled/ScheduledTransfersSummary';
import ScheduledTransfersFilterBar from '../../../components/transfers/scheduled/ScheduledTransfersFilterBar';
import ScheduledTransfersList from '../../../components/transfers/scheduled/ScheduledTransfersList';
import ScheduledTransfersRightSidebar from '../../../components/transfers/scheduled/ScheduledTransfersRightSidebar';
import ScheduleTransferModal from '../../../components/transfers/scheduled/ScheduleTransferModal';
import { Account, Beneficiary, ScheduledTransfer } from '../../../types';
import { MockApi } from '../../../lib/mockApi';
import { Skeleton } from '../../../components/ui/skeleton';
import { AccountProvider } from '../../../context/AccountContext';

function ScheduledTransfersContent() {
  const [transfers, setTransfers] = useState<ScheduledTransfer[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPurpose, setModalPurpose] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const [sched, accs, bens] = await Promise.all([
        MockApi.getScheduledTransfers(),
        MockApi.getAccounts(),
        MockApi.getBeneficiaries()
      ]);
      setTransfers(sched);
      setAccounts(accs);
      setBeneficiaries(bens);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleQuickSchedule = (purpose: string) => {
    setModalPurpose(purpose);
    setIsModalOpen(true);
  };

  const handleScheduleNew = () => {
    setModalPurpose("");
    setIsModalOpen(true);
  };

  const filteredTransfers = transfers.filter(t => {
    const matchesSearch = t.beneficiaryName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.purpose.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (activeTab === "Upcoming") return t.status === 'ACTIVE' && new Date(t.nextDate) >= new Date();
    if (activeTab === "Recurring") return t.isRecurring;
    if (activeTab === "One-Time") return !t.isRecurring;
    if (activeTab === "Paused") return t.status === 'PAUSED';
    if (activeTab === "Failed") return t.status === 'FAILED';
    
    return true; // "All"
  });

  return (
    <div className="flex-1 flex flex-col lg:pl-[230px] w-full min-h-screen">
      <Header />
      <main className="flex-1 mt-[72px] flex flex-col w-full max-w-[1600px] mx-auto p-6 lg:p-8 gap-6 overflow-x-hidden">
        
        <ScheduledTransfersHeader onScheduleNew={handleScheduleNew} />
        
        {isLoading ? (
          <div className="flex flex-col gap-6 w-full">
            <Skeleton className="h-[120px] w-full rounded-xl" />
            <div className="flex flex-col lg:flex-row gap-6">
              <Skeleton className="flex-1 h-[500px] rounded-xl" />
              <Skeleton className="w-full lg:w-[320px] xl:w-[380px] h-[500px] rounded-xl" />
            </div>
          </div>
        ) : (
          <>
            <ScheduledTransfersSummary transfers={transfers} />
            
            <div className="flex flex-col lg:flex-row gap-6 w-full items-start">
              <div className="flex-1 flex flex-col w-full gap-4">
                <ScheduledTransfersFilterBar 
                  activeTab={activeTab} 
                  setActiveTab={setActiveTab} 
                  searchQuery={searchQuery} 
                  setSearchQuery={setSearchQuery} 
                />
                <ScheduledTransfersList transfers={filteredTransfers} />
              </div>
              
              <ScheduledTransfersRightSidebar 
                transfers={transfers} 
                onQuickSchedule={handleQuickSchedule} 
              />
            </div>

            <ScheduleTransferModal 
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              accounts={accounts}
              beneficiaries={beneficiaries}
              initialPurpose={modalPurpose}
            />
          </>
        )}

      </main>
    </div>
  );
}

export default function ScheduledTransfersPage() {
  return (
    <AccountProvider>
      <div className="bg-background font-body-md text-on-surface min-h-screen flex">
        <Sidebar />
        <ScheduledTransfersContent />
      </div>
    </AccountProvider>
  );
}
