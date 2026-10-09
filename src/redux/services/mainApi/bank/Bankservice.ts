import { useCallback, useState } from "react";
import {
    useAddBankAccountMutation,
    useGetAccountTypeQuery,
    useGetBankDropdownQuery,
    useGetBankAccountListMutation
} from "./BankApi";
import { BankFormData, buildBankFilterPayload, buildBankPayload } from "./Payload";
import { ModalState } from "../Type/type";

export const useBankService = () => {
    const [addBankAccount, { isLoading: isAdding }] = useAddBankAccountMutation();
    const [getBanks, { isLoading: isFetching }] = useGetBankAccountListMutation();
    const { data: bankDropdownData } = useGetBankDropdownQuery();
    const { data: accountTypeData } = useGetAccountTypeQuery();
    const [statusModal, setStatusModal] = useState<ModalState>({
        isVisible: false, type: 'success', title: '', message: '',
    });

    const submitBank = useCallback(
        async (formData: BankFormData, initialData?: any): Promise<boolean> => {
            try {
                const payload = buildBankPayload(formData, initialData);
                const response = await addBankAccount(payload).unwrap();

                if (response.status || response.success) {
                    setStatusModal({
                        isVisible: true,
                        type: 'success',
                        title: 'Success',
                        message: response.message || (initialData ? 'Bank Updated Successfully!' : 'Bank Added Successfully!'),
                    });
                    return true;
                } else {
                    setStatusModal({
                        isVisible: true,
                        type: 'error',
                        title: 'Error',
                        message: response.message || 'Something went wrong',
                    });
                    return false;
                }
            } catch (error: any) {
                setStatusModal({
                    isVisible: true,
                    type: 'error',
                    title: 'Error',
                    message: error?.data?.message || 'Failed to save bank details.',
                });
                return false;
            }
        },
        [addBankAccount]
    );

    const fetchBanksList = useCallback(
        async (
            index: number,
            pageSize: number,
            searchQuery: string,
            appliedFilter: any,
            filters?: Partial<any>
        ) => {
            try {
                const activeFilters = filters ?? appliedFilter;

                // Combine searchQuery with filters for the payload
                const combinedFilters = {
                    ...activeFilters,
                    accountNumber: activeFilters.accountNumber || searchQuery,
                    accountHolderName: activeFilters.accountHolderName || searchQuery,
                };

                const payload = buildBankFilterPayload(index, pageSize, combinedFilters);

              

                const response = await getBanks(payload).unwrap();
                return response;
            } catch (error) {
                console.error('Fetch error:', error);
                throw error;
            }
        },
        [getBanks]
    );

    const closeStatusModal = useCallback(() => {
        setStatusModal(prev => ({ ...prev, isVisible: false }));
    }, []);

    return {
        submitBank,
        getBanks,
        fetchBanksList,
        isLoading: isAdding || isFetching,
        isAdding,
        isFetching,
        bankDropdownList: bankDropdownData?.data || [],
        accountTypeList: accountTypeData?.data || [],
        statusModal,
        closeStatusModal,
    };
};
