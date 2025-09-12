import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { UF_LIST } from "@shared/schema";
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
  Loader2,
  Upload
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

// Schema para validação da aba Company no cliente
const companySchema = z.object({
  name: z.string().min(1, "Nome da empresa é obrigatório"),
  cnpj: z.string().regex(/^\d{14}$/, "CNPJ deve ter 14 dígitos"),
  ie: z.string().optional(),
  companyEmail: z.string().email("E-mail inválido").min(1, "E-mail é obrigatório"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  website: z.string().url("Website deve ser uma URL válida").or(z.string().length(0)).optional(),
  logoUrl: z.string().optional(),
  // Endereço brasileiro
  logradouro: z.string().min(1, "Logradouro é obrigatório"),
  numero: z.string().min(1, "Número é obrigatório"), 
  bairro: z.string().min(1, "Bairro é obrigatório"),
  municipio: z.string().min(1, "Município é obrigatório"),
  estado: z.enum(UF_LIST, { errorMap: () => ({ message: "UF inválida" }) }),
  cep: z.string().regex(/^\d{5}-?\d{3}$/, "CEP deve estar no formato 00000-000"),
  complemento: z.string().optional(),
  ibge: z.string().optional(),
  pais: z.string().default("Brasil"),
});

type CompanyFormData = z.infer<typeof companySchema>;

// Schema para validação da aba Locale no cliente
const localeSchema = z.object({
  language: z.enum(["pt-BR", "en-US", "it-IT"]),
  timezone: z.string(),
  dateFormat: z.enum(["dd/MM/yyyy", "MM/dd/yyyy", "yyyy-MM-dd", "dd-MM-yyyy"]),
  numberFormat: z.enum(["pt-BR", "en-US", "it-IT"]),
});

type LocaleFormData = z.infer<typeof localeSchema>;

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

  // Form para a aba Company
  const companyForm = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      cnpj: "",
      ie: "",
      companyEmail: "",
      phone: "",
      website: "",
      logoUrl: "",
      logradouro: "",
      numero: "",
      bairro: "",
      municipio: "",
      estado: "SP" as const,
      cep: "",
      complemento: "",
      ibge: "",
      pais: "Brasil",
    },
  });

  // Form para a aba Locale
  const localeForm = useForm<LocaleFormData>({
    resolver: zodResolver(localeSchema),
    defaultValues: {
      language: "pt-BR",
      timezone: "America/Sao_Paulo",
      dateFormat: "dd/MM/yyyy",
      numberFormat: "pt-BR",
    },
  });

  // Popular formulário quando settings carregam
  React.useEffect(() => {
    if (settings?.company) {
      const company = settings.company;
      companyForm.reset({
        name: company.name || "",
        cnpj: company.cnpj || "",
        ie: company.ie || "",
        companyEmail: company.companyEmail || "",
        phone: company.phone || "",
        website: company.website || "",
        logoUrl: company.logoUrl || "",
        logradouro: company.logradouro || "",
        numero: company.numero || "",
        bairro: company.bairro || "",
        municipio: company.municipio || "",
        estado: company.estado || "SP",
        cep: company.cep || "",
        complemento: company.complemento || "",
        ibge: company.ibge || "",
        pais: company.pais || "Brasil",
      });
    }

    if (settings?.locale) {
      const locale = settings.locale;
      localeForm.reset({
        language: locale.language || "pt-BR",
        timezone: locale.timezone || "America/Sao_Paulo",
        dateFormat: locale.dateFormat || "dd/MM/yyyy",
        numberFormat: locale.numberFormat || "pt-BR",
      });
    }
  }, [settings, companyForm, localeForm]);

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

  // Mutation específica para locale com aviso diferenciado
  const localeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", "/api/settings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({
        title: "Configurações Atualizadas",
        description: "Altere o idioma apenas para novos relatórios.",
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

  // Função para aplicar máscara CNPJ
  const applyCNPJMask = (value: string) => {
    return value.replace(/\D/g, '').slice(0, 14);
  };

  // Função para aplicar máscara CEP
  const applyCEPMask = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    if (digits.length > 5) {
      return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    }
    return digits;
  };

  // Função para upload de logo (igual ao user-profile)
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        companyForm.setValue("logoUrl", base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmitCompany = (data: CompanyFormData) => {
    updateMutation.mutate({ company: data });
  };

  const onSubmitLocale = (data: LocaleFormData) => {
    localeMutation.mutate({ locale: data });
  };

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
                <Form {...companyForm}>
                  <form onSubmit={companyForm.handleSubmit(onSubmitCompany)} className="space-y-6">
                    {/* Logo Upload */}
                    <div className="text-center">
                      {companyForm.watch("logoUrl") ? (
                        <div className="w-24 h-24 mx-auto mb-4 rounded-lg border border-border overflow-hidden bg-muted">
                          <img 
                            src={companyForm.watch("logoUrl")} 
                            alt="Logo da Empresa"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 mx-auto mb-4 rounded-lg border border-border flex items-center justify-center bg-muted">
                          <Building className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="company-logo-upload"
                          data-testid="input-company-logo-upload"
                        />
                        <Label htmlFor="company-logo-upload" className="cursor-pointer">
                          <Button type="button" variant="outline" size="sm" asChild>
                            <span>
                              <Upload className="w-4 h-4 mr-1" />
                              Alterar Logo
                            </span>
                          </Button>
                        </Label>
                      </div>
                    </div>

                    {/* Informações Básicas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Nome da Empresa */}
                      <FormField
                        control={companyForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome da Empresa*</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ex: FireSafe Solutions Ltda" data-testid="input-company-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* CNPJ */}
                      <FormField
                        control={companyForm.control}
                        name="cnpj"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CNPJ*</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="00000000000000"
                                maxLength={14}
                                onChange={(e) => field.onChange(applyCNPJMask(e.target.value))}
                                data-testid="input-company-cnpj"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* IE */}
                      <FormField
                        control={companyForm.control}
                        name="ie"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Inscrição Estadual</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ex: 123456789" data-testid="input-company-ie" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Email */}
                      <FormField
                        control={companyForm.control}
                        name="companyEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-mail*</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" placeholder="contato@empresa.com" data-testid="input-company-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Telefone */}
                      <FormField
                        control={companyForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone*</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="(11) 99999-9999" data-testid="input-company-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Website */}
                      <FormField
                        control={companyForm.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://www.empresa.com" data-testid="input-company-website" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Endereço */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Endereço</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Logradouro */}
                        <FormField
                          control={companyForm.control}
                          name="logradouro"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Logradouro*</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Rua, Avenida, etc." data-testid="input-company-logradouro" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Número */}
                        <FormField
                          control={companyForm.control}
                          name="numero"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número*</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="123" data-testid="input-company-numero" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Bairro */}
                        <FormField
                          control={companyForm.control}
                          name="bairro"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bairro*</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Centro" data-testid="input-company-bairro" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Complemento */}
                        <FormField
                          control={companyForm.control}
                          name="complemento"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Complemento</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Sala 101, Bloco A, etc." data-testid="input-company-complemento" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Município */}
                        <FormField
                          control={companyForm.control}
                          name="municipio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Município*</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="São Paulo" data-testid="input-company-municipio" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Estado/UF */}
                        <FormField
                          control={companyForm.control}
                          name="estado"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>UF*</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-company-estado">
                                    <SelectValue placeholder="UF" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {UF_LIST.map((uf) => (
                                    <SelectItem key={uf} value={uf}>
                                      {uf}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* CEP */}
                        <FormField
                          control={companyForm.control}
                          name="cep"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CEP*</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="00000-000"
                                  maxLength={9}
                                  onChange={(e) => field.onChange(applyCEPMask(e.target.value))}
                                  data-testid="input-company-cep"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={updateMutation.isPending}
                        data-testid="save-company"
                      >
                        {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Salvar
                      </Button>
                    </div>
                  </form>
                </Form>
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
                  Configure idioma, fuso horário e formatos de data/número para relatórios.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <Form {...localeForm}>
                  <form onSubmit={localeForm.handleSubmit(onSubmitLocale)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Idioma */}
                      <FormField
                        control={localeForm.control}
                        name="language"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Idioma</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-locale-language">
                                  <SelectValue placeholder="Selecione o idioma" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                                <SelectItem value="en-US">English (US)</SelectItem>
                                <SelectItem value="it-IT">Italiano</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">Idioma da interface e relatórios</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Fuso Horário */}
                      <FormField
                        control={localeForm.control}
                        name="timezone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fuso Horário</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-locale-timezone">
                                  <SelectValue placeholder="Selecione o fuso horário" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="America/Sao_Paulo">São Paulo (UTC-3)</SelectItem>
                                <SelectItem value="America/Rio_Branco">Rio Branco (UTC-5)</SelectItem>
                                <SelectItem value="America/Manaus">Manaus (UTC-4)</SelectItem>
                                <SelectItem value="America/New_York">New York (UTC-5)</SelectItem>
                                <SelectItem value="Europe/London">Londres (UTC+0)</SelectItem>
                                <SelectItem value="Europe/Rome">Roma (UTC+1)</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">Fuso horário para datas e timestamps</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Formato de Data */}
                      <FormField
                        control={localeForm.control}
                        name="dateFormat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Formato de Data</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-locale-dateFormat">
                                  <SelectValue placeholder="Selecione o formato" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="dd/MM/yyyy">31/12/2024 (Brasil)</SelectItem>
                                <SelectItem value="MM/dd/yyyy">12/31/2024 (EUA)</SelectItem>
                                <SelectItem value="yyyy-MM-dd">2024-12-31 (ISO)</SelectItem>
                                <SelectItem value="dd-MM-yyyy">31-12-2024 (Europa)</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">Formato para exibição de datas</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Formato de Número */}
                      <FormField
                        control={localeForm.control}
                        name="numberFormat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Formato de Número</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-locale-numberFormat">
                                  <SelectValue placeholder="Selecione o formato" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="pt-BR">1.234,56 (Brasil)</SelectItem>
                                <SelectItem value="en-US">1,234.56 (EUA)</SelectItem>
                                <SelectItem value="it-IT">1.234,56 (Itália)</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">Formato para números e valores monetários</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={localeMutation.isPending}
                        data-testid="save-locale"
                      >
                        {localeMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Salvar
                      </Button>
                    </div>
                  </form>
                </Form>
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