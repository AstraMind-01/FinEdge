"use client";
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import LoansHeader from '../../components/loans/LoansHeader';
import LoanSummaryStrip from '../../components/loans/LoanSummaryStrip';
import LoanCard from '../../components/loans/LoanCard';
import LoansRightSidebar from '../../components/loans/LoansRightSidebar';
import ExploreLoanProducts from '../../components/loans/ExploreLoanProducts';
import { Loan } from '../../types';
import { MockApi } from '../../lib/mockApi';

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedLoans = await MockApi.getLoans();
        setLoans(fetchedLoans);
      } catch (error) {
        console.error("Error fetching loans data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 lg:ml-[230px] flex flex-col min-h-screen">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      <Sidebar />
      <div className="flex-1 lg:ml-[230px] flex flex-col min-h-screen transition-all duration-300">
        <Header />

        <main className="flex-1 p-4 md:p-8 mt-[72px] overflow-y-auto max-w-[1400px] mx-auto w-full">
          <LoansHeader />
          <LoanSummaryStrip loans={loans} />

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content — Loan Cards */}
            <div className="flex-1 flex flex-col gap-6 min-w-0">
              {loans.map(loan => (
                <LoanCard key={loan.id} loan={loan} />
              ))}
            </div>

            {/* Right Sidebar */}
            <LoansRightSidebar loans={loans} />
          </div>

          <ExploreLoanProducts />
        </main>
      </div>
    </div>
  );
}
