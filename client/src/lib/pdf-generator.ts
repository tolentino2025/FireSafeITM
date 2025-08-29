import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface FormQuestion {
  id: string;
  question: string;
  answer: string;
  value?: string; // Para campos numéricos
  section?: string;
  subsection?: string;
}

interface FormSection {
  id: string;
  title: string;
  questions: FormQuestion[];
  subsections?: FormSubsection[];
}

interface FormSubsection {
  title: string;
  questions: FormQuestion[];
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
    
    // Process form data and extract sections
    const sections = this.extractSections(formData, formTitle);
    
    // Add sections content
    this.addSectionsContent(sections);
    
    // Add summary of non-conformities
    this.addNonConformitySummary(sections);
    
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

  public generatePdfBase64(options: PdfOptions): string {
    const { formTitle, formData, generalInfo, signatures, companyName = "Empresa Cliente" } = options;
    
    // Add header
    this.addHeader(formTitle, companyName);
    
    // Add general information
    this.addGeneralInfo(generalInfo);
    
    // Process form data and extract sections
    const sections = this.extractSections(formData, formTitle);
    
    // Add sections content
    this.addSectionsContent(sections);
    
    // Add summary of non-conformities
    this.addNonConformitySummary(sections);
    
    // Add signatures section
    if (signatures) {
      this.addSignaturesSection(signatures);
    }
    
    // Add footer to all pages
    this.addFootersToAllPages(formTitle, generalInfo.propertyName);
    
    // Return PDF as base64 string
    return this.doc.output('datauristring').split(',')[1];
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

  private extractSections(formData: any, formTitle: string): FormSection[] {
    const sections: FormSection[] = [];
    
    // Define section mappings based on form type
    const sectionMappings = this.getSectionMappings(formTitle);
    
    // Group questions by sections
    for (const [key, value] of Object.entries(formData)) {
      if (value && typeof value === 'string' && !this.isGeneralInfoField(key)) {
        const questionData = this.getQuestionData(key, value as string, sectionMappings);
        if (questionData && questionData.section) {
          const sectionId = questionData.section;
          let section = sections.find(s => s.id === sectionId);
          
          if (!section) {
            section = {
              id: sectionId,
              title: this.getSectionTitle(sectionId),
              questions: [],
              subsections: []
            };
            sections.push(section);
          }
          
          section.questions.push(questionData);
        }
      }
    }

    return sections;
  }

  private isGeneralInfoField(key: string): boolean {
    const generalFields = ['propertyName', 'propertyAddress', 'propertyPhone', 
                          'inspector', 'date', 'contractNumber', 'frequency', 
                          'systemType', 'pipeType', 'jointType'];
    return generalFields.includes(key);
  }

  private getSectionMappings(formTitle: string): Record<string, { section: string, label: string }> {
    // Common field mappings across all forms
    const commonMappings: Record<string, { section: string, label: string }> = {
      // Daily inspections
      'daily_valve_enclosure_temp': {
        section: 'daily',
        label: 'Válvula (Apenas Clima Frio/Estação de Aquecimento): O invólucro, não equipado com alarme de baixa temperatura, é inspecionado durante o tempo frio para verificar uma temperatura mínima de 4°C (40°F)?'
      },
      
      // Weekly inspections
      'weekly_isolation_valves': {
        section: 'weekly',
        label: 'Válvulas de isolamento estão em posição aberta e travadas ou supervisionadas?'
      },
      'weekly_test_connection': {
        section: 'weekly',
        label: 'Conexão de teste possui tampão ou cap?'
      },
      'weekly_strainer_differential': {
        section: 'weekly',
        label: 'Pressão diferencial através do filtro não excede 5 psi?'
      },
      
      // Monthly inspections
      'monthly_valve_supervision': {
        section: 'monthly',
        label: 'Válvulas de controle principais estão abertas e supervisionadas/travadas?'
      },
      'monthly_alarm_devices': {
        section: 'monthly',
        label: 'Dispositivos de alarme de fluxo de água estão livres de obstáculos físicos?'
      },
      'monthly_gauges_condition': {
        section: 'monthly',
        label: 'Manômetros em boa condição e mostrando pressão adequada?'
      },
      'monthly_hydraulic_nameplate': {
        section: 'monthly',
        label: 'Placa hidráulica está segura e legível?'
      },
      
      // Quarterly inspections
      'quarterly_sprinklers_condition': {
        section: 'quarterly',
        label: 'Sprinklers estão em boa condição e livres de corrosão, cargas estranhas ou danos?'
      },
      'quarterly_sprinklers_orientation': {
        section: 'quarterly',
        label: 'Sprinklers estão instalados na orientação correta?'
      },
      'quarterly_storage_clearance': {
        section: 'quarterly',
        label: 'Distância livre mínima é mantida abaixo dos sprinklers?'
      },
      
      // Annual inspections
      'annual_main_drain_test': {
        section: 'annual',
        label: 'Teste do Dreno Principal (Anual)'
      },
      'annual_water_flow_alarm': {
        section: 'annual',
        label: 'Teste do Alarme de Fluxo de Água (Anual)'
      },
      'annual_inspector_test': {
        section: 'annual',
        label: 'Teste de Inspetor/Supervisor de Válvula (Anual)'
      },
      
      // 5-year tests
      'fiveyears_sprinkler_sampling': {
        section: 'fiveyears',
        label: 'Amostragem de Sprinklers (5 Anos)'
      },
      'fiveyears_piping_obstruction': {
        section: 'fiveyears',
        label: 'Investigação de Obstrução em Tubulação (5 Anos)'
      },
      
      // Tests section
      'tests_flow_test': {
        section: 'tests',
        label: 'Teste de Fluxo de Sprinkler (Conforme necessário)'
      },
      'tests_hydrostatic': {
        section: 'tests',
        label: 'Teste Hidrostático (Conforme necessário)'
      }
    };

    return commonMappings;
  }

  private getQuestionData(key: string, value: string, mappings: Record<string, { section: string, label: string }>): FormQuestion | null {
    const mapping = mappings[key];
    if (mapping) {
      return {
        id: key,
        question: mapping.label,
        answer: value,
        section: mapping.section
      };
    }
    
    // Fallback: try to parse field name
    const questionText = this.formatQuestionText(key);
    const section = this.inferSectionFromKey(key);
    
    return {
      id: key,
      question: questionText,
      answer: value,
      section: section
    };
  }

  private inferSectionFromKey(key: string): string {
    if (key.includes('daily')) return 'daily';
    if (key.includes('weekly')) return 'weekly';
    if (key.includes('monthly')) return 'monthly';
    if (key.includes('quarterly')) return 'quarterly';
    if (key.includes('annual')) return 'annual';
    if (key.includes('fiveyears') || key.includes('5')) return 'fiveyears';
    if (key.includes('test')) return 'tests';
    return 'other';
  }

  private getSectionTitle(sectionId: string): string {
    const titles: Record<string, string> = {
      'daily': 'Inspeções Diárias',
      'weekly': 'Inspeções Semanais',
      'monthly': 'Inspeções Mensais',
      'quarterly': 'Inspeções Trimestrais',
      'semiannual': 'Inspeções Semestrais',
      'annual': 'Inspeções Anuais',
      'fiveyears': 'Inspeções 5 Anos',
      'tests': 'Testes Especializados',
      'internal': 'Inspeções Internas',
      'other': 'Outros Itens'
    };
    return titles[sectionId] || 'Seção Adicional';
  }

  private formatQuestionText(key: string): string {
    // Convert camelCase keys to readable questions
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/_/g, ' ')
      .trim();
  }

