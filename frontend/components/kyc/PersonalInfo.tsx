"use client";
import React, { useState } from 'react';
import { Calendar, ShieldCheck, Eye, EyeOff, Save } from 'lucide-react';

export default function PersonalInfo() {
  const [showPan, setShowPan] = useState(false);
  const [showAadhaar, setShowAadhaar] = useState(false);
  const [occupation, setOccupation] = useState("Salaried - IT Professional");
  const [income, setIncome] = useState("₹ 25L - ₹ 50L");

  // Mock checking if there are changes to enable save button
  const hasChanges = occupation !== "Salaried - IT Professional" || income !== "₹ 25L - ₹ 50L";

  return (
    <div className="bg-surface-container rounded-xl border border-surface-container-highest overflow-hidden shadow-lg p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold m-0">Personal Information</h3>
        <span className="text-xs text-outline">Confidential</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {/* Field */}
        <div className="flex flex-col gap-1 relative group/input">
          <label className="text-xs text-on-surface-variant font-medium">Full Name (As per PAN)</label>
          <div className="relative">
            <input 
              className="w-full bg-[#1E293B] border-b border-surface-container-highest outline-none text-sm text-on-surface py-2 px-3 rounded-t-sm focus:border-primary focus:ring-0 transition-colors group-hover/input:bg-[#1E293B]/80 cursor-default" 
              readOnly 
              type="text" 
              value="Soumya Ranjan"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 relative group/input">
          <label className="text-xs text-on-surface-variant font-medium">Date of Birth</label>
          <div className="relative">
            <input 
              className="w-full bg-[#1E293B] border-b border-surface-container-highest outline-none text-sm text-on-surface py-2 px-3 rounded-t-sm focus:border-primary focus:ring-0 transition-colors group-hover/input:bg-[#1E293B]/80 cursor-default" 
              readOnly 
              type="text" 
              value="14 Aug 1995"
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
          </div>
        </div>

        <div className="flex flex-col gap-1 relative group/input">
          <label className="text-xs text-on-surface-variant font-medium">Gender</label>
          <div className="relative">
            <input 
              className="w-full bg-[#1E293B] border-b border-surface-container-highest outline-none text-sm text-on-surface py-2 px-3 rounded-t-sm focus:border-primary focus:ring-0 transition-colors group-hover/input:bg-[#1E293B]/80 cursor-default" 
              readOnly 
              type="text" 
              value="Male"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 relative group/input">
          <label className="text-xs text-on-surface-variant font-medium">Marital Status</label>
          <div className="relative">
            <input 
              className="w-full bg-[#1E293B] border-b border-surface-container-highest outline-none text-sm text-on-surface py-2 px-3 rounded-t-sm focus:border-primary focus:ring-0 transition-colors group-hover/input:bg-[#1E293B]/80 cursor-default" 
              readOnly 
              type="text" 
              value="Married"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 relative group/input">
          <label className="text-xs text-on-surface-variant font-medium">Father's Name</label>
          <div className="relative">
            <input 
              className="w-full bg-[#1E293B] border-b border-surface-container-highest outline-none text-sm text-on-surface py-2 px-3 rounded-t-sm focus:border-primary focus:ring-0 transition-colors group-hover/input:bg-[#1E293B]/80 cursor-default" 
              readOnly 
              type="text" 
              value="Alok Ranjan"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 relative group/input">
          <label className="text-xs text-on-surface-variant font-medium">Nationality</label>
          <div className="relative">
            <input 
              className="w-full bg-[#1E293B] border-b border-surface-container-highest outline-none text-sm text-on-surface py-2 px-3 rounded-t-sm focus:border-primary focus:ring-0 transition-colors group-hover/input:bg-[#1E293B]/80 cursor-default" 
              readOnly 
              type="text" 
              value="Indian"
            />
          </div>
        </div>

        {/* Editable fields */}
        <div className="flex flex-col gap-1 relative group/input">
          <label className="text-xs text-on-surface-variant font-medium">Occupation</label>
          <div className="relative">
            <input 
              className="w-full bg-[#1E293B] border-b border-outline-variant outline-none text-sm text-on-surface py-2 px-3 rounded-t-sm focus:border-primary focus:shadow-[0_1px_0_0_#f0b429] transition-all group-hover/input:bg-[#1E293B]/80" 
              type="text" 
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 relative group/input">
          <label className="text-xs text-on-surface-variant font-medium">Annual Income</label>
          <div className="relative">
            <input 
              className="w-full bg-[#1E293B] border-b border-outline-variant outline-none text-sm text-on-surface py-2 px-3 rounded-t-sm focus:border-primary focus:shadow-[0_1px_0_0_#f0b429] transition-all group-hover/input:bg-[#1E293B]/80" 
              type="text" 
              value={income}
              onChange={(e) => setIncome(e.target.value)}
            />
          </div>
        </div>

        {/* Secure fields */}
        <div className="flex flex-col gap-1 relative group/input">
          <label className="text-xs text-on-surface-variant font-medium flex justify-between">
            <span>PAN Number</span>
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          </label>
          <div className="relative">
            <input 
              className="w-full bg-[#1E293B] border-b border-surface-container-highest outline-none font-mono tracking-widest text-on-surface py-2 px-3 rounded-t-sm cursor-default" 
              readOnly 
              type={showPan ? "text" : "password"} 
              value="ABCDE1234F"
            />
            <button 
              onClick={() => setShowPan(!showPan)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
            >
              {showPan ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1 relative group/input">
          <label className="text-xs text-on-surface-variant font-medium flex justify-between">
            <span>Aadhaar Number</span>
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          </label>
          <div className="relative">
            <input 
              className="w-full bg-[#1E293B] border-b border-surface-container-highest outline-none font-mono tracking-widest text-on-surface py-2 px-3 rounded-t-sm cursor-default" 
              readOnly 
              type={showAadhaar ? "text" : "password"} 
              value="123456789012"
            />
            <button 
              onClick={() => setShowAadhaar(!showAadhaar)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
            >
              {showAadhaar ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-surface-container-highest flex justify-end">
        <button 
          className={`px-6 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all ${
            hasChanges 
              ? 'bg-primary text-on-primary hover:bg-primary-fixed hover:shadow-[0_0_15px_rgba(240,180,41,0.4)]' 
              : 'bg-surface-variant text-on-surface-variant cursor-not-allowed opacity-50'
          }`}
          disabled={!hasChanges}
        >
          <Save size={18} />
          Save Changes
        </button>
      </div>
    </div>
  );
}
