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
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Plus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
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

// Schema para validação da aba Inspections no cliente
const inspectionDefaultsSchema = z.object({
  requireDoubleSignature: z.boolean(),
  autoArchiveOnSubmit: z.boolean(),
  enabledForms: z.array(z.enum([
    "pumpWeekly", 
    "pumpMonthly", 
    "pumpAnnual",
    "sprinklerWet", 
    "sprinklerDry", 
    "sprinklerPreAction",
    "sprinklerFoamWater",
    "sprinklerWaterSpray",
    "sprinklerWaterMist",
    "standpipe", 
    "standpipeHose",
    "fireServiceMains",
    "hydrantFlowTest",
    "controlValves", 
    "waterTank",
    "hazardEvaluation",
    "aboveGroundCertificate",
    "undergroundCertificate",
    "finalInspection"
  ])).min(1, "Selecione ao menos um formulário"),
  defaultFrequencies: z.object({
    pumpWeekly: z.boolean(),
    pumpMonthly: z.boolean(), 
    pumpAnnual: z.boolean(),
    sprinklerWet: z.boolean(),
    sprinklerDry: z.boolean(),
    sprinklerPreAction: z.boolean(),
    sprinklerFoamWater: z.boolean(),
    sprinklerWaterSpray: z.boolean(),
    sprinklerWaterMist: z.boolean(),
    standpipe: z.boolean(),
    standpipeHose: z.boolean(),
    fireServiceMains: z.boolean(),
    hydrantFlowTest: z.boolean(),
    controlValves: z.boolean(),
    waterTank: z.boolean(),
    hazardEvaluation: z.boolean(),
    aboveGroundCertificate: z.boolean(),
    undergroundCertificate: z.boolean(),
    finalInspection: z.boolean(),
  }),
});

type InspectionDefaultsFormData = z.infer<typeof inspectionDefaultsSchema>;

// Labels amigáveis para os formulários
const formLabels: Record<string, string> = {
  pumpWeekly: "Bombas - Inspeção Semanal",
  pumpMonthly: "Bombas - Inspeção Mensal", 
  pumpAnnual: "Bombas - Inspeção Anual",
  sprinklerWet: "Sprinklers - Sistema Molhado",
  sprinklerDry: "Sprinklers - Sistema Seco",
  sprinklerPreAction: "Sprinklers - Pré-Ação/Delúgio",
  sprinklerFoamWater: "Sprinklers - Água/Espuma",
  sprinklerWaterSpray: "Sprinklers - Borrifo d'Água",
  sprinklerWaterMist: "Sprinklers - Névoa d'Água",
  standpipe: "Hidrantes - Standpipes",
  standpipeHose: "Hidrantes - Mangueiras",
  fireServiceMains: "Hidrantes - Rede Incêndio",
  hydrantFlowTest: "Hidrantes - Teste Vazão",
  controlValves: "Válvulas de Controle",
  waterTank: "Reservatórios d'Água",
  hazardEvaluation: "Avaliação de Riscos",
  aboveGroundCertificate: "Certificado Aéreo",
  undergroundCertificate: "Certificado Subterrâneo",
  finalInspection: "Inspeção Final"
};

// Schema para validação da aba Notifications no cliente
const notificationsSchema = z.object({
  email: z.object({
    enabled: z.boolean(),
    fromName: z.string().optional(),
    fromAddress: z.string().email("E-mail inválido").optional(),
  }),
  whatsapp: z.object({
    enabled: z.boolean(),
    provider: z.enum(["twilio", "meta"]).nullable(),
    senderId: z.string().optional(),
  }),
  reminders: z.object({
    beforeDueDays: z.array(z.number().int().positive("Dias devem ser números positivos")).min(1, "Adicione ao menos um dia"),
    dailyDigestHour: z.number().int().min(0).max(23),
  }),
});

type NotificationsFormData = z.infer<typeof notificationsSchema>;

