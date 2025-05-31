import React, { useState } from 'react';
import { FileService } from '../../services/fileService';
import { Button } from '../ui/Button';

interface ReceiptUploadProps {
  onUpload: (url: string) => void;
  groupId: string;
  currentReceiptUrl?: string;
}

export const ReceiptUpload: React.FC<ReceiptUploadProps> = ({
  onUpload,
  groupId,
  currentReceiptUrl
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size must be less than 5MB');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only images (JPG, PNG, GIF) and PDF files are allowed');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      const downloadURL = await FileService.uploadReceiptFile(file, groupId);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      onUpload(downloadURL);
      
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      console.error('Upload failed:', error);
      alert('Failed to upload file. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Receipt/Document
        </label>
        
        {currentReceiptUrl && (
          <div className="mb-2">
            <a
              href={currentReceiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View current receipt
            </a>
          </div>
        )}

        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
          disabled={isUploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};
