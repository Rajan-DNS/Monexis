// Auth Payload Builders - Types are defined in Type/type.ts
import type {
    SignInPayload,
    SendOTPPayload,
    ForgotPasswordPayload,
    ChangePasswordPayload,
} from '../mainApi/Type/type';

export type { SignInPayload, SendOTPPayload, ForgotPasswordPayload, ChangePasswordPayload };

export const buildSignInPayload = (
    phone: string,
    password: string = '',
    isOTP: boolean = false,
    otp: string = ''
): SignInPayload => ({
    userName: phone.trim(),
    passWord: password.trim(),
    isOTP: isOTP,
    otp: otp,
});

export const buildSendOTPPayload = (mobileNumber: string, email: string = ''): SendOTPPayload => ({
    MobileNumber: (mobileNumber || '').trim(),
    email: (email || '').trim(),
});

export const buildForgotPasswordPayload = (mobileNumber: string): ForgotPasswordPayload => ({
    mobileNumber: mobileNumber.trim(),
});
