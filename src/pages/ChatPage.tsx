import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { setChats, setCurrentChatMessages, sendMessage } from '../store/slices/chatsSlice';
import { ChatService } from '../services/chatService';
import { MainLayout } from '../components/layout/MainLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Chat, Message } from '../types';

export const ChatPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector((state) => state.user);
  const { chats, currentChatMessages } = useAppSelector((state) => state.chats);
  
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    if (!currentUser) return;

    // Subscribe to chats
    const unsubscribeChats = ChatService.subscribeToChats(currentUser.id, (chats) => {
      dispatch(setChats(chats));
    });

    return () => {
      if (unsubscribeChats) unsubscribeChats();
    };
  }, [currentUser, dispatch]);

  useEffect(() => {
    if (!selectedChat?.id) return;

    // Subscribe to messages for selected chat
    const unsubscribeMessages = ChatService.subscribeToMessages(selectedChat.id, (messages) => {
      dispatch(setCurrentChatMessages(messages));
    });

    return () => {
      if (unsubscribeMessages) unsubscribeMessages();
    };
  }, [selectedChat, dispatch]);

  const handleSendMessage = async () => {
    if (!selectedChat?.id || !currentUser || !messageText.trim()) return;

    try {
      await dispatch(sendMessage({
        chatId: selectedChat.id,
        senderId: currentUser.id,
        content: messageText.trim()
      })).unwrap();
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-200px)] bg-white rounded-lg shadow overflow-hidden">
        {/* Chat List */}
        <div className="w-1/3 border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Chats</h2>
          </div>
          
          <div className="overflow-y-auto h-full">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedChat?.id === chat.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => setSelectedChat(chat)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 truncate">
                      {chat.name}
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
            ))}
            
            {chats.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                No chats yet
              </div>
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-gray-900">{selectedChat.name}</h3>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {currentChatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderId === currentUser?.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === currentUser?.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.senderId === currentUser?.id ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                        {message.isEdited && ' (edited)'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
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
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                  >
                    Send
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a chat to start messaging
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};
