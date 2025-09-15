import { type User, type InsertUser, type UpdateUserProfile, type UpsertUser, type Company, type InsertCompany, type UpdateCompany, type Inspection, type InsertInspection, type SystemInspection, type InsertSystemInspection, type ArchivedReport, type InsertArchivedReport, type AppSettings, type UpdateAppSettings, archivedReports, users, appSettings, companies, inspections, firePumps, type FirePump, type InsertFirePump, updateFirePumpSchema } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc, asc, count, ilike, or, and, sql, like } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(id: string, updates: UpdateUserProfile): Promise<User | undefined>;
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Inspection methods
  getInspection(id: string): Promise<Inspection | undefined>;
  getInspectionsByInspector(inspectorId: string): Promise<Inspection[]>;
  createInspection(inspection: InsertInspection): Promise<Inspection>;
  updateInspection(id: string, updates: Partial<Inspection>): Promise<Inspection | undefined>;
  getAllInspections(): Promise<Inspection[]>;
  
  // System inspection methods
  getSystemInspectionsByInspection(inspectionId: string): Promise<SystemInspection[]>;
  createSystemInspection(systemInspection: InsertSystemInspection): Promise<SystemInspection>;

  // Archived reports methods
  getArchivedReportsByUser(userId: string): Promise<ArchivedReport[]>;
  createArchivedReport(report: InsertArchivedReport): Promise<ArchivedReport>;
  getArchivedReport(id: string): Promise<ArchivedReport | undefined>;
  updateArchivedReport(id: string, updates: Partial<InsertArchivedReport>): Promise<ArchivedReport | undefined>;
  
  // App settings methods
  getAppSettings(): Promise<AppSettings>;
  upsertAppSettings(userId: string, patch: Partial<UpdateAppSettings>): Promise<AppSettings>;
  
  // Company methods
  listCompanies(params: { q?: string; page?: number; pageSize?: number }): Promise<{ items: Company[]; total: number }>;
  getCompanyById(id: string): Promise<Company | undefined>;
  createCompany(userId: string, data: InsertCompany): Promise<Company>;
  updateCompany(userId: string, id: string, patch: UpdateCompany): Promise<Company>;
  deleteCompany(id: string): Promise<void>;
  
  // Fire pump methods (DB)
  listFirePumps(params: { companyId: string; q?: string; page?: number; pageSize?: number; }): Promise<{ items: FirePump[]; total: number }>;
  getFirePumpById(id: string): Promise<FirePump | undefined>;
  createFirePump(userId: string, data: InsertFirePump): Promise<FirePump>;
  updateFirePump(userId: string, id: string, patch: Partial<InsertFirePump>): Promise<FirePump>;
  deleteFirePump(id: string): Promise<void>; // soft delete -> is_active=false
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private companies: Map<string, Company>;
  private inspections: Map<string, Inspection>;
  private systemInspections: Map<string, SystemInspection>;
  private archivedReports: Map<string, ArchivedReport>;
  private appSettings: Map<string, AppSettings>;

  constructor() {
    this.users = new Map();
    this.companies = new Map();
    this.inspections = new Map();
    this.systemInspections = new Map();
    this.archivedReports = new Map();
    this.appSettings = new Map();
    
    // Create a default user
    const now = new Date();
    const defaultUser: User = {
      id: "default-user-id",
      username: "john.engineer",
      password: "password123", // In real app, this would be hashed
      fullName: "John Doe, P.E.",
      licenseNumber: "IL-FSE-12345",
      email: "john@example.com",
      role: "inspector",
      companyName: "FireSafe Engineering Solutions",
      companyLogo: null,
      // Replit Auth fields
      firstName: "John",
      lastName: "Doe",
      profileImageUrl: null,
      createdAt: now,
      updatedAt: now
    };
    this.users.set(defaultUser.id, defaultUser);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "inspector",
      licenseNumber: insertUser.licenseNumber || null,
      companyName: insertUser.companyName || null,
      companyLogo: insertUser.companyLogo || null,
      email: insertUser.email || null,
      username: insertUser.username || null,
      password: insertUser.password || null,
      fullName: insertUser.fullName || null,
      firstName: (insertUser as any).firstName || null,
      lastName: (insertUser as any).lastName || null,
      profileImageUrl: (insertUser as any).profileImageUrl || null,
      createdAt: now,
      updatedAt: now
    };
    this.users.set(id, user);
    return user;
  }

  // (IMPORTANT) this user operation is mandatory for Replit Auth.
  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id!);
    const now = new Date();
    
    if (existingUser) {
      // Update existing user
      const updatedUser: User = {
        ...existingUser,
        email: (userData as any).email || existingUser.email,
        firstName: (userData as any).firstName || existingUser.firstName,
        lastName: (userData as any).lastName || existingUser.lastName,
        profileImageUrl: (userData as any).profileImageUrl || existingUser.profileImageUrl,
        updatedAt: now,
      };
      this.users.set(userData.id!, updatedUser);
      return updatedUser;
    } else {
      // Create new user
      const user: User = {
        id: userData.id!,
        email: (userData as any).email || null,
        firstName: (userData as any).firstName || null,
        lastName: (userData as any).lastName || null,
        profileImageUrl: (userData as any).profileImageUrl || null,
        // Custom app fields defaults
        username: null,
        password: null,
        fullName: (userData as any).firstName && (userData as any).lastName ? `${(userData as any).firstName} ${(userData as any).lastName}` : null,
        licenseNumber: null,
        role: "inspector",
        companyName: null,
        companyLogo: null,
        createdAt: now,
        updatedAt: now,
      };
      this.users.set(userData.id!, user);
      return user;
    }
  }

  async updateUserProfile(id: string, updates: UpdateUserProfile): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getInspection(id: string): Promise<Inspection | undefined> {
    // Use database for consistent data
    try {
      const [inspection] = await db
        .select({
          // Select all inspection fields
          id: inspections.id,
          facilityName: inspections.facilityName,
          facilityId: inspections.facilityId,
          address: inspections.address,
          addressLogradouro: inspections.addressLogradouro,
          addressNumero: inspections.addressNumero,
          addressBairro: inspections.addressBairro,
          addressMunicipio: inspections.addressMunicipio,
          addressEstado: inspections.addressEstado,
          addressCep: inspections.addressCep,
          addressComplemento: inspections.addressComplemento,
          addressIbge: inspections.addressIbge,
          addressPais: inspections.addressPais,
          buildingType: inspections.buildingType,
          totalFloorArea: inspections.totalFloorArea,
          inspectionDate: inspections.inspectionDate,
          inspectionType: inspections.inspectionType,
          nextInspectionDue: inspections.nextInspectionDue,
          inspectorId: inspections.inspectorId,
          inspectorName: inspections.inspectorName,
          inspectorLicense: inspections.inspectorLicense,
          status: inspections.status,
          progress: inspections.progress,
          additionalNotes: inspections.additionalNotes,
          environmentalConditions: inspections.environmentalConditions,
          systemCounts: inspections.systemCounts,
          companyId: inspections.companyId,
          createdAt: inspections.createdAt,
          updatedAt: inspections.updatedAt,
          // Join company data - include all fields needed for PDF
          company: {
            id: companies.id,
            name: companies.name,
            cnpj: companies.cnpj,
            ie: companies.ie,
            companyEmail: companies.companyEmail,
            phone: companies.phone,
            website: companies.website,
            logoUrl: companies.logoUrl,
            address: companies.address,
            contact: companies.contact,
          }
        })
        .from(inspections)
        .leftJoin(companies, eq(inspections.companyId, companies.id))
        .where(eq(inspections.id, id))
        .limit(1);
      
      return inspection as any; // Type assertion needed due to joined data
    } catch (error) {
      console.error("Error getting inspection with company:", error);
      // Fallback to memory storage
      return this.inspections.get(id);
    }
  }

  async getInspectionsByInspector(inspectorId: string): Promise<Inspection[]> {
    return Array.from(this.inspections.values()).filter(
      (inspection) => inspection.inspectorId === inspectorId
    );
  }

  async createInspection(inspection: InsertInspection): Promise<Inspection> {
    const id = randomUUID();
    const now = new Date();
    const newInspection: Inspection = {
      ...inspection,
      id,
      facilityId: inspection.facilityId || null,
      buildingType: inspection.buildingType || null,
      totalFloorArea: inspection.totalFloorArea || null,
      nextInspectionDue: inspection.nextInspectionDue || null,
      inspectorLicense: inspection.inspectorLicense || null,
      additionalNotes: inspection.additionalNotes || null,
      environmentalConditions: inspection.environmentalConditions || null,
      systemCounts: inspection.systemCounts || null,
      // Convert undefined to null for address fields
      addressLogradouro: inspection.addressLogradouro || null,
      addressNumero: inspection.addressNumero || null,
      addressBairro: inspection.addressBairro || null,
      addressMunicipio: inspection.addressMunicipio || null,
      addressEstado: inspection.addressEstado || null,
      addressCep: inspection.addressCep || null,
      addressComplemento: inspection.addressComplemento || null,
      addressIbge: inspection.addressIbge || null,
      addressPais: inspection.addressPais || "Brasil",
      companyId: inspection.companyId || null,
      pumpId: inspection.pumpId || null,
      status: inspection.status || "draft",
      progress: inspection.progress || 0,
      generalInformation: inspection.generalInformation || null,
      createdAt: now,
      updatedAt: now,
    };
    this.inspections.set(id, newInspection);
    return newInspection;
  }

  async updateInspection(id: string, updates: Partial<Inspection>): Promise<Inspection | undefined> {
    const inspection = this.inspections.get(id);
    if (!inspection) return undefined;
    
    const updatedInspection: Inspection = {
      ...inspection,
      ...updates,
      updatedAt: new Date(),
    };
    this.inspections.set(id, updatedInspection);
    return updatedInspection;
  }

  async getAllInspections(): Promise<Inspection[]> {
    return Array.from(this.inspections.values());
  }

  async getSystemInspectionsByInspection(inspectionId: string): Promise<SystemInspection[]> {
    return Array.from(this.systemInspections.values()).filter(
      (systemInspection) => systemInspection.inspectionId === inspectionId
    );
  }

  async createSystemInspection(systemInspection: InsertSystemInspection): Promise<SystemInspection> {
    const id = randomUUID();
    const newSystemInspection: SystemInspection = {
      ...systemInspection,
      id,
      systemId: systemInspection.systemId || null,
      location: systemInspection.location || null,
      testResults: systemInspection.testResults || null,
      deficiencies: systemInspection.deficiencies || null,
      corrective_actions: systemInspection.corrective_actions || null,
      passed: systemInspection.passed ?? true,
      createdAt: new Date(),
    };
    this.systemInspections.set(id, newSystemInspection);
    return newSystemInspection;
  }

  async getArchivedReportsByUser(userId: string): Promise<ArchivedReport[]> {
    // Use database instead of memory for persistent storage
    const reports = await db.select().from(archivedReports)
      .where(eq(archivedReports.userId, userId))
      .orderBy(desc(archivedReports.archivedAt));
    return reports;
  }

  async createArchivedReport(insertReport: InsertArchivedReport): Promise<ArchivedReport> {
    // Use database instead of memory for persistent storage
    const [report] = await db.insert(archivedReports)
      .values(insertReport)
      .returning();
    return report;
  }

  async getArchivedReport(id: string): Promise<ArchivedReport | undefined> {
    // Use database instead of memory for persistent storage
    const [report] = await db.select().from(archivedReports)
      .where(eq(archivedReports.id, id))
      .limit(1);
    return report;
  }

  async updateArchivedReport(id: string, updates: Partial<InsertArchivedReport>): Promise<ArchivedReport | undefined> {
    // Use database instead of memory for persistent storage
    const [updatedReport] = await db.update(archivedReports)
      .set(updates)
      .where(eq(archivedReports.id, id))
      .returning();
    return updatedReport;
  }

  async getAppSettings(): Promise<AppSettings> {
    const existing = Array.from(this.appSettings.values())[0];
    
    if (existing) {
      return existing;
    }

    // Return default settings if none exist
    const defaultSettings: AppSettings = {
      id: randomUUID(),
      userId: "system", // Will be updated on first upsert
      company: null,
      locale: {
        language: "pt-BR",
        timezone: "America/Sao_Paulo",
        currency: "BRL",
        dateFormat: "dd/MM/yyyy"
      },
      inspectionDefaults: {
        reminderDays: [1, 3, 7],
        autoAssignInspector: true,
        requireDigitalSignature: true,
        defaultInspectionType: "annual"
      },
      notifications: {
        emailEnabled: true,
        inspectionReminders: true,
        overdueAlerts: true,
        systemAlerts: true
      },
      pdfBranding: {
        showCompanyLogo: true,
        headerColor: "#1f2937",
        footerText: null,
        watermark: null
      },
      addressPolicy: {
        normalizeBR: true,
        requireUF: true,
        requireCEP: true
      },
      integrations: {
        supabase: { url: null, anonKey: null },
        storage: { bucket: null },
        smtp: { smtpHost: null, smtpPort: null, user: null, pass: null }
      },
      security: {
        allowPublicLinks: false,
        require2FA: false
      },
      updatedAt: new Date()
    };
    
    return defaultSettings;
  }

  async upsertAppSettings(userId: string, patch: Partial<UpdateAppSettings>): Promise<AppSettings> {
    const existingSettings = Array.from(this.appSettings.values())[0];
    
    // Get existing or create defaults
    let baseSettings: AppSettings;
    
    if (!existingSettings) {
      baseSettings = {
        id: randomUUID(),
        userId,
        company: null,
        locale: {
          language: "pt-BR",
          timezone: "America/Sao_Paulo",
          currency: "BRL",
          dateFormat: "dd/MM/yyyy"
        },
        inspectionDefaults: {
          reminderDays: [1, 3, 7],
          autoAssignInspector: true,
          requireDigitalSignature: true,
          defaultInspectionType: "annual"
        },
        notifications: {
          emailEnabled: true,
          inspectionReminders: true,
          overdueAlerts: true,
          systemAlerts: true
        },
        pdfBranding: {
          showCompanyLogo: true,
          headerColor: "#1f2937",
          footerText: null,
          watermark: null
        },
        addressPolicy: {
          normalizeBR: true,
          requireUF: true,
          requireCEP: true
        },
        integrations: {
          supabase: { url: null, anonKey: null },
          storage: { bucket: null },
          smtp: { smtpHost: null, smtpPort: null, user: null, pass: null }
        },
        security: {
          allowPublicLinks: false,
          require2FA: false
        },
        updatedAt: new Date()
      };
    } else {
      baseSettings = { ...existingSettings, userId }; // Update userId if needed
    }

    // Deep merge by tab sections - only update provided sections
    const updatedSettings: AppSettings = {
      ...baseSettings,
      updatedAt: new Date()
    };

    // Deep merge each section if provided in patch
    if (patch.company) {
      updatedSettings.company = { ...(baseSettings.company || {}), ...patch.company };
    }
    
    if (patch.locale) {
      updatedSettings.locale = { ...(baseSettings.locale || {}), ...patch.locale };
    }
    
    if (patch.inspectionDefaults) {
      updatedSettings.inspectionDefaults = { ...(baseSettings.inspectionDefaults || {}), ...patch.inspectionDefaults };
    }
    
    if (patch.notifications) {
      updatedSettings.notifications = { ...(baseSettings.notifications || {}), ...patch.notifications };
    }
    
    if (patch.pdfBranding) {
      updatedSettings.pdfBranding = { ...(baseSettings.pdfBranding || {}), ...patch.pdfBranding };
    }
    
    if (patch.addressPolicy) {
      updatedSettings.addressPolicy = { ...(baseSettings.addressPolicy || {}), ...patch.addressPolicy };
    }
    
    if (patch.integrations) {
      const currentIntegrations = baseSettings.integrations || {};
      updatedSettings.integrations = { ...currentIntegrations };
      
      if (patch.integrations.supabase) {
        (updatedSettings.integrations as any).supabase = { 
          ...((currentIntegrations as any).supabase || {}), 
          ...patch.integrations.supabase 
        };
      }
      
      if (patch.integrations.storage) {
        (updatedSettings.integrations as any).storage = { 
          ...((currentIntegrations as any).storage || {}), 
          ...patch.integrations.storage 
        };
      }
      
      if (patch.integrations.smtp) {
        (updatedSettings.integrations as any).smtp = { 
          ...((currentIntegrations as any).smtp || {}), 
          ...patch.integrations.smtp 
        };
      }
    }
    
    if (patch.security) {
      updatedSettings.security = { ...(baseSettings.security || {}), ...patch.security };
    }

    this.appSettings.set(updatedSettings.id, updatedSettings);
    return updatedSettings;
  }

  // Company methods using database
  async listCompanies(params: { q?: string; page?: number; pageSize?: number } = {}): Promise<{ items: Company[]; total: number }> {
    const { q, page = 1, pageSize = 20 } = params;
    const offset = (page - 1) * pageSize;

    try {
      // Build where conditions for search
      const searchConditions = q ? or(
        ilike(companies.name, `%${q}%`),
        ilike(companies.cnpj, `%${q}%`),
        ilike(companies.companyEmail, `%${q}%`)
      ) : undefined;

      // Get total count
      const [totalResult] = await db
        .select({ count: count() })
        .from(companies)
        .where(searchConditions);

      // Get paginated results
      const items = await db
        .select()
        .from(companies)
        .where(searchConditions)
        .orderBy(desc(companies.updatedAt), asc(companies.name))
        .limit(pageSize)
        .offset(offset);

      return {
        items,
        total: totalResult.count
      };
    } catch (error) {
      console.error("Error listing companies:", error);
      throw error;
    }
  }

  async getCompanyById(id: string): Promise<Company | undefined> {
    try {
      const [company] = await db
        .select()
        .from(companies)
        .where(eq(companies.id, id))
        .limit(1);
      return company;
    } catch (error) {
      console.error("Error getting company by id:", error);
      throw error;
    }
  }

  async createCompany(userId: string, data: InsertCompany): Promise<Company> {
    try {
      const now = new Date();
      const [company] = await db
        .insert(companies)
        .values({
          ...data,
          ownerUserId: userId,
          createdAt: now,
          updatedAt: now,
        })
        .returning();
      return company;
    } catch (error) {
      console.error("Error creating company:", error);
      throw error;
    }
  }

  async updateCompany(userId: string, id: string, patch: UpdateCompany): Promise<Company> {
    try {
      const now = new Date();
      const [company] = await db
        .update(companies)
        .set({
          ...patch,
          updatedAt: now,
        })
        .where(eq(companies.id, id))
        .returning();
      
      if (!company) {
        throw new Error("Company not found");
      }
      
      return company;
    } catch (error) {
      console.error("Error updating company:", error);
      throw error;
    }
  }

  async deleteCompany(id: string): Promise<void> {
    try {
      // Check if there are any inspections linked to this company
      const [inspectionCount] = await db
        .select({ count: count() })
        .from(inspections)
        .where(eq(inspections.companyId, id));

      if (inspectionCount.count > 0) {
        const error = new Error("Cannot delete company: there are inspections linked to this company");
        (error as any).code = 409;
        throw error;
      }

      // Delete the company
      await db
        .delete(companies)
        .where(eq(companies.id, id));
    } catch (error) {
      console.error("Error deleting company:", error);
      throw error;
    }
  }

  // ---------- Fire pumps (DB) ----------
  async listFirePumps({ companyId, q, page = 1, pageSize = 10 }: { companyId: string; q?: string; page?: number; pageSize?: number; }):
    Promise<{ items: FirePump[]; total: number }> {
    const offset = (page - 1) * pageSize;
    const where = q
      ? and(eq(firePumps.companyId, companyId), eq(firePumps.isActive, true),
            ilike(firePumps.pumpModel, `%${q}%`))
      : and(eq(firePumps.companyId, companyId), eq(firePumps.isActive, true));
    const [total] = await db.select({ count: count() }).from(firePumps).where(where);
    const items = await db.select().from(firePumps)
      .where(where).orderBy(desc(firePumps.updatedAt))
      .limit(pageSize).offset(offset);
    return { items, total: Number(total?.count ?? 0) };
  }

  async getFirePumpById(id: string) {
    const [row] = await db.select().from(firePumps).where(eq(firePumps.id, id)).limit(1);
    return row;
  }

  async createFirePump(userId: string, data: InsertFirePump) {
    const [row] = await db.insert(firePumps).values({
      ...data, isActive: data.isActive ?? true
    }).returning();
    return row;
  }

  async updateFirePump(userId: string, id: string, patch: Partial<InsertFirePump>) {
    const [row] = await db.update(firePumps)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(firePumps.id, id)).returning();
    return row!;
  }

  async deleteFirePump(id: string) {
    await db.update(firePumps).set({ isActive: false, updatedAt: new Date() })
      .where(eq(firePumps.id, id));
  }
}

export const storage = new MemStorage();
