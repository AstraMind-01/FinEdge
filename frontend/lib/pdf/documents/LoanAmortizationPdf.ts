import { FinEdgeDocumentTemplate, CustomerInfo } from '../FinEdgeDocumentTemplate';
import { PdfTable } from '../PdfTable';
import { PdfUtils } from '../PdfUtils';
import { UserProfile } from '../../../types';

export interface LoanAmortizationData {
  userProfile?: Partial<UserProfile>;
  loanAccountNo: string;
  loanType: string;
  principalAmount: number;
  interestRatePct: number;
  tenureMonths: number;
  monthlyEmi: number;
  outstandingBalance: number;
  schedule: { installmentNo: number; dueDate: string; emiAmount: number; principalComponent: number; interestComponent: number; remainingBalance: number }[];
}

export const LoanAmortizationPdfBuilder = {
  generate(data: LoanAmortizationData) {
    const docId = PdfUtils.generateDocumentId('LOAN');
    const template = new FinEdgeDocumentTemplate('LOAN AMORTIZATION SCHEDULE', {
      documentId: docId,
      documentType: 'LOAN_AMORTIZATION',
      accountNumber: data.loanAccountNo,
      dateStr: PdfUtils.formatDate(new Date())
    }, 'p');

    const customerInfo: CustomerInfo = {
      name: data.userProfile?.name || 'Alex Johnson',
      accountNumber: data.loanAccountNo,
      accountType: data.loanType,
      status: 'REGULAR REPAYMENT'
    };
    template.addCustomerInfo(customerInfo);

    // Section 1: Loan Details Summary
    template.addSectionTitle('LOAN ACCOUNT SUMMARY');
    template.addKeyValuePairs([
      { label: 'Loan Account No', value: data.loanAccountNo },
      { label: 'Loan Product', value: data.loanType },
      { label: 'Sanctioned Amount', value: PdfUtils.formatCurrency(data.principalAmount) },
      { label: 'Interest Rate', value: `${data.interestRatePct}% p.a. (Reducing)` },
      { label: 'Loan Tenure', value: `${data.tenureMonths} Months (${(data.tenureMonths / 12).toFixed(1)} Years)` },
      { label: 'Monthly EMI Amount', value: PdfUtils.formatCurrency(data.monthlyEmi) },
      { label: 'Outstanding Balance', value: PdfUtils.formatCurrency(data.outstandingBalance) }
    ]);

    // Section 2: Amortization Schedule Table
    template.addSectionTitle('REPAYMENT AMORTIZATION SCHEDULE');
    const headers = [['No.', 'Due Date', 'EMI (₹)', 'Principal (₹)', 'Interest (₹)', 'Balance (₹)']];
    const rows = data.schedule.map(s => [
      String(s.installmentNo),
      s.dueDate,
      PdfUtils.formatCurrency(s.emiAmount),
      PdfUtils.formatCurrency(s.principalComponent),
      PdfUtils.formatCurrency(s.interestComponent),
      PdfUtils.formatCurrency(s.remainingBalance)
    ]);

    PdfTable.drawTable(template, headers, rows);

    template.addSecurityNotice(true);
    template.save(`FinEdge_Loan_Amortization_${data.loanAccountNo}.pdf`);
  }
};
