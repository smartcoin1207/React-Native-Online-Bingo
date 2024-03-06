import { configureStore } from '@reduxjs/toolkit';
import bingoReducer from './reducers/bingoSlice';

export const store = configureStore({
    reducer: {
        bingo: bingoReducer,
    },
});