import { type User, type InsertUser, type Inspection, type InsertInspection, type SystemInspection, type InsertSystemInspection } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Inspection methods
  getInspection(id: string): Promise<Inspection | undefined>;
  getInspectionsByInspector(inspectorId: string): Promise<Inspection[]>;
  createInspection(inspection: InsertInspection): Promise<Inspection>;
  updateInspection(id: string, updates: Partial<Inspection>): Promise<Inspection | undefined>;
  getAllInspections(): Promise<Inspection[]>;
  
  // System inspection methods
  getSystemInspectionsByInspection(inspectionId: string): Promise<SystemInspection[]>;
  createSystemInspection(systemInspection: InsertSystemInspection): Promise<SystemInspection>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private inspections: Map<string, Inspection>;
  private systemInspections: Map<string, SystemInspection>;

  constructor() {
    this.users = new Map();
    this.inspections = new Map();
    this.systemInspections = new Map();
    
    // Create a default user
    const defaultUser: User = {
      id: "default-user-id",
      username: "john.engineer",
      password: "password123", // In real app, this would be hashed
      fullName: "John Doe, P.E.",
      licenseNumber: "IL-FSE-12345",
      email: "john@example.com",
      role: "inspector"
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
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "inspector",
      licenseNumber: insertUser.licenseNumber || null
    };
    this.users.set(id, user);
    return user;
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
}

export const storage = new MemStorage();