  private addSectionsContent(sections: FormSection[]): void {
    // Main title
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(212, 4, 45);
    this.doc.text('FORMULÁRIO DE INSPEÇÃO', this.margin, this.currentY);
    
    this.currentY += 20;

    for (const section of sections) {
      // Check if we need a new page
      if (this.currentY > this.pageHeight - 60) {
        this.addNewPage();
      }

      // Section header
      this.addSectionHeader(section.title);
      
      // Add section questions
      for (const question of section.questions) {
        this.addQuestionWithRadioButtons(question);
      }
      
      // Add spacing after section
      this.currentY += 10;
    }
  }

  private addSectionHeader(sectionTitle: string): void {
    // Check if we need a new page
    if (this.currentY > this.pageHeight - 40) {
      this.addNewPage();
    }

    // Add section title with background
    this.doc.setFillColor(240, 240, 240); // Light gray background
    this.doc.rect(this.margin - 5, this.currentY - 8, this.pageWidth - (this.margin * 2) + 10, 16, 'F');
    
    // Section title text
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(54, 69, 79); // Dark gray
    this.doc.text(sectionTitle, this.margin, this.currentY);
    
    // Add underline
    this.doc.setDrawColor(212, 4, 45); // Red line
    this.doc.setLineWidth(1);
    this.doc.line(this.margin, this.currentY + 2, this.pageWidth - this.margin, this.currentY + 2);
    
    this.currentY += 20;
    this.doc.setTextColor(0, 0, 0); // Reset to black
  }

