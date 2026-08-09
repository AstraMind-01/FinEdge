/**
 * Pure client-side %PDF-1.4 binary document generator
 * Generates valid, compliant PDF files that open in Adobe Acrobat, Chrome, Edge, and any PDF viewer without errors.
 */

function escapePdfText(str: string): string {
  return (str || "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

export function generatePdfBlob(title: string, contentLines: string[]): Blob {
  const safeTitle = escapePdfText(title);
  
  // Format text stream content
  let textStream = `BT /F1 18 Tf 40 750 TD (${safeTitle}) Tj ET\n`;
  textStream += `BT /F1 10 Tf 40 735 TD (---------------------------------------------------------------------------------------------------) Tj ET\n`;
  
  let y = 710;
  contentLines.forEach((line) => {
    if (y < 50) return; // simple page overflow safety
    const safeLine = escapePdfText(line);
    textStream += `BT /F1 10 Tf 40 ${y} TD (${safeLine}) Tj ET\n`;
    y -= 14;
  });

  const pdfHeader = `%PDF-1.4\n`;
  
  const obj1 = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
  const obj2 = `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;
  const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n`;
  const obj4 = `4 0 obj\n<< /Length ${textStream.length} >>\nstream\n${textStream}endstream\nendobj\n`;
  const obj5 = `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`;

  const body = pdfHeader + obj1 + obj2 + obj3 + obj4 + obj5;

  // Calculate object byte offsets
  const off1 = pdfHeader.length;
  const off2 = off1 + obj1.length;
  const off3 = off2 + obj2.length;
  const off4 = off3 + obj3.length;
  const off5 = off4 + obj4.length;

  const xrefOffset = body.length;

  const xref = 
    `xref\n` +
    `0 6\n` +
    `0000000000 65535 f \n` +
    `${off1.toString().padStart(10, "0")} 00000 n \n` +
    `${off2.toString().padStart(10, "0")} 00000 n \n` +
    `${off3.toString().padStart(10, "0")} 00000 n \n` +
    `${off4.toString().padStart(10, "0")} 00000 n \n` +
    `${off5.toString().padStart(10, "0")} 00000 n \n`;

  const trailer = 
    `trailer\n` +
    `<< /Size 6 /Root 1 0 R >>\n` +
    `startxref\n` +
    `${xrefOffset}\n` +
    `%%EOF`;

  const fullPdfString = body + xref + trailer;

  return new Blob([fullPdfString], { type: "application/pdf" });
}
