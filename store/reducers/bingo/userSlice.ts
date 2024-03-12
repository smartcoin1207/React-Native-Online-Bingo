import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserState } from '../../../utils/Types';

const INITIAL_STATE: UserState = {
    authUser: {
        uid: '', 
        email: '',
        displayName: '',
        photoURL: ''
    },
    isLoggedIn : false
};

export const userSlice = createSlice({
    name: 'user',
    initialState: INITIAL_STATE,
    reducers: {
        SignUp: (state, action) => {
            state.authUser = action.payload;
        },
        SignIn: (state, action) => {
            state.authUser = action.payload;
            state.isLoggedIn = true;
        },
        SignOut: (state) => {
            state.isLoggedIn = false;
        }
    },
});

export const { SignUp, SignIn, SignOut } = userSlice.actions;
export default userSlice.reducer;