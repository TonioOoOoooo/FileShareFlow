import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Using proper nullable fields
export const uploadHistory = pgTable("upload_history", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size").notNull(),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  webhookUrl: text("webhook_url"),
  markdownResult: text("markdown_result"),
});

export const webhookConfigs = pgTable("webhook_configs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  webhookUrl: text("webhook_url").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Explicitly define nullable fields in the schema
export const insertUploadHistorySchema = createInsertSchema(uploadHistory)
  .omit({
    id: true,
    uploadedAt: true,
  })
  .extend({
    webhookUrl: z.string().nullish(),
    markdownResult: z.string().nullish(),
  });

export const insertWebhookConfigSchema = createInsertSchema(webhookConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertUploadHistory = z.infer<typeof insertUploadHistorySchema>;
export type UploadHistory = typeof uploadHistory.$inferSelect;

export type InsertWebhookConfig = z.infer<typeof insertWebhookConfigSchema>;
export type WebhookConfig = typeof webhookConfigs.$inferSelect;
