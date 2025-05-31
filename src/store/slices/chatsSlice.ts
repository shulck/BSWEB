import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Chat, Message } from '../../types';
import { ChatService } from '../../services/chatService';

interface ChatsState {
  chats: Chat[];
  currentChatMessages: Message[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatsState = {
  chats: [],
  currentChatMessages: [],
  isLoading: false,
  error: null,
};

export const createDirectChat = createAsyncThunk(
  'chats/createDirect',
  async ({ user1Id, user2Id }: { user1Id: string; user2Id: string }, { rejectWithValue }) => {
    try {
      return await ChatService.createDirectChat(user1Id, user2Id);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createGroupChat = createAsyncThunk(
  'chats/createGroup',
  async ({ name, participantIds, adminId }: { name: string; participantIds: string[]; adminId: string }, { rejectWithValue }) => {
    try {
      return await ChatService.createGroupChat(name, participantIds, adminId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chats/sendMessage',
  async ({ chatId, senderId, content }: { chatId: string; senderId: string; content: string }, { rejectWithValue }) => {
    try {
      await ChatService.sendMessage(chatId, senderId, content);
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const chatsSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    setChats: (state, action: PayloadAction<Chat[]>) => {
      state.chats = action.payload;
    },
    setCurrentChatMessages: (state, action: PayloadAction<Message[]>) => {
      state.currentChatMessages = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.currentChatMessages.push(action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createDirectChat.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createDirectChat.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createDirectChat.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setChats, setCurrentChatMessages, addMessage, clearError } = chatsSlice.actions;
export default chatsSlice.reducer;
