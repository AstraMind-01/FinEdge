"use client";

import React, { useState, useEffect } from "react";
import { X, MapPin, Home, Upload, CheckCircle2, Loader2, AlertCircle, FileText } from "lucide-react";
import { UserAddress, VerificationEvent } from "../../types";
import { MockApi } from "../../lib/mockApi";

interface UpdateAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAddressData?: UserAddress;
  onAddressUpdated?: (updated: { address: UserAddress; events: VerificationEvent[] }) => void;
}

export default function UpdateAddressModal({
  isOpen,
  onClose,
  currentAddressData,
  onAddressUpdated
}: UpdateAddressModalProps) {
  const [currentAddrInput, setCurrentAddrInput] = useState("");
  const [permAddrInput, setPermAddrInput] = useState("");
  const [sameAsCurrent, setSameAsCurrent] = useState(true);
  const [proofType, setProofType] = useState("Passport / Driving License");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentAddressData) {
      setCurrentAddrInput(currentAddressData.currentAddress);
      setPermAddrInput(currentAddressData.permanentAddress);
      setSameAsCurrent(currentAddressData.isSameAsCurrent);
      setProofType(currentAddressData.proofDocumentType || "Passport / Driving License");
    }
  }, [currentAddressData, isOpen]);

  if (!isOpen) return null;

  const handleSameAsCurrentChange = (checked: boolean) => {
    setSameAsCurrent(checked);
    if (checked) {
      setPermAddrInput(currentAddrInput);
    }
  };

  const handleCurrentAddrChange = (val: string) => {
    setCurrentAddrInput(val);
    if (sameAsCurrent) {
      setPermAddrInput(val);
    }
    if (validationError) setValidationError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!currentAddrInput.trim() || currentAddrInput.trim().length < 10) {
      setValidationError("Please enter a valid current address (at least 10 characters).");
      return;
    }

    if (!sameAsCurrent && (!permAddrInput.trim() || permAddrInput.trim().length < 10)) {
      setValidationError("Please enter a valid permanent address (at least 10 characters).");
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);

    try {
      const res = await MockApi.updateUserAddress({
        currentAddress: currentAddrInput.trim(),
        permanentAddress: sameAsCurrent ? currentAddrInput.trim() : permAddrInput.trim(),
        isSameAsCurrent: sameAsCurrent,
        proofDocumentType: proofType
      });

      if (onAddressUpdated) {
        onAddressUpdated(res);
      }
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setValidationError("Failed to update address. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 overflow-y-auto py-6">
      <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-md p-6 shadow-2xl z-[10000] my-auto flex flex-col gap-5 text-on-surface">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-white/5 pb-4">
          <div>
            <h2 className="text-xl font-bold text-on-surface">Update Residential Address</h2>
            <p className="text-xs text-on-surface-variant">Update primary address with proof document &amp; backend persistence</p>
          </div>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors">
            <X size={20} />
          </button>
        </div>

        {validationError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-on-surface-variant block mb-1.5 flex items-center gap-1.5">
              <MapPin size={14} className="text-primary" /> Current Residential Address *
            </label>
            <textarea 
              rows={3}
              value={currentAddrInput}
              onChange={e => handleCurrentAddrChange(e.target.value)}
              placeholder="Enter building, street, landmark, city, state, pin code..."
              className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface font-medium focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="flex items-center gap-2 py-1">
            <input 
              type="checkbox" 
              id="sameAddress" 
              checked={sameAsCurrent} 
              onChange={e => handleSameAsCurrentChange(e.target.checked)} 
              className="w-4 h-4 accent-primary cursor-pointer"
            />
            <label htmlFor="sameAddress" className="font-bold text-on-surface cursor-pointer select-none">
              Permanent Address is same as Current Address
            </label>
          </div>

          {!sameAsCurrent && (
            <div>
              <label className="font-semibold text-on-surface-variant block mb-1.5 flex items-center gap-1.5">
                <Home size={14} className="text-primary" /> Permanent Address *
              </label>
              <textarea 
                rows={3}
                value={permAddrInput}
                onChange={e => {
                  setPermAddrInput(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Enter permanent residential address details..."
                className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface font-medium focus:outline-none focus:border-primary resize-none"
              />
            </div>
          )}

          <div>
            <label className="font-semibold text-on-surface-variant block mb-1.5">Select Address Proof Document</label>
            <select 
              value={proofType}
              onChange={e => setProofType(e.target.value)}
              className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3.5 py-2.5 text-on-surface font-medium focus:outline-none focus:border-primary"
            >
              <option value="Passport / Driving License">Passport / Driving License</option>
              <option value="Electricity / Utility Bill">Electricity / Utility Bill (Last 2 Months)</option>
              <option value="Registered Rental Agreement">Registered Rental Agreement</option>
              <option value="Voter ID Card">Voter ID Card</option>
            </select>
          </div>

          <div className="p-4 border-2 border-dashed border-white/10 hover:border-primary/40 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer relative bg-surface text-center">
            <input type="file" accept=".pdf,.png,.jpg" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            <Upload size={20} className="text-primary" />
            <span className="text-xs font-bold text-on-surface">
              {uploadedFile ? uploadedFile.name : `Upload ${proofType} Document`}
            </span>
            <span className="text-[10px] text-on-surface-variant">PDF, PNG or JPG up to 10MB</span>
            {uploadedFile && (
              <span className="px-2 py-0.5 rounded text-[10px] bg-teal-400/10 text-teal-400 border border-teal-400/20 flex items-center gap-1">
                <FileText size={10} /> Document Loaded
              </span>
            )}
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-white/5">
            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-surface-high text-on-surface font-semibold rounded-xl text-xs">Cancel</button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] flex items-center gap-1.5 disabled:opacity-40"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Saving to DB...
                </>
              ) : (
                <>
                  Save &amp; Update Address <CheckCircle2 size={16} />
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
