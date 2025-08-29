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
import { ArrowLeft, ArrowRight, CheckCircle, Save, AlertTriangle, Zap, Activity } from "lucide-react";

type FormData = {
  propertyName: string;
  propertyAddress: string;
  propertyPhone: string;
  inspector: string;
  contractNumber: string;
  date: string;
  frequency: string;
  systemType: string;
  [key: string]: string;
};

export default function PreactionDelugeForm() {
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
      systemType: "",
    },
  });

  const sections = [
    { id: "general", title: "Informações Gerais", icon: "📋" },
    { id: "monthly", title: "Inspeções Mensais", icon: "📈" },
    { id: "quarterly", title: "Inspeções Trimestrais", icon: "🔍" },
    { id: "annual", title: "Inspeções Anuais", icon: "📋" },
    { id: "fiveyears", title: "Inspeções 5 Anos", icon: "🔬" },
    { id: "tests", title: "Testes Especializados", icon: "🧪" },
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
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="title-preaction-deluge-form">
              Sistemas de Pré-Ação/Dilúvio (Preaction/Deluge)
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

            {/* System Type Info */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <Zap className="mr-2 w-4 h-4 text-purple-600" />
                  Sistema Combinado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="text-muted-foreground">
                  Combinação de inspeções de Tubo Seco e sistemas de detecção
                </div>
                <div className="text-purple-600">
                  Inclui componentes elétricos
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <FormField
                            control={form.control}
                            name="systemType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tipo do Sistema</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-system-type">
                                      <SelectValue placeholder="Selecione o tipo" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="preacao">Pré-Ação</SelectItem>
                                    <SelectItem value="diluvio">Dilúvio</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {/* Monthly Inspections */}
                    {currentSection === "monthly" && (
                      <div className="space-y-6">
                        <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                          <h3 className="font-medium text-orange-800 dark:text-orange-200 mb-2">Inspeções Mensais</h3>
                          <p className="text-sm text-orange-700 dark:text-orange-300">
                            Verificações mensais específicas para sistemas de pré-ação e dilúvio
                          </p>
                        </div>

                        <div className="space-y-6">
                          <h4 className="font-medium text-foreground border-b pb-2">Válvula de Pré-Ação/Dilúvio</h4>
                          {renderRadioGroup(
                            "monthly_valve_physical_damage",
                            "Livre de danos físicos ou vazamentos?"
                          )}
                          {renderRadioGroup(
                            "monthly_electrical_components",
                            "Componentes elétricos estão em serviço?"
                          )}
                          {renderRadioGroup(
                            "monthly_trim_position",
                            "Válvulas de trim estão na posição correta (aberta ou fechada)?"
                          )}
                          {renderRadioGroup(
                            "monthly_valve_seat",
                            "O assento da válvula não está vazando?"
                          )}

                          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                              <strong>Incluir também:</strong> Todas as inspeções mensais dos sistemas de tubo seco (Manômetros, Válvulas de Controle).
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quarterly Inspections */}
                    {currentSection === "quarterly" && (
                      <div className="space-y-6">
                        <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                          <h3 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Inspeções Trimestrais</h3>
                          <p className="text-sm text-purple-700 dark:text-purple-300">
                            Verificações trimestrais específicas para sistemas de detecção
                          </p>
                        </div>

                        <div className="space-y-6">
                          <h4 className="font-medium text-foreground border-b pb-2">Sistema de Detecção</h4>
                          {renderRadioGroup(
                            "quarterly_detection_low_pressure",
                            "Dispositivo de supervisão de baixa pressão de ar do sistema de detecção - Trimestral"
                          )}

                          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                              <strong>Incluir também:</strong> Todas as inspeções trimestrais dos sistemas de tubo seco.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Annual Inspections */}
                    {currentSection === "annual" && (
                      <div className="space-y-6">
                        <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                          <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">Inspeções Anuais</h3>
                          <p className="text-sm text-red-700 dark:text-red-300">
                            Inspeções anuais específicas para sistemas de pré-ação e dilúvio
                          </p>
                        </div>

                        <div className="space-y-6">
                          <h4 className="font-medium text-foreground border-b pb-2">Válvula de Pré-Ação/Dilúvio</h4>
                          {renderRadioGroup(
                            "annual_valve_internal_inspection",
                            "Inspeção interna após o teste de desarme?"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Sistema de Detecção</h4>
                          {renderRadioGroup(
                            "annual_detection_device_condition",
                            "Inspeção da condição do dispositivo de detecção?"
                          )}

                          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                              <strong>Incluir também:</strong> Todas as inspeções anuais dos sistemas de tubo seco e molhado aplicáveis.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Five Years Inspections */}
                    {currentSection === "fiveyears" && (
                      <div className="space-y-6">
                        <div className="bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
                          <h3 className="font-medium text-indigo-800 dark:text-indigo-200 mb-2">Inspeções Quinquenais</h3>
                          <p className="text-sm text-indigo-700 dark:text-indigo-300">
                            Inclui todas as inspeções quinquenais dos sistemas base
                          </p>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-sm text-blue-800 dark:text-blue-300">
                            <strong>Aplicável:</strong> Todas as inspeções quinquenais dos sistemas de tubo molhado e tubo seco.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Tests */}
                    {currentSection === "tests" && (
                      <div className="space-y-6">
                        <div className="bg-teal-50 dark:bg-teal-950/20 p-4 rounded-lg border border-teal-200 dark:border-teal-800">
                          <h3 className="font-medium text-teal-800 dark:text-teal-200 mb-2">Testes Específicos</h3>
                          <p className="text-sm text-teal-700 dark:text-teal-300">
                            Testes específicos para sistemas de pré-ação e dilúvio
                          </p>
                        </div>

                        <div className="space-y-6">
                          <h4 className="font-medium text-foreground border-b pb-2">Testes Anuais</h4>
                          {renderRadioGroup(
                            "test_annual_deluge_full_flow",
                            "Teste de Desarme de Fluxo Total (Válvula de Dilúvio): Descarga desobstruída de todos os bicos? Leitura de pressão na válvula de dilúvio? Funções de liberação manual corretas? - Anual"
                          )}
                          {renderRadioGroup(
                            "test_annual_preaction_partial_flow",
                            "Teste de Desarme de Fluxo Parcial (Válvula de Pré-Ação): Teste de desarme com válvula de controle parcialmente aberta? - Anual"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Testes Trienais</h4>
                          {renderRadioGroup(
                            "test_triennial_preaction_full_flow",
                            "Teste de Desarme de Fluxo Total (Válvula de Pré-Ação): Teste de desarme com válvula de controle aberta? - A cada 3 anos"
                          )}
                          {renderRadioGroup(
                            "test_triennial_air_leakage",
                            "Sistema de pré-ação testado para vazamento de ar - A cada 3 anos"
                          )}

                          <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Observações Importantes</h4>
                            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                              <li>• Sistemas de dilúvio requerem teste de fluxo total anual</li>
                              <li>• Sistemas de pré-ação alternam entre testes parciais (anuais) e totais (trienais)</li>
                              <li>• Componentes elétricos devem ser verificados mensalmente</li>
                              <li>• Dispositivos de detecção requerem inspeção anual da condição</li>
                            </ul>
                          </div>

                          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-800 dark:text-blue-300">
                              <strong>Incluir também:</strong> Todos os testes aplicáveis dos sistemas de tubo molhado e tubo seco.
                            </p>
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
                        <Button type="button" variant="outline" data-testid="button-save-draft">
                          <Save className="mr-2 w-4 h-4" />
                          Salvar Rascunho
                        </Button>
                        
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
                            Finalizar Inspeção
                          </Button>
                        )}
                      </div>
                    </div>
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