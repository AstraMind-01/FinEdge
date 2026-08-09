import { FinEdgeDocumentTemplate, CustomerInfo } from '../FinEdgeDocumentTemplate';
import { PdfUtils } from '../PdfUtils';
import { PdfTable } from '../PdfTable';
import { Account } from '../../../types';

export const InterestCertificateBuilder = {
  generate(
    accounts: Account[],
    customerName: string,
    financialYear: string = '2025-2026'
  ) {
    if (!accounts || accounts.length === 0) return;
    const primaryAccount = accounts[0];
    const docId = PdfUtils.generateDocumentId('CERT');
    const template = new FinEdgeDocumentTemplate('INTEREST CERTIFICATE', {
      documentId: docId,
      documentType: 'Interest_Certificate',
      accountNumber: primaryAccount.accountNumber,
      dateStr: PdfUtils.formatDate(new Date())
    }, 'p');

    // Add Customer Info
    const customerInfo: CustomerInfo = {
      name: customerName,
      accountNumber: primaryAccount.accountNumber || primaryAccount.maskedNumber || 'Multiple Accounts',
      accountType: 'Consolidated Accounts'
    };
    template.addCustomerInfo(customerInfo);

    // Add Details
    template.addSectionTitle('CERTIFICATE DETAILS');
    
    // Sum across all accounts
    const totalInterest = accounts.reduce((sum, a) => sum + (a.interestEarned || 7300), 0);
    const tdsDeducted = totalInterest > 10000 ? totalInterest * 0.1 : 0;
    const netInterest = totalInterest - tdsDeducted;

    template.addKeyValuePairs([
      { label: 'Financial Year', value: financialYear },
      { label: 'Total Interest Earned', value: PdfUtils.formatCurrency(totalInterest) },
      { label: 'TDS Deducted', value: PdfUtils.formatCurrency(tdsDeducted) },
      { label: 'Net Interest Paid', value: PdfUtils.formatCurrency(netInterest) }
    ]);

    // Add Breakdown Table
    template.addSectionTitle('ACCOUNT BREAKDOWN');
    const tableHeaders = [['Account', 'Type', 'Account Number', 'Interest Earned']];
    const tableData = accounts.map(a => [
      a.name,
      a.type || 'Savings',
      a.maskedNumber || a.accountNumber || 'N/A',
      PdfUtils.formatCurrency(a.interestEarned || 7300)
    ]);
    PdfTable.drawTable(template, tableHeaders, tableData);

    // Add Declaration
    template.doc.setFont('helvetica', 'normal');
    template.doc.setFontSize(9);
    template.doc.setTextColor(100, 100, 100);
    const declaration = `This is to certify that the interest mentioned above has been credited to the account holder during the financial year ${financialYear}. This certificate can be used for tax filing purposes.`;
    const splitText = template.doc.splitTextToSize(declaration, 170);
    template.doc.text(splitText, 20, template.getStartY() + 10);
    template.setStartY(template.getStartY() + 15 + (splitText.length * 5));

    // Add Security Notice
    template.addSecurityNotice(false);

    // Save
    template.save(`FinEdge_Interest_Certificate_FY${financialYear.replace('-', '_')}.pdf`);
  }
};
