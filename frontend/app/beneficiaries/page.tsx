"use client";

import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import BeneficiariesHeader from '../../components/beneficiaries/BeneficiariesHeader';
import BeneficiaryGrid from '../../components/beneficiaries/BeneficiaryGrid';
import RecentTransfers from '../../components/beneficiaries/RecentTransfers';
import SendMoneyModal from '../../components/modals/SendMoneyModal';
import AddBeneficiaryModal from '../../components/modals/AddBeneficiaryModal';
import EditBeneficiaryModal from '../../components/modals/EditBeneficiaryModal';
import DeleteBeneficiaryConfirmModal from '../../components/modals/DeleteBeneficiaryConfirmModal';
import { Beneficiary, RecentBeneficiaryTransfer } from '../../types';
import { MockApi } from '../../lib/mockApi';

export default function BeneficiariesPage() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [recentTransfers, setRecentTransfers] = useState<RecentBeneficiaryTransfer[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  // Modals State
  const [sendMoneyModalOpen, setSendMoneyModalOpen] = useState(false);
  const [selectedBenForSend, setSelectedBenForSend] = useState<Beneficiary | null>(null);
  const [sendInitialAmount, setSendInitialAmount] = useState(5000);

  const [addBenModalOpen, setAddBenModalOpen] = useState(false);

  const [editBenModalOpen, setEditBenModalOpen] = useState(false);
  const [selectedBenForEdit, setSelectedBenForEdit] = useState<Beneficiary | null>(null);

  const [deleteBenModalOpen, setDeleteBenModalOpen] = useState(false);
  const [selectedBenForDelete, setSelectedBenForDelete] = useState<Beneficiary | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchBeneficiariesData = async (query = searchQuery, tab = activeTab) => {
    try {
      setLoading(true);
      const data = await MockApi.getBeneficiaries(query, tab);
      setBeneficiaries(data);
      const recents = await MockApi.getRecentBeneficiaryTransfers();
      setRecentTransfers(recents);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeneficiariesData();
  }, [searchQuery, activeTab]);

  const handleOpenSendMoney = (ben: Beneficiary, initialAmt = 5000) => {
    setSelectedBenForSend(ben);
    setSendInitialAmount(initialAmt);
    setSendMoneyModalOpen(true);
  };

  const handleQuickResend = (transfer: RecentBeneficiaryTransfer) => {
    const ben = beneficiaries.find(b => b.id === transfer.beneficiaryId || b.name.toLowerCase().includes(transfer.name.toLowerCase())) || {
      id: transfer.beneficiaryId,
      name: transfer.name,
      bankName: transfer.bankName || "HDFC Bank",
      accountNumber: transfer.accountNumber || "•••• 4411",
      ifsc: "HDFC0001234",
      transferLimit: 500000
    };
    handleOpenSendMoney(ben, transfer.amount);
  };

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      <Sidebar />
      <div className="flex-1 lg:ml-[230px] flex flex-col min-h-screen transition-all duration-300">
        <Header />
        
        <main className="flex-1 p-4 md:p-8 mt-[72px] overflow-y-auto max-w-[1400px] mx-auto w-full relative">
          
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed top-20 right-8 z-[10000] bg-primary text-on-primary font-bold px-4 py-3 rounded-xl shadow-2xl animate-bounce text-xs flex items-center gap-2">
              <span>{toastMessage}</span>
            </div>
          )}

          <BeneficiariesHeader 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onAddBeneficiaryClick={() => setAddBenModalOpen(true)}
          />

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 relative mt-4 mb-6">
            
            {/* Left Column (approx 70% on desktop -> 8 cols) */}
            <div className="col-span-1 xl:col-span-8 flex flex-col gap-6">
              <BeneficiaryGrid 
                beneficiaries={beneficiaries}
                loading={loading}
                onSendMoney={handleOpenSendMoney}
                onEditBeneficiary={(ben) => {
                  setSelectedBenForEdit(ben);
                  setEditBenModalOpen(true);
                }}
                onDeleteBeneficiary={(ben) => {
                  setSelectedBenForDelete(ben);
                  setDeleteBenModalOpen(true);
                }}
              />
            </div>

            {/* Right Column (approx 30% on desktop -> 4 cols) */}
            <div className="col-span-1 xl:col-span-4 flex flex-col gap-6">
              <RecentTransfers 
                transfers={recentTransfers}
                onQuickResend={handleQuickResend}
              />
              
              {/* Quick Actions / Tips */}
              <div className="bg-gradient-to-br from-surface-container-highest to-surface-container border border-primary/20 rounded-xl p-6 relative overflow-hidden shadow-lg">
                <div className="relative z-10 flex flex-col gap-3">
                  <h4 className="text-lg font-semibold m-0 text-primary">Safe Transfers</h4>
                  <p className="text-sm text-on-surface-variant m-0">Always verify the account details before adding a new beneficiary. New beneficiaries have a cooling period of 30 minutes before high-value transfers are unlocked.</p>
                </div>
              </div>
            </div>
            
          </div>
        </main>
      </div>

      {/* MODALS */}
      <SendMoneyModal 
        isOpen={sendMoneyModalOpen}
        onClose={() => setSendMoneyModalOpen(false)}
        beneficiary={selectedBenForSend}
        initialAmount={sendInitialAmount}
        onSuccess={(amt, name) => {
          fetchBeneficiariesData();
          triggerToast(`Successfully transferred ₹${amt.toLocaleString("en-IN")} to ${name}!`);
        }}
      />

      <AddBeneficiaryModal 
        isOpen={addBenModalOpen}
        onClose={() => setAddBenModalOpen(false)}
        onBeneficiaryAdded={(newBen) => {
          fetchBeneficiariesData();
          triggerToast(`Added ${newBen.name} to beneficiaries under 30-min cooling period!`);
        }}
      />

      <EditBeneficiaryModal 
        isOpen={editBenModalOpen}
        onClose={() => setEditBenModalOpen(false)}
        beneficiary={selectedBenForEdit}
        onBeneficiaryUpdated={(updated) => {
          fetchBeneficiariesData();
          triggerToast(`Updated transfer limit for ${updated.name}!`);
        }}
      />

      <DeleteBeneficiaryConfirmModal 
        isOpen={deleteBenModalOpen}
        onClose={() => setDeleteBenModalOpen(false)}
        beneficiary={selectedBenForDelete}
        onBeneficiaryDeleted={() => {
          fetchBeneficiariesData();
          triggerToast("Beneficiary removed successfully!");
        }}
      />

    </div>
  );
}
