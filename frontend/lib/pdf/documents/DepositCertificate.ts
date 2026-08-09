import { FinEdgeDocumentTemplate, CustomerInfo } from '../FinEdgeDocumentTemplate';
import { PdfUtils } from '../PdfUtils';
import { Deposit } from '../../../types';

export const DepositCertificateBuilder = {
  generate(
    deposit: Deposit,
    customerName: string,
    linkedAccountNumber: string
  ) {
    const docId = PdfUtils.generateDocumentId('FD');
    const template = new FinEdgeDocumentTemplate('FIXED DEPOSIT CERTIFICATE', {
      documentId: docId,
      documentType: 'Deposit_Certificate',
      referenceId: deposit.id,
      dateStr: PdfUtils.formatDate(new Date())
    }, 'p');

    // Add Customer Info
    const customerInfo: CustomerInfo = {
      name: customerName,
      accountNumber: linkedAccountNumber,
      accountType: deposit.type === 'RD' ? 'Recurring Deposit' : 'Fixed Deposit',
      status: deposit.status || 'Active'
    };
    template.addCustomerInfo(customerInfo);

    // Add Details
    template.addSectionTitle('DEPOSIT DETAILS');
    
    template.addKeyValuePairs([
      { label: 'Deposit Reference Number', value: deposit.id },
      { label: 'Principal Amount', value: PdfUtils.formatCurrency(deposit.principalAmount) },
      { label: 'Interest Rate', value: `${deposit.interestRate}% p.a.` },
      { label: 'Deposit Type', value: deposit.type === 'RD' ? 'Recurring Deposit' : 'Fixed Deposit' },
      { label: 'Start Date', value: PdfUtils.formatDate(deposit.startDate) },
      { label: 'Maturity Date', value: PdfUtils.formatDate(deposit.maturityDate) },
      { label: 'Maturity Amount (Estimated)', value: PdfUtils.formatCurrency(deposit.maturityAmount) },
      { label: 'Status', value: deposit.status || 'ACTIVE', status: deposit.status || 'ACTIVE' },
    ]);

    // Add Security Notice
    template.addSecurityNotice(true);

    // Save
    template.save(`FinEdge_FD_Certificate_${deposit.id}.pdf`);
  }
};
