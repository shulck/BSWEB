import React from 'react';
import { Message, MessageType } from '../../types';
import { MessageFile } from './MessageFile';

interface MessageItemProps {
  message: Message;
  isOwnMessage: boolean;
  onEdit?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isOwnMessage,
  onEdit,
  onDelete
}) => {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const isImageUrl = (url: string) => {
    if (!url) return false;
    return url.includes('firebasestorage') && (
      url.includes('.jpg') || url.includes('.jpeg') || 
      url.includes('.png') || url.includes('.gif') || url.includes('.webp') ||
      url.includes('chat_images') || url.includes('images')
    );
  };

  const renderMessageContent = () => {
    // Проверяем, является ли это изображением
    const imageUrl = message.fileUrl || (message.content && message.content.startsWith('https://firebasestorage') ? message.content : null);
    
    if ((message.type === MessageType.IMAGE || isImageUrl(imageUrl || '')) && imageUrl) {
      return (
        <div>
          <img
            src={imageUrl}
            alt="Shared content"
            className="rounded-lg max-w-full h-auto cursor-pointer max-w-xs"
            onClick={() => window.open(imageUrl, '_blank')}
            onError={(e) => {
              console.log('Failed to load:', imageUrl);
              e.currentTarget.style.display = 'none';
            }}
          />
          {message.content && message.content !== message.fileName && !message.content.startsWith('https://') && (
            <p className="mt-2">{message.content}</p>
          )}
        </div>
      );
    } else if (message.type === MessageType.FILE && message.fileUrl) {
      return (
        <div>
          <MessageFile
            fileUrl={message.fileUrl}
            fileName={message.fileName || message.content}
            fileSize={message.fileSize}
          />
          {message.content && message.content !== message.fileName && (
            <p className="mt-2">{message.content}</p>
          )}
        </div>
      );
    } else {
      return <p>{message.content}</p>;
    }
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isOwnMessage
          ? 'bg-blue-500 text-white'
          : 'bg-gray-200 text-gray-900'
      }`}>
        {renderMessageContent()}
        
        <div className="flex items-center justify-between mt-1">
          <p className={`text-xs ${
            isOwnMessage ? 'text-blue-100' : 'text-gray-500'
          }`}>
            {formatTime(message.timestamp)}
            {message.isEdited && ' (edited)'}
          </p>
          
          {isOwnMessage && (onEdit || onDelete) && (
            <div className="flex space-x-1 ml-2">
              {onEdit && message.type === MessageType.TEXT && (
                <button
                  onClick={() => onEdit(message.id!)}
                  className="text-xs opacity-70 hover:opacity-100"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(message.id!)}
                  className="text-xs opacity-70 hover:opacity-100"
                >
                  Del
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
