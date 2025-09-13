import { Link } from "wouter";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Droplets, Gauge, TestTube, Database } from "lucide-react";

export default function StandpipeModule() {
  const forms = [
    {
      id: "standpipe-hose",
      title: "Sistemas de Hidrantes e Mangueiras",
      description: "Inspeção completa de hidrantes e sistemas de mangueira conforme NFPA 25",
      icon: Droplets,
      path: "/standpipe-hose-form",
      frequencies: ["Diária", "Semanal", "Mensal", "Trimestral", "Anual", "Testes"]
    },
    {
      id: "fire-service-mains",
      title: "Redes Principais de Serviço de Incêndio",
      description: "Inspeção de redes principais privadas de serviço de incêndio",
      icon: Database,
      path: "/fire-service-mains-form",
      frequencies: ["Semanal", "Mensal", "Trimestral", "Semestral", "Anual", "5 Anos"]
    },
    {
      id: "hydrant-flow-test",
      title: "Teste de Vazão de Hidrante",
      description: "Relatório completo de teste de vazão com dados hidráulicos",
      icon: TestTube,
      path: "/hydrant-flow-test-form",
      frequencies: ["Teste Especializado"]
    },
    {
      id: "water-tank",
      title: "Tanques de Armazenamento de Água",
      description: "Inspeção de tanques de armazenamento de água para sistemas de incêndio",
      icon: Gauge,
      path: "/water-tank-form",
      frequencies: ["Trimestral", "Anual", "3-5 Anos"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground mb-2" data-testid="title-standpipe-module">
                Sistemas de Hidrantes e Tubulações
              </h1>
              <p className="text-muted-foreground">
                Módulo completo para inspeção, teste e manutenção de sistemas de hidrantes e tubulações conforme NFPA 25
              </p>
            </div>
            <Link href="/">
              <Button variant="outline" data-testid="button-back-dashboard">
                Voltar ao Dashboard
              </Button>
            </Link>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                  <Droplets className="text-primary w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sistemas</p>
                  <p className="text-lg font-bold text-foreground" data-testid="stat-systems-count">4</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <TestTube className="text-blue-600 w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Frequências</p>
                  <p className="text-lg font-bold text-foreground" data-testid="stat-frequencies-count">15+</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                  <Gauge className="text-green-600 w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conformidade</p>
                  <p className="text-lg font-bold text-foreground" data-testid="stat-compliance">NFPA 25</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                  <Database className="text-orange-600 w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <p className="text-lg font-bold text-green-600" data-testid="stat-status">Ativo</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Forms Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {forms.map((form) => {
            const IconComponent = form.icon;
            return (
              <Card key={form.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <IconComponent className="text-primary w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg" data-testid={`title-${form.id}`}>
                          {form.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {form.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Frequências de Inspeção:
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {form.frequencies.map((freq) => (
                        <span
                          key={freq}
                          className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs"
                          data-testid={`frequency-${form.id}-${freq.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          {freq}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <Link href={form.path}>
                    <Button 
                      className="w-full" 
                      data-testid={`button-start-${form.id}`}
                    >
                      Iniciar Inspeção
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Information Section */}
        <div className="mt-12 bg-card rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4 text-foreground" data-testid="title-compliance-info">
            Conformidade NFPA 25 - Sistemas de Hidrantes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-muted-foreground">
            <div>
              <h3 className="font-medium text-foreground mb-2">Inspeções Regulares:</h3>
              <ul className="space-y-1">
                <li>• Inspeções diárias de válvulas em clima frio</li>
                <li>• Inspeções semanais de válvulas de controle</li>
                <li>• Inspeções mensais de componentes supervisionados</li>
                <li>• Inspeções trimestrais de válvulas e conexões</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-foreground mb-2">Testes Especializados:</h3>
              <ul className="space-y-1">
                <li>• Testes anuais de dreno principal e válvulas</li>
                <li>• Testes hidrostáticos a cada 3-5 anos</li>
                <li>• Testes de vazão a cada 5 anos</li>
                <li>• Inspeções internas de tanques conforme cronograma</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}