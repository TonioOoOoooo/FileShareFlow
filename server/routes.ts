import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";
import { insertUploadHistorySchema, insertWebhookConfigSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Webhook configuration routes
  app.post("/api/webhook/config", async (req: Request, res: Response) => {
    try {
      // Get userId from session (would come from MS authentication)
      const userId = req.headers["x-user-id"] as string;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Validate request body
      const result = insertWebhookConfigSchema.safeParse({
        userId,
        webhookUrl: req.body.webhookUrl
      });
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid webhook URL" });
      }
      
      // Save webhook config
      const config = await storage.saveWebhookConfig(result.data);
      
      res.status(200).json(config);
    } catch (error) {
      console.error("Error saving webhook config:", error);
      res.status(500).json({ message: "Failed to save webhook configuration" });
    }
  });
  
  app.get("/api/webhook/config", async (req: Request, res: Response) => {
    try {
      // Get userId from session
      const userId = req.headers["x-user-id"] as string;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Get webhook config
      const config = await storage.getWebhookConfig(userId);
      
      res.status(200).json(config || { webhookUrl: "" });
    } catch (error) {
      console.error("Error getting webhook config:", error);
      res.status(500).json({ message: "Failed to get webhook configuration" });
    }
  });
  
  // Webhook trigger route
  app.post("/api/webhook/trigger", async (req: Request, res: Response) => {
    try {
      // Get userId from session
      const userId = req.headers["x-user-id"] as string;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const schema = z.object({
        fileName: z.string(),
        fileUrl: z.string().url(),
        fileSize: z.number(),
        webhookUrl: z.string().url()
      });
      
      // Validate request body
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid request data" });
      }
      
      const { fileName, fileUrl, fileSize, webhookUrl } = result.data;
      
      // Prepare webhook payload
      const webhookPayload = {
        fileName,
        fileUrl,
        fileSize,
        timestamp: new Date().toISOString(),
        userId
      };
      
      // Send webhook request to Make.com
      const webhookResponse = await axios.post(webhookUrl, webhookPayload);
      
      // Get markdown result from webhook response
      const markdownResult = webhookResponse.data.markdownResult || "";
      
      // Save upload history with markdown result
      const uploadHistory = await storage.saveUploadHistory({
        userId,
        fileName,
        fileUrl,
        fileSize,
        webhookUrl,
        markdownResult
      });
      
      // Return response to client
      res.status(200).json({
        success: true,
        markdownResult,
        uploadHistoryId: uploadHistory.id
      });
    } catch (error) {
      console.error("Error triggering webhook:", error);
      res.status(500).json({ message: "Failed to trigger webhook" });
    }
  });
  
  // Upload history routes
  app.get("/api/uploads/history", async (req: Request, res: Response) => {
    try {
      // Get userId from session
      const userId = req.headers["x-user-id"] as string;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Get upload history
      const history = await storage.getUploadHistoryByUser(userId);
      
      res.status(200).json(history);
    } catch (error) {
      console.error("Error getting upload history:", error);
      res.status(500).json({ message: "Failed to get upload history" });
    }
  });
  
  app.delete("/api/uploads/history", async (req: Request, res: Response) => {
    try {
      // Get userId from session
      const userId = req.headers["x-user-id"] as string;
      
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Clear upload history
      await storage.clearUploadHistory(userId);
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error clearing upload history:", error);
      res.status(500).json({ message: "Failed to clear upload history" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
