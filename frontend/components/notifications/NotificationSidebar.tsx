import React, { useState } from 'react';
import { Settings2, BellOff, ShieldAlert, MessageSquarePlus, ChevronRight } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import Link from 'next/link';
import SupportChatModal from '../modals/SupportChatModal';

export default function NotificationSidebar() {
  const { preferences, dndSettings, updatePreferences, updateDND, notifications } = useNotifications();
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  const togglePreference = (key: keyof typeof preferences) => {
    updatePreferences({ [key]: !preferences[key] });
  };

  const ToggleSwitch = ({ checked, onChange, label, description }: { checked: boolean, onChange: () => void, label: string, description?: string }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex flex-col">
        <span className="text-[14px] text-on-surface font-medium">{label}</span>
        {description && <span className="text-[12px] text-on-surface-variant/70">{description}</span>}
      </div>
      <button 
        onClick={onChange}
        className={`relative w-10 h-5.5 rounded-full transition-all duration-300 ${checked ? 'bg-primary' : 'bg-surface-container-high'}`}
      >
        <div className={`absolute top-0.5 bottom-0.5 w-4.5 bg-white rounded-full transition-all duration-300 shadow-sm ${checked ? 'left-[20px] shadow-[0_0_10px_rgba(240,180,41,0.5)]' : 'left-0.5'}`} />
      </button>
    </div>
  );

  const formatTime = (time24: string) => {
    if (!time24) return "";
    const [h, m] = time24.split(":");
    const hours = parseInt(h, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12.toString().padStart(2, '0')}:${m} ${ampm}`;
  };

  const securityAlerts = notifications
    .filter(n => n.type === 'security')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 2);

  return (
    <>
      <div className="flex flex-col gap-6 w-full lg:w-[320px] shrink-0">
        
        {/* Notification Preferences */}
        <div className="bg-surface-container-low rounded-xl border border-white/5 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/5">
            <Settings2 className="text-primary" size={20} />
            <h3 className="text-[16px] font-headline-lg text-on-surface">Preferences</h3>
          </div>
          
          <div className="flex flex-col gap-1">
            <h4 className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Channels</h4>
            <ToggleSwitch checked={preferences.push} onChange={() => togglePreference('push')} label="Push Notifications" />
            <ToggleSwitch checked={preferences.email} onChange={() => togglePreference('email')} label="Email Alerts" />
            <ToggleSwitch checked={preferences.sms} onChange={() => togglePreference('sms')} label="SMS Alerts" />
            
            <div className="h-px bg-white/5 my-3"></div>
            
            <h4 className="text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Categories</h4>
            <ToggleSwitch checked={preferences.transactions} onChange={() => togglePreference('transactions')} label="Transaction Alerts" />
            <ToggleSwitch checked={preferences.security} onChange={() => togglePreference('security')} label="Security Alerts" />
            <ToggleSwitch checked={preferences.promotions} onChange={() => togglePreference('promotions')} label="Promotional Offers" />
            <ToggleSwitch checked={preferences.reminders} onChange={() => togglePreference('reminders')} label="Bill Reminders" />
          </div>
        </div>

        {/* Do Not Disturb */}
        <div className="bg-surface-container-low rounded-xl border border-white/5 p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <BellOff className="text-on-surface-variant" size={20} />
            <h3 className="text-[16px] font-headline-lg text-on-surface">Do Not Disturb</h3>
          </div>
          <p className="text-[13px] text-on-surface-variant mb-4">Mute all non-urgent notifications during a specific time.</p>
          
          <ToggleSwitch checked={dndSettings.enabled} onChange={() => updateDND({ enabled: !dndSettings.enabled })} label="Enable DND" />
          
          {dndSettings.enabled && (
            <div className="mt-4 p-3 bg-surface-container-high rounded-lg flex items-center justify-between text-[13px] text-on-surface border border-white/5 gap-2">
              <input
                type="time"
                value={dndSettings.startTime}
                onChange={(e) => updateDND({ startTime: e.target.value })}
                className="bg-surface-container-low border border-white/10 rounded-md px-2 py-1 text-[12px] text-primary font-mono focus:outline-none focus:border-primary/50 cursor-pointer"
                title="DND Start Time"
              />
              <span className="text-on-surface-variant text-[12px] font-medium">to</span>
              <input
                type="time"
                value={dndSettings.endTime}
                onChange={(e) => updateDND({ endTime: e.target.value })}
                className="bg-surface-container-low border border-white/10 rounded-md px-2 py-1 text-[12px] text-primary font-mono focus:outline-none focus:border-primary/50 cursor-pointer"
                title="DND End Time"
              />
            </div>
          )}
        </div>

        {/* Recent Security Alerts */}
        <div className="bg-surface-container-low rounded-xl border border-white/5 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <ShieldAlert className="text-error" size={20} />
              <h3 className="text-[16px] font-headline-lg text-on-surface">Security</h3>
            </div>
            <Link href="/notifications?tab=security" className="text-[12px] text-primary hover:underline">
              View All
            </Link>
          </div>
          
          <div className="flex flex-col gap-4">
            {securityAlerts.length > 0 ? (
              securityAlerts.map((alert) => (
                <div key={alert.id} className="flex gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!alert.isRead ? 'bg-error' : 'bg-surface-container-highest border border-on-surface-variant'}`} />
                  <div>
                    <p className={`text-[13px] ${!alert.isRead ? 'text-on-surface font-medium' : 'text-on-surface-variant'}`}>{alert.title}</p>
                    <p className={`text-[12px] ${!alert.isRead ? 'text-on-surface-variant' : 'text-on-surface-variant/70'}`}>{alert.timestamp}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[13px] text-on-surface-variant">No recent security alerts.</p>
            )}
          </div>
        </div>

        {/* Contact Support */}
        <div 
          onClick={() => setIsSupportOpen(true)}
          className="bg-gradient-to-br from-primary/20 to-surface-container-low rounded-xl border border-primary/20 p-5 shadow-sm relative overflow-hidden group cursor-pointer hover:border-primary/40 transition-all"
        >
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <MessageSquarePlus size={100} className="text-primary" />
          </div>
          <h3 className="text-[15px] font-semibold text-on-surface mb-2 relative z-10">Questions about a notification?</h3>
          <p className="text-[13px] text-on-surface-variant mb-4 relative z-10">Our support team is here to help you 24/7.</p>
          <div className="flex items-center text-[13px] font-semibold text-primary group-hover:text-primary-fixed transition-colors relative z-10">
            Chat with Support <ChevronRight size={16} className="ml-1" />
          </div>
        </div>

      </div>

      <SupportChatModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />
    </>
  );
}
