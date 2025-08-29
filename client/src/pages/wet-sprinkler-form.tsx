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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Droplets, 
  Save, 
  Send, 
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Clock,
  Eye,
  Gauge
} from "lucide-react";
import { Link } from "wouter";

interface WetPipeInspectionData {
  // Informações Gerais
  propertyName: string;
  address: string;
  inspector: string;
  date: string;
  inspectionFrequency: string;
  
  // Inspeções Diárias
  dailyValveEnclosureTemp: string; // sim/não/na
  
  // Inspeções Semanais
  weeklyControlValves: string; // sim/não/na
  weeklyPIVs: string; // sim/não/na
  weeklyBackflowDevice: string; // sim/não/na
  
  // Inspeções Mensais
  monthlyGaugesCondition: string; // sim/não/na
  monthlyAirPressureMaintained: string; // sim/não/na
  monthlyAirPressureValue: number;
  
  // Inspeções Trimestrais
  quarterlyWaterFlowAlarms: string; // sim/não/na
  quarterlyAlarmCheckValve: string; // sim/não/na
  quarterlyFireDeptConnections: string; // sim/não/na
  
  // Inspeções Anuais
  annualSprinklersCondition: string; // sim/não/na
  annualSpareSprinklers: string; // sim/não/na
  annualPipingCondition: string; // sim/não/na
  annualHydraulicPlate: string; // sim/não/na
  
  // Inspeções de 5 Anos
  fiveYearInternalInspection: string; // sim/não/na
  fiveYearObstructionInspection: string; // sim/não/na
  
  // Testes
  testMainDrain: string; // sim/não/na
  testControlValves: string; // sim/não/na
  testAntifreeze: string; // sim/não/na
  
  // Observações
  deficiencies: string;
  correctiveActions: string;
  additionalNotes: string;
}

