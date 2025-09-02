import jsPDF from 'jspdf';

export interface LetterTemplate {
  title: string;
  billNumber: string;
  subject: string;
  content: string;
  instructions: string;
  tips: string[];
}

export function generateLetterPDF(template: LetterTemplate): void {
  const doc = new jsPDF();
  
  // Set font sizes
  const titleSize = 18;
  const headerSize = 14;
  const bodySize = 11;
  const smallSize = 9;
  
  // Set colors
  const primaryColor = [139, 69, 19]; // Brown color for Rise for Texas branding
  const redColor = [139, 0, 0]; // Darker red for separators
  const blueColor = [100, 120, 180]; // Muted blue for Texas outline
  
  let yPosition = 25;
  
  // Header with Rise for Texas branding and logo reference
  doc.setFontSize(titleSize);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont(undefined, 'bold');
  doc.text('Rise for Texas', 120, yPosition, { align: 'center' });
  
  yPosition += 10;
  doc.setFontSize(smallSize);
  doc.setTextColor(80, 80, 80);
  doc.setFont(undefined, 'normal');
  doc.text('Educational Hub • Take Action • Community Voices', 120, yPosition, { align: 'center' });
  
  // Red separator line
  yPosition += 8;
  doc.setDrawColor(redColor[0], redColor[1], redColor[2]);
  doc.setLineWidth(0.8);
  doc.line(20, yPosition, 190, yPosition);
  
  yPosition += 20;
  
  // Template title
  doc.setFontSize(headerSize);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'bold');
  doc.text(template.title, 20, yPosition);
  
  yPosition += 12;
  
  // Bill number badge
  if (template.billNumber !== 'Multiple') {
    doc.setFillColor(59, 130, 246); // Blue background
    doc.setTextColor(255, 255, 255); // White text
    doc.setFontSize(smallSize);
    doc.setFont(undefined, 'bold');
    doc.roundedRect(20, yPosition - 6, 35, 10, 3, 3, 'F');
    doc.text(template.billNumber, 37.5, yPosition, { align: 'center' });
    doc.setTextColor(0, 0, 0); // Reset to black
    doc.setFont(undefined, 'normal');
  }
  
  yPosition += 18;
  
  // Content with better formatting
  doc.setFontSize(bodySize);
  doc.setFont(undefined, 'normal');
  
  // Split content into lines that fit the page width
  const maxWidth = 170; // Page width minus margins
  const lines = splitTextToFit(doc, template.content, maxWidth);
  
  for (const line of lines) {
    if (yPosition > 270) {
      // Add new page if we're running out of space
      doc.addPage();
      yPosition = 20;
    }
    
    // Handle special formatting for headers and bullet points
    if (line.startsWith('Key Concerns:') || line.startsWith('What I\'m Asking:') || line.startsWith('Personal Impact')) {
      doc.setFont(undefined, 'bold');
      doc.setFontSize(bodySize + 1);
      doc.text(line, 20, yPosition);
      yPosition += 8;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(bodySize);
    } else if (line.startsWith('•')) {
      // Bullet points with proper indentation
      doc.text(line, 25, yPosition);
      yPosition += 7;
    } else if (line.trim() === '') {
      // Empty lines for spacing
      yPosition += 4;
    } else {
      doc.text(line, 20, yPosition);
      yPosition += 7;
    }
  }
  
  // Add footer
  yPosition = 280;
  doc.setDrawColor(redColor[0], redColor[1], redColor[2]);
  doc.setLineWidth(0.8);
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 8;
  
  doc.setFontSize(smallSize);
  doc.setTextColor(80, 80, 80);
  doc.text('© Rise for Texas • risefortexas.org • Prepared for constituent outreach', 120, yPosition, { align: 'center' });
  
  // Save the PDF
  const filename = `${template.billNumber.toLowerCase().replace(/\s+/g, '-')}-letter-template.pdf`;
  doc.save(filename);
}

function splitTextToFit(doc: jsPDF, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  const words = text.split(' ');
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const testWidth = doc.getTextWidth(testLine);
    
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

// Special function for comprehensive opposition template
export function generateComprehensivePDF(template: LetterTemplate): void {
  const doc = new jsPDF();
  
  // Set font sizes
  const titleSize = 18;
  const headerSize = 14;
  const bodySize = 11;
  const smallSize = 9;
  
  // Set colors
  const primaryColor = [139, 69, 19]; // Brown color for Rise for Texas branding
  const redColor = [139, 0, 0]; // Darker red for separators
  
  let yPosition = 25;
  
  // Header with Rise for Texas branding and logo reference
  doc.setFontSize(titleSize);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont(undefined, 'bold');
  doc.text('Rise for Texas', 120, yPosition, { align: 'center' });
  
  yPosition += 10;
  doc.setFontSize(smallSize);
  doc.setTextColor(80, 80, 80);
  doc.setFont(undefined, 'normal');
  doc.text('Educational Hub • Take Action • Community Voices', 120, yPosition, { align: 'center' });
  
  // Red separator line
  yPosition += 8;
  doc.setDrawColor(redColor[0], redColor[1], redColor[2]);
  doc.setLineWidth(0.8);
  doc.line(20, yPosition, 190, yPosition);
  
  yPosition += 20;
  
  // Template title
  doc.setFontSize(headerSize);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'bold');
  doc.text(template.title, 20, yPosition);
  
  yPosition += 12;
  
  // Special badge for comprehensive template
  doc.setFillColor(147, 51, 234); // Purple background for comprehensive
  doc.setTextColor(255, 255, 255); // White text
  doc.setFontSize(smallSize);
  doc.setFont(undefined, 'bold');
  doc.roundedRect(20, yPosition - 6, 55, 10, 3, 3, 'F');
  doc.text('Multiple Bills', 47.5, yPosition, { align: 'center' });
  doc.setTextColor(0, 0, 0); // Reset to black
  doc.setFont(undefined, 'normal');
  
  yPosition += 18;
  
  // Content with better formatting
  doc.setFontSize(bodySize);
  doc.setFont(undefined, 'normal');
  
  // Split content into lines that fit the page width
  const maxWidth = 170; // Page width minus margins
  const lines = splitTextToFit(doc, template.content, maxWidth);
  
  for (const line of lines) {
    if (yPosition > 270) {
      // Add new page if we're running out of space
      doc.addPage();
      yPosition = 20;
    }
    
    // Handle special formatting for headers and bullet points
    if (line.startsWith('Key Concerns:') || line.startsWith('What I\'m Asking:') || line.startsWith('Personal Impact')) {
      doc.setFont(undefined, 'bold');
      doc.setFontSize(bodySize + 1);
      doc.text(line, 20, yPosition);
      yPosition += 8;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(bodySize);
    } else if (line.startsWith('•')) {
      // Bullet points with proper indentation
      doc.text(line, 25, yPosition);
      yPosition += 7;
    } else if (line.trim() === '') {
      // Empty lines for spacing
      yPosition += 4;
    } else {
      doc.text(line, 20, yPosition);
      yPosition += 7;
    }
  }
  
  // Add footer
  yPosition = 280;
  doc.setDrawColor(redColor[0], redColor[1], redColor[2]);
  doc.setLineWidth(0.8);
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 8;
  
  doc.setFontSize(smallSize);
  doc.setTextColor(80, 80, 80);
  doc.text('© Rise for Texas • risefortexas.org • Prepared for constituent outreach', 120, yPosition, { align: 'center' });
  
  // Save the PDF
  doc.save('comprehensive-opposition-letter-template.pdf');
}
