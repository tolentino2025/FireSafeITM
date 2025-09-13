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
import { ArrowLeft, ArrowRight, CheckCircle, Save, Settings2, Droplets, FileCheck } from "lucide-react";
import { FormActions } from "@/components/form-actions";

type FormData = {
  propertyName: string;
  propertyAddress: string;
  date: string;
  newInstallation: string;
  modification: string;
  pipeType: string;
  jointType: string;
  [key: string]: string;
};

export default function UndergroundCertificateForm() {
  const [currentSection, setCurrentSection] = useState("general");
  const form = useForm<FormData>({
    defaultValues: {
      propertyName: "",
      propertyAddress: "",
      date: "",
      newInstallation: "",
      modification: "",
      pipeType: "",
      jointType: "",
    },
  });

  const sections = [
    { id: "general", title: "Informações do Projeto", icon: "📋" },
    { id: "components", title: "Componentes", icon: "🔧" },
    { id: "tests", title: "Testes", icon: "🧪" },
    { id: "hydrants-valves", title: "Hidrantes e Válvulas", icon: "🚰" },
    { id: "signatures", title: "Assinaturas", icon: "✍️" },
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
    <div className="min-h-screen bg-background pb-[env(safe-area-inset-bottom)]">
      <Header />
      
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground mb-2" data-testid="title-underground-certificate-form">
              Certificado de Material e Teste para Tubulação Subterrânea
            </h1>
            <p className="text-muted-foreground">
              NFPA 25 - Versão Integral (Páginas 70-71)
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
                  <Settings2 className="mr-2 w-4 h-4 text-green-600 rotate-90" />
                  Certificado Subterrâneo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="text-muted-foreground">
                  Registro de testes em tubulações subterrâneas que alimentam sistemas de incêndio
                </div>
                <div className="text-green-600">
                  Inclui lavagem, testes hidrostáticos e certificação
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
                            Este formulário é para o registro de testes em tubulações subterrâneas que alimentam os sistemas de incêndio
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
                      </div>
                    )}

                    {/* Components */}
                    {currentSection === "components" && (
                      <div className="space-y-6">
                        <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                          <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">Componentes</h3>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            Especificações de tubos, conexões e juntas subterrâneas
                          </p>
                        </div>

                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="pipeType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tipos e classes de tubos</FormLabel>
                                  <FormControl>
                                    <Textarea {...field} data-testid="input-pipe-type" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="jointType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tipo de junta</FormLabel>
                                  <FormControl>
                                    <Textarea {...field} data-testid="input-joint-type" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="space-y-4">
                            <h4 className="font-medium text-foreground border-b pb-2">Conformidade</h4>
                            
                            {renderRadioGroup("pipe_complies_standard", "O tubo está em conformidade com a norma?")}
                            {renderRadioGroup("connections_comply_standard", "As conexões estão em conformidade com a norma?")}
                            {renderRadioGroup("joints_anchored_tied_blocked", "As juntas que necessitam de ancoragem foram fixadas, amarradas ou blocadas de acordo com a norma?")}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tests */}
                    {currentSection === "tests" && (
                      <div className="space-y-6">
                        <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2 flex items-center">
                            <Droplets className="mr-2 w-4 h-4" />
                            Testes
                          </h3>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            Procedimentos de lavagem, testes hidrostáticos e de vazamento
                          </p>
                        </div>

                        <div className="space-y-6">
                          <div className="space-y-4">
                            <h4 className="font-medium text-foreground border-b pb-2">Lavagem (Flushing)</h4>
                            
                            <FormField
                              control={form.control}
                              name="flushing_standard_name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>A nova tubulação subterrânea foi lavada de acordo com a norma (Nome da Norma)</FormLabel>
                                  <FormControl>
                                    <Input {...field} data-testid="input-flushing-standard" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="flushing_company_name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>pela empresa (Nome da Empresa)</FormLabel>
                                  <FormControl>
                                    <Input {...field} data-testid="input-flushing-company" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="flushing_flow_source"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Como o fluxo de lavagem foi obtido?</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger data-testid="select-flushing-flow">
                                        <SelectValue placeholder="Selecionar fonte do fluxo" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="agua-publica">Água pública</SelectItem>
                                      <SelectItem value="tanque-reservatorio">Tanque ou reservatório</SelectItem>
                                      <SelectItem value="bomba-incendio">Bomba de incêndio</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="flushing_opening_type"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Através de que tipo de abertura?</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger data-testid="select-opening-type">
                                        <SelectValue placeholder="Selecionar tipo de abertura" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="bocal-hidrante">Bocal de hidrante</SelectItem>
                                      <SelectItem value="tubo-aberto">Tubo aberto</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />

                            {renderRadioGroup("lead_ins_flushed", "As entradas (lead-ins) foram lavadas de acordo com a norma?")}
                          </div>

                          <div className="space-y-4">
                            <h4 className="font-medium text-foreground border-b pb-2">Teste Hidrostático</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="hydrostatic_pressure"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Toda a tubulação subterrânea foi testada hidrostaticamente a (psi)</FormLabel>
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
                                    <FormLabel>por (horas)</FormLabel>
                                    <FormControl>
                                      <Input type="number" step="0.1" {...field} data-testid="input-hydrostatic-hours" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>

                            {renderRadioGroup("joints_covered", "As juntas estavam cobertas?")}
                          </div>

                          <div className="space-y-4">
                            <h4 className="font-medium text-foreground border-b pb-2">Teste de Vazamento</h4>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <FormField
                                control={form.control}
                                name="leakage_measured_psi"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Quantidade total de vazamento medida (psi)</FormLabel>
                                    <FormControl>
                                      <Input type="number" step="0.1" {...field} data-testid="input-leakage-measured-psi" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="leakage_measured_hours"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>por (horas)</FormLabel>
                                    <FormControl>
                                      <Input type="number" step="0.1" {...field} data-testid="input-leakage-measured-hours" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="leakage_allowed_psi"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Vazamento permitido (psi)</FormLabel>
                                    <FormControl>
                                      <Input type="number" step="0.1" {...field} data-testid="input-leakage-allowed-psi" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="leakage_allowed_hours"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>por (horas)</FormLabel>
                                    <FormControl>
                                      <Input type="number" step="0.1" {...field} data-testid="input-leakage-allowed-hours" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="font-medium text-foreground border-b pb-2">Teste de Fluxo Direto do Dispositivo de Prevenção de Refluxo (Backflow)</h4>
                            
                            {renderRadioGroup("backflow_test_6102_52", "Realizado de acordo com 6.10.2.5.2?")}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Hydrants and Valves */}
                    {currentSection === "hydrants-valves" && (
                      <div className="space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                          <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Hidrantes e Válvulas</h3>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Verificação de hidrantes, válvulas de controle e compatibilidade
                          </p>
                        </div>

                        <div className="space-y-6">
                          <div className="space-y-4">
                            <h4 className="font-medium text-foreground border-b pb-2">Hidrantes</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="hydrants_installed_number"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Número instalado</FormLabel>
                                    <FormControl>
                                      <Input type="number" {...field} data-testid="input-hydrants-number" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="hydrants_type_manufacturer"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Tipo e fabricante</FormLabel>
                                    <FormControl>
                                      <Input {...field} data-testid="input-hydrants-type-manufacturer" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>

                            {renderRadioGroup("hydrants_operate_satisfactorily", "Todos operam satisfatoriamente?")}
                          </div>

                          <div className="space-y-4">
                            <h4 className="font-medium text-foreground border-b pb-2">Válvulas de Controle</h4>
                            
                            {renderRadioGroup("control_valves_left_open", "As válvulas de controle de água foram deixadas bem abertas?")}
                            {renderRadioGroup("hose_threads_interchangeable", "As roscas das mangueiras das conexões do corpo de bombeiros e hidrantes são intercambiáveis com as do corpo de bombeiros local?")}
                          </div>

                          <FormField
                            control={form.control}
                            name="service_date"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Data em que foi deixado em serviço</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} data-testid="input-service-date" />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {/* Signatures */}
                    {currentSection === "signatures" && (
                      <div className="space-y-6">
                        <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                          <h3 className="font-medium text-green-800 dark:text-green-200 mb-2 flex items-center">
                            <FileCheck className="mr-2 w-4 h-4" />
                            Assinaturas
                          </h3>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            Assinaturas dos responsáveis pelo projeto e testes
                          </p>
                        </div>

                        <div className="space-y-6">
                          <FormField
                            control={form.control}
                            name="installer_contractor_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome do contratante instalador</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-installer-contractor" />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <div className="space-y-4">
                            <h4 className="font-medium text-foreground border-b pb-2">Testes testemunhados por (Para o proprietário)</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <FormField
                                control={form.control}
                                name="owner_witness_name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Nome</FormLabel>
                                    <FormControl>
                                      <Input {...field} data-testid="input-owner-witness-name" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="owner_witness_title"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Título</FormLabel>
                                    <FormControl>
                                      <Input {...field} data-testid="input-owner-witness-title" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="owner_witness_date"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Data</FormLabel>
                                    <FormControl>
                                      <Input type="date" {...field} data-testid="input-owner-witness-date" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="font-medium text-foreground border-b pb-2">Para o contratante instalador</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <FormField
                                control={form.control}
                                name="contractor_signature_name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Nome</FormLabel>
                                    <FormControl>
                                      <Input {...field} data-testid="input-contractor-name" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="contractor_signature_title"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Título</FormLabel>
                                    <FormControl>
                                      <Input {...field} data-testid="input-contractor-title" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="contractor_signature_date"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Data</FormLabel>
                                    <FormControl>
                                      <Input type="date" {...field} data-testid="input-contractor-date" />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Observações Importantes</h4>
                            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                              <li>• As assinaturas digitais serão capturadas no momento da finalização</li>
                              <li>• Todos os testes devem ser testemunhados por representante do proprietário</li>
                              <li>• Verificar compatibilidade das roscas com o corpo de bombeiros local</li>
                              <li>• Documentar adequadamente a data de entrada em serviço</li>
                            </ul>
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
                        formTitle="Certificado para Tubulação Subterrânea"
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