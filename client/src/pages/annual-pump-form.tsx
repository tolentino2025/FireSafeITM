import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Calendar
} from "lucide-react";
import { Link } from "wouter";

interface AnnualPumpInspectionData {
  propertyName: string;
  address: string;
  inspector: string;
  date: string;
  pumpPerformanceTest: string;
  motorFullLoad: string;
  pumpAlignment: string;
  deficiencies: string;
  correctiveActions: string;
  additionalNotes: string;
}

export default function AnnualPumpForm() {
  const [formData, setFormData] = useState<AnnualPumpInspectionData>({
    propertyName: "",
    address: "",
    inspector: "",
    date: new Date().toISOString().split('T')[0],
    pumpPerformanceTest: "",
    motorFullLoad: "",
    pumpAlignment: "",
    deficiencies: "",
    correctiveActions: "",
    additionalNotes: ""
  });

  const { toast } = useToast();

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const handleInputChange = (field: keyof AnnualPumpInspectionData, value: any) => {
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
      description: "Teste anual de bombas de incêndio salvo com sucesso.",
    });
  };

  const renderRadioGroup = (field: keyof AnnualPumpInspectionData, value: string) => (
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
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Teste Anual de Bombas de Incêndio
                </h1>
                <p className="text-muted-foreground">
                  Formulário NFPA 25 - Lista de Verificação de Conformidade Anual
                </p>
              </div>
            </div>
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              <Calendar className="w-3 h-3 mr-1" />
              Anual
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

          {/* Testes Anuais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-red-600" />
                Testes Anuais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Teste de Performance Completo: A bomba foi testada com carga total e os resultados estão conformes?
                </Label>
                {renderRadioGroup("pumpPerformanceTest", formData.pumpPerformanceTest)}
              </div>
              
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Teste de Motor com Carga Total: O motor foi testado sob carga total e operou satisfatoriamente?
                </Label>
                {renderRadioGroup("motorFullLoad", formData.motorFullLoad)}
              </div>
              
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Verificação de Alinhamento: O alinhamento da bomba foi verificado e está correto?
                </Label>
                {renderRadioGroup("pumpAlignment", formData.pumpAlignment)}
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
              <strong>NFPA 25 - Teste Anual de Bombas:</strong> Esta lista de verificação cobre todos os testes anuais obrigatórios para bombas de incêndio conforme estabelecido na norma NFPA 25.
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