import { MonthlySummaryPdfBuilder } from './pdf/documents/MonthlySummaryPdf';
import { InvestmentReportPdfBuilder } from './pdf/documents/InvestmentReportPdf';
import { LoanAmortizationPdfBuilder } from './pdf/documents/LoanAmortizationPdf';
import { AccountStatementBuilder } from './pdf/documents/AccountStatement';
import { TransactionReceiptBuilder } from './pdf/documents/TransactionReceipt';
import { RechargeReceiptPdfBuilder } from './pdf/documents/RechargeReceiptPdf';
import { BillPaymentReceiptPdfBuilder } from './pdf/documents/BillPaymentReceiptPdf';
import { TaxForm16PdfBuilder } from './pdf/documents/TaxForm16Pdf';
import { Account, Transaction, UserProfile } from '../types';

export type PdfDocumentType =
  | 'MONTHLY_SUMMARY'
  | 'TAX_STATEMENT'
  | 'INVESTMENT_REPORT'
  | 'LOAN_AMORTIZATION'
  | 'ACCOUNT_STATEMENT'
  | 'TRANSACTION_RECEIPT'
  | 'FUND_TRANSFER_RECEIPT'
  | 'RECHARGE_RECEIPT'
  | 'BILL_PAYMENT_RECEIPT';

export interface GeneratePdfOptions {
  documentType: PdfDocumentType;
  entityId?: string;
  period?: string;
  account?: Account;
  transactions?: Transaction[];
  userProfile?: UserProfile;
  format?: 'PDF' | 'CSV';
  customData?: any;
}

