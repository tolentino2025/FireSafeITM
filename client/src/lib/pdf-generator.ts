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

// New interface for structured general information from backend
interface GeneralInformation {
  empresa?: string;
  nome_propriedade?: string;
  id_propriedade?: string;
  endereco?: string;
  tipo_edificacao?: string;
  area_total_piso_ft2?: number;
  data_inspecao?: string;
  tipo_inspecao?: string;
  proxima_inspecao_programada?: string;
  nome_inspetor?: string;
  licenca_inspetor?: string;
  observacoes_adicionais?: string;
  temperatura_f?: number;
  condicoes_climaticas?: string;
  velocidade_vento_mph?: number;
}

interface SignatureData {
  inspectorName: string;
  inspectorDate: string;
  inspectorSignature?: string;
  clientName: string;
  clientDate: string;
  clientSignature?: string;
}

interface CompanyData {
  name: string;
  cnpj?: string;
  ie?: string;
  email?: string;
  phone?: string;
  website?: string;
  logoUrl?: string;
  address?: {
    logradouro?: string;
    numero?: string;
    bairro?: string;
    municipio?: string;
    estado?: string;
    cep?: string;
    complemento?: string;
    ibge?: string;
    pais?: string;
  };
  contato?: {
    nome?: string;
    email?: string;
    telefone?: string;
  };
}

interface PdfBranding {
  showCompanyLogo?: boolean;
  showFireSafeLogo?: boolean;
}

interface PdfOptions {
  formTitle: string;
  formData: any;
  generalInfo: GeneralInfo;
  signatures?: SignatureData;
  companyName?: string; // Keep for backward compatibility
  companyLogo?: string; // Keep for backward compatibility
  pdfCompany?: CompanyData;
  pdfBranding?: PdfBranding;
  generalInformation?: GeneralInformation; // New structured data from backend
  reportId?: string; // For audit logging
  userId?: string; // For audit logging
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

