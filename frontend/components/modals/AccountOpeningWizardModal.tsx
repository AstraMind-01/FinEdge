"use client";

import React, { useState, useEffect } from "react";
import { X, ArrowRight, Loader2, Check, Save } from "lucide-react";
import { useAccounts } from "../../context/AccountContext";
import { AccountOpeningFormData, WIZARD_STEPS } from "./accountOpening/wizardTypes";
import StepProductAndPersonal from "./accountOpening/StepProductAndPersonal";
import StepAddressAndPreferences from "./accountOpening/StepAddressAndPreferences";
import StepKycAndReview from "./accountOpening/StepKycAndReview";

interface AccountOpeningWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProductType?: "savings" | "current" | "fd" | "rd";
}

export default function AccountOpeningWizardModal({
  isOpen,
  onClose,
  defaultProductType = "savings",
}: AccountOpeningWizardModalProps) {
  const { userProfile, createNewAccount, refreshAllData } = useAccounts();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [createdAccResult, setCreatedAccResult] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState<AccountOpeningFormData>({
    productType: defaultProductType,
    accountVariant: "STANDARD",
    ownershipType: "INDIVIDUAL",
    isAge18Plus: true,
    isTaxResident: true,
    isKycVerified: true,
    isNotPep: true,

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

    address: userProfile.address || "402, Skyline Towers, BKC, Mumbai - 400051",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400051",
    nomineeName: "Ananya Ranjan",
    nomineeRelation: "Spouse",
    nomineeDob: "1996-03-22",
    nomineeSameAddress: true,

    debitCardType: "Visa Platinum Contactless",
    requestChequeBook: true,
    whatsappBanking: true,
    fundingMethod: "UPI",
    initialDeposit: 10000,

    docType: "Aadhaar Card",
    docFrontUploaded: true,
    docBackUploaded: true,
    selfieVerified: true,

    acceptTerms: true,
    acceptFatca: true,
    otpCode: "",
  });

  const [otpError, setOtpError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({ ...prev, productType: defaultProductType }));
      try {
        const savedDraft = localStorage.getItem("finedge_draft_account_application");
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          setFormData(parsed);
        }
      } catch {}
    }
  }, [isOpen, defaultProductType]);

  if (!isOpen) return null;

  const updateForm = (fields: Partial<AccountOpeningFormData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const saveDraft = () => {
    try {
      localStorage.setItem("finedge_draft_account_application", JSON.stringify(formData));
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 2000);
    } catch {}
  };

  const handleNext = () => {
    if (currentStep === 6) {
      handleFinalSubmit();
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 7));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFinalSubmit = async () => {
    setOtpError(null);
    if (!formData.otpCode || formData.otpCode.length < 6) {
      setOtpError("Please enter valid 6-digit Aadhaar OTP (Demo: 123456)");
      return;
    }

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));

    try {
      const typeMap: Record<string, "SAVINGS" | "CURRENT" | "FIXED_DEPOSIT" | "RECURRING_DEPOSIT"> = {
        savings: "SAVINGS",
        current: "CURRENT",
        fd: "FIXED_DEPOSIT",
        rd: "RECURRING_DEPOSIT",
      };

      const type = typeMap[formData.productType] || "SAVINGS";
      const created = await createNewAccount({
        type,
        name:
          formData.productType === "savings"
            ? "High-Yield Savings Account"
            : formData.productType === "current"
            ? "Business Current Account"
            : formData.productType === "fd"
            ? "High Yield Fixed Deposit"
            : "Wealth Builder RD",
        initialDeposit: Number(formData.initialDeposit) || 10000,
        nominee: formData.nomineeName,
        nomineeRelation: formData.nomineeRelation,
      });

      await refreshAllData();
      setCreatedAccResult(created);
      setIsSubmitting(false);
      setCurrentStep(7);
      localStorage.removeItem("finedge_draft_account_application");
    } catch {
      setIsSubmitting(false);
      setOtpError("Account creation failed. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 overflow-y-auto py-6">
      <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-3xl p-6 shadow-2xl z-[10000] my-auto flex flex-col gap-6 text-on-surface">
        {/* Header & Stepper */}
        <div className="flex flex-col gap-4 border-b border-white/5 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs text-primary font-mono uppercase tracking-wider font-bold">
                FinEdge Account Provisioning Wizard
              </span>
              <h2 className="text-xl font-bold text-on-surface">Digital Account Opening Application</h2>
            </div>
            <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors cursor-pointer">
              <X size={20} />
            </button>
          </div>

          {/* Progress Stepper */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
            {WIZARD_STEPS.map((s) => {
              const isActive = currentStep === s.id;
              const isCompleted = currentStep > s.id;

              return (
                <div key={s.id} className="flex items-center gap-2 shrink-0">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCompleted
                        ? "bg-tertiary text-on-tertiary"
                        : isActive
                        ? "bg-primary text-on-primary shadow-[0_0_12px_rgba(240,180,41,0.4)]"
                        : "bg-surface-high text-on-surface-variant"
                    }`}
                  >
                    {isCompleted ? <Check size={16} /> : s.id}
                  </div>
                  <span className={`text-[11px] font-medium hidden md:inline truncate ${isActive ? "text-primary font-bold" : "text-on-surface-variant"}`}>
                    {s.title}
                  </span>
                  {s.id < WIZARD_STEPS.length && <div className="w-4 h-0.5 bg-outline-variant/20 hidden md:block"></div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Body */}
        <div className="min-h-[360px] flex flex-col justify-between">
          <StepProductAndPersonal currentStep={currentStep} formData={formData} updateForm={updateForm} />
          <StepAddressAndPreferences currentStep={currentStep} formData={formData} updateForm={updateForm} />
          <StepKycAndReview
            currentStep={currentStep}
            formData={formData}
            updateForm={updateForm}
            otpError={otpError}
            createdAccResult={createdAccResult}
            onClose={onClose}
          />
        </div>

        {/* Step Footer Controls */}
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
