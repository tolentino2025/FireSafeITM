import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SystemSelector } from "@/components/inspection/system-selector";
import { UserProfile } from "@/components/user/user-profile";
import { ReportsHistory } from "@/components/user/reports-history";
import { SavedForms } from "@/components/user/saved-forms";
import { Link, useLocation } from "wouter";
import { Inspection } from "@shared/schema";
import { 
  BarChart3, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Plus,
  Droplets,
  Wind,
  Building2,
  Settings,
  AlertTriangle,
  FileCheck,
  User,
  Archive,
  Save,
  Home
} from "lucide-react";

export default function Dashboard() {
  const [showSystemSelector, setShowSystemSelector] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [, navigate] = useLocation();
  
  const { data: inspections, isLoading } = useQuery<Inspection[]>({
    queryKey: ["/api/inspections"],
  });

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const handleStartInspection = (selectedSystems: string[], selectedForms: string[]) => {
    // Navigate to multi-form inspection with selected forms
    navigate(`/multi-inspection?forms=${selectedForms.join(',')}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  const recentInspections = inspections?.slice(0, 5) || [];
  const completedInspections = inspections?.filter(i => i.status === "completed").length || 0;
  const draftInspections = inspections?.filter(i => i.status === "draft").length || 0;
  const overdueInspections = inspections?.filter(i => {
    const dueDate = new Date(i.nextInspectionDue || '');
    return dueDate < new Date() && i.status !== "completed";
  }).length || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Bem-vindo, {(user as any)?.fullName || 'Inspector'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {(user as any)?.companyName ? 
                `${(user as any).companyName} - NFPA 25 Painel de Controle` : 
                'NFPA 25 Painel de Controle de Inspeções'
              }
            </p>
          </div>
          <Button 
            onClick={() => setShowSystemSelector(true)}
            data-testid="button-new-inspection" 
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Inspeção
          </Button>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" data-testid="tab-overview">
              <Home className="w-4 h-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="profile" data-testid="tab-profile">
              <User className="w-4 h-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="saved-forms" data-testid="tab-saved-forms">
              <Save className="w-4 h-4 mr-2" />
              Formulários Salvos
            </TabsTrigger>
            <TabsTrigger value="reports" data-testid="tab-reports">
              <Archive className="w-4 h-4 mr-2" />
              Histórico de Relatórios
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inspections</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-inspections">
                {inspections?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                All time inspections
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="text-completed-inspections">
                {completedInspections}
              </div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600" data-testid="text-draft-inspections">
                {draftInspections}
              </div>
              <p className="text-xs text-muted-foreground">
                In progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive" data-testid="text-overdue-inspections">
                {overdueInspections}
              </div>
              <p className="text-xs text-muted-foreground">
                Require attention
              </p>
            </CardContent>
          </Card>
        </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Inspections */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Inspeções Recentes
                  <Badge variant="secondary" data-testid="badge-total-count">
                    {recentInspections.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentInspections.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma inspeção ainda. Crie sua primeira inspeção para começar.</p>
                    </div>
                  ) : (
                    recentInspections.map((inspection) => (
                      <div 
                        key={inspection.id} 
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                        data-testid={`card-inspection-${inspection.id}`}
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-card-foreground">
                            {inspection.facilityName}
                          </h4>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                            <span>Inspeção {inspection.inspectionType}</span>
                            <span>•</span>
                            <span>{new Date(inspection.inspectionDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge 
                            variant={inspection.status === "completed" ? "default" : "secondary"}
                            data-testid={`badge-status-${inspection.id}`}
                          >
                            {inspection.status}
                          </Badge>
                          <Link href={`/inspection/${inspection.id}`}>
                            <Button 
                              variant="outline" 
                              size="sm"
                              data-testid={`button-view-${inspection.id}`}
                            >
                              Ver
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & System Types */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setShowSystemSelector(true)}
                  data-testid="button-start-inspection"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Iniciar Nova Inspeção
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  data-testid="button-view-reports"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Ver Relatórios
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  data-testid="button-schedule-inspection"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Agendar Inspeção
                </Button>
              </CardContent>
            </Card>

            {/* System Types Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Tipos de Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Droplets className="w-5 h-5 text-primary" />
                    <span className="font-medium">Wet Systems</span>
                  </div>
                  <Badge variant="secondary">Most Common</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Wind className="w-5 h-5 text-primary" />
                    <span className="font-medium">Dry Systems</span>
                  </div>
                  <Badge variant="outline">Special Care</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-5 h-5 text-primary" />
                    <span className="font-medium">Standpipes</span>
                  </div>
                  <Badge variant="outline">Annual</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Settings className="w-5 h-5 text-primary" />
                    <span className="font-medium">Fire Pumps</span>
                  </div>
                  <Badge variant="outline">Critical</Badge>
                </div>
                
                <Link href="/certificates-module">
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <FileCheck className="w-5 h-5 text-primary" />
                      <span className="font-medium">Certificates & Evaluations</span>
                    </div>
                    <Badge variant="outline">NFPA 25</Badge>
                  </div>
                </Link>
              </CardContent>
            </Card>
            </div>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <UserProfile />
          </TabsContent>

          {/* Saved Forms Tab */}
          <TabsContent value="saved-forms">
            <SavedForms />
          </TabsContent>

          {/* Reports History Tab */}
          <TabsContent value="reports">
            <ReportsHistory />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
      
      {/* System Selector Modal */}
      <SystemSelector
        open={showSystemSelector}
        onOpenChange={setShowSystemSelector}
        onStartInspection={handleStartInspection}
      />
    </div>
  );
}
