import { type User, type InsertUser, type UpdateUserProfile, type UpsertUser, type Inspection, type InsertInspection, type SystemInspection, type InsertSystemInspection, type ArchivedReport, type InsertArchivedReport, archivedReports, users } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private inspections: Map<string, Inspection>;
  private systemInspections: Map<string, SystemInspection>;
  private archivedReports: Map<string, ArchivedReport>;

  constructor() {
    this.users = new Map();
    this.inspections = new Map();
    this.systemInspections = new Map();
    this.archivedReports = new Map();
    
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
    return this.inspections.get(id);
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
      status: inspection.status || "draft",
      progress: inspection.progress || 0,
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
}

export const storage = new MemStorage();
