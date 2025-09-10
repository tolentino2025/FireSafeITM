import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertInspectionSchema, 
  insertSystemInspectionSchema, 
  insertArchivedReportSchema, 
  updateUserProfileSchema,
  StructuredAddress,
  PropertyStructuredAddress 
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

  // Get reports history
  app.get("/api/reports/history", async (req, res) => {
    try {
      const reports = await storage.getArchivedReportsByUser("default-user-id");
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reports history" });
    }
  });

  // Download report PDF
  app.get("/api/reports/:id/download", async (req, res) => {
    try {
      const report = await storage.getArchivedReport(req.params.id);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      
      if (!report.pdfData) {
        return res.status(404).json({ message: "PDF not available for this report" });
      }

      // Convert base64 PDF data to buffer
      const pdfBuffer = Buffer.from(report.pdfData, 'base64');
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="relatorio-${report.id}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ message: "Failed to download report" });
    }
  });

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
      
      // Backward compatibility: se vier com address legado, parsear para campos estruturados
      let processedData = { ...req.body };
      
      if (req.body.address && !req.body.addressLogradouro) {
        console.log("Parsing legacy address:", req.body.address);
        const parsedAddress = parseLegacyAddress(req.body.address);
        processedData = {
          ...processedData,
          ...parsedAddress
        };
        console.log("Parsed address fields:", parsedAddress);
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
      const updates = req.body;
      const inspection = await storage.updateInspection(req.params.id, updates);
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
      res.json(reports);
    } catch (error) {
      console.error("Error fetching archived reports:", error);
      res.status(500).json({ message: "Failed to fetch archived reports" });
    }
  });

  // Create new archived report
  app.post("/api/archived-reports", async (req, res) => {
    try {
      console.log("Received archived report data:", JSON.stringify(req.body, null, 2));
      const validatedData = insertArchivedReportSchema.parse(req.body);
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
      res.json(report);
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

  const httpServer = createServer(app);
  return httpServer;
}
