export interface MsalUser {
  name: string;
  username: string;
  avatar?: string;
}

export interface WebhookPayload {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  timestamp: string;
  userId?: string;
}

export interface WebhookResponse {
  markdownResult: string;
}
