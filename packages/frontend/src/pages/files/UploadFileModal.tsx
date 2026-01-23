import { useState, useRef } from 'react';
import { Modal, Button, Card, CardContent, Badge } from '../../components/ui';
import { Upload, AlertCircle, CheckCircle, File, X } from 'lucide-react';
import { api } from '../../services/api';

interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  serverId: string;
  currentPath: string;
}

interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'extracting' | 'success' | 'error';
  error?: string;
  extractedFiles?: string[];
}

export const UploadFileModal = ({
  isOpen,
  onClose,
  onSuccess,
  serverId,
  currentPath,
}: UploadFileModalProps) => {
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [autoExtractZip, setAutoExtractZip] = useState(true);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFilesSelected(files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFilesSelected(files);
    // Reset input value to allow re-selecting the same file
    e.currentTarget.value = '';
  };

  const handleFilesSelected = (files: File[]) => {
    const newUploads: UploadedFile[] = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      file,
      progress: 0,
      status: 'pending',
    }));

    setUploads((prev) => [...prev, ...newUploads]);

    // Start uploading immediately
    newUploads.forEach((upload) => {
      uploadFile(upload.id, upload.file);
    });
  };

  const uploadFile = async (id: string, file: File) => {
    try {
      setUploads((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: 'uploading' as const } : u))
      );

      const filePath = currentPath ? `${currentPath}/${file.name}` : file.name;

      const result = await api.uploadFile(serverId, filePath, file, autoExtractZip, (progress) => {
        setUploads((prev) =>
          prev.map((u) => (u.id === id ? { ...u, progress } : u))
        );
      });

      setUploads((prev) => {
        const updated = prev.map((u) => {
          if (u.id === id) {
            const extractedFilesArray = result.extractedFiles ?? [];
            const newStatus: 'extracting' | 'success' = extractedFilesArray.length > 0 ? 'extracting' : 'success';
            return {
              ...u,
              status: newStatus,
              progress: 100,
              extractedFiles: extractedFilesArray,
            };
          }
          return u;
        });

        const allComplete = updated.every(
          (u) => u.status === 'success' || u.status === 'extracting' || u.status === 'error'
        );

        if (allComplete) {
          setTimeout(() => {
            onSuccess();
            setUploads([]);
            onClose();
          }, 1500);
        }

        return updated;
      });
    } catch (error) {
      setUploads((prev) =>
        prev.map((u) =>
          u.id === id
            ? {
                ...u,
                status: 'error' as const,
                error: (error as Error).message,
              }
            : u
        )
      );
    }
  };

  const removeUpload = (id: string) => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  };

  const clearCompleted = () => {
    setUploads((prev) => prev.filter((u) => u.status === 'pending' || u.status === 'uploading'));
  };

  const completedCount = uploads.filter((u) => u.status === 'success' || u.status === 'extracting').length;

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Files">
      <div className="space-y-6">
        {/* Drag and Drop Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-accent-primary bg-accent-primary/5'
              : 'border-gray-300 dark:border-gray-700'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload size={32} className="mx-auto mb-3 text-text-light-muted dark:text-text-muted" />
          <p className="text-text-light-primary dark:text-text-primary font-medium mb-1">
            Drag and drop files here
          </p>
          <p className="text-sm text-text-light-muted dark:text-text-muted mb-4">
            or click to select files from your computer
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            Select Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {/* Options */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoExtractZip}
              onChange={(e) => setAutoExtractZip(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-700"
            />
            <span className="text-sm text-text-light-primary dark:text-text-primary">
              Auto-extract ZIP files
            </span>
          </label>
        </div>

        {/* Upload List */}
        {uploads.length > 0 && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-text-light-primary dark:text-text-primary">
                Uploads ({uploads.length})
              </h3>
              {completedCount > 0 && (
                <button
                  onClick={clearCompleted}
                  className="text-xs text-accent-primary hover:underline"
                >
                  Clear completed
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {uploads.map((upload) => (
                <Card key={upload.id} variant="glass">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <File size={16} className="text-gray-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-medium text-text-light-primary dark:text-text-primary truncate">
                            {upload.file.name}
                          </p>
                          {upload.status === 'success' && (
                            <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                          )}
                          {upload.status === 'extracting' && (
                            <Badge variant="success" size="sm">
                              Extracted
                            </Badge>
                          )}
                          {upload.status === 'error' && (
                            <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                          )}
                        </div>

                        {upload.status === 'pending' || upload.status === 'uploading' ? (
                          <>
                            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5">
                              <div
                                className="bg-accent-primary rounded-full h-1.5 transition-all"
                                style={{ width: `${upload.progress}%` }}
                              />
                            </div>
                            <p className="text-xs text-text-light-muted dark:text-text-muted mt-1">
                              {upload.status === 'uploading'
                                ? `${Math.round(upload.progress)}%`
                                : 'Waiting...'}
                            </p>
                          </>
                        ) : null}

                        {upload.status === 'extracting' && upload.extractedFiles && (
                          <p className="text-xs text-text-light-muted dark:text-text-muted mt-1">
                            Extracted {upload.extractedFiles.length} file(s)
                          </p>
                        )}

                        {upload.status === 'error' && (
                          <p className="text-xs text-red-500 mt-1">{upload.error}</p>
                        )}
                      </div>

                      {(upload.status === 'error' || upload.status === 'success' || upload.status === 'extracting') && (
                        <button
                          onClick={() => removeUpload(upload.id)}
                          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex-shrink-0"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
