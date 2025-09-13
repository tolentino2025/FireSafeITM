import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, ArrowRight, CheckCircle, Save, AlertTriangle, Info, Eye, EyeOff, PenTool } from "lucide-react";
import { useFrequencyBasedSections, useFrequencyInfo } from "@/hooks/useFrequencyBasedSections";
import { FormActions } from "@/components/form-actions";
import { SignaturePad } from "@/components/signature-pad";
import { FinalizeInspectionButton } from "@/components/inspection/finalize-inspection-button";

type FormData = {
  propertyName: string;
  address: string;
  phone: string;
  inspector: string;
  contractNumber: string;
  date: string;
  frequency: string;
  [key: string]: string;
};

export default function StandpipeHoseForm() {
  const [currentSection, setCurrentSection] = useState("general");
  const form = useForm<FormData>({
    defaultValues: {
      propertyName: "",
      address: "",
      phone: "",
      inspector: "",
      contractNumber: "",
      date: "",
      frequency: "",
    },
  });
  
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
    { id: "tests", title: "Testes Especializados", icon: "🧪" },
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

  // FormActions handles all archiving - no onSubmit needed

  const renderRadioGroup = (name: string, label: string) => (
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
  );

  return (
    <div className="min-h-screen bg-background pb-[env(safe-area-inset-bottom)]">
      <Header />
      
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground mb-2" data-testid="title-standpipe-hose-form">
              Inspeção de Sistemas de Hidrantes e Mangueiras
            </h1>
            <p className="text-muted-foreground">
              Formulário completo conforme NFPA 25 - Sistemas de Hidrantes e Tubulações
            </p>
          </div>
          <div className="flex space-x-3">
            <Link href="/standpipe-module">
              <Button variant="outline" data-testid="button-back-module">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Voltar ao Módulo
              </Button>
            </Link>
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
              <form>
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
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Telefone da Propriedade</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-phone" />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Endereço</FormLabel>
                              <FormControl>
                                <Textarea {...field} data-testid="input-address" />
                              </FormControl>
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
                                  <Input {...field} data-testid="input-contract" />
                                </FormControl>
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
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Daily Inspections */}
                    {managedCurrentSection === "daily" && isSectionVisible("daily") && (
                      <div className="space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                          <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Válvula de Dilúvio/Tubo Seco (Clima Frio)</h3>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Aplicável apenas durante estação de aquecimento/clima frio
                          </p>
                        </div>

                        {renderRadioGroup(
                          "daily_enclosure_temp",
                          "O invólucro, não equipado com alarme de baixa temperatura, é inspecionado durante o tempo frio para verificar uma temperatura mínima de 4°C (40°F)?"
                        )}
                      </div>
                    )}

                    {/* Weekly Inspections */}
                    {managedCurrentSection === "weekly" && isSectionVisible("weekly") && (
                      <div className="space-y-6">
                        <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                          <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">Inspeções Semanais</h3>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            Verificações semanais de válvulas de controle e sistemas de fluxo reverso
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

                          <h4 className="font-medium text-foreground border-b pb-2">Válvula de Dilúvio/Tubo Seco</h4>
                          {renderRadioGroup(
                            "weekly_enclosure_alarm",
                            "O invólucro, onde equipado com alarme de baixa temperatura, é inspecionado durante o tempo frio para verificar uma temperatura mínima de 4°C (40°F)?"
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
                            Verificações mensais de válvulas travadas ou supervisionadas
                          </p>
                        </div>

                        <div className="space-y-6">
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

                          <h4 className="font-medium text-foreground border-b pb-2">Válvula de Tubo Seco (Sistemas Automáticos Secos)</h4>
                          {renderRadioGroup(
                            "monthly_exterior_damage",
                            "O exterior está livre de danos?"
                          )}
                          {renderRadioGroup(
                            "monthly_trim_valves",
                            "As válvulas de trim estão na posição correta (aberta ou fechada)?"
                          )}
                          {renderRadioGroup(
                            "monthly_intermediate_chamber",
                            "A câmara intermediária não está vazando?"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Válvula de Dilúvio (Sistema Semiautomático Seco)</h4>
                          {renderRadioGroup(
                            "monthly_physical_damage",
                            "Livre de danos físicos ou vazamentos?"
                          )}
                          {renderRadioGroup(
                            "monthly_electrical_components",
                            "Os componentes elétricos estão em serviço?"
                          )}
                          {renderRadioGroup(
                            "monthly_trim_position",
                            "As válvulas de trim estão na posição correta (aberta ou fechada)?"
                          )}
                          {renderRadioGroup(
                            "monthly_valve_seat",
                            "O assento da válvula não está vazando?"
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
                            Verificações trimestrais de válvulas de mangueira e conexões do corpo de bombeiros
                          </p>
                        </div>

                        <div className="space-y-6">
                          <h4 className="font-medium text-foreground border-b pb-2">Válvulas de Mangueira</h4>
                          {renderRadioGroup(
                            "quarterly_caps_place",
                            "As tampas estão no lugar e não danificadas?"
                          )}
                          {renderRadioGroup(
                            "quarterly_hose_threads",
                            "As roscas da mangueira não estão danificadas?"
                          )}
                          {renderRadioGroup(
                            "quarterly_valve_handles",
                            "Os manípulos da válvula estão presentes e não danificados?"
                          )}
                          {renderRadioGroup(
                            "quarterly_gaskets",
                            "As juntas não estão danificadas ou deterioradas?"
                          )}
                          {renderRadioGroup(
                            "quarterly_valves_leaking",
                            "As válvulas não estão vazando?"
                          )}
                          {renderRadioGroup(
                            "quarterly_valves_obstructed",
                            "As válvulas não estão obstruídas?"
                          )}
                          {renderRadioGroup(
                            "quarterly_normal_operation",
                            "As válvulas são capazes de operação normal?"
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
                            "quarterly_fdc_signs",
                            "As placas de identificação estão no lugar?"
                          )}
                          {renderRadioGroup(
                            "quarterly_check_valve",
                            "A válvula de retenção não está vazando?"
                          )}
                          {renderRadioGroup(
                            "quarterly_drain_valve",
                            "A válvula de dreno automática está no lugar e operando corretamente?"
                          )}
                          {renderRadioGroup(
                            "quarterly_fdc_clapper",
                            "A portinhola da conexão de recalque (FDC clapper) é funcional?"
                          )}
                          {renderRadioGroup(
                            "quarterly_interior_clear",
                            "O interior está livre de obstruções (a menos que travado)?"
                          )}
                          {renderRadioGroup(
                            "quarterly_piping_undamaged",
                            "A tubulação visível que alimenta a conexão do corpo de bombeiros não está danificada?"
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
                          <h4 className="font-medium text-foreground border-b pb-2">Gabinete da Mangueira</h4>
                          {renderRadioGroup(
                            "annual_cabinet_visible",
                            "Visível e acessível?"
                          )}
                          {renderRadioGroup(
                            "annual_cabinet_components",
                            "Sem componentes danificados ou corroídos?"
                          )}
                          {renderRadioGroup(
                            "annual_door_operation",
                            "A porta do gabinete não é difícil de abrir e abre completamente?"
                          )}
                          {renderRadioGroup(
                            "annual_glass_intact",
                            "O vidro não está quebrado?"
                          )}
                          {renderRadioGroup(
                            "annual_glass_breaker",
                            "O dispositivo de quebra de vidro está presente e fixado?"
                          )}
                          {renderRadioGroup(
                            "annual_cabinet_identified",
                            "O gabinete está devidamente identificado?"
                          )}
                          {renderRadioGroup(
                            "annual_lock_functional",
                            "A trava (do tipo quebra-vidro) é funcional?"
                          )}
                          {renderRadioGroup(
                            "annual_contents_present",
                            "O conteúdo está presente e acessível?"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Bico (Esguicho - NFPA 1962)</h4>
                          {renderRadioGroup(
                            "annual_nozzle_present",
                            "O esguicho da mangueira está presente?"
                          )}
                          {renderRadioGroup(
                            "annual_nozzle_gasket",
                            "A junta não está faltando ou deteriorada?"
                          )}
                          {renderRadioGroup(
                            "annual_nozzle_clear",
                            "O esguicho não está obstruído?"
                          )}
                          {renderRadioGroup(
                            "annual_nozzle_operation",
                            "O esguicho opera suavemente?"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Mangueira (NFPA 1962)</h4>
                          {renderRadioGroup(
                            "annual_hose_condition",
                            "Sem mofo, cortes, abrasões e deterioração?"
                          )}
                          {renderRadioGroup(
                            "annual_hose_gaskets",
                            "As juntas não estão faltando ou deterioradas?"
                          )}
                          {renderRadioGroup(
                            "annual_coupling_threads",
                            "As roscas no acoplamento não são incompatíveis?"
                          )}
                          {renderRadioGroup(
                            "annual_hose_connected",
                            "A mangueira está conectada ao niple do rack de mangueira ou à válvula?"
                          )}
                          {renderRadioGroup(
                            "annual_test_date",
                            "A data do teste da mangueira está em dia?"
                          )}
                          {renderRadioGroup(
                            "annual_hose_repositioned",
                            "A mangueira foi reenrolada, realocada ou redobrada?"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Dispositivo de Armazenamento da Mangueira</h4>
                          {renderRadioGroup(
                            "annual_storage_visible",
                            "Visível e acessível?"
                          )}
                          {renderRadioGroup(
                            "annual_storage_operation",
                            "Não danificado e opera corretamente?"
                          )}
                          {renderRadioGroup(
                            "annual_hose_properly_stored",
                            "A mangueira está devidamente enrolada ou acondicionada?"
                          )}
                          {renderRadioGroup(
                            "annual_nozzle_clip",
                            "O clipe do esguicho está no lugar e o esguicho está corretamente contido?"
                          )}
                          {renderRadioGroup(
                            "annual_cabinet_rotation",
                            "Se instalado em gabinete, ele girará para fora pelo menos 90 graus?"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Conexões da Mangueira</h4>
                          {renderRadioGroup(
                            "annual_valve_caps",
                            "A(s) tampa(s) da válvula não está(ão) faltando ou danificada(s)?"
                          )}
                          {renderRadioGroup(
                            "annual_hose_connection",
                            "A conexão da mangueira de incêndio não está danificada?"
                          )}
                          {renderRadioGroup(
                            "annual_valve_handles_present",
                            "Os manípulos da válvula não estão faltando ou danificados?"
                          )}
                          {renderRadioGroup(
                            "annual_cap_gaskets",
                            "As juntas da tampa não estão faltando ou deterioradas?"
                          )}
                          {renderRadioGroup(
                            "annual_valve_not_leaking",
                            "A válvula não está vazando?"
                          )}
                          {renderRadioGroup(
                            "annual_valve_unobstructed",
                            "A válvula não tem nenhuma obstrução visível ou física?"
                          )}
                          {renderRadioGroup(
                            "annual_pressure_reducer",
                            "O dispositivo redutor de pressão não está faltando?"
                          )}
                          {renderRadioGroup(
                            "annual_valve_smooth_operation",
                            "As válvulas de hidrante manual, semiautomático ou seco operam suavemente?"
                          )}
                          {renderRadioGroup(
                            "annual_valve_undamaged",
                            "A válvula não está danificada?"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Tubulação e Conexões</h4>
                          {renderRadioGroup(
                            "annual_piping_condition",
                            "Em boas condições, sem corrosão externa?"
                          )}
                          {renderRadioGroup(
                            "annual_no_leaks",
                            "Sem vazamentos ou danos mecânicos?"
                          )}
                          {renderRadioGroup(
                            "annual_proper_alignment",
                            "Alinhamento correto sem cargas externas?"
                          )}
                          {renderRadioGroup(
                            "annual_control_valves",
                            "As válvulas de controle não estão danificadas?"
                          )}
                          {renderRadioGroup(
                            "annual_support_devices",
                            "Sem dispositivos de suporte ausentes ou danificados?"
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tests */}
                    {managedCurrentSection === "tests" && isSectionVisible("tests") && (
                      <div className="space-y-6">
                        <div className="bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
                          <h3 className="font-medium text-indigo-800 dark:text-indigo-200 mb-2">Testes Especializados</h3>
                          <p className="text-sm text-indigo-700 dark:text-indigo-300">
                            Testes anuais, trienais e quinquenais conforme cronograma NFPA 25
                          </p>
                        </div>

                        <div className="space-y-6">
                          <h4 className="font-medium text-foreground border-b pb-2">Testes Anuais</h4>
                          {renderRadioGroup(
                            "test_main_drain",
                            "Teste do Dreno Principal (Anual)"
                          )}
                          {renderRadioGroup(
                            "test_hose_valves",
                            "Teste de Válvulas de Mangueira (Classe I e III): Abrem e fecham totalmente? (Anual)"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Testes a Cada 3 Anos</h4>
                          {renderRadioGroup(
                            "test_hose_hydrostatic",
                            "Teste Hidrostático da Mangueira (para mangueiras com mais de 5 anos) - A cada 3 anos"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Testes a Cada 5 Anos</h4>
                          {renderRadioGroup(
                            "test_flow_test",
                            "Teste de Vazão (todos os sistemas automáticos) - A cada 5 anos"
                          )}
                          {renderRadioGroup(
                            "test_hydrostatic_manual",
                            "Teste Hidrostático (sistemas manuais e semiautomáticos secos) - A cada 5 anos"
                          )}
                          {renderRadioGroup(
                            "test_gauges",
                            "Manômetros testados ou substituídos - A cada 5 anos"
                          )}
                        </div>
                      </div>
                    )}

                    {/* Signatures Section */}
                    {managedCurrentSection === "signatures" && (
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
                        <Button type="button" variant="outline" data-testid="button-save-draft">
                          <Save className="mr-2 w-4 h-4" />
                          Salvar Rascunho
                        </Button>
                        
                        {(() => {
                          const currentIndex = visibleSections.findIndex(s => s.id === managedCurrentSection);
                          const isLastContentSection = currentIndex === visibleSections.length - 2 && visibleSections[visibleSections.length - 1]?.id === "signatures";
                          const isOnSignatures = managedCurrentSection === "signatures";
                          
                          if (isOnSignatures) {
                            // Na seção de assinaturas, FormActions cuida do arquivamento
                            return null;
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

                    {/* Form Actions - Show only on signatures section */}
                    {managedCurrentSection === "signatures" && (
                      <FormActions
                        formData={{
                          ...form.getValues(),
                          // Override specific field mappings for FormActions
                          facilityName: form.watch("propertyName") || "",
                          systemLocation: form.watch("address") || "",
                          inspectorName: form.watch("inspector") || "",
                          inspectionDate: form.watch("date") || new Date().toISOString().split('T')[0]
                        }}
                        formTitle="Inspeção de Sistemas de Hidrantes e Mangueiras"
                        signatures={{
                          inspectorName: inspectorName || form.watch("inspector") || "",
                          inspectorDate: inspectorDate || form.watch("date") || new Date().toISOString().split('T')[0],
                          inspectorSignature: inspectorSignature || undefined,
                          clientName: clientName,
                          clientDate: clientDate || form.watch("date") || new Date().toISOString().split('T')[0],
                          clientSignature: clientSignature || undefined
                        }}
                        onValidateForm={() => {
                          const values = form.getValues();
                          const errors: string[] = [];
                          
                          if (!values.propertyName) errors.push("Nome da Propriedade é obrigatório");
                          if (!values.address) errors.push("Endereço da Propriedade é obrigatório");
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