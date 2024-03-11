import { createSlice } from '@reduxjs/toolkit';
import { bingoCellStatusInit } from '../../../components/BingoEngine';

const INITIAL_STATE = {
    bingoGameHasStarted: false,
    bingoGameHasCompleted: false,
    bingoRestartInitiated: false,
    bingoBallsList: [],
    bingoBallsListToDisplay: [],
    bingoCellStatus: bingoCellStatusInit(),
    bingoNextNumber: '',
    bingoMyTurn: true
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
        setBingoCellStatus: (state, action) => {
            state.bingoCellStatus = action.payload;
        },
        setBingoNextNumber: (state, action) => {
            state.bingoNextNumber = action.payload;
        },
        setBingoMyTurn: (state, action) => {
            state.bingoMyTurn = action.payload;
        }
    },
});

export const { BingoStart, BingoStop, setBingoCellStatus, setBingoNextNumber, setBingoMyTurn } = bingoSlice.actions;
export default bingoSlice.reducer;