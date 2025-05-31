import React, { useRef } from 'react';
import { Button } from '../ui/Button';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = "image/*,application/pdf,.doc,.docx",
  maxSize = 10 * 1024 * 1024,
  className = ""
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize) {
      alert(`File size must be less than ${maxSize / 1024 / 1024}MB`);
      return;
    }

    onFileSelect(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={handleClick}
      >
        📎
      </Button>
    </div>
  );
};
