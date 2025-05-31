import React, { useState } from 'react';
import { FileService } from '../../services/fileService';
import { Button } from '../ui/Button';

interface MerchImageUploadProps {
  onUpload: (urls: string[]) => void;
  groupId: string;
  currentImageUrls?: string[];
  maxImages?: number;
}

export const MerchImageUpload: React.FC<MerchImageUploadProps> = ({
  onUpload,
  groupId,
  currentImageUrls = [],
  maxImages = 5
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = async (files: FileList) => {
    if (!files || files.length === 0) return;

    const totalImages = currentImageUrls.length + files.length;
    if (totalImages > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File ${file.name} is too large (max 5MB)`);
        }

        if (!file.type.startsWith('image/')) {
          throw new Error(`File ${file.name} is not an image`);
        }

        return FileService.uploadMerchImage(file, groupId);
      });

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const newUrls = await Promise.all(uploadPromises);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      const allUrls = [...currentImageUrls, ...newUrls];
      onUpload(allUrls);

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    } catch (error) {
      setIsUploading(false);
      setUploadProgress(0);
      console.error('Upload failed:', error);
      alert(`Upload failed: ${error}`);
    }
  };

  const removeImage = (indexToRemove: number) => {
    const newUrls = currentImageUrls.filter((_, index) => index !== indexToRemove);
    onUpload(newUrls);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Images ({currentImageUrls.length}/{maxImages})
        </label>

        {currentImageUrls.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {currentImageUrls.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Product ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            if (e.target.files) handleFileSelect(e.target.files);
          }}
          disabled={isUploading || currentImageUrls.length >= maxImages}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />

        <p className="text-xs text-gray-500 mt-1">
          Upload up to {maxImages} images. Max 5MB each. JPEG, PNG, GIF supported.
        </p>
      </div>

      {isUploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading images...</span>
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
