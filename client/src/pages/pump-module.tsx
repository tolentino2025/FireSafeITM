import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  ArrowLeft, 
  ArrowRight,
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  Plus
} from "lucide-react";
import { Link } from "wouter";
import { PumpRegistryModal } from "@/components/pumps/PumpRegistryModal";

const pumpForms = [
  {
    id: "weekly-pump",
    title: "Inspeção Semanal de Bombas de Incêndio",
    description: "Verificação semanal de casa de bombas, sistemas diesel e elétricos",
    route: "/weekly-pump-form",
    frequency: "Semanal",
    icon: Calendar,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    iconColor: "text-blue-600"
  },
  {
    id: "monthly-pump", 
    title: "Inspeção Mensal de Bombas de Incêndio",
    description: "Verificação mensal completa dos sistemas de bombas",
    route: "/monthly-pump-form",
    frequency: "Mensal",
    icon: Clock,
    bgColor: "bg-green-50", 
    borderColor: "border-green-200",
    iconColor: "text-green-600"
  },
  {
    id: "annual-pump",
    title: "Teste Anual de Bombas de Incêndio", 
    description: "Testes anuais e verificações completas conforme NFPA 25",
    route: "/annual-pump-form",
    frequency: "Anual",
    icon: FileText,
    bgColor: "bg-red-50",
    borderColor: "border-red-200", 
    iconColor: "text-red-600"
  }
];

export default function PumpModule() {
  const [companyId] = useState<string>(""); // TODO: Get from company context/selection

  return (
    <div className="min-h-screen bg-background pb-[env(safe-area-inset-bottom)]">
      <Header />
      
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
        {/* Module Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" data-testid="button-back-dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao Dashboard
                </Button>
              </Link>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Settings className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
                  Módulo: Bombas de Incêndio
                </h1>
                <p className="text-muted-foreground text-lg">
                  Este módulo contém todos os formulários necessários para a inspeção, teste e manutenção de bombas de incêndio, conforme a norma NFPA 25.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <PumpRegistryModal 
                companyId={companyId} 
                onCreated={(pump) => {
                  // Handle pump created
                  console.log("Pump created:", pump);
                }}
                triggerLabel="Cadastrar Bomba"
                trigger={
                  <Button data-testid="button-register-pump">
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar Bomba
                  </Button>
                }
              />
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                <Settings className="w-3 h-3 mr-1" />
                NFPA 25
              </Badge>
            </div>
          </div>
        </div>

        {/* Compliance Alert */}
        <div className="mb-8">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <AlertCircle className="w-6 h-6 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold text-primary mb-2">
                    Conformidade NFPA 25 - Bombas de Incêndio
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Os formulários neste módulo seguem rigorosamente os padrões da NFPA 25 para inspeção, teste e manutenção de bombas de incêndio. 
                    Inclui verificações para casa de bombas, sistemas diesel, sistemas elétricos e motores diesel.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Forms Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {pumpForms.map((form) => {
            const IconComponent = form.icon;
            return (
              <Card 
                key={form.id} 
                className={`${form.bgColor} ${form.borderColor} border-2 hover:shadow-md transition-all duration-200 hover:scale-[1.02] group`}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <IconComponent className={`w-6 h-6 ${form.iconColor}`} />
                      </div>
                      <div>
                        <Badge variant="outline" className="mb-2">
                          {form.frequency}
                        </Badge>
                        <CardTitle className="text-lg leading-tight">
                          {form.title}
                        </CardTitle>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                    {form.description}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Formulário NFPA 25</span>
                      <span>Formato: Checklist</span>
                    </div>
                    
                    <Link href={form.route}>
                      <Button 
                        className="w-full bg-primary hover:bg-primary/90 group-hover:shadow-sm transition-all"
                        data-testid={`button-${form.id}`}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Abrir Formulário
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Module Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">3</div>
                <div className="text-sm text-muted-foreground">Formulários</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">NFPA 25</div>
                <div className="text-sm text-muted-foreground">Conformidade</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">4</div>
                <div className="text-sm text-muted-foreground">Sistemas</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">25+</div>
                <div className="text-sm text-muted-foreground">Verificações</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Footer */}
        <div className="mt-8 flex justify-center">
          <Link href="/">
            <Button variant="outline" size="lg" data-testid="button-return-dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retornar ao Dashboard Principal
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}