import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, ArrowRight, CheckCircle, Save, Settings, Thermometer, Zap, Fuel, PenTool } from "lucide-react";
import { FormActions } from "@/components/form-actions";
import { SignaturePad } from "@/components/signature-pad";
import { FinalizeInspectionButton } from "@/components/inspection/finalize-inspection-button";
// TODO: Create these components
// import { PumpPicker } from "@/components/pumps/PumpPicker";
// import { PumpRegistryModal } from "@/components/pumps/PumpRegistryModal";
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

export default function WeeklyPumpForm() {
  const [currentSection, setCurrentSection] = useState("general");
  const [selectedPump, setSelectedPump] = useState<FirePump|undefined>();
  const [companyId, setCompanyId] = useState<string>(""); // TODO: recupere do contexto/seleção da empresa
  
  const form = useForm<FormData>({
    defaultValues: {
      propertyName: "",
      propertyAddress: "",
      propertyPhone: "",
      inspector: "",
      contractNumber: "",
      date: "",
      frequency: "semanal", // Automaticamente definido como semanal
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
    { id: "pumphouse", title: "Casa de Bombas", icon: "🏠" },
    { id: "pumpsystems", title: "Sistemas de Bomba", icon: "⚙️" },
    { id: "electrical", title: "Sistemas Elétricos", icon: "⚡" },
    { id: "diesel", title: "Sistemas Motor Diesel", icon: "🚛" },
    { id: "steam", title: "Sistema a Vapor", icon: "💨" },
    { id: "exhaust", title: "Sistema de Exaustão", icon: "🌪️" },
    { id: "tests", title: "Testes Operacionais", icon: "🧪" },
    { id: "signatures", title: "Assinaturas", icon: "✍️" },
  ];

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data);
  };

  const renderRadioGroup = (name: string, label: string, includeField = false, fieldType = "text", fieldLabel = "") => (
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
              <FormLabel className="text-xs text-muted-foreground">{fieldLabel}:</FormLabel>
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
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="title-weekly-pump-form">
              Inspeção Semanal de Bombas de Incêndio
            </h1>
            <p className="text-muted-foreground">
              Formulário NFPA 25 - Versão Integral (Páginas 72-75)
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

            {/* Weekly Info */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <Settings className="mr-2 w-4 h-4 text-orange-600" />
                  Inspeção Semanal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="text-muted-foreground">
                  Inclui inspeção visual e testes operacionais semanais
                </div>
                <div className="text-orange-600">
                  Operação por 10 min (30 min diesel)
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
                        {/* Pump Selection - TODO: Uncomment when components are created */}
                        {/* 
                        <div className="mb-4 flex items-center gap-3">
                          <PumpPicker companyId={companyId} value={selectedPump} onChange={(p)=>setSelectedPump(p)} />
                          <PumpRegistryModal companyId={companyId} onCreated={(p)=>setSelectedPump(p)} triggerLabel="Cadastrar Bomba" />
                        </div>
                        */}
                        
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
                      </div>
                    )}

                    {/* Pump House */}
                    {currentSection === "pumphouse" && (
                      <div className="space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                          <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center">
                            <Thermometer className="mr-2 w-4 h-4" />
                            Casa de Bombas - Condições Ambientais
                          </h3>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Verificações das condições ambientais e segurança da casa de bombas
                          </p>
                        </div>

                        <div className="space-y-6">
                          {renderRadioGroup(
                            "pumphouse_heat_40f",
                            "O calor na casa de bombas é de 40°F (4°C) ou superior?"
                          )}
                          {renderRadioGroup(
                            "pumphouse_ventilation_grilles",
                            "As venezianas de ventilação estão livres para operar?"
                          )}
                          {renderRadioGroup(
                            "pumphouse_excessive_water",
                            "Água excessiva não aparece no chão?"
                          )}
                          {renderRadioGroup(
                            "pumphouse_coupling_protection",
                            "A proteção do acoplamento está no lugar?"
                          )}
                          {renderRadioGroup(
                            "pumphouse_heat_70f_diesel",
                            "O calor na casa de bombas não é inferior a 70°F (21°C) para bomba com motor a diesel sem aquecedor de motor?"
                          )}
                        </div>
                      </div>
                    )}

                    {/* Pump Systems */}
                    {currentSection === "pumpsystems" && (
                      <div className="space-y-6">
                        <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                          <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">Sistemas de Bomba</h3>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            Verificações das válvulas, tubulações e pressões do sistema
                          </p>
                        </div>

                        <div className="space-y-6">
                          {renderRadioGroup(
                            "pump_valves_open",
                            "As válvulas de sucção, descarga e bypass da bomba estão abertas?"
                          )}
                          {renderRadioGroup(
                            "pump_no_leaks",
                            "Nenhuma tubulação ou mangueira vaza?"
                          )}
                          {renderRadioGroup(
                            "pump_seal_leak",
                            "A bomba de incêndio vaza uma gota de água por segundo nas vedações?"
                          )}
                          {renderRadioGroup(
                            "pump_suction_pressure",
                            "A pressão da linha de sucção está dentro da faixa aceitável?"
                          )}
                          {renderRadioGroup(
                            "pump_system_pressure",
                            "A pressão da linha do sistema está dentro da faixa aceitável?"
                          )}
                          {renderRadioGroup(
                            "pump_suction_reservoir",
                            "O reservatório de sucção está cheio?"
                          )}
                          {renderRadioGroup(
                            "pump_wet_pit_screens",
                            "As telas de sucção do poço úmido (wet pit) estão desobstruídas e no lugar?"
                          )}
                          {renderRadioGroup(
                            "pump_test_valves",
                            "As válvulas de teste de fluxo de água estão na posição fechada, a válvula de conexão da mangueira está fechada e a linha para as válvulas de teste está livre de água?"
                          )}
                        </div>
                      </div>
                    )}

                    {/* Electrical Systems */}
                    {currentSection === "electrical" && (
                      <div className="space-y-6">
                        <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2 flex items-center">
                            <Zap className="mr-2 w-4 h-4" />
                            Sistemas Elétricos
                          </h3>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            Verificações de controles elétricos, indicadores e alimentação
                          </p>
                        </div>

                        <div className="space-y-6">
                          {renderRadioGroup(
                            "electrical_controller_pilot",
                            "A luz piloto do controlador (energia ligada) está iluminada?"
                          )}
                          {renderRadioGroup(
                            "electrical_normal_power",
                            "A luz de energia normal da chave de transferência está iluminada?"
                          )}
                          {renderRadioGroup(
                            "electrical_isolation_switch",
                            "O interruptor de isolamento para energia de emergência (standby) está fechado?"
                          )}
                          {renderRadioGroup(
                            "electrical_reverse_phase_alarm",
                            "A luz de alarme de fase reversa não está iluminada?"
                          )}
                          {renderRadioGroup(
                            "electrical_normal_phase_rotation",
                            "A luz de rotação de fase normal está iluminada?"
                          )}
                          {renderRadioGroup(
                            "electrical_vertical_motor_oil",
                            "O nível de óleo no visor de vidro do motor vertical está dentro da faixa aceitável?"
                          )}
                          {renderRadioGroup(
                            "electrical_jockey_pump_power",
                            "A bomba de manutenção de pressão (jockey) tem energia?"
                          )}
                        </div>
                      </div>
                    )}

                    {/* Diesel Systems */}
                    {currentSection === "diesel" && (
                      <div className="space-y-6">
                        <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                          <h3 className="font-medium text-orange-800 dark:text-orange-200 mb-2 flex items-center">
                            <Fuel className="mr-2 w-4 h-4" />
                            Sistemas de Motor a Diesel
                          </h3>
                          <p className="text-sm text-orange-700 dark:text-orange-300">
                            Verificações específicas para bombas com motor a diesel
                          </p>
                        </div>

                        <div className="space-y-6">
                          {renderRadioGroup(
                            "diesel_fuel_tank",
                            "O tanque de combustível diesel está pelo menos dois terços cheio?"
                          )}
                          {renderRadioGroup(
                            "diesel_controller_auto",
                            "A chave seletora do controlador está na posição \"Auto\"?"
                          )}
                          {renderRadioGroup(
                            "diesel_battery_voltage",
                            "As leituras de tensão das baterias (2) estão dentro da faixa aceitável?"
                          )}
                          {renderRadioGroup(
                            "diesel_battery_current",
                            "As leituras de corrente de carga estão dentro da faixa aceitável para as baterias?"
                          )}
                          {renderRadioGroup(
                            "diesel_battery_pilots",
                            "As luzes piloto para as baterias estão \"ligadas\" ou as luzes piloto de falha da bateria estão \"desligadas\"?"
                          )}
                          {renderRadioGroup(
                            "diesel_alarm_lights",
                            "Todas as luzes piloto de alarme estão \"desligadas\"?"
                          )}
                          {renderRadioGroup(
                            "diesel_engine_hours",
                            "Registrar o tempo de funcionamento do motor a partir do medidor",
                            true,
                            "number",
                            "Horas de operação"
                          )}
                          {renderRadioGroup(
                            "diesel_angle_gear_oil",
                            "O nível de óleo na engrenagem de ângulo reto está dentro da faixa aceitável?"
                          )}
                          {renderRadioGroup(
                            "diesel_crankcase_oil",
                            "O nível de óleo do cárter está dentro da faixa aceitável?"
                          )}
                          {renderRadioGroup(
                            "diesel_coolant_level",
                            "O nível de água de arrefecimento está dentro da faixa aceitável?"
                          )}
                          {renderRadioGroup(
                            "diesel_electrolyte_level",
                            "O nível de eletrólito nas baterias está dentro da faixa aceitável?"
                          )}
                          {renderRadioGroup(
                            "diesel_battery_terminals",
                            "Os terminais da bateria estão livres de corrosão?"
                          )}
                          {renderRadioGroup(
                            "diesel_water_jacket_heater",
                            "O aquecedor de água da camisa (water-jacket) está operacional?"
                          )}
                        </div>
                      </div>
                    )}

                    {/* Steam Systems */}
                    {currentSection === "steam" && (
                      <div className="space-y-6">
                        <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                          <h3 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Sistema a Vapor</h3>
                          <p className="text-sm text-purple-700 dark:text-purple-300">
                            Verificações para bombas acionadas a vapor
                          </p>
                        </div>

                        <div className="space-y-6">
                          {renderRadioGroup(
                            "steam_pressure",
                            "Para bombas acionadas a vapor, a pressão do vapor está dentro da faixa aceitável?"
                          )}
                        </div>
                      </div>
                    )}

                    {/* Exhaust Systems */}
                    {currentSection === "exhaust" && (
                      <div className="space-y-6">
                        <div className="bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
                          <h3 className="font-medium text-indigo-800 dark:text-indigo-200 mb-2">Sistema de Exaustão</h3>
                          <p className="text-sm text-indigo-700 dark:text-indigo-300">
                            Verificações do sistema de exaustão (Alternativa ITM A.8.1.1.2)
                          </p>
                        </div>

                        <div className="space-y-6">
                          {renderRadioGroup(
                            "exhaust_leaks",
                            "Examinar o sistema de exaustão quanto a vazamentos (Alternativa ITM A.8.1.1.2)?"
                          )}
                          {renderRadioGroup(
                            "exhaust_condensate_drain",
                            "Drenar o coletor de condensado (Alternativa ITM A.8.1.1.2)?"
                          )}
                        </div>
                      </div>
                    )}

                    {/* Operational Tests */}
                    {currentSection === "tests" && (
                      <div className="space-y-6">
                        <div className="bg-teal-50 dark:bg-teal-950/20 p-4 rounded-lg border border-teal-200 dark:border-teal-800">
                          <h3 className="font-medium text-teal-800 dark:text-teal-200 mb-2">Testes Operacionais Semanais</h3>
                          <p className="text-sm text-teal-700 dark:text-teal-300">
                            Testes operacionais conforme páginas 74-75 da NFPA 25
                          </p>
                        </div>

                        <div className="space-y-6">
                          <h4 className="font-medium text-foreground border-b pb-2">Sistemas de Bomba - Testes</h4>
                          {renderRadioGroup(
                            "test_pump_start_pressure",
                            "Registrar a pressão de partida da bomba",
                            true,
                            "number",
                            "Pressão (psi)"
                          )}
                          {renderRadioGroup(
                            "test_pump_operation",
                            "Operar a bomba de incêndio por 10 minutos (30 minutos para diesel)"
                          )}
                          {renderRadioGroup(
                            "test_packing_adjustment",
                            "Verificar o aperto da gaxeta (leve vazamento sem fluxo)"
                          )}
                          {renderRadioGroup(
                            "test_suction_pressure_reading",
                            "Registrar a pressão de sucção do manômetro",
                            true,
                            "number",
                            "Pressão de sucção (psi)"
                          )}
                          {renderRadioGroup(
                            "test_discharge_pressure_reading",
                            "Registrar a pressão de descarga do manômetro",
                            true,
                            "number",
                            "Pressão de descarga (psi)"
                          )}
                          {renderRadioGroup(
                            "test_adjust_packing_nuts",
                            "Ajustar as porcas da gaxeta se necessário"
                          )}
                          {renderRadioGroup(
                            "test_noise_vibration",
                            "Verificar ruído ou vibração incomum"
                          )}
                          {renderRadioGroup(
                            "test_overheating",
                            "Verificar superaquecimento das caixas de gaxetas, rolamentos ou carcaça da bomba"
                          )}
                          {renderRadioGroup(
                            "test_pressure_switch",
                            "Registrar o pressostato ou transdutor de pressão e comparar com o manômetro de descarga da bomba"
                          )}
                          {renderRadioGroup(
                            "test_pressure_range",
                            "Registrar a pressão mais alta e mais baixa da bomba no registro de controle",
                            true,
                            "text",
                            "Pressão alta/baixa (psi)"
                          )}
                          {renderRadioGroup(
                            "test_circulation_relief_valve",
                            "A válvula de alívio de circulação funciona corretamente"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Sistemas Elétricos - Testes</h4>
                          {renderRadioGroup(
                            "test_controller_first_step",
                            "Registrar o tempo em que o controlador está no primeiro degrau (para partida com tensão reduzida ou corrente reduzida)",
                            true,
                            "number",
                            "Tempo (segundos)"
                          )}
                          {renderRadioGroup(
                            "test_motor_acceleration_time",
                            "Observar o tempo para o motor acelerar até a velocidade máxima",
                            true,
                            "number",
                            "Tempo (segundos)"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Sistemas Diesel - Testes</h4>
                          {renderRadioGroup(
                            "test_diesel_crank_time",
                            "Registrar o tempo para o motor a diesel dar a partida (crank)",
                            true,
                            "number",
                            "Tempo (segundos)"
                          )}
                          {renderRadioGroup(
                            "test_diesel_operating_speed",
                            "Registrar o tempo para o motor a diesel atingir a velocidade de operação"
                          )}
                          {renderRadioGroup(
                            "test_diesel_gauges",
                            "Verificar o manômetro de pressão do óleo, indicador de velocidade e temperaturas da água e do óleo enquanto o motor está funcionando"
                          )}
                          {renderRadioGroup(
                            "test_heat_exchanger",
                            "Verificar o trocador de calor quanto ao fluxo de água de resfriamento"
                          )}
                          {renderRadioGroup(
                            "test_speed_governor",
                            "Operar o regulador de velocidade (governador) (apenas motor de combustão interna)"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Sistema a Vapor - Testes</h4>
                          {renderRadioGroup(
                            "test_steam_turbine_speed",
                            "Observar o tempo para a turbina atingir a velocidade de operação",
                            true,
                            "number",
                            "Tempo (segundos)"
                          )}
                          {renderRadioGroup(
                            "test_steam_pressure_reading",
                            "Registrar a pressão do vapor para bombas operadas a vapor",
                            true,
                            "number",
                            "Pressão do vapor (psi)"
                          )}
                          {renderRadioGroup(
                            "test_steam_trap",
                            "Verificar o purgador de vapor"
                          )}
                          {renderRadioGroup(
                            "test_steam_relief_valve",
                            "Verificar a válvula de alívio de vapor"
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
                        formTitle="Inspeção Semanal de Bomba de Incêndio"
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