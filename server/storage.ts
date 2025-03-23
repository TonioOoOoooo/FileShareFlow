import { users, type User, type InsertUser, type WebhookConfig, type InsertWebhookConfig, type UploadHistory, type InsertUploadHistory } from "@shared/schema";

// Interface with all the CRUD methods needed for the application
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Webhook config methods
  saveWebhookConfig(config: InsertWebhookConfig): Promise<WebhookConfig>;
  getWebhookConfig(userId: string): Promise<WebhookConfig | undefined>;
  
  // Upload history methods
  saveUploadHistory(history: InsertUploadHistory): Promise<UploadHistory>;
  getUploadHistoryByUser(userId: string): Promise<UploadHistory[]>;
  clearUploadHistory(userId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private webhookConfigs: Map<string, WebhookConfig>;
  private uploadHistory: UploadHistory[];
  private userIdCounter: number;
  private webhookConfigIdCounter: number;
  private uploadHistoryIdCounter: number;

  constructor() {
    this.users = new Map();
    this.webhookConfigs = new Map();
    this.uploadHistory = [];
    this.userIdCounter = 1;
    this.webhookConfigIdCounter = 1;
    this.uploadHistoryIdCounter = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Webhook config methods
  async saveWebhookConfig(config: InsertWebhookConfig): Promise<WebhookConfig> {
    const existing = this.webhookConfigs.get(config.userId);
    
    if (existing) {
      // Update existing config
      const updated: WebhookConfig = {
        ...existing,
        webhookUrl: config.webhookUrl,
        updatedAt: new Date()
      };
      this.webhookConfigs.set(config.userId, updated);
      return updated;
    } else {
      // Create new config
      const newConfig: WebhookConfig = {
        id: this.webhookConfigIdCounter++,
        userId: config.userId,
        webhookUrl: config.webhookUrl,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.webhookConfigs.set(config.userId, newConfig);
      return newConfig;
    }
  }
  
  async getWebhookConfig(userId: string): Promise<WebhookConfig | undefined> {
    return this.webhookConfigs.get(userId);
  }
  
  // Upload history methods
  async saveUploadHistory(history: InsertUploadHistory): Promise<UploadHistory> {
    const newHistory: UploadHistory = {
      id: this.uploadHistoryIdCounter++,
      userId: history.userId,
      fileName: history.fileName,
      fileUrl: history.fileUrl,
      fileSize: history.fileSize,
      webhookUrl: history.webhookUrl || null,
      markdownResult: history.markdownResult || null,
      uploadedAt: new Date()
    };
    
    this.uploadHistory.push(newHistory);
    return newHistory;
  }
  
  async getUploadHistoryByUser(userId: string): Promise<UploadHistory[]> {
    return this.uploadHistory.filter(item => item.userId === userId);
  }
  
  async clearUploadHistory(userId: string): Promise<void> {
    this.uploadHistory = this.uploadHistory.filter(item => item.userId !== userId);
  }
}

export const storage = new MemStorage();
