import UserApi from '../../mainApi/User';
import { ELECTRICITY_URLS } from './ElectricityUrl';

// ---------- Payload Types ----------

export type GetOperatorByCirclePayload = {
    circleId: number;
};

export type PayElectricityBillPayload = {
    operatorId: number;
    circleId: number;
    consumerNumber: string;
    amount: number;
};

// ---------- API ----------

export const ElectricityApi = UserApi.injectEndpoints({
    endpoints: (builder) => ({
        /** Step 1 – fetch all circles (no params) */
        getElectricityCircles: builder.query<any, void>({
            query: () => ({
                url: ELECTRICITY_URLS.GET_CIRCLE,
                method: 'GET',
            }),
        }),

        /** Step 2 – fetch operators for a given circleId */
        getElectricityOperatorsByCircle: builder.query<any, GetOperatorByCirclePayload>({
            query: ({ circleId }) => ({
                url: `${ELECTRICITY_URLS.GET_OPERATOR_BY_CIRCLE}${circleId}`,
                method: 'GET',
            }),
        }),

        /** Step 3 – pay the bill */
        payElectricityBill: builder.mutation<any, PayElectricityBillPayload>({
            query: (payload) => ({
                url: ELECTRICITY_URLS.PAY_BILL,
                method: 'POST',
                body: payload,
            }),
        }),
    }),
    overrideExisting: true,
});

export const {
    useLazyGetElectricityCirclesQuery,
    useLazyGetElectricityOperatorsByCircleQuery,
    usePayElectricityBillMutation,
} = ElectricityApi;
