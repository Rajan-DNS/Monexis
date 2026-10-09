import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

export const API_BASE_URL = 'https://webapi.monexis.store/MonexisRecharge';

const publicEndpoints = new Set([
  'signIn',
  'sendOTP',
  'sendSignUpOTP',
  'forgotPassword',
  'register',
  'signUp',
  'CheckSignUpShowOnApp',
]);

const diagnosticFetch: typeof fetch = async (input, init) => {
  try {
    if (init?.method === 'POST' && (init.body === undefined || init.body === null)) {
      init.body = '{}';
    }
    return await fetch(input, init);
  } catch (error) {
    const url = typeof input === 'string' ? input : input?.url;
    const method =
      init?.method ??
      (typeof input === 'string' ? undefined : input?.method) ??
      'GET';
    console.warn('Network request failed:', {
      url,
      method,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};

export const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  timeout: 30000,
  fetchFn: diagnosticFetch,
  prepareHeaders: (headers, { endpoint, getState }) => {
    const token = (getState() as RootState).auth.token;
    headers.set('Content-Type', 'application/json');
    if (token && !publicEndpoints.has(endpoint)) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});
