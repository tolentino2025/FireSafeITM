import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Validações brasileiras
const UF_LIST = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'] as const;

export const brazilianAddressSchema = z.object({
  addressLogradouro: z.string().min(1, "Logradouro é obrigatório"),
  addressNumero: z.string().min(1, "Número é obrigatório"),
  addressBairro: z.string().min(1, "Bairro é obrigatório"),
  addressMunicipio: z.string().min(1, "Município é obrigatório"),
  addressEstado: z.enum(UF_LIST, { errorMap: () => ({ message: "UF inválida" }) }),
  addressCep: z.string().regex(/^[0-9]{5}-[0-9]{3}$/, "CEP deve estar no formato 00000-000"),
  addressComplemento: z.string().optional(),
  addressIbge: z.string().optional(),
  addressPais: z.string().default("Brasil"),
});

export const brazilianPropertyAddressSchema = z.object({
  propertyAddressLogradouro: z.string().min(1, "Logradouro é obrigatório"),
  propertyAddressNumero: z.string().min(1, "Número é obrigatório"),
  propertyAddressBairro: z.string().min(1, "Bairro é obrigatório"),
  propertyAddressMunicipio: z.string().min(1, "Município é obrigatório"),
  propertyAddressEstado: z.enum(UF_LIST, { errorMap: () => ({ message: "UF inválida" }) }),
  propertyAddressCep: z.string().regex(/^[0-9]{5}-[0-9]{3}$/, "CEP deve estar no formato 00000-000"),
  propertyAddressComplemento: z.string().optional(),
  propertyAddressIbge: z.string().optional(),
  propertyAddressPais: z.string().default("Brasil"),
});

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  // Replit Auth fields
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  // Custom fields for Fire Safety Inspection app
  username: text("username").unique(),
  password: text("password"),
  fullName: text("full_name"),
  licenseNumber: text("license_number"),
  role: text("role").notNull().default("inspector"),
  companyName: text("company_name"),
  companyLogo: text("company_logo"), // Base64 encoded image or URL
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const inspections = pgTable("inspections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  facilityName: text("facility_name").notNull(),
  facilityId: text("facility_id"),
  address: text("address").notNull(), // Legacy field - mantém para compatibilidade
  // Novos campos estruturados de endereço
  addressLogradouro: text("address_logradouro"),
  addressNumero: text("address_numero"),
  addressBairro: text("address_bairro"), 
  addressMunicipio: text("address_municipio"),
  addressEstado: text("address_estado"), // UF formato XX
  addressCep: text("address_cep"), // formato 00000-000
  addressComplemento: text("address_complemento"),
  addressIbge: text("address_ibge"), // opcional
  addressPais: text("address_pais").default("Brasil"),
  buildingType: text("building_type"),
  totalFloorArea: integer("total_floor_area"),
  inspectionDate: timestamp("inspection_date").notNull(),
  inspectionType: text("inspection_type").notNull(),
  nextInspectionDue: timestamp("next_inspection_due"),
  inspectorId: varchar("inspector_id").notNull(),
  inspectorName: text("inspector_name").notNull(),
  inspectorLicense: text("inspector_license"),
  status: text("status").notNull().default("draft"), // draft, completed, submitted
  progress: integer("progress").notNull().default(0), // 0-100
  additionalNotes: text("additional_notes"),
  environmentalConditions: jsonb("environmental_conditions"),
  systemCounts: jsonb("system_counts"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const systemInspections = pgTable("system_inspections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  inspectionId: varchar("inspection_id").notNull(),
  systemType: text("system_type").notNull(), // wet, dry, standpipe, pump, valve
  systemId: text("system_id"),
  location: text("location"),
  testResults: jsonb("test_results"),
  deficiencies: text("deficiencies"),
  corrective_actions: text("corrective_actions"),
  passed: boolean("passed").notNull().default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const archivedReports = pgTable("archived_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  formTitle: text("form_title").notNull(),
  propertyName: text("property_name").notNull(),
  propertyAddress: text("property_address"), // Legacy field - mantém para compatibilidade
  // Novos campos estruturados de endereço da propriedade
  propertyAddressLogradouro: text("property_address_logradouro"),
  propertyAddressNumero: text("property_address_numero"),
  propertyAddressBairro: text("property_address_bairro"),
  propertyAddressMunicipio: text("property_address_municipio"),
  propertyAddressEstado: text("property_address_estado"), // UF formato XX
  propertyAddressCep: text("property_address_cep"), // formato 00000-000
  propertyAddressComplemento: text("property_address_complemento"),
  propertyAddressIbge: text("property_address_ibge"), // opcional
  propertyAddressPais: text("property_address_pais").default("Brasil"),
  inspectionDate: timestamp("inspection_date").notNull(),
  formData: text("form_data").notNull(), // Changed from jsonb to text to store JSON string
  signatures: text("signatures").notNull(), // Changed from jsonb to text to store JSON string
  pdfData: text("pdf_data"), // Base64 encoded PDF for storage
  status: text("status").notNull().default("archived"),
  createdAt: timestamp("created_at").default(sql`now()`),
  archivedAt: timestamp("archived_at").default(sql`now()`),
});

export const appSettings = pgTable("app_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  company: jsonb("company"),
  locale: jsonb("locale"),
  inspectionDefaults: jsonb("inspection_defaults"),
  notifications: jsonb("notifications"),
  pdfBranding: jsonb("pdf_branding"),
  addressPolicy: jsonb("address_policy"),
  integrations: jsonb("integrations"),
  security: jsonb("security"),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Replit Auth user types
export type UpsertUser = typeof users.$inferInsert;

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  licenseNumber: true,
  email: true,
  role: true,
  companyName: true,
  companyLogo: true,
});

// Schema for updating user profile
export const updateUserProfileSchema = createInsertSchema(users).pick({
  fullName: true,
  licenseNumber: true,
  email: true,
  companyName: true,
  companyLogo: true,
});

export const insertInspectionSchema = createInsertSchema(inspections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  // Usar coerce para aceitar string e converter automaticamente para Date
  inspectionDate: z.coerce.date(),
  nextInspectionDue: z.coerce.date().optional(),
  // Adicionar validações específicas para os campos estruturados (opcionais por agora para compatibilidade)
  addressLogradouro: z.string().optional(),
  addressNumero: z.string().optional(),
  addressBairro: z.string().optional(),
  addressMunicipio: z.string().optional(),
  addressEstado: z.enum(UF_LIST).optional(),
  addressCep: z.string().regex(/^[0-9]{5}-[0-9]{3}$/, "CEP deve estar no formato 00000-000").optional(),
  addressComplemento: z.string().optional(),
  addressIbge: z.string().optional(),
  addressPais: z.string().default("Brasil").optional(),
});

