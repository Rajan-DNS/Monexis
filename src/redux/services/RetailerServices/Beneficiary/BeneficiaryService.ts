import { 
    useAddUpdateBeneficiaryMutation,
    useGetBeneficiaryListMutation,
    useUpdateBeneficiaryStatusMutation,
    useDmtPayRequestMutation,
    useGetDMTPayDataMutation,
} from './BeneficiaryApi';
import { 
    buildBeneficiaryPayload,
    buildUpdateBeneficiaryPayload,
    buildDeleteBeneficiaryPayload,
    buildGetBeneficiaryFilterPayload,
    buildDMTPayRequestPayload,
    buildGetDMTPayDataPayload,
    GetBeneficiaryFilterPayload,
    DMTPayRequestPayload,
} from './BeneficiaryPayload';

export const BeneficiaryService = () => {
    const [addUpdateBeneficiary, { isLoading: isAddUpdateLoading }] = useAddUpdateBeneficiaryMutation();
    const [getBeneficiaryList, { isLoading: isGetListLoading }] = useGetBeneficiaryListMutation();
    const [updateBeneficiaryStatus, { isLoading: isUpdateStatusLoading }] = useUpdateBeneficiaryStatusMutation();
    const [dmtPayRequest, { isLoading: isDMTPayLoading }] = useDmtPayRequestMutation();
    const [getDMTPayData, { isLoading: isGetDMTPayDataLoading }] = useGetDMTPayDataMutation();

    // Add or Update Beneficiary
    const FetchBeneficiary = async (
        formData: any,
        initialData?: any,
    ): Promise<any> => {
        try {
            const payload = buildBeneficiaryPayload(formData);

            const response = await addUpdateBeneficiary(payload).unwrap();
            
            if (response?.success) {
                return {
                    success: true,
                    data: response?.data || response,
                    message: response?.message || 'Beneficiary saved successfully',
                };
            } else {
                return {
                    success: false,
                    message: response?.message || 'Failed to save beneficiary',
                };
            }
        } catch (error: any) {
            return {
                success: false,
                message: error?.data?.message || 'Failed to save beneficiary',
            };
        }
    };

    // Get Beneficiary List with Filters
    const fetchBeneficiaryList = async (
        pageNumber: number = 1,
        pageSize: number = 20,
        filters?: GetBeneficiaryFilterPayload
    ) => {
        try {
            const payload = {
                pageNumber,
                pageSize,
                filter: buildGetBeneficiaryFilterPayload(filters),
            };
            
            const response = await getBeneficiaryList(payload).unwrap();
            
            return { 
                success: true, 
                data: response.data || response, 
                message: response.message 
            };
        } catch (error: any) {
            return { 
                success: false, 
                message: error?.data?.message || 'Failed to fetch beneficiary list' 
            };
        }
    };

    // Update Beneficiary (for editing existing beneficiary)
    const updateBeneficiary = async (
        id: number,
        formData: any,
    ): Promise<any> => {
        try {
            const payload = buildUpdateBeneficiaryPayload(id, formData);

            const response = await addUpdateBeneficiary(payload).unwrap();
            
            if (response?.success) {
                return {
                    success: true,
                    data: response?.data || response,
                    message: response?.message || 'Beneficiary updated successfully',
                };
            } else {
                return {
                    success: false,
                    message: response?.message || 'Failed to update beneficiary',
                };
            }
        } catch (error: any) {
            return {
                success: false,
                message: error?.data?.message || 'Failed to update beneficiary',
            };
        }
    };

    // Delete Beneficiary
    const deleteBeneficiary = async (id: number): Promise<any> => {
        try {
            const payload = buildDeleteBeneficiaryPayload(id);

            const response = await updateBeneficiaryStatus(payload).unwrap();
            
            if (response?.success) {
                return {
                    success: true,
                    data: response?.data || response,
                    message: response?.message || 'Beneficiary deleted successfully',
                };
            } else {
                return {
                    success: false,
                    message: response?.message || 'Failed to delete beneficiary',
                };
            }
        } catch (error: any) {
            return {
                success: false,
                message: error?.data?.message || 'Failed to delete beneficiary',
            };
        }
    };

    // DMT Pay Request
    const payBeneficiary = async (
        paymentData: DMTPayRequestPayload
    ): Promise<any> => {
        try {
            const payload = buildDMTPayRequestPayload(paymentData);

            const response = await dmtPayRequest(payload).unwrap();
            
            if (response?.success) {
                return {
                    success: true,
                    data: response?.data || response,
                    message: response?.message || 'Payment successful',
                };
            } else {
                return {
                    success: false,
                    message: response?.message || 'Payment failed',
                };
            }
        } catch (error: any) {
            return {
                success: false,
                message: error?.data?.message || 'Payment failed',
            };
        }
    };

    // Get DMT Payment Report
    const fetchDMTPaymentReport = async (
        pageNumber: number = 1,
        pageSize: number = 20,
        filters?: {
            accountNumber?: string;
            accountHolderName?: string;
            beneficiaryId?: number;
            statusId?: number;
            fromDate?: string;
            toDate?: string;
        }
    ) => {
        try {
            const payload = buildGetDMTPayDataPayload(pageNumber, pageSize, filters);
            
            const response = await getDMTPayData(payload).unwrap();
            
            return { 
                success: true, 
                data: response.data || response, 
                message: response.message 
            };
        } catch (error: any) {
            return { 
                success: false, 
                message: error?.data?.message || 'Failed to fetch payment report' 
            };
        }
    };

    return {
        // Mutations
        addUpdateBeneficiary,
        getBeneficiaryList,
        updateBeneficiaryStatus,
        dmtPayRequest,
        getDMTPayData,
        
        // Loading States
        isAddUpdateLoading,
        isGetListLoading,
        isUpdateStatusLoading,
        isDMTPayLoading,
        isGetDMTPayDataLoading,
        
        // Service Methods
        FetchBeneficiary,
        fetchBeneficiaryList,
        updateBeneficiary,
        deleteBeneficiary,
        payBeneficiary,
        fetchDMTPaymentReport,
    };
};
