import { ReactNode, createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "./AuthContext";
import { uploadFileToOneDrive } from "@/lib/graph";

export interface FileItem {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  url?: string;
  error?: string;
}

export interface UploadHistoryItem {
  id: number;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
  markdownResult?: string;
}

interface UploadContextType {
  files: FileItem[];
  uploadHistory: UploadHistoryItem[];
  webhookUrl: string;
  markdownContent: string | null;
  currentMarkdownSource: string | null;
  isMarkdownLoading: boolean;
  markdownError: string | null;
  addFiles: (newFiles: File[]) => void;
  removeFile: (id: string) => void;
  uploadFiles: () => Promise<void>;
  setWebhookUrl: (url: string) => void;
  saveWebhookUrl: () => Promise<void>;
  loadUploadHistory: () => Promise<void>;
  clearUploadHistory: () => Promise<void>;
  viewMarkdownResult: (historyItemId: number) => Promise<void>;
  clearMarkdownContent: () => void;
  copyMarkdownToClipboard: () => Promise<boolean>;
  downloadMarkdownAsFile: () => void;
}

const UploadContext = createContext<UploadContextType | undefined>(undefined);

export function UploadProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploadHistory, setUploadHistory] = useState<UploadHistoryItem[]>([]);
  const [webhookUrl, setWebhookUrl] = useState<string>("");
  const [markdownContent, setMarkdownContent] = useState<string | null>(null);
  const [currentMarkdownSource, setCurrentMarkdownSource] = useState<string | null>(null);
  const [isMarkdownLoading, setIsMarkdownLoading] = useState<boolean>(false);
  const [markdownError, setMarkdownError] = useState<string | null>(null);
  
  const { toast } = useToast();
  // We'll move the auth context usage into effects and methods instead of at the top level
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [getTokenFn, setGetTokenFn] = useState<(() => Promise<string | null>) | null>(null);

  const addFiles = (newFiles: File[]) => {
    const newFileItems: FileItem[] = newFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      progress: 0,
      status: "pending"
    }));
    
    setFiles(prev => [...prev, ...newFileItems]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const uploadFiles = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in with your Microsoft account to upload files.",
        variant: "destructive"
      });
      return;
    }

    if (files.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select files to upload.",
        variant: "destructive"
      });
      return;
    }

    // Get files that are pending upload
    const pendingFiles = files.filter(file => file.status === "pending");
    
    if (pendingFiles.length === 0) {
      toast({
        title: "No New Files",
        description: "All files have already been uploaded.",
        variant: "destructive"
      });
      return;
    }

    for (const fileItem of pendingFiles) {
      // Update file status to uploading
      setFiles(prev => 
        prev.map(f => f.id === fileItem.id ? { ...f, status: "uploading" } : f)
      );

      try {
        // Upload file to OneDrive
        const accessToken = getTokenFn ? await getTokenFn() : null;
        if (!accessToken) {
          throw new Error("Failed to get access token");
        }

        // Upload the file with progress tracking
        const onProgress = (progress: number) => {
          setFiles(prev => 
            prev.map(f => f.id === fileItem.id ? { ...f, progress } : f)
          );
        };

        const fileUrl = await uploadFileToOneDrive(fileItem.file, accessToken, onProgress);
        
        // Update file status to success
        setFiles(prev => 
          prev.map(f => f.id === fileItem.id ? { ...f, status: "success", url: fileUrl } : f)
        );

        // Trigger webhook if configured
        if (webhookUrl) {
          try {
            // Call our server endpoint that will trigger the webhook
            const response = await apiRequest("POST", "/api/webhook/trigger", {
              fileName: fileItem.file.name,
              fileUrl,
              fileSize: fileItem.file.size,
              webhookUrl
            });

            const result = await response.json();
            
            // Display markdown result
            if (result.markdownResult) {
              setMarkdownContent(result.markdownResult);
              setCurrentMarkdownSource(`File: ${fileItem.file.name}`);
              setMarkdownError(null);
            }

            // Add to upload history
            await loadUploadHistory();
            
            toast({
              title: "Upload Successful",
              description: `${fileItem.file.name} uploaded and webhook triggered.`
            });
          } catch (error) {
            console.error("Webhook error:", error);
            toast({
              title: "Webhook Error",
              description: "File uploaded but webhook processing failed.",
              variant: "destructive"
            });
          }
        } else {
          // No webhook configured, just show success toast
          toast({
            title: "Upload Successful",
            description: `${fileItem.file.name} uploaded to OneDrive.`
          });
          
          // Add to upload history
          await loadUploadHistory();
        }
      } catch (error) {
        console.error("Upload error:", error);
        
        // Update file status to error
        setFiles(prev => 
          prev.map(f => f.id === fileItem.id ? { 
            ...f, 
            status: "error", 
            error: error instanceof Error ? error.message : "Unknown error" 
          } : f)
        );
        
        toast({
          title: "Upload Failed",
          description: `Failed to upload ${fileItem.file.name}.`,
          variant: "destructive"
        });
      }
    }
  };

  const saveWebhookUrl = async () => {
    if (!webhookUrl) {
      toast({
        title: "Missing Webhook URL",
        description: "Please enter a webhook URL.",
        variant: "destructive"
      });
      return;
    }

    try {
      await apiRequest("POST", "/api/webhook/config", { webhookUrl });
      toast({
        title: "Webhook Saved",
        description: "Your webhook URL has been saved successfully."
      });
    } catch (error) {
      console.error("Error saving webhook URL:", error);
      toast({
        title: "Error",
        description: "Failed to save webhook URL.",
        variant: "destructive"
      });
    }
  };

  const loadUploadHistory = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch("/api/uploads/history", {
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      setUploadHistory(data);
    } catch (error) {
      console.error("Error loading upload history:", error);
    }
  };

  const clearUploadHistory = async () => {
    try {
      await apiRequest("DELETE", "/api/uploads/history");
      setUploadHistory([]);
      toast({
        title: "History Cleared",
        description: "Your upload history has been cleared."
      });
    } catch (error) {
      console.error("Error clearing history:", error);
      toast({
        title: "Error",
        description: "Failed to clear upload history.",
        variant: "destructive"
      });
    }
  };

  const viewMarkdownResult = async (historyItemId: number) => {
    const item = uploadHistory.find(item => item.id === historyItemId);
    
    if (!item || !item.markdownResult) {
      toast({
        title: "No Markdown Available",
        description: "This upload doesn't have a markdown result.",
        variant: "destructive"
      });
      return;
    }

    setMarkdownContent(item.markdownResult);
    setCurrentMarkdownSource(`File: ${item.fileName}`);
  };

  const clearMarkdownContent = () => {
    setMarkdownContent(null);
    setCurrentMarkdownSource(null);
    setMarkdownError(null);
  };

  const copyMarkdownToClipboard = async (): Promise<boolean> => {
    if (!markdownContent) return false;
    
    try {
      await navigator.clipboard.writeText(markdownContent);
      toast({
        title: "Copied",
        description: "Markdown content copied to clipboard"
      });
      return true;
    } catch (error) {
      console.error("Failed to copy:", error);
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
      return false;
    }
  };

  const downloadMarkdownAsFile = () => {
    if (!markdownContent || !currentMarkdownSource) return;
    
    const fileName = currentMarkdownSource.replace("File: ", "").replace(/\.[^/.]+$/, "") + ".md";
    const blob = new Blob([markdownContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Connect to AuthContext safely
  useEffect(() => {
    try {
      const { isAuthenticated: authState, getToken } = useAuth();
      setIsAuthenticated(authState);
      setGetTokenFn(() => getToken);
    } catch (error) {
      console.error("Auth context not available yet:", error);
    }
  }, []);
  
  // Load webhook configuration when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Load webhook config
      fetch("/api/webhook/config", {
        credentials: "include"
      })
        .then(res => {
          if (res.ok) return res.json();
          return { webhookUrl: "" };
        })
        .then(data => {
          if (data.webhookUrl) {
            setWebhookUrl(data.webhookUrl);
          }
        })
        .catch(err => {
          console.error("Error loading webhook config:", err);
        });
      
      // Load upload history
      loadUploadHistory();
    }
  }, [isAuthenticated]);

  return (
    <UploadContext.Provider
      value={{
        files,
        uploadHistory,
        webhookUrl,
        markdownContent,
        currentMarkdownSource,
        isMarkdownLoading,
        markdownError,
        addFiles,
        removeFile,
        uploadFiles,
        setWebhookUrl,
        saveWebhookUrl,
        loadUploadHistory,
        clearUploadHistory,
        viewMarkdownResult,
        clearMarkdownContent,
        copyMarkdownToClipboard,
        downloadMarkdownAsFile
      }}
    >
      {children}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  const context = useContext(UploadContext);
  if (context === undefined) {
    throw new Error("useUpload must be used within an UploadProvider");
  }
  return context;
}
