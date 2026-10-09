import { useCallback, useState } from "react";
import {
    useAddTopUpMutation,
    useGetTopUpListMutation,
    useFundTransferDownlineUserMutation,
    useGetFundTransferListMutation
} from "./TopupApi";
import {
    TopUpFormData,
    buildTopUpPayload,
    FundTransferFormData,
    buildFundTransferPayload
} from "./Payload";
import { ModalState } from "../Type/type";

export const useTopUpService = () => {
    const [addTopUp, { isLoading: isAddingTopUp }] = useAddTopUpMutation();
    const [getTopUpList, { isLoading: isFetchingTopUp }] = useGetTopUpListMutation();
    const [fundTransfer, { isLoading: isSubmittingFund }] = useFundTransferDownlineUserMutation();
    const [getFundTransferList, { isLoading: isFetchingFund }] = useGetFundTransferListMutation();

    const [statusModal, setStatusModal] = useState<ModalState>({
        isVisible: false, type: 'success', title: '', message: '',
    });

    const submitTopUp = useCallback(
        async (formData: TopUpFormData, userId: number, roleId: number): Promise<boolean> => {
            try {
                const payload = buildTopUpPayload(formData, userId, roleId);
                const response = await addTopUp(payload).unwrap();

                if (response.status || response.success) {
                    setStatusModal({
                        isVisible: true,
                        type: 'success',
                        title: 'Success',
                        message: response.message || 'Top-up Request Submitted Successfully!',
                    });
                    return true;
                } else {
                    setStatusModal({
                        isVisible: true,
                        type: 'error',
                        title: 'Failed',
                        message: response.message || 'Failed to submit top-up request.',
                    });
                    return false;
                }
            } catch (error: any) {
                setStatusModal({
                    isVisible: true,
                    type: 'error',
                    title: 'Error',
                    message: error?.data?.message || 'Something went wrong. Please try again.',
                });
                return false;
            }
        },
        [addTopUp]
    );

    const submitFundTransfer = useCallback(
        async (formData: FundTransferFormData, fromUserId: number): Promise<boolean> => {
            try {
                const payload = buildFundTransferPayload(formData, fromUserId);
                const response = await fundTransfer(payload).unwrap();

                if (response.status || response.success) {
                    setStatusModal({
                        isVisible: true,
                        type: 'success',
                        title: 'Success',
                        message: response.message || 'Fund Transferred Successfully!',
                    });
                    return true;
                } else {
                    setStatusModal({
                        isVisible: true,
                        type: 'error',
                        title: 'Failed',
                        message: response.message || 'Fund transfer failed.',
                    });
                    return false;
                }
            } catch (error: any) {
                setStatusModal({
                    isVisible: true,
                    type: 'error',
                    title: 'Error',
                    message: error?.data?.message || 'An error occurred during transfer.',
                });
                return false;
            }
        },
        [fundTransfer]
    );

    const formatDate = (date: Date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const fetchTopUpList = useCallback(
        async (pageNumber: number, pageSize: number, userId: number, filterFields: any = {}) => {
            const today = formatDate(new Date());
            try {
                const payload = {
                    pageNumber,
                    pageSize,
                    filter: {
                        bankAccountId: Number(filterFields.bankAccountId || 0),
                        fromDate: filterFields.fromDate || today,
                        gstTypeId: Number(filterFields.gstTypeId || 0),
                        paymentReferenceNumber: filterFields.paymentReferenceNumber || "",
                        statusId: Number(filterFields.statusId || 0),
                        toDate: filterFields.toDate || today,
                        transferTypeId: Number(filterFields.transferTypeId || 0),
                        userId: userId
                    }
                };
                const response = await getTopUpList(payload).unwrap();
                return response;
            } catch (error) {
                console.error('Fetch error:', error);
                throw error;
            }
        },
        [getTopUpList]
    );

    const fetchFundTransferList = useCallback(
        async (pageNumber: number, pageSize: number, userId: number, filterFields: any = {}) => {
            const today = formatDate(new Date());
            try {
                const payload = {
                    pageNumber,
                    pageSize,
                    filter: {
                        userId: Number(filterFields.retailerId || 0),
                        fromDate: filterFields.fromDate || today,
                        // paymentReferenceNumber: filterFields.paymentReferenceNumber || "",
                        // statusId: Number(filterFields.statusId || 0),
                        toDate: filterFields.toDate || today,
                        // transferTypeId: 0,
                        addedById: 0
                    }
                };
                const response = await getFundTransferList(payload).unwrap();
                return response;
            } catch (error) {
                console.error('Fetch error:', error);
                throw error;
            }
        },
        [getFundTransferList]
    );

    const closeStatusModal = useCallback(() => {
        setStatusModal(prev => ({ ...prev, isVisible: false }));
    }, []);

    return {
        submitTopUp,
        submitFundTransfer,
        fetchTopUpList,
        fetchFundTransferList,
        getTopUpList,
        isLoading: isAddingTopUp || isFetchingTopUp || isSubmittingFund || isFetchingFund,
        isAdding: isAddingTopUp,
        isAddingTopUp,
        isSubmittingFund,
        statusModal,
        closeStatusModal
    };
};
