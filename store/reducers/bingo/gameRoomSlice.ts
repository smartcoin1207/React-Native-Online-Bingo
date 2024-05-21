import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameRoomState, GameType } from '../../../utils/Types';

const INITIAL_STATE: GameRoomState = {
    gameRooms: [],
    currentGameRoom: null,
    isHost: false,
    gameRoomId: '',
    gameType: GameType.Exit,
    penaltyGameType: GameType.Bingo,
    isPenaltyAorB: true,
    mainGameStart: false
};

export const gameRoomSlice = createSlice({
    name: 'gameRoom',
    initialState: INITIAL_STATE,
    reducers: {
        setGameRoomInitial: (state, action) => {
            state.gameRooms = [];
            state.currentGameRoom = null;
            state.isHost = false,
            state.gameRoomId = '';
            state.gameType = GameType.Exit;
        },
        setGameRooms: (state, action) => {
            state.gameRooms = action.payload
        },

        addGameRooms: (state, action) => {

        },

        setCurrentGameRoom: (state, action) => {
            state.currentGameRoom = action.payload
        },

        setGameRoomIdHost: (state, action) => {
            state.gameRoomId = action.payload?.gameRoomId;
            state.isHost = action.payload?.isHost;
        },
        setGameType: (state, action) => {
            state.gameType = action.payload
        },
        setPenaltyGameType: (state, action) => {
            state.penaltyGameType = action.payload
        },
        setMainGameStart: (state, action) => {
            state.mainGameStart = action.payload
        }, 
        setPenaltyAorB: (state, action) => {
            state.isPenaltyAorB = action.payload;
        }
    },
});

export const { setGameRooms, addGameRooms, setCurrentGameRoom, setGameRoomIdHost, setGameType,setGameRoomInitial, setPenaltyGameType, setMainGameStart ,setPenaltyAorB } = gameRoomSlice.actions;
export default gameRoomSlice.reducer;