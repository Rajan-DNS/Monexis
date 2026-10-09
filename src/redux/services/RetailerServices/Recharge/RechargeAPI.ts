import UserApi from '../../mainApi/User';
import { GetRechargeDataPayload, PayRechargePayload } from './RechargePayload';
import { RECHARGE_URLS } from './rechargeURL';

export const RechargeApi = UserApi.injectEndpoints({
    endpoints: (builder) => ({
        getRechargeData: builder.mutation<any, GetRechargeDataPayload>({
            query: (payload) => ({
                // Pass mobileNumber as the query parameter
                url: `${RECHARGE_URLS.GET_RECHARGE_DATA}?mobileNumber=${payload.mobileNumber}`,
                method: 'GET',
            }),
        }),
        getRechargeOfffers: builder.mutation<any, GetRechargeDataPayload>({
            query: (payload) => ({
                url: `${RECHARGE_URLS.GET_RECHARGE_OFFERS}?mobileNumber=${payload.mobileNumber}`,
                method: 'GET',
            })
        }),
        getCircle: builder.query<any, void>({
            query: () => ({
                url: RECHARGE_URLS.GET_CIRCLE,
                method: 'GET',
            })
        }),
        getOperator: builder.query<any, { operatorTypeId: number }>({
            query: (payload) => ({
                url: `${RECHARGE_URLS.GET_RECHARGE_OPERATOR}?operatorTypeId=${payload.operatorTypeId}`,
                method: 'GET',
            })
        }),

        payRecharge: builder.mutation<any, PayRechargePayload>({
            query: (payload) => ({
                url: RECHARGE_URLS.RECHARGE_REQUEST,
                method: 'POST',
                body: payload,
            })
        })

    }),
    overrideExisting: true,
});

export const {
    useGetRechargeDataMutation,
    useGetRechargeOfffersMutation,
    useLazyGetCircleQuery,
    useLazyGetOperatorQuery,
    usePayRechargeMutation,

} = RechargeApi;