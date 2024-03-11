import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BingoRoomState } from '../../../utils/Types';

const INITIAL_STATE: BingoRoomState = {
    bingoRooms: [],
    currentBingoRoom: null
};

export const bingoRoomSlice = createSlice({
    name: 'user',
    initialState: INITIAL_STATE,
    reducers: {
        SignUp: (state, action) => {
            
        },
        setBingoRooms: (state, action) => {
            state.bingoRooms = action.payload
        },
        addBingoRooms: (state, action) => {

        },
        setCurrentBingoRoom: (state, action) => {
            state.currentBingoRoom = action.payload
        }        
    },
});

export const { setBingoRooms, addBingoRooms, setCurrentBingoRoom } = bingoRoomSlice.actions;
export default bingoRoomSlice.reducer;