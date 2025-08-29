import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Save, FileText, Lock } from "lucide-react";
import { generateInspectionPdf, generateInspectionPdfBase64, type SignatureData } from "@/lib/pdf-generator";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { InsertArchivedReport } from "@shared/schema";

interface FormActionsProps {
  formData: any;
  formTitle: string;
  signatures?: SignatureData;
  onSaveDraft?: () => void;
  onValidateForm?: () => boolean;
  isFormComplete?: boolean;
  isArchived?: boolean;
}

export function FormActions({ 
  formData, 
  formTitle, 
  signatures,
  onSaveDraft,
  onValidateForm,
  isFormComplete = false,
  isArchived = false 
}: FormActionsProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const archiveMutation = useMutation({
    mutationFn: async (reportData: InsertArchivedReport) => {
      return apiRequest('/api/archived-reports', {
        method: 'POST',
        body: reportData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/archived-reports'] });
    },
  });

  const handleSaveDraft = async () => {
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

  const handleArchive = async () => {
    if (!onValidateForm) {
      toast({
        title: "Validação Necessária",
        description: "A função de validação não foi configurada para este formulário.",
        variant: "destructive",
      });
      return;
    }

    const isValid = onValidateForm();
    if (!isValid) {
      toast({
        title: "Formulário Incompleto",
        description: "Preencha todos os campos obrigatórios antes de arquivar.",
        variant: "destructive",
      });
      return;
    }

    setIsArchiving(true);

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

      // Generate PDF as base64 for storage
      const pdfBase64 = generateInspectionPdfBase64(
        formTitle,
        formData,
        generalInfo,
        signatures,
        "Empresa Cliente"
      );

      // Prepare archived report data
      const reportData: InsertArchivedReport = {
        userId: "default-user-id", // This would come from user context in a real app
        formTitle,
        propertyName: generalInfo.propertyName || "Propriedade não informada",
        propertyAddress: generalInfo.propertyAddress || null,
        inspectionDate: new Date(generalInfo.date || new Date()),
        formData: JSON.stringify(formData),
        signatures: JSON.stringify(signatures || {}),
        pdfData: pdfBase64,
        status: "archived",
      };

      // Save to database using the API
      await archiveMutation.mutateAsync(reportData);

      // Remove from drafts
      localStorage.removeItem(`draft_${formTitle}`);

      toast({
        title: "Formulário Arquivado com Sucesso",
        description: "O relatório foi salvo no seu histórico e está disponível no Painel de Controle.",
        variant: "default",
      });

      // Redirect to user dashboard to show archived report
      setTimeout(() => {
        window.location.href = '/painel-controle';
      }, 2000);
      
    } catch (error) {
      console.error("Error archiving form:", error);
      toast({
        title: "Erro no Arquivamento",
        description: "Não foi possível arquivar o formulário. Tente novamente.",
        variant: "destructive",
      });
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
    <div className="flex flex-col sm:flex-row gap-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border-t-4 border-primary">
      <Button
        onClick={handleSaveDraft}
        variant="outline"
        className="flex items-center space-x-2 flex-1"
        data-testid="button-save-draft"
      >
        <Save className="w-4 h-4" />
        <span>Salvar Rascunho</span>
      </Button>

      <Button
        onClick={handleGeneratePDF}
        disabled={isGeneratingPDF}
        className="flex items-center space-x-2 flex-1 text-white hover:bg-red-700"
        style={{ backgroundColor: '#D2042D' }}
        data-testid="button-generate-pdf"
      >
        <FileText className="w-4 h-4" />
        <span>{isGeneratingPDF ? "Gerando..." : "Gerar PDF"}</span>
      </Button>

      <Button
        onClick={handleArchive}
        disabled={isArchiving}
        variant="default"
        className="flex items-center space-x-2 flex-1 bg-gray-800 dark:bg-gray-200 hover:bg-gray-900 dark:hover:bg-gray-300 text-white dark:text-gray-800"
        data-testid="button-archive"
      >
        <Lock className="w-4 h-4" />
        <span>{isArchiving ? "Arquivando..." : "Enviar e Arquivar"}</span>
      </Button>
    </div>
  );
}