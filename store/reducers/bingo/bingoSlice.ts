import { createSlice } from '@reduxjs/toolkit';
import { bingoCellStatusInit, bingoCellValues } from '../../../components/BingoEngine';

const INITIAL_STATE = {
    bingoGameHasStarted: false,
    bingoGameHasCompleted: false,
    bingoRestartInitiated: false,
    bingoCellStatus: bingoCellStatusInit(),
    bingoCellValue: bingoCellValues(),
    bingoNextNumber: '',
    bingoMyTurn: false,
    isHost: false,
    bingoId: '',
    bingoTurn: '',
    bingoPassBtnDisplay: false,
    sort: [],
    canBorardCellClick: false,
    turnCount: 0
};

export const bingoSlice = createSlice({
    name: 'bingo',
    initialState: INITIAL_STATE,
    reducers: {
        setBingoInitial: (state, action) => {

            if(action.payload) {
                state.bingoId = action.payload.bingoId;
                state.isHost = action.payload.isHost;
            }
            state.bingoGameHasStarted = false;
            state.bingoGameHasCompleted = false;
            state.bingoRestartInitiated = false;
            state.bingoCellValue = bingoCellValues(),
            state.bingoCellStatus = bingoCellStatusInit();
            state.bingoNextNumber = '';
            state.bingoMyTurn = false;
            state.bingoPassBtnDisplay = false;
            state.sort = [];
            state.bingoTurn = '';
            state.canBorardCellClick = false;
            state.turnCount = 0;
        },
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
        setBingoInfo: (state, action) => {
            state.bingoMyTurn = action.payload.bingoMyTurn;
            state.bingoTurn = action.payload.bingoTurn;
            state.sort = action.payload.sort;
            state.bingoNextNumber = action.payload.bingoNextNumber;
            state.turnCount = action.payload.turnCount;
        }, 
        setCanBoardCellClick: (state, action) => {
            state.canBorardCellClick = action.payload; 
        },
        setTurnCount: (state, action) => {
            state.turnCount  = action.payload;
        }
    },
});

export const {
     BingoStart,
     BingoStop, 
     setBingoCellStatus, 
     setBingoNextNumber, 
     setBingoMyTurn, 
     setBingoInitial, 
     setBingoInfo, 
     setCanBoardCellClick, 
     setTurnCount } = bingoSlice.actions;
export default bingoSlice.reducer;