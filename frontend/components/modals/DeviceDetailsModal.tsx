"use client";

import React, { useState } from "react";
import { X, Laptop, Smartphone, Tablet, Monitor, ShieldCheck, Clock, MapPin, Globe, Cpu, LogOut, CheckCircle2, AlertCircle, Key, Activity, Shield } from "lucide-react";

export interface DeviceActivity {
  id: string;
  action: string;
  timestamp: string;
  ip: string;
  details: string;
  type: "LOGIN" | "TRANSFER" | "SECURITY" | "PROFILE";
}

export interface LinkedDeviceData {
  id: string;
  name: string;
  type: "Laptop" | "Smartphone" | "Tablet" | "Desktop";
  os: string;
  browser: string;
  ip: string;
  location: string;
  fingerprint: string;
  firstLinked: string;
  lastActive: string;
  isCurrent: boolean;
  status: "ACTIVE" | "INACTIVE" | "REVOKED";
  activities: DeviceActivity[];
}

interface DeviceDetailsModalProps {
  device: LinkedDeviceData | null;
  isOpen: boolean;
  onClose: () => void;
  onRevokeAccess: (deviceId: string) => void;
}

export default function DeviceDetailsModal({ device, isOpen, onClose, onRevokeAccess }: DeviceDetailsModalProps) {
  const [filterType, setFilterType] = useState<string>("ALL");
  const [confirmRevoke, setConfirmRevoke] = useState(false);

  if (!isOpen || !device) return null;

  const getDeviceIcon = () => {
    switch (device.type) {
      case "Laptop": return <Laptop className="w-6 h-6 text-primary" />;
      case "Smartphone": return <Smartphone className="w-6 h-6 text-primary" />;
      case "Tablet": return <Tablet className="w-6 h-6 text-primary" />;
      case "Desktop": return <Monitor className="w-6 h-6 text-primary" />;
      default: return <Laptop className="w-6 h-6 text-primary" />;
    }
  };

  const getStatusBadge = () => {
    if (device.isCurrent) {
      return (
        <span className="px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
          Current Active Session
        </span>
      );
    }
    if (device.status === "ACTIVE") {
      return (
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          Active Device
        </span>
      );
    }
    if (device.status === "REVOKED") {
      return (
        <span className="px-3 py-1 rounded-full bg-error/10 border border-error/20 text-error text-xs font-semibold">
          Access Revoked
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-xs font-semibold">
        Previous Device (Inactive)
      </span>
    );
  };

  const filteredActivities = filterType === "ALL" 
    ? device.activities 
    : device.activities.filter(a => a.type === filterType);

  const getActivityBadgeColor = (type: DeviceActivity["type"]) => {
    switch (type) {
      case "LOGIN": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "TRANSFER": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "SECURITY": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "PROFILE": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default: return "bg-surface-high text-on-surface-variant";
    }
  };

  return (
    <div className="fixed inset-0 z-[10050] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 overflow-y-auto py-6 animate-in fade-in duration-200">
      <div className="bg-surface-container border border-outline-variant/20 w-full max-w-2xl rounded-2xl p-6 shadow-2xl z-[10060] my-auto flex flex-col gap-6 text-on-surface max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-start border-b border-outline-variant/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary flex items-center justify-center">
              {getDeviceIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight font-headline-lg m-0">{device.name}</h2>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5 m-0 font-mono">{device.os} • {device.browser}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <button 
              onClick={onClose}
              className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Device Technical Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-surface-high/60 p-4 rounded-xl border border-outline-variant/10 text-xs">
          <div>
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold flex items-center gap-1">
              <Globe size={12} /> IP Address
            </span>
            <p className="font-mono font-semibold text-on-surface mt-1 m-0 text-xs">{device.ip}</p>
          </div>

          <div>
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold flex items-center gap-1">
              <MapPin size={12} /> Location
            </span>
            <p className="font-medium text-on-surface mt-1 m-0 text-xs truncate">{device.location}</p>
          </div>

          <div>
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold flex items-center gap-1">
              <Cpu size={12} /> Fingerprint
            </span>
            <p className="font-mono text-[10px] text-primary truncate mt-1 m-0">{device.fingerprint}</p>
          </div>

          <div>
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold flex items-center gap-1">
              <Clock size={12} /> Last Active
            </span>
            <p className="font-semibold text-teal-400 mt-1 m-0 text-xs">{device.lastActive}</p>
          </div>
        </div>

        {/* Security Certificate Strip */}
        <div className="p-3 bg-tertiary/10 border border-tertiary/20 rounded-xl text-xs text-on-surface flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-tertiary shrink-0" />
            <span><strong className="text-tertiary">TLS 1.3 Encrypted Session:</strong> Device verified via salted cryptographic fingerprint.</span>
          </div>
          <span className="text-[10px] font-mono text-on-surface-variant shrink-0">Linked: {device.firstLinked}</span>
        </div>

        {/* Device Activity Log Section */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider m-0 flex items-center gap-2">
              <Activity size={16} className="text-primary" />
              Device Activity Timeline ({filteredActivities.length})
            </h3>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 text-[11px]">
              {["ALL", "LOGIN", "TRANSFER", "SECURITY"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    filterType === type 
                      ? 'bg-primary text-on-primary' 
                      : 'bg-surface-high text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Activity List */}
          <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
            {filteredActivities.map((act) => (
              <div key={act.id} className="p-3 bg-surface-high/40 rounded-xl border border-outline-variant/10 flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-3">
                  <div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getActivityBadgeColor(act.type)}`}>
                    {act.type}
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface m-0">{act.action}</p>
                    <p className="text-[11px] text-on-surface-variant m-0 mt-0.5">{act.details}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono text-[11px] text-on-surface-variant m-0">{act.timestamp}</p>
                  <p className="font-mono text-[10px] text-on-surface-variant/70 m-0">{act.ip}</p>
                </div>
              </div>
            ))}

            {filteredActivities.length === 0 && (
              <p className="text-xs text-on-surface-variant text-center py-4">No activity records found for this filter.</p>
            )}
          </div>
        </div>

        {/* Confirmation or Actions Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-outline-variant/20">
          {confirmRevoke ? (
            <div className="w-full bg-error/10 border border-error/30 p-3 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-error font-medium">
                <AlertCircle size={16} />
                <span>Revoke session for <strong>{device.name}</strong>?</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConfirmRevoke(false)}
                  className="px-3 py-1.5 bg-surface-high text-xs rounded-lg text-on-surface hover:bg-surface-highest cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onRevokeAccess(device.id);
                    setConfirmRevoke(false);
                    onClose();
                  }}
                  className="px-4 py-1.5 bg-error text-on-error text-xs rounded-lg font-bold hover:bg-error/90 cursor-pointer shadow-md"
                >
                  Confirm Revoke
                </button>
              </div>
            </div>
          ) : (
            <>
              {device.status !== "REVOKED" ? (
                <button
                  onClick={() => setConfirmRevoke(true)}
                  className="px-4 py-2 bg-error/10 border border-error/30 text-error hover:bg-error/20 font-semibold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-2"
                >
                  <LogOut size={14} /> Revoke Device Access
                </button>
              ) : (
                <span className="text-xs text-error font-medium flex items-center gap-1">
                  <AlertCircle size={14} /> Access to this device has been revoked
                </span>
              )}

              <button
                onClick={onClose}
                className="px-5 py-2 bg-surface-high text-on-surface hover:bg-surface-highest font-medium rounded-xl text-xs transition-all cursor-pointer ml-auto"
              >
                Close Details
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
