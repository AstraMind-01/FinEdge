import { FinEdgeDocumentTemplate, CustomerInfo } from '../FinEdgeDocumentTemplate';
import { PdfUtils } from '../PdfUtils';
import { UserProfile } from '../../../types';

export interface RechargeReceiptData {
  userProfile?: Partial<UserProfile>;
  referenceId: string;
  mobileNumber: string;
  operator: string;
  amount: number;
  planDetails?: string;
  paymentMode: string;
  status: string;
  timestamp: string;
}

export const RechargeReceiptPdfBuilder = {
  generate(data: RechargeReceiptData) {
    const docId = PdfUtils.generateDocumentId('RCH');
    const template = new FinEdgeDocumentTemplate('MOBILE RECHARGE RECEIPT', {
      documentId: docId,
      documentType: 'RECHARGE_RECEIPT',
      referenceId: data.referenceId,
      dateStr: PdfUtils.formatDate(new Date())
    }, 'p');

    const customerInfo: CustomerInfo = {
      name: data.userProfile?.name || 'Alex Johnson',
      accountNumber: '•••• 2840',
      status: 'TRANSACTION SUCCESSFUL'
    };
    template.addCustomerInfo(customerInfo);

    template.addSectionTitle('RECHARGE TRANSACTION DETAILS');
    template.addKeyValuePairs([
      { label: 'Transaction Ref ID', value: data.referenceId },
      { label: 'Mobile Number', value: data.mobileNumber },
      { label: 'Telecom Operator', value: data.operator },
      { label: 'Recharge Amount', value: PdfUtils.formatCurrency(data.amount) },
      { label: 'Plan Details', value: data.planDetails || 'Unlimited Voice + 1.5GB/day (28 Days)' },
      { label: 'Payment Method', value: data.paymentMode },
      { label: 'Status', value: data.status, status: data.status },
      { label: 'Date & Time', value: data.timestamp }
    ]);

    template.addSecurityNotice(false);
    template.save(`FinEdge_Recharge_Receipt_${data.referenceId}.pdf`);
  }
};
