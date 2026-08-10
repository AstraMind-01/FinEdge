import { FinEdgeDocumentTemplate, CustomerInfo } from '../FinEdgeDocumentTemplate';
import { PdfUtils } from '../PdfUtils';
import { UserProfile } from '../../../types';

export interface BillPaymentReceiptData {
  userProfile?: Partial<UserProfile>;
  referenceId: string;
  billerName: string;
  category: string;
  consumerNumber: string;
  amount: number;
  paymentMode: string;
  status: string;
  timestamp: string;
}

export const BillPaymentReceiptPdfBuilder = {
  generate(data: BillPaymentReceiptData) {
    const docId = PdfUtils.generateDocumentId('BILL');
    const template = new FinEdgeDocumentTemplate('BILL PAYMENT RECEIPT', {
      documentId: docId,
      documentType: 'BILL_PAYMENT_RECEIPT',
      referenceId: data.referenceId,
      dateStr: PdfUtils.formatDate(new Date())
    }, 'p');

    const customerInfo: CustomerInfo = {
      name: data.userProfile?.name || 'Alex Johnson',
      accountNumber: '•••• 2840',
      status: 'PAYMENT PROCESSED'
    };
    template.addCustomerInfo(customerInfo);

    template.addSectionTitle('BILL PAYMENT DETAILS');
    template.addKeyValuePairs([
      { label: 'Payment Ref ID', value: data.referenceId },
      { label: 'Biller Name', value: data.billerName },
      { label: 'Bill Category', value: data.category },
      { label: 'Consumer / Account No', value: data.consumerNumber },
      { label: 'Amount Paid', value: PdfUtils.formatCurrency(data.amount) },
      { label: 'Payment Mode', value: data.paymentMode },
      { label: 'Status', value: data.status, status: data.status },
      { label: 'Date & Time', value: data.timestamp }
    ]);

    template.addSecurityNotice(false);
    template.save(`FinEdge_Bill_Payment_Receipt_${data.referenceId}.pdf`);
  }
};
