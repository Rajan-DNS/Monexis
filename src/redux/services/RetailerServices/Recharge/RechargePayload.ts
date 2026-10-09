export type GetRechargeDataPayload = {
    mobileNumber: string;
};

export type PayRechargePayload = {
    operatorId: number;
    mediumId: number;
    amount: number;
    rechargePin: string;
    rechargeNumber: string;
    deviceInfo: string;
    locationinfo: { latitude: number; longitude: number } | null | string;
    addedById: number;
    
};


export const buildGetRechargeDataPayload = (
    mobileNumber: string,
): GetRechargeDataPayload => {
    return {
        mobileNumber: mobileNumber,
    };
};