export default function WetSprinklerForm() {
  const [formData, setFormData] = useState<WetPipeInspectionData>({
    propertyName: "",
    address: "",
    inspector: "",
    date: new Date().toISOString().split('T')[0],
    inspectionFrequency: "",
    dailyValveEnclosureTemp: "",
    weeklyControlValves: "",
    weeklyPIVs: "",
    weeklyBackflowDevice: "",
    monthlyGaugesCondition: "",
    monthlyAirPressureMaintained: "",
    monthlyAirPressureValue: 0,
    quarterlyWaterFlowAlarms: "",
    quarterlyAlarmCheckValve: "",
    quarterlyFireDeptConnections: "",
    annualSprinklersCondition: "",
    annualSpareSprinklers: "",
    annualPipingCondition: "",
    annualHydraulicPlate: "",
    fiveYearInternalInspection: "",
    fiveYearObstructionInspection: "",
    testMainDrain: "",
    testControlValves: "",
    testAntifreeze: "",
    deficiencies: "",
    correctiveActions: "",
    additionalNotes: ""
  });

  const { toast } = useToast();

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const handleInputChange = (field: keyof WetPipeInspectionData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.propertyName || !formData.address || !formData.inspector) {
      toast({
        title: "Erro de Validação",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Inspeção de sistema de tubo molhado salva com sucesso.",
    });
  };

  const renderRadioGroup = (field: keyof WetPipeInspectionData, value: string) => (
    <RadioGroup 
      value={value} 
      onValueChange={(val) => handleInputChange(field, val)}
      className="flex space-x-6"
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="sim" id={`${field}-sim`} />
        <Label htmlFor={`${field}-sim`} className="text-green-600 font-medium">Sim</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="não" id={`${field}-não`} />
        <Label htmlFor={`${field}-não`} className="text-red-600 font-medium">Não</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="na" id={`${field}-na`} />
        <Label htmlFor={`${field}-na`} className="text-gray-600 font-medium">N/A</Label>
      </div>
    </RadioGroup>
  );

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
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Droplets className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Inspeção de Sistemas de Sprinklers de Tubo Molhado
                </h1>
                <p className="text-muted-foreground">
                  Formulário NFPA 25 - Lista de Verificação de Conformidade
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Droplets className="w-3 h-3 mr-1" />
              Tubo Molhado
            </Badge>
          </div>
        </div>

        <div className="space-y-8">
          {/* Informações Gerais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2 text-primary" />
                Informações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="propertyName">Nome da Propriedade *</Label>
                  <Input
                    id="propertyName"
                    value={formData.propertyName}
                    onChange={(e) => handleInputChange("propertyName", e.target.value)}
                    placeholder="Nome da propriedade"
                    data-testid="input-property-name"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Endereço *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Endereço completo"
                    data-testid="input-address"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="inspector">Inspetor *</Label>
                  <Input
                    id="inspector"
                    value={formData.inspector}
                    onChange={(e) => handleInputChange("inspector", e.target.value)}
                    placeholder={(user as any)?.fullName || "Nome do inspetor"}
                    data-testid="input-inspector"
                  />
                </div>
                <div>
                  <Label htmlFor="date">Data *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    data-testid="input-date"
                  />
                </div>
                <div>
                  <Label htmlFor="inspectionFrequency">Frequência de Inspeção</Label>
                  <Select
                    value={formData.inspectionFrequency}
                    onValueChange={(value) => handleInputChange("inspectionFrequency", value)}
                  >
                    <SelectTrigger data-testid="select-frequency">
                      <SelectValue placeholder="Selecione a frequência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diária">Diária</SelectItem>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="mensal">Mensal</SelectItem>
                      <SelectItem value="trimestral">Trimestral</SelectItem>
                      <SelectItem value="anual">Anual</SelectItem>
                      <SelectItem value="5anos">5 Anos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inspeções Diárias */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-orange-600" />
                Inspeções Diárias (Apenas em Clima Frio)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium mb-3 block">
                  O invólucro da válvula, se não equipado com alarme de baixa temperatura, foi inspecionado para verificar a temperatura mínima de 4°C (40°F)?
                </Label>
                {renderRadioGroup("dailyValveEnclosureTemp", formData.dailyValveEnclosureTemp)}
              </div>
            </CardContent>
          </Card>

          {/* Inspeções Semanais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Inspeções Semanais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Válvulas de Controle: Estão na posição correta (aberta/fechada), seladas, acessíveis e com sinalização adequada?
                </Label>
                {renderRadioGroup("weeklyControlValves", formData.weeklyControlValves)}
              </div>
              
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Válvulas Indicadoras de Posição (PIVs): Estão com as chaves corretas e sem danos ou vazamentos?
                </Label>
                {renderRadioGroup("weeklyPIVs", formData.weeklyPIVs)}
              </div>
              
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Dispositivo de Prevenção de Refluxo (Backflow): As válvulas de isolamento estão abertas e supervisionadas?
                </Label>
                {renderRadioGroup("weeklyBackflowDevice", formData.weeklyBackflowDevice)}
              </div>
            </CardContent>
          </Card>

          {/* Inspeções Mensais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-green-600" />
                Inspeções Mensais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Manômetros (Gauges): Estão em boas condições de operação?
                </Label>
                {renderRadioGroup("monthlyGaugesCondition", formData.monthlyGaugesCondition)}
              </div>
              
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Manômetros (Gauges): A pressão de ar/nitrogênio (se não supervisionada) está mantida?
                </Label>
                {renderRadioGroup("monthlyAirPressureMaintained", formData.monthlyAirPressureMaintained)}
                <div className="mt-3">
                  <Label htmlFor="airPressureValue">Pressão (psi)</Label>
                  <Input
                    id="airPressureValue"
                    type="number"
                    value={formData.monthlyAirPressureValue}
                    onChange={(e) => handleInputChange("monthlyAirPressureValue", parseFloat(e.target.value) || 0)}
                    placeholder="Ex: 40"
                    className="w-32"
                    data-testid="input-air-pressure"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inspeções Trimestrais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                Inspeções Trimestrais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Dispositivos de Alarme de Fluxo de Água: Estão livres de danos físicos?
                </Label>
                {renderRadioGroup("quarterlyWaterFlowAlarms", formData.quarterlyWaterFlowAlarms)}
              </div>
              
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Válvula de Alarme/Retenção (Alarm/Riser Check): Os drenos da câmara de retardo não estão vazando?
                </Label>
                {renderRadioGroup("quarterlyAlarmCheckValve", formData.quarterlyAlarmCheckValve)}
              </div>
              
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Conexões do Corpo de Bombeiros: Estão visíveis, acessíveis, com tampas, juntas e sinalização de identificação no lugar?
                </Label>
                {renderRadioGroup("quarterlyFireDeptConnections", formData.quarterlyFireDeptConnections)}
              </div>
            </CardContent>
          </Card>

          {/* Inspeções Anuais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-red-600" />
                Inspeções Anuais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Sprinklers (Visíveis): Estão livres de danos, vazamentos, corrosão, pintura (não aplicada pelo fabricante) e obstruções?
                </Label>
                {renderRadioGroup("annualSprinklersCondition", formData.annualSprinklersCondition)}
              </div>
              
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Sprinklers de Reposição: O número e tipo de sprinklers sobressalentes, incluindo a chave de instalação, estão corretos?
                </Label>
                {renderRadioGroup("annualSpareSprinklers", formData.annualSpareSprinklers)}
              </div>
              
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Tubulações e Conexões (Visíveis): Estão em boas condições, sem corrosão externa, vazamentos ou danos mecânicos?
                </Label>
                {renderRadioGroup("annualPipingCondition", formData.annualPipingCondition)}
              </div>
              
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Placa de Informação Hidráulica: Está fixada de forma segura e legível?
                </Label>
                {renderRadioGroup("annualHydraulicPlate", formData.annualHydraulicPlate)}
              </div>
            </CardContent>
          </Card>

          {/* Inspeções de Cinco Anos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                Inspeções de Cinco Anos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Inspeção Interna: O interior da válvula de alarme foi inspecionado (filtros, orifícios)?
                </Label>
                {renderRadioGroup("fiveYearInternalInspection", formData.fiveYearInternalInspection)}
              </div>
              
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Inspeção de Obstrução: Foi verificado se não há material estranho obstruindo a tubulação?
                </Label>
                {renderRadioGroup("fiveYearObstructionInspection", formData.fiveYearObstructionInspection)}
              </div>
            </CardContent>
          </Card>

          {/* Testes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gauge className="w-5 h-5 mr-2 text-cyan-600" />
                Testes (Trimestrais, Semestrais, Anuais)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Teste do Dreno Principal (Main Drain Test): Os resultados diferem mais de 10% do teste anterior?
                </Label>
                {renderRadioGroup("testMainDrain", formData.testMainDrain)}
              </div>
              
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Teste de Válvulas de Controle: Todas as válvulas de controle foram operadas em todo o seu curso e retornadas à posição normal? (Anual)
                </Label>
                {renderRadioGroup("testControlValves", formData.testControlValves)}
              </div>
              
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Teste de Anticongelante: A solução anticongelante foi testada? (Anual)
                </Label>
                {renderRadioGroup("testAntifreeze", formData.testAntifreeze)}
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
                <Label htmlFor="deficiencies">Deficiências Encontradas</Label>
                <Textarea
                  id="deficiencies"
                  rows={4}
                  value={formData.deficiencies}
                  onChange={(e) => handleInputChange("deficiencies", e.target.value)}
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
            <Droplets className="h-4 w-4 text-primary" />
            <AlertDescription className="text-primary">
              <strong>NFPA 25 - Sistemas de Tubo Molhado:</strong> Esta lista de verificação cobre todos os requisitos de inspeção, teste e manutenção para sistemas de sprinklers de tubo molhado conforme estabelecido na norma NFPA 25.
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