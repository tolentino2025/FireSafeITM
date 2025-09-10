-- Migração Idempotente de Normalização de Endereços
-- Este script pode ser executado múltiplas vezes sem efeitos colaterais

-- ========================================
-- 1. TABELA INSPECTIONS - Adicionar campos estruturados
-- ========================================

DO $$ 
BEGIN
    -- Adicionar colunas de endereço estruturadas apenas se não existirem
    BEGIN
        ALTER TABLE inspections ADD COLUMN address_logradouro TEXT;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE inspections ADD COLUMN address_numero TEXT;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE inspections ADD COLUMN address_bairro TEXT;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE inspections ADD COLUMN address_municipio TEXT;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE inspections ADD COLUMN address_estado CHAR(2);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE inspections ADD COLUMN address_cep CHAR(9);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE inspections ADD COLUMN address_complemento TEXT;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE inspections ADD COLUMN address_ibge TEXT;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE inspections ADD COLUMN address_pais TEXT DEFAULT 'Brasil';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
END $$;

-- ========================================
-- 2. TABELA ARCHIVED_REPORTS - Adicionar campos estruturados
-- ========================================

DO $$ 
BEGIN
    -- Adicionar colunas de endereço estruturadas para propriedade apenas se não existirem
    BEGIN
        ALTER TABLE archived_reports ADD COLUMN property_address_logradouro TEXT;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE archived_reports ADD COLUMN property_address_numero TEXT;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE archived_reports ADD COLUMN property_address_bairro TEXT;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE archived_reports ADD COLUMN property_address_municipio TEXT;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE archived_reports ADD COLUMN property_address_estado CHAR(2);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE archived_reports ADD COLUMN property_address_cep CHAR(9);
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE archived_reports ADD COLUMN property_address_complemento TEXT;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE archived_reports ADD COLUMN property_address_ibge TEXT;
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;

    BEGIN
        ALTER TABLE archived_reports ADD COLUMN property_address_pais TEXT DEFAULT 'Brasil';
    EXCEPTION
        WHEN duplicate_column THEN NULL;
    END;
END $$;

-- ========================================
-- 3. CONSTRAINTS E VALIDAÇÕES
-- ========================================

-- Validação de UF apenas para inspections (se coluna existe)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inspections' AND column_name = 'address_estado'
    ) THEN
        -- Remover constraint existente se houver
        BEGIN
            ALTER TABLE inspections DROP CONSTRAINT IF EXISTS chk_inspections_address_estado;
        END;
        
        -- Adicionar nova constraint
        ALTER TABLE inspections ADD CONSTRAINT chk_inspections_address_estado 
            CHECK (address_estado ~ '^[A-Z]{2}$' OR address_estado IS NULL);
    END IF;
END $$;

-- Validação de CEP apenas para inspections (se coluna existe)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inspections' AND column_name = 'address_cep'
    ) THEN
        -- Remover constraint existente se houver
        BEGIN
            ALTER TABLE inspections DROP CONSTRAINT IF EXISTS chk_inspections_address_cep;
        END;
        
        -- Adicionar nova constraint
        ALTER TABLE inspections ADD CONSTRAINT chk_inspections_address_cep 
            CHECK (address_cep ~ '^[0-9]{5}-[0-9]{3}$' OR address_cep IS NULL);
    END IF;
END $$;

-- Validação de UF para archived_reports (se coluna existe)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'archived_reports' AND column_name = 'property_address_estado'
    ) THEN
        -- Remover constraint existente se houver
        BEGIN
            ALTER TABLE archived_reports DROP CONSTRAINT IF EXISTS chk_archived_reports_property_address_estado;
        END;
        
        -- Adicionar nova constraint
        ALTER TABLE archived_reports ADD CONSTRAINT chk_archived_reports_property_address_estado 
            CHECK (property_address_estado ~ '^[A-Z]{2}$' OR property_address_estado IS NULL);
    END IF;
END $$;

-- Validação de CEP para archived_reports (se coluna existe)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'archived_reports' AND column_name = 'property_address_cep'
    ) THEN
        -- Remover constraint existente se houver
        BEGIN
            ALTER TABLE archived_reports DROP CONSTRAINT IF EXISTS chk_archived_reports_property_address_cep;
        END;
        
        -- Adicionar nova constraint
        ALTER TABLE archived_reports ADD CONSTRAINT chk_archived_reports_property_address_cep 
            CHECK (property_address_cep ~ '^[0-9]{5}-[0-9]{3}$' OR property_address_cep IS NULL);
    END IF;