  private addQuestionWithRadioButtons(question: FormQuestion): void {
    // Check if we need a new page
    if (this.currentY > this.pageHeight - 40) {
      this.addNewPage();
    }

    // Question text
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    
    const questionLines = this.doc.splitTextToSize(question.question, this.pageWidth - 40);
    this.doc.text(questionLines, this.margin, this.currentY);
    
    const questionHeight = questionLines.length * 4;
    this.currentY += questionHeight + 3;

    // Radio buttons layout - horizontal like the online form
    const radioY = this.currentY;
    const radioSize = 3;
    const radioSpacing = 25;
    let radioX = this.margin + 10;

    // Options: Sim, Não, N/A
    const options = [
      { value: 'sim', label: 'Sim' },
      { value: 'nao', label: 'Não' },
      { value: 'na', label: 'N/A' }
    ];

    for (const option of options) {
      // Draw radio button circle
      this.doc.setDrawColor(0, 0, 0);
      this.doc.setLineWidth(0.5);
      this.doc.circle(radioX, radioY, radioSize);
      
      // Fill if selected
      const isSelected = this.isOptionSelected(question.answer, option.value);
      if (isSelected) {
        this.doc.setFillColor(212, 4, 45); // Red fill for selected
        this.doc.circle(radioX, radioY, radioSize - 1, 'F');
      }
      
      // Option label
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(option.label, radioX + 5, radioY + 1);
      
      radioX += radioSpacing;
    }

    this.currentY += 12;
    
    // Reset any colors
    this.doc.setTextColor(0, 0, 0);
  }

  private isOptionSelected(answer: string, optionValue: string): boolean {
    const normalizedAnswer = answer.toLowerCase().trim();
    const normalizedOption = optionValue.toLowerCase();
    
    switch (normalizedOption) {
      case 'sim':
        return normalizedAnswer === 'sim';
      case 'nao':
        return normalizedAnswer === 'nao' || normalizedAnswer === 'não';
      case 'na':
        return normalizedAnswer === 'na' || normalizedAnswer === 'n/a';
      default:
        return false;
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

  private addNonConformitySummary(sections: FormSection[]): void {
    // Extract all non-conformities from all sections
    const nonConformities: FormQuestion[] = [];
    
    for (const section of sections) {
      const sectionNonConformities = section.questions.filter(q => 
        q.answer.toLowerCase() === 'nao' || q.answer.toLowerCase() === 'não'
      );
      nonConformities.push(...sectionNonConformities);
    }

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

// Helper function to generate PDF as base64 string
export function generateInspectionPdfBase64(
  formTitle: string, 
  formData: any, 
  generalInfo: GeneralInfo, 
  signatures?: SignatureData,
  companyName?: string
): string {
  const pdfGenerator = new PdfGenerator();
  return pdfGenerator.generatePdfBase64({
    formTitle,
    formData,
    generalInfo,
    signatures,
    companyName
  });
}

// Export the SignatureData type for use in other components
export type { SignatureData };