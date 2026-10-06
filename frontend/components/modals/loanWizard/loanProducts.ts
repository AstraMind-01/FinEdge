import React from "react";
import { User, Home, Car, GraduationCap } from "lucide-react";

export interface LoanProductConfig {
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

export const LOAN_PRODUCTS: Record<string, LoanProductConfig> = {
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
    icon: React.createElement(User, { size: 20, className: "text-purple-400" }),
    requiredDocs: ["PAN Card Copy", "Last 3 Months Salary Slips", "6 Months Bank Statement"],
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
    icon: React.createElement(Home, { size: 20, className: "text-blue-400" }),
    requiredDocs: [
      "PAN & Aadhaar Card",
      "Property Title Deed / Allotment Letter",
      "2 Years ITR / Form 16",
      "6 Months Bank Statement",
    ],
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
    icon: React.createElement(Car, { size: 20, className: "text-teal-400" }),
    requiredDocs: [
      "PAN Card Copy",
      "Dealer Proforma Invoice / Price Quote",
      "6 Months Bank Statement",
      "Address Proof",
    ],
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
    icon: React.createElement(GraduationCap, { size: 20, className: "text-primary" }),
    requiredDocs: [
      "Student Marksheets & Admission Letter",
      "University Fee Breakdown",
      "Co-Borrower Income Proof",
      "6 Months Bank Statement",
    ],
  },
};

export const getProductKey = (typeStr: string): string => {
  const s = typeStr.toUpperCase();
  if (s.includes("HOME")) return "HOME";
  if (s.includes("CAR") || s.includes("VEHICLE")) return "CAR";
  if (s.includes("EDU")) return "EDUCATION";
  return "PERSONAL";
};

export const calculateEmiDetails = (principal: number, annualRate: number, tenureMonths: number) => {
  const p = principal;
  const r = annualRate / 12 / 100;
  const n = tenureMonths;
  const emi = Math.round((p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
  const totalPayment = emi * n;
  const totalInterest = Math.max(0, totalPayment - p);
  return { emi, totalPayment, totalInterest };
};
