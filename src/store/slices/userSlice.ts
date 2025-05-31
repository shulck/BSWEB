import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UserModel } from '../../types';
import { UserService } from '../../services/userService';

interface UserState {
  currentUser: UserModel | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  isLoading: false,
  error: null,
};

export const fetchCurrentUser = createAsyncThunk(
  'user/fetchCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const user = await UserService.fetchCurrentUser();
      return {
        ...user,
        lastSeen: user.lastSeen ? user.lastSeen.getTime() : null
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserGroup = createAsyncThunk(
  'user/updateGroup',
  async (groupId: string, { rejectWithValue }) => {
    try {
      await UserService.updateUserGroup(groupId);
      const updatedUser = await UserService.fetchCurrentUser();
      return {
        ...updatedUser,
        lastSeen: updatedUser.lastSeen ? updatedUser.lastSeen.getTime() : null
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<UserModel | null>) => {
      if (action.payload) {
        state.currentUser = {
          ...action.payload,
          lastSeen: action.payload.lastSeen ? new Date(action.payload.lastSeen) : undefined
        };
      } else {
        state.currentUser = null;
      }
    },
    clearUser: (state) => {
      state.currentUser = null;
    },
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = {
          ...action.payload,
          lastSeen: action.payload.lastSeen ? new Date(action.payload.lastSeen) : undefined
        };
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateUserGroup.fulfilled, (state, action) => {
        state.currentUser = {
          ...action.payload,
          lastSeen: action.payload.lastSeen ? new Date(action.payload.lastSeen) : undefined
        };
      });
  },
});

export const { setCurrentUser, clearUser, clearUserError } = userSlice.actions;
export default userSlice.reducer;
