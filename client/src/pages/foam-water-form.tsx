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
  Waves, 
  Save, 
  Send, 
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Gauge,
  Droplets,
  Beaker,
  CheckCircle
} from "lucide-react";
import { FinalizeInspectionButton } from "@/components/inspection/finalize-inspection-button";
import { Link } from "wouter";

interface FoamWaterInspection {
  facilityName: string;
  systemLocation: string;
  inspectionDate: string;
  inspectorName: string;
  
  // Sistema de Espuma
  foamConcentrateType: string;
  foamConcentrateLevel: number;
  foamConcentrateCondition: string;
  proportionerCondition: string;
  
  // Pressões e Fluxos
  waterPressure: number;
  foamPressure: number;
  proportionRate: number;
  expansionRatio: number;
  
  // Teste de Funcionamento
  dischargeDensity: number;
  coverageArea: number;
  dischargeTime: number;
  foamQuality: string;
  
  // Componentes do Sistema
  sprinklerCondition: string;
  pipingCondition: string;
  tankCondition: string;
  pumpCondition: string;
  
  // Deficiências e Ações
  deficienciesFound: string;
  correctiveActions: string;
  
  // Status
  systemOperational: boolean;
  inspectionPassed: boolean;
  
  // Observações
  additionalNotes: string;
}

