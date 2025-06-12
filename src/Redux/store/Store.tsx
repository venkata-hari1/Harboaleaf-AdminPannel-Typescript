import { configureStore } from '@reduxjs/toolkit';
import UserMangment from '../Reducers/UserMangement';
import subscriptionReducer from '../Reducers/SubscriptionSlice';

export const store = configureStore({
  reducer: {
    UserMangment,
    subscription: subscriptionReducer
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
