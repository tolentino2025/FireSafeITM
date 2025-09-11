import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Save, FileText, Lock, CheckCircle, AlertTriangle } from "lucide-react";
import { generateInspectionPdf, generateInspectionPdfBase64, type SignatureData } from "@/lib/pdf-generator";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { InsertArchivedReport } from "@shared/schema";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FormActionsProps {
  formData: any;
  formTitle: string;
  signatures?: SignatureData;
  onSaveDraft?: () => void;
  onValidateForm?: () => boolean | string[]; // Retorna true para sucesso ou array de erros
  isFormComplete?: boolean;
  isArchived?: boolean;
  requiredFields?: string[]; // Lista de campos obrigatórios
}

export function FormActions({ 
  formData, 
  formTitle, 
  signatures,
  onSaveDraft,
  onValidateForm,
  isFormComplete = false,
  isArchived = false,
  requiredFields = [] // Deixar vazio para usar apenas validação personalizada
}: FormActionsProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Limpar erros de validação quando o formulário muda
  const clearValidationErrors = () => {
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const archiveMutation = useMutation({
    mutationFn: async (reportData: any) => {
      // Serialize data properly, converting Date to ISO string
      const serializedData = {
        ...reportData,
        inspectionDate: reportData.inspectionDate instanceof Date 
          ? reportData.inspectionDate.toISOString() 
          : reportData.inspectionDate
      };

      const response = await fetch('/api/archived-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serializedData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/archived-reports'] });
    },
  });

  const handleSaveDraft = async () => {
    // Limpar erros de validação ao salvar rascunho
    clearValidationErrors();
    
    try {
      // Save draft without validation
      if (onSaveDraft) {
        onSaveDraft();
      } else {
        // Default save to localStorage
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

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      // Extract general information from form data
      const generalInfo = {
        propertyName: formData.propertyName || formData.owner,
        propertyAddress: formData.propertyAddress || formData.ownerAddress,
        propertyPhone: formData.propertyPhone,
        inspector: formData.inspector || "John Engineer",
        date: formData.date || formData.workDate,
        contractNumber: formData.contractNumber
      };

      // Generate professional PDF using the new generator
      generateInspectionPdf(
        formTitle,
        formData,
        generalInfo,
        signatures,
        "Empresa Cliente" // This could come from user profile in the future
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
        inspector: formData.inspector || formData.inspectorName || "John Engineer",
        date: formData.date || formData.workDate || formData.inspectionDate || new Date().toISOString().split('T')[0],
        contractNumber: formData.contractNumber
      };

      // Mostrar progresso: Gerando PDF
      toast({
        title: "Processando Arquivamento",
        description: "Passo 1/3: Gerando relatório PDF...",
        variant: "default",
      });

      // Passo A: Gerar o PDF Final
      console.log("Generating PDF with data:", { formTitle, generalInfo, signatures });
      const pdfBase64 = generateInspectionPdfBase64(
        formTitle,
        formData,
        generalInfo,
        signatures,
        "Empresa Cliente"
      );
      console.log("PDF generated, size:", pdfBase64?.length || 0, "characters");

      // Mostrar progresso: Salvando no banco
      toast({
        title: "Processando Arquivamento",
        description: "Passo 2/3: Salvando no banco de dados...",
        variant: "default",
      });

      // Normalize date to prevent server errors - handles both ISO and Brazilian formats
      const normalizeDate = (dateString: string): string => {
        if (!dateString) return new Date().toISOString().split('T')[0];
        
        // If already in ISO format (YYYY-MM-DD), use it
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
          return dateString;
        }
        
        // Try to parse Brazilian format (DD/MM/YYYY)
        const brMatch = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (brMatch) {
          const [, day, month, year] = brMatch;
          const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          const testDate = new Date(isoDate);
          if (!isNaN(testDate.getTime())) {
            return isoDate;
          }
        }
        
        // Try standard Date parsing as fallback
        const testDate = new Date(dateString);
        if (!isNaN(testDate.getTime())) {
          return testDate.toISOString().split('T')[0];
        }
        
        // If all fails, use today's date
        console.warn("Invalid date format, using today:", dateString);
        return new Date().toISOString().split('T')[0];
      };

      const normalizedDate = normalizeDate(generalInfo.date || "");

      // Passo B: Preparar dados do relatório arquivado
      const reportData = {
        userId: "default-user-id", // This would come from user context in a real app
        formTitle,
        propertyName: generalInfo.propertyName || "Propriedade não informada",
        propertyAddress: generalInfo.propertyAddress || null,
        inspectionDate: normalizedDate, // Send normalized date string directly
        formData: JSON.stringify(formData),
        signatures: JSON.stringify(signatures || {}),
        pdfData: pdfBase64,
        status: "archived",
      };

      // Passo B: Salvar no Banco de Dados
      await archiveMutation.mutateAsync(reportData);

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

      // Feedback de Sucesso (conforme solicitado)
      setTimeout(() => {
        toast({
          title: "Sucesso!",
          description: "O relatório foi arquivado e está disponível no seu painel.",
          variant: "default",
        });
      }, 500);

      // Passo D: Redirecionar para o Painel de Controle
      setTimeout(() => {
        window.location.href = '/painel-controle';
      }, 2000);
      
    } catch (error) {
      console.error("Error archiving form:", error);
      
      // Tratar diferentes tipos de erro
      let errorMessage = "Não foi possível arquivar o formulário. Tente novamente.";
      let errorTitle = "Erro no Arquivamento";
      
      if (error instanceof Error) {
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        
        // Se for erro de HTTP, mostrar status
        if (error.message.includes('HTTP error')) {
          errorMessage = `Erro no servidor: ${error.message}. Verifique os dados e tente novamente.`;
        }
        // Se for erro de PDF, mostrar específico
        else if (error.message.toLowerCase().includes('pdf')) {
          errorTitle = "Erro na Geração de PDF";
          errorMessage = "Não foi possível gerar o PDF do relatório. Verifique se todos os campos estão preenchidos.";
        }
        // Se for erro de rede
        else if (error.message.toLowerCase().includes('fetch')) {
          errorMessage = "Problema de conexão com o servidor. Verifique sua internet e tente novamente.";
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
      
      // O formulário NÃO deve ser bloqueado em caso de erro
    } finally {
      setIsArchiving(false);
    }
  };

  if (isArchived) {
    return (
      <div className="flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
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

      <div className="flex flex-col sm:flex-row gap-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border-t-4 border-primary">
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
          style={{ backgroundColor: '#D2042D' }}
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