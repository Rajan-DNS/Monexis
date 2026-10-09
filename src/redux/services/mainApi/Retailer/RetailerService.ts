import { useState, useCallback } from 'react';
import { useAddRetailerMutation, useGetDistributorUserListQuery } from './RetailerApi';
import { useGetStateListQuery } from '../Common/CommonApi';
import { buildRetailerPayload, RetailerFormData, buildRetailerFilterPayload } from './Payload';
import { ModalState } from '../Type/type';

export const useRetailerService = () => {
    const [addRetailer, { isLoading: isAdding }] = useAddRetailerMutation();
    const { data: stateList } = useGetStateListQuery();
    
    const [statusModal, setStatusModal] = useState<ModalState>({
        isVisible: false, type: 'success', title: '', message: '',
    });

    const submitRetailer = useCallback(
        async (formData: RetailerFormData, initialData?: any): Promise<boolean> => {
            try {
                const payload = buildRetailerPayload(formData, initialData);
                const response = await addRetailer(payload).unwrap();

                if (response.status || response.success) {
                    setStatusModal({
                        isVisible: true,
                        type: 'success',
                        title: 'Success',
                        message: response.message || (initialData ? 'Retailer Updated Successfully!' : 'Retailer Added Successfully!'),
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
                    message: error?.data?.message || 'Failed to process request.',
                });
                return false;
            }
        },
        [addRetailer]
    );

    const fetchRetailerList = useCallback(
        async (pageNumber: number, pageSize: number, searchQuery: string, parentId: number, filters?: any) => {
            const payload = buildRetailerFilterPayload(pageNumber, pageSize, searchQuery, parentId, filters);
            return payload; // Return payload to be used by the query in the component
        },
        []
    );

    const closeStatusModal = useCallback(() => {
        setStatusModal(prev => ({ ...prev, isVisible: false }));
    }, []);

    return { 
        submitRetailer, 
        fetchRetailerList,
        buildRetailerFilterPayload,
        isLoading: isAdding,
        isAdding, 
        stateList: stateList?.data || [], 
        statusModal, 
        closeStatusModal,
        useGetDistributorUserListQuery // Exporting query for component use
    };
};

export default useRetailerService;
