import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { InsertInspection, Inspection, Company } from "@shared/schema";
import { CompanyPickerInput } from "@/components/companies/CompanyPicker";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  FileText, 
  Clock, 
  Save,
  Settings,
  ExternalLink,
  AlertTriangle,
  Info
} from "lucide-react";

// Form mapping to components and paths
const FORM_COMPONENTS: Record<string, { 
  path: string; 
  title: string; 
  icon: any;
  estimatedTime: string;
}> = {
  "wet-sprinkler": {
    path: "/sprinkler/wet-sprinkler",
    title: "Sistema Úmido de Sprinklers",
    icon: FileText,
    estimatedTime: "15-20 min"
  },
  "dry-sprinkler": {
    path: "/sprinkler/dry-sprinkler", 
    title: "Sistema Seco de Sprinklers",
    icon: FileText,
    estimatedTime: "20-25 min"
  },
  "preaction-deluge": {
    path: "/sprinkler/preaction-deluge",
    title: "Sistema Pré-Ação e Dilúvio",
    icon: FileText,
    estimatedTime: "25-30 min"
  },
  "foam-water": {
    path: "/sprinkler/foam-water",
    title: "Sistema de Espuma e Água",
    icon: FileText,
    estimatedTime: "20-25 min"
  },
  "water-spray": {
    path: "/sprinkler/water-spray",
    title: "Sistema de Borrifo de Água",
    icon: FileText,
    estimatedTime: "15-20 min"
  },
  "water-mist": {
    path: "/sprinkler/water-mist",
    title: "Sistema de Névoa de Água",
    icon: FileText,
    estimatedTime: "20-25 min"
  },
  "weekly-pump": {
    path: "/weekly-pump-form",
    title: "Inspeção Semanal de Bomba",
    icon: Settings,
    estimatedTime: "10-15 min"
  },
  "monthly-pump": {
    path: "/monthly-pump-form",
    title: "Inspeção Mensal de Bomba",
    icon: Settings,
    estimatedTime: "15-20 min"
  },
  "annual-pump": {
    path: "/annual-pump-form",
    title: "Inspeção Anual de Bomba",
    icon: Settings,
    estimatedTime: "30-45 min"
  },
  "standpipe-hose": {
    path: "/standpipe-hose-form",
    title: "Sistemas de Hidrantes e Mangueiras",
    icon: FileText,
    estimatedTime: "20-30 min"
  },
  "fire-service-mains": {
    path: "/fire-service-mains-form",
    title: "Redes Principais de Serviço de Incêndio",
    icon: FileText,
    estimatedTime: "25-35 min"
  },
  "hydrant-flow-test": {
    path: "/hydrant-flow-test-form",
    title: "Teste de Vazão de Hidrante",
    icon: FileText,
    estimatedTime: "45-60 min"
  },
  "water-tank": {
    path: "/water-tank-form",
    title: "Tanques de Armazenamento de Água",
    icon: FileText,
    estimatedTime: "20-30 min"
  },
  "hazard-evaluation": {
    path: "/hazard-evaluation-form",
    title: "Avaliação de Risco de Incêndio",
    icon: FileText,
    estimatedTime: "30-45 min"
  },
  "above-ground-certificate": {
    path: "/above-ground-certificate-form",
    title: "Certificado de Sistema Acima do Solo",
    icon: FileText,
    estimatedTime: "20-30 min"
  },
  "underground-certificate": {
    path: "/underground-certificate-form",
    title: "Certificado de Sistema Subterrâneo",
    icon: FileText,
    estimatedTime: "25-35 min"
  }
};

