import React from 'react';
import { FileService } from '../../services/fileService';

interface MessageFileProps {
  fileUrl: string;
  fileName: string;
  fileSize?: number;
}

export const MessageFile: React.FC<MessageFileProps> = ({
  fileUrl,
  fileName,
  fileSize
}) => {
  const isImage = FileService.isImage(fileName);

  if (isImage) {
    return (
      <div className="max-w-xs">
        <img
          src={fileUrl}
          alt={fileName}
          className="rounded-lg max-w-full h-auto cursor-pointer"
          onClick={() => window.open(fileUrl, '_blank')}
        />
        <p className="text-xs mt-1 opacity-75">{fileName}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-700 rounded-lg p-3 max-w-xs">
      <div className="flex-shrink-0">
        <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {fileName}
        </p>
        {fileSize && (
          <p className="text-xs text-gray-500">
            {FileService.formatFileSize(fileSize)}
          </p>
        )}
      </div>
      <a
        href={fileUrl}
        download={fileName}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
      >
        Download
      </a>
    </div>
  );
};
