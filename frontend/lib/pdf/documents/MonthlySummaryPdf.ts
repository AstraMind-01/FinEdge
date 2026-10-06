import { FinEdgeDocumentTemplate, CustomerInfo } from '../FinEdgeDocumentTemplate';
import { PdfTable } from '../PdfTable';
import { PdfUtils } from '../PdfUtils';
import { Account, Transaction, UserProfile } from '../../../types';

export interface MonthlySummaryData {
  userProfile?: Partial<UserProfile>;
  account?: Partial<Account>;
  period: string;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  creditScore: number;
  categoryBreakdown: { name: string; amount: number; percentage: number }[];
  transactions: Transaction[];
}

export const MonthlySummaryPdfBuilder = {
  generate(data: MonthlySummaryData) {
    const docId = PdfUtils.generateDocumentId('SUMM');
    const template = new FinEdgeDocumentTemplate('MONTHLY SUMMARY REPORT', {
      documentId: docId,
      documentType: 'MONTHLY_SUMMARY',
      accountNumber: data.account?.accountNumber || 'ACC-9842',
      dateStr: PdfUtils.formatDate(new Date())
    }, 'p');

    // Customer Info
    const customerInfo: CustomerInfo = {
      name: data.userProfile?.name || 'Alex Johnson',
      accountNumber: data.account?.maskedNumber || '•••• 2840',
      accountType: data.account?.type || 'Savings Account',
      status: 'VERIFIED'
    };
    template.addCustomerInfo(customerInfo);

    // Section 1: Financial Overview Summary
    template.addSectionTitle('FINANCIAL OVERVIEW');
    template.addKeyValuePairs([
      { label: 'Report Period', value: data.period },
      { label: 'Total Income', value: PdfUtils.formatCurrency(data.totalIncome) },
      { label: 'Total Expenses', value: PdfUtils.formatCurrency(data.totalExpenses) },
      { label: 'Net Savings', value: PdfUtils.formatCurrency(data.netSavings) },
      { label: 'Savings Rate', value: `${((data.netSavings / (data.totalIncome || 1)) * 100).toFixed(1)}%` },
      { label: 'Credit Score', value: `${data.creditScore} (EXCELLENT)` }
    ]);

    // Section 2: Category Spending Breakdown
    template.addSectionTitle('CATEGORY SPENDING BREAKDOWN');
    const categoryHeaders = [['Category Name', 'Amount (₹)', 'Percentage Share']];
    const categoryRows = data.categoryBreakdown.map(c => [
      c.name,
      PdfUtils.formatCurrency(c.amount),
      `${c.percentage}%`
    ]);
    PdfTable.drawTable(template, categoryHeaders, categoryRows);

    // Section 3: Itemized Transactions Summary
    template.addSectionTitle('ITEMIZED TRANSACTIONS SUMMARY');
    if (data.transactions.length === 0) {
      template.doc.setFont('helvetica', 'italic');
      template.doc.setFontSize(9);
      template.doc.setTextColor(150, 150, 150);
      template.doc.text('No transactions found for the selected period.', 20, template.getStartY());
      template.setStartY(template.getStartY() + 10);
    } else {
      const txHeaders = [['Date', 'Description', 'Category', 'Type', 'Amount (₹)']];
      const txRows = data.transactions.slice(0, 20).map(t => [
        PdfUtils.formatDate(t.date || t.timestamp),
        t.merchantName || t.category || 'Transaction',
        t.category || 'General',
        t.type,
        PdfUtils.formatCurrency(Math.abs(t.amount))
      ]);
      PdfTable.drawTable(template, txHeaders, txRows);
    }

    template.addSecurityNotice(true);
    template.save(`FinEdge_Monthly_Summary_${data.period.replace(/\s+/g, '_')}.pdf`);
  }
};
