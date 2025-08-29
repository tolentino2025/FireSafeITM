import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Save, FileText, Lock } from "lucide-react";

interface FormActionsProps {
  formData: any;
  formTitle: string;
  onSaveDraft?: () => void;
  onValidateForm?: () => boolean;
  isFormComplete?: boolean;
  isArchived?: boolean;
}

export function FormActions({ 
  formData, 
  formTitle, 
  onSaveDraft,
  onValidateForm,
  isFormComplete = false,
  isArchived = false 
}: FormActionsProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const { toast } = useToast();

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

  const formatFormDataForPDF = () => {
    const currentDate = new Date().toLocaleDateString('pt-BR');
    const currentTime = new Date().toLocaleTimeString('pt-BR');
    
    let pdfContent = `
FIRESAFE ITM - RELATÓRIO DE INSPEÇÃO
${formTitle}
Data: ${currentDate} - Hora: ${currentTime}
======================================

`;

    // Format form data into readable text
    const formatSection = (obj: any, level = 0): string => {
      let content = '';
      const indent = '  '.repeat(level);
      
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object' && value !== null) {
          content += `${indent}${key}:\n${formatSection(value, level + 1)}\n`;
        } else if (value !== undefined && value !== null && value !== '') {
          const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          content += `${indent}${label}: ${value}\n`;
        }
      }
      
      return content;
    };

    pdfContent += formatSection(formData);
    pdfContent += `\n======================================\nRelatório gerado automaticamente pelo FireSafe ITM\nNFPA 25 Compliance System`;

    return pdfContent;
  };

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      const pdfContent = formatFormDataForPDF();
      
      // Create a simple text-based PDF content
      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "PDF Gerado",
        description: "O relatório foi gerado e baixado com sucesso.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Erro na Geração",
        description: "Não foi possível gerar o PDF. Tente novamente.",
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
      // Generate PDF first
      await handleGeneratePDF();
      
      // Save to archived forms
      const archivedForms = JSON.parse(localStorage.getItem('archived_forms') || '[]');
      archivedForms.push({
        id: Date.now().toString(),
        title: formTitle,
        data: formData,
        archivedDate: new Date().toISOString(),
        inspector: "John Engineer" // This would come from user context
      });
      localStorage.setItem('archived_forms', JSON.stringify(archivedForms));

      // Remove from drafts
      localStorage.removeItem(`draft_${formTitle}`);

      toast({
        title: "Formulário Arquivado",
        description: "O formulário foi validado, arquivado e está disponível no Painel de Controle.",
        variant: "default",
      });

      // Redirect or update state to show form as archived
      window.location.reload(); // Simple solution for now
      
    } catch (error) {
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