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
  Cloud, 
  Save, 
  Send, 
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Gauge,
  Zap,
  Droplets,
  PenTool
} from "lucide-react";
import { FormActions } from "@/components/form-actions";
import { SignaturePad } from "@/components/signature-pad";
import { Link } from "wouter";

interface WaterMistInspection {
  facilityName: string;
  systemLocation: string;
  inspectionDate: string;
  inspectorName: string;
  
  // Informações do Sistema
  systemType: string; // low-pressure, intermediate-pressure, high-pressure
  protectedArea: string;
  systemDesignArea: number;
  nozzleQuantity: number;
  
  // Características da Neblina
  dropletSize: number; // microns
  dischargeDensity: number;
  pressureRating: number;
  flowRate: number;
  
  // Sistema de Pressurização
  pumpCondition: string;
  accumulatorCondition: string;
  pressureVesselCondition: string;
  operatingPressure: number;
  
  // Bicos e Distribuição
  nozzleCondition: string;
  distributionPattern: string;
  coverageUniformity: string;
  penetrationEfficiency: string;
  
  // Sistema de Controle
  controlSystemCondition: string;
  activationMethod: string;
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

export default function WaterMistForm() {
  // Estados para assinaturas digitais
  const [inspectorName, setInspectorName] = useState("");
  const [inspectorDate, setInspectorDate] = useState("");
  const [inspectorSignature, setInspectorSignature] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientDate, setClientDate] = useState("");
  const [clientSignature, setClientSignature] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<WaterMistInspection>({
    facilityName: "",
    systemLocation: "",
    inspectionDate: new Date().toISOString().split('T')[0],
    inspectorName: "",
    systemType: "",
    protectedArea: "",
    systemDesignArea: 0,
    nozzleQuantity: 0,
    dropletSize: 0,
    dischargeDensity: 0,
    pressureRating: 0,
    flowRate: 0,
    pumpCondition: "",
    accumulatorCondition: "",
    pressureVesselCondition: "",
    operatingPressure: 0,
    nozzleCondition: "",
    distributionPattern: "",
    coverageUniformity: "",
    penetrationEfficiency: "",
    controlSystemCondition: "",
    activationMethod: "",
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

  const handleInputChange = (field: keyof WaterMistInspection, value: any) => {
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
      description: "Inspeção de sistema de neblina de água salva com sucesso.",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-[env(safe-area-inset-bottom)]">
      <Header />
      
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
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
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Cloud className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
                  Inspeção de Sistemas de Neblina de Água
                </h1>
                <p className="text-muted-foreground">
                  Formulário NFPA 25 - Inspeção Mensal de Sistemas de Supressão por Neblina
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
              <Cloud className="w-3 h-3 mr-1" />
              Neblina de Água
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
                    placeholder="Ex: Sala de Máquinas, Centro de Dados"
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

          {/* Especificações do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2 text-primary" />
                Especificações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="systemType">Tipo de Sistema</Label>
                  <Select
                    value={formData.systemType}
                    onValueChange={(value) => handleInputChange("systemType", value)}
                  >
                    <SelectTrigger data-testid="select-system-type">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low-pressure">Baixa Pressão (&lt; 175 psi)</SelectItem>
                      <SelectItem value="intermediate-pressure">Pressão Intermediária (175-500 psi)</SelectItem>
                      <SelectItem value="high-pressure">Alta Pressão (&gt; 500 psi)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="protectedArea">Área Protegida</Label>
                  <Input
                    id="protectedArea"
                    value={formData.protectedArea}
                    onChange={(e) => handleInputChange("protectedArea", e.target.value)}
                    placeholder="Ex: Sala de Servidores, Cabine de Pintura"
                    data-testid="input-protected-area"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="systemDesignArea">Área de Projeto (ft²)</Label>
                  <Input
                    id="systemDesignArea"
                    type="number"
                    value={formData.systemDesignArea}
                    onChange={(e) => handleInputChange("systemDesignArea", parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 800"
                    data-testid="input-design-area"
                  />
                </div>
                
                <div>
                  <Label htmlFor="nozzleQuantity">Quantidade de Bicos</Label>
                  <Input
                    id="nozzleQuantity"
                    type="number"
                    value={formData.nozzleQuantity}
                    onChange={(e) => handleInputChange("nozzleQuantity", parseInt(e.target.value) || 0)}
                    placeholder="Ex: 24"
                    data-testid="input-nozzle-quantity"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Características da Neblina */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Cloud className="w-5 h-5 mr-2 text-primary" />
                Características da Neblina
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <Label htmlFor="dropletSize">Tamanho das Gotículas (μm)</Label>
                  <Input
                    id="dropletSize"
                    type="number"
                    value={formData.dropletSize}
                    onChange={(e) => handleInputChange("dropletSize", parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 100"
                    data-testid="input-droplet-size"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Dv0.9 &lt; 1000 μm (NFPA 750)</p>
                </div>
                
                <div>
                  <Label htmlFor="dischargeDensity">Densidade de Descarga (L/min/m²)</Label>
                  <Input
                    id="dischargeDensity"
                    type="number"
                    value={formData.dischargeDensity}
                    onChange={(e) => handleInputChange("dischargeDensity", parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 2.5"
                    data-testid="input-discharge-density"
                  />
                </div>
                
                <div>
                  <Label htmlFor="pressureRating">Pressão do Sistema (psi)</Label>
                  <Input
                    id="pressureRating"
                    type="number"
                    value={formData.pressureRating}
                    onChange={(e) => handleInputChange("pressureRating", parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 1200"
                    data-testid="input-pressure-rating"
                  />
                </div>
                
                <div>
                  <Label htmlFor="flowRate">Taxa de Fluxo (L/min)</Label>
                  <Input
                    id="flowRate"
                    type="number"
                    value={formData.flowRate}
                    onChange={(e) => handleInputChange("flowRate", parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 150"
                    data-testid="input-flow-rate"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sistema de Pressurização */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gauge className="w-5 h-5 mr-2 text-primary" />
                Sistema de Pressurização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="pumpCondition">Condição da Bomba de Alta Pressão</Label>
                  <Select
                    value={formData.pumpCondition}
                    onValueChange={(value) => handleInputChange("pumpCondition", value)}
                  >
                    <SelectTrigger data-testid="select-pump-condition">
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
                  <Label htmlFor="accumulatorCondition">Condição do Acumulador</Label>
                  <Select
                    value={formData.accumulatorCondition}
                    onValueChange={(value) => handleInputChange("accumulatorCondition", value)}
                  >
                    <SelectTrigger data-testid="select-accumulator-condition">
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
                  <Label htmlFor="pressureVesselCondition">Condição do Vaso de Pressão</Label>
                  <Select
                    value={formData.pressureVesselCondition}
                    onValueChange={(value) => handleInputChange("pressureVesselCondition", value)}
                  >
                    <SelectTrigger data-testid="select-pressure-vessel-condition">
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
                  <Label htmlFor="operatingPressure">Pressão de Operação (psi)</Label>
                  <Input
                    id="operatingPressure"
                    type="number"
                    value={formData.operatingPressure}
                    onChange={(e) => handleInputChange("operatingPressure", parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 1150"
                    data-testid="input-operating-pressure"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bicos e Distribuição */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Droplets className="w-5 h-5 mr-2 text-primary" />
                Bicos e Distribuição
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
                  <Label htmlFor="distributionPattern">Padrão de Distribuição</Label>
                  <Select
                    value={formData.distributionPattern}
                    onValueChange={(value) => handleInputChange("distributionPattern", value)}
                  >
                    <SelectTrigger data-testid="select-distribution-pattern">
                      <SelectValue placeholder="Selecione o padrão" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uniform">Uniforme</SelectItem>
                      <SelectItem value="partial">Parcial</SelectItem>
                      <SelectItem value="irregular">Irregular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="coverageUniformity">Uniformidade de Cobertura</Label>
                  <Select
                    value={formData.coverageUniformity}
                    onValueChange={(value) => handleInputChange("coverageUniformity", value)}
                  >
                    <SelectTrigger data-testid="select-coverage-uniformity">
                      <SelectValue placeholder="Selecione a uniformidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excelente</SelectItem>
                      <SelectItem value="good">Boa</SelectItem>
                      <SelectItem value="fair">Regular</SelectItem>
                      <SelectItem value="poor">Ruim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="penetrationEfficiency">Eficiência de Penetração</Label>
                  <Select
                    value={formData.penetrationEfficiency}
                    onValueChange={(value) => handleInputChange("penetrationEfficiency", value)}
                  >
                    <SelectTrigger data-testid="select-penetration-efficiency">
                      <SelectValue placeholder="Selecione a eficiência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sistema de Controle */}
          <Card>
            <CardHeader>
              <CardTitle>Sistema de Controle e Ativação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="controlSystemCondition">Condição do Sistema de Controle</Label>
                  <Select
                    value={formData.controlSystemCondition}
                    onValueChange={(value) => handleInputChange("controlSystemCondition", value)}
                  >
                    <SelectTrigger data-testid="select-control-system-condition">
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
                
                <div>
                  <Label htmlFor="responseTime">Tempo de Resposta (segundos)</Label>
                  <Input
                    id="responseTime"
                    type="number"
                    value={formData.responseTime}
                    onChange={(e) => handleInputChange("responseTime", parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 3"
                    data-testid="input-response-time"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Tempo até descarga inicial</p>
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
            <Cloud className="h-4 w-4 text-primary" />
            <AlertDescription className="text-primary">
              <strong>NFPA 750 - Sistemas de Neblina de Água:</strong> Inspeções mensais obrigatórias incluindo verificação de pressão, qualidade da neblina e eficiência de penetração. Monitorar tamanho das gotículas conforme especificações.
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
                  As assinaturas digitais são obrigatórias e conferem validade legal ao documento NFPA 750.
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
                  defaultName={clientName || ""}
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
                  <li>• As assinaturas confirmam a veracidade das informações da inspeção NFPA 750</li>
                  <li>• É obrigatório que ambas as partes assinem antes de gerar o PDF final</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* FormActions */}
          <FormActions
            formData={formData}
            formTitle="Inspeção de Sistema de Névoa de Água"
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