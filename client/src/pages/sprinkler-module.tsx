import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { 
  Droplets, 
  Wind, 
  Zap, 
  Waves, 
  Sparkles,
  Cloud,
  ArrowRight,
  FileText,
  Clock,
  CheckCircle2
} from "lucide-react";

const SPRINKLER_SYSTEMS = [
  {
    id: "wet-sprinkler",
    name: "Sistemas de Sprinklers de Tubo Molhado",
    description: "Sistemas pressurizados com água que ativam imediatamente quando o sprinkler é acionado",
    icon: Droplets,
    frequency: "Semanal",
    priority: "Alta",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  {
    id: "dry-sprinkler", 
    name: "Sistemas de Sprinklers de Tubo Seco",
    description: "Sistemas pressurizados com ar ou nitrogênio, água é liberada após ativação",
    icon: Wind,
    frequency: "Mensal",
    priority: "Alta",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200"
  },
  {
    id: "preaction-deluge",
    name: "Sistemas de Pré-Ação/Dilúvio",
    description: "Sistemas que requerem dois eventos independentes para liberação de água",
    icon: Zap,
    frequency: "Trimestral",
    priority: "Crítica",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200"
  },
  {
    id: "foam-water",
    name: "Sistemas de Sprinklers de Espuma-Água", 
    description: "Sistemas que combinam água com agente formador de espuma para proteção especial",
    icon: Waves,
    frequency: "Mensal",
    priority: "Especializada",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200"
  },
  {
    id: "water-spray",
    name: "Sistemas de Spray de Água",
    description: "Sistemas de bicos abertos que aplicam água sobre área ou equipamento específico",
    icon: Sparkles,
    frequency: "Trimestral",
    priority: "Média",
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200"
  },
  {
    id: "water-mist",
    name: "Sistemas de Neblina de Água",
    description: "Sistemas que produzem gotículas finas de água para supressão eficiente",
    icon: Cloud,
    frequency: "Mensal",
    priority: "Especializada",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200"
  }
];

export default function SprinklerModule() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Módulo de Sistemas de Sprinklers
              </h1>
              <p className="text-muted-foreground mt-2">
                Formulários de inspeção NFPA 25 para todos os tipos de sistemas de sprinklers
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-sm">
                <FileText className="w-3 h-3 mr-1" />
                6 Tipos de Sistema
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sistemas Ativos</CardTitle>
              <Droplets className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary" data-testid="text-active-systems">
                24
              </div>
              <p className="text-xs text-muted-foreground">
                Sistemas em operação
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inspeções Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600" data-testid="text-pending-inspections">
                8
              </div>
              <p className="text-xs text-muted-foreground">
                Requerem atenção
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conformidade</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="text-compliance-rate">
                92%
              </div>
              <p className="text-xs text-muted-foreground">
                Taxa de conformidade
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Systems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SPRINKLER_SYSTEMS.map((system) => {
            const Icon = system.icon;
            
            return (
              <Card 
                key={system.id}
                className={`hover:shadow-lg transition-all duration-200 ${system.borderColor} ${system.bgColor}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${system.color}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-card-foreground">
                          {system.name}
                        </CardTitle>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge 
                        variant={system.priority === "Crítica" ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {system.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {system.frequency}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {system.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>~30 min</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        <span>NFPA 25</span>
                      </div>
                    </div>
                    
                    <Link href={`/sprinkler/${system.id}`}>
                      <Button 
                        className="bg-primary hover:bg-primary/90"
                        size="sm"
                        data-testid={`button-start-${system.id}`}
                      >
                        Iniciar Inspeção
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Information */}
        <div className="mt-12">
          <Card className="bg-accent/50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-primary" />
                Informações Importantes - NFPA 25
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-accent-foreground mb-2">
                    Frequências de Inspeção
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Semanal:</strong> Válvulas de controle e pressão do sistema</li>
                    <li>• <strong>Mensal:</strong> Sistemas secos, espuma-água e neblina</li>
                    <li>• <strong>Trimestral:</strong> Pré-ação, dilúvio e spray de água</li>
                    <li>• <strong>Anual:</strong> Teste hidrostático e manutenção completa</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-accent-foreground mb-2">
                    Documentação Necessária
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Relatório de inspeção visual completo</li>
                    <li>• Registros de pressão e fluxo</li>
                    <li>• Identificação de deficiências</li>
                    <li>• Ações corretivas implementadas</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}