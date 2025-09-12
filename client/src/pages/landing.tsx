import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, FileCheck, BarChart3, Users, ArrowRight } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center mb-6">
            <Shield className="w-12 h-12 text-red-600 mr-3" />
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
              Sistema ITM
            </h1>
          </div>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Sistema completo de Inspeção, Teste e Manutenção para Proteção Contra Incêndio
            em conformidade com NFPA 25
          </p>
          <div className="mt-8">
            <Button 
              onClick={handleLogin}
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
              data-testid="button-login"
            >
              Fazer Login
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <FileCheck className="w-10 h-10 text-blue-600 mb-2" />
              <CardTitle>Formulários Digitais</CardTitle>
              <CardDescription>
                Formulários completos para todos os tipos de sistemas de proteção contra incêndio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                <li>• Sistemas de Sprinklers (Molhados e Secos)</li>
                <li>• Colunas de Incêndio</li>
                <li>• Bombas de Incêndio</li>
                <li>• Sistemas de Espuma</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart3 className="w-10 h-10 text-green-600 mb-2" />
              <CardTitle>Relatórios Profissionais</CardTitle>
              <CardDescription>
                Geração automática de relatórios técnicos em PDF com padrões profissionais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                <li>• Relatórios em PDF personalizáveis</li>
                <li>• Assinatura digital</li>
                <li>• Histórico de inspeções</li>
                <li>• Dados técnicos detalhados</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="w-10 h-10 text-purple-600 mb-2" />
              <CardTitle>Gestão Completa</CardTitle>
              <CardDescription>
                Painel de controle para acompanhamento de todas as inspeções
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                <li>• Dashboard interativo</li>
                <li>• Controle de progresso</li>
                <li>• Arquivo de relatórios</li>
                <li>• Múltiplos inspetores</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* NFPA 25 Compliance Section */}
        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-red-800 dark:text-red-200">
              Conformidade NFPA 25
            </CardTitle>
            <CardDescription className="text-red-600 dark:text-red-400">
              Sistema desenvolvido seguindo rigorosamente os padrões da NFPA 25 - 
              Standard for the Inspection, Testing, and Maintenance of Water-Based Fire Protection Systems
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div className="p-4 bg-white dark:bg-slate-800 rounded-lg">
                <div className="font-semibold text-slate-900 dark:text-slate-100">Inspeções</div>
                <div className="text-slate-600 dark:text-slate-400">Diárias, Semanais, Mensais, Trimestrais, Anuais</div>
              </div>
              <div className="p-4 bg-white dark:bg-slate-800 rounded-lg">
                <div className="font-semibold text-slate-900 dark:text-slate-100">Testes</div>
                <div className="text-slate-600 dark:text-slate-400">Funcionais, de Fluxo, Hidrostáticos</div>
              </div>
              <div className="p-4 bg-white dark:bg-slate-800 rounded-lg">
                <div className="font-semibold text-slate-900 dark:text-slate-100">Manutenção</div>
                <div className="text-slate-600 dark:text-slate-400">Preventiva e Corretiva</div>
              </div>
              <div className="p-4 bg-white dark:bg-slate-800 rounded-lg">
                <div className="font-semibold text-slate-900 dark:text-slate-100">Documentação</div>
                <div className="text-slate-600 dark:text-slate-400">Registros Completos</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-slate-200 dark:border-slate-700">
          <p className="text-slate-600 dark:text-slate-400">
            © 2024 Sistema ITM - Proteção Contra Incêndio. Sistema desenvolvido para profissionais da área de proteção contra incêndio.
          </p>
        </div>
      </div>
    </div>
  );
}