export default function FoamWaterForm() {
  const [formData, setFormData] = useState<FoamWaterInspection>({
    facilityName: "",
    systemLocation: "",
    inspectionDate: new Date().toISOString().split('T')[0],
    inspectorName: "",
    foamConcentrateType: "",
    foamConcentrateLevel: 0,
    foamConcentrateCondition: "",
    proportionerCondition: "",
    waterPressure: 0,
    foamPressure: 0,
    proportionRate: 0,
    expansionRatio: 0,
    dischargeDensity: 0,
    coverageArea: 0,
    dischargeTime: 0,
    foamQuality: "",
    sprinklerCondition: "",
    pipingCondition: "",
    tankCondition: "",
    pumpCondition: "",
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

  const handleInputChange = (field: keyof FoamWaterInspection, value: any) => {
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
      description: "Inspeção de sistema de espuma-água salva com sucesso.",
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
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Waves className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Inspeção de Sistemas de Sprinklers de Espuma-Água
                </h1>
                <p className="text-muted-foreground">
                  Formulário NFPA 25 - Inspeção Mensal de Sistemas de Supressão com Espuma
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              <Waves className="w-3 h-3 mr-1" />
              Espuma-Água
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
                    placeholder="Ex: Hangar de Aeronaves, Área de Combustíveis"
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

          {/* Sistema de Espuma */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Beaker className="w-5 h-5 mr-2 text-primary" />
                Sistema de Concentrado de Espuma
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="foamConcentrateType">Tipo de Concentrado de Espuma</Label>
                  <Select
                    value={formData.foamConcentrateType}
                    onValueChange={(value) => handleInputChange("foamConcentrateType", value)}
                  >
                    <SelectTrigger data-testid="select-foam-type">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="afff">AFFF (Aqueous Film Forming Foam)</SelectItem>
                      <SelectItem value="ar-afff">AR-AFFF (Alcohol Resistant)</SelectItem>
                      <SelectItem value="protein">Protein Foam</SelectItem>
                      <SelectItem value="fluoroprotein">Fluoroprotein Foam</SelectItem>
                      <SelectItem value="high-expansion">High Expansion Foam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="foamConcentrateLevel">Nível do Concentrado (%)</Label>
                  <Input
                    id="foamConcentrateLevel"
                    type="number"
                    value={formData.foamConcentrateLevel}
                    onChange={(e) => handleInputChange("foamConcentrateLevel", parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 85"
                    data-testid="input-foam-level"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Nível no tanque de armazenamento</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="foamConcentrateCondition">Condição do Concentrado</Label>
                  <Select
                    value={formData.foamConcentrateCondition}
                    onValueChange={(value) => handleInputChange("foamConcentrateCondition", value)}
                  >
                    <SelectTrigger data-testid="select-foam-condition">
                      <SelectValue placeholder="Selecione a condição" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excelente</SelectItem>
                      <SelectItem value="good">Boa</SelectItem>
                      <SelectItem value="fair">Regular</SelectItem>
                      <SelectItem value="poor">Ruim</SelectItem>
                      <SelectItem value="expired">Vencido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="proportionerCondition">Condição do Proporcionador</Label>
                  <Select
                    value={formData.proportionerCondition}
                    onValueChange={(value) => handleInputChange("proportionerCondition", value)}
                  >
                    <SelectTrigger data-testid="select-proportioner-condition">
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

          {/* Pressões e Fluxos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gauge className="w-5 h-5 mr-2 text-primary" />
                Pressões e Taxas de Proporção
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <Label htmlFor="waterPressure">Pressão de Água (psi)</Label>
                  <Input
                    id="waterPressure"
                    type="number"
                    value={formData.waterPressure}
                    onChange={(e) => handleInputChange("waterPressure", parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 100"
                    data-testid="input-water-pressure"
                  />
                </div>
                
                <div>
                  <Label htmlFor="foamPressure">Pressão de Espuma (psi)</Label>
                  <Input
                    id="foamPressure"
                    type="number"
                    value={formData.foamPressure}
                    onChange={(e) => handleInputChange("foamPressure", parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 105"
                    data-testid="input-foam-pressure"
                  />
                </div>
                
                <div>
                  <Label htmlFor="proportionRate">Taxa de Proporção (%)</Label>
                  <Input
                    id="proportionRate"
                    type="number"
                    value={formData.proportionRate}
                    onChange={(e) => handleInputChange("proportionRate", parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 3"
                    data-testid="input-proportion-rate"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Percentual de espuma na mistura</p>
                </div>
                
                <div>
                  <Label htmlFor="expansionRatio">Taxa de Expansão</Label>
                  <Input
                    id="expansionRatio"
                    type="number"
                    value={formData.expansionRatio}
                    onChange={(e) => handleInputChange("expansionRatio", parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 7"
                    data-testid="input-expansion-ratio"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Razão de expansão da espuma</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teste de Funcionamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Droplets className="w-5 h-5 mr-2 text-primary" />
                Teste de Descarga e Funcionamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <Label htmlFor="dischargeDensity">Densidade de Descarga (gpm/ft²)</Label>
                  <Input
                    id="dischargeDensity"
                    type="number"
                    value={formData.dischargeDensity}
                    onChange={(e) => handleInputChange("dischargeDensity", parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 0.16"
                    data-testid="input-discharge-density"
                  />
                </div>
                
                <div>
                  <Label htmlFor="coverageArea">Área de Cobertura (ft²)</Label>
                  <Input
                    id="coverageArea"
                    type="number"
                    value={formData.coverageArea}
                    onChange={(e) => handleInputChange("coverageArea", parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 1500"
                    data-testid="input-coverage-area"
                  />
                </div>
                
                <div>
                  <Label htmlFor="dischargeTime">Tempo de Descarga (min)</Label>
                  <Input
                    id="dischargeTime"
                    type="number"
                    value={formData.dischargeTime}
                    onChange={(e) => handleInputChange("dischargeTime", parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 10"
                    data-testid="input-discharge-time"
                  />
                </div>
                
                <div>
                  <Label htmlFor="foamQuality">Qualidade da Espuma</Label>
                  <Select
                    value={formData.foamQuality}
                    onValueChange={(value) => handleInputChange("foamQuality", value)}
                  >
                    <SelectTrigger data-testid="select-foam-quality">
                      <SelectValue placeholder="Qualidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excelente</SelectItem>
                      <SelectItem value="good">Boa</SelectItem>
                      <SelectItem value="fair">Regular</SelectItem>
                      <SelectItem value="poor">Ruim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Componentes do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle>Inspeção de Componentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="sprinklerCondition">Condição dos Sprinklers</Label>
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
                  <Label htmlFor="pipingCondition">Condição da Tubulação</Label>
                  <Select
                    value={formData.pipingCondition}
                    onValueChange={(value) => handleInputChange("pipingCondition", value)}
                  >
                    <SelectTrigger data-testid="select-piping-condition">
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
                  <Label htmlFor="tankCondition">Condição do Tanque de Espuma</Label>
                  <Select
                    value={formData.tankCondition}
                    onValueChange={(value) => handleInputChange("tankCondition", value)}
                  >
                    <SelectTrigger data-testid="select-tank-condition">
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
                  <Label htmlFor="pumpCondition">Condição da Bomba</Label>
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
            <Waves className="h-4 w-4 text-primary" />
            <AlertDescription className="text-primary">
              <strong>NFPA 25 - Sistemas de Espuma-Água:</strong> Inspeções mensais obrigatórias incluindo verificação do concentrado de espuma, sistema proporcionador e teste de descarga. Monitorar qualidade e validade do concentrado.
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
              <FinalizeInspectionButton
                onFinalize={() => {
                  // Para este formulário simples, vamos direto para o submit
                  handleSubmit();
                }}
              />
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