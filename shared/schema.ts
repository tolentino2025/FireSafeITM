import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  licenseNumber: text("license_number"),
  email: text("email").notNull(),
  role: text("role").notNull().default("inspector"),
});

export const inspections = pgTable("inspections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  facilityName: text("facility_name").notNull(),
  facilityId: text("facility_id"),
  address: text("address").notNull(),
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
  propertyAddress: text("property_address"),
  inspectionDate: timestamp("inspection_date").notNull(),
  formData: text("form_data").notNull(), // Changed from jsonb to text to store JSON string
  signatures: text("signatures").notNull(), // Changed from jsonb to text to store JSON string
  pdfData: text("pdf_data"), // Base64 encoded PDF for storage
  status: text("status").notNull().default("archived"),
  createdAt: timestamp("created_at").default(sql`now()`),
  archivedAt: timestamp("archived_at").default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  licenseNumber: true,
  email: true,
  role: true,
});

export const insertInspectionSchema = createInsertSchema(inspections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSystemInspectionSchema = createInsertSchema(systemInspections).omit({
  id: true,
  createdAt: true,
});

export const insertArchivedReportSchema = createInsertSchema(archivedReports).omit({
  id: true,
  createdAt: true,
  archivedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertInspection = z.infer<typeof insertInspectionSchema>;
export type Inspection = typeof inspections.$inferSelect;
export type InsertSystemInspection = z.infer<typeof insertSystemInspectionSchema>;
export type SystemInspection = typeof systemInspections.$inferSelect;
export type InsertArchivedReport = z.infer<typeof insertArchivedReportSchema>;
export type ArchivedReport = typeof archivedReports.$inferSelect;
