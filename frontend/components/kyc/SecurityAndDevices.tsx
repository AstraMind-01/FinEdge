"use client";
import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Laptop, 
  Smartphone, 
  LogOut, 
  FolderOpen, 
  FileText, 
  Download, 
  RefreshCw, 
  ArrowRight,
  Shield
} from 'lucide-react';
import SecurityToggleWarningModal from '../modals/SecurityToggleWarningModal';
import RevokeDeviceWarningModal from '../modals/RevokeDeviceWarningModal';

interface SecurityAndDevicesProps {
  nominee?: { name: string; relationship: string; share: string };
  onUpdateNominee?: () => void;
  onStartReKyc?: () => void;
}

export default function SecurityAndDevices({ nominee: propNominee, onUpdateNominee, onStartReKyc }: SecurityAndDevicesProps) {
  const [toggles, setToggles] = useState({
    twoFa: true,
    biometric: true,
    loginAlerts: true,
    txnNotifications: true
  });

  const [devices, setDevices] = useState([
    { id: 1, name: 'MacBook Pro 16"', time: 'Active Now', isCurrent: true, icon: Laptop },
    { id: 2, name: 'iPhone 15 Pro', time: '2 hours ago', isCurrent: false, icon: Smartphone }
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

  const handlePromptRevokeDevice = (dev: { id: number; name: string; time: string; isCurrent: boolean }) => {
    setSelectedDevice(dev);
    setRevokeModalOpen(true);
  };

  const handleConfirmRevokeDevice = (deviceId: number) => {
    setDevices(prev => prev.filter(d => d.id !== deviceId));
  };

  const handleDownloadVaultDoc = (name: string, size: string) => {
    const content = `====================================================\n` +
      `       FINEDGE BANK - VAULT DOCUMENT DOCUMENT\n` +
      `====================================================\n\n` +
      `File Name : ${name}\n` +
      `File Size : ${size}\n` +
      `Owner     : Soumya Ranjan\n` +
      `Encrypted : SHA-256 Verified\n\n` +
      `====================================================`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name.replace('.pdf', '.txt');
    a.click();
    URL.revokeObjectURL(url);
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
          {/* Toggle Rows */}
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
      <div className="bg-surface-container rounded-xl border border-surface-container-highest overflow-hidden shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold m-0">Linked Devices</h3>
          <span className="px-2 py-0.5 bg-surface-variant text-on-surface-variant text-[10px] font-bold rounded">{devices.length} Active</span>
        </div>
        
        <div className="flex flex-col gap-3">
          {devices.map(dev => (
            <div key={dev.id} className="flex items-center gap-4 p-3 bg-surface-container-highest/30 rounded-lg border border-primary/10">
              <dev.icon className={`w-6 h-6 ${dev.isCurrent ? 'text-primary' : 'text-on-surface-variant'}`} />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm text-on-surface truncate">{dev.name}</span>
                <span className={`text-xs ${dev.isCurrent ? 'text-teal-400' : 'text-on-surface-variant'}`}>{dev.time}</span>
              </div>
              <button 
                type="button"
                onClick={() => handlePromptRevokeDevice(dev)}
                className="text-outline hover:text-error transition-colors p-1" 
                title="Remove Device"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ))}
          {devices.length === 0 && (
            <p className="text-xs text-on-surface-variant text-center py-2">No active linked devices</p>
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
          <h3 className="text-xl font-semibold m-0">Document Vault</h3>
          <FolderOpen className="text-on-surface-variant w-5 h-5" />
        </div>
        
        {/* Horizontal Scroll Container */}
        <div className="flex gap-4 overflow-x-auto pb-3 snap-x scrollbar-hide">
          {[
            { name: "Aadhaar.pdf", size: "1.2 MB" },
            { name: "PAN_Card.pdf", size: "0.8 MB" },
            { name: "Address.pdf", size: "2.1 MB" }
          ].map((doc, idx) => (
            <div 
              key={idx} 
              onClick={() => handleDownloadVaultDoc(doc.name, doc.size)}
              className="min-w-[120px] bg-surface-container-highest/50 rounded-lg p-3 flex flex-col gap-3 border border-surface-variant hover:border-primary/50 transition-colors cursor-pointer group snap-start shrink-0 relative overflow-hidden"
            >
              <div className="h-16 bg-[#1E293B] rounded flex items-center justify-center relative overflow-hidden">
                <FileText className="text-on-surface-variant w-8 h-8 opacity-50" />
                {/* Subtle mock document lines */}
                <div className="absolute inset-2 flex flex-col gap-1 opacity-20">
                  <div className="h-1 w-3/4 bg-current"></div>
                  <div className="h-1 w-full bg-current"></div>
                  <div className="h-1 w-5/6 bg-current"></div>
                </div>
                <div className="absolute inset-0 bg-surface/60 opacity-0 group-hover:opacity-100 flex items-center justify-center backdrop-blur-[2px] transition-all">
                  <Download className="text-primary w-5 h-5" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-on-surface truncate">{doc.name}</span>
                <span className="text-[10px] text-on-surface-variant">{doc.size}</span>
              </div>
            </div>
          ))}
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
            className="mt-2 bg-primary text-on-primary font-semibold text-sm px-6 py-2.5 rounded-lg hover:bg-primary-fixed hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] transition-all w-full flex justify-center items-center gap-2"
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
      
    </div>
  );
}
