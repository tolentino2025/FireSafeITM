import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertInspectionSchema, 
  insertSystemInspectionSchema, 
  insertArchivedReportSchema, 
  updateUserProfileSchema,
  updateAppSettingsSchema,
  insertCompanySchema,
  updateCompanySchema,
  insertFirePumpSchema,
  updateFirePumpSchema,
  StructuredAddress,
  PropertyStructuredAddress,
  structuredToLegacyAddress,
  structuredToLegacyPropertyAddress
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get current user (legacy endpoint for backward compatibility)
  app.get("/api/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile
  app.put("/api/user/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = updateUserProfileSchema.parse(req.body);
      const updatedUser = await storage.updateUserProfile(userId, validatedData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid profile data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Get draft inspections
  app.get("/api/inspections/drafts", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const inspections = await storage.getInspectionsByInspector(userId);
      const drafts = inspections.filter(inspection => inspection.status === "draft");
      res.json(drafts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch draft inspections" });
    }
  });

  // Get reports history - REMOVED - now handled by the normalized version in legacy alias section below

  // Download report PDF - REMOVED - now handled by the consistent version in legacy alias section below

  // Delete inspection
  app.delete("/api/inspections/:id", isAuthenticated, async (req: any, res) => {
    try {
      const inspection = await storage.getInspection(req.params.id);
      if (!inspection) {
        return res.status(404).json({ message: "Inspection not found" });
      }
      
      // In a real implementation, you'd want to actually delete the inspection
      // For now, we'll just return success since MemStorage doesn't have a delete method
      res.json({ message: "Inspection deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete inspection" });
    }
  });

  // Get all inspections
  app.get("/api/inspections", isAuthenticated, async (req: any, res) => {
    try {
      const inspections = await storage.getAllInspections();
      res.json(inspections);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inspections" });
    }
  });

  // Get specific inspection
  app.get("/api/inspections/:id", isAuthenticated, async (req: any, res) => {
    try {
      const inspection = await storage.getInspection(req.params.id);
      if (!inspection) {
        return res.status(404).json({ message: "Inspection not found" });
      }
      res.json(inspection);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inspection" });
    }
  });

  // Função helper para converter null em undefined (necessário para compatibilidade de tipos)
  const nullToUndefined = (value: string | null): string | undefined => {
    return value === null ? undefined : value;
  };

  // Função helper para parsing de endereço legado de propriedade
  const parseLegacyPropertyAddress = (legacyAddress: string): Partial<PropertyStructuredAddress> => {
    if (!legacyAddress?.trim()) {
      return {};
    }

    const result: Partial<PropertyStructuredAddress> = {};
    
    // Extrair CEP (padrão 00000-000 ou 8 dígitos)
    const cepMatch = legacyAddress.match(/(\d{5}-\d{3}|\d{8})/);
    if (cepMatch) {
      const cep = cepMatch[1];
      result.propertyAddressCep = cep.length === 8 ? `${cep.slice(0, 5)}-${cep.slice(5)}` : cep;
    }

    // Extrair UF (2 letras maiúsculas isoladas)
    const ufMatch = legacyAddress.match(/\b([A-Z]{2})\b/);
    if (ufMatch) {
      const uf = ufMatch[1];
      // Validar se é UF válida
      const validUFs = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
      if (validUFs.includes(uf)) {
        result.propertyAddressEstado = uf;
      }
    }

    // Extrair número (padrão de dígitos possivelmente seguidos de letra/hífen)
    const numeroMatch = legacyAddress.match(/\b(\d+[A-Za-z\-/]?)\b/);
    if (numeroMatch) {
      result.propertyAddressNumero = numeroMatch[1];
    }

    // Se não conseguiu parsear campos essenciais, colocar tudo no complemento
    result.propertyAddressComplemento = legacyAddress;

    return result;
  };

  // Função helper para parsing de endereço legado
  const parseLegacyAddress = (legacyAddress: string): Partial<StructuredAddress> => {
    if (!legacyAddress?.trim()) {
      return {};
    }

    const result: Partial<StructuredAddress> = {};
    
    // Extrair CEP (padrão 00000-000 ou 8 dígitos)
    const cepMatch = legacyAddress.match(/(\d{5}-\d{3}|\d{8})/);
    if (cepMatch) {
      const cep = cepMatch[1];
      result.addressCep = cep.length === 8 ? `${cep.slice(0, 5)}-${cep.slice(5)}` : cep;
    }

    // Extrair UF (2 letras maiúsculas isoladas)
    const ufMatch = legacyAddress.match(/\b([A-Z]{2})\b/);
    if (ufMatch) {
      const uf = ufMatch[1];
      // Validar se é UF válida
      const validUFs = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
      if (validUFs.includes(uf)) {
        result.addressEstado = uf;
      }
    }

    // Extrair número (padrão de dígitos possivelmente seguidos de letra/hífen)
    const numeroMatch = legacyAddress.match(/\b(\d+[A-Za-z\-/]?)\b/);
    if (numeroMatch) {
      result.addressNumero = numeroMatch[1];
    }

    // Se não conseguiu parsear campos essenciais, colocar tudo no complemento
    result.addressComplemento = legacyAddress;

    return result;
  };

  // Create new inspection (now requires companyId)
  app.post("/api/inspections", isAuthenticated, async (req: any, res) => {
    try {
      console.log("Received inspection data:", JSON.stringify(req.body, null, 2));
      
      // Validate that companyId is provided
      if (!req.body.companyId) {
        return res.status(400).json({ 
          error: "Validation failed",
          details: "companyId is required" 
        });
      }
      
      // Composição bidirecional legacy ↔ structured
      let processedData = { ...req.body };
      
      // 1. Legacy → Structured: se vier com address legado, parsear para campos estruturados
      if (req.body.address && !req.body.addressLogradouro) {
        console.log("Parsing legacy address:", req.body.address);
        const parsedAddress = parseLegacyAddress(req.body.address);
        processedData = {
          ...processedData,
          ...parsedAddress
        };
        console.log("Parsed address fields:", parsedAddress);
      }
      
      // 2. Structured → Legacy: se vier com campos estruturados mas sem address legado, compor
      else if (req.body.addressLogradouro && !req.body.address) {
        console.log("Composing legacy address from structured fields");
        const composedAddress = structuredToLegacyAddress({
          addressLogradouro: req.body.addressLogradouro,
          addressNumero: req.body.addressNumero,
          addressBairro: req.body.addressBairro,
          addressMunicipio: req.body.addressMunicipio,
          addressEstado: req.body.addressEstado,
          addressCep: req.body.addressCep,
          addressComplemento: req.body.addressComplemento
        });
        processedData = {
          ...processedData,
          address: composedAddress
        };
        console.log("Composed legacy address:", composedAddress);
      }
      
      const validatedData = insertInspectionSchema.parse(processedData);
      const inspection = await storage.createInspection(validatedData);
      res.status(201).json(inspection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log("Validation errors:", error.errors);
        return res.status(400).json({ 
          error: "Validation failed", 
          details: error.errors 
        });
      }
      console.error("Error creating inspection:", error);
      res.status(500).json({ 
        error: "Internal server error",
        details: "Failed to create inspection" 
      });
    }
  });

  // Update inspection
  app.patch("/api/inspections/:id", async (req, res) => {
    try {
      // Aplicar mesma composição bidirecional no update
      let processedData = { ...req.body };
      
      // Legacy → Structured
      if (req.body.address && !req.body.addressLogradouro) {
        console.log("Parsing legacy address on update:", req.body.address);
        const parsedAddress = parseLegacyAddress(req.body.address);
        processedData = {
          ...processedData,
          ...parsedAddress
        };
      }
      
      // Structured → Legacy
      else if (req.body.addressLogradouro && !req.body.address) {
        console.log("Composing legacy address from structured fields on update");
        const composedAddress = structuredToLegacyAddress({
          addressLogradouro: req.body.addressLogradouro,
          addressNumero: req.body.addressNumero,
          addressBairro: req.body.addressBairro,
          addressMunicipio: req.body.addressMunicipio,
          addressEstado: req.body.addressEstado,
          addressCep: req.body.addressCep,
          addressComplemento: req.body.addressComplemento
        });
        processedData = {
          ...processedData,
          address: composedAddress
        };
      }
      
      const validatedData = insertInspectionSchema.partial().parse(processedData);
      const inspection = await storage.updateInspection(req.params.id, validatedData);
      if (!inspection) {
        return res.status(404).json({ message: "Inspection not found" });
      }
      res.json(inspection);
    } catch (error) {
      res.status(500).json({ message: "Failed to update inspection" });
    }
  });

  // Get system inspections for an inspection
  app.get("/api/inspections/:id/systems", async (req, res) => {
    try {
      const systemInspections = await storage.getSystemInspectionsByInspection(req.params.id);
      res.json(systemInspections);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch system inspections" });
    }
  });

  // Create system inspection
  app.post("/api/system-inspections", async (req, res) => {
    try {
      const validatedData = insertSystemInspectionSchema.parse(req.body);
      const systemInspection = await storage.createSystemInspection(validatedData);
      res.status(201).json(systemInspection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid system inspection data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create system inspection" });
    }
  });


  // Archived reports endpoints
  
  // Get archived reports for current user
  app.get("/api/archived-reports", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reports = await storage.getArchivedReportsByUser(userId);
      
      // Read-time normalization: garantir que tanto campos legacy quanto estruturados estejam presentes
      const normalizedReports = reports.map(report => {
        const normalized = { ...report };
        
        // Se tem campos estruturados mas não tem legacy, compor
        if (report.propertyAddressLogradouro && !report.propertyAddress) {
          normalized.propertyAddress = structuredToLegacyPropertyAddress({
            propertyAddressLogradouro: nullToUndefined(report.propertyAddressLogradouro),
            propertyAddressNumero: nullToUndefined(report.propertyAddressNumero),
            propertyAddressBairro: nullToUndefined(report.propertyAddressBairro),
            propertyAddressMunicipio: nullToUndefined(report.propertyAddressMunicipio),
            propertyAddressEstado: nullToUndefined(report.propertyAddressEstado),
            propertyAddressCep: nullToUndefined(report.propertyAddressCep),
            propertyAddressComplemento: nullToUndefined(report.propertyAddressComplemento)
          });
        }
        
        // Se tem legacy mas não tem estruturados, parsear (melhor esforço)
        if (report.propertyAddress && !report.propertyAddressLogradouro) {
          const parsedAddress = parseLegacyPropertyAddress(report.propertyAddress);
          Object.assign(normalized, parsedAddress);
        }
        
        return normalized;
      });
      
      res.json(normalizedReports);
    } catch (error) {
      console.error("Database error fetching archived reports:", error);
      res.status(503).json({ message: "Database temporarily unavailable. Please try again later." });
    }
  });

  // Create new archived report
  app.post("/api/archived-reports", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // Add userId to the request body
      req.body.userId = userId;
      console.log("Received archived report data:", JSON.stringify({...req.body, pdfData: req.body.pdfData ? "[PDF_DATA_PRESENT]" : "[NO_PDF]"}, null, 2));
      
      // Composição bidirecional para propriedade legacy ↔ structured
      let processedData = { ...req.body };
      
      // Legacy → Structured: propertyAddress legado para campos estruturados
      if (req.body.propertyAddress && !req.body.propertyAddressLogradouro) {
        console.log("Parsing legacy property address:", req.body.propertyAddress);
        const parsedAddress = parseLegacyPropertyAddress(req.body.propertyAddress);
        processedData = {
          ...processedData,
          ...parsedAddress
        };
        console.log("Parsed property address fields:", parsedAddress);
      }
      
      // Structured → Legacy: campos estruturados para propertyAddress legado
      else if (req.body.propertyAddressLogradouro && !req.body.propertyAddress) {
        console.log("Composing legacy property address from structured fields");
        const composedAddress = structuredToLegacyPropertyAddress({
          propertyAddressLogradouro: nullToUndefined(req.body.propertyAddressLogradouro),
          propertyAddressNumero: nullToUndefined(req.body.propertyAddressNumero),
          propertyAddressBairro: nullToUndefined(req.body.propertyAddressBairro),
          propertyAddressMunicipio: nullToUndefined(req.body.propertyAddressMunicipio),
          propertyAddressEstado: nullToUndefined(req.body.propertyAddressEstado),
          propertyAddressCep: nullToUndefined(req.body.propertyAddressCep),
          propertyAddressComplemento: nullToUndefined(req.body.propertyAddressComplemento)
        });
        processedData = {
          ...processedData,
          propertyAddress: composedAddress
        };
        console.log("Composed legacy property address:", composedAddress);
      }
      
      // Process general_information if provided
      if (req.body.general_information) {
        try {
          // Validate general_information structure
          const { generalInformationSchema } = await import("../shared/schema.js");
          const validatedGeneralInfo = generalInformationSchema.parse(req.body.general_information);
          processedData.generalInformation = validatedGeneralInfo;
          console.log("General information validated and processed");
        } catch (error) {
          console.error("General information validation error:", error);
          if (error instanceof z.ZodError) {
            return res.status(400).json({ 
              message: "Dados de informações gerais inválidos", 
              errors: error.errors 
            });
          }
        }
      }
      
      // Normalize and validate date fields - prevent HTTP 500 from invalid dates
      const rawDate = processedData.inspectionDate ?? processedData.date;
      if (rawDate) {
        const dateObj = new Date(rawDate);
        if (isNaN(dateObj.getTime())) {
          console.error("Invalid date provided:", rawDate);
          return res.status(400).json({ 
            message: "Data de inspeção inválida. Use formato AAAA-MM-DD.", 
            invalidDate: rawDate 
          });
        }
        // Normalize to ISO string
        processedData.inspectionDate = dateObj.toISOString();
        console.log("Normalized date:", rawDate, "->", processedData.inspectionDate);
      }
      
      const validatedData = insertArchivedReportSchema.parse(processedData);
      console.log("Validation successful, creating report...");
      const report = await storage.createArchivedReport(validatedData);
      console.log("Report created successfully:", report.id);
      res.status(201).json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid report data", errors: error.errors });
      }
      console.error("Database error creating archived report:", error);
      res.status(503).json({ message: "Database temporarily unavailable. Please try again later." });
    }
  });

  // Update archived report
  app.put("/api/archived-reports/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Verificar se o relatório existe e pertence ao usuário
      const existingReport = await storage.getArchivedReport(req.params.id);
      if (!existingReport) {
        return res.status(404).json({ message: "Report not found" });
      }
      if (existingReport.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized to update this report" });
      }
      
      let processedData = { ...req.body };
      
      // Process general_information if provided
      if (req.body.general_information) {
        try {
          const { generalInformationSchema } = await import("../shared/schema.js");
          const validatedGeneralInfo = generalInformationSchema.parse(req.body.general_information);
          processedData.generalInformation = validatedGeneralInfo;
          console.log("General information validated and processed for update");
        } catch (error) {
          console.error("General information validation error:", error);
          if (error instanceof z.ZodError) {
            return res.status(400).json({ 
              message: "Dados de informações gerais inválidos", 
              errors: error.errors 
            });
          }
        }
      }
      
      // Validar e normalizar dados
      const validatedData = insertArchivedReportSchema.partial().parse(processedData);
      const updatedReport = await storage.updateArchivedReport(req.params.id, validatedData);
      
      if (!updatedReport) {
        return res.status(404).json({ message: "Report not found" });
      }
      
      res.json(updatedReport);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid report data", errors: error.errors });
      }
      console.error("Database error updating archived report:", error);
      res.status(503).json({ message: "Database temporarily unavailable. Please try again later." });
    }
  });

  // Get specific archived report
  app.get("/api/archived-reports/:id", async (req, res) => {
    try {
      const report = await storage.getArchivedReport(req.params.id);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      
      // Read-time normalization: garantir que tanto campos legacy quanto estruturados estejam presentes
      const normalized: any = { ...report };
      
      // Se tem campos estruturados mas não tem legacy, compor
      if (report.propertyAddressLogradouro && !report.propertyAddress) {
        normalized.propertyAddress = structuredToLegacyPropertyAddress({
          propertyAddressLogradouro: nullToUndefined(report.propertyAddressLogradouro),
          propertyAddressNumero: nullToUndefined(report.propertyAddressNumero),
          propertyAddressBairro: nullToUndefined(report.propertyAddressBairro),
          propertyAddressMunicipio: nullToUndefined(report.propertyAddressMunicipio),
          propertyAddressEstado: nullToUndefined(report.propertyAddressEstado),
          propertyAddressCep: nullToUndefined(report.propertyAddressCep),
          propertyAddressComplemento: nullToUndefined(report.propertyAddressComplemento)
        });
      }
      
      // Se tem legacy mas não tem estruturados, parsear (melhor esforço)
      if (report.propertyAddress && !report.propertyAddressLogradouro) {
        const parsedAddress = parseLegacyPropertyAddress(report.propertyAddress);
        Object.assign(normalized, parsedAddress);
      }
      
      // Return general_information if available
      if (report.generalInformation) {
        try {
          normalized.general_information = typeof report.generalInformation === 'string' 
            ? JSON.parse(report.generalInformation) 
            : report.generalInformation;
        } catch (error) {
          console.error("Error parsing general_information:", error);
          normalized.general_information = null;
        }
      }
      
      res.json(normalized);
    } catch (error) {
      console.error("Database error fetching archived report:", error);
      res.status(503).json({ message: "Database temporarily unavailable. Please try again later." });
    }
  });

  // Download PDF for archived report
  app.get("/api/archived-reports/:id/pdf", async (req, res) => {
    try {
      const report = await storage.getArchivedReport(req.params.id);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      
      if (!report.pdfData) {
        return res.status(404).json({ message: "PDF not available for this report" });
      }

      // Convert base64 to buffer
      const pdfBuffer = Buffer.from(report.pdfData, 'base64');
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${report.formTitle.replace(/\s+/g, '_')}_${report.propertyName.replace(/\s+/g, '_')}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Database error downloading PDF:", error);
      res.status(503).json({ message: "Database temporarily unavailable. Please try again later." });
    }
  });

  // App Settings endpoints

  // Get app settings - always returns 200 with existing or defaults
  app.get("/api/settings", isAuthenticated, async (req: any, res) => {
    try {
      const settings = await storage.getAppSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching app settings:", error);
      res.status(500).json({ 
        message: "Erro interno do servidor ao buscar configurações",
        error: "Internal server error" 
      });
    }
  });

  // Update app settings - deep merge by tab with partial payload
  app.put("/api/settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate request body with Zod
      const validatedData = updateAppSettingsSchema.parse(req.body);
      
      // Deep merge and update with timestamp
      const updatedSettings = await storage.upsertAppSettings(userId, validatedData);
      
      res.json(updatedSettings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Settings validation errors:", error.errors);
        return res.status(400).json({ 
          message: "Dados de configuração inválidos",
          error: "Validation failed",
          details: error.errors 
        });
      }
      
      console.error("Error updating app settings:", error);
      res.status(500).json({ 
        message: "Erro interno do servidor ao atualizar configurações",
        error: "Internal server error" 
      });
    }
  });

  // Company endpoints

  // List companies with search and pagination
  app.get("/api/companies", isAuthenticated, async (req: any, res) => {
    try {
      const { q, page = 1, pageSize = 20 } = req.query;
      const result = await storage.listCompanies({
        q: q as string,
        page: parseInt(page as string, 10),
        pageSize: parseInt(pageSize as string, 10)
      });
      res.json(result);
    } catch (error) {
      console.error("Error listing companies:", error);
      res.status(500).json({ 
        error: "Internal server error",
        details: "Failed to list companies" 
      });
    }
  });

  // Search companies (limited to 10 results)
  app.get("/api/companies/search", isAuthenticated, async (req: any, res) => {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ 
          error: "Bad request",
          details: "Query parameter 'q' is required" 
        });
      }
      
      const result = await storage.listCompanies({
        q: q as string,
        page: 1,
        pageSize: 10
      });
      res.json(result);
    } catch (error) {
      console.error("Error searching companies:", error);
      res.status(500).json({ 
        error: "Internal server error",
        details: "Failed to search companies" 
      });
    }
  });

  // Get company by ID
  app.get("/api/companies/:id", isAuthenticated, async (req: any, res) => {
    try {
      const company = await storage.getCompanyById(req.params.id);
      if (!company) {
        return res.status(404).json({ 
          error: "Not found",
          details: "Company not found" 
        });
      }
      res.json(company);
    } catch (error) {
      console.error("Error getting company:", error);
      res.status(500).json({ 
        error: "Internal server error",
        details: "Failed to get company" 
      });
    }
  });

  // Create company
  app.post("/api/companies", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(userId, validatedData);
      res.status(201).json(company);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Company validation errors:", error.errors);
        return res.status(400).json({ 
          error: "Validation failed",
          details: error.errors 
        });
      }
      
      console.error("Error creating company:", error);
      res.status(500).json({ 
        error: "Internal server error",
        details: "Failed to create company" 
      });
    }
  });

  // Update company
  app.put("/api/companies/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = updateCompanySchema.parse(req.body);
      const company = await storage.updateCompany(userId, req.params.id, validatedData);
      res.json(company);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Company validation errors:", error.errors);
        return res.status(400).json({ 
          error: "Validation failed",
          details: error.errors 
        });
      }
      
      if ((error as Error).message === "Company not found") {
        return res.status(404).json({ 
          error: "Not found",
          details: "Company not found" 
        });
      }
      
      console.error("Error updating company:", error);
      res.status(500).json({ 
        error: "Internal server error",
        details: "Failed to update company" 
      });
    }
  });

  // Delete company
  app.delete("/api/companies/:id", isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteCompany(req.params.id);
      res.status(204).send();
    } catch (error) {
      if ((error as any).code === 409) {
        return res.status(409).json({ 
          error: "COMPANY_HAS_INSPECTIONS"
        });
      }
      
      console.error("Error deleting company:", error);
      res.status(500).json({ 
        error: "Internal server error",
        details: "Failed to delete company" 
      });
    }
  });

  // ---- Fire Pumps ----
  app.get("/api/fire-pumps/search", isAuthenticated, async (req: any, res) => {
    try {
      const { q = "", companyId, page = "1", pageSize = "10" } = req.query;
      if (!companyId) return res.status(400).json({ error: "companyId required" });
      const result = await storage.listFirePumps({
        companyId: String(companyId),
        q: String(q),
        page: parseInt(String(page), 10),
        pageSize: parseInt(String(pageSize), 10)
      });
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: "Failed to search fire pumps" });
    }
  });

  app.get("/api/fire-pumps/:id", isAuthenticated, async (req, res) => {
    const row = await storage.getFirePumpById(req.params.id);
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  });

  app.post("/api/fire-pumps", isAuthenticated, async (req: any, res) => {
    try {
      const validated = insertFirePumpSchema.parse(req.body);
      const row = await storage.createFirePump(req.user.claims.sub, validated);
      res.status(201).json(row);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors });
      res.status(500).json({ error: "Failed to create fire pump" });
    }
  });

  app.put("/api/fire-pumps/:id", isAuthenticated, async (req: any, res) => {
    try {
      const validated = updateFirePumpSchema.parse(req.body);
      const row = await storage.updateFirePump(req.user.claims.sub, req.params.id, validated);
      res.json(row);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ error: "Validation failed", details: err.errors });
      res.status(500).json({ error: "Failed to update fire pump" });
    }
  });

  app.delete("/api/fire-pumps/:id", isAuthenticated, async (req, res) => {
    await storage.deleteFirePump(req.params.id);
    res.status(204).send();
  });

  // Legacy alias routes for backward compatibility with /api/reports/*
  
  // GET /api/reports/history (alias for GET /api/archived-reports) 
  app.get("/api/reports/history", isAuthenticated, async (req: any, res) => {
    console.log("Legacy history endpoint called - delegating to /api/archived-reports logic");
    
    try {
      const userId = req.user.claims.sub;
      const reports = await storage.getArchivedReportsByUser(userId);
      
      // Aplicar mesma normalização read-time
      const normalizedReports = reports.map(report => {
        const normalized = { ...report };
        
        if (report.propertyAddressLogradouro && !report.propertyAddress) {
          normalized.propertyAddress = structuredToLegacyPropertyAddress({
            propertyAddressLogradouro: nullToUndefined(report.propertyAddressLogradouro),
            propertyAddressNumero: nullToUndefined(report.propertyAddressNumero),
            propertyAddressBairro: nullToUndefined(report.propertyAddressBairro),
            propertyAddressMunicipio: nullToUndefined(report.propertyAddressMunicipio),
            propertyAddressEstado: nullToUndefined(report.propertyAddressEstado),
            propertyAddressCep: nullToUndefined(report.propertyAddressCep),
            propertyAddressComplemento: nullToUndefined(report.propertyAddressComplemento)
          });
        }
        
        if (report.propertyAddress && !report.propertyAddressLogradouro) {
          const parsedAddress = parseLegacyPropertyAddress(report.propertyAddress);
          Object.assign(normalized, parsedAddress);
        }
        
        return normalized;
      });
      
      res.json(normalizedReports);
    } catch (error) {
      console.error("Database error fetching reports history:", error);
      res.status(503).json({ message: "Database temporarily unavailable. Please try again later." });
    }
  });

  // POST /api/reports/archive (alias for POST /api/archived-reports)
  app.post("/api/reports/archive", isAuthenticated, async (req: any, res) => {
    console.log("Legacy archive endpoint called - delegating to /api/archived-reports logic");
    
    const userId = req.user.claims.sub;
    // Add userId to the request body
    req.body.userId = userId;
    
    // Usar a mesma lógica do endpoint principal
    // Composição bidirecional para propriedade legacy ↔ structured
    let processedData = { ...req.body };
    
    // Legacy → Structured: propertyAddress legado para campos estruturados
    if (req.body.propertyAddress && !req.body.propertyAddressLogradouro) {
      console.log("Parsing legacy property address:", req.body.propertyAddress);
      const parsedAddress = parseLegacyPropertyAddress(req.body.propertyAddress);
      processedData = {
        ...processedData,
        ...parsedAddress
      };
      console.log("Parsed property address fields:", parsedAddress);
    }
    
    // Structured → Legacy: campos estruturados para propertyAddress legado
    else if (req.body.propertyAddressLogradouro && !req.body.propertyAddress) {
      console.log("Composing legacy property address from structured fields");
      const composedAddress = structuredToLegacyPropertyAddress({
        propertyAddressLogradouro: nullToUndefined(req.body.propertyAddressLogradouro),
        propertyAddressNumero: nullToUndefined(req.body.propertyAddressNumero),
        propertyAddressBairro: nullToUndefined(req.body.propertyAddressBairro),
        propertyAddressMunicipio: nullToUndefined(req.body.propertyAddressMunicipio),
        propertyAddressEstado: nullToUndefined(req.body.propertyAddressEstado),
        propertyAddressCep: nullToUndefined(req.body.propertyAddressCep),
        propertyAddressComplemento: nullToUndefined(req.body.propertyAddressComplemento)
      });
      processedData = {
        ...processedData,
        propertyAddress: composedAddress
      };
      console.log("Composed legacy property address:", composedAddress);
    }
    
    // Normalize and validate date fields - prevent HTTP 500 from invalid dates
    const rawDate = processedData.inspectionDate ?? processedData.date;
    if (rawDate) {
      const dateObj = new Date(rawDate);
      if (isNaN(dateObj.getTime())) {
        console.error("Invalid date provided:", rawDate);
        return res.status(400).json({ 
          message: "Data de inspeção inválida. Use formato AAAA-MM-DD.", 
          invalidDate: rawDate 
        });
      }
      // Normalize to ISO string
      processedData.inspectionDate = dateObj.toISOString();
      console.log("Normalized date:", rawDate, "->", processedData.inspectionDate);
    }
    
    try {
      const validatedData = insertArchivedReportSchema.parse(processedData);
      const report = await storage.createArchivedReport(validatedData);
      res.status(201).json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid report data", errors: error.errors });
      }
      console.error("Database error creating archived report:", error);
      res.status(503).json({ message: "Database temporarily unavailable. Please try again later." });
    }
  });

  // GET /api/reports/:id/download (alias for GET /api/archived-reports/:id/pdf)
  app.get("/api/reports/:id/download", async (req, res) => {
    console.log("Legacy download endpoint called - delegating to /api/archived-reports/:id/pdf logic");
    
    try {
      const report = await storage.getArchivedReport(req.params.id);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      
      if (!report.pdfData) {
        return res.status(404).json({ message: "PDF not available for this report" });
      }

      // Convert base64 to buffer
      const pdfBuffer = Buffer.from(report.pdfData, 'base64');
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${report.formTitle.replace(/\s+/g, '_')}_${report.propertyName.replace(/\s+/g, '_')}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Database error downloading PDF:", error);
      res.status(503).json({ message: "Database temporarily unavailable. Please try again later." });
    }
  });

  // Archive report route with idempotent flow
  app.post("/api/reports/:id/archive", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reportId = req.params.id;

      // Buscar o relatório por id. Se não existir → 404 { code: 'REPORT_NOT_FOUND' }
      const report = await storage.getArchivedReport(reportId);
      if (!report) {
        return res.status(404).json({ code: 'REPORT_NOT_FOUND', message: 'Relatório não encontrado' });
      }

      // Se status === 'ARQUIVADO', retornar 200 { ok: true, already: true }
      if (report.status === 'ARQUIVADO') {
        return res.status(200).json({ ok: true, already: true });
      }

      // Normalizar general_information (sem lançar erro por campo faltando)
      const giIn = (req.body?.general_information ?? {});
      const gi = {
        empresa: giIn.empresa ?? "-",
        nome_propriedade: giIn.nome_propriedade ?? "-",
        id_propriedade: giIn.id_propriedade ?? "-",
        endereco: giIn.endereco ?? "-",
        tipo_edificacao: giIn.tipo_edificacao ?? "-",
        area_total_piso_ft2: Number.isFinite(+giIn.area_total_piso_ft2) ? +giIn.area_total_piso_ft2 : null,
        data_inspecao: giIn.data_inspecao ?? null,
        tipo_inspecao: giIn.tipo_inspecao ?? "-",
        proxima_inspecao_programada: giIn.proxima_inspecao_programada ?? null,
        nome_inspetor: giIn.nome_inspetor ?? "-",
        licenca_inspetor: giIn.licenca_inspetor ?? "-",
        observacoes_adicionais: giIn.observacoes_adicionais ?? "",
        temperatura_f: Number.isFinite(+giIn.temperatura_f) ? +giIn.temperatura_f : null,
        condicoes_climaticas: giIn.condicoes_climaticas ?? "-",
        velocidade_vento_mph: Number.isFinite(+giIn.velocidade_vento_mph) ? +giIn.velocidade_vento_mph : null,
      };

      // Transação do arquivamento
      // Montar pdfData = { report, general_information: gi } (sem undefined)
      const pdfData = { report, general_information: gi };

      // Gerar PDF
      let buffer;
      try {
        // Simular serviço de PDF - na implementação real, usar o PDF generator
        const pdfService = {
          generate: async (data: any) => {
            // Aqui seria chamado o generateInspectionPdfBase64 ou similar
            // Por agora, retornar um buffer simulado
            const { generateInspectionPdfBase64 } = await import("../client/src/lib/pdf-generator.js");
            
            // Criar dados compatíveis com o gerador de PDF
            const formData = typeof report.formData === 'string' ? JSON.parse(report.formData) : report.formData;
            const signatures = typeof report.signatures === 'string' ? JSON.parse(report.signatures) : report.signatures;
            
            const generalInfo = {
              propertyName: gi.nome_propriedade,
              propertyAddress: gi.endereco,
              inspector: gi.nome_inspetor,
              date: gi.data_inspecao || new Date().toISOString().split('T')[0]
            };

            const pdfBase64 = generateInspectionPdfBase64(
              report.formTitle,
              formData,
              generalInfo,
              signatures,
              gi.empresa,
              undefined, // pdfCompany
              { showCompanyLogo: true, showFireSafeLogo: true },
              gi
            );
            
            return Buffer.from(pdfBase64, 'base64');
          }
        };
        
        buffer = await pdfService.generate(pdfData);
      } catch (e: any) {
        console.error('PDF_GENERATION_FAILED', { reportId, error: e.message, stack: e.stack });
        return res.status(500).json({ 
          code: 'PDF_GENERATION_FAILED', 
          message: e.message || 'Falha na geração do PDF' 
        });
      }

      // Salvar PDF no filesystem
      try {
        const fs = await import('fs/promises');
        const path = await import('path');
        
        const fileKey = `storage/reports/${reportId}.pdf`;
        await fs.mkdir(path.dirname(fileKey), { recursive: true });
        await fs.writeFile(fileKey, buffer);
        
        // Atualizar relatório: status='ARQUIVADO', archived_at = new Date().toISOString(), pdf_url = fileKey, general_information = gi
        const updatedReport = await storage.updateArchivedReport(reportId, {
          status: 'ARQUIVADO',
          archivedAt: new Date().toISOString(),
          pdfData: buffer.toString('base64'), // Salvar como base64 no banco também
          generalInformation: gi
        });

        if (!updatedReport) {
          throw new Error('Falha ao atualizar o relatório no banco de dados');
        }

        res.status(200).json({ ok: true, reportId, pdf_url: fileKey });
        
      } catch (storageError: any) {
        console.error('STORAGE_WRITE_FAILED', { reportId, error: storageError.message, stack: storageError.stack });
        return res.status(500).json({ 
          code: 'STORAGE_WRITE_FAILED', 
          message: storageError.message || 'Falha ao salvar PDF' 
        });
      }

    } catch (err: any) {
      console.error('ARCHIVE_ERROR', { 
        id: req.params.id, 
        code: err.code, 
        message: err.message, 
        stack: err.stack 
      });
      return res.status(500).json({ 
        error: 'ARCHIVE_ERROR', 
        code: err.code ?? null, 
        message: err.message ?? 'Falha ao arquivar' 
      });
    }
  });

  // App Settings Routes
  app.get("/api/settings", isAuthenticated, async (req: any, res) => {
    try {
      const settings = await storage.getAppSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put("/api/settings", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedPatch = updateAppSettingsSchema.parse(req.body);
      const updatedSettings = await storage.upsertAppSettings(userId, validatedPatch);
      res.json(updatedSettings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid settings data", errors: error.errors });
      }
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
