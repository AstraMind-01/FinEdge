"use client";
import React, { useState } from 'react';
import { Calendar, ShieldCheck, Eye, EyeOff, Save, Lock, Unlock, Edit2 } from 'lucide-react';
import HighSecurityEditModal from '../modals/HighSecurityEditModal';

interface FieldChange {
  fieldName: string;
  oldValue: string;
  newValue: string;
}

interface PersonalInfoProps {
  onSavePersonalInfo?: (updatedData: Record<string, string>, changes: FieldChange[]) => void;
}

export default function PersonalInfo({ onSavePersonalInfo }: PersonalInfoProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPan, setShowPan] = useState(false);
  const [showAadhaar, setShowAadhaar] = useState(false);

  // Field States
  const [formData, setFormData] = useState({
    fullName: "Soumya Ranjan",
    dob: "14 Aug 1995",
    gender: "Male",
    maritalStatus: "Married",
    fatherName: "Alok Ranjan",
    nationality: "Indian",
    occupation: "Salaried - IT Professional",
    annualIncome: "₹ 25L - ₹ 50L",
    panNumber: "ABCDE1234F",
    aadhaarNumber: "123456789012"
  });

  const [initialData, setInitialData] = useState({ ...formData });
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [computedChanges, setComputedChanges] = useState<FieldChange[]>([]);

  const handleInputChange = (key: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Check if any fields changed
  const getModifiedFields = (): FieldChange[] => {
    const changes: FieldChange[] = [];
    const labels: Record<keyof typeof formData, string> = {
      fullName: "Full Name (As per PAN)",
      dob: "Date of Birth",
      gender: "Gender",
      maritalStatus: "Marital Status",
      fatherName: "Father's Name",
      nationality: "Nationality",
      occupation: "Occupation",
      annualIncome: "Annual Income",
      panNumber: "PAN Number",
      aadhaarNumber: "Aadhaar Number"
    };

    (Object.keys(formData) as Array<keyof typeof formData>).forEach(key => {
      if (formData[key] !== initialData[key]) {
        changes.push({
          fieldName: labels[key],
          oldValue: initialData[key],
          newValue: formData[key]
        });
      }
    });

    return changes;
  };

  const changes = getModifiedFields();
  const hasChanges = changes.length > 0;

  const handleInitiateSave = () => {
    if (!hasChanges) return;
    setComputedChanges(changes);
    setSecurityModalOpen(true);
  };

  const handleConfirmSave = () => {
    setInitialData({ ...formData });
    setIsEditMode(false);
    if (onSavePersonalInfo) {
      onSavePersonalInfo(formData, computedChanges);
    }
  };

  return (
    <div className="bg-surface-container rounded-xl border border-surface-container-highest overflow-hidden shadow-lg p-6 md:p-8 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-xl font-semibold m-0 text-on-surface flex items-center gap-2">
            Personal Information
            {isEditMode ? (
              <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold uppercase">Editing Enabled</span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] bg-teal-400/10 text-teal-400 border border-teal-400/20 font-bold uppercase">2FA Protected</span>
            )}
          </h3>
          <span className="text-xs text-on-surface-variant">Confidential KYC Master Record</span>
        </div>

        <button 
          type="button"
          onClick={() => setIsEditMode(!isEditMode)}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
            isEditMode 
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' 
              : 'bg-surface-high text-primary border-primary/20 hover:border-primary/40'
          }`}
        >
          {isEditMode ? <Lock size={14} /> : <Edit2 size={14} />}
          {isEditMode ? "Lock Fields" : "Unlock to Edit"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-xs">
        {/* Full Name */}
        <div className="flex flex-col gap-1 relative group/input">
          <label className="text-on-surface-variant font-medium">Full Name (As per PAN)</label>
          <input 
            type="text"
            readOnly={!isEditMode}
            value={formData.fullName}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
            className={`w-full bg-[#1E293B] border-b outline-none text-sm text-on-surface py-2 px-3 rounded-t-sm transition-all ${
              isEditMode ? 'border-primary shadow-[0_1px_0_0_#f0b429]' : 'border-surface-container-highest cursor-default'
            }`}
          />
        </div>

        {/* Date of Birth */}
        <div className="flex flex-col gap-1 relative group/input">
          <label className="text-on-surface-variant font-medium">Date of Birth</label>
          <div className="relative">
            <input 
              type="text"
              readOnly={!isEditMode}
              value={formData.dob}
              onChange={(e) => handleInputChange("dob", e.target.value)}
              className={`w-full bg-[#1E293B] border-b outline-none text-sm text-on-surface py-2 px-3 rounded-t-sm transition-all ${
                isEditMode ? 'border-primary shadow-[0_1px_0_0_#f0b429]' : 'border-surface-container-highest cursor-default'
              }`}
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
          </div>
        </div>

        {/* Gender */}
        <div className="flex flex-col gap-1 relative group/input">
          <label className="text-on-surface-variant font-medium">Gender</label>
          {isEditMode ? (
            <select 
              value={formData.gender}
              onChange={(e) => handleInputChange("gender", e.target.value)}
              className="w-full bg-[#1E293B] border-b border-primary shadow-[0_1px_0_0_#f0b429] outline-none text-sm text-on-surface py-2 px-3 rounded-t-sm"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          ) : (
            <input 
              type="text" 
              readOnly 
              value={formData.gender} 
              className="w-full bg-[#1E293B] border-b border-surface-container-highest outline-none text-sm text-on-surface py-2 px-3 rounded-t-sm cursor-default" 
            />
          )}
        </div>

        {/* Marital Status */}
        <div className="flex flex-col gap-1 relative group/input">
          <label className="text-on-surface-variant font-medium">Marital Status</label>
          {isEditMode ? (
            <select 
              value={formData.maritalStatus}
              onChange={(e) => handleInputChange("maritalStatus", e.target.value)}
              className="w-full bg-[#1E293B] border-b border-primary shadow-[0_1px_0_0_#f0b429] outline-none text-sm text-on-surface py-2 px-3 rounded-t-sm"
            >
              <option value="Single">Single</option>
              <option value="Married">Married</option>
            </select>
          ) : (
            <input 
              type="text" 
              readOnly 
              value={formData.maritalStatus} 
              className="w-full bg-[#1E293B] border-b border-surface-container-highest outline-none text-sm text-on-surface py-2 px-3 rounded-t-sm cursor-default" 
            />
          )}
        </div>

        {/* Father's Name */}
        <div className="flex flex-col gap-1 relative group/input">
          <label className="text-on-surface-variant font-medium">Father's Name</label>
          <input 
            type="text"
            readOnly={!isEditMode}
            value={formData.fatherName}
            onChange={(e) => handleInputChange("fatherName", e.target.value)}
            className={`w-full bg-[#1E293B] border-b outline-none text-sm text-on-surface py-2 px-3 rounded-t-sm transition-all ${
              isEditMode ? 'border-primary shadow-[0_1px_0_0_#f0b429]' : 'border-surface-container-highest cursor-default'
            }`}
          />
        </div>

        {/* Nationality */}
        <div className="flex flex-col gap-1 relative group/input">
          <label className="text-on-surface-variant font-medium">Nationality</label>
          <input 
            type="text"
            readOnly={!isEditMode}
            value={formData.nationality}
            onChange={(e) => handleInputChange("nationality", e.target.value)}
            className={`w-full bg-[#1E293B] border-b outline-none text-sm text-on-surface py-2 px-3 rounded-t-sm transition-all ${
              isEditMode ? 'border-primary shadow-[0_1px_0_0_#f0b429]' : 'border-surface-container-highest cursor-default'
            }`}
          />
        </div>

        {/* Occupation */}
        <div className="flex flex-col gap-1 relative group/input">
          <label className="text-on-surface-variant font-medium">Occupation</label>
          <input 
            type="text"
            readOnly={!isEditMode}
            value={formData.occupation}
            onChange={(e) => handleInputChange("occupation", e.target.value)}
            className={`w-full bg-[#1E293B] border-b outline-none text-sm text-on-surface py-2 px-3 rounded-t-sm transition-all ${
              isEditMode ? 'border-primary shadow-[0_1px_0_0_#f0b429]' : 'border-surface-container-highest cursor-default'
            }`}
          />
        </div>

        {/* Annual Income */}
        <div className="flex flex-col gap-1 relative group/input">
          <label className="text-on-surface-variant font-medium">Annual Income</label>
          <input 
            type="text"
            readOnly={!isEditMode}
            value={formData.annualIncome}
            onChange={(e) => handleInputChange("annualIncome", e.target.value)}
            className={`w-full bg-[#1E293B] border-b outline-none text-sm text-on-surface py-2 px-3 rounded-t-sm transition-all ${
              isEditMode ? 'border-primary shadow-[0_1px_0_0_#f0b429]' : 'border-surface-container-highest cursor-default'
            }`}
          />
        </div>

        {/* Secure PAN */}
        <div className="flex flex-col gap-1 relative group/input">
          <label className="text-on-surface-variant font-medium flex justify-between">
            <span>PAN Number</span>
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          </label>
          <div className="relative">
            <input 
              readOnly={!isEditMode}
              type={showPan ? "text" : "password"} 
              value={formData.panNumber}
              onChange={(e) => handleInputChange("panNumber", e.target.value)}
              className={`w-full bg-[#1E293B] border-b outline-none font-mono tracking-widest text-on-surface py-2 px-3 rounded-t-sm ${
                isEditMode ? 'border-primary shadow-[0_1px_0_0_#f0b429]' : 'border-surface-container-highest cursor-default'
              }`}
            />
            <button 
              type="button"
              onClick={() => setShowPan(!showPan)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
            >
              {showPan ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Secure Aadhaar */}
        <div className="flex flex-col gap-1 relative group/input">
          <label className="text-on-surface-variant font-medium flex justify-between">
            <span>Aadhaar Number</span>
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          </label>
          <div className="relative">
            <input 
              readOnly={!isEditMode}
              type={showAadhaar ? "text" : "password"} 
              value={formData.aadhaarNumber}
              onChange={(e) => handleInputChange("aadhaarNumber", e.target.value)}
              className={`w-full bg-[#1E293B] border-b outline-none font-mono tracking-widest text-on-surface py-2 px-3 rounded-t-sm ${
                isEditMode ? 'border-primary shadow-[0_1px_0_0_#f0b429]' : 'border-surface-container-highest cursor-default'
              }`}
            />
            <button 
              type="button"
              onClick={() => setShowAadhaar(!showAadhaar)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
            >
              {showAadhaar ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-surface-container-highest flex justify-between items-center">
        <span className="text-[11px] text-on-surface-variant">
          {hasChanges ? `${changes.length} field(s) modified • Requires 2FA Verification` : 'No unsaved modifications'}
        </span>
        <button 
          type="button"
          onClick={handleInitiateSave}
          disabled={!hasChanges}
          className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            hasChanges 
              ? 'bg-primary text-on-primary hover:bg-primary-fixed hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] cursor-pointer' 
              : 'bg-surface-variant text-on-surface-variant cursor-not-allowed opacity-40'
          }`}
        >
          <Save size={16} />
          Save Changes with 2FA
        </button>
      </div>

      {/* High Security Verification Modal */}
      <HighSecurityEditModal 
        isOpen={securityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
        changes={computedChanges}
        onConfirmSave={handleConfirmSave}
      />
    </div>
  );
}
