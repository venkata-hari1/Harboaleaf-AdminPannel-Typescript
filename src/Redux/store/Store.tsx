import { configureStore } from '@reduxjs/toolkit';
import UserMangment from '../Reducers/UserMangement';

export const store=configureStore({
    reducer:{
        UserMangment      
    }
})
export type AppDispatch=typeof store.dispatch
export type RootState=ReturnType<typeof store.getState>
