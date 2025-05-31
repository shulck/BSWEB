import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { FinanceRecord } from '../../types';
import { FinanceService } from '../../services/financeService';

interface FinancesState {
  records: FinanceRecord[];
  isLoading: boolean;
  error: string | null;
}

const initialState: FinancesState = {
  records: [],
  isLoading: false,
  error: null,
};

export const fetchRecords = createAsyncThunk(
  'finances/fetchRecords',
  async (groupId: string, { rejectWithValue }) => {
    try {
      return await FinanceService.fetchRecords(groupId);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addRecord = createAsyncThunk(
  'finances/addRecord',
  async (record: Omit<FinanceRecord, 'id'>, { rejectWithValue }) => {
    try {
      const recordId = await FinanceService.addRecord(record);
      return { ...record, id: recordId };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateRecord = createAsyncThunk(
  'finances/updateRecord',
  async ({ recordId, record }: { recordId: string; record: Partial<FinanceRecord> }, { rejectWithValue }) => {
    try {
      await FinanceService.updateRecord(recordId, record);
      return { recordId, record };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteRecord = createAsyncThunk(
  'finances/deleteRecord',
  async (recordId: string, { rejectWithValue }) => {
    try {
      await FinanceService.deleteRecord(recordId);
      return recordId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const financesSlice = createSlice({
  name: 'finances',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch records
      .addCase(fetchRecords.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecords.fulfilled, (state, action) => {
        state.isLoading = false;
        state.records = action.payload;
      })
      .addCase(fetchRecords.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Add record
      .addCase(addRecord.fulfilled, (state, action) => {
        state.records.unshift(action.payload);
      })
      // Update record
      .addCase(updateRecord.fulfilled, (state, action) => {
        const { recordId, record } = action.payload;
        const index = state.records.findIndex(r => r.id === recordId);
        if (index !== -1) {
          state.records[index] = { ...state.records[index], ...record };
        }
      })
      // Delete record
      .addCase(deleteRecord.fulfilled, (state, action) => {
        state.records = state.records.filter(r => r.id !== action.payload);
      });
  },
});

export const { clearError } = financesSlice.actions;
export default financesSlice.reducer;
