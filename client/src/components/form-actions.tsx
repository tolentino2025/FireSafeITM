import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Save, FileText, Lock, CheckCircle, AlertTriangle } from "lucide-react";
import { generateInspectionPdf, generateInspectionPdfBase64, type SignatureData, type CompanyData } from "@/lib/pdf-generator";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { InsertArchivedReport } from "@shared/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Utility function for normalizing dates
const normalizeInspectionDate = (dateString: string): string => {
  if (!dateString) return new Date().toISOString().split('T')[0];
  
  // Se já está em formato ISO (YYYY-MM-DD), usar
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  // Tentar interpretar formato brasileiro (DD/MM/YYYY)
  const brMatch = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (brMatch) {
    const [, day, month, year] = brMatch;
    const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const testDate = new Date(isoDate);
    if (!isNaN(testDate.getTime())) {
      return isoDate;
    }
  }
  
  // Tentar interpretação padrão de Data como fallback
  const testDate = new Date(dateString);
  if (!isNaN(testDate.getTime())) {
    return testDate.toISOString().split('T')[0];
  }
  
  // Se tudo falhar, usar data de hoje
  console.warn("Formato de data inválido, usando data atual:", dateString);
  return new Date().toISOString().split('T')[0];
};

interface FormActionsProps {
  formData: any;
  formTitle: string;
  signatures?: SignatureData;
  onSaveDraft?: () => void;
  onValidateForm?: () => boolean | string[]; // Retorna true para sucesso ou array de erros
  isFormComplete?: boolean;
  isArchived?: boolean;
  requiredFields?: string[]; // Lista de campos obrigatórios
  reportId?: string; // ID do relatório para edição
  onFormUpdate?: (updatedData: any) => void; // Callback para atualizar dados do formulário
}

