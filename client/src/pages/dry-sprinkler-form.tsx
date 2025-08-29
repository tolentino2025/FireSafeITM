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
import { ArrowLeft, ArrowRight, CheckCircle, Save, AlertTriangle, Thermometer, Info, Eye, EyeOff } from "lucide-react";
import { FormActions } from "@/components/form-actions";
import { useFrequencyBasedSections, useFrequencyInfo } from "@/hooks/useFrequencyBasedSections";

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

export default function DrySprinklerForm() {
  const [currentSection, setCurrentSection] = useState("general");
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

  const allSections = [
    { id: "general", title: "Informações Gerais", icon: "📋" },
    { id: "weekly", title: "Inspeções Semanais", icon: "📊" },
    { id: "monthly", title: "Inspeções Mensais", icon: "📈" },
    { id: "quarterly", title: "Inspeções Trimestrais", icon: "🔍" },
    { id: "annual", title: "Inspeções Anuais", icon: "📋" },
    { id: "fiveyears", title: "Inspeções 5 Anos", icon: "🔬" },
    { id: "tests", title: "Testes Especializados", icon: "🧪" },
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
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="title-dry-sprinkler-form">
              Sistema de Sprinklers de Tubo Seco (Dry Pipe)
            </h1>
            <p className="text-muted-foreground">
              Inspeção, Teste e Manutenção conforme NFPA 25 - Versão Integral
            </p>
          </div>
          <div className="flex space-x-3">
            <Link href="/sprinkler-module">
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

            {/* System Type Info */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <Thermometer className="mr-2 w-4 h-4 text-blue-600" />
                  Sistema Tubo Seco
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="text-muted-foreground">
                  Sistema para áreas sujeitas a congelamento com ar pressurizado nas tubulações
                </div>
                <div className="text-blue-600">
                  Temperatura crítica: 4°C (40°F)
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
                                  <SelectItem value="semanal">Semanal</SelectItem>
                                  <SelectItem value="mensal">Mensal</SelectItem>
                                  <SelectItem value="trimestral">Trimestral</SelectItem>
                                  <SelectItem value="anual">Anual</SelectItem>
                                  <SelectItem value="3anos">3 Anos</SelectItem>
                                  <SelectItem value="5anos">5 Anos</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
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
                            Verificações semanais específicas para sistemas de tubo seco
                          </p>
                        </div>

                        <div className="space-y-6">
                          <h4 className="font-medium text-foreground border-b pb-2">Válvula de Tubo Seco</h4>
                          {renderRadioGroup(
                            "weekly_dry_valve_enclosure",
                            "O invólucro, onde equipado com alarme de baixa temperatura, é inspecionado durante o tempo frio para verificar uma temperatura mínima de 40°F (4°C)?"
                          )}

                          <div className="bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <p className="text-sm text-yellow-800 dark:text-yellow-300">
                              <strong>Nota:</strong> Este formulário compartilha muitas perguntas com o de Tubo Molhado. Incluir também todas as inspeções semanais do sistema wet pipe: Fluxo de Retorno, Dispositivo Regulador de Pressão Mestre e Válvulas de Controle.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Monthly Inspections */}
                    {managedCurrentSection === "monthly" && isSectionVisible("monthly") && (
                      <div className="space-y-6">
                        <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                          <h3 className="font-medium text-orange-800 dark:text-orange-200 mb-2">Inspeções Mensais</h3>
                          <p className="text-sm text-orange-700 dark:text-orange-300">
                            Verificações mensais específicas para sistemas de tubo seco
                          </p>
                        </div>

                        <div className="space-y-6">
                          <h4 className="font-medium text-foreground border-b pb-2">Manômetros (Sistema Tubo Seco)</h4>
                          {renderRadioGroup(
                            "monthly_system_side_gauge",
                            "O manômetro no lado do sistema da válvula seca lê a proporção adequada de ar ou nitrogênio (quando não supervisionado)?",
                            true,
                            "number"
                          )}
                          {renderRadioGroup(
                            "monthly_quick_opening_gauge",
                            "O manômetro no dispositivo de abertura rápida lê o mesmo que o manômetro do lado do sistema da válvula seca (quando não supervisionado)?",
                            true,
                            "number"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Válvulas de Tubo Seco</h4>
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

                          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                              <strong>Incluir também:</strong> Todas as inspeções mensais do sistema de tubo molhado (Manômetros gerais, Válvulas de Controle Travadas/Supervisionadas).
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quarterly Inspections */}
                    {managedCurrentSection === "quarterly" && isSectionVisible("quarterly") && (
                      <div className="space-y-6">
                        <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                          <h3 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Inspeções Trimestrais</h3>
                          <p className="text-sm text-purple-700 dark:text-purple-300">
                            Verificações trimestrais adicionais para sistemas de tubo seco
                          </p>
                        </div>

                        <div className="space-y-6">
                          <h4 className="font-medium text-foreground border-b pb-2">Manômetros (Supervisionados)</h4>
                          {renderRadioGroup(
                            "quarterly_supply_side_gauge",
                            "O manômetro no lado do suprimento da válvula seca lê normal?",
                            true,
                            "number"
                          )}
                          {renderRadioGroup(
                            "quarterly_system_side_supervised",
                            "O manômetro no lado do sistema da válvula seca lê a proporção adequada de ar ou nitrogênio quando supervisionado em um local constantemente atendido?",
                            true,
                            "number"
                          )}
                          {renderRadioGroup(
                            "quarterly_quick_opening_supervised",
                            "O manômetro no dispositivo de abertura rápida lê o mesmo que o manômetro do lado do sistema da válvula seca quando supervisionado em um local constantemente atendido?",
                            true,
                            "number"
                          )}

                          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                              <strong>Incluir também:</strong> Todas as inspeções trimestrais do sistema de tubo molhado.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Annual Inspections */}
                    {managedCurrentSection === "annual" && isSectionVisible("annual") && (
                      <div className="space-y-6">
                        <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                          <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">Inspeções Anuais</h3>
                          <p className="text-sm text-red-700 dark:text-red-300">
                            Inspeções anuais específicas para sistemas de tubo seco
                          </p>
                        </div>

                        <div className="space-y-6">
                          <h4 className="font-medium text-foreground border-b pb-2">Válvula de Tubo Seco</h4>
                          {renderRadioGroup(
                            "annual_dry_valve_internal",
                            "Inspeção interna após o teste de desarme?"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Edifício</h4>
                          {renderRadioGroup(
                            "annual_building_openings",
                            "Antes do início do tempo de congelamento, todas as aberturas estão fechadas e a tubulação cheia de água não está exposta a temperaturas de congelamento?"
                          )}

                          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                              <strong>Incluir também:</strong> Todas as inspeções anuais do sistema de tubo molhado (Placa Hidráulica, Sprinklers, Suportes, Tubulações, etc.).
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Five Years Inspections */}
                    {managedCurrentSection === "fiveyears" && isSectionVisible("fiveyears") && (
                      <div className="space-y-6">
                        <div className="bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
                          <h3 className="font-medium text-indigo-800 dark:text-indigo-200 mb-2">Inspeções Quinquenais</h3>
                          <p className="text-sm text-indigo-700 dark:text-indigo-300">
                            Inclui todas as inspeções quinquenais do sistema de tubo molhado
                          </p>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-sm text-blue-800 dark:text-blue-300">
                            <strong>Aplicável:</strong> Todas as inspeções quinquenais do sistema de tubo molhado (Válvula de Alarme, Válvula de Retenção, Inspeção de Obstrução, Fluxo de Retorno).
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Tests */}
                    {managedCurrentSection === "tests" && isSectionVisible("tests") && (
                      <div className="space-y-6">
                        <div className="bg-teal-50 dark:bg-teal-950/20 p-4 rounded-lg border border-teal-200 dark:border-teal-800">
                          <h3 className="font-medium text-teal-800 dark:text-teal-200 mb-2">Testes Específicos para Tubo Seco</h3>
                          <p className="text-sm text-teal-700 dark:text-teal-300">
                            Testes específicos além dos testes padrão do sistema de tubo molhado
                          </p>
                        </div>

                        <div className="space-y-6">
                          <h4 className="font-medium text-foreground border-b pb-2">Testes Trimestrais</h4>
                          {renderRadioGroup(
                            "test_quarterly_quick_opening",
                            "Dispositivo de abertura rápida testado - Trimestral"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Testes Anuais</h4>
                          {renderRadioGroup(
                            "test_annual_low_temp_alarm",
                            "Alarme de baixa temperatura (se instalado) no início da estação de aquecimento - Anual"
                          )}
                          {renderRadioGroup(
                            "test_annual_low_air_alarm",
                            "Alarme de ar baixo – teste conforme instruções do fabricante - Anual"
                          )}
                          {renderRadioGroup(
                            "test_annual_auto_air_maintenance",
                            "Dispositivo de manutenção automática de pressão de ar - Anual"
                          )}
                          {renderRadioGroup(
                            "test_annual_trip_partial",
                            "Teste de Desarme da Válvula de Tubo Seco (Fluxo Parcial) - Anual"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Testes Trienais</h4>
                          {renderRadioGroup(
                            "test_triennial_trip_full",
                            "Teste de Desarme da Válvula de Tubo Seco (Fluxo Total) - A cada 3 anos"
                          )}
                          {renderRadioGroup(
                            "test_triennial_leak_test",
                            "Sistema de tubo seco testado para vazamento - A cada 3 anos"
                          )}

                          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                              <strong>Incluir também:</strong> Todos os testes do sistema de tubo molhado aplicáveis ao sistema de tubo seco.
                            </p>
                          </div>
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
                          <Button type="submit" data-testid="button-submit-form">
                            <CheckCircle className="mr-2 w-4 h-4" />
                            Finalizar Inspeção
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Form Actions - Show only on last section */}
                    {visibleSections.findIndex(s => s.id === managedCurrentSection) === visibleSections.length - 1 && (
                      <FormActions
                        formData={form.getValues()}
                        formTitle="Inspeção de Sistema de Sprinklers Tubo Seco"
                        onValidateForm={() => {
                          const values = form.getValues();
                          return Boolean(values.propertyName && values.inspector && values.date && values.frequency);
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