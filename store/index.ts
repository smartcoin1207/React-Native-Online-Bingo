import { configureStore } from '@reduxjs/toolkit';
import bingoReducer from './reducers/bingo/bingoSlice';
import authReducer from './reducers/bingo/userSlice';
import gameRoomReducer from './reducers/bingo/gameRoomSlice';
import penaltyReducer from "./reducers/bingo/penaltySlice";

export const store = configureStore({
    reducer: {
        bingo: bingoReducer,
        auth: authReducer,
        gameRoom: gameRoomReducer,
        penalty: penaltyReducer
    },
});

// Provide RootState type to the store
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;