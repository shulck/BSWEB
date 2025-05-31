import {
  ref,
  push,
  onValue,
  off,
  update,
  remove,
  serverTimestamp,
  Database
} from 'firebase/database';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where 
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

    const chatRef = push(ref(this.db, 'chats'));
    await update(chatRef, chatData);
    
    return chatRef.key!;
  }

  static subscribeToChats(userId: string, callback: (chats: Chat[]) => void) {
    const chatsRef = ref(this.db, 'chats');
    
    return onValue(chatsRef, async (snapshot) => {
      const chats: Chat[] = [];
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        for (const [chatId, chatData] of Object.entries(data)) {
          const chat = chatData as any;
          
          if (chat.participants && chat.participants[userId]) {
            let chatName = chat.name;
            
            if (chat.type === ChatType.DIRECT && !chatName) {
              const otherUserId = Object.keys(chat.participants).find(id => id !== userId);
              if (otherUserId) {
                const userName = await this.getUserName(otherUserId);
                chatName = userName || 'Unknown User';
              }
            }
            
            chats.push({
              id: chatId,
              name: chatName,
              type: chat.type,
              participants: chat.participants,
              lastMessage: chat.lastMessage,
              lastMessageTime: chat.lastMessageTime ? new Date(chat.lastMessageTime) : undefined
            });
          }
        }
      }
      
      chats.sort((a, b) => {
        const timeA = a.lastMessageTime?.getTime() || 0;
        const timeB = b.lastMessageTime?.getTime() || 0;
        return timeB - timeA;
      });
      
      callback(chats);
    });
  }

  static subscribeToMessages(chatId: string, callback: (messages: Message[]) => void) {
    const messagesRef = ref(this.db, `messages/${chatId}`);
    
    return onValue(messagesRef, (snapshot) => {
      const messages: Message[] = [];
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        for (const [messageId, messageData] of Object.entries(data)) {
          const message = messageData as any;
          
          messages.push({
            id: messageId,
            chatId,
            senderId: message.senderId,
            content: message.content,
            type: message.type,
            timestamp: new Date(message.timestamp),
            replyTo: message.replyTo,
            seenBy: message.seenBy || [],
            deliveredTo: message.deliveredTo || [],
            isEdited: message.isEdited || false
          });
        }
      }
      
      messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      callback(messages);
    });
  }

  static async sendMessage(chatId: string, senderId: string, content: string, type: MessageType = MessageType.TEXT, replyTo?: string): Promise<void> {
    const messageData = {
      chatId,
      senderId,
      content,
      type,
      timestamp: serverTimestamp(),
      replyTo: replyTo || null,
      seenBy: [senderId],
      deliveredTo: [senderId],
      isEdited: false
    };

    const messageRef = push(ref(this.db, `messages/${chatId}`));
    await update(messageRef, messageData);

    // Update chat's last message
    await update(ref(this.db, `chats/${chatId}`), {
      lastMessage: type === MessageType.TEXT ? content : `📷 ${type}`,
      lastMessageTime: serverTimestamp()
    });
  }

  static async editMessage(chatId: string, messageId: string, newContent: string): Promise<void> {
    await update(ref(this.db, `messages/${chatId}/${messageId}`), {
      content: newContent,
      isEdited: true
    });
  }

  static async deleteMessage(chatId: string, messageId: string): Promise<void> {
    await remove(ref(this.db, `messages/${chatId}/${messageId}`));
  }

  static async markMessageSeen(chatId: string, messageId: string, userId: string): Promise<void> {
    const messageRef = ref(this.db, `messages/${chatId}/${messageId}/seenBy`);
    
    // Get current seenBy array and add user if not present
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

  static async deleteChat(chatId: string): Promise<void> {
    await remove(ref(this.db, `chats/${chatId}`));
    await remove(ref(this.db, `messages/${chatId}`));
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
