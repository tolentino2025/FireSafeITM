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
import { ArrowLeft, ArrowRight, CheckCircle, Save, ShieldCheck, AlertTriangle, FileCheck } from "lucide-react";
import { FormActions } from "@/components/form-actions";

type FormData = {
  owner: string;
  ownerAddress: string;
  propertyEvaluated: string;
  propertyAddress: string;
  workDate: string;
  [key: string]: string;
};

export default function HazardEvaluationForm() {
  const [currentSection, setCurrentSection] = useState("general");
  const form = useForm<FormData>({
    defaultValues: {
      owner: "",
      ownerAddress: "",
      propertyEvaluated: "",
      propertyAddress: "",
      workDate: "",
    },
  });

  const sections = [
    { id: "general", title: "Informações Iniciais", icon: "📋" },
    { id: "identification", title: "Identificação da Ocupação", icon: "🏢" },
    { id: "protection-assessment", title: "Avaliação da Proteção", icon: "🔒" },
    { id: "unsprinklered-areas", title: "Áreas Sem Sprinklers", icon: "🚫" },
    { id: "water-supply", title: "Suprimento de Água", icon: "💧" },
    { id: "certification", title: "Certificação do Avaliador", icon: "✅" },
  ];

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data);
  };

  const renderRadioGroup = (name: string, label: string, includeExplanation = false) => (
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
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unknown" id={`${name}-unknown`} />
                  <label htmlFor={`${name}-unknown`} className="text-sm text-foreground">?</label>
                </div>
              </RadioGroup>
            </FormControl>
          </FormItem>
        )}
      />
      {includeExplanation && (
        <FormField
          control={form.control}
          name={`${name}_explanation`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">Explicação (se "Não" ou "?"):</FormLabel>
              <FormControl>
                <Textarea {...field} className="text-sm" rows={2} data-testid={`textarea-${name}-explanation`} />
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
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="title-hazard-evaluation-form">
              Avaliação de Risco do Sistema de Sprinklers de Incêndio
            </h1>
            <p className="text-muted-foreground">
              NFPA 25 - Versão Integral (Páginas 63-66)
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
                  <ShieldCheck className="mr-2 w-4 h-4 text-red-600" />
                  Avaliação de Risco
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="text-muted-foreground">
                  Usado para avaliar se o sistema existente ainda é adequado após mudanças
                </div>
                <div className="text-red-600">
                  Todos os "?" devem ser resolvidos para completar a avaliação
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
                          <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Informações Iniciais</h3>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Todas as respostas se referem à avaliação de risco atual realizada nesta data
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="owner"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Proprietário</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-owner" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="propertyEvaluated"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Propriedade sendo avaliada</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-property-evaluated" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="ownerAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Endereço do Proprietário</FormLabel>
                              <FormControl>
                                <Textarea {...field} data-testid="input-owner-address" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

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

                        <FormField
                          control={form.control}
                          name="workDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data do trabalho</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} data-testid="input-work-date" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Identification */}
                    {currentSection === "identification" && (
                      <div className="space-y-6">
                        <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                          <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">Seção 1. Identificação da Ocupação e Riscos de Armazenamento com Sprinklers</h3>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            Use páginas adicionais conforme necessário
                          </p>
                        </div>

                        <div className="space-y-6">
                          <h4 className="font-medium text-foreground border-b pb-2">Tabela de Áreas</h4>
                          
                          <div className="grid grid-cols-1 gap-4">
                            <FormField
                              control={form.control}
                              name="area_property"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Área da Propriedade (Listar áreas sem sprinklers separadamente na Seção 3)</FormLabel>
                                  <FormControl>
                                    <Textarea {...field} data-testid="input-area-property" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="system_type_sprinklers"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tipo de Sistema e Sprinklers</FormLabel>
                                  <FormControl>
                                    <Textarea {...field} data-testid="input-system-type" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="system_design_capacity"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Capacidade de Projeto do Sistema</FormLabel>
                                  <FormControl>
                                    <Textarea {...field} data-testid="input-design-capacity" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="protected_hazard"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Risco Protegido (Usos ou arranjos de armazenamento, incluindo mercadoria)</FormLabel>
                                  <FormControl>
                                    <Textarea {...field} data-testid="input-protected-hazard" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="necessary_improvements"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Melhorias Necessárias para Lidar com o Risco</FormLabel>
                                  <FormControl>
                                    <Textarea {...field} data-testid="input-necessary-improvements" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Protection Assessment */}
                    {currentSection === "protection-assessment" && (
                      <div className="space-y-6">
                        <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Seção 2. Avaliação da Proteção</h3>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            Para cada área da propriedade avaliada na Seção 1, responda às seguintes perguntas e explique todas as respostas "não" e "?"
                          </p>
                        </div>

                        <div className="space-y-6">
                          {renderRadioGroup(
                            "sprinklers_correct_type",
                            "a. Todos os sprinklers são do tipo correto para sua aplicação?",
                            true
                          )}
                          {renderRadioGroup(
                            "obstructions_acceptable",
                            "b. As obstruções aos sprinklers em todas as áreas estão dentro dos limites aceitáveis para os tipos específicos de sprinklers usados?",
                            true
                          )}
                          {renderRadioGroup(
                            "hazards_consistent",
                            "c. Os riscos associados a todas as áreas de ocupação são consistentes com os riscos típicos para essa classificação de risco de ocupação?",
                            true
                          )}
                          {renderRadioGroup(
                            "fuel_pile_heights",
                            "d. As pilhas de combustíveis localizadas dentro das áreas de ocupação são limitadas a alturas apropriadas?",
                            true
                          )}
                          {renderRadioGroup(
                            "storage_areas_managed",
                            "e. As áreas de armazenamento diversas e dedicadas estão devidamente identificadas e gerenciadas?",
                            true
                          )}
                          {renderRadioGroup(
                            "dedicated_storage_protected",
                            "f. Todas as áreas de armazenamento dedicadas são protegidas de acordo com a configuração de armazenamento e classificação de mercadoria adequadas?",
                            true
                          )}
                          {renderRadioGroup(
                            "flammable_liquids_treated",
                            "g. O armazenamento ou uso de líquidos inflamáveis, líquidos combustíveis ou produtos em aerossol em qualquer área é devidamente tratado?",
                            true
                          )}
                          {renderRadioGroup(
                            "idle_pallets_protected",
                            "h. Todo o armazenamento de paletes ociosos está devidamente protegido?",
                            true
                          )}
                          {renderRadioGroup(
                            "hazardous_materials_present",
                            "i. Existe alguma presença de filme de nitrato, plástico de piroxilina, cilindros de gás comprimido ou liquefeito, oxidantes líquidos ou sólidos, ou formulações de peróxido orgânico, exceto onde especificamente tratado por medidas de proteção apropriadas?",
                            true
                          )}
                          {renderRadioGroup(
                            "sprinklers_properly_spaced",
                            "j. Todos os sprinklers estão espaçados apropriadamente para o risco e o tipo de sprinkler?",
                            true
                          )}
                          {renderRadioGroup(
                            "heat_cooling_adequate",
                            "k. As fontes de calor e resfriamento disponíveis parecem adequadas para o tipo de sistema e a classificação de temperatura dos sprinklers?",
                            true
                          )}

                          <FormField
                            control={form.control}
                            name="explanation_no_unknown"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Explicação das respostas "não" e "?"</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    {...field} 
                                    rows={6}
                                    placeholder="Forneça explicações detalhadas para todas as respostas 'não' e '?' identificando a linha e coluna correspondente..."
                                    data-testid="textarea-explanation-no-unknown"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {/* Unsprinklered Areas */}
                    {currentSection === "unsprinklered-areas" && (
                      <div className="space-y-6">
                        <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                          <h3 className="font-medium text-red-800 dark:text-red-200 mb-2">Seção 3. Avaliação de Áreas Sem Sprinklers</h3>
                          <p className="text-sm text-red-700 dark:text-red-300">
                            Identificação e avaliação de áreas não protegidas por sprinklers
                          </p>
                        </div>

                        <div className="space-y-6">
                          <h4 className="font-medium text-foreground border-b pb-2">Tabela de Áreas Sem Sprinklers</h4>
                          
                          <FormField
                            control={form.control}
                            name="unsprinklered_area"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Área da Propriedade para a Qual a Proteção Não é Fornecida</FormLabel>
                                <FormControl>
                                  <Textarea {...field} data-testid="input-unsprinklered-area" />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="lack_protection_basis"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Base da Falta de Proteção (se conhecida)</FormLabel>
                                <FormControl>
                                  <Textarea {...field} data-testid="input-lack-protection-basis" />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="omission_basis_codes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Base para Omissão Sob Códigos/Normas Atuais</FormLabel>
                                <FormControl>
                                  <Textarea {...field} data-testid="input-omission-basis" />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {/* Water Supply */}
                    {currentSection === "water-supply" && (
                      <div className="space-y-6">
                        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                          <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Seção 4. Avaliação do Suprimento de Água</h3>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Análise da adequação do suprimento de água para o sistema
                          </p>
                        </div>

                        <div className="space-y-6">
                          <FormField
                            control={form.control}
                            name="pressure_reduction_investigation"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Se esta avaliação de risco for resultado de uma redução na pressão residual durante inspeções de rotina, 
                                  explique os resultados da investigação feita para determinar as razões desta mudança
                                </FormLabel>
                                <FormControl>
                                  <Textarea 
                                    {...field} 
                                    rows={5}
                                    data-testid="textarea-pressure-investigation"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="water_supply_acceptability"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Explique a base da aceitabilidade contínua do suprimento de água ou melhorias propostas</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    {...field} 
                                    rows={5}
                                    data-testid="textarea-water-supply-acceptability"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    )}

                    {/* Certification */}
                    {currentSection === "certification" && (
                      <div className="space-y-6">
                        <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                          <h3 className="font-medium text-green-800 dark:text-green-200 mb-2 flex items-center">
                            <FileCheck className="mr-2 w-4 h-4" />
                            Seção 5. Informações e Certificação do Avaliador de Risco
                          </h3>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            Certificação profissional do avaliador responsável
                          </p>
                        </div>

                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="evaluator_name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Avaliador</FormLabel>
                                  <FormControl>
                                    <Input {...field} data-testid="input-evaluator-name" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="evaluator_company"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Empresa</FormLabel>
                                  <FormControl>
                                    <Input {...field} data-testid="input-evaluator-company" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="company_address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Endereço da Empresa</FormLabel>
                                <FormControl>
                                  <Textarea {...field} data-testid="input-company-address" />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border">
                            <p className="text-sm text-foreground mb-4">
                              <strong>Declaração:</strong> Declaro que as informações neste formulário estão corretas no momento e local da minha revisão da minha avaliação.
                            </p>
                          </div>

                          {renderRadioGroup(
                            "evaluation_complete",
                            "Esta avaliação de risco está concluída? (Nota: Todos os \"?\" devem ser resolvidos.)"
                          )}

                          <FormField
                            control={form.control}
                            name="explain_if_not_complete"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Explique se a resposta não for "sim"</FormLabel>
                                <FormControl>
                                  <Textarea {...field} data-testid="textarea-explain-not-complete" />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          {renderRadioGroup(
                            "deficiencies_identified",
                            "Foram identificadas deficiências na proteção que deveriam ser melhoradas ou corrigidas?"
                          )}

                          <FormField
                            control={form.control}
                            name="improvements_summary"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Resuma as melhorias das correções necessárias</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    {...field} 
                                    rows={5}
                                    data-testid="textarea-improvements-summary"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="license_certification_number"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Número da Licença ou Certificação (se aplicável)</FormLabel>
                                  <FormControl>
                                    <Input {...field} data-testid="input-license-number" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="signature_date"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Data</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} data-testid="input-signature-date" />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Observações Importantes</h4>
                            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                              <li>• A assinatura digital do avaliador será capturada no momento da finalização</li>
                              <li>• Este formulário deve ser usado após mudanças na ocupação, uso, processo ou materiais</li>
                              <li>• Todas as respostas "?" devem ser investigadas e resolvidas</li>
                              <li>• Manter cópia para registros da propriedade e autoridades competentes</li>
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
                            Finalizar Avaliação
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Form Actions - Show only on last section */}
                    {sections.findIndex(s => s.id === currentSection) === sections.length - 1 && (
                      <FormActions
                        formData={form.getValues()}
                        formTitle="Avaliação de Risco do Sistema de Sprinklers"
                        onValidateForm={() => {
                          const values = form.getValues();
                          return Boolean(values.owner && values.propertyEvaluated && values.workDate);
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