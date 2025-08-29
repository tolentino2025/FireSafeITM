import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface FormQuestion {
  id: string;
  question: string;
  answer: string;
  value?: string; // Para campos numéricos
}

interface GeneralInfo {
  propertyName?: string;
  propertyAddress?: string;
  propertyPhone?: string;
  inspector?: string;
  date?: string;
  contractNumber?: string;
}

interface SignatureData {
  inspectorName: string;
  inspectorDate: string;
  inspectorSignature?: string;
  clientName: string;
  clientDate: string;
  clientSignature?: string;
}

interface PdfOptions {
  formTitle: string;
  formData: any;
  generalInfo: GeneralInfo;
  signatures?: SignatureData;
  companyName?: string;
  companyLogo?: string;
}

export class PdfGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;
  private currentY: number = 60; // Start after header
  private lineHeight: number = 8;
  private primaryColor: string = '#D2042D'; // FireSafe red
  private secondaryColor: string = '#36454F'; // Dark gray

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  public generatePdf(options: PdfOptions): void {
    const { formTitle, formData, generalInfo, signatures, companyName = "Empresa Cliente" } = options;
    
    // Add header
    this.addHeader(formTitle, companyName);
    
    // Add general information
    this.addGeneralInfo(generalInfo);
    
    // Process form data and extract questions
    const questions = this.extractQuestions(formData);
    
    // Add questions content
    this.addQuestionsContent(questions);
    
    // Add summary of non-conformities
    this.addNonConformitySummary(questions);
    
    // Add signatures section
    if (signatures) {
      this.addSignaturesSection(signatures);
    }
    
    // Add footer to all pages
    this.addFootersToAllPages(formTitle, generalInfo.propertyName);
    
    // Generate filename and download
    const filename = this.generateFilename(formTitle, generalInfo.propertyName, generalInfo.date);
    this.doc.save(filename);
  }

  private addHeader(formTitle: string, companyName: string): void {
    // FireSafe Tech logo area (left)
    this.doc.setFillColor(212, 4, 45); // #D2042D
    this.doc.rect(this.margin, 15, 60, 25, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('FireSafe', this.margin + 5, 25);
    this.doc.text('TECH', this.margin + 5, 33);

    // Company name/logo area (right)
    this.doc.setFillColor(54, 69, 79); // #36454F
    this.doc.rect(this.pageWidth - 80, 15, 60, 25, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(companyName, this.pageWidth - 75, 28, { maxWidth: 50, align: 'center' });

    // Form title (center)
    this.doc.setTextColor(54, 69, 79);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    const titleWidth = this.doc.getTextWidth(formTitle);
    this.doc.text(formTitle, (this.pageWidth - titleWidth) / 2, 28);

    // Reset text color
    this.doc.setTextColor(0, 0, 0);
  }

  private addGeneralInfo(generalInfo: GeneralInfo): void {
    this.currentY += 15;
    
    // Section title
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(212, 4, 45);
    this.doc.text('INFORMAÇÕES GERAIS', this.margin, this.currentY);
    
    this.currentY += 10;
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);

    // Property information
    if (generalInfo.propertyName) {
      this.doc.text(`Propriedade: ${generalInfo.propertyName}`, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    }

    if (generalInfo.propertyAddress) {
      this.doc.text(`Endereço: ${generalInfo.propertyAddress}`, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    }

    if (generalInfo.propertyPhone) {
      this.doc.text(`Telefone: ${generalInfo.propertyPhone}`, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    }

    this.currentY += 5;

    // Inspector information
    if (generalInfo.inspector) {
      this.doc.text(`Inspetor: ${generalInfo.inspector}`, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    }

    if (generalInfo.date) {
      const formattedDate = new Date(generalInfo.date).toLocaleDateString('pt-BR');
      this.doc.text(`Data da Inspeção: ${formattedDate}`, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    }

    if (generalInfo.contractNumber) {
      this.doc.text(`Nº do Contrato: ${generalInfo.contractNumber}`, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    }

    this.currentY += 10;
  }

  private extractQuestions(formData: any): FormQuestion[] {
    const questions: FormQuestion[] = [];
    
    // Convert form data to questions format
    for (const [key, value] of Object.entries(formData)) {
      if (value && typeof value === 'string' && key !== 'propertyName' && 
          key !== 'propertyAddress' && key !== 'propertyPhone' && 
          key !== 'inspector' && key !== 'date' && key !== 'contractNumber' && 
          key !== 'frequency' && key !== 'systemType' && key !== 'pipeType' && 
          key !== 'jointType') {
        
        // Convert camelCase to readable format
        const questionText = this.formatQuestionText(key);
        
        questions.push({
          id: key,
          question: questionText,
          answer: value as string,
        });
      }
    }

    return questions;
  }

  private formatQuestionText(key: string): string {
    // Convert camelCase keys to readable questions
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ')
      .trim();
  }

  private addQuestionsContent(questions: FormQuestion[]): void {
    // Section title
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(212, 4, 45);
    this.doc.text('ITENS INSPECIONADOS', this.margin, this.currentY);
    
    this.currentY += 15;

    for (const question of questions) {
      // Check if we need a new page
      if (this.currentY > this.pageHeight - 40) {
        this.addNewPage();
      }

      const isNonConformity = question.answer.toLowerCase() === 'nao' || question.answer.toLowerCase() === 'não';
      
      // Add background for non-conformities
      if (isNonConformity) {
        this.doc.setFillColor(255, 204, 203); // #FFCCCB light red
        this.doc.rect(this.margin - 5, this.currentY - 6, this.pageWidth - (this.margin * 2) + 10, 12, 'F');
      }

      // Question text
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(0, 0, 0);
      
      const questionLines = this.doc.splitTextToSize(question.question, this.pageWidth - 100);
      this.doc.text(questionLines, this.margin, this.currentY);
      
      // Answer
      this.doc.setFont('helvetica', 'bold');
      if (isNonConformity) {
        this.doc.setTextColor(212, 4, 45); // Red for non-conformities
      } else {
        this.doc.setTextColor(0, 128, 0); // Green for conformities
      }
      
      const answerText = this.formatAnswer(question.answer);
      this.doc.text(answerText, this.pageWidth - 60, this.currentY);

      this.currentY += Math.max(questionLines.length * 4, 8) + 3;
      this.doc.setTextColor(0, 0, 0);
    }
  }

  private formatAnswer(answer: string): string {
    switch (answer.toLowerCase()) {
      case 'sim': return 'SIM ✓';
      case 'nao':
      case 'não': return 'NÃO ✗';
      case 'na':
      case 'n/a': return 'N/A';
      default: return answer.toUpperCase();
    }
  }

  private addNonConformitySummary(questions: FormQuestion[]): void {
    const nonConformities = questions.filter(q => 
      q.answer.toLowerCase() === 'nao' || q.answer.toLowerCase() === 'não'
    );

    if (nonConformities.length === 0) return;

    // Check if we need a new page
    if (this.currentY > this.pageHeight - 60) {
      this.addNewPage();
    }

    this.currentY += 20;

    // Section title
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(212, 4, 45);
    this.doc.text('RESUMO DE NÃO CONFORMIDADES', this.margin, this.currentY);
    
    this.currentY += 15;

    // Warning box
    this.doc.setFillColor(255, 235, 235);
    this.doc.setDrawColor(212, 4, 45);
    this.doc.rect(this.margin - 5, this.currentY - 5, this.pageWidth - (this.margin * 2) + 10, 
                  10 + (nonConformities.length * 8), 'FD');

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(212, 4, 45);
    this.doc.text(`ATENÇÃO: ${nonConformities.length} item(s) requer(em) ação imediata:`, 
                  this.margin, this.currentY);
    
    this.currentY += 10;

    // List non-conformities
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    
    nonConformities.forEach((item, index) => {
      const text = `${index + 1}. ${item.question}`;
      const lines = this.doc.splitTextToSize(text, this.pageWidth - 50);
      this.doc.text(lines, this.margin, this.currentY);
      this.currentY += lines.length * 4 + 2;
    });
  }

  private addSignaturesSection(signatures: SignatureData): void {
    // Check if we need a new page
    if (this.currentY > this.pageHeight - 120) {
      this.addNewPage();
    }

    this.currentY += 20;

    // Section title
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(212, 4, 45);
    this.doc.text('ASSINATURAS', this.margin, this.currentY);
    
    this.currentY += 15;

    // Inspector signature section
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(0, 0, 0);
    this.doc.text('INSPETOR RESPONSÁVEL:', this.margin, this.currentY);
    
    this.currentY += 10;

    // Add inspector signature image if available
    if (signatures.inspectorSignature) {
      try {
        this.doc.addImage(signatures.inspectorSignature, 'PNG', this.margin, this.currentY, 80, 25);
      } catch (error) {
        console.error('Error adding inspector signature:', error);
      }
    }
    
    this.currentY += 30;

    // Inspector signature line and info
    this.doc.setDrawColor(0, 0, 0);
    this.doc.line(this.margin, this.currentY, this.margin + 80, this.currentY);
    
    this.currentY += 8;
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(signatures.inspectorName, this.margin, this.currentY);
    this.doc.text(`Data: ${new Date(signatures.inspectorDate).toLocaleDateString('pt-BR')}`, this.margin, this.currentY + 6);

    // Client signature section (right side)
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('REPRESENTANTE DA PROPRIEDADE:', this.pageWidth / 2 + 10, this.currentY - 38);

    // Add client signature image if available
    if (signatures.clientSignature) {
      try {
        this.doc.addImage(signatures.clientSignature, 'PNG', this.pageWidth / 2 + 10, this.currentY - 28, 80, 25);
      } catch (error) {
        console.error('Error adding client signature:', error);
      }
    }

    // Client signature line and info
    this.doc.line(this.pageWidth / 2 + 10, this.currentY, this.pageWidth / 2 + 90, this.currentY);
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(signatures.clientName, this.pageWidth / 2 + 10, this.currentY + 8);
    this.doc.text(`Data: ${new Date(signatures.clientDate).toLocaleDateString('pt-BR')}`, this.pageWidth / 2 + 10, this.currentY + 14);

    this.currentY += 25;

    // Validation statement
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'italic');
    this.doc.setTextColor(100, 100, 100);
    const validationText = 'Este documento foi validado digitalmente e possui valor legal conforme a legislação vigente.';
    const textWidth = this.doc.getTextWidth(validationText);
    this.doc.text(validationText, (this.pageWidth - textWidth) / 2, this.currentY);
    
    this.currentY += 15;
  }

  private addNewPage(): void {
    this.doc.addPage();
    this.currentY = 60; // Reset position after header
  }

  private addFootersToAllPages(formTitle: string, propertyName?: string): void {
    const totalPages = this.doc.internal.pages.length - 1; // -1 because pages array includes empty first element
    
    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      
      // Footer line
      this.doc.setDrawColor(212, 4, 45);
      this.doc.line(this.margin, this.pageHeight - 20, this.pageWidth - this.margin, this.pageHeight - 20);
      
      // Footer content
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(100, 100, 100);
      
      // Left: Filename
      const filename = this.generateFilename(formTitle, propertyName);
      this.doc.text(filename, this.margin, this.pageHeight - 12);
      
      // Center: Generated by
      const centerText = 'Gerado por FireSafe Tech';
      const centerWidth = this.doc.getTextWidth(centerText);
      this.doc.text(centerText, (this.pageWidth - centerWidth) / 2, this.pageHeight - 12);
      
      // Right: Page number
      const pageText = `Página ${i} de ${totalPages}`;
      const pageWidth = this.doc.getTextWidth(pageText);
      this.doc.text(pageText, this.pageWidth - this.margin - pageWidth, this.pageHeight - 12);
    }
  }

  private generateFilename(formTitle: string, propertyName?: string, date?: string): string {
    const cleanTitle = formTitle.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    const cleanProperty = propertyName ? propertyName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') : 'Propriedade';
    const dateStr = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    
    return `Relatorio_${cleanTitle}_${cleanProperty}_${dateStr}.pdf`;
  }
}

// Helper function to generate PDF from form data
export function generateInspectionPdf(
  formTitle: string, 
  formData: any, 
  generalInfo: GeneralInfo, 
  signatures?: SignatureData,
  companyName?: string
): void {
  const pdfGenerator = new PdfGenerator();
  pdfGenerator.generatePdf({
    formTitle,
    formData,
    generalInfo,
    signatures,
    companyName
  });
}

// Export the SignatureData type for use in other components
export type { SignatureData };