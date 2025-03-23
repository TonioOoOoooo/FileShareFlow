import { useUpload } from '@/context/UploadContext';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function MarkdownResult() {
  const { 
    markdownContent, 
    currentMarkdownSource, 
    isMarkdownLoading,
    markdownError,
    copyMarkdownToClipboard, 
    downloadMarkdownAsFile 
  } = useUpload();

  return (
    <div className="bg-white rounded-lg shadow h-full">
      <div className="border-b border-gray-100 p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Markdown Result</h2>
        <div className="flex space-x-2">
          <Button 
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-700"
            onClick={copyMarkdownToClipboard}
            title="Copy to clipboard"
            disabled={!markdownContent}
          >
            <i className="ri-clipboard-line"></i>
          </Button>
          <Button 
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-700"
            onClick={downloadMarkdownAsFile}
            title="Download as file"
            disabled={!markdownContent}
          >
            <i className="ri-download-line"></i>
          </Button>
        </div>
      </div>
      
      {/* Empty state */}
      {!markdownContent && !isMarkdownLoading && !markdownError && (
        <div className="p-8 text-center">
          <i className="ri-file-text-line text-4xl text-gray-300 mb-3"></i>
          <h3 className="text-gray-700 font-medium mb-2">No markdown content to display</h3>
          <p className="text-sm text-gray-500 mb-4">Upload a file to see the processed markdown result here</p>
        </div>
      )}
      
      {/* Loading state */}
      {isMarkdownLoading && (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600 mb-3"></div>
          <h3 className="text-gray-700 font-medium mb-2">Processing your file...</h3>
          <p className="text-sm text-gray-500">This may take a moment depending on the file size</p>
        </div>
      )}
      
      {/* Error state */}
      {markdownError && (
        <div className="p-8 text-center">
          <i className="ri-error-warning-line text-4xl text-red-600 mb-3"></i>
          <h3 className="text-gray-700 font-medium mb-2">Error processing file</h3>
          <p className="text-sm text-gray-500 mb-4">{markdownError}</p>
          <Button 
            variant="outline"
            className="inline-flex items-center"
            onClick={() => window.location.reload()}
          >
            <i className="ri-restart-line mr-2"></i>
            <span>Try Again</span>
          </Button>
        </div>
      )}
      
      {/* Result state */}
      {markdownContent && !isMarkdownLoading && !markdownError && (
        <div>
          <div className="bg-gray-50 p-4 flex items-center border-b border-gray-100">
            <i className="ri-file-text-line text-blue-600 mr-2"></i>
            <span className="text-sm font-medium">{currentMarkdownSource}</span>
          </div>
          
          {/* Markdown preview */}
          <div className="p-6 markdown-preview overflow-auto max-h-[600px]">
            <ReactMarkdown
              components={{
                code({node, inline, className, children, ...props}) {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={tomorrow}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  )
                }
              }}
            >
              {markdownContent}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
