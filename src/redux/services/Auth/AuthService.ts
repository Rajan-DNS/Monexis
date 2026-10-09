import { useCallback, useState } from "react";
import { useSignInMutation, useSendOTPMutation, useForgotPasswordMutation, useChangePasswordMutation, useRegisterMutation } from "./AuthApi";
import { buildSignInPayload, buildSendOTPPayload } from "./AuthPayload";
import { ModalState } from "../mainApi/Type/type";
import { useAppDispatch } from "../../hooks";
import { loginSuccess } from "../../slices/authSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
interface response {
    status: boolean;
    success: boolean;
    message: string;
    data: any;
}

export const useAuthService = () => {
    const dispatch = useAppDispatch();
    const [signInMutation, { isLoading: isSigningIn }] = useSignInMutation();
    const [sendOTPMutation, { isLoading: isSendingOTP }] = useSendOTPMutation();
    const [forgotPasswordMutation, { isLoading: isResettingPassword }] = useForgotPasswordMutation();
    const [changePasswordMutation, { isLoading: isChangingPassword }] = useChangePasswordMutation();
    const [registerMutation, { isLoading: isRegistering }] = useRegisterMutation();

    const [statusModal, setStatusModal] = useState<ModalState>({
        isVisible: false,
        type: 'success',
        title: '',
        message: '',
    });

    const signIn = useCallback(
        async (phone: string, password: string = '', isOTP: boolean = false, otp: string = '') => {
            try {
                const payload = buildSignInPayload(phone, password, isOTP, otp);
                const response = await signInMutation(payload).unwrap();

                if (!response?.status && !response?.success) {
                    setStatusModal({
                        isVisible: true,
                        type: 'error',
                        title: 'Login Failed',
                        message: response.message || 'Invalid credentials',
                    });
                    return { success: false, response };
                }

                const role = response?.data?.roleName;
                const name = response?.data?.orgName;
                if (role !== 'Distributor' && role !== 'Retailer') {
                    setStatusModal({
                        isVisible: true,
                        type: 'error',
                        title: 'Access Denied',
                        message: `Your role (${response?.data?.roleName || 'Unknown'}) is not authorized to use this application.`,
                    });
                    return { success: false, response };
                }

                dispatch(loginSuccess({
                    user: {
                        name: name,
                        orgName: name || '',
                        roleName: role || '',
                        phone: phone,
                        role: role,
                        email: response?.data?.email,
                        id: response?.data?.id,
                        p2PBalance: response?.data?.p2PBalance,
                        roleId: response?.data?.roleId,
                        parentId: response?.data?.parentId,
                        isKycApproved: (response?.data as any)?.isKycApproved ?? true,
                    },
                    token: response?.token
                }));

                await AsyncStorage.setItem('userName', name || '');

                return { success: true, response };
            } catch (error: any) {
                const errorMessage = error?.data?.message || 'Invalid ID or Password';
                setStatusModal({
                    isVisible: true,
                    type: 'error',
                    title: 'Login Failed',
                    message: errorMessage,
                });
                return { success: false, error: errorMessage };
            }
        },
        [signInMutation, dispatch]
    );

    const sendOTP = useCallback(
        async (mobileNumber: string) => {
            try {
                const payload = buildSendOTPPayload(mobileNumber);
                const response = await sendOTPMutation(payload).unwrap();

                if (response.status || response.success) {
                    return { success: true, response };
                } else {
                    setStatusModal({
                        isVisible: true,
                        type: 'error',
                        title: 'Error',
                        message: response.message || 'Failed to send OTP',
                    });
                    return { success: false, response };
                }
            } catch (error: any) {
                const errorMessage = error?.data?.message || 'Failed to send OTP. Please try again.';
                setStatusModal({
                    isVisible: true,
                    type: 'error',
                    title: 'Error',
                    message: errorMessage,
                });
                return { success: false, error: errorMessage };
            }
        },
        [sendOTPMutation]
    );

    const resetPassword = useCallback(
        async (data: any) => {
            try {
                const response = await forgotPasswordMutation(data).unwrap();

                if (response.status || response.success) {
                    setStatusModal({
                        isVisible: true,
                        type: 'success',
                        title: 'Success',
                        message: 'Password reset successfully!',
                    });
                    return { success: true, response };
                } else {
                    setStatusModal({
                        isVisible: true,
                        type: 'error',
                        title: 'Error',
                        message: response.message || 'Failed to reset password',
                    });
                    return { success: false, response };
                }
            } catch (error: any) {
                const errorMessage = error?.data?.message || 'Failed to reset password. Please try again.';
                setStatusModal({
                    isVisible: true,
                    type: 'error',
                    title: 'Error',
                    message: errorMessage,
                });
                return { success: false, error: errorMessage };
            }
        },
        [forgotPasswordMutation]
    );

    const changePassword = useCallback(
        async (data: any) => {
            try {
                const response = await changePasswordMutation(data).unwrap();

                if (response.status || response.success) {
                    setStatusModal({
                        isVisible: true,
                        type: 'success',
                        title: 'Success',
                        message: 'Password changed successfully!',
                    });
                    return { success: true, response };
                } else {
                    setStatusModal({
                        isVisible: true,
                        type: 'error',
                        title: 'Error',
                        message: response.message || 'Failed to change password',
                    });
                    return { success: false, response };
                }
            } catch (error: any) {
                const errorMessage = error?.data?.message || 'Failed to change password. Please try again.';
                setStatusModal({
                    isVisible: true,
                    type: 'error',
                    title: 'Error',
                    message: errorMessage,
                });
                return { success: false, error: errorMessage };
            }
        },
        [changePasswordMutation]
    );

    const closeStatusModal = useCallback(() => {
        setStatusModal(prev => ({ ...prev, isVisible: false }));
    }, []);

    return {
        signIn,
        sendOTP,
        resetPassword,
        changePassword,
        isLoading: isSigningIn || isSendingOTP || isResettingPassword || isChangingPassword || isRegistering,
        isSigningIn,
        isSendingOTP,
        isResettingPassword,
        isChangingPassword,
        isRegistering,
        statusModal,
        closeStatusModal,
    };
};
