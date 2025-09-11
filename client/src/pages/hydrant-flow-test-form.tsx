import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, CheckCircle, Save, FileText, Upload, TrendingUp, PenTool } from "lucide-react";
import { FormActions } from "@/components/form-actions";
import { SignaturePad } from "@/components/signature-pad";
import { FinalizeInspectionButton } from "@/components/inspection/finalize-inspection-button";

type FormData = {
  propertyName: string;
  address: string;
  testedBy: string;
  date: string;
  contractNumber: string;
  time: string;
  weatherConditions: string;
  testLocation: string;
  residualHydrantLocation: string;
  residualHydrantElevation: string;
  flowHydrantLocation: string;
  flowHydrantElevation: string;
  staticPressure: string;
  residualPressure: string;
  nozzleSize: string;
  nozzleCoefficient: string;
  pitotPressure: string;
  projectedResults: string;
  observations: string;
};

export default function HydrantFlowTestForm() {
  const [currentSection, setCurrentSection] = useState("general");
  const form = useForm<FormData>({
    defaultValues: {
      propertyName: "",
      address: "",
      testedBy: "",
      date: "",
      contractNumber: "",
      time: "",
      weatherConditions: "",
      testLocation: "",
      residualHydrantLocation: "",
      residualHydrantElevation: "",
      flowHydrantLocation: "",
      flowHydrantElevation: "",
      staticPressure: "",
      residualPressure: "",
      nozzleSize: "",
      nozzleCoefficient: "",
      pitotPressure: "",
      projectedResults: "",
      observations: "",
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
    { id: "general", title: "Dados Gerais do Teste", icon: "📋" },
    { id: "location", title: "Dados de Localização", icon: "📍" },
    { id: "measurements", title: "Medições e Resultados", icon: "📊" },
    { id: "documentation", title: "Documentação", icon: "📄" },
    { id: "signatures", title: "Assinaturas", icon: "✍️" },
  ];

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="title-hydrant-flow-test-form">
              Relatório de Teste de Vazão de Hidrante
            </h1>
            <p className="text-muted-foreground">
              Formulário de teste hidráulico conforme NFPA 25 - Teste de Vazão de Hidrantes
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

            {/* Test Summary Card */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <TrendingUp className="mr-2 w-4 h-4" />
                  Resumo do Teste
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="text-orange-600">Em Andamento</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo:</span>
                  <span className="text-foreground">NFPA 25</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seções:</span>
                  <span className="text-foreground">4 de 4</span>
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
                          <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Dados do Teste</h3>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Informações gerais sobre o teste de vazão de hidrante
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
                            name="testedBy"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Testado por</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-tested-by" />
                                </FormControl>
                                <FormMessage />
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          <FormField
                            control={form.control}
                            name="contractNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nº do Contrato</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-contract" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="time"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Hora</FormLabel>
                                <FormControl>
                                  <Input type="time" {...field} data-testid="input-time" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="weatherConditions"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Condições Climáticas</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  placeholder="Descreva as condições climáticas durante o teste"
                                  data-testid="input-weather" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Location Data */}
                    {currentSection === "location" && (
                      <div className="space-y-4">
                        <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                          <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">Dados de Localização</h3>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            Localização dos hidrantes de teste e medição
                          </p>
                        </div>

                        <FormField
                          control={form.control}
                          name="testLocation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Localização do Teste</FormLabel>
                              <FormControl>
                                <Textarea {...field} data-testid="input-test-location" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="residualHydrantLocation"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Localização do Hidrante Residual</FormLabel>
                                <FormControl>
                                  <Textarea {...field} data-testid="input-residual-location" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="residualHydrantElevation"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Elevação (m)</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-residual-elevation" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="flowHydrantLocation"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Localização do(s) Hidrante(s) de Vazão</FormLabel>
                                <FormControl>
                                  <Textarea {...field} data-testid="input-flow-location" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="flowHydrantElevation"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Elevação (m)</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-flow-elevation" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {/* Measurements and Results */}
                    {currentSection === "measurements" && (
                      <div className="space-y-4">
                        <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                          <h3 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Medições e Resultados</h3>
                          <p className="text-sm text-purple-700 dark:text-purple-300">
                            Dados técnicos e resultados das medições do teste
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="staticPressure"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Pressão Estática (hidrante residual) - psi</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.1" {...field} data-testid="input-static-pressure" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="residualPressure"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Pressão Residual (hidrante residual) - psi</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.1" {...field} data-testid="input-residual-pressure" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="nozzleSize"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tamanho do Bocal (hidrante de vazão) - in. (mm)</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-nozzle-size" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="nozzleCoefficient"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Coeficiente do Bocal</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.01" {...field} data-testid="input-nozzle-coefficient" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="pitotPressure"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Pressão(ões) Pitot - psi</FormLabel>
                                <FormControl>
                                  <Input type="number" step="0.1" {...field} data-testid="input-pitot-pressure" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="projectedResults"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Resultados Projetados - gpm (L/min) @ 20 psi</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-projected-results" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="observations"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Observações</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  rows={4}
                                  placeholder="Registre quaisquer observações relevantes sobre o teste"
                                  data-testid="input-observations" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Documentation */}
                    {currentSection === "documentation" && (
                      <div className="space-y-4">
                        <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                          <h3 className="font-medium text-orange-800 dark:text-orange-200 mb-2">Documentação</h3>
                          <p className="text-sm text-orange-700 dark:text-orange-300">
                            Upload de documentos técnicos e gráficos do teste
                          </p>
                        </div>

                        <div className="space-y-6">
                          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                            <div className="text-center">
                              <Upload className="mx-auto h-12 w-12 text-gray-400" />
                              <div className="mt-4">
                                <label className="cursor-pointer">
                                  <span className="mt-2 block text-sm font-medium text-foreground">
                                    Mapa de Localização (N.T.S.)
                                  </span>
                                  <span className="mt-1 block text-xs text-muted-foreground">
                                    Mostrar tamanhos e distâncias das linhas, válvulas, tamanhos dos ramais dos hidrantes, norte, hidrantes de vazão e localização do hidrante estático e residual
                                  </span>
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*,.pdf"
                                    data-testid="input-location-map"
                                  />
                                </label>
                                <Button type="button" variant="outline" className="mt-2">
                                  <FileText className="mr-2 w-4 h-4" />
                                  Selecionar Arquivo
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                            <div className="text-center">
                              <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
                              <div className="mt-4">
                                <label className="cursor-pointer">
                                  <span className="mt-2 block text-sm font-medium text-foreground">
                                    Gráfico Hidráulico Pressão vs. (Vazão)¹·⁸⁵
                                  </span>
                                  <span className="mt-1 block text-xs text-muted-foreground">
                                    Upload do gráfico hidráulico ou funcionalidade de geração de gráfico
                                  </span>
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*,.pdf"
                                    data-testid="input-hydraulic-chart"
                                  />
                                </label>
                                <div className="flex space-x-2 mt-2 justify-center">
                                  <Button type="button" variant="outline">
                                    <FileText className="mr-2 w-4 h-4" />
                                    Upload Gráfico
                                  </Button>
                                  <Button type="button" variant="outline">
                                    <TrendingUp className="mr-2 w-4 h-4" />
                                    Gerar Gráfico
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Requisitos da Documentação</h4>
                            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                              <li>• Mapa deve incluir escala, orientação norte e todas as distâncias</li>
                              <li>• Gráfico hidráulico deve mostrar curva pressão x vazão</li>
                              <li>• Documentos devem estar legíveis e em alta resolução</li>
                              <li>• Formatos aceitos: PDF, PNG, JPG</li>
                            </ul>
                          </div>
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
                            title="Responsável pelo Teste"
                            defaultName={form.watch("testedBy") || ""}
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
                            <li>• As assinaturas confirmam a veracidade das informações do teste NFPA 25</li>
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
                        <Button type="button" variant="outline" data-testid="button-save-draft">
                          <Save className="mr-2 w-4 h-4" />
                          Salvar Rascunho
                        </Button>
                        
{(() => {
                          const currentIndex = sections.findIndex(s => s.id === currentSection);
                          const isLastContentSection = currentIndex === sections.length - 2 && sections[sections.length - 1]?.id === "signatures";
                          const isOnSignatures = currentSection === "signatures";
                          
                          if (isOnSignatures) {
                            // Na seção de assinaturas, mostra botão de finalizar formulário
                            return (
                              <Button type="submit" data-testid="button-submit-form">
                                <CheckCircle className="mr-2 w-4 h-4" />
                                Finalizar Teste
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

                    {/* Form Actions - Show only on signatures section */}
                    {currentSection === "signatures" && (
                      <FormActions
                        formData={{
                          ...form.getValues(),
                          // Override specific field mappings for FormActions
                          facilityName: form.watch("propertyName") || "",
                          systemLocation: form.watch("address") || "",
                          inspectorName: form.watch("testedBy") || "",
                          inspectionDate: form.watch("date") || new Date().toISOString().split('T')[0]
                        }}
                        formTitle="Teste de Vazão de Hidrante"
                        signatures={{
                          inspectorName: inspectorName || form.watch("testedBy") || "",
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
                          if (!values.testedBy && !inspectorName) errors.push("Nome do Responsável pelo Teste é obrigatório");
                          if (!values.date) errors.push("Data do Teste é obrigatória");
                          if (!inspectorSignature) errors.push("Assinatura do Responsável pelo Teste é obrigatória");
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