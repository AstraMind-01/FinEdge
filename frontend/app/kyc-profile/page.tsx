"use client";

import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Sidebar from '../../components/Sidebar';
import { ChevronRight, Edit3, BadgeIcon, CreditCard, Home, FileText, User, PenTool } from 'lucide-react';
import ProfileOverview from '../../components/kyc/ProfileOverview';
import KycVerification from '../../components/kyc/KycVerification';
import PersonalInfo from '../../components/kyc/PersonalInfo';
import AddressDetails from '../../components/kyc/AddressDetails';
import SecurityAndDevices from '../../components/kyc/SecurityAndDevices';
import VerificationJourney from '../../components/kyc/VerificationJourney';
import { AccountProvider } from '../../context/AccountContext';
import EditProfileModal from '../../components/modals/EditProfileModal';
import EditProfilePhotoModal from '../../components/modals/EditProfilePhotoModal';
import KycDocumentViewerModal from '../../components/modals/KycDocumentViewerModal';
import UpdateKycDocumentModal from '../../components/modals/UpdateKycDocumentModal';

import UpdateNomineeModal from '../../components/modals/UpdateNomineeModal';
import UpdateAddressModal from '../../components/modals/UpdateAddressModal';
import ReKycWizardModal from '../../components/modals/ReKycWizardModal';
import { UserAddress, VerificationEvent } from '../../types';
import { MockApi } from '../../lib/mockApi';

import { useAccounts } from '../../context/AccountContext';

