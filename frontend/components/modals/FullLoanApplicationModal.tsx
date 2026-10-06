"use client";

import React, { useState, useId } from "react";
import { X, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { LoanApplication } from "../../types";
import { MockApi } from "../../lib/mockApi";
import {
  LOAN_PRODUCTS,
  getProductKey,
  calculateEmiDetails,
} from "./loanWizard/loanProducts";
import LoanStepDetails from "./loanWizard/LoanStepDetails";
import {
  LoanStepUploadDocs,
  LoanStepEligibility,
  LoanStepSubmitted,
} from "./loanWizard/LoanStepDocuments";

interface FullLoanApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLoanType?: string;
  onApplicationSuccess?: (app: LoanApplication) => void;
}

export default function FullLoanApplicationModal({
  isOpen,
  onClose,
  initialLoanType = "PERSONAL",
  onApplicationSuccess,
}: FullLoanApplicationModalProps) {
  const panInputId = useId();

  const [activeTypeKey, setActiveTypeKey] = useState<string>(() => getProductKey(initialLoanType));
  const currentProduct = LOAN_PRODUCTS[activeTypeKey] || LOAN_PRODUCTS.PERSONAL;

  // Wizard Steps: 1: Parameters, 2: Details, 3: Documents, 4: Eligibility, 5: Complete
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State - Financials
  const [loanAmount, setLoanAmount] = useState<number>(currentProduct.defaultAmount);
  const [tenureMonths, setTenureMonths] = useState<number>(currentProduct.defaultTenure);

  // Form State - Step 2 Dynamic Questions
  const [employmentType, setEmploymentType] = useState("Salaried");
  const [employerName, setEmployerName] = useState("TechCorp Solutions Pvt Ltd");
  const [monthlySalary, setMonthlySalary] = useState("95000");
  const [existingEmis, setExistingEmis] = useState("15000");
  const [loanPurpose, setLoanPurpose] = useState("Debt Consolidation");

  const [propertyStatus, setPropertyStatus] = useState("Ready to Move");
  const [propertyValue, setPropertyValue] = useState("6000000");
  const [propertyPincode, setPropertyPincode] = useState("400053");
  const [coApplicant, setCoApplicant] = useState("Spouse");

  const [vehicleCategory, setVehicleCategory] = useState("New Car");
  const [vehicleModel, setVehicleModel] = useState("Tata Harrier Fearless+ EV");
  const [onRoadPrice, setOnRoadPrice] = useState("2400000");
  const [downPayment, setDownPayment] = useState("400000");

  const [institutionName, setInstitutionName] = useState("Imperial College London");
  const [courseLevel, setCourseLevel] = useState("Postgraduate (MSc)");
  const [courseCountry, setCourseCountry] = useState("United Kingdom");
  const [totalCourseFees, setTotalCourseFees] = useState("2800000");
  const [coBorrowerIncome, setCoBorrowerIncome] = useState("1200000");

  // Uploaded Files State
  const [uploadedFiles, setUploadedFiles] = useState<{ [docName: string]: { name: string; size: string } }>({
    "PAN Card Copy": { name: "PAN_Card_AXXXX1234F.pdf", size: "1.2 MB" },
    "6 Months Bank Statement": { name: "BankStatement_Primary.pdf", size: "3.4 MB" },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<LoanApplication | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProductChange = (key: string) => {
    setActiveTypeKey(key);
    const prod = LOAN_PRODUCTS[key];
    setLoanAmount(prod.defaultAmount);
    setTenureMonths(prod.defaultTenure);
    setValidationError(null);
  };

  const { emi, totalInterest } = calculateEmiDetails(loanAmount, currentProduct.rate, tenureMonths);

  const incomeVal = Number(monthlySalary) || 85000;
  const existingEmiVal = Number(existingEmis) || 0;
  const foirRatio = Math.round(((existingEmiVal + emi) / incomeVal) * 100);

  const handleFileUpload = (docName: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFiles((prev) => ({
        ...prev,
        [docName]: {
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        },
      }));
    }
  };

  const handleRemoveFile = (docName: string) => {
    setUploadedFiles((prev) => {
      const next = { ...prev };
      delete next[docName];
      return next;
    });
  };

  const validateStep = (step: number): boolean => {
    setValidationError(null);
    if (step === 1) {
      if (loanAmount < currentProduct.minAmount || loanAmount > currentProduct.maxAmount) {
        setValidationError(
          `Loan amount must be between ₹${currentProduct.minAmount.toLocaleString("en-IN")} and ₹${currentProduct.maxAmount.toLocaleString("en-IN")}`
        );
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (activeTypeKey === "PERSONAL" && (!employerName || Number(monthlySalary) <= 0)) {
        setValidationError("Please provide valid employer name and monthly salary.");
        return false;
      }
      if (activeTypeKey === "HOME" && (Number(propertyValue) <= 0 || !propertyPincode)) {
        setValidationError("Please provide valid property value and pincode.");
        return false;
      }
      if (activeTypeKey === "CAR" && (!vehicleModel || Number(onRoadPrice) <= 0)) {
        setValidationError("Please enter vehicle model and on-road price.");
        return false;
      }
      if (activeTypeKey === "EDUCATION" && (!institutionName || Number(totalCourseFees) <= 0)) {
        setValidationError("Please enter institution name and course fees.");
        return false;
      }
      return true;
    }
    if (step === 3) {
      if (Object.keys(uploadedFiles).length === 0) {
        setValidationError("Please upload at least one required document (e.g. PAN Card or Bank Statement).");
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setValidationError(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmitApplication = async () => {
    setIsSubmitting(true);
    setValidationError(null);
    try {
      const dynamicFields: Record<string, any> = {
        activeTypeKey,
        employmentType,
        employerName,
        monthlySalary,
        existingEmis,
        loanPurpose,
        propertyStatus,
        propertyValue,
        propertyPincode,
        coApplicant,
        vehicleCategory,
        vehicleModel,
        onRoadPrice,
        downPayment,
        institutionName,
        courseLevel,
        courseCountry,
        totalCourseFees,
        coBorrowerIncome,
      };

      const docsList = Object.entries(uploadedFiles).map(([type, info]) => ({
        name: info.name,
        type,
        size: info.size,
        status: "VERIFIED" as const,
      }));

      const newApp = await MockApi.submitLoanApplication({
        loanType: activeTypeKey,
        loanTypeName: currentProduct.name,
        requestedAmount: loanAmount,
        tenureMonths: tenureMonths,
        interestRate: currentProduct.rate,
        calculatedEmi: emi,
        dynamicFields,
        uploadedDocuments: docsList,
        eligibilityScore: foirRatio <= 50 ? 92 : 74,
        foirRatio,
      });

      setSubmittedApp(newApp);
      setCurrentStep(5);
      if (onApplicationSuccess) {
        onApplicationSuccess(newApp);
      }
    } catch {
      setValidationError("Failed to submit loan application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md px-4 overflow-y-auto py-6">
      <div className="bg-surface-container border border-outline-variant/20 rounded-2xl w-full max-w-2xl p-6 shadow-2xl z-[10000] my-auto flex flex-col gap-5 text-on-surface">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-white/5 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-primary/10 text-primary border border-primary/30">
                End-to-End Application
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20">
                Instant Credit Evaluation
              </span>
            </div>
            <h2 className="text-xl font-bold text-on-surface">Apply for {currentProduct.name}</h2>
            <p className="text-xs text-on-surface-variant">Step {currentStep} of 5 • Real-time dynamic eligibility verification</p>
          </div>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Stepper Header */}
        <div className="grid grid-cols-5 gap-1 text-center font-mono">
          {[
            { step: 1, label: "Parameters" },
            { step: 2, label: "Details" },
            { step: 3, label: "Documents" },
            { step: 4, label: "Eligibility" },
            { step: 5, label: "Complete" },
          ].map((s) => (
            <div key={s.step} className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  currentStep === s.step
                    ? "bg-primary text-on-primary shadow-md"
                    : currentStep > s.step
                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                    : "bg-surface-high border border-white/10 text-on-surface-variant"
                }`}
              >
                {currentStep > s.step ? "✓" : s.step}
              </div>
              <span className="text-[10px] text-on-surface-variant mt-1 font-sans font-medium">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Validation Error Alert */}
        {validationError && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-xs font-bold">
            <AlertCircle size={18} className="shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* STEP 1: PARAMETERS & LOAN TYPE SELECTOR */}
        {currentStep === 1 && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-on-surface-variant block mb-1.5">Select Loan Product</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.values(LOAN_PRODUCTS).map((prod) => {
                  const isSel = activeTypeKey === prod.id;
                  return (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => handleProductChange(prod.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 cursor-pointer ${
                        isSel ? "bg-primary/10 border-primary shadow-lg" : "bg-surface border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        {prod.icon}
                        <span className="text-[11px] font-bold font-mono text-primary">{prod.rate}%</span>
                      </div>
                      <span className="text-xs font-bold text-on-surface">{prod.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-surface rounded-xl border border-white/5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-on-surface-variant">Required Loan Amount</span>
                <span className="text-base font-bold text-primary font-mono">₹{loanAmount.toLocaleString("en-IN")}</span>
              </div>
              <input
                type="range"
                min={currentProduct.minAmount}
                max={currentProduct.maxAmount}
                step={currentProduct.minAmount <= 100000 ? 25000 : 100000}
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer h-2 bg-surface-container-highest rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-on-surface-variant font-mono">
                <span>Min: ₹{currentProduct.minAmount.toLocaleString("en-IN")}</span>
                <span>Max: ₹{currentProduct.maxAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="p-4 bg-surface rounded-xl border border-white/5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-on-surface-variant">Repayment Tenure</span>
                <span className="text-base font-bold text-primary font-mono">
                  {tenureMonths} Months ({Math.round((tenureMonths / 12) * 10) / 10} Yrs)
                </span>
              </div>
              <input
                type="range"
                min={currentProduct.minTenure}
                max={currentProduct.maxTenure}
                step={currentProduct.minTenure >= 12 ? 12 : 6}
                value={tenureMonths}
                onChange={(e) => setTenureMonths(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer h-2 bg-surface-container-highest rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-on-surface-variant font-mono">
                <span>{currentProduct.minTenure} Months</span>
                <span>{currentProduct.maxTenure} Months</span>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-primary/10 via-surface to-surface rounded-xl border border-primary/30 grid grid-cols-3 gap-3 font-mono text-center">
              <div>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">Monthly EMI</span>
                <span className="text-base font-bold text-primary">₹{emi.toLocaleString("en-IN")}</span>
              </div>
              <div>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">Total Interest</span>
                <span className="text-sm font-bold text-tertiary">₹{totalInterest.toLocaleString("en-IN")}</span>
              </div>
              <div>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">Interest Rate</span>
                <span className="text-sm font-bold text-green-400">{currentProduct.rate}% p.a.</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: DYNAMIC QUESTIONNAIRE */}
        {currentStep === 2 && (
          <LoanStepDetails
            activeTypeKey={activeTypeKey}
            currentProduct={currentProduct}
            employmentType={employmentType}
            setEmploymentType={setEmploymentType}
            employerName={employerName}
            setEmployerName={setEmployerName}
            monthlySalary={monthlySalary}
            setMonthlySalary={setMonthlySalary}
            existingEmis={existingEmis}
            setExistingEmis={setExistingEmis}
            loanPurpose={loanPurpose}
            setLoanPurpose={setLoanPurpose}
            propertyStatus={propertyStatus}
            setPropertyStatus={setPropertyStatus}
            propertyValue={propertyValue}
            setPropertyValue={setPropertyValue}
            propertyPincode={propertyPincode}
            setPropertyPincode={setPropertyPincode}
            coApplicant={coApplicant}
            setCoApplicant={setCoApplicant}
            vehicleCategory={vehicleCategory}
            setVehicleCategory={setVehicleCategory}
            vehicleModel={vehicleModel}
            setVehicleModel={setVehicleModel}
            onRoadPrice={onRoadPrice}
            setOnRoadPrice={setOnRoadPrice}
            downPayment={downPayment}
            setDownPayment={setDownPayment}
            institutionName={institutionName}
            setInstitutionName={setInstitutionName}
            courseLevel={courseLevel}
            setCourseLevel={setCourseLevel}
            courseCountry={courseCountry}
            setCourseCountry={setCourseCountry}
            totalCourseFees={totalCourseFees}
            setTotalCourseFees={setTotalCourseFees}
            coBorrowerIncome={coBorrowerIncome}
            setCoBorrowerIncome={setCoBorrowerIncome}
          />
        )}

        {/* STEP 3: DOCUMENT UPLOAD */}
        {currentStep === 3 && (
          <LoanStepUploadDocs
            currentProduct={currentProduct}
            uploadedFiles={uploadedFiles}
            panInputId={panInputId}
            onFileUpload={handleFileUpload}
            onRemoveFile={handleRemoveFile}
          />
        )}

        {/* STEP 4: CREDIT EVALUATION */}
        {currentStep === 4 && (
          <LoanStepEligibility
            foirRatio={foirRatio}
            loanAmount={loanAmount}
            emi={emi}
            uploadedFilesCount={Object.keys(uploadedFiles).length}
          />
        )}

        {/* STEP 5: APPLICATION SUBMITTED */}
        {currentStep === 5 && submittedApp && (
          <LoanStepSubmitted submittedApp={submittedApp} onClose={onClose} />
        )}

        {/* Navigation Footer */}
        {currentStep < 5 && (
          <div className="flex justify-between items-center pt-3 border-t border-white/5">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2.5 bg-surface-high text-on-surface font-semibold rounded-xl text-xs hover:bg-surface-highest flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={14} /> Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] flex items-center gap-1.5 cursor-pointer"
              >
                Next <ArrowRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitApplication}
                className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Submitting Application...
                  </>
                ) : (
                  <>
                    Submit Final Application <CheckCircle2 size={16} />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
