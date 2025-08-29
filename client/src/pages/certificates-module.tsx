import { useState } from "react";
import { Link } from "wouter";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  ArrowRight, 
  FileCheck, 
  ClipboardCheck,
  Settings2,
  ShieldCheck,
  Users,
  Calendar,
  AlertTriangle
} from "lucide-react";

export default function CertificatesModule() {
  const [selectedForm, setSelectedForm] = useState<string | null>(null);

  const forms = [
    {
      id: "hazard-evaluation",
      title: "Avaliação de Risco do Sistema de Sprinklers",
      description: "Formulário para avaliar se o sistema de proteção contra incêndio existente ainda é adequado após mudanças na ocupação, uso, processo ou materiais armazenados",
      pages: "63-66",
      icon: <ShieldCheck className="w-6 h-6" />,
      color: "red",
      route: "/hazard-evaluation-form",
      features: [
        "Identificação de ocupação e riscos",
        "Avaliação da proteção existente", 
        "Análise de áreas sem sprinklers",
        "Avaliação do suprimento de água",
        "Certificação do avaliador"
      ]
    },
    {
      id: "above-ground-certificate",
      title: "Certificado para Tubulação Acima do Solo",
      description: "Registro detalhado para instalações novas ou modificadas de tubulação acima do solo com componentes e testes do sistema",
      pages: "67-69", 
      icon: <Settings2 className="w-6 h-6" />,
      color: "blue",
      route: "/above-ground-certificate-form",
      features: [
        "Componentes do sistema completo",
        "Testes de operação da válvula seca",
        "Válvulas de dilúvio e pré-ação",
        "Testes hidrostático e pneumático",
        "Certificação de soldagem AWS/ASME"
      ]
    },
    {
      id: "underground-certificate", 
      title: "Certificado para Tubulação Subterrânea",
      description: "Registro de testes em tubulações subterrâneas que alimentam os sistemas de incêndio com procedimentos de lavagem e testes hidrostáticos",
      pages: "70-71",
      icon: <Settings2 className="w-6 h-6 rotate-90" />,
      color: "green", 
      route: "/underground-certificate-form",
      features: [
        "Tipos e classes de tubos conformes",
        "Procedimentos de lavagem (flushing)",
        "Testes hidrostáticos e de vazamento",
        "Teste de refluxo (backflow)",
        "Certificação de hidrantes e válvulas"
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case "red":
        return {
          bg: "bg-red-50 dark:bg-red-950/20",
          border: "border-red-200 dark:border-red-800", 
          text: "text-red-800 dark:text-red-200",
          icon: "text-red-600",
          badge: "bg-red-100 text-red-800 border-red-200"
        };
      case "blue":
        return {
          bg: "bg-blue-50 dark:bg-blue-950/20",
          border: "border-blue-200 dark:border-blue-800",
          text: "text-blue-800 dark:text-blue-200", 
          icon: "text-blue-600",
          badge: "bg-blue-100 text-blue-800 border-blue-200"
        };
      case "green":
        return {
          bg: "bg-green-50 dark:bg-green-950/20", 
          border: "border-green-200 dark:border-green-800",
          text: "text-green-800 dark:text-green-200",
          icon: "text-green-600", 
          badge: "bg-green-100 text-green-800 border-green-200"
        };
      default:
        return {
          bg: "bg-gray-50 dark:bg-gray-950/20",
          border: "border-gray-200 dark:border-gray-800",
          text: "text-gray-800 dark:text-gray-200", 
          icon: "text-gray-600",
          badge: "bg-gray-100 text-gray-800 border-gray-200"
        };
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-4 mb-4">
              <Link href="/">
                <Button variant="ghost" size="sm" data-testid="button-back-home">
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Início
                </Button>
              </Link>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileCheck className="w-7 h-7 text-purple-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2" data-testid="title-certificates-module">
              Certificados e Avaliações
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Módulo para avaliações de risco, certificação de materiais e testes de sistemas de proteção contra incêndio conforme NFPA 25 - Páginas 63 a 71
            </p>
          </div>
        </div>

        {/* Module Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-8 h-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">3</div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">Formulários Disponíveis</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <ClipboardCheck className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">NFPA 25</div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">Conformidade Integral</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold text-green-800 dark:text-green-200">PDF</div>
                  <div className="text-sm text-green-600 dark:text-green-400">Versão Fiel ao Original</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Forms Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {forms.map((form) => {
            const colors = getColorClasses(form.color);
            return (
              <Card 
                key={form.id}
                className={`transition-all duration-200 hover:shadow-lg cursor-pointer ${colors.border} ${
                  selectedForm === form.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedForm(selectedForm === form.id ? null : form.id)}
                data-testid={`card-${form.id}`}
              >
                <CardHeader className={`${colors.bg} rounded-t-lg`}>
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg bg-white dark:bg-gray-800 ${colors.icon}`}>
                      {form.icon}
                    </div>
                    <Badge variant="outline" className={colors.badge}>
                      Páginas {form.pages}
                    </Badge>
                  </div>
                  <CardTitle className={`${colors.text} text-lg`} data-testid={`title-${form.id}`}>
                    {form.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-muted-foreground text-sm mb-4">
                    {form.description}
                  </p>
                  
                  {selectedForm === form.id && (
                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Características Principais:</h4>
                        <ul className="space-y-1">
                          {form.features.map((feature, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start">
                              <span className={`w-1.5 h-1.5 rounded-full ${colors.icon.replace('text-', 'bg-')} mt-2 mr-2 flex-shrink-0`}></span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="flex space-x-3 pt-4 border-t">
                        <Link href={form.route}>
                          <Button className="flex-1" data-testid={`button-access-${form.id}`}>
                            Acessar Formulário
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                  
                  {selectedForm !== form.id && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Clique para ver detalhes
                      </span>
                      <Button variant="ghost" size="sm" data-testid={`button-preview-${form.id}`}>
                        Ver mais
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Key Features */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center" data-testid="title-key-features">
              <AlertTriangle className="mr-3 w-5 h-5 text-orange-600" />
              Características dos Certificados e Avaliações NFPA 25
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-medium text-foreground">Avaliação de Risco</h3>
                <p className="text-sm text-muted-foreground">
                  Avaliação completa para mudanças de ocupação, uso, processo ou materiais armazenados
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-foreground">Certificação de Materiais</h3>
                <p className="text-sm text-muted-foreground">
                  Registro detalhado de componentes, testes hidrostáticos e certificação de soldagem
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-foreground">Testes de Sistema</h3>
                <p className="text-sm text-muted-foreground">
                  Procedimentos de teste para tubulação acima e abaixo do solo com documentação completa
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-foreground">Conformidade NFPA</h3>
                <p className="text-sm text-muted-foreground">
                  Todos os formulários seguem fielmente as especificações das páginas 63-71 da NFPA 25
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-foreground">Assinatura Digital</h3>
                <p className="text-sm text-muted-foreground">
                  Certificação com assinatura digital e dados de licenciamento profissional
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-foreground">Documentação Técnica</h3>
                <p className="text-sm text-muted-foreground">
                  Especificações técnicas detalhadas de componentes, pressões e procedimentos de teste
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Access */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center" data-testid="title-quick-access">
              <Calendar className="mr-3 w-5 h-5 text-blue-600" />
              Acesso Rápido aos Formulários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {forms.map((form) => {
                const colors = getColorClasses(form.color);
                return (
                  <Link key={form.id} href={form.route}>
                    <Button 
                      variant="outline" 
                      className={`w-full h-auto p-4 justify-start ${colors.border} hover:${colors.bg}`}
                      data-testid={`button-quick-${form.id}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={colors.icon}>
                          {form.icon}
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-foreground text-sm">
                            {form.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            NFPA 25 - Páginas {form.pages}
                          </div>
                        </div>
                      </div>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}