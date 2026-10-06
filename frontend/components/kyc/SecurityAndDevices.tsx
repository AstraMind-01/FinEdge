"use client";

import React, { useState } from 'react';
import { Shield, RefreshCw, ArrowRight } from 'lucide-react';
import SecurityToggleWarningModal from '../modals/SecurityToggleWarningModal';
import RevokeDeviceWarningModal from '../modals/RevokeDeviceWarningModal';
import SecureDocumentAccessModal from '../modals/SecureDocumentAccessModal';
import KycDocumentViewerModal from '../modals/KycDocumentViewerModal';
import UpdateKycDocumentModal from '../modals/UpdateKycDocumentModal';
import DeviceDetailsModal, { LinkedDeviceData } from '../modals/DeviceDetailsModal';
import { useAccounts } from '../../context/AccountContext';
import { VaultDocument } from '../../types';
import { INITIAL_MOCK_DEVICES } from './deviceMockData';
import LinkedDevicesSection from './LinkedDevicesSection';
import VaultDocumentsSection from './VaultDocumentsSection';

interface SecurityAndDevicesProps {
  nominee?: { name: string; relationship: string; share: string };
  onUpdateNominee?: () => void;
  onStartReKyc?: () => void;
}

export default function SecurityAndDevices({ nominee: propNominee, onUpdateNominee, onStartReKyc }: SecurityAndDevicesProps) {
  const { vaultDocuments, isDocumentAccessGranted } = useAccounts();

  const [toggles, setToggles] = useState({
    twoFa: true,
    biometric: true,
    loginAlerts: true,
    txnNotifications: true
  });

  const [selectedDeviceModal, setSelectedDeviceModal] = useState<LinkedDeviceData | null>(null);
  const [devices, setDevices] = useState<LinkedDeviceData[]>(INITIAL_MOCK_DEVICES);

  const [secWarningModalOpen, setSecWarningModalOpen] = useState(false);
  const [selectedSecOption, setSelectedSecOption] = useState<{ key: string; title: string; currentVal: boolean }>({
    key: "twoFa",
    title: "Two-Factor Auth (2FA)",
    currentVal: true
  });

  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<{ id: number; name: string; time: string; isCurrent: boolean } | null>(null);

  // Vault Modals State
  const [securityModalDoc, setSecurityModalDoc] = useState<VaultDocument | null>(null);
  const [viewerModalDoc, setViewerModalDoc] = useState<VaultDocument | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const nominee = propNominee || { name: "Anjali Ranjan", relationship: "Spouse", share: "100% Share" };

  const handlePromptToggle = (key: keyof typeof toggles, title: string) => {
    setSelectedSecOption({
      key,
      title,
      currentVal: toggles[key]
    });
    setSecWarningModalOpen(true);
  };

  const handleConfirmToggleChange = (optionKey: string, newStatus: boolean) => {
    setToggles(prev => ({ ...prev, [optionKey]: newStatus }));
  };

  const handlePromptRevokeDevice = (dev: { id: string | number; name: string; time: string; isCurrent: boolean }) => {
    setSelectedDevice(dev as any);
    setRevokeModalOpen(true);
  };

  const handleConfirmRevokeDevice = (deviceId: string | number) => {
    setDevices(prev => prev.map(d => (d.id === String(deviceId) || d.id === deviceId) ? { ...d, status: "REVOKED" as const, isCurrent: false } : d));
  };

  const handleDocumentClick = (doc: VaultDocument) => {
    if (isDocumentAccessGranted(doc.id)) {
      setViewerModalDoc(doc);
    } else {
      setSecurityModalDoc(doc);
    }
  };

  const ToggleSwitch = ({ active, onClick }: { active: boolean, onClick: () => void }) => (
    <div 
      onClick={onClick}
      className={`w-10 h-5 rounded-full relative border transition-all cursor-pointer shadow-[0_0_10px_rgba(240,180,41,0.15)] ${
        active ? 'bg-primary/20 border-primary/30' : 'bg-surface-container-highest border-outline-variant'
      }`}
    >
      <div className={`absolute top-0.5 w-4 h-4 rounded-full shadow-sm transition-all group-hover:scale-110 ${
        active ? 'right-0.5 bg-primary' : 'left-0.5 bg-outline-variant'
      }`}></div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* 1. Account Security Card */}
      <div className="bg-surface-container rounded-xl border border-surface-container-highest overflow-hidden shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
            <Shield className="w-4 h-4" />
          </div>
          <h3 className="text-xl font-semibold m-0">Account Security</h3>
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-surface-container-highest transition-colors cursor-pointer group" onClick={() => handlePromptToggle('twoFa', 'Two-Factor Auth (2FA)')}>
            <div className="flex flex-col">
              <span className="text-sm text-on-surface">Two-Factor Auth (2FA)</span>
              <span className="text-xs text-on-surface-variant">Authenticator App</span>
            </div>
            <ToggleSwitch active={toggles.twoFa} onClick={() => {}} />
          </div>
          
          <div className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-surface-container-highest transition-colors cursor-pointer group" onClick={() => handlePromptToggle('biometric', 'Biometric Login')}>
            <div className="flex flex-col">
              <span className="text-sm text-on-surface">Biometric Login</span>
              <span className="text-xs text-on-surface-variant">FaceID / TouchID</span>
            </div>
            <ToggleSwitch active={toggles.biometric} onClick={() => {}} />
          </div>
          
          <div className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-surface-container-highest transition-colors cursor-pointer group" onClick={() => handlePromptToggle('loginAlerts', 'Login Alerts')}>
            <div className="flex flex-col">
              <span className="text-sm text-on-surface">Login Alerts</span>
              <span className="text-xs text-on-surface-variant">Email &amp; SMS</span>
            </div>
            <ToggleSwitch active={toggles.loginAlerts} onClick={() => {}} />
          </div>
          
          <div className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-surface-container-highest transition-colors cursor-pointer group" onClick={() => handlePromptToggle('txnNotifications', 'Txn Notifications')}>
            <div className="flex flex-col">
              <span className="text-sm text-on-surface">Txn Notifications</span>
              <span className="text-xs text-on-surface-variant">Push Alerts</span>
            </div>
            <ToggleSwitch active={toggles.txnNotifications} onClick={() => {}} />
          </div>
        </div>
      </div>

      {/* 2. Linked Devices Card */}
      <LinkedDevicesSection 
        devices={devices} 
        onSelectDevice={setSelectedDeviceModal}
        onPromptRevoke={handlePromptRevokeDevice}
      />

      {/* 3. Nominee Details Card */}
      <div className="bg-surface-container rounded-xl border border-surface-container-highest overflow-hidden shadow-lg p-6 relative group">
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/5 rounded-full blur-[30px] pointer-events-none group-hover:bg-primary/10 transition-colors"></div>
        <div className="flex items-center justify-between mb-4 relative z-10">
          <h3 className="text-xl font-semibold m-0">Nominee Details</h3>
          <button 
            type="button"
            onClick={onUpdateNominee}
            className="text-xs font-bold text-primary hover:text-primary-fixed transition-colors"
          >
            Update
          </button>
        </div>
        <div className="relative z-10 flex flex-col gap-2 p-4 bg-[#1E293B] rounded-lg border-l-2 border-primary">
          <div className="flex justify-between items-start">
            <span className="text-base text-on-surface font-semibold">{nominee.name}</span>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">{nominee.share}</span>
          </div>
          <span className="text-xs text-on-surface-variant">Relationship: {nominee.relationship}</span>
        </div>
      </div>

      {/* 4. Document Vault Card */}
      <VaultDocumentsSection 
        vaultDocuments={vaultDocuments}
        isDocumentAccessGranted={isDocumentAccessGranted}
        onDocumentClick={handleDocumentClick}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* 5. Re-KYC Promo */}
      <div className="bg-gradient-to-br from-surface-container-highest to-surface-container border border-primary/20 rounded-xl p-6 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.2)] group">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative z-10 flex flex-col gap-4 items-start">
          <div className="flex items-center gap-3 text-primary">
            <RefreshCw className="w-5 h-5" />
            <h4 className="text-xl font-semibold m-0 text-on-surface">Need to Update KYC?</h4>
          </div>
          <p className="text-sm text-on-surface-variant m-0">Keep your account fully functional by periodically updating your latest documents.</p>
          <button 
            type="button"
            onClick={onStartReKyc}
            className="mt-2 bg-primary text-on-primary font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-primary-fixed hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] transition-all w-full flex justify-center items-center gap-2 cursor-pointer"
          >
            Start Re-KYC
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SECURITY WARNING MODALS */}
      <SecurityToggleWarningModal 
        isOpen={secWarningModalOpen}
        onClose={() => setSecWarningModalOpen(false)}
        optionKey={selectedSecOption.key}
        optionTitle={selectedSecOption.title}
        currentStatus={selectedSecOption.currentVal}
        onConfirmChange={handleConfirmToggleChange}
      />

      <RevokeDeviceWarningModal 
        isOpen={revokeModalOpen}
        onClose={() => setRevokeModalOpen(false)}
        device={selectedDevice}
        onConfirmRevoke={handleConfirmRevokeDevice}
      />

      {/* DOCUMENT VAULT SECURITY MODALS */}
      <SecureDocumentAccessModal
        documentItem={securityModalDoc}
        onClose={() => setSecurityModalDoc(null)}
        onSuccess={(doc) => {
          setSecurityModalDoc(null);
          setViewerModalDoc(doc);
        }}
      />

      <KycDocumentViewerModal
        isOpen={!!viewerModalDoc}
        onClose={() => setViewerModalDoc(null)}
        documentTitle={viewerModalDoc?.title || "Document"}
        documentStatus={viewerModalDoc?.status || "Verified"}
        vaultDoc={viewerModalDoc}
      />

      <UpdateKycDocumentModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        documentTitle="Vault Document"
      />

      {/* DEVICE DETAILS & ACTIVITY TIMELINE POPUP MODAL */}
      <DeviceDetailsModal
        device={selectedDeviceModal}
        isOpen={!!selectedDeviceModal}
        onClose={() => setSelectedDeviceModal(null)}
        onRevokeAccess={(deviceId) => {
          setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, status: 'REVOKED' as const, isCurrent: false } : d));
          setSelectedDeviceModal(null);
        }}
      />
    </div>
  );
}
