"use client";

import React, { useState, useId } from "react";
import { 
  X, FileText, CheckCircle2, Loader2, Calculator, ShieldCheck, 
  Upload, Trash2, ArrowRight, ArrowLeft, Home, User, Car, GraduationCap,
  Briefcase, Building, AlertCircle, FileCheck
} from "lucide-react";
import { LoanApplication } from "../../types";
import { MockApi } from "../../lib/mockApi";

interface FullLoanApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLoanType?: string;
  onApplicationSuccess?: (app: LoanApplication) => void;
}

interface LoanProductConfig {
  id: string;
  name: string;
  rate: number;
  minAmount: number;
  maxAmount: number;
  defaultAmount: number;
  minTenure: number; // months
  maxTenure: number; // months
  defaultTenure: number; // months
  icon: React.ReactNode;
  requiredDocs: string[];
}

const LOAN_PRODUCTS: Record<string, LoanProductConfig> = {
  PERSONAL: {
    id: "PERSONAL",
    name: "Personal Loan",
    rate: 10.25,
    minAmount: 50000,
    maxAmount: 1500000,
    defaultAmount: 300000,
    minTenure: 12,
    maxTenure: 60,
    defaultTenure: 36,
    icon: <User size={20} className="text-purple-400" />,
    requiredDocs: ["PAN Card Copy", "Last 3 Months Salary Slips", "6 Months Bank Statement"]
  },
  HOME: {
    id: "HOME",
    name: "Home Loan",
    rate: 8.50,
    minAmount: 500000,
    maxAmount: 20000000,
    defaultAmount: 4500000,
    minTenure: 60,
    maxTenure: 360,
    defaultTenure: 240,
    icon: <Home size={20} className="text-blue-400" />,
    requiredDocs: ["PAN & Aadhaar Card", "Property Title Deed / Allotment Letter", "2 Years ITR / Form 16", "6 Months Bank Statement"]
  },
  CAR: {
    id: "CAR",
    name: "Car Loan",
    rate: 9.00,
    minAmount: 100000,
    maxAmount: 5000000,
    defaultAmount: 850000,
    minTenure: 12,
    maxTenure: 84,
    defaultTenure: 60,
    icon: <Car size={20} className="text-teal-400" />,
    requiredDocs: ["PAN Card Copy", "Dealer Proforma Invoice / Price Quote", "6 Months Bank Statement", "Address Proof"]
  },
  EDUCATION: {
    id: "EDUCATION",
    name: "Education Loan",
    rate: 7.50,
    minAmount: 100000,
    maxAmount: 7500000,
    defaultAmount: 1200000,
    minTenure: 24,
    maxTenure: 180,
    defaultTenure: 120,
    icon: <GraduationCap size={20} className="text-primary" />,
    requiredDocs: ["Student Marksheets & Admission Letter", "University Fee Breakdown", "Co-Borrower Income Proof", "6 Months Bank Statement"]
  }
};

