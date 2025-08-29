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
  Zap, 
  Save, 
  Send, 
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Gauge,
  Settings,
  Shield
} from "lucide-react";
import { Link } from "wouter";

interface PreActionInspection {
  facilityName: string;
  systemLocation: string;
  inspectionDate: string;
  inspectorName: string;
  systemType: string; // preaction, deluge
  
  // Sistema de Detecção
  detectionSystemType: string;
  detectorCondition: string;
  controlPanelCondition: string;
  detectionTestResults: string;
  
  // Válvula de Pré-Ação/Dilúvio
  valveCondition: string;
  releaseTestResults: string;
  solenoidCondition: string;
  
  // Pressões
  airPressure: number;
  waterPressure: number;
  releaseTime: number;
  
  // Sprinklers/Bicos
  sprinklerCondition: string;
  sprinklerQuantity: number;
  
  // Deficiências e Ações
  deficienciesFound: string;
  correctiveActions: string;
  
  // Status
  systemOperational: boolean;
  inspectionPassed: boolean;
  
  // Observações
  additionalNotes: string;
}

export default function PreActionDelugeForm() {
  const [formData, setFormData] = useState<PreActionInspection>({
    facilityName: "",
    systemLocation: "",
    inspectionDate: new Date().toISOString().split('T')[0],
    inspectorName: "",
    systemType: "",
    detectionSystemType: "",
    detectorCondition: "",
    controlPanelCondition: "",
    detectionTestResults: "",
    valveCondition: "",
    releaseTestResults: "",
    solenoidCondition: "",
    airPressure: 0,
    waterPressure: 0,
    releaseTime: 0,
    sprinklerCondition: "",
    sprinklerQuantity: 0,
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

  const handleInputChange = (field: keyof PreActionInspection, value: any) => {
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
      description: "Inspeção de sistema de pré-ação/dilúvio salva com sucesso.",
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
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Inspeção de Sistemas de Pré-Ação/Dilúvio
                </h1>
                <p className="text-muted-foreground">
                  Formulário NFPA 25 - Inspeção Trimestral de Sistemas com Dupla Ativação
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              <Zap className="w-3 h-3 mr-1" />
              Pré-Ação/Dilúvio
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
                    placeholder="Ex: Data Center, Sala de Servidores"
                    data-testid="input-system-location"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      <SelectItem value="preaction">Pré-Ação</SelectItem>
                      <SelectItem value="deluge">Dilúvio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sistema de Detecção */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-primary" />
                Sistema de Detecção
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="detectionSystemType">Tipo de Sistema de Detecção</Label>
                  <Select
                    value={formData.detectionSystemType}
                    onValueChange={(value) => handleInputChange("detectionSystemType", value)}
                  >
                    <SelectTrigger data-testid="select-detection-type">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="smoke">Detecção de Fumaça</SelectItem>
                      <SelectItem value="heat">Detecção de Calor</SelectItem>
                      <SelectItem value="flame">Detecção de Chama</SelectItem>
                      <SelectItem value="aspirating">Sistema Aspirado</SelectItem>
                      <SelectItem value="multi">Multi-Critério</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="detectorCondition">Condição dos Detectores</Label>
                  <Select
                    value={formData.detectorCondition}
                    onValueChange={(value) => handleInputChange("detectorCondition", value)}
                  >
                    <SelectTrigger data-testid="select-detector-condition">
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
                  <Label htmlFor="controlPanelCondition">Condição do Painel de Controle</Label>
                  <Select
                    value={formData.controlPanelCondition}
                    onValueChange={(value) => handleInputChange("controlPanelCondition", value)}
                  >
                    <SelectTrigger data-testid="select-control-panel-condition">
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
                  <Label htmlFor="detectionTestResults">Resultado do Teste de Detecção</Label>
                  <Select
                    value={formData.detectionTestResults}
                    onValueChange={(value) => handleInputChange("detectionTestResults", value)}
                  >
                    <SelectTrigger data-testid="select-detection-results">
                      <SelectValue placeholder="Resultado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passed">Aprovado</SelectItem>
                      <SelectItem value="failed">Reprovado</SelectItem>
                      <SelectItem value="partial">Parcial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Válvula Principal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2 text-primary" />
                Válvula de Pré-Ação/Dilúvio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="valveCondition">Condição da Válvula</Label>
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
                
                <div>
                  <Label htmlFor="releaseTestResults">Resultado do Teste de Liberação</Label>
                  <Select
                    value={formData.releaseTestResults}
                    onValueChange={(value) => handleInputChange("releaseTestResults", value)}
                  >
                    <SelectTrigger data-testid="select-release-results">
                      <SelectValue placeholder="Resultado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passed">Aprovado</SelectItem>
                      <SelectItem value="failed">Reprovado</SelectItem>
                      <SelectItem value="marginal">Marginal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="solenoidCondition">Condição da Solenóide</Label>
                  <Select
                    value={formData.solenoidCondition}
                    onValueChange={(value) => handleInputChange("solenoidCondition", value)}
                  >
                    <SelectTrigger data-testid="select-solenoid-condition">
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
            </CardContent>
          </Card>

          {/* Pressões e Tempos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gauge className="w-5 h-5 mr-2 text-primary" />
                Pressões e Tempos de Resposta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="airPressure">Pressão de Ar (psi)</Label>
                  <Input
                    id="airPressure"
                    type="number"
                    value={formData.airPressure}
                    onChange={(e) => handleInputChange("airPressure", parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 40"
                    data-testid="input-air-pressure"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Apenas para sistemas de pré-ação</p>
                </div>
                
                <div>
                  <Label htmlFor="waterPressure">Pressão de Água (psi)</Label>
                  <Input
                    id="waterPressure"
                    type="number"
                    value={formData.waterPressure}
                    onChange={(e) => handleInputChange("waterPressure", parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 175"
                    data-testid="input-water-pressure"
                  />
                </div>
                
                <div>
                  <Label htmlFor="releaseTime">Tempo de Liberação (segundos)</Label>
                  <Input
                    id="releaseTime"
                    type="number"
                    value={formData.releaseTime}
                    onChange={(e) => handleInputChange("releaseTime", parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 15"
                    data-testid="input-release-time"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Tempo desde a detecção até liberação</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sprinklers/Bicos */}
          <Card>
            <CardHeader>
              <CardTitle>Sprinklers/Bicos de Aspersão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="sprinklerCondition">Condição dos Sprinklers/Bicos</Label>
                  <Select
                    value={formData.sprinklerCondition}
                    onValueChange={(value) => handleInputChange("sprinklerCondition", value)}
                  >
                    <SelectTrigger data-testid="select-sprinkler-condition">
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
                  <Label htmlFor="sprinklerQuantity">Quantidade de Sprinklers/Bicos</Label>
                  <Input
                    id="sprinklerQuantity"
                    type="number"
                    value={formData.sprinklerQuantity}
                    onChange={(e) => handleInputChange("sprinklerQuantity", parseInt(e.target.value) || 0)}
                    placeholder="Ex: 48"
                    data-testid="input-sprinkler-quantity"
                  />
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
            <Zap className="h-4 w-4 text-primary" />
            <AlertDescription className="text-primary">
              <strong>NFPA 25 - Sistemas de Pré-Ação/Dilúvio:</strong> Inspeções trimestrais obrigatórias incluindo teste do sistema de detecção e liberação da válvula. Verificar se ambos os eventos independentes funcionam corretamente.
            </AlertDescription>
          </Alert>

          {/* Form Actions */}
          <div className="flex justify-between">
            <Link href="/sprinkler-module">
              <Button variant="outline" data-testid="button-cancel">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </Link>
            
            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleSubmit} data-testid="button-save-draft">
                <Save className="w-4 h-4 mr-2" />
                Salvar Rascunho
              </Button>
              <Button className="bg-primary hover:bg-primary/90" onClick={handleSubmit} data-testid="button-submit">
                <Send className="w-4 h-4 mr-2" />
                Enviar Inspeção
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}