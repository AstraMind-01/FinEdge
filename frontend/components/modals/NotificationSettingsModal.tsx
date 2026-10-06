"use client";

import React from "react";
import { X, Settings2, BellOff, Clock, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useNotifications } from "../../context/NotificationContext";

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationSettingsModal({ isOpen, onClose }: NotificationSettingsModalProps) {
  const { preferences, dndSettings, updatePreferences, updateDND } = useNotifications();

  if (!isOpen) return null;

  const togglePreference = (key: keyof typeof preferences) => {
    updatePreferences({ [key]: !preferences[key] });
  };

  const formatTime12 = (time24: string) => {
    if (!time24) return "";
    const [h, m] = time24.split(":");
    const hours = parseInt(h, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12.toString().padStart(2, '0')}:${m || '00'} ${ampm}`;
  };

  const ToggleSwitch = ({ checked, onChange, label, description }: { checked: boolean, onChange: () => void, label: string, description?: string }) => (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div className="flex flex-col pr-4">
        <span className="text-[14px] text-on-surface font-medium">{label}</span>
        {description && <span className="text-[12px] text-on-surface-variant/70 mt-0.5">{description}</span>}
      </div>
      <button 
        type="button"
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-all duration-300 shrink-0 ${checked ? 'bg-primary' : 'bg-surface-container-high'}`}
      >
        <div className={`absolute top-1 bottom-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${checked ? 'left-[22px] shadow-[0_0_10px_rgba(240,180,41,0.5)]' : 'left-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Settings2 size={20} />
            </div>
            <div>
              <h2 className="text-[18px] font-headline-lg font-bold text-on-surface">Notification Settings</h2>
              <p className="text-[12px] text-on-surface-variant">Customize channels, categories, and custom DND quiet hours</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* DND Custom Time Section */}
          <div className="bg-surface-container-low rounded-xl border border-white/10 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BellOff className="text-secondary" size={20} />
                <h3 className="text-[15px] font-semibold text-on-surface">Do Not Disturb (DND)</h3>
              </div>
              <ToggleSwitch 
                checked={dndSettings.enabled} 
                onChange={() => updateDND({ enabled: !dndSettings.enabled })} 
                label="" 
              />
            </div>
            <p className="text-[13px] text-on-surface-variant leading-relaxed">
              Mute non-urgent notifications during your custom sleep or focus schedule. Critical security alerts will always pass through.
            </p>

            {dndSettings.enabled && (
              <div className="pt-3 border-t border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-[12px] font-semibold text-primary uppercase tracking-wider">
                  <Clock size={14} />
                  <span>Custom Quiet Hours</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] text-on-surface-variant font-medium">Start Time (From)</label>
                    <input
                      type="time"
                      value={dndSettings.startTime}
                      onChange={(e) => updateDND({ startTime: e.target.value })}
                      className="w-full bg-surface-container-high border border-white/10 rounded-xl px-3 py-2 text-[13px] text-primary font-mono focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] text-on-surface-variant font-medium">End Time (To)</label>
                    <input
                      type="time"
                      value={dndSettings.endTime}
                      onChange={(e) => updateDND({ endTime: e.target.value })}
                      className="w-full bg-surface-container-high border border-white/10 rounded-xl px-3 py-2 text-[13px] text-primary font-mono focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all cursor-pointer"
                    />
                  </div>
                </div>

                {/* Quiet Hours Preview */}
                <div className="p-3 bg-surface-container-high rounded-xl border border-white/5 flex items-center justify-between text-[13px] text-on-surface">
                  <span className="text-on-surface-variant">Active DND Window:</span>
                  <span className="font-semibold text-primary">
                    {formatTime12(dndSettings.startTime)} to {formatTime12(dndSettings.endTime)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Delivery Channels */}
          <div className="bg-surface-container-low rounded-xl border border-white/10 p-5">
            <h3 className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Notification Channels</h3>
            <ToggleSwitch 
              checked={preferences.push} 
              onChange={() => togglePreference('push')} 
              label="Push Notifications" 
              description="Receive browser and mobile push alerts"
            />
            <ToggleSwitch 
              checked={preferences.email} 
              onChange={() => togglePreference('email')} 
              label="Email Alerts" 
              description="Receive detailed summary emails for account events"
            />
            <ToggleSwitch 
              checked={preferences.sms} 
              onChange={() => togglePreference('sms')} 
              label="SMS Alerts" 
              description="Receive text message updates for transactions & security"
            />
          </div>

          {/* Categories */}
          <div className="bg-surface-container-low rounded-xl border border-white/10 p-5">
            <h3 className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Category Subscriptions</h3>
            <ToggleSwitch 
              checked={preferences.transactions} 
              onChange={() => togglePreference('transactions')} 
              label="Transaction Alerts" 
              description="Transfers, payments, debits, credits, and deposits"
            />
            <ToggleSwitch 
              checked={preferences.security} 
              onChange={() => togglePreference('security')} 
              label="Security Alerts" 
              description="Logins, password changes, PIN checks, and vault activity"
            />
            <ToggleSwitch 
              checked={preferences.promotions} 
              onChange={() => togglePreference('promotions')} 
              label="Promotional Offers" 
              description="Cashback deals, rewards, and product announcements"
            />
            <ToggleSwitch 
              checked={preferences.reminders} 
              onChange={() => togglePreference('reminders')} 
              label="Bill & EMI Reminders" 
              description="Upcoming bill due dates and loan EMI reminders"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-surface-container-low flex justify-between items-center">
          <div className="flex items-center gap-2 text-[12px] text-tertiary">
            <CheckCircle2 size={16} />
            <span>Settings auto-saved to your account</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-primary text-on-primary font-semibold text-[13px] rounded-xl hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] transition-all cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
