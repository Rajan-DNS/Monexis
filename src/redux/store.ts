import { configureStore, isRejectedWithValue, Middleware } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import rootReducer from './rootReducer';
import { AuthApi } from './services/Auth/AuthApi';
import { UserApi } from './services/mainApi/User';


import { logout } from './slices/authSlice';
import { resetToLogin } from '../navigation/navigationService';

export const rtkQueryErrorLogger = (api: any) => (next: any) => (action: any) => {
  if (isRejectedWithValue(action)) {
    console.warn('RTK Query Error:', action.payload);
    const endpointName = action.meta?.arg?.endpointName;
    const isPublicAuthRequest = [
      'signIn',
      'sendOTP',
      'sendSignUpOTP',
      'forgotPassword',
      'changePassword',
      'register',
      'signUp',
      'CheckSignUpShowOnApp',
    ].includes(endpointName);

    if (action.payload?.status === 401 && !isPublicAuthRequest) {
      api.dispatch(logout());
      resetToLogin();
    }
  }
  return next(action);
};

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'],
  blacklist: [AuthApi.reducerPath, UserApi.reducerPath,],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware(
      {
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }
    ).concat(AuthApi.middleware as any, UserApi.middleware as any, rtkQueryErrorLogger as any),
});

export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
