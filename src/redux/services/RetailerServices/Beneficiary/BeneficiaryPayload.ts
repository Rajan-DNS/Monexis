
export interface buildBeneficiaryPayload {
  id?: number;
  accountNumber: string;
  ifscCode: string;
  mobileNumber: string;
  bankId: number;
  bankAccountId?: number;
  accountHolderName: string;
  aadharNumber: string;
  panNumber: string;
  text?: string; // Optional text field for dropdown display
}

export interface UpdateBeneficiaryPayload {
  id: number;
  mobileNumber: string;
  bankId: number;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  aadharNumber: string;
  panNumber: string;
}

export interface DeleteBeneficiaryPayload {
  id: number;
  isDelete: boolean;
}

export interface GetBeneficiaryFilterPayload {
  accountNumber?: string;
  accountHolderName?: string;
  ifscCode?: string;
  mobileNumber?: string;
}

export interface DMTPayRequestPayload {
  beneficiaryId: number;
  mediumId: number;
  amount: number;
  transferType: string;
  deviceInfo: string;
  locationInfo: string | null;
}

export interface GetDMTPayDataPayload {
  pageNumber: number;
  pageSize: number;
  filter: {
    accountNumber?: string;
    accountHolderName?: string;
    beneficiaryId?: number;
    statusId?: number;
    fromDate?: string;
    toDate?: string;
  };
}

export const buildBeneficiaryPayload = (
  formData: any,
) => {
  return {
    id: formData.id || 0,
    accountNumber: formData.accountNumber,
    ifscCode: formData.ifscCode,
    mobileNumber: formData.mobileNumber,
    bankId: formData.bankId || formData.bankAccountId || 0,
    accountHolderName: formData.accountHolderName,
    aadharNumber: formData.aadharNumber,
    panNumber: formData.panNumber,
  };
};

export const buildUpdateBeneficiaryPayload = (
  id: number,
  formData: any,
): UpdateBeneficiaryPayload => {
  return {
    id,
    mobileNumber: formData.mobileNumber,
    bankId: formData.bankId || formData.bankAccountId || 0,
    accountNumber: formData.accountNumber,
    ifscCode: formData.ifscCode,
    accountHolderName: formData.accountHolderName,
    aadharNumber: formData.aadharNumber,
    panNumber: formData.panNumber,
  };
};

export const buildDeleteBeneficiaryPayload = (
  id: number,
): DeleteBeneficiaryPayload => {
  return {
    id,
    isDelete: true,
  };
};

export const buildGetBeneficiaryFilterPayload = (
  filters?: GetBeneficiaryFilterPayload,
) => {
  return {
    accountNumber: filters?.accountNumber || '',
    accountHolderName: filters?.accountHolderName || '',
    ifscCode: filters?.ifscCode || '',
    mobileNumber: filters?.mobileNumber || '',
  };
};

export const buildDMTPayRequestPayload = (
  data: DMTPayRequestPayload,
): DMTPayRequestPayload => {
  return {
    beneficiaryId: data.beneficiaryId,
    mediumId: data.mediumId,
    amount: data.amount,
    transferType: data.transferType,
    deviceInfo: data.deviceInfo,
    locationInfo: data.locationInfo,
  };
};

export const buildGetDMTPayDataPayload = (
  pageNumber: number,
  pageSize: number,
  filters?: GetDMTPayDataPayload['filter'],
): GetDMTPayDataPayload => {
  return {
    pageNumber,
    pageSize,
    filter: {
      accountNumber: filters?.accountNumber || '',
      accountHolderName: filters?.accountHolderName || '',
      beneficiaryId: filters?.beneficiaryId || 0,
      statusId: filters?.statusId || 0,
      fromDate: filters?.fromDate || '',
      toDate: filters?.toDate || '',
    },
  };
};