export const insertSystemInspectionSchema = createInsertSchema(systemInspections).omit({
  id: true,
  createdAt: true,
});

export const insertArchivedReportSchema = createInsertSchema(archivedReports).omit({
  id: true,
  createdAt: true,
  archivedAt: true,
}).extend({
  // Usar coerce para aceitar string e converter automaticamente para Date
  inspectionDate: z.coerce.date(),
  // Adicionar validações específicas para os campos estruturados da propriedade (opcionais por agora para compatibilidade)
  propertyAddressLogradouro: z.string().optional(),
  propertyAddressNumero: z.string().optional(),
  propertyAddressBairro: z.string().optional(),
  propertyAddressMunicipio: z.string().optional(),
  propertyAddressEstado: z.enum(UF_LIST).optional(),
  propertyAddressCep: z.string().regex(/^[0-9]{5}-[0-9]{3}$/, "CEP deve estar no formato 00000-000").optional(),
  propertyAddressComplemento: z.string().optional(),
  propertyAddressIbge: z.string().optional(),
  propertyAddressPais: z.string().default("Brasil").optional(),
});

// Exportar as listas de UFs para uso em componentes
export { UF_LIST };

// Função utilitária para converter endereço estruturado para legado
export function structuredToLegacyAddress(address: Partial<StructuredAddress>): string {
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

  return parts.length > 0 ? parts.join(' – ') : '';
}

