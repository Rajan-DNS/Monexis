// Top-up Payload Builders - Types are defined in Type/type.ts
import type {
    AddTopUpPayload,
    TopUpFormData,
    TopUpListPayload,
    FundTransferPayload,
    FundTransferFormData,
} from '../Type/type';

export type {
    AddTopUpPayload,
    TopUpFormData,
    TopUpListPayload,
    FundTransferPayload,
    FundTransferFormData,
};

export const buildTopUpPayload = (
    formData: TopUpFormData,
    userId: number,
    roleId: number
): AddTopUpPayload => ({
    id: 0,
    userId: userId,
    roleId: roleId,
    gstTypeId: formData.gstTypeId,
    bankAccountId: formData.bankAccountId,
    amount: Number(formData.amount),
    transferTypeId: formData.transferTypeId,
    paymentDate: formData.paymentDate,
    paymentReferenceNumber: formData.paymentReferenceNumber,
    remark: formData.remark,
    isPullOut: false,
    isApproved: false,
    addedById: userId,
});

export const buildFundTransferPayload = (
    formData: FundTransferFormData,
    fromUserId: number
): FundTransferPayload => ({
    addedById: 0,
    transferUserId: String(formData.retailerId),
    receiveBankId: String(formData.bankId),
    transferTypeId: String(formData.transferTypeId),
    amount: String(formData.amount),
    paymentReferenceNumber: formData.utr,
    paymentDate: formData.paymentDate,
    paymentremark: formData.remark,
});
