import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameRoomState, GameType } from '../../../utils/Types';

const INITIAL_STATE: GameRoomState = {
    gameRooms: [],
    currentGameRoom: null,
    isHost: false,
    gameRoomId: '',
    gameType: GameType.Room,
};

export const gameRoomSlice = createSlice({
    name: 'gameRoom',
    initialState: INITIAL_STATE,
    reducers: {
        setGameRooms: (state, action) => {
            state.gameRooms = action.payload
        },

        addGameRooms: (state, action) => {

        },

        setCurrentGameRoom: (state, action) => {
            state.currentGameRoom = action.payload
        },

        setGameRoomId: (state, action) => {
            state.gameRoomId = action.payload?.gameRoomId;
            state.isHost = action.payload?.isHost;
        },
        setGameType: (state, action) => {
            state.gameType = action.payload
        }
    },
});

export const { setGameRooms, addGameRooms, setCurrentGameRoom, setGameRoomId, setGameType } = gameRoomSlice.actions;
export default gameRoomSlice.reducer;