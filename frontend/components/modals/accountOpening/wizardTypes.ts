import React from "react";
import { Landmark, User, MapPin, CreditCard, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";

export interface AccountOpeningFormData {
  // Step 1: Product
  productType: "savings" | "current" | "fd" | "rd";
  accountVariant: string;
  ownershipType: "INDIVIDUAL" | "JOINT";
  isAge18Plus: boolean;
  isTaxResident: boolean;
  isKycVerified: boolean;
  isNotPep: boolean;

  // Step 2: Personal & Income
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  panNumber: string;
  aadhaarNumber: string;
  fatherName: string;
  motherName: string;
  maritalStatus: string;
  occupation: string;
  annualIncome: string;
  industry: string;
  sourceOfFunds: string;

  // Step 3: Address & Nominee
  address: string;
  city: string;
  state: string;
  pincode: string;
  nomineeName: string;
  nomineeRelation: string;
  nomineeDob: string;
  nomineeSameAddress: boolean;

  // Step 4: Preferences & Funding
  debitCardType: string;
  requestChequeBook: boolean;
  whatsappBanking: boolean;
  fundingMethod: string;
  initialDeposit: number;

  // Step 5: KYC Docs
  docType: string;
  docFrontUploaded: boolean;
  docBackUploaded: boolean;
  selfieVerified: boolean;

  // Step 6: Consent & e-Sign
  acceptTerms: boolean;
  acceptFatca: boolean;
  otpCode: string;
}

export const WIZARD_STEPS = [
  { id: 1, title: "Product & Eligibility", icon: Landmark },
  { id: 2, title: "Personal & Income", icon: User },
  { id: 3, title: "Address & Nominee", icon: MapPin },
  { id: 4, title: "Preferences & Funding", icon: CreditCard },
  { id: 5, title: "KYC Verification", icon: ShieldCheck },
  { id: 6, title: "Review & e-Sign", icon: FileText },
  { id: 7, title: "Account Active", icon: CheckCircle2 },
];

export const getProductInfo = (productType: string) => {
  switch (productType) {
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
