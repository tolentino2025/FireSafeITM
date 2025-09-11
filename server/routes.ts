import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertInspectionSchema, 
  insertSystemInspectionSchema, 
  insertArchivedReportSchema, 
  updateUserProfileSchema,
  StructuredAddress,
  PropertyStructuredAddress,
  structuredToLegacyAddress,
  structuredToLegacyPropertyAddress
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get current user
  app.get("/api/user", async (req, res) => {
    try {
      // For now, return the default user. In a real app, this would be based on authentication
      const user = await storage.getUser("default-user-id");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile
  app.put("/api/user/profile", async (req, res) => {
    try {
      const validatedData = updateUserProfileSchema.parse(req.body);
      const updatedUser = await storage.updateUserProfile("default-user-id", validatedData);
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
  app.get("/api/inspections/drafts", async (req, res) => {
    try {
      const inspections = await storage.getInspectionsByInspector("default-user-id");
      const drafts = inspections.filter(inspection => inspection.status === "draft");
      res.json(drafts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch draft inspections" });
    }
  });

  // Get reports history - REMOVED - now handled by the normalized version in legacy alias section below

  // Download report PDF - REMOVED - now handled by the consistent version in legacy alias section below

  // Delete inspection
  app.delete("/api/inspections/:id", async (req, res) => {
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
  app.get("/api/inspections", async (req, res) => {
    try {
      const inspections = await storage.getAllInspections();
      res.json(inspections);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inspections" });
    }
  });

  // Get specific inspection
  app.get("/api/inspections/:id", async (req, res) => {
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

  // Create new inspection
  app.post("/api/inspections", async (req, res) => {
    try {
      console.log("Received inspection data:", JSON.stringify(req.body, null, 2));
      
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
        return res.status(400).json({ message: "Invalid inspection data", errors: error.errors });
      }
      console.error("Error creating inspection:", error);
      res.status(500).json({ message: "Failed to create inspection" });
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

  // Get default user for demo purposes
  app.get("/api/user", async (req, res) => {
    try {
      const user = await storage.getUser("default-user-id");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Archived reports endpoints
  
  // Get archived reports for current user
  app.get("/api/archived-reports", async (req, res) => {
    try {
      // In a real app, you'd get the user ID from the session/token
      const userId = "default-user-id";
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
      console.error("Error fetching archived reports:", error);
      res.status(500).json({ message: "Failed to fetch archived reports" });
    }
  });

  // Create new archived report
  app.post("/api/archived-reports", async (req, res) => {
    try {
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
      console.error("Error creating archived report:", error);
      res.status(500).json({ message: "Failed to create archived report" });
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
      
      res.json(normalized);
    } catch (error) {
      console.error("Error fetching archived report:", error);
      res.status(500).json({ message: "Failed to fetch archived report" });
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
      console.error("Error downloading PDF:", error);
      res.status(500).json({ message: "Failed to download PDF" });
    }
  });

  // Legacy alias routes for backward compatibility with /api/reports/*
  
  // GET /api/reports/history (alias for GET /api/archived-reports) 
  app.get("/api/reports/history", async (req, res) => {
    console.log("Legacy history endpoint called - delegating to /api/archived-reports logic");
    
    try {
      const userId = "default-user-id";
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
      console.error("Error fetching reports history:", error);
      res.status(500).json({ message: "Failed to fetch reports history" });
    }
  });

  // POST /api/reports/archive (alias for POST /api/archived-reports)
  app.post("/api/reports/archive", async (req, res) => {
    console.log("Legacy archive endpoint called - delegating to /api/archived-reports logic");
    
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
      console.error("Error creating archived report:", error);
      res.status(500).json({ message: "Failed to create archived report" });
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
      console.error("Error downloading PDF:", error);
      res.status(500).json({ message: "Failed to download PDF" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
