import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, ArrowRight, CheckCircle, Save, Settings, Wrench, Fuel, Battery, Zap, PenTool } from "lucide-react";
import { FormActions } from "@/components/form-actions";
import { SignaturePad } from "@/components/signature-pad";
import { FinalizeInspectionButton } from "@/components/inspection/finalize-inspection-button";
import { PumpPicker } from "@/components/pumps/PumpPicker";
import { PumpRegistryModal } from "@/components/pumps/PumpRegistryModal";
import type { FirePump } from "@shared/schema";

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

export default function AnnualPumpForm() {
  const { user } = useAuth();
  const [currentSection, setCurrentSection] = useState("general");
  const [selectedPump, setSelectedPump] = useState<FirePump|undefined>();
  const companyId = user?.id || ""; // Usar o ID do usuário como companyId temporariamente
  
  const form = useForm<FormData>({
    defaultValues: {
      propertyName: "",
      propertyAddress: "",
      propertyPhone: "",
      inspector: "",
      contractNumber: "",
      date: "",
      frequency: "anual", // Automaticamente definido como anual
    },
  });
  
  // Estados para assinaturas digitais
  const [inspectorName, setInspectorName] = useState("");
  const [inspectorDate, setInspectorDate] = useState("");
  const [inspectorSignature, setInspectorSignature] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientDate, setClientDate] = useState("");
  const [clientSignature, setClientSignature] = useState<string | null>(null);

  const sections = [
    { id: "general", title: "Informações Gerais", icon: "📋" },
    { id: "quarterly", title: "Trimestral", icon: "📊" },
    { id: "semiannual", title: "Semestral", icon: "📈" },
    { id: "annual-pump", title: "Anual - Bomba Elétrica", icon: "⚡" },
    { id: "annual-transmission", title: "Anual - Transmissão", icon: "⚙️" },
    { id: "annual-electrical", title: "Anual - Sistema Elétrico", icon: "🔌" },
    { id: "annual-diesel", title: "Anual - Motor Diesel", icon: "🚛" },
    { id: "signatures", title: "Assinaturas", icon: "✍️" },
  ];

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data);
  };

  const renderRadioGroup = (name: string, label: string, includeAction = false) => (
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
      {includeAction && (
        <FormField
          control={form.control}
          name={`${name}_action`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">Ação realizada:</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="limpar">Limpar</SelectItem>
                  <SelectItem value="inspecionar">Inspecionar</SelectItem>
                  <SelectItem value="testar">Testar</SelectItem>
                  <SelectItem value="trocar">Trocar</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="title-annual-pump-form">
              Inspeção Trimestral, Semestral e Anual da Bomba de Incêndio
            </h1>
            <p className="text-muted-foreground">
              Formulário NFPA 25 - Versão Integral (Páginas 78-82)
            </p>
          </div>
          <div className="flex space-x-3">
            <Link href="/pump-module">
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
              </CardHeader>
              <CardContent className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setCurrentSection(section.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      currentSection === section.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                    }`}
                    data-testid={`nav-${section.id}`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{section.icon}</span>
                      <span className="text-sm font-medium">{section.title}</span>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Frequency Info */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <Settings className="mr-2 w-4 h-4 text-red-600" />
                  Múltiplas Frequências
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="text-muted-foreground">
                  Este formulário combina inspeções trimestrais, semestrais e anuais
                </div>
                <div className="text-red-600">
                  Ação deve ser especificada: Limpar, Inspecionar, Testar, Trocar
                </div>
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
                      {sections.find(s => s.id === currentSection)?.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    
                    {/* General Information */}
                    {currentSection === "general" && (
                      <div className="space-y-4">
                        {/* Pump Selection */}
                        <div className="mb-4 flex items-center gap-3">
                          <PumpPicker companyId={companyId} value={selectedPump} onChange={(p)=>setSelectedPump(p)} />
                          <PumpRegistryModal companyId={companyId} onCreated={(p)=>setSelectedPump(p)} triggerLabel="Cadastrar Bomba" />
                        </div>
                        
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
                              <FormLabel>Frequência da Inspeção</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-frequency">
                                    <SelectValue placeholder="Selecione a frequência" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="trimestral">Trimestral</SelectItem>
                                  <SelectItem value="semestral">Semestral</SelectItem>
                                  <SelectItem value="anual">Anual</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Quarterly */}
                    {currentSection === "quarterly" && (
                      <div className="space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                          <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center">
                            <Wrench className="mr-2 w-4 h-4" />
                            Inspeções Trimestrais
                          </h3>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Manutenções trimestrais do sistema de motor a diesel
                          </p>
                        </div>

                        <div className="space-y-6">
                          <h4 className="font-medium text-foreground border-b pb-2">Sistema de Motor a Diesel - Trimestral</h4>
                          {renderRadioGroup(
                            "quarterly_fuel_filter",
                            "Limpar filtro de combustível, perna de sujeira (dirt leg) ou combinação",
                            true
                          )}
                          {renderRadioGroup(
                            "quarterly_crankcase_breather",
                            "Inspecionar/Trocar/Testar o respiro do cárter",
                            true
                          )}
                          {renderRadioGroup(
                            "quarterly_cooling_water_filter",
                            "Limpar o filtro de água do sistema de arrefecimento",
                            true
                          )}
                          {renderRadioGroup(
                            "quarterly_exhaust_insulation",
                            "Inspecionar o sistema de exaustão quanto a isolamento e riscos de incêndio",
                            true
                          )}
                          {renderRadioGroup(
                            "quarterly_battery_terminals",
                            "Inspecionar os terminais da bateria, limpos e apertados",
                            true
                          )}
                          {renderRadioGroup(
                            "quarterly_wire_friction",
                            "Inspecionar o atrito de fios onde sujeitos a movimento",
                            true
                          )}
                        </div>
                      </div>
                    )}

                    {/* Semi-Annual */}
                    {currentSection === "semiannual" && (
                      <div className="space-y-6">
                        <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                          <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">Inspeções Semestrais</h3>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            Manutenções semestrais dos sistemas elétricos e diesel
                          </p>
                        </div>

                        <div className="space-y-6">
                          <h4 className="font-medium text-foreground border-b pb-2">Sistema de Bomba Elétrica - Semestral</h4>
                          {renderRadioGroup(
                            "semiannual_emergency_manual_start",
                            "Testar os meios de partida manual de emergência",
                            true
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Sistema de Motor a Diesel - Semestral</h4>
                          {renderRadioGroup(
                            "semiannual_antifreeze_protection",
                            "Testar o nível de proteção anticongelante",
                            true
                          )}
                          {renderRadioGroup(
                            "semiannual_flexible_exhaust",
                            "Inspecionar a seção flexível do escapamento",
                            true
                          )}
                          {renderRadioGroup(
                            "semiannual_safety_alarms",
                            "Inspecionar/Testar a operação de seguranças e alarmes",
                            true
                          )}
                          {renderRadioGroup(
                            "semiannual_clean_enclosures",
                            "Limpar caixas, painéis e gabinetes",
                            true
                          )}
                        </div>
                      </div>
                    )}

                    {/* Annual - Pump Electric */}
                    {currentSection === "annual-pump" && (
                      <div className="space-y-6">
                        <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2 flex items-center">
                            <Zap className="mr-2 w-4 h-4" />
                            Sistema de Bomba Elétrica - Anual
                          </h3>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            Manutenções anuais específicas para bombas elétricas
                          </p>
                        </div>

                        <div className="space-y-6">
                          {renderRadioGroup(
                            "annual_inspect_replace_bearings",
                            "Inspecionar/Trocar rolamentos",
                            true
                          )}
                          {renderRadioGroup(
                            "annual_test_transfer_switch",
                            "Testar a chave de transferência de energia",
                            true
                          )}
                          {renderRadioGroup(
                            "annual_parallel_angular_alignment",
                            "Inspecionar o alinhamento paralelo e angular",
                            true
                          )}
                          {renderRadioGroup(
                            "annual_test_main_relief_valve",
                            "Testar a válvula de alívio principal",
                            true
                          )}
                          {renderRadioGroup(
                            "annual_inspect_hoses_flexible",
                            "Inspecionar mangueiras e conexões flexíveis",
                            true
                          )}
                          {renderRadioGroup(
                            "annual_inspect_plumbing_parts",
                            "Inspecionar peças de encanamento - dentro e fora dos painéis",
                            true
                          )}
                          {renderRadioGroup(
                            "annual_axial_shaft_clearance",
                            "Inspecionar a folga axial do eixo da bomba",
                            true
                          )}
                          {renderRadioGroup(
                            "annual_gauge_sensor_accuracy",
                            "Inspecionar/Trocar a precisão dos manômetros e sensores",
                            true
                          )}
                          {renderRadioGroup(
                            "annual_pump_coupling_alignment",
                            "Inspecionar o alinhamento do acoplamento da bomba",
                            true
                          )}
                        </div>
                      </div>
                    )}

                    {/* Annual - Transmission */}
                    {currentSection === "annual-transmission" && (
                      <div className="space-y-6">
                        <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                          <h3 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Transmissão Mecânica - Anual</h3>
                          <p className="text-sm text-purple-700 dark:text-purple-300">
                            Manutenção anual de componentes de transmissão mecânica
                          </p>
                        </div>

                        <div className="space-y-6">
                          {renderRadioGroup(
                            "annual_coupling_lubrication",
                            "Trocar a lubrificação do acoplamento",
                            true
                          )}
                          {renderRadioGroup(
                            "annual_right_angle_gear_lube",
                            "Trocar a lubrificação da engrenagem de ângulo reto",
                            true
                          )}
                        </div>
                      </div>
                    )}

                    {/* Annual - Electrical System */}
                    {currentSection === "annual-electrical" && (
                      <div className="space-y-6">
                        <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                          <h3 className="font-medium text-orange-800 dark:text-orange-200 mb-2 flex items-center">
                            <Zap className="mr-2 w-4 h-4" />
                            Sistema Elétrico - Anual
                          </h3>
                          <p className="text-sm text-orange-700 dark:text-orange-300">
                            Manutenções anuais completas do sistema elétrico
                          </p>
                        </div>

                        <div className="space-y-6">
                          {renderRadioGroup(
                            "annual_pcb_corrosion",
                            "Inspecionar corrosão nas placas de circuito impresso",
                            true
                          )}
                          {renderRadioGroup(
                            "annual_cable_insulation",
                            "Inspecionar isolamento de cabos/fios rachados",
                            true
                          )}
                          {renderRadioGroup(
                            "annual_test_ecm",
                            "Testar o módulo de controle eletrônico (ECM)",
                            true
                          )}
                          {renderRadioGroup(
                            "annual_sacrificial_anode",
                            "Manutenção do anodo sacrificial",
                            true
                          )}
                          {renderRadioGroup(
                            "annual_breaker_trip_test",
                            "Testar o desarme do disjuntor",
                            true
                          )}
                          {renderRadioGroup(
                            "annual_manual_emergency_start",
                            "Inspecionar/Testar os meios de partida manual de emergência",
                            true
                          )}
                          {renderRadioGroup(
                            "annual_mechanical_parts_lube",
                            "Inspecionar a lubrificação das peças mecânicas móveis",
                            true
                          )}
                          {renderRadioGroup(
                            "annual_pressure_switch_calibration",
                            "Inspecionar a calibração dos ajustes do pressostato",
                            true
                          )}
                          {renderRadioGroup(
                            "annual_motor_bearing_lubrication",
                            "Inspecionar a lubrificação dos rolamentos do motor",
                            true
                          )}
                          {renderRadioGroup(
                            "annual_plumbing_leaks",
                            "Inspecionar vazamentos nas peças de encanamento",
                            true
                          )}
                          {renderRadioGroup(
                            "annual_water_electrical_parts",
                            "Inspecionar sinais de água nas peças elétricas",
                            true
                          )}
                        </div>
                      </div>
                    )}

                    {/* Annual - Diesel System */}
                    {currentSection === "annual-diesel" && (
                      <div className="space-y-6">
                        <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                          <h3 className="font-medium text-red-800 dark:text-red-200 mb-2 flex items-center">
                            <Fuel className="mr-2 w-4 h-4" />
                            Sistema de Motor a Diesel - Anual
                          </h3>
                          <p className="text-sm text-red-700 dark:text-red-300">
                            Manutenções anuais completas do sistema diesel
                          </p>
                        </div>

                        <div className="space-y-6">
                          <h4 className="font-medium text-foreground border-b pb-2">Sistema de Combustível</h4>
                          {renderRadioGroup(
                            "annual_diesel_fuel_test",
                            "Testar o combustível diesel",
                            true
                          )}
                          {renderRadioGroup(
                            "annual_fuel_pump_alarms",
                            "Testar os sinais de alarme da bomba de combustível",
                            true
                          )}
                          {renderRadioGroup(
                            "annual_active_fuel_maintenance",
                            "Manutenção do sistema de manutenção de combustível ativo",
                            true
                          )}
                          {renderRadioGroup(
                            "annual_clean_fuel_filter_50h",
                            "Limpar o filtro de combustível a cada 50 horas de operação ou anualmente",
                            true
                          )}
                          {renderRadioGroup(
                            "annual_clean_tank_water",
                            "Limpar água/material estranho no tanque",
                            true
                          )}
                          {renderRadioGroup(
                            "annual_tank_openings_overflow",
                            "Inspecionar/Testar as aberturas do tanque e a tubulação de transbordamento desobstruídas",
                            true
                          )}
                          {renderRadioGroup(
                            "annual_fuel_tank_piping",
                            "Inspecionar a tubulação do tanque de combustível",
                            true
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Sistema de Lubrificação</h4>
                          {renderRadioGroup(
                            "annual_change_oil_50h",
                            "Trocar o óleo (máximo de 50 horas)",
                            true
                          )}
                          {renderRadioGroup(
                            "annual_change_oil_filters",
                            "Trocar o(s) filtro(s) de óleo (máximo de 50 horas)",
                            true
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Sistema de Arrefecimento</h4>
                          {renderRadioGroup(
                            "annual_circulating_water_filter",
                            "Manutenção do filtro de água circulante",
                            true
                          )}
                          {renderRadioGroup(
                            "annual_high_temp_supervision",
                            "Testar o sinal de supervisão para alta temperatura da água de arrefecimento",
                            true
                          )}
                          {renderRadioGroup(
                            "annual_inspect_antifreeze",
                            "Inspecionar o anticongelante",
                            true
                          )}
                          {renderRadioGroup(
                            "annual_clean_heat_exchanger",
                            "Limpar o trocador de calor",
                            true
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Sistema de Ventilação e Exaustão</h4>
                          {renderRadioGroup(
                            "annual_ducts_louvers",
                            "Inspecionar/Trocar dutos/venezianas",
                            true
                          )}
                          {renderRadioGroup(
                            "annual_exhaust_condensate",
                            "Inspecionar o sistema de exaustão e drenar o coletor de condensado",
                            true
                          )}
                          {renderRadioGroup(
                            "annual_excessive_backpressure",
                            "Testar a contrapressão excessiva",
                            true
                          )}
                          {renderRadioGroup(
                            "annual_supports_mounts",
                            "Inspecionar suportes e apoios em boas condições",
                            true
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Sistema de Bateria</h4>
                          {renderRadioGroup(
                            "annual_battery_specific_gravity",
                            "Manutenção da gravidade específica, estado de carga e taxas do carregador da bateria",
                            true
                          )}
                          {renderRadioGroup(
                            "annual_battery_terminals_clean",
                            "Manutenção dos terminais limpos",
                            true
                          )}
                          {renderRadioGroup(
                            "annual_battery_starting_voltage",
                            "Manutenção da tensão de partida da bateria",
                            true
                          )}
                          {renderRadioGroup(
                            "annual_distilled_water_only",
                            "Manutenção para garantir que apenas água destilada seja usada",
                            true
                          )}
                        </div>
                      </div>
                    )}

                    {/* Signatures Section */}
                    {currentSection === "signatures" && (
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
                        {sections.findIndex(s => s.id === currentSection) > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              const currentIndex = sections.findIndex(s => s.id === currentSection);
                              setCurrentSection(sections[currentIndex - 1].id);
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
                          const currentIndex = sections.findIndex(s => s.id === currentSection);
                          const isLastContentSection = currentIndex === sections.length - 2 && sections[sections.length - 1]?.id === "signatures";
                          const isOnSignatures = currentSection === "signatures";
                          
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
                          } else if (currentIndex < sections.length - 1) {
                            // Nas demais seções, mostra botão "Próximo"
                            return (
                              <Button
                                type="button"
                                onClick={() => {
                                  setCurrentSection(sections[currentIndex + 1].id);
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
                    {sections.findIndex(s => s.id === currentSection) === sections.length - 1 && (
                      <FormActions
                        formData={{ ...form.getValues(), selectedPump }}
                        formTitle="Inspeção Anual de Bomba de Incêndio"
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