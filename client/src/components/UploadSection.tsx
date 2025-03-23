import { useAuth } from "@/context/AuthContext";
import FileUploader from "./FileUploader";
import FilesList from "./FilesList";
import WebhookConfig from "./WebhookConfig";

export default function UploadSection() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Upload Files to OneDrive</h2>
      
      {/* Microsoft auth required notice */}
      {!isAuthenticated && (
        <div className="bg-gray-50 border border-gray-100 rounded-md p-4 mb-6">
          <div className="flex items-start">
            <i className="ri-information-line text-blue-600 mt-0.5 mr-3"></i>
            <div>
              <p className="text-sm text-gray-700">Please sign in with your Microsoft account to upload files to OneDrive.</p>
            </div>
          </div>
        </div>
      )}
      
      {/* File uploader and list */}
      {isAuthenticated && (
        <div className="mb-6">
          <FileUploader />
          <FilesList />
        </div>
      )}
      
      {/* Webhook configuration */}
      {isAuthenticated && <WebhookConfig />}
    </div>
  );
}
