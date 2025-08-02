import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { X, Paperclip, Image, FileText, File, Download } from 'lucide-react';
import { uploadChatFile, getFileType } from '@/utils/uploadChatFile';
import { toast } from 'sonner';

interface AttachmentUploadProps {
  userId: string;
  partnerId: string;
  onAttachmentUpload: (url: string, filename: string, fileType: string, fileSize: number) => void;
  disabled?: boolean;
}

export const AttachmentUpload: React.FC<AttachmentUploadProps> = ({
  userId,
  partnerId,
  onAttachmentUpload,
  disabled = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`File "${file.name}" is too large. Maximum size is 10MB.`);
        return false;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`File type "${file.type}" is not allowed.`);
        return false;
      }
      return true;
    });

    setSelectedFiles(validFiles);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const url = await uploadChatFile(userId, partnerId, file);
        
        if (url) {
          const fileType = getFileType(file.name);
          onAttachmentUpload(url, file.name, fileType, file.size);
          toast.success(`File "${file.name}" uploaded successfully`);
        } else {
          toast.error(`Failed to upload "${file.name}"`);
        }

        setUploadProgress(((i + 1) / selectedFiles.length) * 100);
      }

      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    const type = getFileType(file.name);
    switch (type) {
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className="flex items-center gap-2"
        >
          <Paperclip className="h-4 w-4" />
          Attach Files
        </Button>
        
        {selectedFiles.length > 0 && (
          <Button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            size="sm"
          >
            Upload {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}
          </Button>
        )}
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
        className="hidden"
      />

      {uploading && (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Uploading files...</div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {selectedFiles.length > 0 && !uploading && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Selected files:</div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {getFileIcon(file)}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium truncate">{file.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="flex-shrink-0 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface AttachmentDisplayProps {
  url: string;
  filename: string;
  fileType: string;
  fileSize: number;
  className?: string;
}

export const AttachmentDisplay: React.FC<AttachmentDisplayProps> = ({
  url,
  filename,
  fileType,
  fileSize,
  className = ""
}) => {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (fileType === 'image') {
    return (
      <div className={`max-w-xs rounded-lg overflow-hidden border ${className}`}>
        <img
          src={url}
          alt={filename}
          className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => window.open(url, '_blank')}
        />
        <div className="p-2 bg-muted/50">
          <div className="text-xs text-muted-foreground truncate">{filename}</div>
          <div className="text-xs text-muted-foreground">{formatFileSize(fileSize)}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 p-3 border rounded-lg max-w-xs ${className}`}>
      <div className="flex-shrink-0">
        {fileType === 'document' ? (
          <FileText className="h-8 w-8 text-primary" />
        ) : (
          <File className="h-8 w-8 text-primary" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium truncate">{filename}</div>
        <div className="text-xs text-muted-foreground">{formatFileSize(fileSize)}</div>
        <Badge variant="outline" className="text-xs mt-1">
          {fileType}
        </Badge>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDownload}
        className="flex-shrink-0 h-8 w-8 p-0"
      >
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );
};