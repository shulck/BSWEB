import {
  ref,
  push,
  onValue,
  update,
  serverTimestamp,
  Database
} from 'firebase/database';
import { 
  doc, 
  getDoc 
} from 'firebase/firestore';
import { realtimeDB, firestore } from '../firebase';
import { Chat, Message, UserModel, ChatType, MessageType } from '../types';

export class ChatService {
  private static db: Database = realtimeDB;

  static async createDirectChat(user1Id: string, user2Id: string): Promise<string> {
    const chatData = {
      type: ChatType.DIRECT,
      participants: {
        [user1Id]: true,
        [user2Id]: true
      },
      lastMessage: '',
      lastMessageTime: serverTimestamp()
    };

    const chatRef = push(ref(this.db, 'chats'));
    await update(chatRef, chatData);
    
    console.log('✅ Created direct chat:', chatRef.key);
    return chatRef.key!;
  }

  static async createGroupChat(name: string, participantIds: string[], adminId: string): Promise<string> {
    const participants: Record<string, boolean> = {};
    participantIds.forEach(id => {
      participants[id] = true;
    });

    const chatData = {
      name,
      type: ChatType.GROUP,
      participants,
      adminId,
      lastMessage: '',
      lastMessageTime: serverTimestamp()
    };

    console.log('🏗️ Creating group chat:', { name, participantIds, adminId });

    const chatRef = push(ref(this.db, 'chats'));
    await update(chatRef, chatData);
    
    console.log('✅ Created group chat:', chatRef.key, 'with name:', name);
    return chatRef.key!;
  }

  static subscribeToChats(userId: string, callback: (chats: Chat[]) => void) {
    console.log('🔍 SUBSCRIBING TO CHATS FOR USER:', userId);
    const chatsRef = ref(this.db, 'chats');
    
    return onValue(chatsRef, async (snapshot) => {
      console.log('📊 FIREBASE SNAPSHOT - EXISTS:', snapshot.exists());
      
      if (!snapshot.exists()) {
        console.log('❌ NO CHATS IN FIREBASE DATABASE!');
        callback([]);
        return;
      }

      const data = snapshot.val();
      console.log('📊 RAW FIREBASE DATA:', data);
      console.log('📊 TOTAL CHATS IN DATABASE:', Object.keys(data).length);
      
      const chats: Chat[] = [];
      
      for (const [chatId, chatData] of Object.entries(data)) {
        const chat = chatData as any;
        
        // Определяем тип чата
        const participantCount = chat.participants ? Object.keys(chat.participants).length : 0;
        const actualType = participantCount > 2 ? ChatType.GROUP : 
                          (chat.type === ChatType.GROUP ? ChatType.GROUP : ChatType.DIRECT);
        
        console.log(`🔍 PROCESSING CHAT ${chatId}:`, {
          chatName: chat.name,
          chatType: chat.type,
          actualType: actualType,
          participantCount: participantCount,
          hasParticipants: !!chat.participants,
          participants: chat.participants ? Object.keys(chat.participants) : [],
          isUserInChat: chat.participants?.[userId] === true
        });
        
        if (chat.participants && chat.participants[userId] === true) {
          let chatName = chat.name;
          
          // Для прямых чатов получаем имя собеседника
          if (actualType === ChatType.DIRECT && !chatName) {
            const otherUserId = Object.keys(chat.participants).find(id => id !== userId);
            if (otherUserId) {
              const userName = await this.getUserName(otherUserId);
              chatName = userName || 'Unknown User';
            }
          }
          
          // Для групповых чатов без названия
          if (actualType === ChatType.GROUP && !chatName) {
            chatName = 'Group Chat';
          }
          
          const chatObject: Chat = {
            id: chatId,
            name: chatName || 'Unnamed Chat',
            type: actualType,
            participants: chat.participants,
            lastMessage: chat.lastMessage || '',
            lastMessageTime: chat.lastMessageTime ? new Date(chat.lastMessageTime) : undefined
          };
          
          console.log('✅ ADDING CHAT TO LIST:', {
            id: chatId,
            name: chatName,
            type: actualType,
            participantCount: participantCount,
            originalType: chat.type
          });
          
          chats.push(chatObject);
        } else {
          console.log(`❌ USER ${userId} NOT IN CHAT ${chatId}:`, {
            participants: chat.participants ? Object.keys(chat.participants) : 'NO PARTICIPANTS',
            userValue: chat.participants?.[userId],
            chatType: chat.type
          });
        }
      }
      
      chats.sort((a, b) => {
        const timeA = a.lastMessageTime?.getTime() || 0;
        const timeB = b.lastMessageTime?.getTime() || 0;
        return timeB - timeA;
      });
      
      console.log('📱 FINAL CHAT LIST TO RETURN:', chats.map(c => ({ 
        id: c.id, 
        name: c.name, 
        type: c.type,
        participantCount: c.participants ? Object.keys(c.participants).length : 0
      })));
      
      callback(chats);
    });
  }

