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
    bingoMyTurn: false,
    isHost: false,
    bingoId: '',
    bingoTurn: '',
    bingoPassBtnDisplay: false,
    sort: []
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
        },
        setBingoInitial: (state, action) => {
            state.bingoId = action.payload.bingoId;
            state.isHost = action.payload.isHost;
        },
        setBingoInfo: (state, action) => {
            state.bingoNextNumber = action.payload.bingoNextNumber;
            state.bingoMyTurn = action.payload.bingoMyTurn;
            state.bingoTurn = action.payload.bingoTurn;
            state.sort = action.payload.sort;
        }
    },
});

export const { BingoStart, BingoStop, setBingoCellStatus, setBingoNextNumber, setBingoMyTurn, setBingoInitial, setBingoInfo } = bingoSlice.actions;
export default bingoSlice.reducer;