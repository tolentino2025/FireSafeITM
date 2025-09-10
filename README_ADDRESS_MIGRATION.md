# Migração de Normalização de Endereços - FireSafe ITM

## Visão Geral

Esta migração implementa a padronização de endereços em campos estruturados em todo o sistema, mantendo compatibilidade com o código existente.

## 📋 Checklist de Implementação

### ✅ Concluído

- [x] **Scan do projeto** - Mapeamento de todos os campos de endereço existentes
- [x] **Nova modelagem canônica** - Schema atualizado com campos estruturados
- [x] **Migração SQL idempotente** - Script SQL seguro e reutilizável
- [x] **Schemas Zod** - Validações para novos campos estruturados
- [x] **Componente AddressFields** - Componente reutilizável responsivo
- [x] **API Backward Compatibility** - Parsing automático de endereços legados

### 🔄 Próximos Passos

- [ ] **Atualização dos formulários** - Substituir campos legados pelo AddressFields
- [ ] **Templates PDF** - Atualizar para usar campos estruturados
- [ ] **Testes de integração** - Validar funcionamento end-to-end

## 🎯 Como Usar o Novo Sistema

### 1. Componente AddressFields

```tsx
import { AddressFields } from "@/components/forms/AddressFields";
import { brazilianAddressSchema } from "@shared/schema";

// Em seus formulários, substitua o campo de endereço legado:
<AddressFields 
  form={form}
  prefix="address"
  title="Endereço da Propriedade"
  showPreview={true}
  required={true}
/>
```

### 2. Schema de Validação

```tsx
import { z } from "zod";
import { brazilianAddressSchema } from "@shared/schema";

const formSchema = z.object({
  propertyName: z.string().min(1, "Nome é obrigatório"),
  // ... outros campos
}).merge(brazilianAddressSchema);
```

### 3. Campos Disponíveis

**Campos estruturados:**
- `addressLogradouro` (obrigatório): Rua, Avenida, etc.
- `addressNumero` (obrigatório): Número do imóvel
- `addressBairro` (obrigatório): Bairro
- `addressMunicipio` (obrigatório): Cidade
- `addressEstado` (obrigatório): UF (AC, AL, AM, ...)
- `addressCep` (obrigatório): CEP no formato 00000-000
- `addressComplemento` (opcional): Apartamento, sala, etc.
- `addressIbge` (opcional): Código IBGE
- `addressPais` (opcional): País (padrão: "Brasil")

**Campo legado (mantido para compatibilidade):**
- `address`: Campo de texto livre (DEPRECATED)

## 🔧 Executar a Migração

1. **Backup do banco de dados** (SEMPRE antes de qualquer migração):
```bash
# Fazer backup completo antes da migração
pg_dump $DATABASE_URL > backup_pre_address_migration.sql
```

2. **Executar migração SQL**:
```sql
-- Conectar ao PostgreSQL e executar:
\i migrations/2025xxxx_address_normalization.sql
```

3. **Verificar resultado**:
```sql
-- Verificar se as colunas foram criadas
\d inspections
\d archived_reports

-- Testar as views de compatibilidade
SELECT endereco_full FROM inspections_with_legacy_address LIMIT 5;
SELECT property_endereco_full FROM archived_reports_with_legacy_address LIMIT 5;
```

## 📝 Atualizando Formulários Existentes

### Antes (legado):
```tsx
<FormField
  control={form.control}
  name="address"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Endereço</FormLabel>
      <FormControl>
        <Textarea {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Depois (estruturado):
```tsx
<AddressFields 
  form={form}
  prefix="address"
  title="Endereço"
  required={true}
/>
```

## 🔄 Backward Compatibility

### API Automática
O sistema detecta automaticamente campos legados e faz parsing:

```javascript
// Request antigo (ainda funciona):
{
  "address": "Rua das Flores, 123, Centro, São Paulo/SP, 01234-567"
}

// É automaticamente convertido para:
{
  "address": "Rua das Flores, 123, Centro, São Paulo/SP, 01234-567",
  "addressLogradouro": "Rua das Flores",
  "addressNumero": "123", 
  "addressBairro": "Centro",
  "addressMunicipio": "São Paulo",
  "addressEstado": "SP",
  "addressCep": "01234-567"
}
```

### Views de Compatibilidade
Para código que ainda usa endereços concatenados:

```sql
-- Em vez de: SELECT address FROM inspections
SELECT endereco_full FROM inspections_with_legacy_address;

