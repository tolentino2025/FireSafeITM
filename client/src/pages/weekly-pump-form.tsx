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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Save, 
  Send, 
  ArrowLeft,
  AlertTriangle,
  Calendar,
  Home,
  Fuel,
  Zap,
  Cog
} from "lucide-react";
import { Link } from "wouter";

interface WeeklyPumpInspectionData {
  // Informações Gerais
  propertyName: string;
  address: string;
  inspector: string;
  date: string;
  
  // Casa de Bombas
  pumpHouseTemperature: string; // sim/não/na - ≥ 4°C (40°F)
  ventilationGrilles: string; // sim/não/na - livres para operar
  storageHousekeeping: string; // sim/não/na - em ordem
  dieselMotorTemperature: string; // sim/não/na - ≥ 21°C (70°F)
  
  // Sistemas Diesel
  dieselSuctionValves: string; // sim/não/na - abertas
  dieselPipesLeakage: string; // sim/não/na - sem vazamentos  
  dieselSuctionPressure: string; // sim/não/na - dentro da faixa
  dieselSystemPressure: string; // sim/não/na - dentro da faixa
  dieselSuctionReservoir: string; // sim/não/na - cheio
  
  // Sistemas Elétricos
  electricalControllerPilot: string; // sim/não/na - iluminado
  electricalTransferSwitch: string; // sim/não/na - iluminado  
  electricalIsolationSwitch: string; // sim/não/na - fechado/travado
  
  // Sistemas de Motor a Diesel
  dieselFuelTank: string; // sim/não/na - pelo menos 2/3 cheio
  dieselControllerSelector: string; // sim/não/na - posição "Auto"
  dieselBatteryReadings: string; // sim/não/na - aceitável
  dieselLoadCurrentReadings: string; // sim/não/na - dentro da faixa
  dieselOilLevel: string; // sim/não/na - dentro da faixa
  dieselCoolantLevel: string; // sim/não/na - dentro da faixa
  dieselWaterJacketHeater: string; // sim/não/na - operacional
  
  // Observações
  deficiencies: string;
  correctiveActions: string;
  additionalNotes: string;
}