END $$;

-- ========================================
-- 4. ÍNDICES PARA BUSCA
-- ========================================

-- Índice composto cidade-estado para inspections
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE c.relname = 'idx_inspections_city_state'
    ) THEN
        CREATE INDEX CONCURRENTLY idx_inspections_city_state 
        ON inspections (address_municipio, address_estado) 
        WHERE address_municipio IS NOT NULL AND address_estado IS NOT NULL;
    END IF;
END $$;

-- Índice CEP para inspections
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE c.relname = 'idx_inspections_cep'
    ) THEN
        CREATE INDEX CONCURRENTLY idx_inspections_cep 
        ON inspections (address_cep) 
        WHERE address_cep IS NOT NULL;
    END IF;
END $$;

-- Índice composto cidade-estado para archived_reports
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE c.relname = 'idx_archived_reports_city_state'
    ) THEN
        CREATE INDEX CONCURRENTLY idx_archived_reports_city_state 
        ON archived_reports (property_address_municipio, property_address_estado) 
        WHERE property_address_municipio IS NOT NULL AND property_address_estado IS NOT NULL;
    END IF;
END $$;

-- Índice CEP para archived_reports
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON n.oid = c.relnamespace 
        WHERE c.relname = 'idx_archived_reports_cep'
    ) THEN
        CREATE INDEX CONCURRENTLY idx_archived_reports_cep 
        ON archived_reports (property_address_cep) 
        WHERE property_address_cep IS NOT NULL;
    END IF;
END $$;

-- ========================================
-- 5. BACKFILL - POPULAR NOVOS CAMPOS A PARTIR DOS LEGADOS
-- ========================================

