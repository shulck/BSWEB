import React, { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { setChats, setCurrentChatMessages } from '../store/slices/chatsSlice';
import { ChatService } from '../services/chatService';
import { FileService } from '../services/fileService';
import { MainLayout } from '../components/layout/MainLayout';
import { ChatCreation } from '../components/chat/ChatCreation';
import { MessageItem } from '../components/chat/MessageItem';
import { FileUpload } from '../components/chat/FileUpload';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Chat, MessageType } from '../types';

export const ChatPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.user);
  const { chats, currentChatMessages } = useAppSelector((state) => state.chats);
  
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messageText, setMessageText] = useState('');
  const [showCreateChat, setShowCreateChat] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  console.log('🔍 CURRENT USER:', {
    id: currentUser?.id,
    email: currentUser?.email,
    groupId: currentUser?.groupId
  });

  const selectDefaultChat = useCallback((chats: Chat[]) => {
    if (chats.length > 0 && !selectedChat) {
      const groupChat = chats.find(chat => chat.type === 'group');
      if (groupChat) {
        console.log('📱 Auto-selecting group chat:', groupChat.name);
        setSelectedChat(groupChat);
      } else {
        console.log('📱 Auto-selecting first chat:', chats[0].name);
        setSelectedChat(chats[0]);
      }
    }
  }, [selectedChat]);

  useEffect(() => {
    if (!currentUser?.id) {
      console.log('❌ NO CURRENT USER ID');
      return;
    }

    console.log('🔄 SETTING UP CHAT SUBSCRIPTION FOR USER:', currentUser.id);
    
    const unsubscribeChats = ChatService.subscribeToChats(currentUser.id, (chats) => {
      console.log('📨 RECEIVED CHATS IN COMPONENT:', chats);
      dispatch(setChats(chats));
      selectDefaultChat(chats);
    });

    return () => {
      console.log('🔌 Unsubscribing from chats');
      if (unsubscribeChats) unsubscribeChats();
    };
  }, [currentUser?.id, dispatch, selectDefaultChat]);

  useEffect(() => {
    if (!selectedChat?.id) return;

    console.log('💬 Subscribing to messages for chat:', selectedChat.name, selectedChat.id);
    const unsubscribeMessages = ChatService.subscribeToMessages(selectedChat.id, (messages) => {
      console.log('📩 Received', messages.length, 'messages for chat:', selectedChat.name);
      dispatch(setCurrentChatMessages(messages));
    });

    return () => {
      console.log('🔌 Unsubscribing from messages');
      if (unsubscribeMessages) unsubscribeMessages();
    };
  }, [selectedChat?.id, selectedChat?.name, dispatch]);

  const handleSendMessage = async () => {
    if (!selectedChat?.id || !currentUser || !messageText.trim()) return;

    try {
      console.log('📤 Sending message to chat:', selectedChat.name);
      await ChatService.sendMessage(
        selectedChat.id,
        currentUser.id,
        messageText.trim(),
        MessageType.TEXT
      );
      setMessageText('');
    } catch (error) {
      console.error('❌ Failed to send message:', error);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!selectedChat?.id || !currentUser) return;

    setIsUploading(true);
    try {
      let fileUrl: string;
      let messageType: MessageType;

      if (FileService.isImage(file.name)) {
        fileUrl = await FileService.uploadChatImage(file, selectedChat.id);
        messageType = MessageType.IMAGE;
      } else {
        fileUrl = await FileService.uploadChatFile(file, selectedChat.id);
        messageType = MessageType.FILE;
      }

      console.log('📤 Sending file:', { fileUrl, messageType, fileName: file.name });

      await ChatService.sendMessage(
        selectedChat.id,
        currentUser.id,
        file.name,
        messageType,
        undefined,
        fileUrl,
        file.name,
        file.size
      );

    } catch (error) {
      console.error('❌ Failed to upload file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  console.log('🏠 CHATPAGE RENDER:');
  console.log('  - Chats count:', chats.length);
  console.log('  - Selected chat:', selectedChat?.name);
  console.log('  - All chats:', chats.map(c => ({ name: c.name, type: c.type, id: c.id })));

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-200px)] bg-white rounded-lg shadow overflow-hidden">
        <div className="w-1/3 border-r border-gray-200">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Chats ({chats.length})
            </h2>
            <Button size="sm" onClick={() => setShowCreateChat(true)}>
              + New
            </Button>
          </div>
          
          <div className="overflow-y-auto h-full">
            {chats.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p className="font-bold text-red-600">NO CHATS LOADED!</p>
                <p className="text-xs mt-2">User ID: {currentUser?.id}</p>
                <p className="text-xs">Group ID: {currentUser?.groupId}</p>
                <p className="text-xs mt-2">Check console for debug info</p>
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedChat?.id === chat.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => {
                    console.log('👆 Selecting chat:', chat.name, chat.type);
                    setSelectedChat(chat);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 truncate flex items-center">
                        {chat.type === 'group' && <span className="mr-2">👥</span>}
                        {chat.name}
                        <span className="ml-2 text-xs text-gray-500">({chat.type})</span>
                      </h3>
                      {chat.lastMessage && (
                        <p className="text-sm text-gray-500 truncate mt-1">
                          {chat.lastMessage}
                        </p>
                      )}
                    </div>
                    {chat.lastMessageTime && (
                      <span className="text-xs text-gray-400">
                        {formatTime(chat.lastMessageTime)}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  {selectedChat.type === 'group' && <span className="mr-2">👥</span>}
                  {selectedChat.name}
                  <span className="ml-2 text-sm text-gray-500">
                    ({selectedChat.type} chat)
                  </span>
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentChatMessages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p>No messages yet in this chat.</p>
                    <p className="text-xs mt-1">Chat ID: {selectedChat.id}</p>
                  </div>
                ) : (
                  currentChatMessages.map((message) => (
                    <MessageItem
                      key={message.id}
                      message={message}
                      isOwnMessage={message.senderId === currentUser?.id}
                    />
                  ))
                )}
              </div>

              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <FileUpload
                    onFileSelect={handleFileUpload}
                    className="flex-shrink-0"
                  />
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1"
                    disabled={isUploading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || isUploading}
                  >
                    Send
                  </Button>
                </div>
                {isUploading && (
                  <div className="mt-2 text-sm text-gray-500">
                    Uploading file...
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p>Select a chat to start messaging</p>
                <p className="text-xs mt-2">Total chats: {chats.length}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <ChatCreation
        isOpen={showCreateChat}
        onClose={() => setShowCreateChat(false)}
      />
    </MainLayout>
  );
};
