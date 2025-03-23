import { useUpload } from '@/context/UploadContext';
import { formatFileSize, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function UploadHistory() {
  const { uploadHistory, clearUploadHistory, viewMarkdownResult } = useUpload();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Recent Uploads</h2>
        <Button 
          variant="ghost" 
          className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
          onClick={clearUploadHistory}
        >
          <i className="ri-refresh-line mr-1"></i>
          Clear
        </Button>
      </div>
      
      {/* Empty state */}
      {uploadHistory.length === 0 && (
        <div className="text-center py-8 border border-dashed border-gray-300 rounded-md">
          <i className="ri-history-line text-2xl text-gray-300 mb-2"></i>
          <p className="text-sm text-gray-500">No upload history yet</p>
        </div>
      )}
      
      {/* History items */}
      {uploadHistory.length > 0 && (
        <div className="divide-y divide-gray-100">
          {uploadHistory.map((item) => (
            <div className="py-3" key={item.id}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">{item.fileName}</h4>
                  <p className="text-xs text-gray-500">
                    Uploaded on {formatDate(item.uploadedAt)} • {formatFileSize(item.fileSize)}
                  </p>
                </div>
                {item.markdownResult && (
                  <Button 
                    variant="link"
                    className="text-xs text-blue-600 hover:text-blue-700"
                    onClick={() => viewMarkdownResult(item.id)}
                  >
                    View Result
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