export default function FullLoanApplicationModal({
  isOpen,
  onClose,
  initialLoanType = "PERSONAL",
  onApplicationSuccess
}: FullLoanApplicationModalProps) {
  const panInputId = useId();

  // Selected Loan Product Key
  const getProductKey = (typeStr: string) => {
    const s = typeStr.toUpperCase();
    if (s.includes("HOME")) return "HOME";
    if (s.includes("CAR") || s.includes("VEHICLE")) return "CAR";
    if (s.includes("EDU")) return "EDUCATION";
    return "PERSONAL";
  };

  const [activeTypeKey, setActiveTypeKey] = useState<string>(() => getProductKey(initialLoanType));
  const currentProduct = LOAN_PRODUCTS[activeTypeKey] || LOAN_PRODUCTS.PERSONAL;

  // Wizard Steps: 1: Financials, 2: Questionnaire, 3: Documents, 4: Eligibility Check, 5: Submitted
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State - Financials
  const [loanAmount, setLoanAmount] = useState<number>(currentProduct.defaultAmount);
  const [tenureMonths, setTenureMonths] = useState<number>(currentProduct.defaultTenure);

  // Form State - Step 2 Dynamic Questions
  // Personal
  const [employmentType, setEmploymentType] = useState("Salaried");
  const [employerName, setEmployerName] = useState("TechCorp Solutions Pvt Ltd");
  const [monthlySalary, setMonthlySalary] = useState("95000");
  const [existingEmis, setExistingEmis] = useState("15000");
  const [loanPurpose, setLoanPurpose] = useState("Debt Consolidation");

  // Home
  const [propertyStatus, setPropertyStatus] = useState("Ready to Move");
  const [propertyValue, setPropertyValue] = useState("6000000");
  const [propertyPincode, setPropertyPincode] = useState("400053");
  const [coApplicant, setCoApplicant] = useState("Spouse");

  // Car
  const [vehicleCategory, setVehicleCategory] = useState("New Car");
  const [vehicleModel, setVehicleModel] = useState("Tata Harrier Fearless+ EV");
  const [onRoadPrice, setOnRoadPrice] = useState("2400000");
  const [downPayment, setDownPayment] = useState("400000");

  // Education
  const [institutionName, setInstitutionName] = useState("Imperial College London");
  const [courseLevel, setCourseLevel] = useState("Postgraduate (MSc)");
  const [courseCountry, setCourseCountry] = useState("United Kingdom");
  const [totalCourseFees, setTotalCourseFees] = useState("2800000");
  const [coBorrowerIncome, setCoBorrowerIncome] = useState("1200000");

  // Uploaded Files State
  const [uploadedFiles, setUploadedFiles] = useState<{ [docName: string]: { name: string; size: string } }>({
    "PAN Card Copy": { name: "PAN_Card_AXXXX1234F.pdf", size: "1.2 MB" },
    "6 Months Bank Statement": { name: "BankStatement_Primary.pdf", size: "3.4 MB" }
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

  // EMI Math = [P x R x (1+R)^N]/[(1+R)^N-1]
  const p = loanAmount;
  const r = (currentProduct.rate / 12) / 100;
  const n = tenureMonths;
  const emi = Math.round((p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  const totalPayment = emi * n;
  const totalInterest = Math.max(0, totalPayment - p);

  // FOIR Calculation
  const incomeVal = Number(monthlySalary) || 85000;
  const existingEmiVal = Number(existingEmis) || 0;
  const foirRatio = Math.round(((existingEmiVal + emi) / incomeVal) * 100);

  const handleFileUpload = (docName: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFiles(prev => ({
        ...prev,
        [docName]: {
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        }
      }));
    }
  };

  const handleRemoveFile = (docName: string) => {
    setUploadedFiles(prev => {
      const next = { ...prev };
      delete next[docName];
      return next;
    });
  };

  const validateStep = (step: number): boolean => {
    setValidationError(null);
    if (step === 1) {
      if (loanAmount < currentProduct.minAmount || loanAmount > currentProduct.maxAmount) {
        setValidationError(`Loan amount must be between ₹${currentProduct.minAmount.toLocaleString('en-IN')} and ₹${currentProduct.maxAmount.toLocaleString('en-IN')}`);
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
      // Ensure at least 1 document uploaded
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
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setValidationError(null);
    setCurrentStep(prev => Math.max(1, prev - 1));
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
        coBorrowerIncome
      };

      const docsList = Object.entries(uploadedFiles).map(([type, info]) => ({
        name: info.name,
        type,
        size: info.size,
        status: "VERIFIED"
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
        foirRatio
      });

      setSubmittedApp(newApp);
      setCurrentStep(5);
      if (onApplicationSuccess) {
        onApplicationSuccess(newApp);
      }
    } catch (err) {
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
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-high transition-colors">
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
            { step: 5, label: "Complete" }
          ].map(s => (
            <div key={s.step} className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                currentStep === s.step ? 'bg-primary text-on-primary shadow-md' :
                currentStep > s.step ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                'bg-surface-high border border-white/10 text-on-surface-variant'
              }`}>
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
            
            {/* Loan Type Options */}
            <div>
              <label className="font-semibold text-on-surface-variant block mb-1.5">Select Loan Product</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.values(LOAN_PRODUCTS).map(prod => {
                  const isSel = activeTypeKey === prod.id;
                  return (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => handleProductChange(prod.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                        isSel ? 'bg-primary/10 border-primary shadow-lg' : 'bg-surface border-white/10 hover:border-white/20'
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

            {/* Amount Slider */}
            <div className="p-4 bg-surface rounded-xl border border-white/5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-on-surface-variant">Required Loan Amount</span>
                <span className="text-base font-bold text-primary font-mono">₹{loanAmount.toLocaleString('en-IN')}</span>
              </div>
              <input 
                type="range"
                min={currentProduct.minAmount}
                max={currentProduct.maxAmount}
                step={currentProduct.minAmount <= 100000 ? 25000 : 100000}
                value={loanAmount}
                onChange={e => setLoanAmount(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer h-2 bg-surface-container-highest rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-on-surface-variant font-mono">
                <span>Min: ₹{currentProduct.minAmount.toLocaleString('en-IN')}</span>
                <span>Max: ₹{currentProduct.maxAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Tenure Slider */}
            <div className="p-4 bg-surface rounded-xl border border-white/5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-on-surface-variant">Repayment Tenure</span>
                <span className="text-base font-bold text-primary font-mono">
                  {tenureMonths} Months ({Math.round(tenureMonths / 12 * 10) / 10} Yrs)
                </span>
              </div>
              <input 
                type="range"
                min={currentProduct.minTenure}
                max={currentProduct.maxTenure}
                step={currentProduct.minTenure >= 12 ? 12 : 6}
                value={tenureMonths}
                onChange={e => setTenureMonths(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer h-2 bg-surface-container-highest rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-on-surface-variant font-mono">
                <span>{currentProduct.minTenure} Months</span>
                <span>{currentProduct.maxTenure} Months</span>
              </div>
            </div>

            {/* Live EMI Breakdown Box */}
            <div className="p-4 bg-gradient-to-r from-primary/10 via-surface to-surface rounded-xl border border-primary/30 grid grid-cols-3 gap-3 font-mono text-center">
              <div>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">Monthly EMI</span>
                <span className="text-base font-bold text-primary">₹{emi.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">Total Interest</span>
                <span className="text-sm font-bold text-tertiary">₹{totalInterest.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">Interest Rate</span>
                <span className="text-sm font-bold text-green-400">{currentProduct.rate}% p.a.</span>
              </div>
            </div>

          </div>
        )}

        {/* STEP 2: DYNAMIC QUESTIONNAIRE PER LOAN TYPE */}
        {currentStep === 2 && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-surface-container-high rounded-xl border border-white/5 text-[11px] text-on-surface-variant flex items-center gap-2">
              <FileText size={16} className="text-primary shrink-0" />
              <span>Please fill in specific details for your <strong>{currentProduct.name}</strong>.</span>
            </div>

            {/* PERSONAL LOAN FIELDS */}
            {activeTypeKey === "PERSONAL" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-on-surface-variant block mb-1">Employment Type</label>
                  <select value={employmentType} onChange={e => setEmploymentType(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface">
                    <option value="Salaried">Salaried Employee</option>
                    <option value="Self-Employed Professional">Self-Employed Professional</option>
                    <option value="Business Owner">Business Owner</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-on-surface-variant block mb-1">Employer / Company Name</label>
                  <input type="text" value={employerName} onChange={e => setEmployerName(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface" />
                </div>

                <div>
                  <label className="font-semibold text-on-surface-variant block mb-1">Monthly Net In-Hand Income (₹)</label>
                  <input type="number" value={monthlySalary} onChange={e => setMonthlySalary(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface font-mono font-bold" />
                </div>

                <div>
                  <label className="font-semibold text-on-surface-variant block mb-1">Current Monthly Existing EMIs (₹)</label>
                  <input type="number" value={existingEmis} onChange={e => setExistingEmis(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface font-mono font-bold" />
                </div>

                <div className="col-span-2">
                  <label className="font-semibold text-on-surface-variant block mb-1">Purpose of Loan</label>
                  <select value={loanPurpose} onChange={e => setLoanPurpose(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface">
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
                  <select value={propertyStatus} onChange={e => setPropertyStatus(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface">
                    <option value="Ready to Move">Ready to Move Property</option>
                    <option value="Under Construction">Under Construction (RERA Registered)</option>
                    <option value="Resale Property">Resale / Secondary Sale</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-on-surface-variant block mb-1">Estimated Market Value (₹)</label>
                  <input type="number" value={propertyValue} onChange={e => setPropertyValue(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface font-mono font-bold" />
                </div>

                <div>
                  <label className="font-semibold text-on-surface-variant block mb-1">Property Pincode</label>
                  <input type="text" value={propertyPincode} onChange={e => setPropertyPincode(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface font-mono" />
                </div>

                <div>
                  <label className="font-semibold text-on-surface-variant block mb-1">Co-Applicant</label>
                  <select value={coApplicant} onChange={e => setCoApplicant(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface">
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
                  <select value={vehicleCategory} onChange={e => setVehicleCategory(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface">
                    <option value="New Car">Brand New Vehicle</option>
                    <option value="Pre-Owned Car">Certified Pre-Owned Car</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-on-surface-variant block mb-1">Vehicle Manufacturer &amp; Model</label>
                  <input type="text" value={vehicleModel} onChange={e => setVehicleModel(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface font-bold" />
                </div>

                <div>
                  <label className="font-semibold text-on-surface-variant block mb-1">On-Road Price Quote (₹)</label>
                  <input type="number" value={onRoadPrice} onChange={e => setOnRoadPrice(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface font-mono font-bold" />
                </div>

                <div>
                  <label className="font-semibold text-on-surface-variant block mb-1">Proposed Down Payment (₹)</label>
                  <input type="number" value={downPayment} onChange={e => setDownPayment(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface font-mono font-bold" />
                </div>
              </div>
            )}

            {/* EDUCATION LOAN FIELDS */}
            {activeTypeKey === "EDUCATION" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="font-semibold text-on-surface-variant block mb-1">University / Institution Name</label>
                  <input type="text" value={institutionName} onChange={e => setInstitutionName(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface font-bold" />
                </div>

                <div>
                  <label className="font-semibold text-on-surface-variant block mb-1">Course Level</label>
                  <select value={courseLevel} onChange={e => setCourseLevel(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface">
                    <option value="Undergraduate (BSc/BTech)">Undergraduate (BSc/BTech)</option>
                    <option value="Postgraduate (MSc/MBA)">Postgraduate (MSc/MBA)</option>
                    <option value="Doctorate / PhD">Doctorate / PhD</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-on-surface-variant block mb-1">Course Country</label>
                  <select value={courseCountry} onChange={e => setCourseCountry(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface">
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United States">United States</option>
                    <option value="India (Domestic)">India (Domestic Top Tier)</option>
                    <option value="Germany / EU">Germany / Europe</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-on-surface-variant block mb-1">Total Course Fees &amp; Expenses (₹)</label>
                  <input type="number" value={totalCourseFees} onChange={e => setTotalCourseFees(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface font-mono font-bold" />
                </div>

                <div>
                  <label className="font-semibold text-on-surface-variant block mb-1">Co-Borrower Annual Income (₹)</label>
                  <input type="number" value={coBorrowerIncome} onChange={e => setCoBorrowerIncome(e.target.value)} className="w-full bg-surface border border-outline-variant/30 rounded-xl px-3 py-2 text-on-surface font-mono font-bold" />
                </div>
              </div>
            )}

          </div>
        )}

        {/* STEP 3: INTERACTIVE DOCUMENT UPLOADER */}
        {currentStep === 3 && (
          <div className="space-y-4 text-xs">
            <p className="text-on-surface-variant text-xs">
              Upload required documents for <strong>{currentProduct.name}</strong> verification. Scanned PDFs or JPG images accepted.
            </p>

            <div className="space-y-3">
              {currentProduct.requiredDocs.map((docName, idx) => {
                const uploaded = uploadedFiles[docName];
                return (
                  <div key={idx} className="p-3.5 bg-surface rounded-xl border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${uploaded ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-surface-high text-on-surface-variant'}`}>
                        {uploaded ? <FileCheck size={18} /> : <FileText size={18} />}
                      </div>
                      <div>
                        <p className="font-bold text-on-surface text-xs">{docName}</p>
                        {uploaded ? (
                          <p className="text-[11px] text-green-400 font-mono font-medium">{uploaded.name} ({uploaded.size})</p>
                        ) : (
                          <p className="text-[11px] text-on-surface-variant">Mandatory verification document</p>
                        )}
                      </div>
                    </div>

                    <div>
                      {uploaded ? (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveFile(docName)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Remove file"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        <label htmlFor={`${panInputId}-${idx}`} className="cursor-pointer px-3 py-1.5 bg-primary/10 text-primary border border-primary/30 rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors flex items-center gap-1.5">
                          <Upload size={14} /> Upload
                          <input 
                            id={`${panInputId}-${idx}`}
                            type="file" 
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden" 
                            onChange={(e) => handleFileUpload(docName, e)}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: REAL-TIME CREDIT & ELIGIBILITY EVALUATION */}
        {currentStep === 4 && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-gradient-to-r from-surface to-surface-container rounded-xl border border-primary/30 space-y-3">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="font-bold text-on-surface text-sm">Automated Underwriting Summary</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1">
                  <ShieldCheck size={14} /> High Approval Likelihood
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-center pt-1">
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">CIBIL Score</span>
                  <span className="text-sm font-bold text-green-400">785 / 900</span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">FOIR Ratio</span>
                  <span className={`text-sm font-bold ${foirRatio <= 50 ? 'text-green-400' : 'text-amber-400'}`}>{foirRatio}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">Applied Amount</span>
                  <span className="text-sm font-bold text-primary">₹{loanAmount.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">Calculated EMI</span>
                  <span className="text-sm font-bold text-on-surface">₹{emi.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-surface rounded-xl border border-white/5 space-y-1">
              <p className="font-bold text-on-surface text-xs">Verification Details</p>
              <p className="text-[11px] text-on-surface-variant">
                Documents Attached: <strong>{Object.keys(uploadedFiles).length} Verified Files</strong> • Bank Mandate Account: <strong>Primary Savings ACC-001 •••• 8812</strong>
              </p>
            </div>
          </div>
        )}

        {/* STEP 5: APPLICATION SUBMITTED CONFIRMATION */}
        {currentStep === 5 && submittedApp && (
          <div className="flex flex-col items-center text-center py-6 gap-3">
            <div className="w-16 h-16 rounded-full bg-green-500/15 text-green-400 border border-green-500/30 flex items-center justify-center animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="text-lg font-bold text-on-surface">Loan Application Submitted!</h3>
            <p className="text-xs text-on-surface-variant max-w-md">
              Your application for <strong>{submittedApp.loanTypeName}</strong> of <strong className="text-primary font-mono">₹{submittedApp.requestedAmount.toLocaleString('en-IN')}</strong> has been submitted.
            </p>
            <div className="p-3 bg-surface rounded-xl border border-white/5 font-mono text-xs text-on-surface-variant my-2">
              Application Reference: <strong className="text-primary font-bold">{submittedApp.referenceNumber}</strong>
            </div>
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs hover:shadow-[0_0_15px_rgba(240,180,41,0.4)]"
            >
              Done &amp; View Dashboard
            </button>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        {currentStep < 5 && (
          <div className="flex justify-between items-center pt-3 border-t border-white/5">
            {currentStep > 1 ? (
              <button 
                type="button" 
                onClick={handlePrevStep}
                className="px-4 py-2.5 bg-surface-high text-on-surface font-semibold rounded-xl text-xs hover:bg-surface-highest flex items-center gap-1.5"
              >
                <ArrowLeft size={14} /> Back
              </button>
            ) : <div />}

            {currentStep < 4 ? (
              <button 
                type="button" 
                onClick={handleNextStep}
                className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] flex items-center gap-1.5"
              >
                Next <ArrowRight size={14} />
              </button>
            ) : (
              <button 
                type="button" 
                disabled={isSubmitting}
                onClick={handleSubmitApplication}
                className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl text-xs hover:shadow-[0_0_15px_rgba(240,180,41,0.4)] flex items-center gap-1.5 disabled:opacity-40"
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