export default function KycProfilePage() {
  const { userProfile, updateUserProfile } = useAccounts();

  const [nominee, setNominee] = useState({
    name: "Anjali Ranjan",
    relationship: "Spouse",
    share: "100% Share"
  });

  const [documents, setDocuments] = useState([
    { icon: BadgeIcon, title: "Aadhaar Card", status: "Verified" },
    { icon: CreditCard, title: "PAN Card", status: "Verified" },
    { icon: Home, title: "Address Proof", status: "Verified" },
    { icon: FileText, title: "Income Proof", status: "Pending" },
    { icon: User, title: "Photograph", status: "Verified" },
    { icon: PenTool, title: "Signature", status: "Verified" },
  ]);

  const [addressData, setAddressData] = useState<UserAddress | undefined>(undefined);
  const [verificationEvents, setVerificationEvents] = useState<VerificationEvent[]>([]);

  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [editPhotoModalOpen, setEditPhotoModalOpen] = useState(false);
  const [docViewerModalOpen, setDocViewerModalOpen] = useState(false);
  const [updateDocModalOpen, setUpdateDocModalOpen] = useState(false);
  const [updateNomineeModalOpen, setUpdateNomineeModalOpen] = useState(false);
  const [updateAddressModalOpen, setUpdateAddressModalOpen] = useState(false);
  const [reKycWizardModalOpen, setReKycWizardModalOpen] = useState(false);

  const [selectedDocTitle, setSelectedDocTitle] = useState("Aadhaar Card");
  const [selectedDocStatus, setSelectedDocStatus] = useState("Verified");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    async function loadBackendData() {
      const addr = await MockApi.getUserAddress();
      setAddressData(addr);
      const events = await MockApi.getVerificationJourney();
      setVerificationEvents(events);
    }
    loadBackendData();
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-on-surface">
        <Sidebar />
        <div className="flex-1 lg:pl-[230px] w-full min-w-0 max-w-full flex flex-col min-h-screen transition-all duration-300 overflow-x-hidden">
          <Header />
          
          <main className="flex-1 p-4 md:p-8 mt-[72px] overflow-y-auto max-w-[1400px] mx-auto w-full relative">
            
            {/* Toast Notification */}
            {toastMessage && (
              <div className="fixed top-20 right-8 z-[10000] bg-primary text-on-primary font-bold px-4 py-3 rounded-xl shadow-2xl animate-bounce text-xs flex items-center gap-2">
                <span>{toastMessage}</span>
              </div>
            )}

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
              
              <button 
                type="button"
                onClick={() => setEditProfileModalOpen(true)}
                className="group flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border border-outline-variant hover:border-primary text-on-surface-variant hover:text-primary transition-all duration-300 relative overflow-hidden bg-surface-container/50 backdrop-blur-sm shadow-md hover:shadow-[0_0_15px_rgba(240,180,41,0.2)]"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <Edit3 size={20} className="relative z-10" />
                <span className="font-semibold text-sm relative z-10">Edit Profile</span>
              </button>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 relative mb-6">
              
              {/* Left Column (approx 65% on desktop -> 8 cols) */}
              <div className="col-span-1 xl:col-span-8 flex flex-col gap-6">
                <ProfileOverview 
                  profile={userProfile}
                  onEditPhotoClick={() => setEditPhotoModalOpen(true)}
                  onEditProfileClick={() => setEditProfileModalOpen(true)}
                />
                <KycVerification 
                  documentsList={documents}
                  onViewDocument={(title, status) => {
                    setSelectedDocTitle(title);
                    setSelectedDocStatus(status);
                    setDocViewerModalOpen(true);
                  }}
                  onUpdateDocument={(title) => {
                    setSelectedDocTitle(title);
                    setUpdateDocModalOpen(true);
                  }}
                />
                <PersonalInfo 
                  onSavePersonalInfo={async (updatedData, changes) => {
                    if (updatedData.fullName) {
                      updateUserProfile({ name: updatedData.fullName });
                    }
                    const updatedEvts = await MockApi.addVerificationEvent("Personal Info Updated", `${changes.length} field(s) updated under 2FA Security`);
                    setVerificationEvents(updatedEvts);
                    triggerToast("Personal Information updated with 2FA Verification!");
                  }}
                />
                <AddressDetails 
                  addressData={addressData}
                  onUpdateAddressClick={() => setUpdateAddressModalOpen(true)}
                />
              </div>

              {/* Right Column (approx 35% on desktop -> 4 cols) */}
              <div className="col-span-1 xl:col-span-4 flex flex-col gap-6">
                <SecurityAndDevices 
                  nominee={nominee}
                  onUpdateNominee={() => setUpdateNomineeModalOpen(true)}
                  onStartReKyc={() => setReKycWizardModalOpen(true)}
                />
              </div>
              
            </div>

            {/* Bottom Section: Verification Journey */}
            <div className="mb-8">
              <VerificationJourney events={verificationEvents} />
            </div>

          </main>
        </div>

        {/* MODALS */}
        <EditProfileModal 
          isOpen={editProfileModalOpen}
          onClose={() => setEditProfileModalOpen(false)}
          currentProfile={userProfile}
          onSaveProfile={async (updated, changes) => {
            updateUserProfile(updated);
            const updatedEvts = await MockApi.addVerificationEvent("Contact & Profile Updated", `${changes.length} detail(s) updated under 2FA Security`);
            setVerificationEvents(updatedEvts);
            triggerToast("Profile & contact details updated under 2FA Verification!");
          }}
        />

        <EditProfilePhotoModal 
          isOpen={editPhotoModalOpen}
          onClose={() => setEditPhotoModalOpen(false)}
          currentPhotoUrl={userProfile.avatarUrl}
          onSavePhoto={(newUrl) => {
            updateUserProfile({ avatarUrl: newUrl });
            triggerToast("Profile photo updated successfully!");
          }}
        />

        <KycDocumentViewerModal 
          isOpen={docViewerModalOpen}
          onClose={() => setDocViewerModalOpen(false)}
          documentTitle={selectedDocTitle}
          documentStatus={selectedDocStatus}
        />

        <UpdateKycDocumentModal 
          isOpen={updateDocModalOpen}
          onClose={() => setUpdateDocModalOpen(false)}
          documentTitle={selectedDocTitle}
          onDocumentUpdated={async (docTitle) => {
            setDocuments(prev => prev.map(d => d.title === docTitle ? { ...d, status: "Verified" } : d));
            const updatedEvts = await MockApi.addVerificationEvent(`${docTitle} Verified`, `Uploaded & verified via OCR`);
            setVerificationEvents(updatedEvts);
            triggerToast(`${docTitle} uploaded & verified via OCR!`);
          }}
        />

        <UpdateNomineeModal 
          isOpen={updateNomineeModalOpen}
          onClose={() => setUpdateNomineeModalOpen(false)}
          currentNominee={nominee}
          onSaveNominee={(updated) => {
            setNominee(updated);
            triggerToast("Nominee details updated successfully!");
          }}
        />

        <UpdateAddressModal 
          isOpen={updateAddressModalOpen}
          onClose={() => setUpdateAddressModalOpen(false)}
          currentAddressData={addressData}
          onAddressUpdated={({ address, events }) => {
            setAddressData(address);
            updateUserProfile({ address: address.currentAddress });
            setVerificationEvents(events);
            triggerToast("Address updated successfully in database!");
          }}
        />

        <ReKycWizardModal 
          isOpen={reKycWizardModalOpen}
          onClose={() => setReKycWizardModalOpen(false)}
          onReKycCompleted={async () => {
            setDocuments(prev => prev.map(d => ({ ...d, status: "Verified" })));
            const updatedEvts = await MockApi.addVerificationEvent("Re-KYC Verified", "DigiLocker & Face Liveness passed");
            setVerificationEvents(updatedEvts);
            triggerToast("Full Re-KYC completed & verified via DigiLocker!");
          }}
        />

      </div>
  );
}