export default function WeeklyPumpForm() {
  const [formData, setFormData] = useState<WeeklyPumpInspectionData>({
    propertyName: "",
    address: "",
    inspector: "",
    date: new Date().toISOString().split('T')[0],
    pumpHouseTemperature: "",
    ventilationGrilles: "",
    storageHousekeeping: "",
    dieselMotorTemperature: "",
    dieselSuctionValves: "",
    dieselPipesLeakage: "",
    dieselSuctionPressure: "",
    dieselSystemPressure: "",
    dieselSuctionReservoir: "",
    electricalControllerPilot: "",
    electricalTransferSwitch: "",
    electricalIsolationSwitch: "",
    dieselFuelTank: "",
    dieselControllerSelector: "",
    dieselBatteryReadings: "",
    dieselLoadCurrentReadings: "",
    dieselOilLevel: "",
    dieselCoolantLevel: "",
    dieselWaterJacketHeater: "",
    deficiencies: "",
    correctiveActions: "",
    additionalNotes: ""
  });

  const { toast } = useToast();

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const handleInputChange = (field: keyof WeeklyPumpInspectionData, value: any) => {
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
      description: "Inspeção semanal de bombas de incêndio salva com sucesso.",
    });
  };

  const renderRadioGroup = (field: keyof WeeklyPumpInspectionData, value: string) => (
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
              <Link href="/pump-module">
                <Button variant="ghost" size="sm" data-testid="button-back">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao Módulo
                </Button>
              </Link>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Inspeção Semanal de Bomba de Incêndio
                </h1>
                <p className="text-muted-foreground">
                  Formulário NFPA 25 - Lista de Verificação de Conformidade Semanal
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Calendar className="w-3 h-3 mr-1" />
              Semanal
            </Badge>
          </div>
        </div>

        <div className="space-y-8">
          {/* Informações Gerais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2 text-primary" />
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>
            </CardContent>
          </Card>

          {/* Casa de Bombas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Home className="w-5 h-5 mr-2 text-orange-600" />
                Casa de Bombas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <Label className="text-base font-medium mb-3 block">
                  A temperatura na casa de bombas é de 4°C (40°F) ou superior?
                </Label>
                {renderRadioGroup("pumpHouseTemperature", formData.pumpHouseTemperature)}
              </div>
              
              <div>
                <Label className="text-base font-medium mb-3 block">
                  As venezianas de ventilação estão livres para operar?
                </Label>
                {renderRadioGroup("ventilationGrilles", formData.ventilationGrilles)}
              </div>
              
              <div>
                <Label className="text-base font-medium mb-3 block">
                  A proteção de armazenamento está no lugar?
                </Label>
                {renderRadioGroup("storageHousekeeping", formData.storageHousekeeping)}
              </div>
              
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Para motores a diesel, a temperatura não é inferior a 21°C (70°F)?
                </Label>
                {renderRadioGroup("dieselMotorTemperature", formData.dieselMotorTemperature)}
              </div>
            </CardContent>
          </Card>

          {/* Sistemas Diesel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Fuel className="w-5 h-5 mr-2 text-yellow-600" />
                Sistemas Diesel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <Label className="text-base font-medium mb-3 block">
                  As válvulas de sucção, descarga e bypass estão abertas?
                </Label>
                {renderRadioGroup("dieselSuctionValves", formData.dieselSuctionValves)}
              </div>
              
              <div>
                <Label className="text-base font-medium mb-3 block">
                  As tubulações ou mangueiras não apresentam sinais de vazamentos?
                </Label>
                {renderRadioGroup("dieselPipesLeakage", formData.dieselPipesLeakage)}
              </div>
              
              <div>
                <Label className="text-base font-medium mb-3 block">
                  A pressão na linha de sucção está dentro da faixa aceitável?
                </Label>
                {renderRadioGroup("dieselSuctionPressure", formData.dieselSuctionPressure)}
              </div>
              
              <div>
                <Label className="text-base font-medium mb-3 block">
                  A pressão na linha do sistema está dentro da faixa aceitável?
                </Label>
                {renderRadioGroup("dieselSystemPressure", formData.dieselSystemPressure)}
              </div>
              
              <div>
                <Label className="text-base font-medium mb-3 block">
                  O reservatório de sucção está cheio?
                </Label>
                {renderRadioGroup("dieselSuctionReservoir", formData.dieselSuctionReservoir)}
              </div>
            </CardContent>
          </Card>

          {/* Sistemas Elétricos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2 text-blue-600" />
                Sistemas Elétricos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <Label className="text-base font-medium mb-3 block">
                  O piloto do controlador (energia ligada) está iluminado?
                </Label>
                {renderRadioGroup("electricalControllerPilot", formData.electricalControllerPilot)}
              </div>
              
              <div>
                <Label className="text-base font-medium mb-3 block">
                  A luz de energia normal da chave de transferência está iluminada?
                </Label>
                {renderRadioGroup("electricalTransferSwitch", formData.electricalTransferSwitch)}
              </div>
              
              <div>
                <Label className="text-base font-medium mb-3 block">
                  O interruptor de isolamento para energia de emergência (standby) está fechado?
                </Label>
                {renderRadioGroup("electricalIsolationSwitch", formData.electricalIsolationSwitch)}
              </div>
            </CardContent>
          </Card>

          {/* Sistemas de Motor a Diesel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Cog className="w-5 h-5 mr-2 text-green-600" />
                Sistemas de Motor a Diesel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <Label className="text-base font-medium mb-3 block">
                  O tanque de combustível diesel está pelo menos dois terços cheio?
                </Label>
                {renderRadioGroup("dieselFuelTank", formData.dieselFuelTank)}
              </div>
              
              <div>
                <Label className="text-base font-medium mb-3 block">
                  A chave seletora do controlador está na posição "Auto"?
                </Label>
                {renderRadioGroup("dieselControllerSelector", formData.dieselControllerSelector)}
              </div>
              
              <div>
                <Label className="text-base font-medium mb-3 block">
                  As leituras de tensão da bateria e carregador estão aceitável?
                </Label>
                {renderRadioGroup("dieselBatteryReadings", formData.dieselBatteryReadings)}
              </div>
              
              <div>
                <Label className="text-base font-medium mb-3 block">
                  As leituras de corrente de carga estão dentro da faixa aceitável?
                </Label>
                {renderRadioGroup("dieselLoadCurrentReadings", formData.dieselLoadCurrentReadings)}
              </div>
              
              <div>
                <Label className="text-base font-medium mb-3 block">
                  O nível de óleo do carter está dentro da faixa aceitável?
                </Label>
                {renderRadioGroup("dieselOilLevel", formData.dieselOilLevel)}
              </div>
              
              <div>
                <Label className="text-base font-medium mb-3 block">
                  O nível de água do sistema de resfriamento está dentro da faixa aceitável?
                </Label>
                {renderRadioGroup("dieselCoolantLevel", formData.dieselCoolantLevel)}
              </div>
              
              <div>
                <Label className="text-base font-medium mb-3 block">
                  O aquecedor da água da camisa está operacional?
                </Label>
                {renderRadioGroup("dieselWaterJacketHeater", formData.dieselWaterJacketHeater)}
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
            <Settings className="h-4 w-4 text-primary" />
            <AlertDescription className="text-primary">
              <strong>NFPA 25 - Inspeção Semanal de Bombas:</strong> Esta lista de verificação cobre todas as inspeções semanais obrigatórias para bombas de incêndio, incluindo casa de bombas, sistemas diesel, elétricos e motores.
            </AlertDescription>
          </Alert>

          {/* Form Actions */}
          <div className="flex justify-between">
            <Link href="/pump-module">
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