  static subscribeToMessages(chatId: string, callback: (messages: Message[]) => void) {
    console.log('💬 Subscribing to messages for chat:', chatId);
    const messagesRef = ref(this.db, `messages/${chatId}`);
    
    return onValue(messagesRef, (snapshot) => {
      const messages: Message[] = [];
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log('💬 Found', Object.keys(data).length, 'messages in chat:', chatId);
        
        for (const [messageId, messageData] of Object.entries(data)) {
          const message = messageData as any;
          
          messages.push({
            id: messageId,
            chatId,
            senderId: message.senderId,
            content: message.content,
            type: message.type || MessageType.TEXT,
            timestamp: new Date(message.timestamp),
            replyTo: message.replyTo,
            seenBy: message.seenBy || [],
            deliveredTo: message.deliveredTo || [],
            isEdited: message.isEdited || false,
            fileUrl: message.fileUrl,
            fileName: message.fileName,
            fileSize: message.fileSize
          });
        }
      } else {
        console.log('💬 No messages found for chat:', chatId);
      }
      
      messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      callback(messages);
    });
  }

  static async sendMessage(
    chatId: string, 
    senderId: string, 
    content: string, 
    type: MessageType = MessageType.TEXT, 
    replyTo?: string,
    fileUrl?: string,
    fileName?: string,
    fileSize?: number
  ): Promise<void> {
    const messageData = {
      chatId,
      senderId,
      content,
      type,
      timestamp: serverTimestamp(),
      replyTo: replyTo || null,
      seenBy: [senderId],
      deliveredTo: [senderId],
      isEdited: false,
      fileUrl: fileUrl || null,
      fileName: fileName || null,
      fileSize: fileSize || null
    };

    console.log('📤 Sending message:', { chatId, type, content: content.substring(0, 50) });

    const messageRef = push(ref(this.db, `messages/${chatId}`));
    await update(messageRef, messageData);

    const lastMessageText = type === MessageType.IMAGE ? '📷 Image' : 
                           type === MessageType.FILE ? '📎 File' : content;

    await update(ref(this.db, `chats/${chatId}`), {
      lastMessage: lastMessageText,
      lastMessageTime: serverTimestamp()
    });
    
    console.log('✅ Message sent successfully');
  }

  static async editMessage(chatId: string, messageId: string, newContent: string): Promise<void> {
    await update(ref(this.db, `messages/${chatId}/${messageId}`), {
      content: newContent,
      isEdited: true
    });
  }

  static async markMessageSeen(chatId: string, messageId: string, userId: string): Promise<void> {
    const messageRef = ref(this.db, `messages/${chatId}/${messageId}/seenBy`);
    
    onValue(messageRef, (snapshot) => {
      const seenBy = snapshot.val() || [];
      if (!seenBy.includes(userId)) {
        seenBy.push(userId);
        update(ref(this.db, `messages/${chatId}/${messageId}`), {
          seenBy
        });
      }
    }, { onlyOnce: true });
  }

  private static async getUserName(userId: string): Promise<string | null> {
    try {
      const userDoc = await getDoc(doc(firestore, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserModel;
        return userData.name;
      }
    } catch (error) {
      console.error('Error fetching user name:', error);
    }
    return null;
  }
}
