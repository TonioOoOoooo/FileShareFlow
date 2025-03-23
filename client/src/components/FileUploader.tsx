import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { useUpload } from '@/context/UploadContext';
import { Button } from '@/components/ui/button';

export default function FileUploader() {
  const { addFiles } = useUpload();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    addFiles(acceptedFiles);
  }, [addFiles]);

  const { 
    getRootProps, 
    getInputProps, 
    isDragActive 
  } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md']
    }
  });

  return (
    <div 
      {...getRootProps()} 
      className={cn(
        "border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors duration-200",
        isDragActive && "border-blue-600 bg-blue-50"
      )}
    >
      <input {...getInputProps()} />
      <i className="ri-upload-cloud-2-line text-4xl text-gray-300 mb-3"></i>
      <h3 className="text-gray-700 font-medium mb-2">Drag files here to upload</h3>
      <p className="text-sm text-gray-500 mb-4">or select files from your device</p>
      
      <Button 
        type="button"
        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700"
      >
        <i className="ri-file-add-line mr-2"></i>
        <span>Browse Files</span>
      </Button>
      <p className="text-xs text-gray-500 mt-3">
        Supported formats: PDF, Word, Excel, JPG, PNG, TXT, MD
      </p>
    </div>
  );
}