export async function generateAndDownloadCentralPDF(options: GeneratePdfOptions): Promise<boolean> {
  try {
    // 1. Call backend API for authorization and document metadata verification
    const response = await fetch('/api/pdf/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentType: options.documentType,
        entityId: options.entityId,
        period: options.period,
        format: options.format || 'PDF',
      }),
    });

    let apiData = null;
    if (response.ok) {
      apiData = await response.json();
    }

    const periodStr = options.period || 'This Month';
    const profile = options.userProfile || { name: 'Alex Johnson', email: 'alex@example.com', customerID: 'FE9842', branch: 'Mumbai Main' };

    // 2. Select specific feature builder based on documentType
    switch (options.documentType) {
      case 'MONTHLY_SUMMARY': {
        MonthlySummaryPdfBuilder.generate({
          userProfile: profile,
          account: options.account,
          period: periodStr,
          totalIncome: apiData?.totalIncome || 86500,
          totalExpenses: apiData?.totalExpenses || 48650,
          netSavings: apiData?.netSavings || 37850,
          creditScore: apiData?.creditScore || 782,
          categoryBreakdown: apiData?.categoryBreakdown || [
            { name: 'Shopping', amount: 15552, percentage: 32 },
            { name: 'Food & Dining', amount: 11676, percentage: 24 },
            { name: 'Bills & Utilities', amount: 9243, percentage: 19 },
            { name: 'Travel', amount: 6811, percentage: 14 },
            { name: 'Health', amount: 3405, percentage: 7 },
            { name: 'Others', amount: 1946, percentage: 4 },
          ],
          transactions: options.transactions || [],
        });
        break;
      }

      case 'TAX_STATEMENT': {
        const accountsList = options.account ? [options.account] : [
          { id: 'acc-1', name: 'Premium Savings', type: 'SAVINGS' as const, balance: 142850, accountNumber: '984210492840', maskedNumber: '•••• 2840', currency: 'INR', status: 'ACTIVE' as const, isDefault: true, interestRate: 3.5, interestEarned: 4999 }
        ];
        TaxForm16PdfBuilder.generate(profile as UserProfile, accountsList as Account[], '2025-26', '2026-27');
        break;
      }

      case 'INVESTMENT_REPORT': {
        InvestmentReportPdfBuilder.generate({
          userProfile: profile,
          totalPortfolioValue: 124000,
          monthlySipAmount: 15000,
          activeSipCount: 3,
          holdings: [
            { name: 'Nifty 50 Index Fund', category: 'Equity Mutual Fund', units: 450, investedAmount: 50000, currentValue: 58200, returnPct: 16.4 },
            { name: 'Parag Parikh Flexi Cap', category: 'Equity Mutual Fund', units: 210, investedAmount: 30000, currentValue: 34800, returnPct: 16.0 },
            { name: 'Fixed Deposit (12 Mon)', category: 'Debt / FD', units: 1, investedAmount: 30000, currentValue: 31000, returnPct: 3.3 },
          ],
        });
        break;
      }

      case 'LOAN_AMORTIZATION': {
        LoanAmortizationPdfBuilder.generate({
          userProfile: profile,
          loanAccountNo: options.entityId || 'LN-2026-8819',
          loanType: 'Home Loan (Fixed + Floating)',
          principalAmount: 2500000,
          interestRatePct: 8.5,
          tenureMonths: 240,
          monthlyEmi: 21695,
          outstandingBalance: 2450000,
          schedule: Array.from({ length: 12 }).map((_, idx) => ({
            installmentNo: idx + 1,
            dueDate: `${idx + 1} Sep 2026`,
            emiAmount: 21695,
            principalComponent: 4345 + idx * 30,
            interestComponent: 17350 - idx * 30,
            remainingBalance: 2450000 - (idx + 1) * 4345,
          })),
        });
        break;
      }

      case 'ACCOUNT_STATEMENT': {
        const targetAccount = options.account || { id: 'acc-1', name: 'Premium Savings', type: 'SAVINGS' as const, balance: 142850, accountNumber: '984210492840', maskedNumber: '•••• 2840', currency: 'INR', status: 'ACTIVE' as const, isDefault: true };
        AccountStatementBuilder.generate(targetAccount as Account, profile.name, options.transactions || [], periodStr);
        break;
      }

      case 'TRANSACTION_RECEIPT':
      case 'FUND_TRANSFER_RECEIPT': {
        const targetTx = (options.transactions && options.transactions[0]) || {
          id: options.entityId || 'TXN-99812',
          accountId: 'acc-1',
          merchantName: 'Razorpay / Transfer',
          amount: 2500,
          date: new Date().toLocaleDateString('en-IN'),
          type: 'DEBIT' as const,
          category: 'Transfer' as const,
          status: 'SUCCESS' as const,
          referenceId: options.entityId || `TXN-${Date.now()}`,
          timestamp: new Date().toISOString(),
        };
        TransactionReceiptBuilder.generate(targetTx as Transaction, profile.name, options.account?.maskedNumber || '•••• 2840');
        break;
      }

      case 'RECHARGE_RECEIPT': {
        RechargeReceiptPdfBuilder.generate({
          userProfile: profile,
          referenceId: options.entityId || `RCH-${Date.now()}`,
          mobileNumber: '+91 98765 43210',
          operator: 'Jio Prepaid',
          amount: 299,
          planDetails: '1.5GB/day + Unlimited Calls (28 Days)',
          paymentMode: 'Razorpay UPI',
          status: 'SUCCESS',
          timestamp: new Date().toLocaleString('en-IN'),
        });
        break;
      }

      case 'BILL_PAYMENT_RECEIPT': {
        BillPaymentReceiptPdfBuilder.generate({
          userProfile: profile,
          referenceId: options.entityId || `BILL-${Date.now()}`,
          billerName: 'Tata Power Electricity',
          category: 'Electricity Bill',
          consumerNumber: 'CONS-9981273',
          amount: 2450,
          paymentMode: 'Razorpay Net Banking',
          status: 'SUCCESS',
          timestamp: new Date().toLocaleString('en-IN'),
        });
        break;
      }

      default: {
        MonthlySummaryPdfBuilder.generate({
          userProfile: profile,
          account: options.account,
          period: periodStr,
          totalIncome: 86500,
          totalExpenses: 48650,
          netSavings: 37850,
          creditScore: 782,
          categoryBreakdown: [],
          transactions: options.transactions || [],
        });
        break;
      }
    }

    return true;
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    return false;
  }
}
