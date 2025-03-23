import { useUpload } from '@/context/UploadContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function WebhookConfig() {
  const { webhookUrl, setWebhookUrl, saveWebhookUrl } = useUpload();

  return (
    <div className="border-t border-gray-100 pt-4 mt-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Make.com Webhook Configuration</h3>
      <div className="flex">
        <Input
          type="text"
          className="rounded-r-none"
          placeholder="Enter Make.com webhook URL"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
        />
        <Button 
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-l-none border border-gray-300 border-l-0"
          onClick={saveWebhookUrl}
        >
          Save
        </Button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        The webhook will be called after successful file uploads to OneDrive.
      </p>
    </div>
  );
}
