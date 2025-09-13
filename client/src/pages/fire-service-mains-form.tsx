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

export default function FireServiceMainsForm() {
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
    { id: "weekly", title: "Inspeções Semanais", icon: "📊" },
    { id: "monthly", title: "Inspeções Mensais", icon: "📈" },
    { id: "quarterly", title: "Inspeções Trimestrais", icon: "🔍" },
    { id: "semiannual", title: "Inspeções Semestrais", icon: "📅" },
    { id: "annual", title: "Inspeções Anuais", icon: "📋" },
    { id: "fiveyears", title: "Inspeções 5 Anos", icon: "🧪" },
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
  const frequencyInfo = useFrequencyInfo(selectedFrequency);

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
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground mb-2" data-testid="title-fire-service-mains-form">
              Redes Principais de Serviço de Incêndio Privadas
            </h1>
            <p className="text-muted-foreground">
              Formulário de inspeção conforme NFPA 25 - Redes de Serviço Privadas
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
                                  <SelectItem value="semanal">Semanal</SelectItem>
                                  <SelectItem value="mensal">Mensal</SelectItem>
                                  <SelectItem value="trimestral">Trimestral</SelectItem>
                                  <SelectItem value="semestral">Semestral</SelectItem>
                                  <SelectItem value="anual">Anual</SelectItem>
                                  <SelectItem value="5anos">5 Anos</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Weekly Inspections */}
                    {managedCurrentSection === "weekly" && isSectionVisible("weekly") && (
                      <div className="space-y-6">
                        <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                          <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">Inspeções Semanais</h3>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            Verificações semanais de válvulas de controle e fluxo de retorno
                          </p>
                        </div>

                        <div className="space-y-6">
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
                            "PIVs com chaves corretas?"
                          )}
                          {renderRadioGroup(
                            "weekly_no_damage",
                            "Livre de danos ou vazamentos?"
                          )}
                          {renderRadioGroup(
                            "weekly_proper_signage",
                            "Sinalização adequada?"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Fluxo de Retorno (Backflow)</h4>
                          {renderRadioGroup(
                            "weekly_isolation_valves",
                            "Válvulas de isolamento abertas e supervisionadas?"
                          )}
                          {renderRadioGroup(
                            "weekly_rpa_rpda",
                            "RPA e RPDA operando corretamente?"
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
                            "Na posição correta?"
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
                            "PIVs com chaves corretas?"
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
                            Verificações trimestrais de conexões do corpo de bombeiros e casas de mangueira
                          </p>
                        </div>

                        <div className="space-y-6">
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
                            "Tampões/tampas no lugar?"
                          )}
                          {renderRadioGroup(
                            "quarterly_fdc_gaskets",
                            "Juntas não danificadas?"
                          )}
                          {renderRadioGroup(
                            "quarterly_drain_valve",
                            "Válvula de dreno automática no lugar e operando?"
                          )}
                          {renderRadioGroup(
                            "quarterly_identification_signs",
                            "Sinais de identificação no lugar?"
                          )}
                          {renderRadioGroup(
                            "quarterly_interior_clear",
                            "Interior livre de obstruções?"
                          )}
                          {renderRadioGroup(
                            "quarterly_clapper_operation",
                            "Portinhola (clapper) opera corretamente?"
                          )}
                          {renderRadioGroup(
                            "quarterly_check_valve",
                            "Válvula de retenção não vaza?"
                          )}
                          {renderRadioGroup(
                            "quarterly_piping_undamaged",
                            "Tubulação visível não danificada?"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Casas de Mangueira</h4>
                          {renderRadioGroup(
                            "quarterly_hose_house_accessible",
                            "Acessível?"
                          )}
                          {renderRadioGroup(
                            "quarterly_hose_house_no_damage",
                            "Livre de danos ou vazamentos?"
                          )}
                          {renderRadioGroup(
                            "quarterly_hose_house_equipment",
                            "Sem equipamentos faltando?"
                          )}
                        </div>
                      </div>
                    )}

                    {/* Semiannual Inspections */}
                    {managedCurrentSection === "semiannual" && isSectionVisible("semiannual") && (
                      <div className="space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                          <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Inspeções Semestrais</h3>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Verificações semestrais de bicos monitores
                          </p>
                        </div>

                        <div className="space-y-6">
                          <h4 className="font-medium text-foreground border-b pb-2">Bicos Monitores (Monitor Nozzles)</h4>
                          {renderRadioGroup(
                            "semiannual_monitors_not_leaking",
                            "Não vazando?"
                          )}
                          {renderRadioGroup(
                            "semiannual_monitors_no_damage",
                            "Livre de danos?"
                          )}
                          {renderRadioGroup(
                            "semiannual_monitors_no_corrosion",
                            "Livre de corrosão?"
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
                            Inspeções anuais abrangentes de hidrantes, filtros e tubulações
                          </p>
                        </div>

                        <div className="space-y-6">
                          <h4 className="font-medium text-foreground border-b pb-2">Hidrantes (Tipo Seco e de Parede)</h4>
                          {renderRadioGroup(
                            "annual_dry_hydrant_accessible",
                            "Acessível?"
                          )}
                          {renderRadioGroup(
                            "annual_dry_barrel_clear",
                            "Barril livre de água e gelo?"
                          )}
                          {renderRadioGroup(
                            "annual_dry_barrel_drains",
                            "Barril drena corretamente?"
                          )}
                          {renderRadioGroup(
                            "annual_dry_not_leaking",
                            "Não vazando?"
                          )}
                          {renderRadioGroup(
                            "annual_dry_barrel_no_cracks",
                            "Barril livre de rachaduras?"
                          )}
                          {renderRadioGroup(
                            "annual_dry_outlets_lubricated",
                            "Saídas não excessivamente apertadas e lubrificadas?"
                          )}
                          {renderRadioGroup(
                            "annual_dry_nozzle_threads",
                            "Roscas do bocal não gastas?"
                          )}
                          {renderRadioGroup(
                            "annual_dry_operating_nut",
                            "Porca de operação não gasta?"
                          )}
                          {renderRadioGroup(
                            "annual_dry_operating_key",
                            "Chave de operação disponível?"
                          )}
                          {renderRadioGroup(
                            "annual_dry_no_corrosion",
                            "Livre de corrosão prejudicial?"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Hidrantes (Tipo Molhado)</h4>
                          {renderRadioGroup(
                            "annual_wet_hydrant_accessible",
                            "Acessível?"
                          )}
                          {renderRadioGroup(
                            "annual_wet_not_leaking",
                            "Não vazando?"
                          )}
                          {renderRadioGroup(
                            "annual_wet_barrel_no_cracks",
                            "Barril livre de rachaduras?"
                          )}
                          {renderRadioGroup(
                            "annual_wet_outlets_lubricated",
                            "Saídas não excessivamente apertadas e lubrificadas?"
                          )}
                          {renderRadioGroup(
                            "annual_wet_nozzle_threads",
                            "Roscas do bocal não gastas?"
                          )}
                          {renderRadioGroup(
                            "annual_wet_operating_nut",
                            "Porca de operação não gasta?"
                          )}
                          {renderRadioGroup(
                            "annual_wet_operating_key",
                            "Chave de operação disponível?"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Filtros da Linha Principal</h4>
                          {renderRadioGroup(
                            "annual_strainers_not_clogged",
                            "Não entupidos ou sujos?"
                          )}
                          {renderRadioGroup(
                            "annual_strainers_no_corrosion",
                            "Livre de corrosão?"
                          )}
                          {renderRadioGroup(
                            "annual_strainers_no_damage",
                            "Sem peças danificadas?"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Tubulação e Conexões (expostas)</h4>
                          {renderRadioGroup(
                            "annual_piping_not_leaking",
                            "Não vazando?"
                          )}
                          {renderRadioGroup(
                            "annual_piping_no_damage_corrosion",
                            "Livre de danos e corrosão?"
                          )}
                          {renderRadioGroup(
                            "annual_supports_intact",
                            "Suportes intactos e não danificados?"
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
                            Inspeções e testes especializados a cada 5 anos
                          </p>
                        </div>

                        <div className="space-y-6">
                          <h4 className="font-medium text-foreground border-b pb-2">Fluxo de Retorno (Backflow)</h4>
                          {renderRadioGroup(
                            "fiveyears_backflow_internal",
                            "Inspeção interna?"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Válvula de Retenção</h4>
                          {renderRadioGroup(
                            "fiveyears_check_valve_interior",
                            "O interior se move livremente e em boas condições?"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Teste de Fluxo de Retorno</h4>
                          {renderRadioGroup(
                            "fiveyears_backflow_flow_test",
                            "Teste de fluxo direto na taxa mínima de demanda do sistema?"
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
                        
                        {visibleSections.findIndex(s => s.id === managedCurrentSection) < visibleSections.length - 1 ? (
                          <Button
                            type="button"
                            onClick={() => {
                              const currentIndex = visibleSections.findIndex(s => s.id === managedCurrentSection);
                              setCurrentSection(visibleSections[currentIndex + 1].id);
                            }}
                            data-testid="button-next-section"
                          >
                            Próximo
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </Button>
                        ) : (
                          // Na seção de assinaturas, FormActions cuida do arquivamento
                          null
                        )}
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
                        formTitle="Inspeção de Redes Principais de Serviço de Incêndio"
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