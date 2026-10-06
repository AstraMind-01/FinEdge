"use client";

import React from "react";
import { FileText } from "lucide-react";
import { LoanProductConfig } from "./loanProducts";

interface LoanStepDetailsProps {
  activeTypeKey: string;
  currentProduct: LoanProductConfig;
  // Personal
  employmentType: string;
  setEmploymentType: (v: string) => void;
  employerName: string;
  setEmployerName: (v: string) => void;
  monthlySalary: string;
  setMonthlySalary: (v: string) => void;
  existingEmis: string;
  setExistingEmis: (v: string) => void;
  loanPurpose: string;
  setLoanPurpose: (v: string) => void;
  // Home
  propertyStatus: string;
  setPropertyStatus: (v: string) => void;
  propertyValue: string;
  setPropertyValue: (v: string) => void;
  propertyPincode: string;
  setPropertyPincode: (v: string) => void;
  coApplicant: string;
  setCoApplicant: (v: string) => void;
  // Car
  vehicleCategory: string;
  setVehicleCategory: (v: string) => void;
  vehicleModel: string;
  setVehicleModel: (v: string) => void;
  onRoadPrice: string;
  setOnRoadPrice: (v: string) => void;
  downPayment: string;
  setDownPayment: (v: string) => void;
  // Education
  institutionName: string;
  setInstitutionName: (v: string) => void;
  courseLevel: string;
  setCourseLevel: (v: string) => void;
  courseCountry: string;
  setCourseCountry: (v: string) => void;
  totalCourseFees: string;
  setTotalCourseFees: (v: string) => void;
  coBorrowerIncome: string;
  setCoBorrowerIncome: (v: string) => void;
}

