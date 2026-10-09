// Retailer Payload Builders - Types are defined in Type/type.ts
import type {
    AddRetailerPayload,
    RetailerFormData,
    RetailerFilterPayload,
    RetailerFilterOptions,
} from '../Type/type';

export type {
    AddRetailerPayload,
    RetailerFormData,
    RetailerFilterPayload,
    RetailerFilterOptions,
};

export const buildRetailerPayload = (
    formData: RetailerFormData,
    initialData?: any
): AddRetailerPayload => ({
    id: initialData?.id || 0,
    fullName: formData.retailerName || '',
    email: formData.email,
    mobileNumber: formData.mobileNumber,
    shopName: formData.shopName,
    stateId: formData.stateId,
    password: formData.password || initialData?.password || '123456',
    registeredAddress: formData.address,
});

export const buildRetailerFilterPayload = (
    pageNumber: number,
    pageSize: number,
    searchQuery: string,
    parentId: number,
    filters?: RetailerFilterOptions
): RetailerFilterPayload => ({
    pageNumber,
    pageSize,
    filter: {
        accountNumber: '',
        accountHolderName: searchQuery,
        ifscCode: '',
        mobileNumber: searchQuery,
        userName: searchQuery,
        shopName: searchQuery,
        lapuNumber: '',
        email: searchQuery,
        recId: 0,
        userId: 0,
        roleId: filters?.roleId || 0,
        statusId: filters?.statusId || 0,
        gstTypeId: 0,
        globalId: 0,
        hubId: 0,
        bankAccountId: 0,
        txnTypeId: 0,
        amountTypeId: 0,
        transferTypeId: 0,
        packageId: 0,
        operatorId: 0,
        operatorTypeId: 0,
        apiId: 0,
        filterTypeId: 0,
        circleId: 0,
        parentId: parentId,
        paymentReferenceNumber: '',
        remark: '',
        dealerId: 0,
        transactionId: 0,
        ourRequestId: '',
        userRequestId: filters?.userRequestId || '',
        fromDate: '',
        toDate: '',
    },
});
