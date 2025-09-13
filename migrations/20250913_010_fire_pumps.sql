-- Cadastro de Bombas de Incêndio
CREATE TABLE IF NOT EXISTS fire_pumps (
  id            varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    varchar NOT NULL,
  site_id       varchar,
  pump_manufacturer  text,
  pump_model         text,
  pump_serial        text,
  rated_rpm          text,
  controller_mfr     text,
  controller_model   text,
  controller_sn      text,
  max_suction_pressure_psi integer,
  max_psi_shutoff           integer,
  rated_capacity_gpm        integer,
  rated_pressure_psi        integer,
  cap_150_gpm               integer,
  rated_pressure_at_rated_capacity_psi integer,
  driver_mfr         text,
  driver_model       text,
  notes              text,
  is_active          boolean DEFAULT true,
  created_at         timestamp DEFAULT now(),
  updated_at         timestamp DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_fire_pumps_company ON fire_pumps(company_id);
CREATE INDEX IF NOT EXISTS idx_fire_pumps_active  ON fire_pumps(is_active);

-- Vínculo opcional da inspeção com a bomba
ALTER TABLE inspections 
  ADD COLUMN IF NOT EXISTS pump_id varchar;
CREATE INDEX IF NOT EXISTS idx_inspections_pump ON inspections(pump_id);