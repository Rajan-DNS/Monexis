// Payload Types & Builders for Bank Services

export interface AddBankAccountPayload {
    id: number;
    bankId: number;
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    branchName: string;
    branchAddress: string;
    remark: string;
    upiAddress: string;
    accountTypeId: number;
}

export interface BankFormData {
    bankAccountId: number;
    bankName: string;
    accountNumber: string;
    upiId: string;
    ifscCode: string;
    accountHolderName: string;
    accountType: string;
    accountTypeId: number;
    branchName: string;
    branchAddress: string;
    upiAddress: string;
    remark: string;
    blockAmount: number;
    mobileNumber: string;
    bankId: number;
    panNumber: string;
    aadharNumber: string;
}

export const buildBankPayload = (
    formData: BankFormData,
    initialData?: any
): AddBankAccountPayload => ({
    id: initialData?.id || 0,
    bankId: formData.bankAccountId || 0,
    accountHolderName: formData.accountHolderName,
    accountNumber: formData.accountNumber,
    ifscCode: formData.ifscCode,
    branchName: formData.branchName,
    branchAddress: formData.branchAddress,
    remark: formData.remark || '',
    upiAddress: formData.upiAddress || '',
    accountTypeId: formData.accountTypeId,
});

// ---- Bank Filter ----

export interface BankFilterFields {
    accountNumber: string;
    accountHolderName: string;
    ifscCode: string;
    mobileNumber: string;
    bankId: number;
    accountTypeId: number;
    statusId: number;
    fromDate: string;
    toDate: string;
}

export interface BankFilterPayload {
    pageNumber: number;
    pageSize: number;
    filter: {
        accountNumber: string;
        accountHolderName: string;
        bankName: string;
        ifscCode: string;
        bankAccountId: number;
        accountTypeId: number;
        statusId: number;
    }
}

export const buildBankFilterPayload = (
    pageNumber: number,
    pageSize: number,
    filterFields: Partial<BankFilterFields>
): BankFilterPayload => {
    return {
        pageNumber,
        pageSize,
        filter: {
            accountNumber: filterFields.accountNumber || '',
            accountHolderName: filterFields.accountHolderName || '',
            bankName: '',
            ifscCode: filterFields.ifscCode || '',
            bankAccountId: Number(filterFields.bankId || 0),
            accountTypeId: Number(filterFields.accountTypeId || 0),
            statusId: Number(filterFields.statusId || 0),

        }
    };
};