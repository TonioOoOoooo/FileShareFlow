import { useUpload, FileItem } from '@/context/UploadContext';
import { Button } from '@/components/ui/button';
import { formatFileSize } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

export default function FilesList() {
  const { files, removeFile, uploadFiles } = useUpload();

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 border-t border-gray-100 pt-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Selected Files</h3>
      
      <div className="space-y-3">
        {files.map((file) => (
          <FileListItem key={file.id} file={file} onRemove={removeFile} />
        ))}
      </div>
      
      {/* Upload button */}
      <div className="mt-4 flex justify-end">
        <Button 
          className="inline-flex items-center bg-blue-600 hover:bg-blue-700"
          onClick={uploadFiles}
        >
          <i className="ri-upload-cloud-2-line mr-2"></i>
          <span>Upload to OneDrive</span>
        </Button>
      </div>
    </div>
  );
}

interface FileListItemProps {
  file: FileItem;
  onRemove: (id: string) => void;
}

function FileListItem({ file, onRemove }: FileListItemProps) {
  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-md p-3">
      <div className="flex items-center overflow-hidden">
        <i className="ri-file-line text-blue-600 mr-2"></i>
        <span className="text-sm truncate">{file.file.name}</span>
        <span className="text-xs text-gray-500 ml-2">{formatFileSize(file.file.size)}</span>
      </div>
      <div className="flex items-center">
        {/* Progress indicator */}
        {file.status === 'uploading' && (
          <div className="flex items-center">
            <div className="w-20 mr-2">
              <Progress value={file.progress} className="h-1.5" />
            </div>
            <span className="text-xs text-gray-500">{Math.round(file.progress)}%</span>
          </div>
        )}
        
        {/* Success indicator */}
        {file.status === 'success' && (
          <i className="ri-check-line text-green-600"></i>
        )}
        
        {/* Error indicator */}
        {file.status === 'error' && (
          <i className="ri-error-warning-line text-red-600" title={file.error}></i>
        )}
        
        {/* Remove button - only show for pending or error files */}
        {(file.status === 'pending' || file.status === 'error') && (
          <button 
            className="ml-2 text-gray-400 hover:text-red-600" 
            onClick={() => onRemove(file.id)}
          >
            <i className="ri-close-line"></i>
          </button>
        )}
      </div>
    </div>
  );
}
