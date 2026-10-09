import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store';

import { UserIdentity } from '../services/mainApi/Type/type';

interface AuthState {
  user: UserIdentity | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ user: UserIdentity; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;

// Selectors
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.token !== null;
export const selectAuthToken = (state: RootState) => state.auth.token;

export default authSlice.reducer;