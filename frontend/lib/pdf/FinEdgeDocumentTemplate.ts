import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PdfUtils } from './PdfUtils';

export interface DocumentMetadata {
  documentId: string;
  documentType: string;
  referenceId?: string;
  accountNumber?: string;
  dateStr?: string;
}

export interface CustomerInfo {
  name: string;
  accountNumber: string;
  reference?: string;
  accountType?: string;
  status?: string;
}

export class FinEdgeDocumentTemplate {
  public doc: jsPDF;
  private metadata: DocumentMetadata;
  private title: string;
  private startY: number;

  // FinEdge Branding Colors
  private colors = {
    primary: '#2563EB', // Blue
    text: '#09090B',    // Near Black
    secondary: '#71717A', // Gray
    border: '#E4E4E7',  // Light Gray
    bg: '#FFFFFF',      // White
    success: '#16A34A', // Green
    warning: '#D97706', // Amber
    danger: '#DC2626'   // Red
  };

  constructor(title: string, metadata: DocumentMetadata, orientation: 'p' | 'l' = 'p') {
    this.doc = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4'
    });
    this.title = title;
    this.metadata = metadata;
    this.startY = 60; // Starting Y position after header
  }

  public getStartY(): number {
    return this.startY;
  }

  public setStartY(y: number): void {
    this.startY = y;
  }

  /**
   * Adds the standardized FinEdge header to the current page.
   */
  private drawHeader() {
    const pageWidth = this.doc.internal.pageSize.getWidth();
    
    // Brand Name
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(22);
    this.doc.setTextColor(this.colors.primary);
    this.doc.text('FINEDGE', 20, 25);

    // Tagline
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    this.doc.setTextColor(this.colors.secondary);
    this.doc.text('Smart Banking. Safer Transactions.', 20, 31);

    // Document Title
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(16);
    this.doc.setTextColor(this.colors.text);
    this.doc.text(this.title.toUpperCase(), 20, 45);

    // Right-aligned Metadata
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    
    this.doc.setTextColor(this.colors.secondary);
    this.doc.text('Statement Date:', pageWidth - 20, 25, { align: 'right' });
    this.doc.setTextColor(this.colors.text);
    this.doc.text(this.metadata.dateStr || PdfUtils.formatDate(new Date()), pageWidth - 20, 30, { align: 'right' });

    this.doc.setTextColor(this.colors.secondary);
    this.doc.text('Document ID:', pageWidth - 20, 40, { align: 'right' });
    this.doc.setTextColor(this.colors.text);
    this.doc.text(this.metadata.documentId, pageWidth - 20, 45, { align: 'right' });

    // Divider Line
    this.doc.setDrawColor(this.colors.border);
    this.doc.setLineWidth(0.5);
    this.doc.line(20, 50, pageWidth - 20, 50);
  }

  /**
   * Adds the standard footer to the current page.
   */
  private drawFooter(pageNumber: number, totalPages: number) {
    const pageWidth = this.doc.internal.pageSize.getWidth();
    const pageHeight = this.doc.internal.pageSize.getHeight();
    const footerY = pageHeight - 15;

    // Divider Line
    this.doc.setDrawColor(this.colors.border);
    this.doc.setLineWidth(0.5);
    this.doc.line(20, footerY - 5, pageWidth - 20, footerY - 5);

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(8);
    this.doc.setTextColor(this.colors.secondary);
    
    this.doc.text('FinEdge • Smart Banking. Safer Transactions.', 20, footerY);
    
    // Metadata in footer
    const genTime = `Generated on: ${PdfUtils.formatDateTime(new Date())}`;
    this.doc.text(genTime, pageWidth / 2, footerY, { align: 'center' });
    this.doc.text(`Doc ID: ${this.metadata.documentId}`, pageWidth / 2, footerY + 4, { align: 'center' });

    // Page numbers
    this.doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 20, footerY, { align: 'right' });
  }

  /**
   * Draws the FinEdge watermark securely BEHIND the text.
   */
  private drawWatermark() {
    const pageWidth = this.doc.internal.pageSize.getWidth();
    const pageHeight = this.doc.internal.pageSize.getHeight();

    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(80);
    this.doc.setTextColor(150, 150, 150); // Gray
    
    // Save graphics state to apply opacity (around 8%)
    this.doc.setGState(new (this.doc as any).GState({ opacity: 0.08 }));
    
    // Draw rotated text in the center
    this.doc.text('FINEDGE', pageWidth / 2, pageHeight / 2, {
      align: 'center',
      angle: 30
    });
    
    // Restore graphics state to full opacity for normal content
    this.doc.setGState(new (this.doc as any).GState({ opacity: 1.0 }));
  }

  /**
   * Applies the header, footer, and watermark to ALL pages.
   * MUST be called before saving.
   */
  private finalizeDocument() {
    const totalPages = (this.doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      this.drawWatermark();
      this.drawHeader();
      this.drawFooter(i, totalPages);
    }
  }

  /**
   * Adds the standard Customer/Account Information block.
   */
  public addCustomerInfo(info: CustomerInfo) {
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(10);
    this.doc.setTextColor(this.colors.primary);
    this.doc.text('CUSTOMER / ACCOUNT INFORMATION', 20, this.startY);
    
    this.startY += 8;

    this.doc.setFontSize(9);
    
    // Left column
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(this.colors.secondary);
    this.doc.text('Account Holder:', 20, this.startY);
    this.doc.text('Account Number:', 20, this.startY + 6);
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(this.colors.text);
    this.doc.text(info.name, 50, this.startY);
    this.doc.text(PdfUtils.maskAccountNumber(info.accountNumber), 50, this.startY + 6);

    // Right column
    if (info.reference || info.accountType) {
      const rightColX = 120;
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(this.colors.secondary);
      this.doc.text('Customer Ref:', rightColX, this.startY);
      this.doc.text('Account Type:', rightColX, this.startY + 6);

      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(this.colors.text);
      this.doc.text(info.reference || 'N/A', rightColX + 25, this.startY);
      this.doc.text(info.accountType || 'N/A', rightColX + 25, this.startY + 6);
    }

    if (info.status) {
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(this.colors.secondary);
      this.doc.text('Status:', 20, this.startY + 12);
      this.doc.setFont('helvetica', 'bold');
      
      if (info.status.toUpperCase() === 'ACTIVE') this.doc.setTextColor(this.colors.success);
      else if (info.status.toUpperCase() === 'FROZEN') this.doc.setTextColor(this.colors.primary);
      else if (info.status.toUpperCase() === 'CLOSED') this.doc.setTextColor(this.colors.danger);
      else this.doc.setTextColor(this.colors.text);
      
      this.doc.text(info.status.toUpperCase(), 50, this.startY + 12);
      this.startY += 12;
    } else {
      this.startY += 6;
    }

    this.startY += 10;
  }

  /**
   * Adds a section title.
   */
  public addSectionTitle(title: string) {
    // Check page overflow
    if (this.startY > this.doc.internal.pageSize.getHeight() - 40) {
      this.doc.addPage();
      this.startY = 60;
    }
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(10);
    this.doc.setTextColor(this.colors.primary);
    this.doc.text(title.toUpperCase(), 20, this.startY);
    this.startY += 6;
  }

  /**
   * Adds key-value pairs (e.g. for receipts or summaries)
   */
  public addKeyValuePairs(pairs: { label: string; value: string; isAmount?: boolean; status?: string }[], startX: number = 20) {
    this.doc.setFontSize(9);
    let currentY = this.startY;

    pairs.forEach(pair => {
      // Page break check
      if (currentY > this.doc.internal.pageSize.getHeight() - 30) {
        this.doc.addPage();
        currentY = 60;
      }

      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(this.colors.secondary);
      this.doc.text(pair.label, startX, currentY);

      this.doc.setFont('helvetica', 'bold');
      if (pair.status) {
        if (['COMPLETED', 'SUCCESS', 'ACTIVE', 'APPROVED'].includes(pair.status.toUpperCase())) this.doc.setTextColor(this.colors.success);
        else if (['PENDING'].includes(pair.status.toUpperCase())) this.doc.setTextColor(this.colors.warning);
        else if (['FAILED', 'REJECTED', 'CLOSED'].includes(pair.status.toUpperCase())) this.doc.setTextColor(this.colors.danger);
        else this.doc.setTextColor(this.colors.text);
      } else {
        this.doc.setTextColor(this.colors.text);
      }

      this.doc.text(pair.value, startX + 40, currentY);
      currentY += 7;
    });

    this.startY = currentY + 5;
  }

  /**
   * Adds the standard security notice.
   */
  public addSecurityNotice(isSensitive: boolean = false) {
    // Check if we need a new page for the notice
    if (this.startY > this.doc.internal.pageSize.getHeight() - 40) {
      this.doc.addPage();
      this.startY = 60;
    }
    
    this.doc.setFont('helvetica', 'italic');
    this.doc.setFontSize(8);
    this.doc.setTextColor(this.colors.secondary);
    
    this.startY += 5;
    this.doc.text("This is a computer-generated document issued by FinEdge. No physical signature is required.", 20, this.startY);
    
    if (isSensitive) {
      this.startY += 4;
      this.doc.text("Sensitive credentials including PIN, CVV and passwords are never displayed in this document.", 20, this.startY);
    }
    
    this.startY += 10;
  }

  /**
   * Completes the document, applies backgrounds/headers/footers, and downloads the file.
   */
  public save(filename?: string) {
    this.finalizeDocument();
    
    const finalFilename = filename || `FinEdge_${this.metadata.documentType}_${this.metadata.documentId}.pdf`;
    this.doc.save(finalFilename);
  }
}
