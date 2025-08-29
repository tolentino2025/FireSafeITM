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
import { ArrowLeft, ArrowRight, CheckCircle, Save, Settings2, Wrench, FileCheck } from "lucide-react";
import { FormActions } from "@/components/form-actions";

type FormData = {
  propertyName: string;
  propertyAddress: string;
  date: string;
  newInstallation: string;
  modification: string;
  plansAccepted: string;
  plansAuthority: string;
  authorityAddress: string;
  installationCompliance: string;
  equipmentApproved: string;
  [key: string]: string;
};

export default function AboveGroundCertificateForm() {
  const [currentSection, setCurrentSection] = useState("general");
  const form = useForm<FormData>({
    defaultValues: {
      propertyName: "",
      propertyAddress: "",
      date: "",
      newInstallation: "",
      modification: "",
      plansAccepted: "",
      plansAuthority: "",
      authorityAddress: "",
      installationCompliance: "",
      equipmentApproved: "",
    },
  });

  const sections = [
    { id: "general", title: "Informações do Projeto", icon: "📋" },
    { id: "components", title: "Componentes do Sistema", icon: "⚙️" },
    { id: "tests", title: "Testes do Sistema", icon: "🧪" },
    { id: "hydraulic-pneumatic", title: "Testes Hidrostático/Pneumático", icon: "💧" },
    { id: "welding", title: "Soldagem e Certificação", icon: "🔥" },
  ];

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data);
  };

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
            </RadioGroup>
          </FormControl>
        </FormItem>
      )}
    />
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="title-above-ground-certificate-form">
              Certificado de Material e Teste para Tubulação Acima do Solo
            </h1>
            <p className="text-muted-foreground">
              NFPA 25 - Versão Integral (Páginas 67-69)
            </p>
          </div>
          <div className="flex space-x-3">
            <Link href="/certificates-module">
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

            {/* Info Card */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <Settings2 className="mr-2 w-4 h-4 text-blue-600" />
                  Certificado Acima do Solo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="text-muted-foreground">
                  Registro detalhado para instalações novas ou modificadas
                </div>
                <div className="text-blue-600">
                  Inclui componentes, testes e certificação de soldagem
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
                        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                          <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Informações do Projeto</h3>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Este formulário é um registro detalhado para instalações novas ou modificadas
                          </p>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {renderRadioGroup("newInstallation", "Nova instalação?")}
                          {renderRadioGroup("modification", "Modificação?")}
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-medium text-foreground border-b pb-2">Planos e Conformidade</h4>
                          
                          <FormField
                            control={form.control}
                            name="plansAuthority"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Planos aceitos pelas autoridades competentes (nomes)</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-plans-authority" />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="authorityAddress"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Endereço da Autoridade</FormLabel>
                                <FormControl>
                                  <Textarea {...field} data-testid="input-authority-address" />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          {renderRadioGroup("installationCompliance", "A instalação está em conformidade com os planos aceitos?")}
                          {renderRadioGroup("equipmentApproved", "O equipamento usado é aprovado?")}
                          
                          <FormField
                            control={form.control}
                            name="deviations_explanation"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Se não, explique os desvios</FormLabel>
                                <FormControl>
                                  <Textarea {...field} data-testid="textarea-deviations" />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-medium text-foreground border-b pb-2">Instruções</h4>
                          
                          {renderRadioGroup("person_instructed", "A pessoa responsável pelo equipamento de incêndio foi instruída sobre a localização das válvulas de controle e sobre o cuidado e manutenção deste novo equipamento?")}
                          {renderRadioGroup("documents_left", "Cópias dos seguintes documentos foram deixadas no local? (Instruções dos componentes do sistema, Instruções de cuidado e manutenção, NFPA 25)")}
                        </div>
                      </div>
                    )}

                    {/* Components */}
                    {currentSection === "components" && (
                      <div className="space-y-6">
                        <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                          <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">Componentes do Sistema</h3>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            Especificações detalhadas dos componentes instalados
                          </p>
                        </div>

                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="system_location"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Localização do sistema</FormLabel>
                                  <FormControl>
                                    <Input {...field} data-testid="input-system-location" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="buildings_supplied"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Prédios abastecidos</FormLabel>
                                  <FormControl>
                                    <Input {...field} data-testid="input-buildings-supplied" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="space-y-4">
                            <h4 className="font-medium text-foreground border-b pb-2">Sprinklers</h4>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <FormField
                                control={form.control}
                                name="sprinkler_manufacturer"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Fabricante</FormLabel>
                                    <FormControl>
                                      <Input {...field} data-testid="input-sprinkler-manufacturer" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="sprinkler_model"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Modelo</FormLabel>
                                    <FormControl>
                                      <Input {...field} data-testid="input-sprinkler-model" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="sprinkler_year"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Ano</FormLabel>
                                    <FormControl>
                                      <Input type="number" {...field} data-testid="input-sprinkler-year" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="sprinkler_quantity"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Quantidade</FormLabel>
                                    <FormControl>
                                      <Input type="number" {...field} data-testid="input-sprinkler-quantity" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="orifice_size"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Tamanho do Orifício</FormLabel>
                                    <FormControl>
                                      <Input {...field} data-testid="input-orifice-size" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="temperature_rating"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Classificação de Temperatura</FormLabel>
                                    <FormControl>
                                      <Input {...field} data-testid="input-temperature-rating" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="font-medium text-foreground border-b pb-2">Tubulação e Conexões</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="pipe_type"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Tipo de tubulação</FormLabel>
                                    <FormControl>
                                      <Input {...field} data-testid="input-pipe-type" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="connection_type"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Tipo de conexões</FormLabel>
                                    <FormControl>
                                      <Input {...field} data-testid="input-connection-type" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="font-medium text-foreground border-b pb-2">Válvulas</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <FormField
                                control={form.control}
                                name="alarm_valve_type"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Válvula de Alarme - Tipo</FormLabel>
                                    <FormControl>
                                      <Input {...field} data-testid="input-alarm-valve-type" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="alarm_valve_manufacturer"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Fabricante</FormLabel>
                                    <FormControl>
                                      <Input {...field} data-testid="input-alarm-valve-manufacturer" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="alarm_valve_model"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Modelo</FormLabel>
                                    <FormControl>
                                      <Input {...field} data-testid="input-alarm-valve-model" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <FormField
                                control={form.control}
                                name="dry_valve_manufacturer"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Válvula Seca - Fabricante</FormLabel>
                                    <FormControl>
                                      <Input {...field} data-testid="input-dry-valve-manufacturer" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="dry_valve_model"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Modelo</FormLabel>
                                    <FormControl>
                                      <Input {...field} data-testid="input-dry-valve-model" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="dry_valve_serial"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Nº de Série</FormLabel>
                                    <FormControl>
                                      <Input {...field} data-testid="input-dry-valve-serial" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <FormField
                                control={form.control}
                                name="qod_manufacturer"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Dispositivo Q.O.D. - Fabricante</FormLabel>
                                    <FormControl>
                                      <Input {...field} data-testid="input-qod-manufacturer" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="qod_model"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Modelo</FormLabel>
                                    <FormControl>
                                      <Input {...field} data-testid="input-qod-model" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="qod_serial"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Nº de Série</FormLabel>
                                    <FormControl>
                                      <Input {...field} data-testid="input-qod-serial" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* System Tests */}
                    {currentSection === "tests" && (
                      <div className="space-y-6">
                        <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Testes do Sistema</h3>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            Testes operacionais de válvulas secas e sistemas de dilúvio/pré-ação
                          </p>
                        </div>

                        <div className="space-y-6">
                          <div className="space-y-4">
                            <h4 className="font-medium text-foreground border-b pb-2">Teste de Operação da Válvula Seca</h4>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <FormField
                                control={form.control}
                                name="trip_time_test_connection"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Tempo para desarme através da conexão de teste (min/seg)</FormLabel>
                                    <FormControl>
                                      <Input {...field} data-testid="input-trip-time" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="water_pressure"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Pressão da água (psi)</FormLabel>
                                    <FormControl>
                                      <Input type="number" step="0.1" {...field} data-testid="input-water-pressure" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="air_pressure"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Pressão do ar (psi)</FormLabel>
                                    <FormControl>
                                      <Input type="number" step="0.1" {...field} data-testid="input-air-pressure" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="air_trip_point"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Ponto de desarme da pressão do ar (psi)</FormLabel>
                                    <FormControl>
                                      <Input type="number" step="0.1" {...field} data-testid="input-air-trip-point" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="water_time_test_outlet"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Tempo para a água chegar à saída de teste (min/seg)</FormLabel>
                                    <FormControl>
                                      <Input {...field} data-testid="input-water-time-outlet" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              {renderRadioGroup("alarm_operated_correctly", "Alarme operou corretamente?")}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="font-medium text-foreground border-b pb-2">Válvulas de Dilúvio e Pré-Ação</h4>
                            
                            <FormField
                              control={form.control}
                              name="valve_operation_type"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Operação (Pneumática, Elétrica, Hidráulica)</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger data-testid="select-valve-operation">
                                        <SelectValue placeholder="Selecionar tipo de operação" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="pneumatica">Pneumática</SelectItem>
                                      <SelectItem value="eletrica">Elétrica</SelectItem>
                                      <SelectItem value="hidraulica">Hidráulica</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {renderRadioGroup("piping_supervised", "A tubulação é supervisionada?")}
                              {renderRadioGroup("detection_media_supervised", "A mídia de detecção é supervisionada?")}
                              {renderRadioGroup("valve_operates_manual_remote", "A válvula opera a partir do desarme manual, remoto ou ambos os postos de controle?")}
                              {renderRadioGroup("accessible_installation_each_circuit", "Existe uma instalação acessível em cada circuito para teste?")}
                              {renderRadioGroup("each_circuit_supervision_alarm", "Cada circuito opera o alarme de perda de supervisão?")}
                              {renderRadioGroup("each_circuit_valve_release", "Cada circuito opera a liberação da válvula?")}
                            </div>

                            <FormField
                              control={form.control}
                              name="max_time_release_operation"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tempo máximo para operar a liberação (min/seg)</FormLabel>
                                  <FormControl>
                                    <Input {...field} data-testid="input-max-time-release" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Hydraulic/Pneumatic Tests */}
                    {currentSection === "hydraulic-pneumatic" && (
                      <div className="space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                          <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Descrição do Teste</h3>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Testes hidrostático, pneumático e de dreno
                          </p>
                        </div>

                        <div className="space-y-6">
                          <div className="space-y-4">
                            <h4 className="font-medium text-foreground border-b pb-2">Teste Hidrostático</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="hydrostatic_pressure"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Toda a tubulação foi testada hidrostaticamente a (psi)</FormLabel>
                                    <FormControl>
                                      <Input type="number" step="0.1" {...field} data-testid="input-hydrostatic-pressure" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="hydrostatic_hours"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Por (horas)</FormLabel>
                                    <FormControl>
                                      <Input type="number" step="0.1" {...field} data-testid="input-hydrostatic-hours" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="font-medium text-foreground border-b pb-2">Teste Pneumático</h4>
                            
                            {renderRadioGroup("pneumatic_dry_piping_tested", "A tubulação seca foi testada pneumaticamente?")}
                            {renderRadioGroup("equipment_operates_correctly", "O equipamento opera corretamente?")}
                            {renderRadioGroup("no_corrosive_additives", "Você certifica que aditivos e produtos químicos corrosivos... não foram usados para testar sistemas ou parar vazamentos?")}
                          </div>

                          <div className="space-y-4">
                            <h4 className="font-medium text-foreground border-b pb-2">Teste de Dreno</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="gauge_reading_test_connection"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Leitura do manômetro perto da conexão de teste de suprimento de água (psi)</FormLabel>
                                    <FormControl>
                                      <Input type="number" step="0.1" {...field} data-testid="input-gauge-reading" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="residual_pressure_valve_open"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Pressão residual com a válvula na conexão de teste totalmente aberta (psi)</FormLabel>
                                    <FormControl>
                                      <Input type="number" step="0.1" {...field} data-testid="input-residual-pressure" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Welding */}
                    {currentSection === "welding" && (
                      <div className="space-y-6">
                        <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                          <h3 className="font-medium text-red-800 dark:text-red-200 mb-2 flex items-center">
                            <Wrench className="mr-2 w-4 h-4" />
                            Soldagem e Assinaturas
                          </h3>
                          <p className="text-sm text-red-700 dark:text-red-300">
                            Certificação de soldagem e assinaturas dos responsáveis
                          </p>
                        </div>

                        <div className="space-y-6">
                          <div className="space-y-4">
                            <h4 className="font-medium text-foreground border-b pb-2">Soldagem</h4>
                            
                            {renderRadioGroup("welding_procedures_comply", "Você certifica que os procedimentos de soldagem, os soldadores e a qualidade da solda atendem aos requisitos da AWS e ASME?")}
                          </div>

                          <div className="space-y-4">
                            <h4 className="font-medium text-foreground border-b pb-2">Assinaturas</h4>
                            
                            <FormField
                              control={form.control}
                              name="sprinkler_contractor_name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nome do contratante de sprinklers</FormLabel>
                                  <FormControl>
                                    <Input {...field} data-testid="input-contractor-name" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <FormField
                                control={form.control}
                                name="witnessed_by_name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Testes testemunhados por (Nome)</FormLabel>
                                    <FormControl>
                                      <Input {...field} data-testid="input-witnessed-name" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="witness_title"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Título</FormLabel>
                                    <FormControl>
                                      <Input {...field} data-testid="input-witness-title" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="witness_date"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Data</FormLabel>
                                    <FormControl>
                                      <Input type="date" {...field} data-testid="input-witness-date" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <FormField
                                control={form.control}
                                name="owner_representative_name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>O proprietário ou seu representante autorizado (Nome)</FormLabel>
                                    <FormControl>
                                      <Input {...field} data-testid="input-owner-rep-name" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="owner_rep_title"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Título</FormLabel>
                                    <FormControl>
                                      <Input {...field} data-testid="input-owner-rep-title" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="owner_rep_date"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Data</FormLabel>
                                    <FormControl>
                                      <Input type="date" {...field} data-testid="input-owner-rep-date" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Observações Importantes</h4>
                              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                <li>• As assinaturas digitais serão capturadas no momento da finalização</li>
                                <li>• Todos os testes devem ser testemunhados por representante do proprietário</li>
                                <li>• Manter cópias para registros do contratante e proprietário</li>
                                <li>• Certificação AWS/ASME obrigatória para trabalhos de soldagem</li>
                              </ul>
                            </div>
                          </div>
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
                        {sections.findIndex(s => s.id === currentSection) < sections.length - 1 ? (
                          <Button
                            type="button"
                            onClick={() => {
                              const currentIndex = sections.findIndex(s => s.id === currentSection);
                              setCurrentSection(sections[currentIndex + 1].id);
                            }}
                            data-testid="button-next-section"
                          >
                            Próximo
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </Button>
                        ) : (
                          <Button type="submit" data-testid="button-submit-form">
                            <CheckCircle className="mr-2 w-4 h-4" />
                            Finalizar Certificado
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Form Actions - Show only on last section */}
                    {sections.findIndex(s => s.id === currentSection) === sections.length - 1 && (
                      <FormActions
                        formData={form.getValues()}
                        formTitle="Certificado para Tubulação Acima do Solo"
                        onValidateForm={() => {
                          const values = form.getValues();
                          return Boolean(values.propertyName && values.propertyAddress && values.date);
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