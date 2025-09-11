import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, 
  Save, 
  Send, 
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Gauge,
  Target,
  Droplets,
  CheckCircle,
  PenTool
} from "lucide-react";
import { FinalizeInspectionButton } from "@/components/inspection/finalize-inspection-button";
import { FormActions } from "@/components/form-actions";
import { SignaturePad } from "@/components/signature-pad";
import { Link } from "wouter";

interface WaterSprayInspection {
  facilityName: string;
  systemLocation: string;
  inspectionDate: string;
  inspectorName: string;
  
  // Informações do Sistema
  protectedEquipment: string;
  systemDesignArea: number;
  nozzleQuantity: number;
  activationMethod: string;
  
  // Bicos de Spray
  nozzleCondition: string;
  nozzleType: string;
  nozzleOrientation: string;
  sprayCoverage: string;
  
  // Pressões e Fluxos
  waterPressure: number;
  designPressure: number;
  flowRate: number;
  dischargePattern: string;
  
  // Sistema de Ativação
  detectionSystemCondition: string;
  valveCondition: string;
  actuatorCondition: string;
  responseTime: number;
  
  // Deficiências e Ações
  deficienciesFound: string;
  correctiveActions: string;
  
  // Status
  systemOperational: boolean;
  inspectionPassed: boolean;
  
  // Observações
  additionalNotes: string;
}

