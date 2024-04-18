import { createSlice } from '@reduxjs/toolkit';
import { PenaltySliceType } from '../../../utils/Types';

const INITIAL_STATE: PenaltySliceType = {
    penaltyList: [],
    patternASet: false,
    patternAList: [],
    patternB: "",
    patternC: 1
};

export const penaltySlice = createSlice({
    name: 'penalty',
    initialState: INITIAL_STATE,
    reducers: {
        setPenaltyList: (state, action) => {
            state.penaltyList = action.payload;
        },
        addPenaltyList: (state, action) => {
            state.penaltyList.push(action.payload);
        },
        setPatternASet: (state, action) => {
            state.patternASet = action.payload;
        },
        setPatternAList: (state, action) => {
            state.patternAList = action.payload
        },
        setPatternB: (state, action) => {
            state.patternB = action.payload
        },
        setpatternC: (state, action) => {
            state.patternC = action.payload
        }
    },
});

export const { setPenaltyList, addPenaltyList, setPatternASet, setPatternAList, setPatternB, setpatternC } = penaltySlice.actions;
export default penaltySlice.reducer;