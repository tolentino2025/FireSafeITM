import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapPin, Eye } from "lucide-react";

// Lista oficial de UFs brasileiras
const UF_OPTIONS = [
  { value: "AC", label: "AC - Acre" },
  { value: "AL", label: "AL - Alagoas" },
  { value: "AP", label: "AP - Amapá" },
  { value: "AM", label: "AM - Amazonas" },
  { value: "BA", label: "BA - Bahia" },
  { value: "CE", label: "CE - Ceará" },
  { value: "DF", label: "DF - Distrito Federal" },
  { value: "ES", label: "ES - Espírito Santo" },
  { value: "GO", label: "GO - Goiás" },
  { value: "MA", label: "MA - Maranhão" },
  { value: "MT", label: "MT - Mato Grosso" },
  { value: "MS", label: "MS - Mato Grosso do Sul" },
  { value: "MG", label: "MG - Minas Gerais" },
  { value: "PA", label: "PA - Pará" },
  { value: "PB", label: "PB - Paraíba" },
  { value: "PR", label: "PR - Paraná" },
  { value: "PE", label: "PE - Pernambuco" },
  { value: "PI", label: "PI - Piauí" },
  { value: "RJ", label: "RJ - Rio de Janeiro" },
  { value: "RN", label: "RN - Rio Grande do Norte" },
  { value: "RS", label: "RS - Rio Grande do Sul" },
  { value: "RO", label: "RO - Rondônia" },
  { value: "RR", label: "RR - Roraima" },
  { value: "SC", label: "SC - Santa Catarina" },
  { value: "SP", label: "SP - São Paulo" },
  { value: "SE", label: "SE - Sergipe" },
  { value: "TO", label: "TO - Tocantins" },
] as const;

export interface AddressFieldsProps {
  form: UseFormReturn<any>;
  prefix?: string; // Para diferenciar diferentes tipos de endereço ("address" ou "propertyAddress")
  title?: string;
  showPreview?: boolean;
  required?: boolean;
}

