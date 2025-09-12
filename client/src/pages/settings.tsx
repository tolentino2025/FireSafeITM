import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Settings, 
  Building, 
  Globe, 
  Calendar, 
  Bell, 
  FileText, 
  MapPin, 
  Link as LinkIcon, 
  Shield,
  Loader2
} from "lucide-react";

interface AppSettings {
  id: string;
  userId: string;
  company: any;
  locale: any;
  inspectionDefaults: any;
  notifications: any;
  pdfBranding: any;
  addressPolicy: any;
  integrations: any;
  security: any;
  updatedAt: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("company");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery<AppSettings>({
    queryKey: ["/api/settings"],
  });

  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", "/api/settings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Configurações Atualizadas",
        description: "Suas configurações foram salvas com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleSave = (section: string, data: any = {}) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isAdmin = (user as any)?.role === 'admin';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie as configurações da aplicação e preferências do sistema
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="company" className="flex items-center space-x-2">
              <Building className="w-4 h-4" />
              <span className="hidden sm:inline">Empresa</span>
            </TabsTrigger>
            <TabsTrigger value="locale" className="flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Localização</span>
            </TabsTrigger>
            <TabsTrigger value="inspections" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Inspeções</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notificações</span>
            </TabsTrigger>
            <TabsTrigger value="branding" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">PDF & Branding</span>
            </TabsTrigger>
            <TabsTrigger value="address-policy" className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">Endereços</span>
            </TabsTrigger>
            {isAdmin && (
              <>
                <TabsTrigger value="integrations" className="flex items-center space-x-2">
                  <LinkIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Integrações</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Segurança</span>
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Company Tab */}
          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="w-5 h-5 mr-2 text-primary" />
                  Informações da Empresa
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure as informações básicas da sua empresa para relatórios e documentos.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-8 text-muted-foreground">
                  <p>Configurações da empresa serão implementadas em breve.</p>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleSave("company")}
                    disabled={updateMutation.isPending}
                    data-testid="save-company"
                  >
                    {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Salvar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Locale Tab */}
          <TabsContent value="locale">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-primary" />
                  Localização & Formatos
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Defina idioma, fuso horário, moeda e formatos de data para o sistema.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-8 text-muted-foreground">
                  <p>Configurações de localização serão implementadas em breve.</p>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleSave("locale")}
                    disabled={updateMutation.isPending}
                    data-testid="save-locale"
                  >
                    {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Salvar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inspections Tab */}
          <TabsContent value="inspections">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-primary" />
                  Inspeções (Padrões)
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure padrões para lembretes, tipos de inspeção e assinatura digital.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-8 text-muted-foreground">
                  <p>Configurações padrão de inspeções serão implementadas em breve.</p>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleSave("inspections")}
                    disabled={updateMutation.isPending}
                    data-testid="save-inspections"
                  >
                    {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Salvar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-primary" />
                  Notificações
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure alertas por email e lembretes automáticos para inspeções.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-8 text-muted-foreground">
                  <p>Configurações de notificações serão implementadas em breve.</p>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleSave("notifications")}
                    disabled={updateMutation.isPending}
                    data-testid="save-notifications"
                  >
                    {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Salvar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PDF & Branding Tab */}
          <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-primary" />
                  PDF & Branding
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Personalize a aparência dos relatórios PDF com sua marca e cores.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-8 text-muted-foreground">
                  <p>Configurações de PDF e branding serão implementadas em breve.</p>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleSave("branding")}
                    disabled={updateMutation.isPending}
                    data-testid="save-branding"
                  >
                    {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Salvar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Address Policy Tab */}
          <TabsContent value="address-policy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-primary" />
                  Endereços (Política)
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Defina políticas para validação e formato de endereços no sistema.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-8 text-muted-foreground">
                  <p>Configurações de política de endereços serão implementadas em breve.</p>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => handleSave("address-policy")}
                    disabled={updateMutation.isPending}
                    data-testid="save-address-policy"
                  >
                    {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Salvar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab - Admin Only */}
          {isAdmin && (
            <TabsContent value="integrations">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <LinkIcon className="w-5 h-5 mr-2 text-primary" />
                      Integrações
                    </CardTitle>
                    <Badge variant="secondary">Somente Administradores</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Configure integrações com serviços externos e chaves de API.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Configurações de integrações serão implementadas em breve.</p>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleSave("integrations")}
                      disabled={updateMutation.isPending}
                      data-testid="save-integrations"
                    >
                      {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Salvar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Security Tab - Admin Only */}
          {isAdmin && (
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-primary" />
                      Segurança
                    </CardTitle>
                    <Badge variant="secondary">Somente Administradores</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Gerencie políticas de segurança, senhas e autenticação.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Configurações de segurança serão implementadas em breve.</p>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleSave("security")}
                      disabled={updateMutation.isPending}
                      data-testid="save-security"
                    >
                      {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Salvar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}