export default function LoanStepDetails({
  activeTypeKey,
  currentProduct,
  employmentType,
  setEmploymentType,
  employerName,
  setEmployerName,
  monthlySalary,
  setMonthlySalary,
  existingEmis,
  setExistingEmis,
  loanPurpose,
  setLoanPurpose,
  propertyStatus,
  setPropertyStatus,
  propertyValue,
  setPropertyValue,
  propertyPincode,
  setPropertyPincode,
  coApplicant,
  setCoApplicant,
  vehicleCategory,
  setVehicleCategory,
  vehicleModel,
  setVehicleModel,
  onRoadPrice,
  setOnRoadPrice,
  downPayment,
  setDownPayment,
  institutionName,
  setInstitutionName,
  courseLevel,
  setCourseLevel,
  courseCountry,
  setCourseCountry,
  totalCourseFees,
  setTotalCourseFees,
  coBorrowerIncome,
  setCoBorrowerIncome,
}: LoanStepDetailsProps) {
  return (
    <div className="space-y-4 text-xs">
      <div className="p-3 bg-surface-container-high rounded-xl border border-white/5 text-[11px] text-on-surface-variant flex items-center gap-2">
        <FileText size={16} className="text-primary shrink-0" />
        <span>
          Please fill in specific details for your <strong>{currentProduct.name}</strong>.
        </span>
      </div>

      {/* PERSONAL LOAN FIELDS */}
      {activeTypeKey === "PERSONAL" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-on-surface-variant block mb-1">Employment Type</label>
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface"
            >
              <option value="Salaried">Salaried Employee</option>
              <option value="Self-Employed Professional">Self-Employed Professional</option>
              <option value="Business Owner">Business Owner</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-on-surface-variant block mb-1">Employer / Company Name</label>
            <input
              type="text"
              value={employerName}
              onChange={(e) => setEmployerName(e.target.value)}
              className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface"
            />
          </div>

          <div>
            <label className="font-semibold text-on-surface-variant block mb-1">Monthly Net In-Hand Income (₹)</label>
            <input
              type="number"
              value={monthlySalary}
              onChange={(e) => setMonthlySalary(e.target.value)}
              className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface font-mono font-bold"
            />
          </div>

          <div>
            <label className="font-semibold text-on-surface-variant block mb-1">Current Monthly Existing EMIs (₹)</label>
            <input
              type="number"
              value={existingEmis}
              onChange={(e) => setExistingEmis(e.target.value)}
              className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface font-mono font-bold"
            />
          </div>

          <div className="col-span-2">
            <label className="font-semibold text-on-surface-variant block mb-1">Purpose of Loan</label>
            <select
              value={loanPurpose}
              onChange={(e) => setLoanPurpose(e.target.value)}
              className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface"
            >
              <option value="Debt Consolidation">Debt Consolidation</option>
              <option value="Home Renovation">Home Renovation</option>
              <option value="Medical Emergency">Medical Emergency</option>
              <option value="Wedding Expenses">Wedding Expenses</option>
              <option value="International Travel">International Travel</option>
            </select>
          </div>
        </div>
      )}

      {/* HOME LOAN FIELDS */}
      {activeTypeKey === "HOME" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-on-surface-variant block mb-1">Property Status</label>
            <select
              value={propertyStatus}
              onChange={(e) => setPropertyStatus(e.target.value)}
              className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface"
            >
              <option value="Ready to Move">Ready to Move Property</option>
              <option value="Under Construction">Under Construction (RERA Registered)</option>
              <option value="Resale Property">Resale / Secondary Sale</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-on-surface-variant block mb-1">Estimated Market Value (₹)</label>
            <input
              type="number"
              value={propertyValue}
              onChange={(e) => setPropertyValue(e.target.value)}
              className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface font-mono font-bold"
            />
          </div>

          <div>
            <label className="font-semibold text-on-surface-variant block mb-1">Property Pincode</label>
            <input
              type="text"
              value={propertyPincode}
              onChange={(e) => setPropertyPincode(e.target.value)}
              className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface font-mono"
            />
          </div>

          <div>
            <label className="font-semibold text-on-surface-variant block mb-1">Co-Applicant</label>
            <select
              value={coApplicant}
              onChange={(e) => setCoApplicant(e.target.value)}
              className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface"
            >
              <option value="Spouse">Spouse (Boosts Eligibility)</option>
              <option value="Parent">Parent</option>
              <option value="None">None (Individual)</option>
            </select>
          </div>
        </div>
      )}

      {/* CAR LOAN FIELDS */}
      {activeTypeKey === "CAR" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-on-surface-variant block mb-1">Vehicle Category</label>
            <select
              value={vehicleCategory}
              onChange={(e) => setVehicleCategory(e.target.value)}
              className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface"
            >
              <option value="New Car">Brand New Vehicle</option>
              <option value="Pre-Owned Car">Certified Pre-Owned Car</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-on-surface-variant block mb-1">Vehicle Manufacturer &amp; Model</label>
            <input
              type="text"
              value={vehicleModel}
              onChange={(e) => setVehicleModel(e.target.value)}
              className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface font-bold"
            />
          </div>

          <div>
            <label className="font-semibold text-on-surface-variant block mb-1">On-Road Price Quote (₹)</label>
            <input
              type="number"
              value={onRoadPrice}
              onChange={(e) => setOnRoadPrice(e.target.value)}
              className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface font-mono font-bold"
            />
          </div>

          <div>
            <label className="font-semibold text-on-surface-variant block mb-1">Proposed Down Payment (₹)</label>
            <input
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(e.target.value)}
              className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface font-mono font-bold"
            />
          </div>
        </div>
      )}

      {/* EDUCATION LOAN FIELDS */}
      {activeTypeKey === "EDUCATION" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="font-semibold text-on-surface-variant block mb-1">University / Institution Name</label>
            <input
              type="text"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
              className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface font-bold"
            />
          </div>

          <div>
            <label className="font-semibold text-on-surface-variant block mb-1">Course Level</label>
            <select
              value={courseLevel}
              onChange={(e) => setCourseLevel(e.target.value)}
              className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface"
            >
              <option value="Undergraduate (BSc/BTech)">Undergraduate (BSc/BTech)</option>
              <option value="Postgraduate (MSc/MBA)">Postgraduate (MSc/MBA)</option>
              <option value="Doctorate / PhD">Doctorate / PhD</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-on-surface-variant block mb-1">Course Country</label>
            <select
              value={courseCountry}
              onChange={(e) => setCourseCountry(e.target.value)}
              className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface"
            >
              <option value="United Kingdom">United Kingdom</option>
              <option value="United States">United States</option>
              <option value="India (Domestic)">India (Domestic Top Tier)</option>
              <option value="Germany / EU">Germany / Europe</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-on-surface-variant block mb-1">Total Course Fees &amp; Expenses (₹)</label>
            <input
              type="number"
              value={totalCourseFees}
              onChange={(e) => setTotalCourseFees(e.target.value)}
              className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface font-mono font-bold"
            />
          </div>

          <div>
            <label className="font-semibold text-on-surface-variant block mb-1">Co-Borrower Annual Income (₹)</label>
            <input
              type="number"
              value={coBorrowerIncome}
              onChange={(e) => setCoBorrowerIncome(e.target.value)}
              className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface font-mono font-bold"
            />
          </div>
        </div>
      )}
    </div>
  );
}
