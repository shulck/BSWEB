import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { GroupModel, UserModel } from '../../types';
import { GroupService } from '../../services/groupService';

interface GroupsState {
  currentGroup: GroupModel | null;
  members: UserModel[];
  pendingMembers: UserModel[];
  isLoading: boolean;
  error: string | null;
}

const initialState: GroupsState = {
  currentGroup: null,
  members: [],
  pendingMembers: [],
  isLoading: false,
  error: null,
};

export const createGroup = createAsyncThunk(
  'groups/create',
  async ({ name, creatorId }: { name: string; creatorId: string }, { rejectWithValue }) => {
    try {
      const groupId = await GroupService.createGroup(name, creatorId);
      return await GroupService.fetchGroup(groupId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const joinGroup = createAsyncThunk(
  'groups/join',
  async ({ code, userId }: { code: string; userId: string }, { rejectWithValue }) => {
    try {
      await GroupService.joinGroupByCode(code, userId);
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchGroup = createAsyncThunk(
  'groups/fetch',
  async (groupId: string, { rejectWithValue }) => {
    try {
      return await GroupService.fetchGroup(groupId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const approveUser = createAsyncThunk(
  'groups/approveUser',
  async ({ groupId, userId }: { groupId: string; userId: string }, { rejectWithValue }) => {
    try {
      await GroupService.approveUser(groupId, userId);
      return userId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const rejectUser = createAsyncThunk(
  'groups/rejectUser',
  async ({ groupId, userId }: { groupId: string; userId: string }, { rejectWithValue }) => {
    try {
      await GroupService.rejectUser(groupId, userId);
      return userId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentGroup: (state, action: PayloadAction<GroupModel | null>) => {
      state.currentGroup = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create group
      .addCase(createGroup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentGroup = action.payload;
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Join group
      .addCase(joinGroup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(joinGroup.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(joinGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch group
      .addCase(fetchGroup.fulfilled, (state, action) => {
        state.currentGroup = action.payload;
      })
      // Approve user
      .addCase(approveUser.fulfilled, (state, action) => {
        if (state.currentGroup) {
          state.currentGroup.pendingMembers = state.currentGroup.pendingMembers.filter(
            id => id !== action.payload
          );
          state.currentGroup.members.push(action.payload);
        }
      })
      // Reject user
      .addCase(rejectUser.fulfilled, (state, action) => {
        if (state.currentGroup) {
          state.currentGroup.pendingMembers = state.currentGroup.pendingMembers.filter(
            id => id !== action.payload
          );
        }
      });
  },
});

export const { clearError, setCurrentGroup } = groupsSlice.actions;
export default groupsSlice.reducer;
