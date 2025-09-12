-- Criar tabela companies
CREATE TABLE IF NOT EXISTS companies (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL,
  owner_user_id text,
  -- Identificação
  name text NOT NULL,
  cnpj text,
  ie text,
  company_email text,
  phone text,
  website text,
  logo_url text,
  -- Endereço (JSONB)
  address jsonb,
  -- Contato (JSONB)
  contact jsonb
);

-- Criar índice para busca no nome da empresa (usando btree padrão para compatibilidade)
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies (name);

-- Nota: Para busca textual avançada, pode ser adicionado gin_trgm_ops depois se a extensão pg_trgm estiver disponível