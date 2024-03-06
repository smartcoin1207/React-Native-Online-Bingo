import { createSlice } from '@reduxjs/toolkit';

const INITIAL_STATE = {
    bingoGameHasStarted: false,
    bingoGameHasCompleted: false,
    bingoRestartInitiated: false,
    bingoBallsList: [],
    bingoBallsListToDisplay: [],
};

export const bingoSlice = createSlice({
    name: 'bingo',
    initialState: INITIAL_STATE,
    reducers: {
        BingoStart: (state, action) => {
            state.bingoGameHasStarted = true;
        },
        BingoStop: (state, action) => {
            state.bingoGameHasStarted = false;
        },
    },
});

export const { BingoStart, BingoStop } = bingoSlice.actions;
export default bingoSlice.reducer;