  // Helper function to format dates - returns "-" when null/""
  private formatDate(dateString?: string | null): string {
    if (!dateString || dateString === '' || dateString === 'null' || dateString === 'undefined') return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '-';
    }
  }

  // Helper function to format numbers - never breaks on null
  private formatNumber(value?: number | null, unit?: string): string {
    if (value === undefined || value === null || isNaN(Number(value))) return '-';
    try {
      const num = Number(value);
      if (!isFinite(num)) return '-';
      const formatted = num.toLocaleString('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      });
      return unit ? `${formatted} ${unit}` : formatted;
    } catch {
      return '-';
    }
  }

  // Helper function to sanitize and validate text input
  private sanitizeText(text?: string, maxLength: number = 500): string {
    if (!text || typeof text !== 'string') return '-';
    
    // Remove potentially dangerous characters and normalize
    const sanitized = text
      .replace(/[<>"'&]/g, '') // Remove HTML-like characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    // Truncate if too long
    if (sanitized.length > maxLength) {
      return sanitized.substring(0, maxLength - 3) + '...';
    }
    
    return sanitized || '-';
  }

  // Log PDF generation for audit trail
  private logPdfGeneration(reportId?: string, userId?: string): void {
    const logData = {
      timestamp: new Date().toISOString(),
      reportId: reportId || 'unknown',
      userId: userId || 'anonymous',
      action: 'pdf_generation',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server'
    };
    
    console.log('[PDF_GENERATION_LOG]', JSON.stringify(logData));
  }

  public generatePdf(options: PdfOptions): void {
    const { formTitle, formData, generalInfo, signatures, companyName = "Empresa Cliente", pdfCompany, pdfBranding = { showCompanyLogo: true, showFireSafeLogo: true }, generalInformation } = options;
    
    // Log PDF generation for audit
    this.logPdfGeneration(options.reportId, options.userId);
    
    // Create processed company data with placeholders
    const processedCompany = this.processCompanyData(pdfCompany, companyName);
    
    // Add header with company data
    this.addHeader(formTitle, processedCompany, pdfBranding, generalInformation);
    
    // Add general information with company placeholders
    this.addGeneralInfo(generalInfo, processedCompany, generalInformation);
    
    // Always add structured general information if available (mandatory fixed sections)
    if (generalInformation) {
      this.addStructuredGeneralInfo(generalInformation);
    }
    
    // Add pump information section
    this.addPumpInfoSection((formData as any)?.selectedPump);
    
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
    const { formTitle, formData, generalInfo, signatures, companyName = "Empresa Cliente", pdfCompany, pdfBranding = { showCompanyLogo: true, showFireSafeLogo: true }, generalInformation } = options;
    
    // Log PDF generation for audit
    this.logPdfGeneration(options.reportId, options.userId);
    
    // Create processed company data with placeholders
    const processedCompany = this.processCompanyData(pdfCompany, companyName);
    
    // Add header with company data
    this.addHeader(formTitle, processedCompany, pdfBranding, generalInformation);
    
    // Add general information with company placeholders
    this.addGeneralInfo(generalInfo, processedCompany, generalInformation);
    
    // Always add structured general information if available (mandatory fixed sections)
    if (generalInformation) {
      this.addStructuredGeneralInfo(generalInformation);
    }
    
    // Add pump information section
    this.addPumpInfoSection((formData as any)?.selectedPump);
    
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

  private processCompanyData(pdfCompany?: CompanyData, fallbackName?: string): CompanyData {
    if (!pdfCompany) {
      return {
        name: fallbackName || "Empresa Cliente",
        cnpj: "",
        ie: "",
        email: "",
        phone: "",
        website: "",
        logoUrl: "",
        address: {
          logradouro: "",
          numero: "",
          bairro: "",
          municipio: "",
          estado: "",
          cep: "",
          complemento: "",
          ibge: "",
          pais: "Brasil"
        },
        contato: {
          nome: "",
          email: "",
          telefone: ""
        }
      };
    }
    
    return {
      name: pdfCompany.name,
      cnpj: pdfCompany.cnpj || "",
      ie: pdfCompany.ie || "",
      email: pdfCompany.email || "",
      phone: pdfCompany.phone || "",
      website: pdfCompany.website || "",
      logoUrl: pdfCompany.logoUrl || "",
      address: {
        logradouro: pdfCompany.address?.logradouro || "",
        numero: pdfCompany.address?.numero || "",
        bairro: pdfCompany.address?.bairro || "",
        municipio: pdfCompany.address?.municipio || "",
        estado: pdfCompany.address?.estado || "",
        cep: pdfCompany.address?.cep || "",
        complemento: pdfCompany.address?.complemento || "",
        ibge: pdfCompany.address?.ibge || "",
        pais: pdfCompany.address?.pais || "Brasil"
      },
      contato: {
        nome: pdfCompany.contato?.nome || "",
        email: pdfCompany.contato?.email || "",
        telefone: pdfCompany.contato?.telefone || ""
      }
    };
  }

  private replacePlaceholders(text: string, company: CompanyData): string {
    if (!text || typeof text !== 'string') return text;
    
    return text
      .replace(/{{empresa\.nome}}/g, company.name)
      .replace(/{{empresa\.cnpj}}/g, company.cnpj || "")
      .replace(/{{empresa\.ie}}/g, company.ie || "")
      .replace(/{{empresa\.email}}/g, company.email || "")
      .replace(/{{empresa\.telefone}}/g, company.phone || "")
      .replace(/{{empresa\.site}}/g, company.website || "")
      .replace(/{{empresa\.endereco\.logradouro}}/g, company.address?.logradouro || "")
      .replace(/{{empresa\.endereco\.numero}}/g, company.address?.numero || "")
      .replace(/{{empresa\.endereco\.bairro}}/g, company.address?.bairro || "")
      .replace(/{{empresa\.endereco\.municipio}}/g, company.address?.municipio || "")
      .replace(/{{empresa\.endereco\.estado}}/g, company.address?.estado || "")
      .replace(/{{empresa\.endereco\.cep}}/g, company.address?.cep || "")
      .replace(/{{empresa\.endereco\.complemento}}/g, company.address?.complemento || "")
      .replace(/{{empresa\.endereco\.ibge}}/g, company.address?.ibge || "")
      .replace(/{{empresa\.endereco\.pais}}/g, company.address?.pais || "")
      .replace(/{{empresa\.contato\.nome}}/g, company.contato?.nome || "")
      .replace(/{{empresa\.contato\.email}}/g, company.contato?.email || "")
      .replace(/{{empresa\.contato\.telefone}}/g, company.contato?.telefone || "");
  }

  private addHeader(formTitle: string, company: CompanyData, pdfBranding: PdfBranding, generalInformation?: GeneralInformation): void {
    // FireSafe Tech logo area (left) - only if enabled
    if (pdfBranding.showFireSafeLogo !== false) {
      this.doc.setFillColor(212, 4, 45); // #D2042D
      this.doc.rect(this.margin, 15, 60, 25, 'F');
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('FireSafe', this.margin + 5, 25);
      this.doc.text('TECH', this.margin + 5, 33);
    }

    // Company name/logo area (right)
    if (pdfBranding.showCompanyLogo !== false) {
      this.doc.setFillColor(54, 69, 79); // #36454F
      this.doc.rect(this.pageWidth - 80, 15, 60, 25, 'F');
      
      // Try to add company logo if logoUrl exists
      if (company.logoUrl) {
        try {
          // Note: In a real implementation, you would need to load and embed the image
          // This is a placeholder for logo rendering functionality
          // For now, show company name as fallback
          this.doc.setTextColor(255, 255, 255);
          this.doc.setFontSize(8);
          this.doc.setFont('helvetica', 'normal');
          this.doc.text('LOGO', this.pageWidth - 75, 25, { maxWidth: 50, align: 'center' });
          this.doc.text(company.name, this.pageWidth - 75, 32, { maxWidth: 50, align: 'center' });
        } catch (error) {
          console.warn('Could not load company logo, using name instead:', error);
          this.doc.setTextColor(255, 255, 255);
          this.doc.setFontSize(10);
          this.doc.setFont('helvetica', 'normal');
          this.doc.text(company.name, this.pageWidth - 75, 28, { maxWidth: 50, align: 'center' });
        }
      } else {
        // Show company name
        this.doc.setTextColor(255, 255, 255);
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        this.doc.text(company.name, this.pageWidth - 75, 28, { maxWidth: 50, align: 'center' });
      }
    }

    // Form title (center)
    this.doc.setTextColor(54, 69, 79);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    const titleWidth = this.doc.getTextWidth(formTitle);
    this.doc.text(formTitle, (this.pageWidth - titleWidth) / 2, 28);
    
    // Enhanced header with structured information (below title)
    if (generalInformation) {
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(54, 69, 79);
      
      // Header info line: Empresa – Nome da Propriedade, Tipo de Inspeção, Data
      const empresa = this.sanitizeText(generalInformation.empresa, 30) || company.name || '-';
      const propriedade = this.sanitizeText(generalInformation.nome_propriedade, 40) || '-';
      const tipoInspecao = this.sanitizeText(generalInformation.tipo_inspecao, 20) || '-';
      const dataInspecao = this.formatDate(generalInformation.data_inspecao) || '-';
      
      const headerLine = `${empresa} – ${propriedade} | ${tipoInspecao} | ${dataInspecao}`;
      const headerWidth = this.doc.getTextWidth(headerLine);
      this.doc.text(headerLine, (this.pageWidth - headerWidth) / 2, 38);
    }

    // Reset text color
    this.doc.setTextColor(0, 0, 0);
    // Adjust current Y position to account for enhanced header
    this.currentY = generalInformation ? 55 : 45;
  }

  private addPumpInfoSection(pump?: any) {
    if (!pump) return;
    this.addSectionHeader("Pump and Driver Information");
    const pumpRows: [string, string | number][] = [
      ["Pump Manufacturer", pump.pumpManufacturer],
      ["Pump Model", pump.pumpModel],
      ["Pump Serial #", pump.pumpSerial],
      ["Rated RPM", pump.ratedRpm],
      ["Controller Mfr", pump.controllerMfr],
      ["Controller Model", pump.controllerModel],
      ["Controller S/N", pump.controllerSn],
      ["Max Suction Pressure (psi)", pump.maxSuctionPressurePsi],
      ["Max psi (shutoff) (psi)", pump.maxPsiShutoff],
      ["Rated Capacity (gpm)", pump.ratedCapacityGpm],
      ["Rated Pressure (psi)", pump.ratedPressurePsi],
      ["150% Rated Capacity (gpm)", pump.cap150Gpm],
      ["Rated Pressure @Rated Capacity (psi)", pump.ratedPressureAtRatedCapacityPsi],
      ["Driver Mfr", pump.driverMfr],
      ["Driver Model", pump.driverModel],
      ["Notes", pump.notes],
    ];
    const rows = pumpRows.filter(([,v]) => v !== undefined && v !== null && String(v).trim() !== "");
    if (!rows.length) return;
    let y = this.currentY + 6;
    rows.forEach(([k,v]) => {
      this.doc.setFontSize(10);
      this.doc.text(`${k}: ${v}`, 14, y); 
      y += 6;
    });
    this.currentY = y + 4;
  }

  private addGeneralInfo(generalInfo: GeneralInfo, company?: CompanyData, generalInformation?: GeneralInformation): void {
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

    // Company information section
    if (company && company.name !== "Empresa Cliente") {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('EMPRESA RESPONSÁVEL:', this.margin, this.currentY);
      this.currentY += this.lineHeight;
      this.doc.setFont('helvetica', 'normal');
      
      this.doc.text(`Nome: ${company.name}`, this.margin + 5, this.currentY);
      this.currentY += this.lineHeight;
      
      if (company.cnpj) {
        this.doc.text(`CNPJ: ${company.cnpj}`, this.margin + 5, this.currentY);
        this.currentY += this.lineHeight;
      }
      
      if (company.ie) {
        this.doc.text(`IE: ${company.ie}`, this.margin + 5, this.currentY);
        this.currentY += this.lineHeight;
      }
      
      if (company.email) {
        this.doc.text(`E-mail: ${company.email}`, this.margin + 5, this.currentY);
        this.currentY += this.lineHeight;
      }
      
      if (company.phone) {
        this.doc.text(`Telefone: ${company.phone}`, this.margin + 5, this.currentY);
        this.currentY += this.lineHeight;
      }
      
      if (company.website) {
        this.doc.text(`Website: ${company.website}`, this.margin + 5, this.currentY);
        this.currentY += this.lineHeight;
      }
      
      // Company address
      if (company.address && (company.address.logradouro || company.address.municipio)) {
        let addressText = "Endereço: ";
        if (company.address.logradouro) {
          addressText += company.address.logradouro;
          if (company.address.numero) addressText += ", " + company.address.numero;
        }
        if (company.address.bairro) addressText += " - " + company.address.bairro;
        if (company.address.municipio) addressText += ", " + company.address.municipio;
        if (company.address.estado) addressText += "/" + company.address.estado;
        if (company.address.cep) addressText += " - CEP: " + company.address.cep;
        
        this.doc.text(addressText, this.margin + 5, this.currentY);
        this.currentY += this.lineHeight;
      }
      
      // Contact person
      if (company.contato && (company.contato.nome || company.contato.email || company.contato.telefone)) {
        this.doc.text('Contato:', this.margin + 5, this.currentY);
        this.currentY += this.lineHeight;
        
        if (company.contato.nome) {
          this.doc.text(`  Nome: ${company.contato.nome}`, this.margin + 5, this.currentY);
          this.currentY += this.lineHeight;
        }
        if (company.contato.email) {
          this.doc.text(`  E-mail: ${company.contato.email}`, this.margin + 5, this.currentY);
          this.currentY += this.lineHeight;
        }
        if (company.contato.telefone) {
          this.doc.text(`  Telefone: ${company.contato.telefone}`, this.margin + 5, this.currentY);
          this.currentY += this.lineHeight;
        }
      }
      
      this.currentY += 5;
    }

    // Property information
    if (generalInfo.propertyName) {
      let propertyName = generalInfo.propertyName;
      if (company) {
        propertyName = this.replacePlaceholders(propertyName, company);
      }
      this.doc.text(`Propriedade: ${propertyName}`, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    }

    if (generalInfo.propertyAddress) {
      let propertyAddress = generalInfo.propertyAddress;
      if (company) {
        propertyAddress = this.replacePlaceholders(propertyAddress, company);
      }
      this.doc.text(`Endereço: ${propertyAddress}`, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    }

    if (generalInfo.propertyPhone) {
      let propertyPhone = generalInfo.propertyPhone;
      if (company) {
        propertyPhone = this.replacePlaceholders(propertyPhone, company);
      }
      this.doc.text(`Telefone: ${propertyPhone}`, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    }

    this.currentY += 5;

    // Inspector information
    if (generalInfo.inspector) {
      let inspector = generalInfo.inspector;
      if (company) {
        inspector = this.replacePlaceholders(inspector, company);
      }
      this.doc.text(`Inspetor: ${inspector}`, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    }

    if (generalInfo.date) {
      const formattedDate = new Date(generalInfo.date).toLocaleDateString('pt-BR');
      this.doc.text(`Data da Inspeção: ${formattedDate}`, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    }

    if (generalInfo.contractNumber) {
      let contractNumber = generalInfo.contractNumber;
      if (company) {
        contractNumber = this.replacePlaceholders(contractNumber, company);
      }
      this.doc.text(`Nº do Contrato: ${contractNumber}`, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    }

    // Add structured general information section if available
    if (generalInformation) {
      this.addStructuredGeneralInfo(generalInformation);
    }

    this.currentY += 10;
  }

  // New method to add structured general information
  private addStructuredGeneralInfo(generalInformation: GeneralInformation): void {
    this.currentY += 15;
    
    // General Information Section
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(212, 4, 45);
    this.doc.text('GENERAL INFORMATION / INFORMAÇÕES DA PROPRIEDADE', this.margin, this.currentY);
    
    this.currentY += 10;
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);

    // Always render all fields, showing "-" for empty ones using helper functions
    
    // Empresa
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Empresa:', this.margin, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(this.sanitizeText(generalInformation.empresa), this.margin + 25, this.currentY);
    this.currentY += this.lineHeight;

    // Nome da Propriedade
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Nome da Propriedade:', this.margin, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(this.sanitizeText(generalInformation.nome_propriedade), this.margin + 50, this.currentY);
    this.currentY += this.lineHeight;

    // ID da Propriedade
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('ID da Propriedade:', this.margin, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(this.sanitizeText(generalInformation.id_propriedade), this.margin + 45, this.currentY);
    this.currentY += this.lineHeight;

    // Endereço
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Endereço:', this.margin, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    const endereco = this.sanitizeText(generalInformation.endereco, 80);
    // Handle long addresses with text wrapping
    const enderecoLines = this.doc.splitTextToSize(endereco, this.pageWidth - this.margin - 30);
    this.doc.text(enderecoLines, this.margin + 25, this.currentY);
    this.currentY += this.lineHeight * enderecoLines.length;

    // Tipo de Edificação
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Tipo de Edificação:', this.margin, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(this.sanitizeText(generalInformation.tipo_edificacao), this.margin + 55, this.currentY);
    this.currentY += this.lineHeight;

    // Área Total do Piso (ft²)
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Área Total do Piso (ft²):', this.margin, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(this.formatNumber(generalInformation.area_total_piso_ft2, 'ft²'), this.margin + 65, this.currentY);
    this.currentY += this.lineHeight;

    // Data da Inspeção
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Data da Inspeção:', this.margin, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(this.formatDate(generalInformation.data_inspecao), this.margin + 50, this.currentY);
    this.currentY += this.lineHeight;

    // Tipo de Inspeção
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Tipo de Inspeção:', this.margin, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(this.sanitizeText(generalInformation.tipo_inspecao), this.margin + 50, this.currentY);
    this.currentY += this.lineHeight;

    // Próxima Inspeção Programada
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Próxima Inspeção:', this.margin, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(this.formatDate(generalInformation.proxima_inspecao_programada), this.margin + 50, this.currentY);
    this.currentY += this.lineHeight;

    // Nome do Inspetor
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Nome do Inspetor:', this.margin, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(this.sanitizeText(generalInformation.nome_inspetor), this.margin + 50, this.currentY);
    this.currentY += this.lineHeight;

    // Licença do Inspetor
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Licença do Inspetor:', this.margin, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(this.sanitizeText(generalInformation.licenca_inspetor), this.margin + 55, this.currentY);
    this.currentY += this.lineHeight;

    // Observações Adicionais (with text wrapping for long content)
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Observações Adicionais:', this.margin, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    const observacoes = this.sanitizeText(generalInformation.observacoes_adicionais, 1000);
    const observacoesLines = this.doc.splitTextToSize(observacoes, this.pageWidth - this.margin - 65);
    this.doc.text(observacoesLines, this.margin + 60, this.currentY);
    this.currentY += this.lineHeight * observacoesLines.length;

    // Condições Ambientais Sub-section
    this.currentY += 5;
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(212, 4, 45);
    this.doc.text('CONDIÇÕES AMBIENTAIS', this.margin, this.currentY);
    this.currentY += this.lineHeight;
    
    this.doc.setTextColor(0, 0, 0);
    
    // Temperatura (°F)
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Temperatura (°F):', this.margin + 5, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(this.formatNumber(generalInformation.temperatura_f, '°F'), this.margin + 50, this.currentY);
    this.currentY += this.lineHeight;

    // Condições Climáticas
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Condições Climáticas:', this.margin + 5, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(this.sanitizeText(generalInformation.condicoes_climaticas), this.margin + 65, this.currentY);
    this.currentY += this.lineHeight;

    // Velocidade do Vento (mph)
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Velocidade do Vento (mph):', this.margin + 5, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(this.formatNumber(generalInformation.velocidade_vento_mph, 'mph'), this.margin + 75, this.currentY);
    this.currentY += this.lineHeight;

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
  companyName?: string,
  pdfCompany?: CompanyData,
  pdfBranding?: PdfBranding,
  generalInformation?: GeneralInformation
): void {
  const pdfGenerator = new PdfGenerator();
  pdfGenerator.generatePdf({
    formTitle,
    formData,
    generalInfo,
    signatures,
    companyName,
    pdfCompany,
    pdfBranding,
    generalInformation
  });
}

// Helper function to generate PDF as base64 string
export function generateInspectionPdfBase64(
  formTitle: string, 
  formData: any, 
  generalInfo: GeneralInfo, 
  signatures?: SignatureData,
  companyName?: string,
  pdfCompany?: CompanyData,
  pdfBranding?: PdfBranding,
  generalInformation?: GeneralInformation
): string {
  const pdfGenerator = new PdfGenerator();
  return pdfGenerator.generatePdfBase64({
    formTitle,
    formData,
    generalInfo,
    signatures,
    companyName,
    pdfCompany,
    pdfBranding,
    generalInformation
  });
}

// Export types for use in other components
export type { SignatureData, CompanyData, PdfBranding };