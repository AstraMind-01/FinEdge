"use client";

import React, { useState, useEffect } from "react";
import { 
  X, Landmark, Briefcase, Lock, PiggyBank, CheckCircle2, ShieldCheck, 
  ArrowRight, ArrowLeft, Loader2, Upload, FileText, Check, AlertCircle, 
  CreditCard, User, Building, MapPin, HeartHandshake, DollarSign, KeyRound, Download, Save
} from "lucide-react";
import { useAccounts } from "../../context/AccountContext";
import { AccountStatementBuilder } from "../../lib/pdf/documents/AccountStatement";

interface AccountOpeningWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProductType?: "savings" | "current" | "fd" | "rd";
}

const STEPS = [
  { id: 1, title: "Product & Eligibility", icon: Landmark },
  { id: 2, title: "Personal & Income", icon: User },
  { id: 3, title: "Address & Nominee", icon: MapPin },
  { id: 4, title: "Preferences & Funding", icon: CreditCard },
  { id: 5, title: "KYC Verification", icon: ShieldCheck },
  { id: 6, title: "Review & e-Sign", icon: FileText },
  { id: 7, title: "Account Active", icon: CheckCircle2 }
];

export default function AccountOpeningWizardModal({
  isOpen,
  onClose,
  defaultProductType = "savings"
}: AccountOpeningWizardModalProps) {
  const { userProfile, createNewAccount, refreshAllData } = useAccounts();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [createdAccResult, setCreatedAccResult] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Product
    productType: defaultProductType as "savings" | "current" | "fd" | "rd",
    accountVariant: "STANDARD",
    ownershipType: "INDIVIDUAL" as "INDIVIDUAL" | "JOINT",
    isAge18Plus: true,
    isTaxResident: true,
    isKycVerified: true,
    isNotPep: true,

    // Step 2: Personal & Income
    fullName: userProfile.name || "Soumya Ranjan",
    email: userProfile.email || "soumya@finedge.bank",
    phone: userProfile.phone || "+91 98765 43210",
    dob: "1994-08-15",
    gender: "Male",
    panNumber: "ABCDE1234F",
    aadhaarNumber: "9876 5432 1098",
    fatherName: "Rajesh Ranjan",
    motherName: "Sunita Ranjan",
    maritalStatus: "Single",
    occupation: "Salaried Professional",
    annualIncome: "₹10,00,000 - ₹25,00,000",
    industry: "Information Technology",
    sourceOfFunds: "Salary / Professional Income",

    // Step 3: Address & Nominee
    address: userProfile.address || "402, Skyline Towers, BKC, Mumbai - 400051",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400051",
    nomineeName: "Ananya Ranjan",
    nomineeRelation: "Spouse",
    nomineeDob: "1996-03-22",
    nomineeSameAddress: true,

    // Step 4: Preferences & Funding
    debitCardType: "Visa Platinum Contactless",
    requestChequeBook: true,
    whatsappBanking: true,
    fundingMethod: "UPI",
    initialDeposit: 10000,

    // Step 5: KYC Docs
    docType: "Aadhaar Card",
    docFrontUploaded: true,
    docBackUploaded: true,
    selfieVerified: true,

    // Step 6: Consent & e-Sign
    acceptTerms: true,
    acceptFatca: true,
    otpCode: ""
  });

  const [otpError, setOtpError] = useState<string | null>(null);

  // Sync defaultProductType prop when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({ ...prev, productType: defaultProductType }));
      // Load saved draft if present
      try {
        const savedDraft = localStorage.getItem("finedge_draft_account_application");
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          setFormData(parsed);
        }
      } catch (e) {}
    }
  }, [isOpen, defaultProductType]);

  if (!isOpen) return null;

  const updateForm = (fields: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...fields }));
  };

  const saveDraft = () => {
    try {
      localStorage.setItem("finedge_draft_account_application", JSON.stringify(formData));
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2000);
    } catch (e) {}
  };

  const handleNext = () => {
    if (currentStep === 6) {
      handleFinalSubmit();
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 7));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleFinalSubmit = async () => {
    setOtpError(null);
    if (!formData.otpCode || formData.otpCode.length < 6) {
      setOtpError("Please enter valid 6-digit Aadhaar OTP (Demo: 123456)");
      return;
    }

    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));

    try {
      const typeMap: Record<string, "SAVINGS" | "CURRENT" | "FIXED_DEPOSIT" | "RECURRING_DEPOSIT"> = {
        savings: "SAVINGS",
        current: "CURRENT",
        fd: "FIXED_DEPOSIT",
        rd: "RECURRING_DEPOSIT"
      };

      const type = typeMap[formData.productType] || "SAVINGS";
      const created = await createNewAccount({
        type,
        name: formData.productType === "savings" ? "High-Yield Savings Account" : formData.productType === "current" ? "Business Current Account" : formData.productType === "fd" ? "High Yield Fixed Deposit" : "Wealth Builder RD",
        initialDeposit: Number(formData.initialDeposit) || 10000,
        nominee: formData.nomineeName,
        nomineeRelation: formData.nomineeRelation
      });

      await refreshAllData();
      setCreatedAccResult(created);
      setIsSubmitting(false);
      setCurrentStep(7); // Move to Success Step
      // Clear draft
      localStorage.removeItem("finedge_draft_account_application");
    } catch (e) {
      setIsSubmitting(false);
      setOtpError("Account creation failed. Please try again.");
    }
  };

  const getProductInfo = () => {
    switch (formData.productType) {
      case "savings":
        return { name: "High-Yield Savings Account", rate: "4.00% p.a.", minBal: "₹0 Zero Balance", fee: "₹0 / Free" };
      case "current":
        return { name: "Business Current Account", rate: "N/A (Business)", minBal: "₹10,000 / month", fee: "₹0 / Free POS" };
      case "fd":
        return { name: "High Yield Fixed Deposit", rate: "7.25% p.a.", minBal: "₹10,000 Deposit", fee: "Zero Account Fees" };
      default:
        return { name: "Wealth Builder RD", rate: "7.10% p.a.", minBal: "₹1,000 / month", fee: "Zero Account Fees" };
    }
  };

  const prodInfo = getProductInfo();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 overflow-y-auto py-6">
      <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-3xl p-6 shadow-2xl z-[10000] my-auto flex flex-col gap-6 text-on-surface">
        
        {/* Header & Stepper */}
        <div className="flex flex-col gap-4 border-b border-white/5 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-primary font-mono uppercase tracking-wider font-bold">FinEdge Account Provisioning Wizard</span>
              <h2 className="text-xl font-bold text-on-surface">Digital Account Opening Application</h2>
            </div>
            <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors cursor-pointer">
              <X size={20} />
            </button>
          </div>

          {/* Progress Stepper */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
            {STEPS.map((s) => {
              const Icon = s.icon;
              const isActive = currentStep === s.id;
              const isCompleted = currentStep > s.id;

              return (
                <div key={s.id} className="flex items-center gap-2 shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted ? 'bg-tertiary text-on-tertiary' : isActive ? 'bg-primary text-on-primary shadow-[0_0_12px_rgba(240,180,41,0.4)]' : 'bg-surface-high text-on-surface-variant'
                  }`}>
                    {isCompleted ? <Check size={16} /> : s.id}
                  </div>
                  <span className={`text-[11px] font-medium hidden md:inline truncate ${isActive ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                    {s.title}
                  </span>
                  {s.id < STEPS.length && <div className="w-4 h-0.5 bg-outline-variant/20 hidden md:block"></div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP CONTENT BODY */}
        <div className="min-h-[360px] flex flex-col justify-between">
          
          {/* STEP 1: Product & Eligibility */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200 text-xs">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <Landmark size={16} className="text-primary" /> Step 1: Product Selection & Eligibility Check
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: "savings", title: "Savings", yield: "4.00% p.a." },
                  { id: "current", title: "Current", yield: "Business" },
                  { id: "fd", title: "Fixed Deposit", yield: "7.25% p.a." },
                  { id: "rd", title: "Recurring Deposit", yield: "7.10% p.a." }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => updateForm({ productType: item.id as any })}
                    className={`p-3 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all cursor-pointer ${
                      formData.productType === item.id 
                        ? 'border-primary bg-primary/10 text-on-surface font-bold shadow-md' 
                        : 'border-outline-variant/20 bg-surface-high/40 text-on-surface-variant hover:border-white/20'
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
                    <input type="radio" name="ownership" checked={formData.ownershipType === "INDIVIDUAL"} onChange={() => updateForm({ ownershipType: "INDIVIDUAL" })} className="accent-primary" />
                    <span>Single Individual Ownership</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="ownership" checked={formData.ownershipType === "JOINT"} onChange={() => updateForm({ ownershipType: "JOINT" })} className="accent-primary" />
                    <span>Joint Account (Primary + Secondary Holder)</span>
                  </label>
                </div>
              </div>

              {/* Eligibility Checkboxes */}
              <div className="flex flex-col gap-2 p-3 bg-surface rounded-xl border border-outline-variant/10">
                <span className="font-semibold text-on-surface">Mandatory Eligibility Criteria</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.isAge18Plus} onChange={(e) => updateForm({ isAge18Plus: e.target.checked })} className="accent-primary" />
                  <span>I am an individual applicant aged 18 years or older</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.isTaxResident} onChange={(e) => updateForm({ isTaxResident: e.target.checked })} className="accent-primary" />
                  <span>I am a resident tax payer of India</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.isNotPep} onChange={(e) => updateForm({ isNotPep: e.target.checked })} className="accent-primary" />
                  <span>I confirm I am not a Politically Exposed Person (PEP)</span>
                </label>
              </div>
            </div>
          )}

          {/* STEP 2: Personal & Income */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200 text-xs">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <User size={16} className="text-primary" /> Step 2: Personal Information & Income Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-on-surface-variant font-medium">Full Name (As per PAN/Aadhaar)</label>
                  <input type="text" value={formData.fullName} onChange={(e) => updateForm({ fullName: e.target.value })} className="bg-surface border border-outline-variant/30 p-2.5 rounded-xl text-on-surface focus:outline-none focus:border-primary" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-on-surface-variant font-medium">PAN Card Number</label>
                  <input type="text" value={formData.panNumber} onChange={(e) => updateForm({ panNumber: e.target.value.toUpperCase() })} className="bg-surface border border-outline-variant/30 p-2.5 rounded-xl font-mono text-on-surface focus:outline-none focus:border-primary" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-on-surface-variant font-medium">Aadhaar Number</label>
                  <input type="text" value={formData.aadhaarNumber} onChange={(e) => updateForm({ aadhaarNumber: e.target.value })} className="bg-surface border border-outline-variant/30 p-2.5 rounded-xl font-mono text-on-surface focus:outline-none focus:border-primary" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-on-surface-variant font-medium">Date of Birth</label>
                  <input type="date" value={formData.dob} onChange={(e) => updateForm({ dob: e.target.value })} className="bg-surface border border-outline-variant/30 p-2.5 rounded-xl text-on-surface focus:outline-none focus:border-primary" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-on-surface-variant font-medium">Father's Full Name</label>
                  <input type="text" value={formData.fatherName} onChange={(e) => updateForm({ fatherName: e.target.value })} className="bg-surface border border-outline-variant/30 p-2.5 rounded-xl text-on-surface focus:outline-none focus:border-primary" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-on-surface-variant font-medium">Mother's Full Name</label>
                  <input type="text" value={formData.motherName} onChange={(e) => updateForm({ motherName: e.target.value })} className="bg-surface border border-outline-variant/30 p-2.5 rounded-xl text-on-surface focus:outline-none focus:border-primary" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/5">
                <div className="flex flex-col gap-1">
                  <label className="text-on-surface-variant font-medium">Occupation Type</label>
                  <select value={formData.occupation} onChange={(e) => updateForm({ occupation: e.target.value })} className="bg-surface border border-outline-variant/30 p-2.5 rounded-xl text-on-surface focus:outline-none focus:border-primary">
                    <option>Salaried Professional</option>
                    <option>Self-Employed / Business Owner</option>
                    <option>Professional (Doctor/CA/Lawyer)</option>
                    <option>Student</option>
                    <option>Retired</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-on-surface-variant font-medium">Annual Income Range</label>
                  <select value={formData.annualIncome} onChange={(e) => updateForm({ annualIncome: e.target.value })} className="bg-surface border border-outline-variant/30 p-2.5 rounded-xl text-on-surface focus:outline-none focus:border-primary">
                    <option>Below ₹5,00,000</option>
                    <option>₹5,00,000 - ₹10,00,000</option>
                    <option>₹10,00,000 - ₹25,00,000</option>
                    <option>Above ₹25,00,000</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Address & Nominee */}
          {currentStep === 3 && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200 text-xs">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <MapPin size={16} className="text-primary" /> Step 3: Address Details & Registered Nominee
              </h3>

              <div className="flex flex-col gap-2 p-3.5 bg-surface-high/60 rounded-xl border border-outline-variant/10">
                <span className="font-semibold text-on-surface">Permanent Communication Address</span>
                <textarea rows={2} value={formData.address} onChange={(e) => updateForm({ address: e.target.value })} className="bg-surface border border-outline-variant/30 p-2.5 rounded-xl text-on-surface focus:outline-none focus:border-primary" />
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <input type="text" placeholder="City" value={formData.city} onChange={(e) => updateForm({ city: e.target.value })} className="bg-surface border border-outline-variant/30 p-2 rounded-lg text-on-surface" />
                  <input type="text" placeholder="State" value={formData.state} onChange={(e) => updateForm({ state: e.target.value })} className="bg-surface border border-outline-variant/30 p-2 rounded-lg text-on-surface" />
                  <input type="text" placeholder="Pincode" value={formData.pincode} onChange={(e) => updateForm({ pincode: e.target.value })} className="bg-surface border border-outline-variant/30 p-2 rounded-lg text-on-surface font-mono" />
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
                    <input type="text" value={formData.nomineeName} onChange={(e) => updateForm({ nomineeName: e.target.value })} className="bg-surface border border-outline-variant/30 p-2.5 rounded-xl text-on-surface focus:outline-none focus:border-primary" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-on-surface-variant font-medium">Relationship to Applicant</label>
                    <select value={formData.nomineeRelation} onChange={(e) => updateForm({ nomineeRelation: e.target.value })} className="bg-surface border border-outline-variant/30 p-2.5 rounded-xl text-on-surface focus:outline-none focus:border-primary">
                      <option>Spouse</option>
                      <option>Parent (Father/Mother)</option>
                      <option>Child (Son/Daughter)</option>
                      <option>Sibling (Brother/Sister)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Preferences & Funding */}
          {currentStep === 4 && (
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
                    { title: "Mastercard World", card: "Mastercard World Debit" }
                  ].map((c) => (
                    <button
                      key={c.card}
                      type="button"
                      onClick={() => updateForm({ debitCardType: c.card })}
                      className={`p-3 rounded-xl border flex flex-col items-center text-center gap-1 transition-all cursor-pointer ${
                        formData.debitCardType === c.card ? 'border-primary bg-primary/10 font-bold text-on-surface' : 'border-outline-variant/20 bg-surface'
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
                  <input type="checkbox" checked={formData.requestChequeBook} onChange={(e) => updateForm({ requestChequeBook: e.target.checked })} className="accent-primary" />
                  <span>Request Physical Cheque Book (25 Leaves)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.whatsappBanking} onChange={(e) => updateForm({ whatsappBanking: e.target.checked })} className="accent-primary" />
                  <span>Enable Instant WhatsApp Banking Alerts</span>
                </label>
              </div>

              {/* Initial Funding */}
              <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                <span className="font-semibold text-on-surface">Initial Account Deposit Amount</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-on-surface-variant font-medium">Funding Method</label>
                    <select value={formData.fundingMethod} onChange={(e) => updateForm({ fundingMethod: e.target.value })} className="bg-surface border border-outline-variant/30 p-2.5 rounded-xl text-on-surface">
                      <option>UPI Instant Transfer</option>
                      <option>Net Banking Gateway</option>
                      <option>Existing FinEdge Account Transfer</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-on-surface-variant font-medium">Initial Deposit Amount (₹)</label>
                    <input type="number" value={formData.initialDeposit} onChange={(e) => updateForm({ initialDeposit: Number(e.target.value) })} className="bg-surface border border-outline-variant/30 p-2.5 rounded-xl text-on-surface font-mono font-bold" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: KYC Verification */}
          {currentStep === 5 && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200 text-xs">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <ShieldCheck size={16} className="text-primary" /> Step 5: Digital KYC & Identity Verification
              </h3>

              <div className="flex flex-col gap-2">
                <label className="font-medium text-on-surface-variant">KYC Document Type</label>
                <select value={formData.docType} onChange={(e) => updateForm({ docType: e.target.value })} className="bg-surface border border-outline-variant/30 p-2.5 rounded-xl text-on-surface">
                  <option>Aadhaar Card (Instant OTP OCR)</option>
                  <option>Passport (Machine Readable Zone)</option>
                  <option>Voter ID Card</option>
                  <option>Driving License</option>
                </select>
              </div>

              {/* Upload Previews */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 border-2 border-dashed border-tertiary/40 bg-tertiary/5 rounded-xl flex flex-col items-center gap-2 text-center">
                  <CheckCircle2 size={24} className="text-tertiary" />
                  <span className="font-bold text-on-surface">Front View Uploaded</span>
                  <span className="text-[10px] text-on-surface-variant">Verified via AI Document Scanner</span>
                </div>
                <div className="p-4 border-2 border-dashed border-tertiary/40 bg-tertiary/5 rounded-xl flex flex-col items-center gap-2 text-center">
                  <CheckCircle2 size={24} className="text-tertiary" />
                  <span className="font-bold text-on-surface">Back View Uploaded</span>
                  <span className="text-[10px] text-on-surface-variant">OCR Data Matched with Applicant</span>
                </div>
              </div>

              {/* Selfie Check */}
              <div className="p-3 bg-surface-high/60 rounded-xl border border-outline-variant/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-tertiary" />
                  <span className="font-medium">Video Liveness Selfie Check Verified</span>
                </div>
                <span className="px-2.5 py-1 bg-tertiary/20 text-tertiary rounded-lg text-[10px] font-bold uppercase">Passed 99.8% Match</span>
              </div>
            </div>
          )}

          {/* STEP 6: Review & e-Sign */}
          {currentStep === 6 && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200 text-xs">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <FileText size={16} className="text-primary" /> Step 6: Review Summary & Aadhaar OTP e-Sign
              </h3>

              {/* Summary Box */}
              <div className="p-4 bg-surface-high/60 rounded-xl border border-outline-variant/10 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-medium">Selected Offering</span>
                  <p className="font-bold text-on-surface mt-0.5">{prodInfo.name}</p>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-medium">Applicant Name</span>
                  <p className="font-bold text-on-surface mt-0.5">{formData.fullName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-medium">PAN / Aadhaar</span>
                  <p className="font-mono font-bold text-on-surface mt-0.5">{formData.panNumber} / {formData.aadhaarNumber.slice(-4)}</p>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-medium">Initial Funding</span>
                  <p className="font-mono font-bold text-tertiary mt-0.5">₹{formData.initialDeposit.toLocaleString("en-IN")}</p>
                </div>
              </div>

              {/* OTP e-Sign Form */}
              <div className="flex flex-col gap-2 p-3.5 bg-surface rounded-xl border border-outline-variant/10">
                <span className="font-semibold text-on-surface flex items-center gap-2">
                  <KeyRound size={16} className="text-primary" /> Enter 6-Digit Aadhaar e-Sign OTP
                </span>
                <input
                  type="password"
                  maxLength={6}
                  value={formData.otpCode}
                  onChange={(e) => updateForm({ otpCode: e.target.value.replace(/\D/g, "") })}
                  placeholder="••••••"
                  className="bg-surface-high border border-outline-variant/30 p-2.5 rounded-xl text-center text-lg font-mono font-bold tracking-[0.4em] text-on-surface focus:outline-none focus:border-primary"
                />
                <span className="text-[11px] text-on-surface-variant text-center">Demo e-Sign OTP: <strong className="text-primary font-mono">123456</strong></span>
              </div>

              {otpError && (
                <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-error text-xs font-medium flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" /> {otpError}
                </div>
              )}
            </div>
          )}

          {/* STEP 7: Success & Account Activation */}
          {currentStep === 7 && createdAccResult && (
            <div className="flex flex-col items-center gap-4 text-center animate-in fade-in duration-300 py-4">
              <div className="w-16 h-16 rounded-full bg-tertiary/20 border-2 border-tertiary flex items-center justify-center text-tertiary shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-on-surface">Account Provisioned & Active!</h3>
                <p className="text-xs text-on-surface-variant mt-1">Your new bank account is live with instant net banking & UPI access.</p>
              </div>

              {/* Created Account Details Card */}
              <div className="w-full bg-surface-high/60 border border-outline-variant/20 rounded-xl p-4 grid grid-cols-2 gap-3 text-xs text-left">
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-medium">Account Number</span>
                  <p className="font-mono font-bold text-sm text-on-surface mt-0.5">{createdAccResult.accountNumber}</p>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-medium">IFSC Code</span>
                  <p className="font-mono font-bold text-sm text-primary mt-0.5">{createdAccResult.ifsc}</p>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-medium">Opening Balance</span>
                  <p className="font-mono font-bold text-sm text-tertiary mt-0.5">₹{createdAccResult.balance.toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-medium">Linked Card</span>
                  <p className="font-bold text-xs text-on-surface mt-0.5 truncate">{createdAccResult.linkedCard}</p>
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => {
                    AccountStatementBuilder.generate(createdAccResult, formData.fullName, [], "Welcome Pack");
                  }}
                  className="px-4 py-2 bg-surface-high text-on-surface hover:bg-surface-highest font-medium rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Download size={14} /> Download Welcome Pack PDF
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-primary text-on-primary font-bold rounded-xl text-xs hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] cursor-pointer"
                >
                  Go to Accounts Dashboard
                </button>
              </div>
            </div>
          )}

        </div>

        {/* STEP FOOTER CONTROLS */}
        {currentStep < 7 && (
          <div className="flex justify-between items-center pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={saveDraft}
              className="px-4 py-2 bg-surface-high text-on-surface-variant hover:text-on-surface rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Save size={14} /> {draftSaved ? "Draft Saved!" : "Save & Continue Later"}
            </button>

            <div className="flex gap-2">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-2.5 bg-surface-high text-on-surface font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleNext}
                className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Provisioning...
                  </>
                ) : currentStep === 6 ? (
                  <>
                    e-Sign & Activate Account <ArrowRight size={16} />
                  </>
                ) : (
                  <>
                    Continue <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
