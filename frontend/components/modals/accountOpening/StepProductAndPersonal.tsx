"use client";

import React from "react";
import { Landmark, User } from "lucide-react";
import { AccountOpeningFormData, getProductInfo } from "./wizardTypes";

interface StepProductAndPersonalProps {
  currentStep: number;
  formData: AccountOpeningFormData;
  updateForm: (fields: Partial<AccountOpeningFormData>) => void;
}

export default function StepProductAndPersonal({
  currentStep,
  formData,
  updateForm,
}: StepProductAndPersonalProps) {
  const prodInfo = getProductInfo(formData.productType);

  if (currentStep === 1) {
    return (
      <div className="flex flex-col gap-4 animate-in fade-in duration-200 text-xs">
        <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
          <Landmark size={16} className="text-primary" /> Step 1: Product Selection & Eligibility Check
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: "savings", title: "Savings", yield: "4.00% p.a." },
            { id: "current", title: "Current", yield: "Business" },
            { id: "fd", title: "Fixed Deposit", yield: "7.25% p.a." },
            { id: "rd", title: "Recurring Deposit", yield: "7.10% p.a." },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => updateForm({ productType: item.id as any })}
              className={`p-3 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all cursor-pointer ${
                formData.productType === item.id
                  ? "border-primary bg-primary/10 text-on-surface font-bold shadow-md"
                  : "border-outline-variant/20 bg-surface-high/40 text-on-surface-variant hover:border-white/20"
              }`}
            >
              <span className="font-semibold text-xs">{item.title}</span>
              <span className="text-[10px] text-primary font-mono">{item.yield}</span>
            </button>
          ))}
        </div>

        {/* Product Info Card */}
        <div className="p-4 bg-surface-high/60 rounded-xl border border-outline-variant/10 grid grid-cols-3 gap-3">
          <div>
            <span className="text-[10px] text-on-surface-variant uppercase font-medium">Interest Yield</span>
            <p className="font-bold text-base text-primary font-mono mt-0.5">{prodInfo.rate}</p>
          </div>
          <div>
            <span className="text-[10px] text-on-surface-variant uppercase font-medium">Min. Balance</span>
            <p className="font-bold text-sm text-on-surface font-mono mt-0.5">{prodInfo.minBal}</p>
          </div>
          <div>
            <span className="text-[10px] text-on-surface-variant uppercase font-medium">Account Maintenance</span>
            <p className="font-bold text-sm text-tertiary font-mono mt-0.5">{prodInfo.fee}</p>
          </div>
        </div>

        {/* Ownership Type */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-on-surface-variant">Account Ownership Mode</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="ownership"
                checked={formData.ownershipType === "INDIVIDUAL"}
                onChange={() => updateForm({ ownershipType: "INDIVIDUAL" })}
                className="accent-primary"
              />
              <span>Single Individual Ownership</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="ownership"
                checked={formData.ownershipType === "JOINT"}
                onChange={() => updateForm({ ownershipType: "JOINT" })}
                className="accent-primary"
              />
              <span>Joint Account (Primary + Secondary Holder)</span>
            </label>
          </div>
        </div>

        {/* Eligibility Checkboxes */}
        <div className="flex flex-col gap-2 p-3 bg-surface rounded-xl border border-outline-variant/10">
          <span className="font-semibold text-on-surface">Mandatory Eligibility Criteria</span>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isAge18Plus}
              onChange={(e) => updateForm({ isAge18Plus: e.target.checked })}
              className="accent-primary"
            />
            <span>I am an individual applicant aged 18 years or older</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isTaxResident}
              onChange={(e) => updateForm({ isTaxResident: e.target.checked })}
              className="accent-primary"
            />
            <span>I am a resident tax payer of India</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isNotPep}
              onChange={(e) => updateForm({ isNotPep: e.target.checked })}
              className="accent-primary"
            />
            <span>I confirm I am not a Politically Exposed Person (PEP)</span>
          </label>
        </div>
      </div>
    );
  }

  if (currentStep === 2) {
    return (
      <div className="flex flex-col gap-4 animate-in fade-in duration-200 text-xs">
        <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
          <User size={16} className="text-primary" /> Step 2: Personal Information & Income Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-on-surface-variant font-medium">Full Name (As per PAN/Aadhaar)</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => updateForm({ fullName: e.target.value })}
              className="bg-surface border border-outline-variant/30 p-2.5 rounded-xl text-on-surface focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-on-surface-variant font-medium">PAN Card Number</label>
            <input
              type="text"
              value={formData.panNumber}
              onChange={(e) => updateForm({ panNumber: e.target.value.toUpperCase() })}
              className="bg-surface border border-outline-variant/30 p-2.5 rounded-xl font-mono text-on-surface focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-on-surface-variant font-medium">Aadhaar Number</label>
            <input
              type="text"
              value={formData.aadhaarNumber}
              onChange={(e) => updateForm({ aadhaarNumber: e.target.value })}
              className="bg-surface border border-outline-variant/30 p-2.5 rounded-xl font-mono text-on-surface focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-on-surface-variant font-medium">Date of Birth</label>
            <input
              type="date"
              value={formData.dob}
              onChange={(e) => updateForm({ dob: e.target.value })}
              className="bg-surface border border-outline-variant/30 p-2.5 rounded-xl text-on-surface focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-on-surface-variant font-medium">Father&apos;s Full Name</label>
            <input
              type="text"
              value={formData.fatherName}
              onChange={(e) => updateForm({ fatherName: e.target.value })}
              className="bg-surface border border-outline-variant/30 p-2.5 rounded-xl text-on-surface focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-on-surface-variant font-medium">Mother&apos;s Full Name</label>
            <input
              type="text"
              value={formData.motherName}
              onChange={(e) => updateForm({ motherName: e.target.value })}
              className="bg-surface border border-outline-variant/30 p-2.5 rounded-xl text-on-surface focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/5">
          <div className="flex flex-col gap-1">
            <label className="text-on-surface-variant font-medium">Occupation Type</label>
            <select
              value={formData.occupation}
              onChange={(e) => updateForm({ occupation: e.target.value })}
              className="bg-surface border border-outline-variant/30 p-2.5 rounded-xl text-on-surface focus:outline-none focus:border-primary"
            >
              <option>Salaried Professional</option>
              <option>Self-Employed / Business Owner</option>
              <option>Professional (Doctor/CA/Lawyer)</option>
              <option>Student</option>
              <option>Retired</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-on-surface-variant font-medium">Annual Income Range</label>
            <select
              value={formData.annualIncome}
              onChange={(e) => updateForm({ annualIncome: e.target.value })}
              className="bg-surface border border-outline-variant/30 p-2.5 rounded-xl text-on-surface focus:outline-none focus:border-primary"
            >
              <option>Below ₹5,00,000</option>
              <option>₹5,00,000 - ₹10,00,000</option>
              <option>₹10,00,000 - ₹25,00,000</option>
              <option>Above ₹25,00,000</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
