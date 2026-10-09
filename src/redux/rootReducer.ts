import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import { AuthApi } from './services/Auth/AuthApi';
import { UserApi } from './services/mainApi/User';

const rootReducer = combineReducers({
  auth: authReducer,
  [AuthApi.reducerPath]: AuthApi.reducer,
  [UserApi.reducerPath]: UserApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