-- Em vez de: SELECT property_address FROM archived_reports  
SELECT property_endereco_full FROM archived_reports_with_legacy_address;
```

## 🎨 Layout Responsivo

O componente AddressFields usa grid responsivo:

**Desktop:**
```
[Logradouro - 8 colunas] [Número - 4 colunas]
[Bairro - 6 col] [Município - 4 col] [UF - 2 col]  
[CEP - 4 colunas] [Complemento - 8 colunas]
```

**Mobile:**
```
[Logradouro - 12 colunas]
[Número - 12 colunas]
[Bairro - 12 colunas]
[Município - 12 colunas]
[UF - 12 colunas]
[CEP - 12 colunas]
[Complemento - 12 colunas]
```

## 🧪 Validações Implementadas

- **CEP**: Formato obrigatório `00000-000`
- **UF**: Lista válida de estados brasileiros
- **Campos obrigatórios**: Logradouro, número, bairro, município, estado, CEP
- **Máscara automática**: CEP com formatação durante digitação
- **Preview**: Visualização do endereço concatenado em tempo real

## ⚠️ Importante

1. **NÃO REMOVER** campos legados nesta etapa - apenas marcar como DEPRECATED
2. **TESTAR** parsing em ambiente de staging antes de produção
3. **BACKUP** sempre antes de executar migrações
4. **RLS/Permissions** foram preservadas nas novas colunas

## 📊 Relatório de Cobertura

### Formulários Identificados (13 arquivos):

**Com `propertyAddress`:**
- hazard-evaluation-form.tsx (+ ownerAddress)
- wet-sprinkler-form.tsx
- dry-sprinkler-form.tsx
- preaction-deluge-form.tsx
- annual-pump-form.tsx
- monthly-pump-form.tsx
- weekly-pump-form.tsx
- above-ground-certificate-form.tsx (+ authorityAddress)
- underground-certificate-form.tsx

**Com `address`:**
- standpipe-hose-form.tsx
- hydrant-flow-test-form.tsx
- fire-service-mains-form.tsx
- water-tank-form.tsx

**Outros componentes afetados:**
- form-actions.tsx (processa endereços)
- pdf-generator.ts (renderiza endereços)
- reports-history.tsx (exibe endereços)
- user-dashboard.tsx (exibe endereços)

## 🚀 Exemplo Completo de Migração

### 1. Atualizar um formulário:

```tsx
// standpipe-hose-form.tsx
import { AddressFields } from "@/components/forms/AddressFields";
import { brazilianAddressSchema } from "@shared/schema";

// Schema do formulário
const formSchema = z.object({
  propertyName: z.string().min(1, "Nome é obrigatório"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  // ... outros campos
}).merge(brazilianAddressSchema);

// No formulário, substituir:
// <Textarea name="address" />

// Por:
<AddressFields 
  form={form}
  prefix="address"
  title="Endereço da Propriedade"
  required={true}
/>
```

### 2. Função utilitária para legacy:

```tsx
import { structuredAddressToLegacy } from "@/components/forms/AddressFields";

// Para gerar endereço legado quando necessário:
const legacyAddress = structuredAddressToLegacy({
  addressLogradouro: "Rua das Flores",
  addressNumero: "123",
  addressBairro: "Centro", 
  addressMunicipio: "São Paulo",
  addressEstado: "SP",
  addressCep: "01234-567"
});
// Resultado: "Rua das Flores, 123 – Centro – São Paulo/SP – 01234-567"
```

## 🔧 Rollback Plan

Se necessário reverter a migração:

1. **Usar views de compatibilidade** - código antigo continua funcionando
2. **Campos legados preservados** - dados não são perdidos  
3. **Script de rollback** - remover apenas novas colunas se necessário:

```sql
-- APENAS se necessário rollback completo (não recomendado):
ALTER TABLE inspections DROP COLUMN IF EXISTS address_logradouro CASCADE;
-- ... remover outras colunas estruturadas
-- Dados legados em 'address' e 'property_address' permanecem intactos
```

---

**Status**: ✅ Implementação base concluída  
**Próximo**: Atualização gradual dos formulários usando AddressFields