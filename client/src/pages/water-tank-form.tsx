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
import { ArrowLeft, ArrowRight, CheckCircle, Save, PenTool } from "lucide-react";
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
  tankType: string;
  [key: string]: string;
};

export default function WaterTankForm() {
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
      tankType: "",
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
    { id: "quarterly", title: "Inspeções Trimestrais", icon: "🔍" },
    { id: "annual", title: "Inspeções Anuais", icon: "📋" },
    { id: "internal", title: "Inspeções Internas", icon: "🧪" },
    { id: "tests", title: "Testes de Válvulas", icon: "⚙️" },
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
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="title-water-tank-form">
              Inspeção de Tanques de Armazenamento de Água
            </h1>
            <p className="text-muted-foreground">
              Formulário de inspeção conforme NFPA 25 - Tanques de Armazenamento de Água
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
                                    <SelectItem value="trimestral">Trimestral</SelectItem>
                                    <SelectItem value="anual">Anual</SelectItem>
                                    <SelectItem value="3anos">3 Anos (Aço Sem Proteção)</SelectItem>
                                    <SelectItem value="5anos">5 Anos (Outros Tipos)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="tankType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tipo de Tanque</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-tank-type">
                                      <SelectValue placeholder="Selecione o tipo de tanque" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="aco-protegido">Aço com Proteção Anticorrosão</SelectItem>
                                    <SelectItem value="aco-desprotegido">Aço Sem Proteção Anticorrosão</SelectItem>
                                    <SelectItem value="madeira">Madeira</SelectItem>
                                    <SelectItem value="concreto">Concreto</SelectItem>
                                    <SelectItem value="fibra">Fibra de Vidro</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {/* Quarterly Inspections */}
                    {currentSection === "quarterly" && (
                      <div className="space-y-6">
                        <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                          <h3 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Inspeções Trimestrais</h3>
                          <p className="text-sm text-purple-700 dark:text-purple-300">
                            Verificações trimestrais da estrutura externa e área circundante
                          </p>
                        </div>

                        <div className="space-y-6">
                          <h4 className="font-medium text-foreground border-b pb-2">Inspeção Externa do Tanque</h4>
                          {renderRadioGroup(
                            "quarterly_external_condition",
                            "O exterior do tanque, estrutura de suporte, aberturas, fundação e passarelas ou escadas estão em boas condições?"
                          )}
                          {renderRadioGroup(
                            "quarterly_area_clear_combustible",
                            "A área está livre de armazenamento combustível, lixo, detritos, mato ou material que possa apresentar risco de incêndio?"
                          )}
                          {renderRadioGroup(
                            "quarterly_area_clear_corrosive",
                            "A área está livre de acúmulo de material em ou perto de peças que possa resultar em corrosão acelerada ou apodrecimento?"
                          )}
                          {renderRadioGroup(
                            "quarterly_ice_free",
                            "O tanque e o suporte estão livres de acúmulo de gelo?"
                          )}
                        </div>
                      </div>
                    )}

                    {/* Annual Inspections */}
                    {currentSection === "annual" && (
                      <div className="space-y-6">
                        <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                          <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">Inspeções Anuais</h3>
                          <p className="text-sm text-red-700 dark:text-red-300">
                            Inspeções anuais detalhadas dos componentes estruturais
                          </p>
                        </div>

                        <div className="space-y-6">
                          <h4 className="font-medium text-foreground border-b pb-2">Aros e Grades (Tanques de Madeira)</h4>
                          {renderRadioGroup(
                            "annual_hoops_bands_condition",
                            "Estão em boas condições?"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Superfícies Pintadas/Revestidas</h4>
                          {renderRadioGroup(
                            "annual_painted_surfaces",
                            "Estão em boas condições?"
                          )}

                          <h4 className="font-medium text-foreground border-b pb-2">Juntas de Expansão</h4>
                          {renderRadioGroup(
                            "annual_expansion_joints",
                            "Não estão rachadas ou vazando?"
                          )}
                        </div>
                      </div>
                    )}

                    {/* Internal Inspections */}
                    {currentSection === "internal" && (
                      <div className="space-y-6">
                        <div className="bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
                          <h3 className="font-medium text-indigo-800 dark:text-indigo-200 mb-2">Inspeções Internas</h3>
                          <p className="text-sm text-indigo-700 dark:text-indigo-300">
                            3 Anos (Aço Sem Proteção) / 5 Anos (Outros Tipos) - Inspeção interna completa
                          </p>
                        </div>

                        <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Preparação da Inspeção</h4>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            Antes da inspeção interna, o lodo deve ser removido para permitir avaliação subaquática adequada.
                          </p>
                        </div>

                        <div className="space-y-6">
                          <h4 className="font-medium text-foreground border-b pb-2">Inspeção Interna</h4>
                          {renderRadioGroup(
                            "internal_sludge_removed",
                            "O lodo foi removido para avaliação subaquática?"
                          )}
                          {renderRadioGroup(
                            "internal_surfaces_condition",
                            "As superfícies internas estão livres de corrosão, lascamento ou outras formas de deterioração?"
                          )}
                          {renderRadioGroup(
                            "internal_debris_clear",
                            "O interior está livre de resíduos, crescimento aquático e detritos?"
                          )}
                          {renderRadioGroup(
                            "internal_coating_intact",
                            "O revestimento interno está intacto?"
                          )}
                          {renderRadioGroup(
                            "internal_floor_condition",
                            "O piso do tanque está livre de amassados?"
                          )}
                          {renderRadioGroup(
                            "internal_heating_system",
                            "O sistema de aquecimento e seus componentes estão em boas condições?"
                          )}
                          {renderRadioGroup(
                            "internal_vortex_plate",
                            "A placa antivórtice está em boas condições e não está obstruída?"
                          )}
                        </div>
                      </div>
                    )}

                    {/* Valve Tests */}
                    {currentSection === "tests" && (
                      <div className="space-y-6">
                        <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                          <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">Testes Anuais</h3>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            Testes anuais de funcionamento das válvulas
                          </p>
                        </div>

                        <div className="space-y-6">
                          <h4 className="font-medium text-foreground border-b pb-2">Status da Válvula</h4>
                          {renderRadioGroup(
                            "tests_valve_operated",
                            "Operada em toda a sua faixa de movimento?"
                          )}
                          {renderRadioGroup(
                            "tests_valve_status_open",
                            "Teste de status para verificar se a(s) válvula(s) está(ão) na posição aberta?"
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

                    {/* Form Actions - Show only on signatures section */}
                    {currentSection === "signatures" && (
                      <FormActions
                        formData={{
                          facilityName: form.watch("propertyName") || "",
                          systemLocation: form.watch("address") || "",
                          inspectorName: form.watch("inspector") || "",
                          inspectionDate: form.watch("date") || new Date().toISOString().split('T')[0],
                          contractNumber: form.watch("contractNumber") || "",
                          phone: form.watch("phone") || "",
                          frequency: form.watch("frequency") || "",
                          tankType: form.watch("tankType") || "",
                          // Inclua todos os outros campos do formulário
                          ...form.getValues()
                        }}
                        formTitle="Inspeção de Tanques de Armazenamento de Água"
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
                          if (!values.tankType) errors.push("Tipo de Tanque é obrigatório");
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