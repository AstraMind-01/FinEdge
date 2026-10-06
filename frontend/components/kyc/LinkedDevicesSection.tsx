"use client";

import React, { useState } from "react";
import { Laptop, Smartphone, Tablet, Monitor, LogOut, History, Info } from "lucide-react";
import { LinkedDeviceData } from "../modals/DeviceDetailsModal";

interface LinkedDevicesSectionProps {
  devices: LinkedDeviceData[];
  onSelectDevice: (dev: LinkedDeviceData) => void;
  onPromptRevoke: (dev: { id: string | number; name: string; time: string; isCurrent: boolean }) => void;
}

export default function LinkedDevicesSection({
  devices,
  onSelectDevice,
  onPromptRevoke
}: LinkedDevicesSectionProps) {
  const [showPreviousDevices, setShowPreviousDevices] = useState(false);

  const displayedDevices = showPreviousDevices ? devices : devices.filter(d => d.status === 'ACTIVE');

  return (
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
        {displayedDevices.map(dev => {
          const Icon = dev.type === 'Laptop' ? Laptop : dev.type === 'Smartphone' ? Smartphone : dev.type === 'Tablet' ? Tablet : Monitor;
          return (
            <div 
              key={dev.id} 
              onClick={() => onSelectDevice(dev)}
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
                  onClick={() => onSelectDevice(dev)}
                  className="px-3 py-1.5 bg-surface-high text-on-surface-variant hover:text-primary hover:bg-surface-highest text-xs rounded-lg font-medium transition-all cursor-pointer"
                >
                  Details &amp; Activity
                </button>
                {dev.status !== 'REVOKED' && (
                  <button 
                    type="button"
                    onClick={() => onPromptRevoke({ id: dev.id, name: dev.name, time: dev.lastActive, isCurrent: dev.isCurrent })}
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

        {displayedDevices.length === 0 && (
          <p className="text-xs text-on-surface-variant text-center py-4">No devices found for this filter.</p>
        )}
      </div>
    </div>
  );
}
