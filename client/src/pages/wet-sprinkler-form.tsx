import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, ArrowRight, CheckCircle, Save, AlertTriangle, Info, Eye, EyeOff, PenTool } from "lucide-react";
import { FormActions } from "@/components/form-actions";
import { SignaturePad } from "@/components/signature-pad";
import { FinalizeInspectionButton } from "@/components/inspection/finalize-inspection-button";
import { useFrequencyBasedSections, useFrequencyInfo } from "@/hooks/useFrequencyBasedSections";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Inspection } from "@shared/schema";

type FormData = {
  propertyName: string;
  propertyAddress: string;
  propertyPhone: string;
  inspector: string;
  contractNumber: string;
  date: string;
  frequency: string;
  [key: string]: string;
};

export default function WetSprinklerForm() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentSection, setCurrentSection] = useState("general");

  // Extract inspectionId from querystring
  const urlParams = new URLSearchParams(window.location.search);
  const inspectionId = urlParams.get('id');
  const returnUrl = urlParams.get('return') || '/multi-inspection';

  // Load inspection data when inspectionId exists
  const { data: inspection } = useQuery<Inspection>({
    queryKey: ["/api/inspections", inspectionId],
    enabled: !!inspectionId,
  });

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const form = useForm<FormData>({
    defaultValues: {
      propertyName: "",
      propertyAddress: "",
      propertyPhone: "",
      inspector: "",
      contractNumber: "",
      date: "",
      frequency: "",
    },
  });

  // Update form with inspection data when loaded
  useEffect(() => {
    if (inspection) {
      form.reset({
        propertyName: inspection.facilityName || "",
        propertyAddress: inspection.address || "",
        inspector: inspection.inspectorName || "",
        date: inspection.inspectionDate ? new Date(inspection.inspectionDate).toISOString().split('T')[0] : "",
        frequency: "",
        propertyPhone: "",
        contractNumber: "",
      });
    }
  }, [inspection, form]);

  // Save/update mutation using existing pattern
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

  // Handle form save/progress update using existing mechanism
  const handleSaveProgress = () => {
    if (inspectionId) {
      // Mark this form as completed and update progress
      updateInspectionMutation.mutate({
        id: inspectionId,
        data: {
          status: "draft", // Keep as draft until all forms complete
          additionalNotes: `Formulário Sistema Úmido de Sprinklers concluído`
        }
      });
    }
  };

  // Handle back navigation using existing pattern
  const handleBackNavigation = () => {
    if (returnUrl) {
      navigate(returnUrl);
    } else if (inspectionId) {
      navigate(`/multi-inspection/${inspectionId}`);
    } else {
      navigate('/');
    }
  };
  
  // Estados para assinaturas digitais
  const [inspectorName, setInspectorName] = useState("");
  const [inspectorDate, setInspectorDate] = useState("");
  const [inspectorSignature, setInspectorSignature] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientDate, setClientDate] = useState("");
  const [clientSignature, setClientSignature] = useState<string | null>(null);

  const allSections = [
    { id: "general", title: "Informações Gerais", icon: "📋" },
    { id: "daily", title: "Inspeções Diárias", icon: "📅" },
    { id: "weekly", title: "Inspeções Semanais", icon: "📊" },
    { id: "monthly", title: "Inspeções Mensais", icon: "📈" },
    { id: "quarterly", title: "Inspeções Trimestrais", icon: "🔍" },
    { id: "annual", title: "Inspeções Anuais", icon: "📋" },
    { id: "fiveyears", title: "Inspeções 5 Anos", icon: "🔬" },
    { id: "tests", title: "Testes", icon: "🧪" },
    { id: "signatures", title: "Assinaturas", icon: "✍️" },
  ];

  // Obter frequência selecionada do formulário
  const selectedFrequency = form.watch("frequency");
  
  // Usar hook para gerenciar seções baseadas na frequência
  const {
    visibleSections,
    currentSection: managedCurrentSection,
    isSectionEnabled,
    isSectionVisible,
    hasFrequencyRestriction
  } = useFrequencyBasedSections(allSections, selectedFrequency, currentSection, setCurrentSection);

  // Obter informações sobre a frequência selecionada
  const frequencyInfo = useFrequencyInfo(selectedFrequency, allSections);

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data);
  };

  const renderRadioGroup = (name: string, label: string, includeField = false, fieldType = "text") => (
    <div className="space-y-3">
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel className="text-sm font-medium text-foreground">{label}</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="flex space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sim" id={`${name}-sim`} />
                  <label htmlFor={`${name}-sim`} className="text-sm text-foreground">Sim</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nao" id={`${name}-nao`} />
                  <label htmlFor={`${name}-nao`} className="text-sm text-foreground">Não</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="na" id={`${name}-na`} />
                  <label htmlFor={`${name}-na`} className="text-sm text-foreground">N/A</label>
                </div>
              </RadioGroup>
            </FormControl>
          </FormItem>
        )}
      />
      {includeField && (
        <FormField
          control={form.control}
          name={`${name}_value`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">Valor (psi):</FormLabel>
              <FormControl>
                <Input 
                  type={fieldType}
                  step={fieldType === "number" ? "0.1" : undefined}
                  {...field} 
                  className="w-32"
                  data-testid={`input-${name}-value`} 
                />
              </FormControl>
            </FormItem>
          )}
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="title-wet-sprinkler-form">
              Sistema de Sprinklers de Tubo Molhado (Wet Pipe)
            </h1>
            <p className="text-muted-foreground">
              Inspeção, Teste e Manutenção conforme NFPA 25 - Versão Integral
              {inspection && ` • ${inspection.facilityName}`}
            </p>
          </div>
          <div className="flex space-x-3">
            {inspectionId ? (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleSaveProgress}
                  disabled={updateInspectionMutation.isPending}
                  data-testid="button-save-progress"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Progresso
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleBackNavigation}
                  data-testid="button-back-inspection"
                >
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Voltar à Inspeção
                </Button>
              </>
            ) : (
              <Link href="/sprinkler-module">
                <Button variant="outline" data-testid="button-back-module">
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Voltar ao Módulo
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg" data-testid="title-navigation">Navegação do Formulário</CardTitle>
                {/* Indicador da frequência selecionada */}
                {hasFrequencyRestriction && frequencyInfo && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Frequência: {frequencyInfo.frequency.charAt(0).toUpperCase() + frequencyInfo.frequency.slice(1)}
                      </span>
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      {frequencyInfo.description}
                    </p>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                {allSections.map((section) => {
                  const isEnabled = isSectionEnabled(section.id);
                  const isCurrent = managedCurrentSection === section.id;
                  
                  return (
                    <button
                      key={section.id}
                      onClick={() => isEnabled ? setCurrentSection(section.id) : null}
                      disabled={!isEnabled}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                        isCurrent && isEnabled
                          ? "bg-primary text-primary-foreground shadow-md"
                          : isEnabled
                          ? "bg-secondary hover:bg-secondary/80 text-secondary-foreground hover:shadow-sm"
                          : "bg-muted/30 text-muted-foreground cursor-not-allowed opacity-50"
                      }`}
                      data-testid={`nav-${section.id}`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{section.icon}</span>
                        <div className="flex-1">
                          <span className="text-sm font-medium">{section.title}</span>
                          {!isEnabled && hasFrequencyRestriction && (
                            <div className="flex items-center space-x-1 mt-1">
                              <EyeOff className="w-3 h-3" />
                              <span className="text-xs">Oculto</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
                
                {/* Resumo das seções ativas */}
                {hasFrequencyRestriction && (
                  <div className="mt-4 pt-3 border-t border-border">
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>{visibleSections.length} seções ativas</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <EyeOff className="w-3 h-3" />
                        <span>{allSections.length - visibleSections.length} seções ocultas</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-3">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card>
                  <CardHeader>
                    <CardTitle data-testid="title-current-section">
                      {allSections.find(s => s.id === managedCurrentSection)?.title}
                    </CardTitle>
                    {/* Aviso quando seções estão ocultas */}
                    {hasFrequencyRestriction && visibleSections.length < allSections.length && (
                      <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                              Modo de Frequência Ativo
                            </p>
                            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                              Algumas seções estão ocultas baseadas na frequência "{selectedFrequency}" selecionada. 
                              Para ver todas as seções, selecione "Anual" ou "5 Anos".
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    
                    {/* General Information */}
                    {managedCurrentSection === "general" && isSectionVisible("general") && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="propertyName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome da Propriedade</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-property-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="propertyPhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Telefone da Propriedade</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-property-phone" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="propertyAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Endereço da Propriedade</FormLabel>
                              <FormControl>
                                <Textarea {...field} data-testid="input-property-address" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="inspector"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Inspetor</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-inspector" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="contractNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nº do Contrato</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-contract-number" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Data</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} data-testid="input-date" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="frequency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Frequência de Inspeção</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-frequency">
                                    <SelectValue placeholder="Selecione a frequência" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="diaria">Diária</SelectItem>
                                  <SelectItem value="semanal">Semanal</SelectItem>
                                  <SelectItem value="mensal">Mensal</SelectItem>
                                  <SelectItem value="trimestral">Trimestral</SelectItem>
                                  <SelectItem value="anual">Anual</SelectItem>
                                  <SelectItem value="5anos">5 Anos</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Daily Inspections */}
                    {managedCurrentSection === "daily" && isSectionVisible("daily") && (
                      <div className="space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                          <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Inspeções Diárias</h3>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Verificações diárias aplicáveis apenas durante clima frio/estação de aquecimento
                          </p>
                        </div>

                        {renderRadioGroup(
                          "daily_valve_enclosure_temp",
                          "Válvula (Apenas Clima Frio/Estação de Aquecimento): O invólucro, não equipado com alarme de baixa temperatura, é inspecionado durante o tempo frio para verificar uma temperatura mínima de 4°C (40°F)?"
                        )}
                      </div>
                    )}

                    {/* Weekly Inspections */}
                    {managedCurrentSection === "weekly" && isSectionVisible("weekly") && (
                      <div className="space-y-6">
                        <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                          <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">Inspeções Semanais</h3>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            Verificações semanais de válvulas de controle e dispositivos de fluxo reverso
                          </p>
                        </div>

                        <div className="space-y-6">
                          <h4 className="font-medium text-foreground border-b pb-2">Fluxo de Retorno (Backflow)</h4>
                          {renderRadioGroup(
                            "weekly_isolation_valves",
                            "Válvulas de isolamento estão em posição aberta e travadas ou supervisionadas?"
                          )}
                          {renderRadioGroup(
                            "weekly_rpa_rpda",
                            "RPA e RPDA – válvula de alívio de detecção diferencial operando corretamente?"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Dispositivo Regulador de Pressão Mestre</h4>
                          {renderRadioGroup(
                            "weekly_downstream_pressures",
                            "As pressões a jusante (downstream) estão de acordo com os critérios de projeto?",
                            true,
                            "number"
                          )}
                          {renderRadioGroup(
                            "weekly_supply_pressure",
                            "A pressão de abastecimento está de acordo com os critérios de projeto?",
                            true,
                            "number"
                          )}
                          {renderRadioGroup(
                            "weekly_master_regulator_damage",
                            "Livre de danos ou vazamentos?"
                          )}
                          {renderRadioGroup(
                            "weekly_trim_operation",
                            "Trim em boas condições de operação?"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Válvulas de Controle</h4>
                          {renderRadioGroup(
                            "weekly_correct_position",
                            "Na posição correta (aberta ou fechada)?"
                          )}
                          {renderRadioGroup(
                            "weekly_sealed",
                            "Selada?"
                          )}
                          {renderRadioGroup(
                            "weekly_accessible",
                            "Acessível?"
                          )}
                          {renderRadioGroup(
                            "weekly_piv_keys",
                            "Válvulas Indicadoras de Posição (PIVs) são fornecidas com chaves corretas?"
                          )}
                          {renderRadioGroup(
                            "weekly_no_damage",
                            "Livre de danos ou vazamentos?"
                          )}
                          {renderRadioGroup(
                            "weekly_proper_signage",
                            "Sinalização adequada?"
                          )}
                        </div>
                      </div>
                    )}

                    {/* Monthly Inspections */}
                    {managedCurrentSection === "monthly" && isSectionVisible("monthly") && (
                      <div className="space-y-6">
                        <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                          <h3 className="font-medium text-orange-800 dark:text-orange-200 mb-2">Inspeções Mensais</h3>
                          <p className="text-sm text-orange-700 dark:text-orange-300">
                            Verificações mensais de manômetros e válvulas supervisionadas
                          </p>
                        </div>

                        <div className="space-y-6">
                          <h4 className="font-medium text-foreground border-b pb-2">Manômetros (Gauges)</h4>
                          {renderRadioGroup(
                            "monthly_gauges_condition",
                            "Estão em boas condições de operação?"
                          )}
                          {renderRadioGroup(
                            "monthly_air_pressure_maintained",
                            "Manômetros – pressão normal de ar e nitrogênio não supervisionada mantida?",
                            true,
                            "number"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Válvulas de Controle (Travadas ou Supervisionadas)</h4>
                          {renderRadioGroup(
                            "monthly_correct_position",
                            "Na posição correta (aberta ou fechada)?"
                          )}
                          {renderRadioGroup(
                            "monthly_locked_supervised",
                            "Travada ou supervisionada?"
                          )}
                          {renderRadioGroup(
                            "monthly_accessible",
                            "Acessível?"
                          )}
                          {renderRadioGroup(
                            "monthly_piv_keys",
                            "PIVs são fornecidas com chaves corretas?"
                          )}
                          {renderRadioGroup(
                            "monthly_no_damage",
                            "Livre de danos ou vazamentos?"
                          )}
                          {renderRadioGroup(
                            "monthly_proper_signage",
                            "Sinalização adequada?"
                          )}
                        </div>
                      </div>
                    )}

                    {/* Quarterly Inspections */}
                    {managedCurrentSection === "quarterly" && isSectionVisible("quarterly") && (
                      <div className="space-y-6">
                        <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                          <h3 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Inspeções Trimestrais</h3>
                          <p className="text-sm text-purple-700 dark:text-purple-300">
                            Verificações trimestrais de alarmes, válvulas e conexões
                          </p>
                        </div>

                        <div className="space-y-6">
                          <h4 className="font-medium text-foreground border-b pb-2">Alarmes e Dispositivos</h4>
                          {renderRadioGroup(
                            "quarterly_alarm_devices",
                            "O alarme de fluxo de água e os dispositivos de supervisão estão livres de danos?"
                          )}
                          {renderRadioGroup(
                            "quarterly_air_pressure_supervised",
                            "Manômetros – pressão normal de ar e nitrogênio supervisionada por um local constantemente atendido é mantida?",
                            true,
                            "number"
                          )}
                          {renderRadioGroup(
                            "quarterly_water_pressure",
                            "Manômetros – pressão normal da água é mantida?",
                            true,
                            "number"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Válvulas de Alarme/Verificação de Riser</h4>
                          {renderRadioGroup(
                            "quarterly_riser_water_pressure",
                            "Manômetros – pressão normal da água mantida?"
                          )}
                          {renderRadioGroup(
                            "quarterly_riser_no_damage",
                            "Livre de danos?"
                          )}
                          {renderRadioGroup(
                            "quarterly_riser_position",
                            "Na posição aberta ou fechada apropriada?"
                          )}
                          {renderRadioGroup(
                            "quarterly_retard_chamber_drains",
                            "Drenos da câmara de retardo/alarme não estão vazando?"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Válvulas de Controle (Supervisionadas Eletronicamente)</h4>
                          {renderRadioGroup(
                            "quarterly_electronic_position",
                            "Na posição correta (aberta ou fechada)?"
                          )}
                          {renderRadioGroup(
                            "quarterly_electronic_supervised",
                            "Supervisionada eletronicamente?"
                          )}
                          {renderRadioGroup(
                            "quarterly_electronic_accessible",
                            "Acessível?"
                          )}
                          {renderRadioGroup(
                            "quarterly_electronic_piv_keys",
                            "PIVs são fornecidas com chaves corretas?"
                          )}
                          {renderRadioGroup(
                            "quarterly_electronic_no_damage",
                            "Livre de danos ou vazamentos?"
                          )}
                          {renderRadioGroup(
                            "quarterly_electronic_signage",
                            "Sinalização adequada?"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Conexões do Corpo de Bombeiros</h4>
                          {renderRadioGroup(
                            "quarterly_fdc_visible",
                            "Visível e acessível?"
                          )}
                          {renderRadioGroup(
                            "quarterly_fdc_couplings",
                            "Acoplamentos/giratórios operam corretamente?"
                          )}
                          {renderRadioGroup(
                            "quarterly_fdc_caps",
                            "Tampões/tampas estão no lugar?"
                          )}
                          {renderRadioGroup(
                            "quarterly_fdc_gaskets",
                            "As juntas não estão danificadas?"
                          )}
                          {renderRadioGroup(
                            "quarterly_fdc_drain_valve",
                            "A válvula de dreno automática está no lugar e operando corretamente?"
                          )}
                          {renderRadioGroup(
                            "quarterly_fdc_identification",
                            "As placas de identificação estão no lugar?"
                          )}
                          {renderRadioGroup(
                            "quarterly_fdc_interior",
                            "O interior está livre de obstruções (a menos que travado)?"
                          )}
                          {renderRadioGroup(
                            "quarterly_fdc_clapper",
                            "A(s) portinhola(s) (clapper) opera(m) corretamente?"
                          )}
                          {renderRadioGroup(
                            "quarterly_fdc_check_valve",
                            "A válvula de retenção não está vazando?"
                          )}
                          {renderRadioGroup(
                            "quarterly_fdc_piping",
                            "A tubulação visível que alimenta a conexão do corpo de bombeiros não está danificada?"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Válvula Redutora de Pressão</h4>
                          {renderRadioGroup(
                            "quarterly_prv_open_no_leak",
                            "Na posição aberta e sem vazamento?"
                          )}
                          {renderRadioGroup(
                            "quarterly_prv_downstream_pressure",
                            "Mantendo a pressão a jusante?"
                          )}
                          {renderRadioGroup(
                            "quarterly_prv_condition",
                            "Em boas condições, com volante instalado e intacto?"
                          )}
                        </div>
                      </div>
                    )}

                    {/* Annual Inspections */}
                    {managedCurrentSection === "annual" && isSectionVisible("annual") && (
                      <div className="space-y-6">
                        <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                          <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">Inspeções Anuais</h3>
                          <p className="text-sm text-red-700 dark:text-red-300">
                            Inspeções anuais abrangentes de todos os componentes do sistema
                          </p>
                        </div>

                        <div className="space-y-6">
                          <h4 className="font-medium text-foreground border-b pb-2">Placa de Informação de Projeto Hidráulico</h4>
                          {renderRadioGroup(
                            "annual_hydraulic_plate",
                            "Está fixada de forma segura no riser e legível?"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Sprinklers (visíveis)</h4>
                          {renderRadioGroup(
                            "annual_sprinklers_damage",
                            "Sem danos ou vazamentos?"
                          )}
                          {renderRadioGroup(
                            "annual_sprinklers_corrosion",
                            "Livre de corrosão, material estranho ou pintura?"
                          )}
                          {renderRadioGroup(
                            "annual_sprinklers_orientation",
                            "Instalado na orientação correta?"
                          )}
                          {renderRadioGroup(
                            "annual_sprinklers_bulbs",
                            "Fluido nos bulbos de vidro?"
                          )}
                          {renderRadioGroup(
                            "annual_spare_sprinklers",
                            "Sprinklers sobressalentes – número e tipo adequados, incluindo chave de instalação?"
                          )}
                          {renderRadioGroup(
                            "annual_sprinklers_coating",
                            "Sem pintura ou revestimento além do aplicado pelo fabricante?"
                          )}
                          {renderRadioGroup(
                            "annual_sprinklers_loading",
                            "Carga – sprinklers estão livres de poeira?"
                          )}
                          {renderRadioGroup(
                            "annual_escutcheons",
                            "Espelhos/placas de cobertura estão presentes e instalados corretamente?"
                          )}
                          {renderRadioGroup(
                            "annual_clearance_storage",
                            "Distância mínima entre sprinklers e armazenamento?"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Suportes/Fixação Sísmica</h4>
                          {renderRadioGroup(
                            "annual_supports_condition",
                            "Não danificados ou soltos?"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Tubos e Conexões (visíveis)</h4>
                          {renderRadioGroup(
                            "annual_piping_condition",
                            "Em boas condições e sem corrosão externa?"
                          )}
                          {renderRadioGroup(
                            "annual_piping_leaks",
                            "Sem vazamentos ou danos mecânicos?"
                          )}
                          {renderRadioGroup(
                            "annual_piping_alignment",
                            "Alinhamento correto – sem cargas externas?"
                          )}
                          {renderRadioGroup(
                            "annual_heat_trace",
                            "Traço de calor (heat trace) conforme requisitos do fabricante?"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Edifício</h4>
                          {renderRadioGroup(
                            "annual_building_temperature",
                            "Tubulação molhada não exposta a temperaturas de congelamento?"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Conexões do Corpo de Bombeiros</h4>
                          {renderRadioGroup(
                            "annual_fdc_interior_locked",
                            "O interior da conexão com tampões ou tampas travadas está livre de obstruções?"
                          )}
                        </div>
                      </div>
                    )}

                    {/* Five Years Inspections */}
                    {managedCurrentSection === "fiveyears" && isSectionVisible("fiveyears") && (
                      <div className="space-y-6">
                        <div className="bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
                          <h3 className="font-medium text-indigo-800 dark:text-indigo-200 mb-2">Inspeções Quinquenais</h3>
                          <p className="text-sm text-indigo-700 dark:text-indigo-300">
                            Inspeções internas e de obstrução a cada 5 anos
                          </p>
                        </div>

                        <div className="space-y-6">
                          <h4 className="font-medium text-foreground border-b pb-2">Válvula de Alarme</h4>
                          {renderRadioGroup(
                            "fiveyears_alarm_valve_interior",
                            "Interior, incluindo filtros, telas e orifício de restrição?"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Válvula de Retenção</h4>
                          {renderRadioGroup(
                            "fiveyears_check_valve_interior",
                            "O interior se move livremente e em boas condições?"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Inspeção de Obstrução</h4>
                          {renderRadioGroup(
                            "fiveyears_obstruction_inspection",
                            "Nenhum material estranho ou obstrutivo encontrado?"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Fluxo de Retorno (Backflow)</h4>
                          {renderRadioGroup(
                            "fiveyears_backflow_internal",
                            "Inspeção interna?"
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tests */}
                    {managedCurrentSection === "tests" && isSectionVisible("tests") && (
                      <div className="space-y-6">
                        <div className="bg-teal-50 dark:bg-teal-950/20 p-4 rounded-lg border border-teal-200 dark:border-teal-800">
                          <h3 className="font-medium text-teal-800 dark:text-teal-200 mb-2">Testes Especializados</h3>
                          <p className="text-sm text-teal-700 dark:text-teal-300">
                            Testes conforme cronograma NFPA 25 - Trimestrais, Semestrais, Anuais e Quinquenais
                          </p>
                        </div>

                        <div className="space-y-6">
                          <h4 className="font-medium text-foreground border-b pb-2">Testes Trimestrais</h4>
                          {renderRadioGroup(
                            "test_quarterly_water_motor_gong",
                            "Dispositivos de Alarme (gongo de motor a água) - Trimestral"
                          )}
                          {renderRadioGroup(
                            "test_quarterly_main_drain",
                            "Teste do Dreno Principal - Trimestral"
                          )}
                          {renderRadioGroup(
                            "test_quarterly_master_regulator",
                            "Dispositivo Regulador de Pressão Mestre (teste de fluxo parcial) - Trimestral"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Testes Semestrais</h4>
                          {renderRadioGroup(
                            "test_semiannual_alarm_devices_vane",
                            "Dispositivos de Alarme (tipo palheta, pá e pressostato) - Semestral"
                          )}
                          {renderRadioGroup(
                            "test_semiannual_valve_supervision",
                            "Interruptor(es) de supervisão de válvula - Semestral"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Testes Anuais</h4>
                          {renderRadioGroup(
                            "test_annual_control_valves",
                            "Válvulas de Controle (operadas em toda a faixa) - Anual"
                          )}
                          {renderRadioGroup(
                            "test_annual_backflow",
                            "Fluxo de Retorno (Backflow - teste de fluxo direto) - Anual"
                          )}
                          {renderRadioGroup(
                            "test_annual_antifreeze",
                            "Solução Anticongelante testada - Anual"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Testes Quinquenais</h4>
                          {renderRadioGroup(
                            "test_fiveyears_gauges",
                            "Manômetros testados ou substituídos - A cada 5 anos"
                          )}
                          {renderRadioGroup(
                            "test_fiveyears_prv_full_flow",
                            "Válvula redutora de pressão de sprinkler (teste de fluxo total) - A cada 5 anos"
                          )}
                        </div>
                      </div>
                    )}

                    {/* Signatures Section */}
                    {managedCurrentSection === "signatures" && isSectionVisible("signatures") && (
                      <div className="space-y-6">
                        <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                          <h3 className="font-medium text-red-800 dark:text-red-200 mb-2 flex items-center gap-2">
                            <PenTool className="w-5 h-5" />
                            Assinaturas Digitais Obrigatórias
                          </h3>
                          <p className="text-sm text-red-700 dark:text-red-300">
                            As assinaturas digitais são obrigatórias e conferem validade legal ao documento NFPA 25.
                            Desenhe usando o mouse ou toque na tela.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <SignaturePad
                            title="Inspetor Responsável"
                            defaultName={form.watch("inspector") || ""}
                            defaultDate={form.watch("date") || new Date().toISOString().split('T')[0]}
                            onSignatureChange={(signature) => setInspectorSignature(signature)}
                            onNameChange={(name) => setInspectorName(name)}
                            onDateChange={(date) => setInspectorDate(date)}
                            required
                          />
                          
                          <SignaturePad
                            title="Representante da Propriedade"
                            defaultDate={form.watch("date") || new Date().toISOString().split('T')[0]}
                            onSignatureChange={(signature) => setClientSignature(signature)}
                            onNameChange={(name) => setClientName(name)}
                            onDateChange={(date) => setClientDate(date)}
                            required
                          />
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Validade Legal</h4>
                          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                            <li>• As assinaturas digitais têm valor legal conforme a legislação vigente</li>
                            <li>• Este documento é válido para apresentação às autoridades competentes</li>
                            <li>• As assinaturas confirmam a veracidade das informações da inspeção NFPA 25</li>
                            <li>• É obrigatório que ambas as partes assinem antes de gerar o PDF final</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-6 border-t">
                      <div>
                        {visibleSections.findIndex(s => s.id === managedCurrentSection) > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const currentIndex = visibleSections.findIndex(s => s.id === managedCurrentSection);
                              setCurrentSection(visibleSections[currentIndex - 1].id);
                            }}
                            data-testid="button-previous-section"
                          >
                            <ArrowLeft className="mr-2 w-4 h-4" />
                            Anterior
                          </Button>
                        )}
                      </div>
                      
                      <div className="flex space-x-3">
                        {(() => {
                          const currentIndex = visibleSections.findIndex(s => s.id === managedCurrentSection);
                          const isLastContentSection = currentIndex === visibleSections.length - 2 && visibleSections[visibleSections.length - 1]?.id === "signatures";
                          const isOnSignatures = managedCurrentSection === "signatures";
                          
                          if (isOnSignatures) {
                            // Na seção de assinaturas, mostra botão de finalizar formulário
                            return (
                              <Button type="submit" data-testid="button-submit-form">
                                <CheckCircle className="mr-2 w-4 h-4" />
                                Finalizar Inspeção
                              </Button>
                            );
                          } else if (isLastContentSection) {
                            // Na última seção de conteúdo, mostra botão "Finalizar Inspeção" que vai para assinaturas
                            return (
                              <FinalizeInspectionButton
                                onFinalize={() => setCurrentSection("signatures")}
                              />
                            );
                          } else if (currentIndex < visibleSections.length - 1) {
                            // Nas demais seções, mostra botão "Próximo"
                            return (
                              <Button
                                type="button"
                                onClick={() => {
                                  setCurrentSection(visibleSections[currentIndex + 1].id);
                                }}
                                data-testid="button-next-section"
                              >
                                Próximo
                                <ArrowRight className="ml-2 w-4 h-4" />
                              </Button>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>

                    {/* Form Actions - Show only on last section */}
                    {visibleSections.findIndex(s => s.id === managedCurrentSection) === visibleSections.length - 1 && (
                      <FormActions
                        formData={form.getValues()}
                        formTitle="Inspeção de Sistema de Sprinklers Tubo Molhado"
                        signatures={{
                          inspectorName: inspectorName || form.watch("inspector") || "",
                          inspectorDate: inspectorDate || form.watch("date") || new Date().toISOString().split('T')[0],
                          inspectorSignature: inspectorSignature || undefined,
                          clientName: clientName,
                          clientDate: clientDate || form.watch("date") || new Date().toISOString().split('T')[0],
                          clientSignature: clientSignature || undefined
                        }}
                        onSaveDraft={inspectionId ? handleSaveProgress : undefined}
                        onValidateForm={() => {
                          const values = form.getValues();
                          const signaturesValid = inspectorSignature && clientSignature && 
                                                (inspectorName || values.inspector) && clientName;
                          
                          const errors: string[] = [];
                          if (!values.propertyName) errors.push("Nome da Propriedade é obrigatório");
                          if (!values.inspector && !inspectorName) errors.push("Nome do Inspetor é obrigatório");
                          if (!values.date) errors.push("Data da Inspeção é obrigatória");
                          if (!values.frequency) errors.push("Frequência é obrigatória");
                          if (!inspectorSignature) errors.push("Assinatura do Inspetor é obrigatória");
                          if (!clientSignature) errors.push("Assinatura do Representante da Propriedade é obrigatória");
                          if (!clientName) errors.push("Nome do Representante da Propriedade é obrigatório");
                          
                          return errors.length === 0 ? true : errors;
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              </form>
            </Form>
          </div>
        </div>
      </main>
    </div>
  );
}