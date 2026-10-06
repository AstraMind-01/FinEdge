"use client";

import React from "react";
import { MapPin, HeartHandshake, CreditCard } from "lucide-react";
import { AccountOpeningFormData } from "./wizardTypes";

interface StepAddressAndPreferencesProps {
  currentStep: number;
  formData: AccountOpeningFormData;
  updateForm: (fields: Partial<AccountOpeningFormData>) => void;
}

export default function StepAddressAndPreferences({
  currentStep,
  formData,
  updateForm,
}: StepAddressAndPreferencesProps) {
  if (currentStep === 3) {
    return (
      <div className="flex flex-col gap-4 animate-in fade-in duration-200 text-xs">
        <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
          <MapPin size={16} className="text-primary" /> Step 3: Address Details & Registered Nominee
        </h3>

        <div className="flex flex-col gap-2 p-3.5 bg-surface-high/60 rounded-xl border border-outline-variant/10">
          <span className="font-semibold text-on-surface">Permanent Communication Address</span>
          <textarea
            rows={2}
            value={formData.address}
            onChange={(e) => updateForm({ address: e.target.value })}
            className="bg-surface border border-outline-variant/30 p-2.5 rounded-xl text-on-surface focus:outline-none focus:border-primary"
          />
          <div className="grid grid-cols-3 gap-2 mt-1">
            <input
              type="text"
              placeholder="City"
              value={formData.city}
              onChange={(e) => updateForm({ city: e.target.value })}
              className="bg-surface border border-outline-variant/30 p-2 rounded-lg text-on-surface"
            />
            <input
              type="text"
              placeholder="State"
              value={formData.state}
              onChange={(e) => updateForm({ state: e.target.value })}
              className="bg-surface border border-outline-variant/30 p-2 rounded-lg text-on-surface"
            />
            <input
              type="text"
              placeholder="Pincode"
              value={formData.pincode}
              onChange={(e) => updateForm({ pincode: e.target.value })}
              className="bg-surface border border-outline-variant/30 p-2 rounded-lg text-on-surface font-mono"
            />
          </div>
        </div>

        {/* Nominee */}
        <div className="flex flex-col gap-3 pt-2 border-t border-white/5">
          <span className="font-semibold text-on-surface flex items-center gap-2">
            <HeartHandshake size={16} className="text-tertiary" /> Nominee Declaration
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-on-surface-variant font-medium">Nominee Full Name</label>
              <input
                type="text"
                value={formData.nomineeName}
                onChange={(e) => updateForm({ nomineeName: e.target.value })}
                className="bg-surface border border-outline-variant/30 p-2.5 rounded-xl text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-on-surface-variant font-medium">Relationship to Applicant</label>
              <select
                value={formData.nomineeRelation}
                onChange={(e) => updateForm({ nomineeRelation: e.target.value })}
                className="bg-surface border border-outline-variant/30 p-2.5 rounded-xl text-on-surface focus:outline-none focus:border-primary"
              >
                <option>Spouse</option>
                <option>Parent (Father/Mother)</option>
                <option>Child (Son/Daughter)</option>
                <option>Sibling (Brother/Sister)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 4) {
    return (
      <div className="flex flex-col gap-4 animate-in fade-in duration-200 text-xs">
        <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
          <CreditCard size={16} className="text-primary" /> Step 4: Banking Preferences & Initial Funding
        </h3>

        <div className="flex flex-col gap-2">
          <label className="font-medium text-on-surface-variant">Debit Card Preference</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { title: "Visa Platinum", card: "Visa Platinum Contactless" },
              { title: "RuPay Select", card: "RuPay Select Premium" },
              { title: "Mastercard World", card: "Mastercard World Debit" },
            ].map((c) => (
              <button
                key={c.card}
                type="button"
                onClick={() => updateForm({ debitCardType: c.card })}
                className={`p-3 rounded-xl border flex flex-col items-center text-center gap-1 transition-all cursor-pointer ${
                  formData.debitCardType === c.card
                    ? "border-primary bg-primary/10 font-bold text-on-surface"
                    : "border-outline-variant/20 bg-surface"
                }`}
              >
                <CreditCard size={18} className="text-primary mb-1" />
                <span>{c.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Services Checkboxes */}
        <div className="flex gap-4 p-3 bg-surface rounded-xl border border-outline-variant/10">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.requestChequeBook}
              onChange={(e) => updateForm({ requestChequeBook: e.target.checked })}
              className="accent-primary"
            />
            <span>Request Physical Cheque Book (25 Leaves)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.whatsappBanking}
              onChange={(e) => updateForm({ whatsappBanking: e.target.checked })}
              className="accent-primary"
            />
            <span>Enable Instant WhatsApp Banking Alerts</span>
          </label>
        </div>

        {/* Initial Funding */}
        <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
          <span className="font-semibold text-on-surface">Initial Account Deposit Amount</span>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-on-surface-variant font-medium">Funding Method</label>
              <select
                value={formData.fundingMethod}
                onChange={(e) => updateForm({ fundingMethod: e.target.value })}
                className="bg-surface border border-outline-variant/30 p-2.5 rounded-xl text-on-surface"
              >
                <option>UPI Instant Transfer</option>
                <option>Net Banking Gateway</option>
                <option>Existing FinEdge Account Transfer</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-on-surface-variant font-medium">Initial Deposit Amount (₹)</label>
              <input
                type="number"
                value={formData.initialDeposit}
                onChange={(e) => updateForm({ initialDeposit: Number(e.target.value) })}
                className="bg-surface border border-outline-variant/30 p-2.5 rounded-xl text-on-surface font-mono font-bold"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
