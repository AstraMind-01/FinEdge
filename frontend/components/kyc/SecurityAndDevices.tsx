"use client";

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Laptop, 
  Smartphone, 
  Tablet,
  Monitor,
  LogOut, 
  FolderOpen, 
  FileText, 
  Download, 
  RefreshCw, 
  ArrowRight,
  Shield,
  Plus,
  Lock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  History
} from 'lucide-react';
import SecurityToggleWarningModal from '../modals/SecurityToggleWarningModal';
import RevokeDeviceWarningModal from '../modals/RevokeDeviceWarningModal';
import SecureDocumentAccessModal from '../modals/SecureDocumentAccessModal';
import KycDocumentViewerModal from '../modals/KycDocumentViewerModal';
import UpdateKycDocumentModal from '../modals/UpdateKycDocumentModal';
import DeviceDetailsModal, { LinkedDeviceData } from '../modals/DeviceDetailsModal';
import { useAccounts } from '../../context/AccountContext';
import { VaultDocument } from '../../types';

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

  const [showPreviousDevices, setShowPreviousDevices] = useState(false);
  const [selectedDeviceModal, setSelectedDeviceModal] = useState<LinkedDeviceData | null>(null);

  const [devices, setDevices] = useState<LinkedDeviceData[]>([
    {
      id: "dev-1",
      name: 'MacBook Pro 16"',
      type: "Laptop",
      os: "macOS Sonoma 14.5",
      browser: "Chrome 127.0",
      ip: "192.168.1.104",
      location: "New Delhi, India",
      fingerprint: "FP-892A-4410-MBP",
      firstLinked: "15 Jan 2024",
      lastActive: "Active Now",
      isCurrent: true,
      status: "ACTIVE",
      activities: [
        { id: "act-1", action: "2FA Security PIN Verification", timestamp: "2026-08-10 17:48", ip: "192.168.1.104", details: "Authenticated for High Yield Fixed Deposit Details", type: "SECURITY" },
        { id: "act-2", action: "OTP Email Verification", timestamp: "2026-08-10 11:52", ip: "192.168.1.104", details: "Verified successfully! ProofToken: FE-PROOF-828FB4", type: "SECURITY" },
        { id: "act-3", action: "Session Login", timestamp: "2026-08-10 09:15", ip: "192.168.1.104", details: "Password & Email OTP 2FA login from Chrome", type: "LOGIN" },
        { id: "act-4", action: "KYC Vault Document Access", timestamp: "2026-08-09 21:04", ip: "192.168.1.104", details: "Aadhaar Card copy unlocked via 2FA", type: "PROFILE" },
      ]
    },
    {
      id: "dev-2",
      name: 'iPhone 15 Pro',
      type: "Smartphone",
      os: "iOS 17.5",
      browser: "FinEdge App v3.4",
      ip: "103.21.124.89",
      location: "Gurgaon, India",
      fingerprint: "FP-77B1-9920-IPH",
      firstLinked: "02 Mar 2024",
      lastActive: "2 hours ago",
      isCurrent: false,
      status: "ACTIVE",
      activities: [
        { id: "act-5", action: "Mobile Utility Recharge", timestamp: "2026-08-10 15:30", ip: "103.21.124.89", details: "Recharged Jio 5G Prepaid ₹999", type: "TRANSFER" },
        { id: "act-6", action: "Biometric TouchID Verified", timestamp: "2026-08-10 15:28", ip: "103.21.124.89", details: "FaceID biometric auth passed", type: "SECURITY" },
        { id: "act-7", action: "Quick Fund Transfer", timestamp: "2026-08-08 18:40", ip: "103.21.124.89", details: "Transferred ₹5,000 to Alex Demo", type: "TRANSFER" },
      ]
    },
    {
      id: "dev-3",
      name: 'Windows 11 Workstation',
      type: "Desktop",
      os: "Windows 11 Pro 23H2",
      browser: "Microsoft Edge 126.0",
      ip: "49.36.210.12",
      location: "Mumbai, India",
      fingerprint: "FP-33C4-1029-WIN",
      firstLinked: "10 Nov 2023",
      lastActive: "3 days ago",
      isCurrent: false,
      status: "INACTIVE",
      activities: [
        { id: "act-8", action: "Account Password Updated", timestamp: "2026-08-07 14:15", ip: "49.36.210.12", details: "Password changed successfully via 2FA Email OTP", type: "SECURITY" },
        { id: "act-9", action: "Fixed Deposit Account Created", timestamp: "2026-07-28 10:00", ip: "49.36.210.12", details: "Opened High Yield FD ₹200,000", type: "TRANSFER" },
      ]
    },
    {
      id: "dev-4",
      name: 'iPad Air 5th Gen',
      type: "Tablet",
      os: "iPadOS 17.4",
      browser: "Mobile Safari",
      ip: "122.176.45.19",
      location: "New Delhi, India",
      fingerprint: "FP-11D9-5582-IPD",
      firstLinked: "20 Aug 2023",
      lastActive: "12 days ago",
      isCurrent: false,
      status: "REVOKED",
      activities: [
        { id: "act-10", action: "Session Revoked by User", timestamp: "2026-07-29 19:22", ip: "122.176.45.19", details: "Session access terminated manually", type: "SECURITY" },
        { id: "act-11", action: "Login Attempt", timestamp: "2026-07-29 18:50", ip: "122.176.45.19", details: "Safari browser login", type: "LOGIN" },
      ]
    },
    {
      id: "dev-5",
      name: 'Samsung Galaxy S24 Ultra',
      type: "Smartphone",
      os: "Android 14",
      browser: "Samsung Internet",
      ip: "182.72.10.44",
      location: "Bengaluru, India",
      fingerprint: "FP-55E2-8819-GAL",
      firstLinked: "12 Feb 2024",
      lastActive: "1 month ago",
      isCurrent: false,
      status: "INACTIVE",
      activities: [
        { id: "act-12", action: "Beneficiary Added", timestamp: "2026-07-10 11:05", ip: "182.72.10.44", details: "Added HDFC Bank account 98765432", type: "PROFILE" },
        { id: "act-13", action: "Fingerprint Biometric Auth", timestamp: "2026-07-10 11:00", ip: "182.72.10.44", details: "Android Biometric Auth Verified", type: "SECURITY" },
      ]
    }
  ]);

  // Warning Modal States
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

  const vaultScrollRef = React.useRef<HTMLDivElement>(null);

  const scrollVault = (direction: 'left' | 'right') => {
    if (vaultScrollRef.current) {
      const scrollAmount = direction === 'left' ? -220 : 220;
      vaultScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

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
      <div className="bg-surface-container rounded-xl border border-surface-container-highest overflow-hidden shadow-lg p-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/10 pb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold m-0">Linked Devices</h3>
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded">
              {devices.filter(d => d.status === 'ACTIVE').length} Active
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowPreviousDevices(prev => !prev)}
            className="px-3 py-1.5 bg-surface-high border border-outline-variant/20 hover:bg-surface-highest text-on-surface-variant hover:text-on-surface text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <History size={14} className="text-primary" />
            {showPreviousDevices ? "Show Active Only" : `View All Devices & History (${devices.length})`}
          </button>
        </div>

        <p className="text-xs text-on-surface-variant m-0 flex items-center gap-1.5">
          <Info size={14} className="text-primary shrink-0" />
          Click any device card below to view detailed specs, IP logs, and complete activity history.
        </p>

        <div className="flex flex-col gap-3">
          {(showPreviousDevices ? devices : devices.filter(d => d.status === 'ACTIVE')).map(dev => {
            const Icon = dev.type === 'Laptop' ? Laptop : dev.type === 'Smartphone' ? Smartphone : dev.type === 'Tablet' ? Tablet : Monitor;
            return (
              <div 
                key={dev.id} 
                onClick={() => setSelectedDeviceModal(dev)}
                className={`flex items-center gap-4 p-3.5 rounded-xl border transition-all cursor-pointer group ${
                  dev.isCurrent 
                    ? 'bg-primary/5 border-primary/30 hover:bg-primary/10 shadow-sm' 
                    : dev.status === 'REVOKED'
                    ? 'bg-error/5 border-error/20 opacity-75 hover:opacity-100'
                    : 'bg-surface-container-highest/30 border-outline-variant/10 hover:border-outline-variant/40 hover:bg-surface-high'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${dev.isCurrent ? 'bg-primary/10 text-primary' : 'bg-surface-high text-on-surface-variant'}`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-on-surface truncate group-hover:text-primary transition-colors">{dev.name}</span>
                    {dev.isCurrent && (
                      <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 text-[10px] font-bold">Current</span>
                    )}
                    {dev.status === 'REVOKED' && (
                      <span className="px-2 py-0.5 rounded-full bg-error/10 text-error text-[10px] font-bold">Revoked</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-0.5 font-mono">
                    <span>{dev.os}</span>
                    <span>•</span>
                    <span className={dev.isCurrent ? 'text-teal-400 font-semibold' : ''}>{dev.lastActive}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setSelectedDeviceModal(dev)}
                    className="px-3 py-1.5 bg-surface-high text-on-surface-variant hover:text-primary hover:bg-surface-highest text-xs rounded-lg font-medium transition-all cursor-pointer"
                  >
                    Details &amp; Activity
                  </button>
                  {dev.status !== 'REVOKED' && (
                    <button 
                      type="button"
                      onClick={() => handlePromptRevokeDevice({ id: dev.id, name: dev.name, time: dev.lastActive, isCurrent: dev.isCurrent })}
                      className="text-outline hover:text-error transition-colors p-1.5 rounded-lg hover:bg-error/10 cursor-pointer" 
                      title="Revoke Device Access"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {(showPreviousDevices ? devices : devices.filter(d => d.status === 'ACTIVE')).length === 0 && (
            <p className="text-xs text-on-surface-variant text-center py-4">No devices found for this filter.</p>
          )}
        </div>
      </div>

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
      <div className="bg-surface-container rounded-xl border border-surface-container-highest overflow-hidden shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="text-primary w-5 h-5" />
            <h3 className="text-xl font-semibold m-0">Document Vault</h3>
          </div>

          <div className="flex items-center gap-3">
            {/* Sleek Carousel Navigation Arrows */}
            <div className="flex items-center gap-1 bg-surface-container-high p-1 rounded-xl border border-white/5 shadow-inner">
              <button
                type="button"
                onClick={() => scrollVault('left')}
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-variant transition-all cursor-pointer"
                title="Previous Document"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => scrollVault('right')}
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-variant transition-all cursor-pointer"
                title="Next Document"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="px-3.5 py-2 bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-on-primary font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer hover:shadow-[0_0_15px_rgba(240,180,41,0.3)]"
            >
              <Plus size={14} /> Upload Document
            </button>
          </div>
        </div>
        
        {/* Horizontal Scroll Container */}
        <div 
          ref={vaultScrollRef}
          className="flex gap-4 overflow-x-auto pb-2 snap-x hide-scrollbar scroll-smooth"
        >
          {vaultDocuments.map((doc) => {
            const isAccessActive = isDocumentAccessGranted(doc.id);

            return (
              <div 
                key={doc.id} 
                onClick={() => handleDocumentClick(doc)}
                className="min-w-[150px] bg-surface-container-highest/50 rounded-xl p-3 flex flex-col gap-2.5 border border-surface-variant hover:border-primary/50 transition-colors cursor-pointer group snap-start shrink-0 relative overflow-hidden"
              >
                <div className="h-16 bg-[#1E293B] rounded-lg flex items-center justify-center relative overflow-hidden">
                  <FileText className="text-on-surface-variant w-8 h-8 opacity-50" />
                  <div className="absolute inset-2 flex flex-col gap-1 opacity-20">
                    <div className="h-1 w-3/4 bg-current"></div>
                    <div className="h-1 w-full bg-current"></div>
                    <div className="h-1 w-5/6 bg-current"></div>
                  </div>
                  <div className="absolute inset-0 bg-surface/80 opacity-0 group-hover:opacity-100 flex items-center justify-center backdrop-blur-[2px] transition-all">
                    {isAccessActive ? (
                      <span className="text-tertiary text-[10px] font-bold uppercase flex items-center gap-1">
                        <CheckCircle2 size={14} /> Preview
                      </span>
                    ) : (
                      <span className="text-primary text-[10px] font-bold uppercase flex items-center gap-1">
                        <Lock size={14} /> 2FA Unlock
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-0.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-on-surface truncate max-w-[90px]">{doc.fileName}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      doc.status === 'Verified' ? 'text-teal-400 bg-teal-500/10' : 'text-amber-400 bg-amber-500/10'
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-on-surface-variant">
                    <span>{doc.fileSize}</span>
                    <span className="font-mono">{doc.uploadDate}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
