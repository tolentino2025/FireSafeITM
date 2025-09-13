import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { insertCompanySchema, updateCompanySchema, UF_LIST, type Company } from "@shared/schema";
import { Building2, ArrowLeft, Save, Trash2, Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import { z } from "zod";

// Form schema for frontend with flattened structure
const formSchema = z.object({
  // Identificação
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  cnpj: z.string().regex(/^\d{14}$/, "CNPJ deve ter 14 dígitos numéricos").optional().or(z.literal("")),
  ie: z.string().optional(),
  companyEmail: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().url("URL inválida").optional().or(z.literal("")),
  logoUrl: z.string().optional(),
  
  // Endereço (flattened from address JSONB)
  logradouro: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  municipio: z.string().optional(),
  estado: z.enum(UF_LIST).optional(),
  cep: z.string().regex(/^\d{5}-?\d{3}$/, "CEP deve estar no formato 00000-000").optional().or(z.literal("")),
  complemento: z.string().optional(),
  ibge: z.string().optional(),
  pais: z.string().default("Brasil"),
  
  // Contato (flattened from contact JSONB)
  contatoNome: z.string().optional(),
  contatoEmail: z.string().email("E-mail inválido").optional().or(z.literal("")),
  contatoTelefone: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

function CompanyFormPage() {
  const { id } = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const isEditing = Boolean(id);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
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
      estado: undefined,
      cep: "",
      complemento: "",
      ibge: "",
      pais: "Brasil",
      contatoNome: "",
      contatoEmail: "",
      contatoTelefone: "",
    },
  });

  // Fetch company data for editing
  const { data: company, isLoading } = useQuery<Company>({
    queryKey: ["/api/companies", id],
    queryFn: async () => {
      if (!id) return null;
      const response = await fetch(`/api/companies/${id}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch company: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: isEditing,
  });

  // Populate form when company data is loaded
  useEffect(() => {
    if (company && isEditing) {
      const addressData = company.address as any;
      const contactData = company.contact as any;

      form.reset({
        name: company.name || "",
        cnpj: company.cnpj || "",
        ie: company.ie || "",
        companyEmail: company.companyEmail || "",
        phone: company.phone || "",
        website: company.website || "",
        logoUrl: company.logoUrl || "",
        logradouro: addressData?.logradouro || "",
        numero: addressData?.numero || "",
        bairro: addressData?.bairro || "",
        municipio: addressData?.municipio || "",
        estado: addressData?.estado || undefined,
        cep: addressData?.cep || "",
        complemento: addressData?.complemento || "",
        ibge: addressData?.ibge || "",
        pais: addressData?.pais || "Brasil",
        contatoNome: contactData?.contatoNome || "",
        contatoEmail: contactData?.contatoEmail || "",
        contatoTelefone: contactData?.contatoTelefone || "",
      });
    }
  }, [company, isEditing, form]);

  // Save company mutation
  const saveCompanyMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Transform form data to API format
      const payload: any = {
        name: data.name,
        cnpj: data.cnpj || null,
        ie: data.ie || null,
        companyEmail: data.companyEmail || null,
        phone: data.phone || null,
        website: data.website || null,
        logoUrl: data.logoUrl || null,
      };

      // Build address object if any address field is filled
      const hasAddressData = data.logradouro || data.numero || data.bairro || data.municipio || data.estado || data.cep;
      if (hasAddressData) {
        payload.address = {
          logradouro: data.logradouro || "",
          numero: data.numero || "",
          bairro: data.bairro || "",
          municipio: data.municipio || "",
          estado: data.estado || "",
          cep: data.cep || "",
          complemento: data.complemento || "",
          ibge: data.ibge || "",
          pais: data.pais || "Brasil",
        };
      }

      // Build contact object if any contact field is filled
      const hasContactData = data.contatoNome || data.contatoEmail || data.contatoTelefone;
      if (hasContactData) {
        payload.contact = {
          contatoNome: data.contatoNome || "",
          contatoEmail: data.contatoEmail || "",
          contatoTelefone: data.contatoTelefone || "",
        };
      }

      const method = isEditing ? "PUT" : "POST";
      const url = isEditing ? `/api/companies/${id}` : "/api/companies";
      
      const response = await apiRequest(method, url, payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({
        title: isEditing ? "Empresa atualizada" : "Empresa criada",
        description: isEditing 
          ? "A empresa foi atualizada com sucesso." 
          : "A empresa foi criada com sucesso.",
      });
      navigate("/companies");
    },
    onError: (error: any) => {
      const errorMessage = error.message || "";
      
      if (errorMessage.includes("400")) {
        toast({
          variant: "destructive",
          title: "Dados inválidos",
          description: "Verifique os dados inseridos e tente novamente.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao salvar empresa",
          description: "Ocorreu um erro inesperado. Tente novamente.",
        });
      }
    },
  });

  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("ID não encontrado");
      const response = await apiRequest("DELETE", `/api/companies/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      toast({
        title: "Empresa excluída",
        description: "A empresa foi excluída com sucesso.",
      });
      navigate("/companies");
    },
    onError: (error: any) => {
      const errorMessage = error.message || "";
      const errorData = error.data || {};
      
      if (errorMessage.includes("409") || errorMessage.includes("Conflict") || errorData.error === "COMPANY_HAS_INSPECTIONS") {
        toast({
          variant: "destructive",
          title: "Erro ao excluir empresa",
          description: "Não é possível excluir: existem inspeções vinculadas a esta empresa.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro ao excluir empresa",
          description: "Ocorreu um erro inesperado. Tente novamente.",
        });
      }
    },
  });

  const onSubmit = (data: FormData) => {
    saveCompanyMutation.mutate(data);
  };

  const handleDelete = () => {
    deleteCompanyMutation.mutate();
  };

  // Format CNPJ input
  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.slice(0, 14);
  };

  // Format CEP input
  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length > 5) {
      return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
    }
    return numbers;
  };

  if (isEditing && isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">Carregando...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/companies")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            {isEditing ? "Editar Empresa" : "Nova Empresa"}
          </h1>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Identificação */}
          <Card>
            <CardHeader>
              <CardTitle>Identificação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Empresa *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Empresa de Segurança LTDA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="00000000000000"
                          inputMode="numeric"
                          {...field}
                          onChange={(e) => field.onChange(formatCNPJ(e.target.value))}
                          maxLength={14}
                        />
                      </FormControl>
                      <FormDescription>Apenas números (14 dígitos)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ie"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inscrição Estadual</FormLabel>
                      <FormControl>
                        <Input placeholder="123456789" inputMode="numeric" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input placeholder="contato@empresa.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(11) 9999-9999" type="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.empresa.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo da Empresa</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <Input placeholder="URL da logo" {...field} />
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    const base64 = event.target?.result as string;
                                    field.onChange(base64);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="hidden"
                              id="logo-upload"
                            />
                            <Label htmlFor="logo-upload" className="cursor-pointer">
                              <Button type="button" variant="outline" size="sm" asChild>
                                <span>
                                  <Upload className="h-4 w-4" />
                                </span>
                              </Button>
                            </Label>
                          </div>
                        </div>
                        {field.value && (
                          <div className="flex items-center gap-2">
                            <img
                              src={field.value}
                              alt="Logo preview"
                              className="h-12 w-12 object-cover rounded border"
                            />
                            <span className="text-sm text-muted-foreground">Logo carregada</span>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormDescription>
                      Cole a URL da logo ou use o botão para fazer upload
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card>
            <CardHeader>
              <CardTitle>Endereço</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="logradouro"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logradouro</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua, Avenida, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="numero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input placeholder="123" inputMode="numeric" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bairro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do bairro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="municipio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Município</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da cidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UF</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
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

                <FormField
                  control={form.control}
                  name="cep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="00000-000"
                          inputMode="numeric"
                          {...field}
                          onChange={(e) => field.onChange(formatCEP(e.target.value))}
                          maxLength={9}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="complemento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input placeholder="Apto, Sala, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ibge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código IBGE</FormLabel>
                      <FormControl>
                        <Input placeholder="1234567" inputMode="numeric" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pais"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>País</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contato */}
          <Card>
            <CardHeader>
              <CardTitle>Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="contatoNome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Contato</FormLabel>
                      <FormControl>
                        <Input placeholder="João Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contatoEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail do Contato</FormLabel>
                      <FormControl>
                        <Input placeholder="joao@empresa.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contatoTelefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone do Contato</FormLabel>
                      <FormControl>
                        <Input placeholder="(11) 9999-9999" type="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div>
              {isEditing && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      type="button" 
                      variant="destructive" 
                      data-testid="company-delete"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir Empresa
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir empresa</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir esta empresa?
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        disabled={deleteCompanyMutation.isPending}
                      >
                        {deleteCompanyMutation.isPending ? "Excluindo..." : "Excluir"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/companies")}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                data-testid="company-save"
                disabled={saveCompanyMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {saveCompanyMutation.isPending
                  ? "Salvando..."
                  : isEditing
                  ? "Atualizar"
                  : "Salvar"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

export { CompanyFormPage };