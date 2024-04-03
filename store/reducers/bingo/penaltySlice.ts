import { createSlice } from '@reduxjs/toolkit';
import { PenaltySliceType } from '../../../utils/Types';

const INITIAL_STATE: PenaltySliceType = {
    penaltyList: []
};

export const penaltySlice = createSlice({
    name: 'penalty',
    initialState: INITIAL_STATE,
    reducers: {
        setPenaltyList: (state, action) => {
            state.penaltyList = action.payload;
        },
        addPenaltyList: (state, action) => {
            console.log('xxxxx')
            state.penaltyList.push(action.payload);
        }
    },
});

export const { setPenaltyList, addPenaltyList } = penaltySlice.actions;
export default penaltySlice.reducer;