export default function MultiFormInspection() {
  const [, params] = useRoute("/multi-inspection/:inspectionId?");
  const [, navigate] = useLocation();
  const inspectionId = params?.inspectionId;
  const { toast } = useToast();

  const [selectedForms, setSelectedForms] = useState<string[]>([]);
  const [currentFormIndex, setCurrentFormIndex] = useState(0);
  const [completedForms, setCompletedForms] = useState<Set<string>>(new Set());
  const [inspectionData, setInspectionData] = useState<Partial<InsertInspection>>({});
  const [selectedCompany, setSelectedCompany] = useState<Company | undefined>();
  const [companyError, setCompanyError] = useState<string>("");

  // Get selected forms from URL params or localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const formsParam = urlParams.get('forms');
    
    if (formsParam) {
      const forms = formsParam.split(',');
      setSelectedForms(forms);
      // Save to localStorage for persistence
      localStorage.setItem('currentInspectionForms', JSON.stringify(forms));
    } else {
      // Try to restore from localStorage
      const savedForms = localStorage.getItem('currentInspectionForms');
      if (savedForms) {
        setSelectedForms(JSON.parse(savedForms));
      }
    }
  }, []);

  const { data: inspection } = useQuery<Inspection>({
    queryKey: ["/api/inspections", inspectionId],
    enabled: !!inspectionId,
  });

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const createInspectionMutation = useMutation({
    mutationFn: async (data: InsertInspection) => {
      const response = await apiRequest("POST", "/api/inspections", data);
      return response.json();
    },
    onSuccess: (newInspection) => {
      queryClient.invalidateQueries({ queryKey: ["/api/inspections"] });
      toast({
        title: "Sucesso",
        description: "Inspeção criada com sucesso",
      });
      // Update URL with new inspection ID
      navigate(`/multi-inspection/${newInspection.id}?forms=${selectedForms.join(',')}`);
    },
  });

  const updateInspectionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Inspection> }) => {
      const response = await apiRequest("PATCH", `/api/inspections/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inspections"] });
      toast({
        title: "Sucesso",
        description: "Progresso salvo com sucesso",
      });
    },
  });

  const handleCreateInspection = () => {
    // Clear previous errors
    setCompanyError("");
    
    // Validation
    let hasError = false;
    
    if (!inspectionData.facilityName || !inspectionData.address) {
      toast({
        title: "Erro",
        description: "Preencha o nome da propriedade e endereço antes de continuar",
        variant: "destructive",
      });
      hasError = true;
    }
    
    if (!selectedCompany) {
      setCompanyError("Selecione uma empresa");
      hasError = true;
    }
    
    if (hasError) {
      return;
    }

    const newInspection: InsertInspection = {
      facilityName: inspectionData.facilityName,
      address: inspectionData.address,
      inspectionDate: inspectionData.inspectionDate || new Date(),
      inspectionType: "multi-form",
      inspectorId: (user as any)?.id || "default-user-id", 
      inspectorName: (user as any)?.fullName || "Inspector",
      companyId: selectedCompany!.id, // Add required companyId
      status: "draft",
      progress: 0,
      additionalNotes: `Formulários selecionados: ${selectedForms.map(id => FORM_COMPONENTS[id]?.title).join(', ')}`,
      ...inspectionData,
    };

    createInspectionMutation.mutate(newInspection);
  };

  const handleSaveProgress = () => {
    if (!inspectionId) {
      handleCreateInspection();
      return;
    }

    const progress = Math.round((completedForms.size / selectedForms.length) * 100);
    
    updateInspectionMutation.mutate({
      id: inspectionId,
      data: {
        progress,
        status: progress === 100 ? "completed" : "draft",
        additionalNotes: `Progresso: ${completedForms.size}/${selectedForms.length} formulários concluídos`
      }
    });
  };

  const handleFormComplete = (formId: string) => {
    setCompletedForms(prev => new Set([...Array.from(prev), formId]));
    handleSaveProgress();
  };

  const goToForm = (formId: string) => {
    const form = FORM_COMPONENTS[formId];
    if (form) {
      // Add inspection context to the URL
      const url = `${form.path}?inspection=${inspectionId}&return=/multi-inspection/${inspectionId}?forms=${selectedForms.join(',')}`;
      window.location.href = url;
    }
  };

  const currentForm = selectedForms[currentFormIndex];
  const progress = selectedForms.length > 0 ? Math.round((completedForms.size / selectedForms.length) * 100) : 0;
  const totalEstimatedTime = selectedForms.reduce((total, formId) => {
    const time = FORM_COMPONENTS[formId]?.estimatedTime || "0-0 min";
    const minutes = parseInt(time.split('-')[1]) || 0;
    return total + minutes;
  }, 0);

  if (selectedForms.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-[env(safe-area-inset-bottom)]">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-600" />
              <h2 className="text-xl font-semibold mb-2">Nenhum Formulário Selecionado</h2>
              <p className="text-muted-foreground mb-4">
                Você precisa selecionar os formulários de inspeção primeiro.
              </p>
              <Button onClick={() => navigate('/')} data-testid="button-back-dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-[env(safe-area-inset-bottom)]">
      <Header />
      
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
              Inspeção Multi-Formulário NFPA 25
            </h1>
            <p className="text-muted-foreground mt-2">
              {inspection?.facilityName || "Nova Inspeção"} • {selectedForms.length} formulários selecionados
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              onClick={handleSaveProgress}
              disabled={createInspectionMutation.isPending || updateInspectionMutation.isPending}
              data-testid="button-save-progress"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Progresso
            </Button>
            <Button 
              onClick={() => navigate('/')}
              variant="outline"
              data-testid="button-back-dashboard"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                Progresso da Inspeção
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>~{totalEstimatedTime} min estimados</span>
                </div>
                <Badge variant={progress === 100 ? "default" : "secondary"}>
                  {completedForms.size}/{selectedForms.length} concluídos
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Progresso Total</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              
              {!inspectionId && (
                <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex gap-2">
                    <Info className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                      <p className="font-medium mb-1">Informações da Propriedade Necessárias</p>
                      <p className="text-xs">
                        Preencha as informações básicas da propriedade para criar a inspeção e começar o preenchimento dos formulários.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Forms List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {selectedForms.map((formId, index) => {
            const form = FORM_COMPONENTS[formId];
            const isCompleted = completedForms.has(formId);
            const Icon = form?.icon || FileText;
            
            if (!form) return null;

            return (
              <Card 
                key={formId} 
                className={`transition-all hover:shadow-md ${
                  isCompleted ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 
                  index === currentFormIndex ? 'border-primary' : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        isCompleted ? 'bg-green-100 text-green-600' : 'bg-background text-primary'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-sm font-medium">
                          {form.title}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          Tempo estimado: {form.estimatedTime}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={isCompleted ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {isCompleted ? "Concluído" : "Pendente"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      Formulário {index + 1} de {selectedForms.length}
                    </div>
                    <Button 
                      size="sm"
                      variant={isCompleted ? "outline" : "default"}
                      onClick={() => goToForm(formId)}
                      disabled={!inspectionId && !inspectionData.facilityName}
                      data-testid={`button-form-${formId}`}
                    >
                      {isCompleted ? (
                        <>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Revisar
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 mr-2" />
                          Preencher
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Setup for New Inspections */}
        {!inspectionId && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Informações da Propriedade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Company Selection */}
              <div>
                <label className="text-sm font-medium block mb-2">Empresa <span className="text-destructive">*</span></label>
                <CompanyPickerInput
                  value={selectedCompany}
                  onChange={(company) => {
                    setSelectedCompany(company);
                    setCompanyError(""); // Clear error when company is selected
                    setInspectionData(prev => ({
                      ...prev,
                      companyId: company.id
                    }));
                  }}
                  placeholder="Selecione a empresa responsável"
                />
                {companyError && (
                  <Alert variant="destructive" className="mt-2" data-testid="inspection-company-required-error">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {companyError}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              {/* Facility Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nome da Propriedade *</label>
                  <input
                    type="text"
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md"
                    placeholder="Ex: Edifício Comercial ABC"
                    value={inspectionData.facilityName || ""}
                    onChange={(e) => setInspectionData(prev => ({
                      ...prev,
                      facilityName: e.target.value
                    }))}
                    data-testid="input-facility-name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Endereço *</label>
                  <input
                    type="text"
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md"
                    placeholder="Ex: Rua das Flores, 123"
                    value={inspectionData.address || ""}
                    onChange={(e) => setInspectionData(prev => ({
                      ...prev,
                      address: e.target.value
                    }))}
                    data-testid="input-address"
                  />
                </div>
              </div>
              <Button 
                onClick={handleCreateInspection}
                disabled={!inspectionData.facilityName || !inspectionData.address || !selectedCompany || createInspectionMutation.isPending}
                data-testid="button-create-inspection"
              >
                <FileText className="w-4 h-4 mr-2" />
                Criar Inspeção e Começar
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}