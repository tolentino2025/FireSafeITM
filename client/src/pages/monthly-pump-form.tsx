import { useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, ArrowRight, CheckCircle, Save, Settings, Battery, Zap, PenTool } from "lucide-react";
import { FormActions } from "@/components/form-actions";
import { SignaturePad } from "@/components/signature-pad";
import { FinalizeInspectionButton } from "@/components/inspection/finalize-inspection-button";

type FormData = {
  propertyName: string;
  propertyAddress: string;
  propertyPhone: string;
  inspector: string;
  contractNumber: string;
  date: string;
  [key: string]: string;
};

export default function MonthlyPumpForm() {
  const [currentSection, setCurrentSection] = useState("general");
  const form = useForm<FormData>({
    defaultValues: {
      propertyName: "",
      propertyAddress: "",
      propertyPhone: "",
      inspector: "",
      contractNumber: "",
      date: "",
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
    { id: "electrical-pump", title: "Bomba Elétrica", icon: "⚡" },
    { id: "electrical-system", title: "Sistema Elétrico", icon: "🔌" },
    { id: "battery-system", title: "Sistema de Bateria", icon: "🔋" },
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
                  className="w-40"
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
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="title-monthly-pump-form">
              Inspeção e Teste Mensal da Bomba de Incêndio
            </h1>
            <p className="text-muted-foreground">
              Formulário NFPA 25 - Versão Integral (Páginas 76-77)
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

            {/* Monthly Info */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <Settings className="mr-2 w-4 h-4 text-green-600" />
                  Inspeção Mensal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="text-muted-foreground">
                  Inclui testes de bomba elétrica e inspeções do sistema de bateria
                </div>
                <div className="text-green-600">
                  Teste sem fluxo - 10 minutos
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

                    {/* Electric Pump Systems */}
                    {currentSection === "electrical-pump" && (
                      <div className="space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                          <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center">
                            <Zap className="mr-2 w-4 h-4" />
                            Bomba de Incêndio Elétrica (Ação: Teste)
                          </h3>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Testes específicos para bombas elétricas - Páginas 76-77
                          </p>
                        </div>

                        <div className="space-y-6">
                          {renderRadioGroup(
                            "electric_no_flow_test",
                            "Teste sem fluxo - operar por 10 minutos"
                          )}
                          {renderRadioGroup(
                            "electric_start_pressure",
                            "Registrar a pressão de partida da bomba"
                          )}
                          {renderRadioGroup(
                            "electric_packing_tightness",
                            "Verificar o aperto da gaxeta (leve vazamento sem fluxo)"
                          )}
                          {renderRadioGroup(
                            "electric_suction_pressure",
                            "Registrar a pressão de sucção do manômetro",
                            true,
                            "number",
                            "Pressão de sucção (psi/bar)"
                          )}
                          {renderRadioGroup(
                            "electric_discharge_pressure",
                            "Registrar a pressão de descarga do manômetro",
                            true,
                            "number",
                            "Pressão de descarga (psi/bar)"
                          )}
                          {renderRadioGroup(
                            "electric_adjust_packing",
                            "Ajustar as porcas da gaxeta se necessário"
                          )}
                          {renderRadioGroup(
                            "electric_noise_vibration",
                            "Verificar ruído ou vibração incomum"
                          )}
                          {renderRadioGroup(
                            "electric_pressure_switch_comparison",
                            "Registrar o pressostato ou transdutor de pressão e comparar com o manômetro de descarga da bomba"
                          )}
                          {renderRadioGroup(
                            "electric_pressure_range",
                            "Registrar a pressão mais alta e mais baixa da bomba no registro de controle da bomba de incêndio"
                          )}
                          {renderRadioGroup(
                            "electric_circulation_relief",
                            "A válvula de alívio de circulação funciona corretamente"
                          )}
                          {renderRadioGroup(
                            "electric_controller_step",
                            "Registrar o tempo em que o controlador está no primeiro degrau (para partida com tensão reduzida ou corrente reduzida)"
                          )}
                        </div>
                      </div>
                    )}

                    {/* Electrical System */}
                    {currentSection === "electrical-system" && (
                      <div className="space-y-6">
                        <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2 flex items-center">
                            <Zap className="mr-2 w-4 h-4" />
                            Sistema Elétrico (Ação: Teste/Inspeção)
                          </h3>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            Testes e inspeções dos componentes elétricos
                          </p>
                        </div>

                        <div className="space-y-6">
                          {renderRadioGroup(
                            "electrical_isolation_switch",
                            "Exercitar o interruptor de isolamento e o disjuntor (Alternativa ITM A.8.1.1.2)"
                          )}
                          {renderRadioGroup(
                            "electrical_breakers_fuses",
                            "Inspecionar disjuntores ou fusíveis (Alternativa ITM A.8.1.1.2)"
                          )}
                        </div>
                      </div>
                    )}

                    {/* Battery System */}
                    {currentSection === "battery-system" && (
                      <div className="space-y-6">
                        <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                          <h3 className="font-medium text-green-800 dark:text-green-200 mb-2 flex items-center">
                            <Battery className="mr-2 w-4 h-4" />
                            Sistema de Bateria (Ação: Inspeção/Teste)
                          </h3>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            Inspeções e testes específicos do sistema de bateria
                          </p>
                        </div>

                        <div className="space-y-6">
                          {renderRadioGroup(
                            "battery_exterior_condition",
                            "Inspecionar o exterior da caixa, limpo e seco (Alternativa ITM A.8.1.1.2)"
                          )}
                          {renderRadioGroup(
                            "battery_specific_gravity",
                            "Testar a gravidade específica ou o estado de carga (Alternativa ITM A.8.1.1.2)"
                          )}
                          {renderRadioGroup(
                            "battery_charger_rate",
                            "Inspecionar o carregador e a taxa de carga (Alternativa ITM A.8.1.1.2)"
                          )}
                          {renderRadioGroup(
                            "battery_equalization_charge",
                            "Inspecionar a carga de equalização (Alternativa ITM A.8.1.1.2)"
                          )}
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Observações Importantes</h4>
                          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                            <li>• Todos os testes marcados com "Alternativa ITM A.8.1.1.2" seguem procedimentos alternativos específicos</li>
                            <li>• A inspeção mensal combina elementos de uma bomba elétrica e sistema de bateria</li>
                            <li>• Registrar todas as leituras de pressão para comparação histórica</li>
                            <li>• Verificar se o tempo de operação está dentro dos parâmetros especificados</li>
                          </ul>
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
                        formData={form.getValues()}
                        formTitle="Inspeção Mensal de Bomba de Incêndio"
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