export default function WaterSprayForm() {
  // Estados para assinaturas digitais
  const [inspectorName, setInspectorName] = useState("");
  const [inspectorDate, setInspectorDate] = useState("");
  const [inspectorSignature, setInspectorSignature] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientDate, setClientDate] = useState("");
  const [clientSignature, setClientSignature] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<WaterSprayInspection>({
    facilityName: "",
    systemLocation: "",
    inspectionDate: new Date().toISOString().split('T')[0],
    inspectorName: "",
    protectedEquipment: "",
    systemDesignArea: 0,
    nozzleQuantity: 0,
    activationMethod: "",
    nozzleCondition: "",
    nozzleType: "",
    nozzleOrientation: "",
    sprayCoverage: "",
    waterPressure: 0,
    designPressure: 0,
    flowRate: 0,
    dischargePattern: "",
    detectionSystemCondition: "",
    valveCondition: "",
    actuatorCondition: "",
    responseTime: 0,
    deficienciesFound: "",
    correctiveActions: "",
    systemOperational: true,
    inspectionPassed: true,
    additionalNotes: ""
  });

  const { toast } = useToast();

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const handleInputChange = (field: keyof WaterSprayInspection, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.facilityName || !formData.systemLocation || !formData.inspectorName) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Inspeção de sistema de spray de água salva com sucesso.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/sprinkler-module">
                <Button variant="ghost" size="sm" data-testid="button-back">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao Módulo
                </Button>
              </Link>
              <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Inspeção de Sistemas de Spray de Água
                </h1>
                <p className="text-muted-foreground">
                  Formulário NFPA 25 - Inspeção Trimestral de Sistemas de Proteção Específica
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200">
              <Sparkles className="w-3 h-3 mr-1" />
              Spray de Água
            </Badge>
          </div>
        </div>

        <div className="space-y-8">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="facilityName">Nome da Instalação *</Label>
                  <Input
                    id="facilityName"
                    value={formData.facilityName}
                    onChange={(e) => handleInputChange("facilityName", e.target.value)}
                    placeholder="Nome da instalação"
                    data-testid="input-facility-name"
                  />
                </div>
                <div>
                  <Label htmlFor="systemLocation">Localização do Sistema *</Label>
                  <Input
                    id="systemLocation"
                    value={formData.systemLocation}
                    onChange={(e) => handleInputChange("systemLocation", e.target.value)}
                    placeholder="Ex: Transformador Principal, Área de Estocagem"
                    data-testid="input-system-location"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="inspectionDate">Data da Inspeção *</Label>
                  <Input
                    id="inspectionDate"
                    type="date"
                    value={formData.inspectionDate}
                    onChange={(e) => handleInputChange("inspectionDate", e.target.value)}
                    data-testid="input-inspection-date"
                  />
                </div>
                <div>
                  <Label htmlFor="inspectorName">Nome do Inspetor *</Label>
                  <Input
                    id="inspectorName"
                    value={formData.inspectorName}
                    onChange={(e) => handleInputChange("inspectorName", e.target.value)}
                    placeholder={(user as any)?.fullName || "Nome completo e credenciais"}
                    data-testid="input-inspector-name"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Sistema Protegido */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2 text-primary" />
                Equipamento/Área Protegida
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="protectedEquipment">Equipamento Protegido</Label>
                  <Input
                    id="protectedEquipment"
                    value={formData.protectedEquipment}
                    onChange={(e) => handleInputChange("protectedEquipment", e.target.value)}
                    placeholder="Ex: Transformador 500kVA, Tanque de Combustível"
                    data-testid="input-protected-equipment"
                  />
                </div>
                
                <div>
                  <Label htmlFor="systemDesignArea">Área de Projeto (ft²)</Label>
                  <Input
                    id="systemDesignArea"
                    type="number"
                    value={formData.systemDesignArea}
                    onChange={(e) => handleInputChange("systemDesignArea", parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 400"
                    data-testid="input-design-area"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="nozzleQuantity">Quantidade de Bicos</Label>
                  <Input
                    id="nozzleQuantity"
                    type="number"
                    value={formData.nozzleQuantity}
                    onChange={(e) => handleInputChange("nozzleQuantity", parseInt(e.target.value) || 0)}
                    placeholder="Ex: 12"
                    data-testid="input-nozzle-quantity"
                  />
                </div>
                
                <div>
                  <Label htmlFor="activationMethod">Método de Ativação</Label>
                  <Select
                    value={formData.activationMethod}
                    onValueChange={(value) => handleInputChange("activationMethod", value)}
                  >
                    <SelectTrigger data-testid="select-activation-method">
                      <SelectValue placeholder="Selecione o método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="automatic">Automático</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="combined">Combinado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bicos de Spray */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Droplets className="w-5 h-5 mr-2 text-primary" />
                Bicos de Spray
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="nozzleCondition">Condição dos Bicos</Label>
                  <Select
                    value={formData.nozzleCondition}
                    onValueChange={(value) => handleInputChange("nozzleCondition", value)}
                  >
                    <SelectTrigger data-testid="select-nozzle-condition">
                      <SelectValue placeholder="Selecione a condição" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excelente</SelectItem>
                      <SelectItem value="good">Boa</SelectItem>
                      <SelectItem value="fair">Regular</SelectItem>
                      <SelectItem value="poor">Ruim</SelectItem>
                      <SelectItem value="deficient">Deficiente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="nozzleType">Tipo de Bico</Label>
                  <Select
                    value={formData.nozzleType}
                    onValueChange={(value) => handleInputChange("nozzleType", value)}
                  >
                    <SelectTrigger data-testid="select-nozzle-type">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Padrão</SelectItem>
                      <SelectItem value="wide-angle">Ângulo Amplo</SelectItem>
                      <SelectItem value="directional">Direcional</SelectItem>
                      <SelectItem value="oscillating">Oscilante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="nozzleOrientation">Orientação dos Bicos</Label>
                  <Select
                    value={formData.nozzleOrientation}
                    onValueChange={(value) => handleInputChange("nozzleOrientation", value)}
                  >
                    <SelectTrigger data-testid="select-nozzle-orientation">
                      <SelectValue placeholder="Selecione a orientação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="correct">Correta</SelectItem>
                      <SelectItem value="misaligned">Desalinhada</SelectItem>
                      <SelectItem value="obstructed">Obstruída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="sprayCoverage">Cobertura do Spray</Label>
                  <Select
                    value={formData.sprayCoverage}
                    onValueChange={(value) => handleInputChange("sprayCoverage", value)}
                  >
                    <SelectTrigger data-testid="select-spray-coverage">
                      <SelectValue placeholder="Selecione a cobertura" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adequate">Adequada</SelectItem>
                      <SelectItem value="partial">Parcial</SelectItem>
                      <SelectItem value="insufficient">Insuficiente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pressões e Fluxos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gauge className="w-5 h-5 mr-2 text-primary" />
                Pressões e Fluxos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <Label htmlFor="waterPressure">Pressão Atual (psi)</Label>
                  <Input
                    id="waterPressure"
                    type="number"
                    value={formData.waterPressure}
                    onChange={(e) => handleInputChange("waterPressure", parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 85"
                    data-testid="input-water-pressure"
                  />
                </div>
                
                <div>
                  <Label htmlFor="designPressure">Pressão de Projeto (psi)</Label>
                  <Input
                    id="designPressure"
                    type="number"
                    value={formData.designPressure}
                    onChange={(e) => handleInputChange("designPressure", parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 80"
                    data-testid="input-design-pressure"
                  />
                </div>
                
                <div>
                  <Label htmlFor="flowRate">Taxa de Fluxo (gpm)</Label>
                  <Input
                    id="flowRate"
                    type="number"
                    value={formData.flowRate}
                    onChange={(e) => handleInputChange("flowRate", parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 300"
                    data-testid="input-flow-rate"
                  />
                </div>
                
                <div>
                  <Label htmlFor="dischargePattern">Padrão de Descarga</Label>
                  <Select
                    value={formData.dischargePattern}
                    onValueChange={(value) => handleInputChange("dischargePattern", value)}
                  >
                    <SelectTrigger data-testid="select-discharge-pattern">
                      <SelectValue placeholder="Padrão" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uniform">Uniforme</SelectItem>
                      <SelectItem value="focused">Focado</SelectItem>
                      <SelectItem value="irregular">Irregular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sistema de Ativação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Droplets className="w-5 h-5 mr-2 text-primary" />
                Sistema de Ativação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="detectionSystemCondition">Condição do Sistema de Detecção</Label>
                  <Select
                    value={formData.detectionSystemCondition}
                    onValueChange={(value) => handleInputChange("detectionSystemCondition", value)}
                  >
                    <SelectTrigger data-testid="select-detection-condition">
                      <SelectValue placeholder="Selecione a condição" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excelente</SelectItem>
                      <SelectItem value="good">Boa</SelectItem>
                      <SelectItem value="fair">Regular</SelectItem>
                      <SelectItem value="poor">Ruim</SelectItem>
                      <SelectItem value="deficient">Deficiente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="valveCondition">Condição da Válvula de Controle</Label>
                  <Select
                    value={formData.valveCondition}
                    onValueChange={(value) => handleInputChange("valveCondition", value)}
                  >
                    <SelectTrigger data-testid="select-valve-condition">
                      <SelectValue placeholder="Selecione a condição" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excelente</SelectItem>
                      <SelectItem value="good">Boa</SelectItem>
                      <SelectItem value="fair">Regular</SelectItem>
                      <SelectItem value="poor">Ruim</SelectItem>
                      <SelectItem value="deficient">Deficiente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="actuatorCondition">Condição do Atuador</Label>
                  <Select
                    value={formData.actuatorCondition}
                    onValueChange={(value) => handleInputChange("actuatorCondition", value)}
                  >
                    <SelectTrigger data-testid="select-actuator-condition">
                      <SelectValue placeholder="Selecione a condição" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excelente</SelectItem>
                      <SelectItem value="good">Boa</SelectItem>
                      <SelectItem value="fair">Regular</SelectItem>
                      <SelectItem value="poor">Ruim</SelectItem>
                      <SelectItem value="deficient">Deficiente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="responseTime">Tempo de Resposta (segundos)</Label>
                  <Input
                    id="responseTime"
                    type="number"
                    value={formData.responseTime}
                    onChange={(e) => handleInputChange("responseTime", parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 5"
                    data-testid="input-response-time"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Tempo desde ativação até descarga</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deficiências e Ações Corretivas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-primary" />
                Deficiências e Ações Corretivas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="deficienciesFound">Deficiências Encontradas</Label>
                <Textarea
                  id="deficienciesFound"
                  rows={4}
                  value={formData.deficienciesFound}
                  onChange={(e) => handleInputChange("deficienciesFound", e.target.value)}
                  placeholder="Descreva quaisquer deficiências encontradas durante a inspeção..."
                  data-testid="textarea-deficiencies"
                />
              </div>
              
              <div>
                <Label htmlFor="correctiveActions">Ações Corretivas Necessárias</Label>
                <Textarea
                  id="correctiveActions"
                  rows={4}
                  value={formData.correctiveActions}
                  onChange={(e) => handleInputChange("correctiveActions", e.target.value)}
                  placeholder="Descreva as ações corretivas necessárias para resolver as deficiências..."
                  data-testid="textarea-corrective-actions"
                />
              </div>
            </CardContent>
          </Card>

          {/* Status e Conclusões */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2 text-primary" />
                Status e Conclusões
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="systemOperational"
                    checked={formData.systemOperational}
                    onCheckedChange={(checked) => handleInputChange("systemOperational", checked)}
                    data-testid="checkbox-operational"
                  />
                  <Label htmlFor="systemOperational">Sistema Operacional</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="inspectionPassed"
                    checked={formData.inspectionPassed}
                    onCheckedChange={(checked) => handleInputChange("inspectionPassed", checked)}
                    data-testid="checkbox-passed"
                  />
                  <Label htmlFor="inspectionPassed">Inspeção Aprovada</Label>
                </div>
              </div>
              
              <div>
                <Label htmlFor="additionalNotes">Observações Adicionais</Label>
                <Textarea
                  id="additionalNotes"
                  rows={3}
                  value={formData.additionalNotes}
                  onChange={(e) => handleInputChange("additionalNotes", e.target.value)}
                  placeholder="Observações gerais sobre a inspeção..."
                  data-testid="textarea-additional-notes"
                />
              </div>
            </CardContent>
          </Card>

          {/* Alert de Conformidade */}
          <Alert className="border-primary/20 bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
            <AlertDescription className="text-primary">
              <strong>NFPA 25 - Sistemas de Spray de Água:</strong> Inspeções trimestrais obrigatórias incluindo verificação de cobertura, orientação dos bicos e teste de funcionamento. Garantir proteção adequada do equipamento específico.
            </AlertDescription>
          </Alert>

          {/* Seção de Assinaturas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PenTool className="w-5 h-5 mr-2 text-primary" />
                Assinaturas Digitais Obrigatórias
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
                  defaultName={formData.inspectorName || ""}
                  defaultDate={formData.inspectionDate || new Date().toISOString().split('T')[0]}
                  onSignatureChange={(signature) => setInspectorSignature(signature)}
                  onNameChange={(name) => setInspectorName(name)}
                  onDateChange={(date) => setInspectorDate(date)}
                  required
                />
                
                <SignaturePad
                  title="Representante da Propriedade"
                  defaultDate={formData.inspectionDate || new Date().toISOString().split('T')[0]}
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
            </CardContent>
          </Card>

          {/* FormActions */}
          <FormActions
            formData={formData}
            formTitle="Inspeção de Sistema de Borrifo de Água"
            signatures={{
              inspectorName: inspectorName || formData.inspectorName || "",
              inspectorDate: inspectorDate || formData.inspectionDate || new Date().toISOString().split('T')[0],
              inspectorSignature: inspectorSignature || undefined,
              clientName: clientName,
              clientDate: clientDate || formData.inspectionDate || new Date().toISOString().split('T')[0],
              clientSignature: clientSignature || undefined
            }}
            onValidateForm={() => {
              const errors: string[] = [];
              
              if (!formData.facilityName) errors.push("Nome da Instalação é obrigatório");
              if (!formData.systemLocation) errors.push("Localização do Sistema é obrigatório");
              if (!formData.inspectorName && !inspectorName) errors.push("Nome do Inspetor é obrigatório");
              if (!formData.inspectionDate) errors.push("Data da Inspeção é obrigatória");
              if (!inspectorSignature) errors.push("Assinatura do Inspetor é obrigatória");
              if (!clientSignature) errors.push("Assinatura do Representante da Propriedade é obrigatória");
              if (!clientName) errors.push("Nome do Representante da Propriedade é obrigatório");
              
              return errors.length === 0 ? true : errors;
            }}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}