// Função utilitária para converter endereço estruturado de propriedade para legado
export function structuredToLegacyPropertyAddress(address: Partial<PropertyStructuredAddress>): string {
  const parts = [];
  
  // Logradouro e número
  if (address.propertyAddressLogradouro && address.propertyAddressNumero) {
    parts.push(`${address.propertyAddressLogradouro}, ${address.propertyAddressNumero}`);
  } else if (address.propertyAddressLogradouro) {
    parts.push(address.propertyAddressLogradouro);
  }

  // Bairro
  if (address.propertyAddressBairro) {
    parts.push(address.propertyAddressBairro);
  }

  // Município e UF
  if (address.propertyAddressMunicipio && address.propertyAddressEstado) {
    parts.push(`${address.propertyAddressMunicipio}/${address.propertyAddressEstado}`);
  } else if (address.propertyAddressMunicipio) {
    parts.push(address.propertyAddressMunicipio);
  }

  // CEP
  if (address.propertyAddressCep) {
    parts.push(address.propertyAddressCep);
  }

  // Complemento
  if (address.propertyAddressComplemento) {
    parts.push(`(${address.propertyAddressComplemento})`);
  }

  return parts.length > 0 ? parts.join(' – ') : '';
}

// Schemas específicos para formulários que precisam de endereços estruturados obrigatórios
export const inspectionWithStructuredAddressSchema = insertInspectionSchema.extend({
  addressLogradouro: z.string().min(1, "Logradouro é obrigatório"),
  addressNumero: z.string().min(1, "Número é obrigatório"),
  addressBairro: z.string().min(1, "Bairro é obrigatório"),
  addressMunicipio: z.string().min(1, "Município é obrigatório"),
  addressEstado: z.enum(UF_LIST, { errorMap: () => ({ message: "UF é obrigatória" }) }),
  addressCep: z.string().regex(/^[0-9]{5}-[0-9]{3}$/, "CEP deve estar no formato 00000-000"),
});

export const archivedReportWithStructuredAddressSchema = insertArchivedReportSchema.extend({
  propertyAddressLogradouro: z.string().min(1, "Logradouro é obrigatório"),
  propertyAddressNumero: z.string().min(1, "Número é obrigatório"),
  propertyAddressBairro: z.string().min(1, "Bairro é obrigatório"),
  propertyAddressMunicipio: z.string().min(1, "Município é obrigatório"),
  propertyAddressEstado: z.enum(UF_LIST, { errorMap: () => ({ message: "UF é obrigatória" }) }),
  propertyAddressCep: z.string().regex(/^[0-9]{5}-[0-9]{3}$/, "CEP deve estar no formato 00000-000"),
});

