import React from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { ChevronRight, Edit3 } from 'lucide-react';
import Link from 'next/link';
import ProfileOverview from '../../components/kyc/ProfileOverview';
import KycVerification from '../../components/kyc/KycVerification';
import PersonalInfo from '../../components/kyc/PersonalInfo';
import AddressDetails from '../../components/kyc/AddressDetails';
import SecurityAndDevices from '../../components/kyc/SecurityAndDevices';
import VerificationJourney from '../../components/kyc/VerificationJourney';

export default function KycProfilePage() {
  return (
    <div className="flex min-h-screen bg-background text-on-surface">
      <Sidebar />
      <div className="flex-1 lg:ml-[230px] flex flex-col min-h-screen transition-all duration-300">
        <Header />
        
        <main className="flex-1 p-4 md:p-8 mt-[72px] overflow-y-auto max-w-[1400px] mx-auto w-full">
          
          {/* Breadcrumb & Header */}
          <div className="pt-4 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-2 tracking-wider uppercase font-medium">
                <span className="hover:text-primary transition-colors cursor-pointer">Settings</span>
                <ChevronRight size={14} />
                <span className="text-primary font-bold">KYC & Profile</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-on-surface m-0 leading-tight">KYC & Profile</h1>
              <p className="text-base text-on-surface-variant mt-2">Manage your personal information and verification status</p>
            </div>
            
            <button className="group flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border border-outline-variant hover:border-primary text-on-surface-variant hover:text-primary transition-all duration-300 relative overflow-hidden bg-surface-container/50 backdrop-blur-sm shadow-md hover:shadow-[0_0_15px_rgba(240,180,41,0.2)]">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              <Edit3 size={20} className="relative z-10" />
              <span className="font-semibold text-sm relative z-10">Edit Profile</span>
            </button>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 relative mb-6">
            
            {/* Left Column (approx 65% on desktop -> 8 cols) */}
            <div className="col-span-1 xl:col-span-8 flex flex-col gap-6">
              <ProfileOverview />
              <KycVerification />
              <PersonalInfo />
              <AddressDetails />
            </div>

            {/* Right Column (approx 35% on desktop -> 4 cols) */}
            <div className="col-span-1 xl:col-span-4 flex flex-col gap-6">
              <SecurityAndDevices />
            </div>
            
          </div>

          {/* Bottom Section: Verification Journey */}
          <div className="mb-8">
            <VerificationJourney />
          </div>

        </main>
      </div>
    </div>
  );
}
