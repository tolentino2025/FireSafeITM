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
  Wind, 
  Save, 
  Send, 
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Gauge,
  Thermometer,
  Clock
} from "lucide-react";
import { Link } from "wouter";

interface DrySprinklerInspection {
  facilityName: string;
  systemLocation: string;
  inspectionDate: string;
  inspectorName: string;
  
  // Pressões do Sistema
  airPressure: number;
  waterPressure: number;
  tripTestPressure: number;
  
  // Teste de Disparo
  tripTestTime: number;
  waterDeliveryTime: number;
  tripTestResults: string;
  
  // Inspeção de Componentes
  dryValveCondition: string;
  compressorCondition: string;
  airSupplyCondition: string;
  drainageCondition: string;
  
  // Condições Ambientais
  temperature: number;
  freezeProtection: boolean;
  
  // Deficiências e Ações
  deficienciesFound: string;
  correctiveActions: string;
  
  // Status
  systemOperational: boolean;
  inspectionPassed: boolean;
  
  // Observações
  additionalNotes: string;
}

export default function DrySprinklerForm() {
  const [formData, setFormData] = useState<DrySprinklerInspection>({
    facilityName: "",
    systemLocation: "",
    inspectionDate: new Date().toISOString().split('T')[0],
    inspectorName: "",
    airPressure: 0,
    waterPressure: 0,
    tripTestPressure: 0,
    tripTestTime: 0,
    waterDeliveryTime: 0,
    tripTestResults: "",
    dryValveCondition: "",
    compressorCondition: "",
    airSupplyCondition: "",
    drainageCondition: "",
    temperature: 5,
    freezeProtection: true,
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

  const handleInputChange = (field: keyof DrySprinklerInspection, value: any) => {
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
      description: "Inspeção de sistema de tubo seco salva com sucesso.",
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
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Wind className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Inspeção de Sistemas de Sprinklers de Tubo Seco
                </h1>
                <p className="text-muted-foreground">
                  Formulário NFPA 25 - Inspeção Mensal de Sistemas Pressurizados com Ar/Nitrogênio
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
              <Wind className="w-3 h-3 mr-1" />
              Tubo Seco
            </Badge>
          </div>
        </div>

        <div className="space-y-8">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
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
                    placeholder="Ex: Estacionamento não aquecido"
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

          {/* Pressões do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gauge className="w-5 h-5 mr-2 text-primary" />
                Pressões do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="airPressure">Pressão de Ar/Nitrogênio (psi)</Label>
                  <Input
                    id="airPressure"
                    type="number"
                    value={formData.airPressure}
                    onChange={(e) => handleInputChange("airPressure", parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 40"
                    data-testid="input-air-pressure"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Mínimo requerido: 20 psi</p>
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
                  <Label htmlFor="tripTestPressure">Pressão de Disparo (psi)</Label>
                  <Input
                    id="tripTestPressure"
                    type="number"
                    value={formData.tripTestPressure}
                    onChange={(e) => handleInputChange("tripTestPressure", parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 15"
                    data-testid="input-trip-pressure"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Pressão na qual a válvula dispara</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teste de Disparo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2 text-primary" />
                Teste de Disparo da Válvula
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="tripTestTime">Tempo de Disparo (segundos)</Label>
                  <Input
                    id="tripTestTime"
                    type="number"
                    value={formData.tripTestTime}
                    onChange={(e) => handleInputChange("tripTestTime", parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 45"
                    data-testid="input-trip-time"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Máximo permitido: 60 segundos</p>
                </div>
                
                <div>
                  <Label htmlFor="waterDeliveryTime">Tempo de Entrega de Água (segundos)</Label>
                  <Input
                    id="waterDeliveryTime"
                    type="number"
                    value={formData.waterDeliveryTime}
                    onChange={(e) => handleInputChange("waterDeliveryTime", parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 85"
                    data-testid="input-water-delivery-time"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Até o sprinkler mais remoto</p>
                </div>
                
                <div>
                  <Label htmlFor="tripTestResults">Resultado do Teste</Label>
                  <Select
                    value={formData.tripTestResults}
                    onValueChange={(value) => handleInputChange("tripTestResults", value)}
                  >
                    <SelectTrigger data-testid="select-trip-results">
                      <SelectValue placeholder="Resultado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passed">Aprovado</SelectItem>
                      <SelectItem value="failed">Reprovado</SelectItem>
                      <SelectItem value="marginal">Marginal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inspeção de Componentes */}
          <Card>
            <CardHeader>
              <CardTitle>Inspeção de Componentes Específicos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="dryValveCondition">Condição da Válvula Seca</Label>
                  <Select
                    value={formData.dryValveCondition}
                    onValueChange={(value) => handleInputChange("dryValveCondition", value)}
                  >
                    <SelectTrigger data-testid="select-dry-valve-condition">
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
                  <Label htmlFor="compressorCondition">Condição do Compressor</Label>
                  <Select
                    value={formData.compressorCondition}
                    onValueChange={(value) => handleInputChange("compressorCondition", value)}
                  >
                    <SelectTrigger data-testid="select-compressor-condition">
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
                  <Label htmlFor="airSupplyCondition">Condição do Suprimento de Ar</Label>
                  <Select
                    value={formData.airSupplyCondition}
                    onValueChange={(value) => handleInputChange("airSupplyCondition", value)}
                  >
                    <SelectTrigger data-testid="select-air-supply-condition">
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
                  <Label htmlFor="drainageCondition">Condição da Drenagem</Label>
                  <Select
                    value={formData.drainageCondition}
                    onValueChange={(value) => handleInputChange("drainageCondition", value)}
                  >
                    <SelectTrigger data-testid="select-drainage-condition">
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

          {/* Condições Ambientais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Thermometer className="w-5 h-5 mr-2 text-primary" />
                Condições Ambientais e Proteção contra Congelamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="temperature">Temperatura Ambiente (°C)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    value={formData.temperature}
                    onChange={(e) => handleInputChange("temperature", parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 2"
                    data-testid="input-temperature"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Temperatura no local da válvula seca</p>
                </div>
                
                <div className="flex items-center space-x-2 mt-6">
                  <Checkbox
                    id="freezeProtection"
                    checked={formData.freezeProtection}
                    onCheckedChange={(checked) => handleInputChange("freezeProtection", checked)}
                    data-testid="checkbox-freeze-protection"
                  />
                  <Label htmlFor="freezeProtection">Proteção contra Congelamento Adequada</Label>
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
            <Wind className="h-4 w-4 text-primary" />
            <AlertDescription className="text-primary">
              <strong>NFPA 25 - Sistemas de Tubo Seco:</strong> Inspeções mensais obrigatórias incluindo teste de disparo da válvula seca. O tempo de entrega de água até o sprinkler mais remoto não deve exceder os tempos estabelecidos na norma.
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