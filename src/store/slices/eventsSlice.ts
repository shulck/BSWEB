import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Event } from '../../types';
import { EventService } from '../../services/eventService';

interface EventsState {
  events: Event[];
  isLoading: boolean;
  error: string | null;
}

const initialState: EventsState = {
  events: [],
  isLoading: false,
  error: null,
};

export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (groupId: string, { rejectWithValue }) => {
    try {
      const events = await EventService.fetchEvents(groupId);
      return events;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addEvent = createAsyncThunk(
  'events/addEvent',
  async (event: Omit<Event, 'id'>, { rejectWithValue }) => {
    try {
      const eventId = await EventService.addEvent(event);
      return { ...event, id: eventId };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ eventId, event }: { eventId: string; event: Partial<Event> }, { rejectWithValue }) => {
    try {
      await EventService.updateEvent(eventId, event);
      return { eventId, event };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async (eventId: string, { rejectWithValue }) => {
    try {
      await EventService.deleteEvent(eventId);
      return eventId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch events
      .addCase(fetchEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Add event
      .addCase(addEvent.fulfilled, (state, action) => {
        state.events.unshift(action.payload);
      })
      // Update event
      .addCase(updateEvent.fulfilled, (state, action) => {
        const { eventId, event } = action.payload;
        const index = state.events.findIndex(e => e.id === eventId);
        if (index !== -1) {
          state.events[index] = { ...state.events[index], ...event };
        }
      })
      // Delete event
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.events = state.events.filter(e => e.id !== action.payload);
      });
  },
});

export const { clearError } = eventsSlice.actions;
export default eventsSlice.reducer;
