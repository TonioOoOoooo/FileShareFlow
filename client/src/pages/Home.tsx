import Header from "@/components/Header";
import UploadSection from "@/components/UploadSection";
import UploadHistory from "@/components/UploadHistory";
import MarkdownResult from "@/components/MarkdownResult";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useUpload } from "@/context/UploadContext";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { loadUploadHistory } = useUpload();
  
  // Load upload history when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadUploadHistory();
    }
  }, [isAuthenticated]);

  return (
    <>
      <Header />
      <main className="flex-grow py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left column - Upload and file handling */}
            <div className="w-full lg:w-1/2">
              <UploadSection />
              <UploadHistory />
            </div>
            
            {/* Right column - Markdown result preview */}
            <div className="w-full lg:w-1/2">
              <MarkdownResult />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
