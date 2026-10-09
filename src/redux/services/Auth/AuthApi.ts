import { createApi } from '@reduxjs/toolkit/query/react';
import { AUTH_URLS } from './AuthURL';
import { AuthResponse, CommonResponse, SignUpShowResponse } from './AuthServer';
import { SignInPayload, SendOTPPayload, ForgotPasswordPayload, ChangePasswordPayload } from './AuthPayload';
import { baseQuery } from '../baseQuery';

export const AuthApi = createApi({
    reducerPath: 'AuthApi',
    baseQuery,
    tagTypes: ['Auth'],
    endpoints: (builder) => ({
        signIn: builder.mutation<AuthResponse, SignInPayload>({
            query: (credentials) => ({
                url: AUTH_URLS.SIGN_IN,
                method: 'POST',
                body: credentials,
            }),
        }),
        sendOTP: builder.mutation<CommonResponse & { success?: boolean }, SendOTPPayload>({
            query: (data) => ({
                url: AUTH_URLS.SEND_OTP,
                method: 'POST',
                params: { MobileNumber: data.MobileNumber },
                body: {},
            }),
        }),
        sendSignUpOTP: builder.mutation<CommonResponse & { success?: boolean }, SendOTPPayload>({
            query: (data) => ({
                url: AUTH_URLS.SEND_SIGNUP_OTP,
                method: 'POST',
                params: { 
                    MobileNumber: data.MobileNumber,
                    Email: data.email || '',
                },
                body: {},
            }),
        }),
        forgotPassword: builder.mutation<CommonResponse & { success?: boolean }, any>({
            query: (data) => ({
                url: AUTH_URLS.FORGOT_PASSWORD,
                method: 'POST',
                body: data,
            }),
        }),
        changePassword: builder.mutation<CommonResponse, ChangePasswordPayload>({
            query: (data) => ({
                url: AUTH_URLS.CHANGE_PASSWORD,
                method: 'POST',
                body: data,
            }),
        }),
        changePin: builder.mutation<CommonResponse, any>({
            query: (data) => ({
                url: '/User/ResetPin',
                method: 'POST',
                body: data,
            }),
        }),
        register: builder.mutation<CommonResponse, any>({
            query: (data) => ({
                url: AUTH_URLS.REGISTER,
                method: 'POST',
                body: data,
            }),
        }),
        signUp: builder.mutation<CommonResponse, any>({
            query: (data) => ({
                url: 'Account/SignUp',
                method: 'POST',
                body: data,
            }),
        }),
        showPin: builder.mutation<CommonResponse & { success?: boolean }, any>({
            query: (data) => ({
                url: 'User/ShowPin',
                method: 'POST',
                body: data,
            }),
        }),
        CheckSignUpShowOnApp: builder.query<SignUpShowResponse, any>({
            query: () => ({
                url: 'Account/CheckSignUpShowOnApp',
                method: 'GET',
            }),
        }),
    }),
});

export const {
    useSignInMutation,
    useSendOTPMutation,
    useSendSignUpOTPMutation,
    useForgotPasswordMutation,
    useChangePasswordMutation,
    useChangePinMutation,
    useRegisterMutation,
    useSignUpMutation,
    useShowPinMutation,
    useCheckSignUpShowOnAppQuery
} = AuthApi;

export default AuthApi;