export function AddressFields({ 
  form, 
  prefix = "address", 
  title = "Endereço",
  showPreview = true,
  required = true 
}: AddressFieldsProps) {
  // Função para aplicar máscara de CEP
  const applyCepMask = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica máscara 00000-000
    if (numbers.length <= 5) {
      return numbers;
    } else {
      return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
    }
  };

  // Função para construir endereço concatenado para preview
  const buildFullAddress = () => {
    const watchedValues = form.watch();
    const logradouro = watchedValues[`${prefix}Logradouro`];
    const numero = watchedValues[`${prefix}Numero`];
    const bairro = watchedValues[`${prefix}Bairro`];
    const municipio = watchedValues[`${prefix}Municipio`];
    const estado = watchedValues[`${prefix}Estado`];
    const cep = watchedValues[`${prefix}Cep`];
    const complemento = watchedValues[`${prefix}Complemento`];

    const parts = [];
    
    // Logradouro e número
    if (logradouro && numero) {
      parts.push(`${logradouro}, ${numero}`);
    } else if (logradouro) {
      parts.push(logradouro);
    }

    // Bairro
    if (bairro) {
      parts.push(bairro);
    }

    // Município e UF
    if (municipio && estado) {
      parts.push(`${municipio}/${estado}`);
    } else if (municipio) {
      parts.push(municipio);
    }

    // CEP
    if (cep) {
      parts.push(cep);
    }

    // Complemento
    if (complemento) {
      parts.push(`(${complemento})`);
    }

    return parts.length > 0 ? parts.join(' – ') : 'Endereço incompleto...';
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg font-semibold">
          <MapPin className="w-5 h-5 mr-2 text-primary" />
          {title}
          {required && <span className="text-destructive ml-1">*</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Linha 1: Logradouro (8 cols) + Número (4 cols) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8">
            <FormField
              control={form.control}
              name={`${prefix}Logradouro`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Logradouro {required && <span className="text-destructive">*</span>}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Rua das Flores, Av. Paulista..."
                      {...field}
                      data-testid={`input-${prefix}-logradouro`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="md:col-span-4">
            <FormField
              control={form.control}
              name={`${prefix}Numero`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Número {required && <span className="text-destructive">*</span>}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: 123, 456A..."
                      {...field}
                      data-testid={`input-${prefix}-numero`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Linha 2: Bairro (6 cols) + Município (4 cols) + UF (2 cols) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6">
            <FormField
              control={form.control}
              name={`${prefix}Bairro`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Bairro {required && <span className="text-destructive">*</span>}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Centro, Vila Madalena..."
                      {...field}
                      data-testid={`input-${prefix}-bairro`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="md:col-span-4">
            <FormField
              control={form.control}
              name={`${prefix}Municipio`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Município {required && <span className="text-destructive">*</span>}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: São Paulo, Rio de Janeiro..."
                      {...field}
                      data-testid={`input-${prefix}-municipio`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name={`${prefix}Estado`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    UF {required && <span className="text-destructive">*</span>}
                  </FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger data-testid={`select-${prefix}-estado`}>
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {UF_OPTIONS.map((uf) => (
                        <SelectItem key={uf.value} value={uf.value}>
                          {uf.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Linha 3: CEP + Complemento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <FormField
              control={form.control}
              name={`${prefix}Cep`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    CEP {required && <span className="text-destructive">*</span>}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="00000-000"
                      {...field}
                      onChange={(e) => {
                        const maskedValue = applyCepMask(e.target.value);
                        field.onChange(maskedValue);
                      }}
                      maxLength={9}
                      data-testid={`input-${prefix}-cep`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name={`${prefix}Complemento`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Complemento</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Apto 101, Bloco A, Sala 205..."
                      {...field}
                      data-testid={`input-${prefix}-complemento`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Pré-visualização do endereço concatenado */}
        {showPreview && (
          <>
            <Separator className="my-4" />
            <div className="bg-muted/50 p-4 rounded-lg border">
              <div className="flex items-start space-x-2">
                <Eye className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Pré-visualização do endereço:
                  </p>
                  <p className="text-sm text-foreground break-words">
                    {buildFullAddress()}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Função utilitária para converter endereço estruturado para string legada
export function structuredAddressToLegacy(address: {
  addressLogradouro?: string;
  addressNumero?: string;
  addressBairro?: string;
  addressMunicipio?: string;
  addressEstado?: string;
  addressCep?: string;
  addressComplemento?: string;
}): string {
  const parts = [];
  
  // Logradouro e número
  if (address.addressLogradouro && address.addressNumero) {
    parts.push(`${address.addressLogradouro}, ${address.addressNumero}`);
  } else if (address.addressLogradouro) {
    parts.push(address.addressLogradouro);
  }

  // Bairro
  if (address.addressBairro) {
    parts.push(address.addressBairro);
  }

  // Município e UF
  if (address.addressMunicipio && address.addressEstado) {
    parts.push(`${address.addressMunicipio}/${address.addressEstado}`);
  } else if (address.addressMunicipio) {
    parts.push(address.addressMunicipio);
  }

  // CEP
  if (address.addressCep) {
    parts.push(address.addressCep);
  }

  // Complemento
  if (address.addressComplemento) {
    parts.push(`(${address.addressComplemento})`);
  }

  return parts.join(' – ');
}

// Função utilitária para parsing básico de endereço legado (server-side)
export function parseLegacyAddress(legacyAddress: string) {
  if (!legacyAddress?.trim()) {
    return {};
  }

  const result: any = {};
  
  // Extrair CEP (padrão 00000-000 ou 8 dígitos)
  const cepMatch = legacyAddress.match(/(\d{5}-\d{3}|\d{8})/);
  if (cepMatch) {
    const cep = cepMatch[1];
    result.addressCep = cep.length === 8 ? `${cep.slice(0, 5)}-${cep.slice(5)}` : cep;
  }

  // Extrair UF (2 letras maiúsculas isoladas)
  const ufMatch = legacyAddress.match(/\b([A-Z]{2})\b/);
  if (ufMatch) {
    const uf = ufMatch[1];
    // Validar se é UF válida
    const validUFs = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
    if (validUFs.includes(uf)) {
      result.addressEstado = uf;
    }
  }

  // Extrair número (padrão de dígitos possivelmente seguidos de letra/hífen)
  const numeroMatch = legacyAddress.match(/\b(\d+[A-Za-z\-/]?)\b/);
  if (numeroMatch) {
    result.addressNumero = numeroMatch[1];
  }

  // Se não conseguiu parsear campos essenciais, colocar tudo no complemento
  result.addressComplemento = legacyAddress;

  return result;
}

export default AddressFields;