import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameRoomState } from '../../../utils/Types';

const INITIAL_STATE: GameRoomState = {
    gameRooms: [],
    currentGameRoom: null
};

export const gameRoomSlice = createSlice({
    name: 'user',
    initialState: INITIAL_STATE,
    reducers: {
        setGameRooms: (state, action) => {
            state.gameRooms = action.payload
        },
        addGameRooms: (state, action) => {

        },
        setCurrentGameRoom: (state, action) => {
            state.currentGameRoom = action.payload
        }        
    },
});

export const { setGameRooms, addGameRooms, setCurrentGameRoom } = gameRoomSlice.actions;
export default gameRoomSlice.reducer;