import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertInspectionSchema, insertSystemInspectionSchema, insertArchivedReportSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Create new inspection
  app.post("/api/inspections", async (req, res) => {
    try {
      const validatedData = insertInspectionSchema.parse(req.body);
      const inspection = await storage.createInspection(validatedData);
      res.status(201).json(inspection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid inspection data", errors: error.errors });
      }
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
      const validatedData = insertArchivedReportSchema.parse(req.body);
      const report = await storage.createArchivedReport(validatedData);
      res.status(201).json(report);
    } catch (error) {
      if (error instanceof z.ZodError) {
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