// Schema para validação da aba PDF Branding no cliente
const pdfBrandingSchema = z.object({
  headerTitle: z.string().optional(),
  headerSubtitle: z.string().optional(),
  primaryColor: z.string().regex(/^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Cor inválida").optional(),
  secondaryColor: z.string().regex(/^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Cor inválida").optional(),
  showCompanyLogo: z.boolean(),
  footerText: z.string().optional(),
});

type PdfBrandingFormData = z.infer<typeof pdfBrandingSchema>;

// Schema para validação da aba Address Policy no cliente
const addressPolicySchema = z.object({
  normalizeBR: z.boolean(),
  requireUF: z.boolean(),
  requireCEP: z.boolean(),
});

type AddressPolicyFormData = z.infer<typeof addressPolicySchema>;

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

  // Form para a aba Inspections
  const inspectionsForm = useForm<InspectionDefaultsFormData>({
    resolver: zodResolver(inspectionDefaultsSchema),
    defaultValues: {
      requireDoubleSignature: false,
      autoArchiveOnSubmit: true,
      enabledForms: ["sprinklerWet", "pumpWeekly", "finalInspection"],
      defaultFrequencies: {
        pumpWeekly: true,
        pumpMonthly: true,
        pumpAnnual: false,
        sprinklerWet: true,
        sprinklerDry: false,
        sprinklerPreAction: false,
        sprinklerFoamWater: false,
        sprinklerWaterSpray: false,
        sprinklerWaterMist: false,
        standpipe: true,
        standpipeHose: false,
        fireServiceMains: false,
        hydrantFlowTest: false,
        controlValves: true,
        waterTank: false,
        hazardEvaluation: false,
        aboveGroundCertificate: false,
        undergroundCertificate: false,
        finalInspection: true,
      },
    },
  });

  // Form para a aba Notifications
  const notificationsForm = useForm<NotificationsFormData>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: {
      email: {
        enabled: true,
        fromName: "",
        fromAddress: "",
      },
      whatsapp: {
        enabled: false,
        provider: null,
        senderId: "",
      },
      reminders: {
        beforeDueDays: [1, 3, 7],
        dailyDigestHour: 9,
      },
    },
  });

  // Form para a aba PDF Branding
  const pdfBrandingForm = useForm<PdfBrandingFormData>({
    resolver: zodResolver(pdfBrandingSchema),
    defaultValues: {
      headerTitle: "",
      headerSubtitle: "",
      primaryColor: "#1f2937",
      secondaryColor: "#3b82f6",
      showCompanyLogo: true,
      footerText: "",
    },
  });

  // Form para a aba Address Policy
  const addressPolicyForm = useForm<AddressPolicyFormData>({
    resolver: zodResolver(addressPolicySchema),
    defaultValues: {
      normalizeBR: true,
      requireUF: true,
      requireCEP: true,
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

    if (settings?.inspectionDefaults) {
      const inspections = settings.inspectionDefaults;
      inspectionsForm.reset({
        requireDoubleSignature: inspections.requireDoubleSignature || false,
        autoArchiveOnSubmit: inspections.autoArchiveOnSubmit ?? true,
        enabledForms: inspections.enabledForms || ["sprinklerWet", "pumpWeekly", "finalInspection"],
        defaultFrequencies: inspections.defaultFrequencies || {
          pumpWeekly: true,
          pumpMonthly: true,
          pumpAnnual: false,
          sprinklerWet: true,
          sprinklerDry: false,
          sprinklerPreAction: false,
          sprinklerFoamWater: false,
          sprinklerWaterSpray: false,
          sprinklerWaterMist: false,
          standpipe: true,
          standpipeHose: false,
          fireServiceMains: false,
          hydrantFlowTest: false,
          controlValves: true,
          waterTank: false,
          hazardEvaluation: false,
          aboveGroundCertificate: false,
          undergroundCertificate: false,
          finalInspection: true,
        },
      });
    }

    if (settings?.notifications) {
      const notifications = settings.notifications;
      notificationsForm.reset({
        email: {
          enabled: notifications.email?.enabled ?? true,
          fromName: notifications.email?.fromName || "",
          fromAddress: notifications.email?.fromAddress || "",
        },
        whatsapp: {
          enabled: notifications.whatsapp?.enabled ?? false,
          provider: notifications.whatsapp?.provider || null,
          senderId: notifications.whatsapp?.senderId || "",
        },
        reminders: {
          beforeDueDays: notifications.reminders?.beforeDueDays || [1, 3, 7],
          dailyDigestHour: notifications.reminders?.dailyDigestHour ?? 9,
        },
      });
    }

    if (settings?.pdfBranding) {
      const branding = settings.pdfBranding;
      pdfBrandingForm.reset({
        headerTitle: branding.headerTitle || "",
        headerSubtitle: branding.headerSubtitle || "",
        primaryColor: branding.primaryColor || "#1f2937",
        secondaryColor: branding.secondaryColor || "#3b82f6",
        showCompanyLogo: branding.showCompanyLogo ?? true,
        footerText: branding.footerText || "",
      });
    }

    if (settings?.addressPolicy) {
      const policy = settings.addressPolicy;
      addressPolicyForm.reset({
        normalizeBR: policy.normalizeBR ?? true,
        requireUF: policy.requireUF ?? true,
        requireCEP: policy.requireCEP ?? true,
      });
    }
  }, [settings, companyForm, localeForm, inspectionsForm, notificationsForm, pdfBrandingForm, addressPolicyForm]);

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

  const onSubmitInspections = (data: InspectionDefaultsFormData) => {
    updateMutation.mutate({ inspectionDefaults: data });
  };

  const onSubmitNotifications = (data: NotificationsFormData) => {
    updateMutation.mutate({ notifications: data });
  };

  const onSubmitPdfBranding = (data: PdfBrandingFormData) => {
    // Normalizar cores para formato #RRGGBB
    const normalizedData = {
      ...data,
      primaryColor: data.primaryColor ? normalizeColor(data.primaryColor) : undefined,
      secondaryColor: data.secondaryColor ? normalizeColor(data.secondaryColor) : undefined,
    };
    updateMutation.mutate({ pdfBranding: normalizedData });
  };

  // Função para normalizar cor para formato #RRGGBB
  const normalizeColor = (color: string): string => {
    // Remove # se existir
    const cleanColor = color.replace('#', '');
    
    // Se tem 3 caracteres, expande para 6 (ex: "abc" -> "aabbcc")
    if (cleanColor.length === 3) {
      return `#${cleanColor[0]}${cleanColor[0]}${cleanColor[1]}${cleanColor[1]}${cleanColor[2]}${cleanColor[2]}`;
    }
    
    // Se tem 6 caracteres, adiciona # se não existir
    return `#${cleanColor}`;
  };

  const onSubmitAddressPolicy = (data: AddressPolicyFormData) => {
    updateMutation.mutate({ addressPolicy: data });
  };

  // Função para adicionar chip de dia
  const addDayChip = (newDay: number) => {
    const currentDays = notificationsForm.getValues("reminders.beforeDueDays");
    if (!currentDays.includes(newDay) && newDay > 0) {
      notificationsForm.setValue("reminders.beforeDueDays", [...currentDays, newDay].sort((a, b) => a - b));
    }
  };

  // Função para remover chip de dia
  const removeDayChip = (dayToRemove: number) => {
    const currentDays = notificationsForm.getValues("reminders.beforeDueDays");
    const newDays = currentDays.filter(day => day !== dayToRemove);
    if (newDays.length > 0) {
      notificationsForm.setValue("reminders.beforeDueDays", newDays);
    }
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
                  Configure padrões para assinaturas, formulários habilitados e frequências.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <Form {...inspectionsForm}>
                  <form onSubmit={inspectionsForm.handleSubmit(onSubmitInspections)} className="space-y-8">
                    {/* Switches de Configuração */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium">Configurações de Assinatura e Arquivo</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Dupla Assinatura */}
                        <FormField
                          control={inspectionsForm.control}
                          name="requireDoubleSignature"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Assinatura Dupla</FormLabel>
                                <FormDescription>
                                  Exigir duas assinaturas para validar inspeções
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-require-double-signature"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        {/* Auto-arquivo ao submeter */}
                        <FormField
                          control={inspectionsForm.control}
                          name="autoArchiveOnSubmit"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Arquivo Automático</FormLabel>
                                <FormDescription>
                                  Arquivar automaticamente ao submeter inspeções
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-auto-archive-on-submit"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Formulários Habilitados */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium">Formulários Habilitados</h3>
                      
                      <FormField
                        control={inspectionsForm.control}
                        name="enabledForms"
                        render={() => (
                          <FormItem>
                            <div className="mb-4">
                              <FormLabel className="text-base">Selecione os formulários disponíveis</FormLabel>
                              <FormDescription>
                                Escolha quais tipos de inspeção estarão disponíveis no sistema
                              </FormDescription>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {Object.entries(formLabels).map(([formKey, label]) => (
                                <FormField
                                  key={formKey}
                                  control={inspectionsForm.control}
                                  name="enabledForms"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={formKey}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(formKey as any)}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...field.value, formKey])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) => value !== formKey
                                                    )
                                                  )
                                            }}
                                            data-testid={`checkbox-enabled-${formKey}`}
                                          />
                                        </FormControl>
                                        <FormLabel className="text-sm font-normal">
                                          {label}
                                        </FormLabel>
                                      </FormItem>
                                    )
                                  }}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Frequências Padrão */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium">Frequências Padrão por Formulário</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(formLabels).map(([formKey, label]) => (
                          <FormField
                            key={formKey}
                            control={inspectionsForm.control}
                            name={`defaultFrequencies.${formKey}` as any}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-sm">{label}</FormLabel>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    data-testid={`switch-frequency-${formKey}`}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Define se cada tipo de formulário deve ter frequência periódica habilitada por padrão
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={updateMutation.isPending}
                        data-testid="save-inspections"
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

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-primary" />
                  Notificações
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure alertas por e-mail, WhatsApp e lembretes automáticos.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Alerta sobre credenciais */}
                <Alert>
                  <AlertDescription>
                    ℹ️ Envio real depende das credenciais configuradas em Integrações.
                  </AlertDescription>
                </Alert>

                <Form {...notificationsForm}>
                  <form onSubmit={notificationsForm.handleSubmit(onSubmitNotifications)} className="space-y-8">
                    {/* Configurações de E-mail */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium">E-mail</h3>
                      
                      <FormField
                        control={notificationsForm.control}
                        name="email.enabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Notificações por E-mail</FormLabel>
                              <FormDescription>
                                Habilitar o envio de notificações por e-mail
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="switch-email-enabled"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={notificationsForm.control}
                          name="email.fromName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome do Remetente</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Ex: Sistema de Inspeções"
                                  {...field}
                                  disabled={!notificationsForm.watch("email.enabled")}
                                  data-testid="input-email-fromName"
                                />
                              </FormControl>
                              <FormDescription>
                                Nome exibido como remetente dos e-mails
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={notificationsForm.control}
                          name="email.fromAddress"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>E-mail do Remetente</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Ex: noreply@suaempresa.com"
                                  type="email"
                                  {...field}
                                  disabled={!notificationsForm.watch("email.enabled")}
                                  data-testid="input-email-fromAddress"
                                />
                              </FormControl>
                              <FormDescription>
                                Endereço de e-mail do remetente
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Configurações de WhatsApp */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium">WhatsApp</h3>
                      
                      <FormField
                        control={notificationsForm.control}
                        name="whatsapp.enabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Notificações via WhatsApp</FormLabel>
                              <FormDescription>
                                Habilitar o envio de notificações via WhatsApp
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="switch-whatsapp-enabled"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={notificationsForm.control}
                          name="whatsapp.provider"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Provedor</FormLabel>
                              <Select 
                                onValueChange={(value) => field.onChange(value === "null" ? null : value)} 
                                value={field.value || "null"}
                                disabled={!notificationsForm.watch("whatsapp.enabled")}
                              >
                                <FormControl>
                                  <SelectTrigger data-testid="select-whatsapp-provider">
                                    <SelectValue placeholder="Selecione o provedor" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="null">Nenhum</SelectItem>
                                  <SelectItem value="twilio">Twilio</SelectItem>
                                  <SelectItem value="meta">Meta (WhatsApp Business)</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>
                                Serviço para envio via WhatsApp
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={notificationsForm.control}
                          name="whatsapp.senderId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ID do Remetente</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Ex: +5511999999999"
                                  {...field}
                                  disabled={!notificationsForm.watch("whatsapp.enabled")}
                                  data-testid="input-whatsapp-senderId"
                                />
                              </FormControl>
                              <FormDescription>
                                Número ou ID do WhatsApp remetente
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Configurações de Lembretes */}
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium">Lembretes</h3>
                      
                      <FormField
                        control={notificationsForm.control}
                        name="reminders.beforeDueDays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dias Antes do Vencimento</FormLabel>
                            <FormControl>
                              <div className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                  {field.value.map((day) => (
                                    <Badge key={day} variant="secondary" className="px-3 py-1">
                                      {day} {day === 1 ? 'dia' : 'dias'}
                                      <button
                                        type="button"
                                        onClick={() => removeDayChip(day)}
                                        className="ml-2 hover:text-destructive"
                                        data-testid={`remove-day-${day}`}
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </Badge>
                                  ))}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Input
                                    type="number"
                                    placeholder="Adicionar dias"
                                    min="1"
                                    className="w-32"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const value = parseInt(e.currentTarget.value);
                                        if (value > 0) {
                                          addDayChip(value);
                                          e.currentTarget.value = '';
                                        }
                                      }
                                    }}
                                    data-testid="input-add-reminder-day"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      const input = e.currentTarget.parentElement?.querySelector('input');
                                      if (input) {
                                        const value = parseInt(input.value);
                                        if (value > 0) {
                                          addDayChip(value);
                                          input.value = '';
                                        }
                                      }
                                    }}
                                    data-testid="button-add-reminder-day"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Quando enviar lembretes antes do vencimento das inspeções
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={notificationsForm.control}
                        name="reminders.dailyDigestHour"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Horário do Resumo Diário</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value.toString()}>
                              <FormControl>
                                <SelectTrigger data-testid="select-daily-digest-hour">
                                  <SelectValue placeholder="Selecione o horário" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Array.from({ length: 24 }, (_, i) => (
                                  <SelectItem key={i} value={i.toString()}>
                                    {i.toString().padStart(2, '0')}:00
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Horário para envio do resumo diário de atividades
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={updateMutation.isPending}
                        data-testid="save-notifications"
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

          {/* PDF & Branding Tab */}
          <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-primary" />
                  PDF & Branding
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Personalize a aparência dos relatórios em PDF gerados pelo sistema.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <Form {...pdfBrandingForm}>
                  <form onSubmit={pdfBrandingForm.handleSubmit(onSubmitPdfBranding)} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Configurações */}
                      <div className="space-y-6">
                        <h3 className="text-lg font-medium">Configurações</h3>
                        
                        <div className="grid grid-cols-1 gap-6">
                          <FormField
                            control={pdfBrandingForm.control}
                            name="headerTitle"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Título do Cabeçalho</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Ex: Relatório de Inspeção"
                                    {...field}
                                    data-testid="input-header-title"
                                  />
                                </FormControl>
                                <FormDescription>
                                  Título principal exibido no cabeçalho do PDF
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={pdfBrandingForm.control}
                            name="headerSubtitle"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Subtítulo do Cabeçalho</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Ex: Sistema ITM - NFPA 25"
                                    {...field}
                                    data-testid="input-header-subtitle"
                                  />
                                </FormControl>
                                <FormDescription>
                                  Subtítulo exibido abaixo do título principal
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={pdfBrandingForm.control}
                              name="primaryColor"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Cor Primária</FormLabel>
                                  <FormControl>
                                    <div className="flex items-center space-x-2">
                                      <Input 
                                        placeholder="#1f2937"
                                        {...field}
                                        data-testid="input-primary-color"
                                      />
                                      <div 
                                        className="w-10 h-10 rounded border border-gray-300"
                                        style={{ backgroundColor: field.value || "#1f2937" }}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormDescription>
                                    Cor principal do cabeçalho (hex)
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={pdfBrandingForm.control}
                              name="secondaryColor"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Cor Secundária</FormLabel>
                                  <FormControl>
                                    <div className="flex items-center space-x-2">
                                      <Input 
                                        placeholder="#3b82f6"
                                        {...field}
                                        data-testid="input-secondary-color"
                                      />
                                      <div 
                                        className="w-10 h-10 rounded border border-gray-300"
                                        style={{ backgroundColor: field.value || "#3b82f6" }}
                                      />
                                    </div>
                                  </FormControl>
                                  <FormDescription>
                                    Cor secundária para acentos (hex)
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={pdfBrandingForm.control}
                            name="showCompanyLogo"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Mostrar Logo da Empresa</FormLabel>
                                  <FormDescription>
                                    Incluir logo da empresa no cabeçalho do PDF
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    data-testid="switch-show-logo"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={pdfBrandingForm.control}
                            name="footerText"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Texto do Rodapé</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Ex: © 2024 Sua Empresa - Todos os direitos reservados"
                                    {...field}
                                    data-testid="input-footer-text"
                                  />
                                </FormControl>
                                <FormDescription>
                                  Texto personalizado para o rodapé do PDF
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Preview */}
                      <div className="space-y-6">
                        <h3 className="text-lg font-medium">Preview</h3>
                        
                        <Card className="overflow-hidden border-2" data-testid="pdf-preview">
                          {/* Header Preview */}
                          <div 
                            className="p-6 text-white"
                            style={{ 
                              backgroundColor: pdfBrandingForm.watch("primaryColor") || "#1f2937"
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="space-y-2">
                                <h2 className="text-xl font-bold">
                                  {pdfBrandingForm.watch("headerTitle") || "Título do Relatório"}
                                </h2>
                                <p className="text-sm opacity-90">
                                  {pdfBrandingForm.watch("headerSubtitle") || "Subtítulo do relatório"}
                                </p>
                              </div>
                              
                              {/* Logo Preview */}
                              {pdfBrandingForm.watch("showCompanyLogo") && settings?.company?.logoUrl && (
                                <div className="w-16 h-16 bg-white/20 rounded flex items-center justify-center">
                                  <img 
                                    src={settings.company.logoUrl} 
                                    alt="Logo" 
                                    className="max-w-full max-h-full object-contain"
                                    data-testid="preview-logo"
                                  />
                                </div>
                              )}
                              
                              {pdfBrandingForm.watch("showCompanyLogo") && !settings?.company?.logoUrl && (
                                <div className="w-16 h-16 bg-white/20 rounded flex items-center justify-center text-xs text-center">
                                  Logo da Empresa
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Content Preview */}
                          <div className="p-6 space-y-4">
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded"
                                style={{ 
                                  backgroundColor: pdfBrandingForm.watch("secondaryColor") || "#3b82f6"
                                }}
                              />
                              <span className="text-sm font-medium">Exemplo de Seção</span>
                            </div>
                            <div className="space-y-2">
                              <div className="h-3 bg-gray-200 rounded w-full" />
                              <div className="h-3 bg-gray-200 rounded w-3/4" />
                              <div className="h-3 bg-gray-200 rounded w-1/2" />
                            </div>
                          </div>

                          {/* Footer Preview */}
                          {pdfBrandingForm.watch("footerText") && (
                            <div className="px-6 py-3 bg-gray-50 border-t text-center">
                              <p className="text-xs text-gray-600">
                                {pdfBrandingForm.watch("footerText")}
                              </p>
                            </div>
                          )}
                        </Card>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={updateMutation.isPending}
                        data-testid="save-branding"
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

          {/* Address Policy Tab */}
          <TabsContent value="address-policy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-primary" />
                  Endereços (Política)
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure validações e formatações para cadastro de endereços.
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertDescription>
                    ℹ️ Essas configurações orientam validações dos próximos cadastros. Dados existentes não são reformatados automaticamente.
                  </AlertDescription>
                </Alert>

                <TooltipProvider>
                  <Form {...addressPolicyForm}>
                    <form onSubmit={addressPolicyForm.handleSubmit(onSubmitAddressPolicy)} className="space-y-8">
                      <div className="space-y-6">
                        <h3 className="text-lg font-medium">Políticas de Validação</h3>
                        
                        <FormField
                          control={addressPolicyForm.control}
                          name="normalizeBR"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5 flex-1">
                                <div className="flex items-center space-x-2">
                                  <FormLabel className="text-base">Normalização Brasileira</FormLabel>
                                  <Tooltip>
                                    <TooltipTrigger type="button">
                                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Aplica máscaras automáticas (CEP: 00000-000), converte UF para maiúsculo e valida códigos UF e CEP brasileiros</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <FormDescription>
                                  Aplicar formatação e validação automática para endereços brasileiros
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-normalize-br"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={addressPolicyForm.control}
                          name="requireUF"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5 flex-1">
                                <div className="flex items-center space-x-2">
                                  <FormLabel className="text-base">UF Obrigatória</FormLabel>
                                  <Tooltip>
                                    <TooltipTrigger type="button">
                                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Exige que o campo Estado/UF seja preenchido e válido (ex: SP, RJ, MG)</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <FormDescription>
                                  Tornar obrigatório o preenchimento da UF (Estado)
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-require-uf"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={addressPolicyForm.control}
                          name="requireCEP"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5 flex-1">
                                <div className="flex items-center space-x-2">
                                  <FormLabel className="text-base">CEP Obrigatório</FormLabel>
                                  <Tooltip>
                                    <TooltipTrigger type="button">
                                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Exige que o CEP seja preenchido no formato válido (00000-000 ou 00000000)</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <FormDescription>
                                  Tornar obrigatório o preenchimento do CEP
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-require-cep"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          disabled={updateMutation.isPending}
                          data-testid="save-address-policy"
                        >
                          {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Salvar
                        </Button>
                      </div>
                    </form>
                  </Form>
                </TooltipProvider>
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