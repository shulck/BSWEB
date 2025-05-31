import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import eventsReducer from './slices/eventsSlice';
import groupsReducer from './slices/groupsSlice';
import chatsReducer from './slices/chatsSlice';
import financesReducer from './slices/financesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    events: eventsReducer,
    groups: groupsReducer,
    chats: chatsReducer,
    finances: financesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'auth/setUser',
          'events/addEvent/fulfilled',
          'events/updateEvent/fulfilled',
          'finances/addRecord/fulfilled',
          'finances/updateRecord/fulfilled',
          'user/fetchCurrent/pending',
          'user/fetchCurrent/fulfilled'
        ],
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp', 'payload.lastSeen', 'payload.date'],
        ignoredPaths: [
          'items.dates',
          'auth.user',
          'user.currentUser.lastSeen'
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