export const appSettingsSchema = z.object({
  company: z.object({
    name: z.string().optional(),
    cnpj: z.string().regex(/^\d{14}$/, "CNPJ deve ter 14 dígitos").optional(),
    ie: z.string().optional(),
    companyEmail: z.string().email("E-mail inválido").optional(),
    phone: z.string().optional(),
    website: z.string().url("Website deve ser uma URL válida").or(z.string().length(0)).optional(),
    logoUrl: z.string().optional(),
    // Endereço brasileiro estruturado
    logradouro: z.string().optional(),
    numero: z.string().optional(),
    bairro: z.string().optional(),
    municipio: z.string().optional(),
    estado: z.enum(UF_LIST).optional(),
    cep: z.string().regex(/^\d{5}-?\d{3}$/, "CEP deve estar no formato 00000-000 ou 00000000").optional(),
    complemento: z.string().optional(),
    ibge: z.string().optional(),
    pais: z.string().default("Brasil").optional(),
  }).optional(),
  locale: z.object({
    language: z.enum(["pt-BR", "en-US", "it-IT"]).default("pt-BR"),
    timezone: z.string().default("America/Sao_Paulo"),
    dateFormat: z.enum(["dd/MM/yyyy", "MM/dd/yyyy", "yyyy-MM-dd", "dd-MM-yyyy"]).default("dd/MM/yyyy"),
    numberFormat: z.enum(["pt-BR", "en-US", "it-IT"]).default("pt-BR"),
  }).optional(),
  inspectionDefaults: z.object({
    reminderDays: z.array(z.number()).default([1, 3, 7]),
    autoAssignInspector: z.boolean().default(true),
    requireDigitalSignature: z.boolean().default(true),
    requireDoubleSignature: z.boolean().default(false),
    autoArchiveOnSubmit: z.boolean().default(true),
    defaultInspectionType: z.string().default("annual"),
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
    ])).default(["sprinklerWet", "pumpWeekly", "finalInspection"]),
    defaultFrequencies: z.object({
      pumpWeekly: z.boolean().default(true),
      pumpMonthly: z.boolean().default(true), 
      pumpAnnual: z.boolean().default(false),
      sprinklerWet: z.boolean().default(true),
      sprinklerDry: z.boolean().default(false),
      sprinklerPreAction: z.boolean().default(false),
      sprinklerFoamWater: z.boolean().default(false),
      sprinklerWaterSpray: z.boolean().default(false),
      sprinklerWaterMist: z.boolean().default(false),
      standpipe: z.boolean().default(true),
      standpipeHose: z.boolean().default(false),
      fireServiceMains: z.boolean().default(false),
      hydrantFlowTest: z.boolean().default(false),
      controlValves: z.boolean().default(true),
      waterTank: z.boolean().default(false),
      hazardEvaluation: z.boolean().default(false),
      aboveGroundCertificate: z.boolean().default(false),
      undergroundCertificate: z.boolean().default(false),
      finalInspection: z.boolean().default(true),
    }).optional(),
  }).optional(),
  notifications: z.object({
    email: z.object({
      enabled: z.boolean().default(true),
      fromName: z.string().optional(),
      fromAddress: z.string().email("E-mail inválido").optional(),
    }).optional(),
    whatsapp: z.object({
      enabled: z.boolean().default(false),
      provider: z.enum(["twilio", "meta"]).nullable().optional(),
      senderId: z.string().optional(),
    }).optional(),
    reminders: z.object({
      beforeDueDays: z.array(z.number().int().positive()).default([1, 3, 7]),
      dailyDigestHour: z.number().int().min(0).max(23).default(9),
    }).optional(),
  }).optional(),
  pdfBranding: z.object({
    headerTitle: z.string().optional(),
    headerSubtitle: z.string().optional(),
    primaryColor: z.string().regex(/^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Cor inválida").optional(),
    secondaryColor: z.string().regex(/^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Cor inválida").optional(),
    showCompanyLogo: z.boolean().default(true),
    footerText: z.string().optional(),
  }).optional(),
  addressPolicy: z.object({
    enforceStructured: z.boolean().default(false),
    requireCEP: z.boolean().default(true),
    allowInternational: z.boolean().default(false),
  }).optional(),
  integrations: z.object({
    emailService: z.string().optional(),
    storageProvider: z.string().optional(),
    apiKeys: z.record(z.string()).optional(),
  }).optional(),
  security: z.object({
    sessionTimeout: z.number().default(3600),
    requireTwoFactor: z.boolean().default(false),
    passwordPolicy: z.object({
      minLength: z.number().default(8),
      requireSpecialChar: z.boolean().default(false),
    }).optional(),
  }).optional(),
});

export const updateAppSettingsSchema = appSettingsSchema.partial();

// Types principais
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type UpdateUserProfile = z.infer<typeof updateUserProfileSchema>;
export type InsertInspection = z.infer<typeof insertInspectionSchema>;
export type Inspection = typeof inspections.$inferSelect;
export type InsertSystemInspection = z.infer<typeof insertSystemInspectionSchema>;
export type SystemInspection = typeof systemInspections.$inferSelect;
export type InsertArchivedReport = z.infer<typeof insertArchivedReportSchema>;
export type ArchivedReport = typeof archivedReports.$inferSelect;
export type AppSettings = typeof appSettings.$inferSelect;
export type UpdateAppSettings = z.infer<typeof updateAppSettingsSchema>;

// Types para formulários com endereços estruturados obrigatórios
export type InspectionWithStructuredAddress = z.infer<typeof inspectionWithStructuredAddressSchema>;
export type ArchivedReportWithStructuredAddress = z.infer<typeof archivedReportWithStructuredAddressSchema>;

// Type para representar endereço estruturado
export type StructuredAddress = {
  addressLogradouro?: string;
  addressNumero?: string;
  addressBairro?: string;
  addressMunicipio?: string;
  addressEstado?: string;
  addressCep?: string;
  addressComplemento?: string;
  addressIbge?: string;
  addressPais?: string;
};

export type PropertyStructuredAddress = {
  propertyAddressLogradouro?: string;
  propertyAddressNumero?: string;
  propertyAddressBairro?: string;
  propertyAddressMunicipio?: string;
  propertyAddressEstado?: string;
  propertyAddressCep?: string;
  propertyAddressComplemento?: string;
  propertyAddressIbge?: string;
  propertyAddressPais?: string;
};
