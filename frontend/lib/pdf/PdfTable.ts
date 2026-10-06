import autoTable from 'jspdf-autotable';
import { FinEdgeDocumentTemplate } from './FinEdgeDocumentTemplate';

export const PdfTable = {
  /**
   * Draws a standardized FinEdge table on the document.
   * Auto-updates the template's startY so subsequent content flows correctly.
   */
  drawTable(
    template: FinEdgeDocumentTemplate,
    headers: string[][],
    data: (string | number)[][]
  ) {
    const doc = template.doc;
    const startY = template.getStartY();

    autoTable(doc, {
      startY: startY,
      head: headers,
      body: data,
      theme: 'grid',
      headStyles: {
        fillColor: '#191f2f', // Dark neutral/navy
        textColor: '#FFFFFF',
        fontStyle: 'bold',
        fontSize: 9,
        cellPadding: 4,
      },
      bodyStyles: {
        textColor: '#09090B',
        fontSize: 8,
        cellPadding: 4,
        lineColor: '#E4E4E7', // Subtle gray borders
      },
      alternateRowStyles: {
        fillColor: '#F9FAFB' // Very light neutral
      },
      margin: { top: 60, left: 20, right: 20, bottom: 25 },
      
      // AutoTable handles page breaks. 
      // We just need to update our template's startY for the next element.
      didDrawPage: (data) => {
        // This is called after a page is drawn. We can grab the final Y position.
      }
    });

    // Update the template's Y position to right after the table
    const finalY = (doc as any).lastAutoTable.finalY || startY;
    template.setStartY(finalY + 10);
  }
};
