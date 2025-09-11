import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Droplets, 
  Wind, 
  Building2, 
  Settings, 
  FileCheck, 
  TestTube, 
  Gauge,
  Database,
  ChevronRight,
  Info,
  AlertTriangle
} from "lucide-react";

interface SystemType {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: "sprinkler" | "pump" | "standpipe" | "certificates";
  forms: {
    id: string;
    name: string;
    frequency: string[];
    path: string;
  }[];
  required?: boolean;
  color: string;
}

interface SystemSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartInspection: (selectedSystems: string[], selectedForms: string[]) => void;
}

const SYSTEM_TYPES: SystemType[] = [
  {
    id: "sprinkler",
    title: "Sistemas de Sprinklers",
    description: "Sistemas de sprinklers automáticos e manuais",
    icon: Droplets,
    category: "sprinkler",
    color: "text-blue-600",
    forms: [
      {
        id: "wet-sprinkler",
        name: "Sistema Úmido de Sprinklers",
        frequency: ["Diária", "Semanal", "Mensal", "Trimestral", "Semestral", "Anual"],
        path: "/sprinkler/wet-sprinkler"
      },
      {
        id: "dry-sprinkler", 
        name: "Sistema Seco de Sprinklers",
        frequency: ["Diária", "Semanal", "Mensal", "Trimestral", "Anual"],
        path: "/sprinkler/dry-sprinkler"
      },
      {
        id: "preaction-deluge",
        name: "Sistema Pré-Ação e Dilúvio",
        frequency: ["Semanal", "Mensal", "Trimestral", "Semestral", "Anual"],
        path: "/sprinkler/preaction-deluge"
      },
      {
        id: "foam-water",
        name: "Sistema de Espuma e Água",
        frequency: ["Semanal", "Mensal", "Trimestral", "Anual"],
        path: "/sprinkler/foam-water"
      },
      {
        id: "water-spray",
        name: "Sistema de Borrifo de Água",
        frequency: ["Mensal", "Trimestral", "Semestral", "Anual"],
        path: "/sprinkler/water-spray"
      },
      {
        id: "water-mist",
        name: "Sistema de Névoa de Água",
        frequency: ["Semanal", "Mensal", "Trimestral", "Anual"],
        path: "/sprinkler/water-mist"
      }
    ]
  },
  {
    id: "pump",
    title: "Bombas de Incêndio",
    description: "Sistemas de bombas de incêndio e equipamentos auxiliares",
    icon: Settings,
    category: "pump",
    color: "text-red-600",
    forms: [
      {
        id: "weekly-pump",
        name: "Inspeção Semanal de Bomba",
        frequency: ["Semanal"],
        path: "/weekly-pump-form"
      },
      {
        id: "monthly-pump",
        name: "Inspeção Mensal de Bomba",
        frequency: ["Mensal"],
        path: "/monthly-pump-form"
      },
      {
        id: "annual-pump",
        name: "Inspeção Anual de Bomba",
        frequency: ["Anual"],
        path: "/annual-pump-form"
      }
    ]
  },
  {
    id: "standpipe",
    title: "Sistemas de Hidrantes",
    description: "Hidrantes, tubulações e sistemas de mangueiras",
    icon: Building2,
    category: "standpipe",
    color: "text-green-600",
    forms: [
      {
        id: "standpipe-hose",
        name: "Sistemas de Hidrantes e Mangueiras",
        frequency: ["Diária", "Semanal", "Mensal", "Trimestral", "Anual", "Testes"],
        path: "/standpipe-hose-form"
      },
      {
        id: "fire-service-mains",
        name: "Redes Principais de Serviço de Incêndio",
        frequency: ["Semanal", "Mensal", "Trimestral", "Semestral", "Anual", "5 Anos"],
        path: "/fire-service-mains-form"
      },
      {
        id: "hydrant-flow-test",
        name: "Teste de Vazão de Hidrante",
        frequency: ["Teste Especializado"],
        path: "/hydrant-flow-test-form"
      },
      {
        id: "water-tank",
        name: "Tanques de Armazenamento de Água",
        frequency: ["Trimestral", "Anual", "3-5 Anos"],
        path: "/water-tank-form"
      }
    ]
  },
  {
    id: "certificates",
    title: "Certificados e Avaliações",
    description: "Certificados NFPA 25 e avaliações de risco",
    icon: FileCheck,
    category: "certificates",
    color: "text-purple-600",
    forms: [
      {
        id: "hazard-evaluation",
        name: "Avaliação de Risco de Incêndio",
        frequency: ["Anual", "Conforme Necessário"],
        path: "/hazard-evaluation-form"
      },
      {
        id: "above-ground-certificate",
        name: "Certificado de Sistema Acima do Solo",
        frequency: ["Anual", "Renovação"],
        path: "/above-ground-certificate-form"
      },
      {
        id: "underground-certificate",
        name: "Certificado de Sistema Subterrâneo",
        frequency: ["Anual", "Renovação"],
        path: "/underground-certificate-form"
      }
    ]
  }
];