-- Função para normalizar CEP (adicionar hífen se necessário)
CREATE OR REPLACE FUNCTION normalize_cep(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    IF input_text IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Se já está no formato correto, retornar como está
    IF input_text ~ '^[0-9]{5}-[0-9]{3}$' THEN
        RETURN input_text;
    END IF;
    
    -- Se tem 8 dígitos, adicionar hífen
    IF input_text ~ '^[0-9]{8}$' THEN
        RETURN SUBSTRING(input_text, 1, 5) || '-' || SUBSTRING(input_text, 6, 3);
    END IF;
    
    -- Tentar extrair 8 dígitos consecutivos
    IF input_text ~ '[0-9]{8}' THEN
        DECLARE
            cep_match TEXT;
        BEGIN
            SELECT (regexp_matches(input_text, '([0-9]{8})'))[1] INTO cep_match;
            RETURN SUBSTRING(cep_match, 1, 5) || '-' || SUBSTRING(cep_match, 6, 3);
        END;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Backfill para tabela inspections (apenas registros que não tenham os novos campos preenchidos)
DO $$
DECLARE
    rec RECORD;
    cep_extracted TEXT;
    uf_extracted TEXT;
    numero_extracted TEXT;
    remaining_text TEXT;
    parts TEXT[];
BEGIN
    FOR rec IN 
        SELECT id, address 
        FROM inspections 
        WHERE address IS NOT NULL 
        AND address_logradouro IS NULL 
        AND address != ''
    LOOP
        -- Reset das variáveis
        cep_extracted := NULL;
        uf_extracted := NULL;
        numero_extracted := NULL;
        remaining_text := rec.address;
        
        -- Extrair CEP
        cep_extracted := normalize_cep(rec.address);
        
        -- Extrair UF (2 letras maiúsculas)
        IF rec.address ~ '\b[A-Z]{2}\b' THEN
            SELECT (regexp_matches(rec.address, '\b([A-Z]{2})\b'))[1] INTO uf_extracted;
            -- Validar se é uma UF válida
            IF uf_extracted NOT IN ('AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO') THEN
                uf_extracted := NULL;
            END IF;
        END IF;
        
        -- Extrair número (padrão após logradouro)
        IF rec.address ~ '\b\d+[A-Za-z\-/]?\b' THEN
            SELECT (regexp_matches(rec.address, '\b(\d+[A-Za-z\-/]?)\b'))[1] INTO numero_extracted;
        END IF;
        
        -- Atualizar apenas com os campos que conseguimos extrair
        UPDATE inspections 
        SET 
            address_cep = COALESCE(cep_extracted, address_cep),
            address_estado = COALESCE(uf_extracted, address_estado),
            address_numero = COALESCE(numero_extracted, address_numero),
            address_complemento = COALESCE(rec.address, address_complemento) -- Fallback para o endereço completo
        WHERE id = rec.id;
    END LOOP;
END $$;

-- Backfill para tabela archived_reports (apenas registros que não tenham os novos campos preenchidos)
DO $$
DECLARE
    rec RECORD;
    cep_extracted TEXT;
    uf_extracted TEXT;
    numero_extracted TEXT;
BEGIN
    FOR rec IN 
        SELECT id, property_address 
        FROM archived_reports 
        WHERE property_address IS NOT NULL 
        AND property_address_logradouro IS NULL 
        AND property_address != ''
    LOOP
        -- Reset das variáveis
        cep_extracted := NULL;
        uf_extracted := NULL;
        numero_extracted := NULL;
        
        -- Extrair CEP
        cep_extracted := normalize_cep(rec.property_address);
        
        -- Extrair UF (2 letras maiúsculas)
        IF rec.property_address ~ '\b[A-Z]{2}\b' THEN
            SELECT (regexp_matches(rec.property_address, '\b([A-Z]{2})\b'))[1] INTO uf_extracted;
            -- Validar se é uma UF válida
            IF uf_extracted NOT IN ('AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO') THEN
                uf_extracted := NULL;
            END IF;
        END IF;
        
        -- Extrair número (padrão após logradouro)
        IF rec.property_address ~ '\b\d+[A-Za-z\-/]?\b' THEN
            SELECT (regexp_matches(rec.property_address, '\b(\d+[A-Za-z\-/]?)\b'))[1] INTO numero_extracted;
        END IF;
        
        -- Atualizar apenas com os campos que conseguimos extrair
        UPDATE archived_reports 
        SET 
            property_address_cep = COALESCE(cep_extracted, property_address_cep),
            property_address_estado = COALESCE(uf_extracted, property_address_estado),
            property_address_numero = COALESCE(numero_extracted, property_address_numero),
            property_address_complemento = COALESCE(rec.property_address, property_address_complemento) -- Fallback para o endereço completo
        WHERE id = rec.id;
    END LOOP;
END $$;

-- ========================================
-- 6. VIEWS DE COMPATIBILIDADE
-- ========================================

-- View de compatibilidade para inspections
CREATE OR REPLACE VIEW inspections_with_legacy_address AS
SELECT 
    i.*,
    CASE 
        WHEN i.address_logradouro IS NOT NULL THEN
            CONCAT_WS(', ', 
                CONCAT_WS(' ', i.address_logradouro, i.address_numero),
                i.address_bairro,
                CONCAT_WS('/', i.address_municipio, i.address_estado),
                i.address_cep,
                NULLIF(i.address_complemento, '')
            )
        ELSE i.address
    END AS endereco_full
FROM inspections i;

-- View de compatibilidade para archived_reports
CREATE OR REPLACE VIEW archived_reports_with_legacy_address AS
SELECT 
    ar.*,
    CASE 
        WHEN ar.property_address_logradouro IS NOT NULL THEN
            CONCAT_WS(', ', 
                CONCAT_WS(' ', ar.property_address_logradouro, ar.property_address_numero),
                ar.property_address_bairro,
                CONCAT_WS('/', ar.property_address_municipio, ar.property_address_estado),
                ar.property_address_cep,
                NULLIF(ar.property_address_complemento, '')
            )
        ELSE ar.property_address
    END AS property_endereco_full
FROM archived_reports ar;

-- ========================================
-- 7. COMENTÁRIOS E DOCUMENTAÇÃO
-- ========================================

COMMENT ON COLUMN inspections.address IS 'DEPRECATED: Campo legado de endereço. Use os campos address_* estruturados.';
COMMENT ON COLUMN archived_reports.property_address IS 'DEPRECATED: Campo legado de endereço da propriedade. Use os campos property_address_* estruturados.';

-- Log de finalização
DO $$ 
BEGIN
    RAISE NOTICE 'Migração de normalização de endereços concluída com sucesso!';
    RAISE NOTICE 'Campos legados mantidos para compatibilidade (marcados como DEPRECATED)';
    RAISE NOTICE 'Views de compatibilidade criadas: inspections_with_legacy_address, archived_reports_with_legacy_address';
END $$;