export function FormActions({ 
  formData, 
  formTitle, 
  signatures,
  onSaveDraft,
  onValidateForm,
  isFormComplete = false,
  isArchived = false,
  requiredFields = [], // Deixar vazio para usar apenas validação personalizada
  reportId,
  onFormUpdate
}: FormActionsProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch report data for editing
  const { data: reportData } = useQuery({
    queryKey: ['/api/archived-reports', reportId],
    enabled: !!reportId,
    select: (data) => data
  });

  // Pre-populate form when editing existing report
  useEffect(() => {
    if (reportData && (reportData as any)?.general_information && onFormUpdate) {
      const generalInfo = (reportData as any).general_information;
      
      // Map general_information back to form structure
      const updatedFormData = {
        ...formData,
        companyName: generalInfo.empresa,
        propertyName: generalInfo.nome_propriedade,
        propertyId: generalInfo.id_propriedade,
        propertyAddress: generalInfo.endereco,
        buildingType: generalInfo.tipo_edificacao,
        totalFloorArea: generalInfo.area_total_piso_ft2,
        inspectionDate: generalInfo.data_inspecao ? new Date(generalInfo.data_inspecao).toISOString().split('T')[0] : undefined,
        inspectionType: generalInfo.tipo_inspecao,
        nextInspectionDue: generalInfo.proxima_inspecao_programada ? new Date(generalInfo.proxima_inspecao_programada).toISOString().split('T')[0] : undefined,
        inspector: generalInfo.nome_inspetor,
        inspectorName: generalInfo.nome_inspetor,
        inspectorLicense: generalInfo.licenca_inspetor,
        additionalNotes: generalInfo.observacoes_adicionais,
        temperature: generalInfo.temperatura_f,
        weatherConditions: generalInfo.condicoes_climaticas,
        windSpeed: generalInfo.velocidade_vento_mph,
      };
      
      onFormUpdate(updatedFormData);
      
      toast({
        title: "Dados Carregados",
        description: "As informações gerais do relatório foram carregadas para edição.",
        variant: "default",
      });
    }
  }, [reportData, onFormUpdate, toast]);

  // Limpar erros de validação quando o formulário muda
  const clearValidationErrors = () => {
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const archiveMutation = useMutation({
    mutationFn: async (reportData: any) => {
      // Serializar dados adequadamente, convertendo Date para string ISO
      const serializedData = {
        ...reportData,
        inspectionDate: reportData.inspectionDate instanceof Date 
          ? reportData.inspectionDate.toISOString() 
          : reportData.inspectionDate
      };

      // Use nova rota POST /api/reports/:id/archive se temos reportId, senão usar rota antiga
      const method = reportId ? 'POST' : 'POST';
      const url = reportId ? `/api/reports/${reportId}/archive` : '/api/archived-reports';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serializedData),
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        // Criar erro com dados da resposta para melhor tratamento
        const error = new Error(responseData.message || `HTTP error! status: ${response.status}`);
        (error as any).response = {
          data: responseData,
          status: response.status
        };
        throw error;
      }
      
      return responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/archived-reports'] });
    },
  });

  const handleSaveDraft = async () => {
    // Limpar erros de validação ao salvar rascunho
    clearValidationErrors();
    
    try {
      // Salvar rascunho sem validação
      if (onSaveDraft) {
        onSaveDraft();
      } else {
        // Salvamento padrão no localStorage
        localStorage.setItem(`draft_${formTitle}`, JSON.stringify({
          data: formData,
          timestamp: new Date().toISOString(),
          title: formTitle
        }));
      }
      
      toast({
        title: "Rascunho Salvo",
        description: "O progresso do formulário foi salvo com sucesso.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Erro ao Salvar",
        description: "Não foi possível salvar o rascunho. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Helper function to create pdfCompany from form data
  const createPdfCompanyFromFormData = (formData: any): CompanyData | undefined => {
    // Check if form data has company information from various sources
    const company = formData.company;
    
    if (!company) return undefined;

    // Transform company data to pdfCompany format
    // Handle both direct address object and structured address fields
    let address: any = {};
    if (typeof company.address === 'object' && company.address !== null) {
      address = company.address;
    } else if (typeof company.address === 'string') {
      // If address is a string, try to parse it as JSON or use it as logradouro
      try {
        address = JSON.parse(company.address);
      } catch {
        address = { logradouro: company.address };
      }
    }

    const pdfCompany: CompanyData = {
      name: company.name || "",
      cnpj: company.cnpj || "",
      ie: company.ie || "",
      email: company.companyEmail || company.email || "",
      phone: company.phone || "",
      website: company.website || "",
      logoUrl: company.logoUrl || "",
      address: {
        logradouro: address.logradouro || "",
        numero: address.numero || "",
        bairro: address.bairro || "",
        municipio: address.municipio || "",
        estado: address.estado || "",
        cep: address.cep || "",
        complemento: address.complemento || "",
        ibge: address.ibge || "",
        pais: address.pais || "Brasil"
      },
      contato: {
        nome: company.contatoNome || "",
        email: company.contatoEmail || "",
        telefone: company.contatoTelefone || ""
      }
    };

    return pdfCompany;
  };

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      // Extrair informações gerais dos dados do formulário
      const generalInfo = {
        propertyName: formData.propertyName || formData.owner,
        propertyAddress: formData.propertyAddress || formData.ownerAddress,
        propertyPhone: formData.propertyPhone,
        inspector: formData.inspector || "Inspetor Não Informado",
        date: formData.date || formData.workDate,
        contractNumber: formData.contractNumber
      };

      // Create pdfCompany from form data
      const pdfCompany = createPdfCompanyFromFormData(formData);
      
      // Map generalInfo to new general_information structure
      const generalInformationData = {
        empresa: formData.companyName || pdfCompany?.name || "Empresa não informada",
        nome_propriedade: generalInfo.propertyName || "Propriedade não informada",
        id_propriedade: formData.propertyId || undefined,
        endereco: generalInfo.propertyAddress || "Endereço não informado",
        tipo_edificacao: formData.buildingType || formData.facilityType || "Não especificado",
        area_total_piso_ft2: formData.totalFloorArea || formData.coverageArea || undefined,
        data_inspecao: new Date(generalInfo.date || new Date()).toISOString(),
        tipo_inspecao: formData.inspectionType || "Anual",
        proxima_inspecao_programada: formData.nextInspectionDue 
          ? new Date(formData.nextInspectionDue).toISOString() 
          : undefined,
        nome_inspetor: generalInfo.inspector || formData.inspectorName || "Inspetor não informado",
        licenca_inspetor: formData.inspectorLicense || "Licença não informada",
        observacoes_adicionais: formData.additionalNotes || formData.generalNotes || undefined,
        temperatura_f: formData.temperature || formData.ambientTemperature || undefined,
        condicoes_climaticas: formData.weatherConditions || formData.environmentalConditions || undefined,
        velocidade_vento_mph: formData.windSpeed || undefined,
      };

      // Gerar PDF profissional usando o novo gerador
      generateInspectionPdf(
        formTitle,
        formData,
        generalInfo,
        signatures,
        pdfCompany?.name || "Empresa Cliente", // Fallback name for backward compatibility
        pdfCompany, // Pass full company data
        { showCompanyLogo: true, showFireSafeLogo: true }, // Enable both logos
        generalInformationData // Include structured general information
      );

      toast({
        title: "PDF Gerado com Sucesso",
        description: "O relatório profissional FireSafe Tech foi gerado e baixado com todos os detalhes da inspeção.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Erro na Geração do PDF",
        description: "Não foi possível gerar o relatório profissional. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Validação detalhada de campos obrigatórios (flexível)
  const validateRequiredFields = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Se não há campos obrigatórios específicos definidos, pula esta validação
    // A validação personalizada (onValidateForm) deve ser usada em seu lugar
    if (!requiredFields || requiredFields.length === 0) {
      return { isValid: true, errors: [] };
    }
    
    const fieldLabels: { [key: string]: string } = {
      propertyName: 'Nome da Propriedade',
      propertyAddress: 'Endereço da Propriedade', 
      inspector: 'Nome do Inspetor',
      date: 'Data da Inspeção',
      frequency: 'Frequência de Inspeção',
      contractNumber: 'Número do Contrato'
    };

    for (const field of requiredFields) {
      const value = formData[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        errors.push(fieldLabels[field] || field);
      }
    }

    return { isValid: errors.length === 0, errors };
  };

  const handleArchive = async () => {
    // Limpar erros anteriores
    setValidationErrors([]);

    // 1. Validação de campos obrigatórios
    const { isValid: fieldsValid, errors: fieldErrors } = validateRequiredFields();
    
    // 2. Validação personalizada (se fornecida)
    let customValidation: boolean | string[] = true;
    if (onValidateForm) {
      customValidation = onValidateForm();
    }

    const allErrors: string[] = [];
    
    // Adicionar erros de campos obrigatórios
    if (!fieldsValid) {
      allErrors.push(...fieldErrors.map(field => `${field} é obrigatório`));
    }

    // Adicionar erros de validação personalizada
    if (Array.isArray(customValidation)) {
      allErrors.push(...customValidation);
    } else if (customValidation === false) {
      allErrors.push('Verifique os dados preenchidos no formulário');
    }

    // Se há erros, mostrar e parar
    if (allErrors.length > 0) {
      setValidationErrors(allErrors);
      toast({
        title: "Formulário Incompleto",
        description: `Corrija os seguintes erros antes de arquivar: ${allErrors.slice(0, 3).join(', ')}${allErrors.length > 3 ? '...' : ''}`,
        variant: "destructive",
      });
      return;
    }

    setIsArchiving(true);

    try {
      // Passo A: Extrair informações gerais do formulário
      // Suporte para diferentes tipos de formulários (ITM padrão e sprinklers)
      const generalInfo = {
        propertyName: formData.propertyName || formData.owner || formData.facilityName || "Propriedade não informada",
        propertyAddress: formData.propertyAddress || formData.ownerAddress || formData.systemLocation || null,
        propertyPhone: formData.propertyPhone,
        inspector: formData.inspector || formData.inspectorName || "Inspetor Não Informado",
        date: formData.date || formData.workDate || formData.inspectionDate || new Date().toISOString().split('T')[0],
        contractNumber: formData.contractNumber
      };

      // Mostrar progresso: Gerando PDF
      toast({
        title: "Processando Arquivamento",
        description: "Passo 1/3: Gerando relatório PDF...",
        variant: "default",
      });

      // Create pdfCompany from form data  
      const pdfCompany = createPdfCompanyFromFormData(formData);
      
      const normalizedDate = normalizeInspectionDate(generalInfo.date || "");

      // Map generalInfo to new general_information structure
      const generalInformationData = {
        empresa: formData.companyName || pdfCompany?.name || "Empresa não informada",
        nome_propriedade: generalInfo.propertyName || "Propriedade não informada",
        id_propriedade: formData.propertyId || undefined,
        endereco: generalInfo.propertyAddress || "Endereço não informado",
        tipo_edificacao: formData.buildingType || formData.facilityType || "Não especificado",
        area_total_piso_ft2: formData.totalFloorArea || formData.coverageArea || undefined,
        data_inspecao: new Date(normalizedDate).toISOString(),
        tipo_inspecao: formData.inspectionType || "Anual",
        proxima_inspecao_programada: formData.nextInspectionDue 
          ? new Date(formData.nextInspectionDue).toISOString() 
          : undefined,
        nome_inspetor: generalInfo.inspector || formData.inspectorName || "Inspetor não informado",
        licenca_inspetor: formData.inspectorLicense || "Licença não informada",
        observacoes_adicionais: formData.additionalNotes || formData.generalNotes || undefined,
        temperatura_f: formData.temperature || formData.ambientTemperature || undefined,
        condicoes_climaticas: formData.weatherConditions || formData.environmentalConditions || undefined,
        velocidade_vento_mph: formData.windSpeed || undefined,
      };
      
      // Passo A: Gerar o PDF Final
      console.log("Gerando PDF com dados:", { formTitle, generalInfo, signatures, pdfCompany });
      const pdfBase64 = generateInspectionPdfBase64(
        formTitle,
        formData,
        generalInfo,
        signatures,
        pdfCompany?.name || "Empresa Cliente", // Fallback name for backward compatibility
        pdfCompany, // Pass full company data
        { showCompanyLogo: true, showFireSafeLogo: true }, // Enable both logos
        generalInformationData // Include structured general information
      );
      console.log("PDF gerado, tamanho:", pdfBase64?.length || 0, "caracteres");

      // Mostrar progresso: Salvando no banco
      toast({
        title: "Processando Arquivamento",
        description: "Passo 2/3: Salvando no banco de dados...",
        variant: "default",
      });

      // Passo B: Preparar dados do relatório arquivado
      const payload = {
        userId: "default-user-id", // Este valor viria do contexto do usuário numa aplicação real
        formTitle,
        propertyName: generalInfo.propertyName || "Propriedade não informada",
        propertyAddress: generalInfo.propertyAddress || null,
        inspectionDate: normalizedDate, // Enviar string de data normalizada diretamente
        formData: JSON.stringify(formData),
        signatures: JSON.stringify(signatures || {}),
        pdfData: pdfBase64,
        status: "archived",
        general_information: generalInformationData, // Include structured general information
      };

      // Passo B: Salvar no Banco de Dados
      const archiveResult = await archiveMutation.mutateAsync(payload);

      // Passo C: Atualizar o Painel do Usuário (cache invalidation)
      queryClient.invalidateQueries({ queryKey: ['/api/archived-reports'] });

      // Passo D: Limpar rascunhos
      localStorage.removeItem(`draft_${formTitle}`);

      // Mostrar progresso: Finalizando
      toast({
        title: "Processando Arquivamento",
        description: "Passo 3/3: Finalizando...",
        variant: "default",
      });

      // Tratamento de sucesso conforme especificado
      setTimeout(() => {
        if (archiveResult?.already) {
          // Se já estava arquivado, apenas mostrar toast e navegar
          toast({
            title: "Informação",
            description: "O relatório já estava arquivado.",
            variant: "default",
          });
        } else {
          // Sucesso normal
          toast({
            title: "Sucesso!",
            description: "O relatório foi arquivado e está disponível no histórico.",
            variant: "default",
          });
        }
      }, 500);

      // Navegar para Histórico
      setTimeout(() => {
        window.location.href = '/painel-controle';
      }, 2000);
      
    } catch (err: any) {
      console.error("Erro ao arquivar formulário:", err);
      
      // Tratamento de erro exato conforme especificado
      const baseMessage = err.response?.data?.message || 'Não foi possível arquivar.';
      const codeDisplay = err.response?.data?.code ? ` [${err.response.data.code}]` : '';
      
      toast({
        title: "Erro no Arquivamento",
        description: baseMessage + codeDisplay,
        variant: "destructive",
      });
      
      // O formulário NÃO deve ser bloqueado em caso de erro
    } finally {
      setIsArchiving(false);
    }
  };

  if (isArchived) {
    return (
      <div className="flex items-center justify-center p-6 bg-surface dark:bg-gray-800 rounded-lg border-2 border-border dark:border-gray-700">
        <div className="flex items-center space-x-2 text-muted dark:text-gray-300">
          <Lock className="w-5 h-5" />
          <span className="font-medium">Formulário Arquivado - Somente Leitura</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Exibição de Erros de Validação */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive" className="border-l-4 border-l-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-2">Corrija os seguintes erros antes de arquivar:</div>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col sm:flex-row gap-4 p-6 bg-surface dark:bg-gray-800 rounded-lg border-t-4 border-primary">
        <Button
          onClick={handleSaveDraft}
          variant="outline"
          className="flex items-center space-x-2 flex-1"
          data-testid="button-save-draft"
          disabled={isArchiving}
        >
          <Save className="w-4 h-4" />
          <span>Salvar Rascunho</span>
        </Button>

        <Button
          onClick={handleGeneratePDF}
          disabled={isGeneratingPDF || isArchiving}
          className="flex items-center space-x-2 flex-1 text-white hover:bg-red-700"
          style={{ backgroundColor: 'var(--danger)' }}
          data-testid="button-generate-pdf"
        >
          <FileText className="w-4 h-4" />
          <span>{isGeneratingPDF ? "Gerando..." : "Gerar PDF"}</span>
        </Button>

        <Button
          onClick={handleArchive}
          disabled={isArchiving || isGeneratingPDF}
          variant="default"
          className="flex items-center space-x-2 flex-1 bg-gray-800 dark:bg-gray-200 hover:bg-gray-900 dark:hover:bg-gray-300 text-white dark:text-gray-800"
          data-testid="button-archive"
        >
          {isArchiving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              <span>Arquivando...</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Enviar e Arquivar</span>
            </>
          )}
        </Button>
      </div>

      {/* Indicação de Progresso Durante Arquivamento */}
      {isArchiving && (
        <Alert className="border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-300">
            <div className="font-medium">Arquivamento em Progresso</div>
            <div className="text-sm mt-1">
              Gerando PDF, salvando no banco de dados e atualizando seu painel...
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}