export function SystemSelector({ open, onOpenChange, onStartInspection }: SystemSelectorProps) {
  const [selectedSystems, setSelectedSystems] = useState<string[]>([]);
  const [selectedForms, setSelectedForms] = useState<string[]>([]);
  const [step, setStep] = useState<"systems" | "forms">("systems");

  const handleSystemToggle = (systemId: string) => {
    setSelectedSystems(prev => 
      prev.includes(systemId) 
        ? prev.filter(id => id !== systemId)
        : [...prev, systemId]
    );
  };

  const handleFormToggle = (formId: string) => {
    setSelectedForms(prev => 
      prev.includes(formId) 
        ? prev.filter(id => id !== formId)
        : [...prev, formId]
    );
  };

  const handleContinue = () => {
    if (step === "systems") {
      setStep("forms");
    } else {
      onStartInspection(selectedSystems, selectedForms);
      onOpenChange(false);
      // Reiniciar estado
      setSelectedSystems([]);
      setSelectedForms([]);
      setStep("systems");
    }
  };

  const handleBack = () => {
    if (step === "forms") {
      setStep("systems");
      setSelectedForms([]);
    }
  };

  const getAvailableForms = () => {
    return SYSTEM_TYPES
      .filter(system => selectedSystems.includes(system.id))
      .flatMap(system => system.forms);
  };

  const canContinue = step === "systems" ? selectedSystems.length > 0 : selectedForms.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === "systems" ? (
              <>
                <Gauge className="w-5 h-5 text-primary" />
                Selecionar Sistemas para Inspeção
              </>
            ) : (
              <>
                <FileCheck className="w-5 h-5 text-primary" />
                Selecionar Formulários NFPA 25
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {step === "systems" 
              ? "Selecione os tipos de sistema que serão inspecionados nesta visita."
              : "Escolha os formulários específicos para cada sistema selecionado."
            }
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          {step === "systems" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SYSTEM_TYPES.map((system) => {
                const isSelected = selectedSystems.includes(system.id);
                const Icon = system.icon;
                
                return (
                  <Card 
                    key={system.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'ring-2 ring-primary border-primary' : ''
                    }`}
                    onClick={() => handleSystemToggle(system.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-background ${system.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <CardTitle className="text-sm font-medium">
                              {system.title}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground mt-1">
                              {system.description}
                            </p>
                          </div>
                        </div>
                        <Checkbox 
                          checked={isSelected}
                          data-testid={`checkbox-system-${system.id}`}
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {system.forms.length} formulário{system.forms.length !== 1 ? 's' : ''}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {system.category}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {step === "forms" && (
            <div className="space-y-6">
              {SYSTEM_TYPES
                .filter(system => selectedSystems.includes(system.id))
                .map((system) => {
                  const Icon = system.icon;
                  
                  return (
                    <div key={system.id} className="space-y-3">
                      <div className="flex items-center gap-2 mb-4">
                        <Icon className={`w-5 h-5 ${system.color}`} />
                        <h3 className="font-medium text-foreground">{system.title}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {system.forms.length} formulários disponíveis
                        </Badge>
                      </div>
                      
                      <div className="grid gap-3">
                        {system.forms.map((form) => {
                          const isSelected = selectedForms.includes(form.id);
                          
                          return (
                            <Card 
                              key={form.id}
                              className={`cursor-pointer transition-all hover:shadow-sm ${
                                isSelected ? 'ring-2 ring-primary border-primary' : ''
                              }`}
                              onClick={() => handleFormToggle(form.id)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-sm text-foreground">
                                      {form.name}
                                    </h4>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {form.frequency.map((freq) => (
                                        <Badge 
                                          key={freq} 
                                          variant="outline" 
                                          className="text-xs"
                                        >
                                          {freq}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                  <Checkbox 
                                    checked={isSelected}
                                    data-testid={`checkbox-form-${form.id}`}
                                  />
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </ScrollArea>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="w-4 h-4" />
            {step === "systems" && (
              <span>
                Selecionados: {selectedSystems.length} sistema{selectedSystems.length !== 1 ? 's' : ''}
              </span>
            )}
            {step === "forms" && (
              <span>
                Selecionados: {selectedForms.length} formulário{selectedForms.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          <div className="flex gap-3">
            {step === "forms" && (
              <Button variant="outline" onClick={handleBack} data-testid="button-back">
                Voltar
              </Button>
            )}
            <Button 
              onClick={handleContinue}
              disabled={!canContinue}
              data-testid="button-continue"
            >
              {step === "systems" ? (
                <>
                  Continuar
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4 mr-2" />
                  Iniciar Inspeção
                </>
              )}
            </Button>
          </div>
        </div>

        {step === "systems" && (
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mt-4">
            <div className="flex gap-2">
              <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Requisitos NFPA 25</p>
                <p className="text-xs">
                  Selecione todos os sistemas presentes na propriedade para garantir conformidade total 
                  com os padrões NFPA 25 de inspeção, teste e manutenção.
                </p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}