-- Adicionar coluna company_id na tabela inspections (NULLABLE para compatibilidade)
ALTER TABLE inspections 
ADD COLUMN IF NOT EXISTS company_id varchar;

-- Criar índice para a FK company_id
CREATE INDEX IF NOT EXISTS idx_inspections_company ON inspections(company_id);

-- Adicionar constraint de foreign key (opcional - pode ser adicionada mais tarde se necessário)
-- ALTER TABLE inspections 
-- ADD CONSTRAINT fk_inspections_company_id 
-- FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;