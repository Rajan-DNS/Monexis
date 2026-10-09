import { UserApi } from '../User';
import { COMMON_URLS } from './CommonURL';

export const CommonApi = UserApi.injectEndpoints({
    endpoints: (builder) => ({
        getStateList: builder.query<any, void>({
            query: () => ({
                url: COMMON_URLS.STATE_LIST,
                method: 'GET',
            }),
            providesTags: ['Common'],
        }),

        getDistrictList: builder.query<any, number>({
            query: (stateId) => ({
                url: `Account/DistrictList?stateId=${stateId}`,
                method: 'GET',
            }),
            providesTags: ['Common'],
        }),

        getUserProfile: builder.query<any, void>({
            query: () => ({
                url: COMMON_URLS.GET_USER_PROFILE,
                method: 'GET',
            }),
            providesTags: ['Common'],
        }),

        getTransferTypeName: builder.query<any, void>({
            query: () => ({
                url: COMMON_URLS.TRANSFER_TYPE,
                method: "GET"
            }),
            providesTags: ['Common'],
        }),

        getDropDown: builder.query<any, string>({
            query: (remark) => ({
                url: COMMON_URLS.GET_DROPDOWN,
                method: 'GET',
                params: { remark },
            }),
            providesTags: ['Common'],
        }),

        getDropDownGstType: builder.query<any, void>({
            query: () => ({
                url: COMMON_URLS.GST_TYPE,
                method: 'GET',
            }),
            providesTags: ['Common'],
        }),

        getdownlineuserList: builder.query<any, void>({
            query: () => ({
                url: COMMON_URLS.GET_DOWNLINE_USER_LIST,
                method: 'GET',
            }),
            providesTags: ['Common'],
        }),

        getStatusType: builder.query<any, void>({
            query: () => ({
                url: COMMON_URLS.STATUS_TYPE,
                method: 'GET',
            }),
            providesTags: ['Common'],
        }),
        getBankList: builder.query<any, void>({
            query: () => ({
                url: COMMON_URLS.BANK_LIST,
                method: 'GET',
            }),
            providesTags: ['Common'],
        }),
        getcommision: builder.mutation<any, { data?: any } | void>({
            query: (payload) => ({
                url: COMMON_URLS.GET_PACKAGECOMMISSION,
                method: "POST",
                body: payload?.data

            }),

        }),
        getcommisionrang: builder.mutation<any, { data?: any } | void>({
            query: (payload) => ({
                url: COMMON_URLS.GER_COMMISSIONRANG,
                method: "POST",
                body: payload?.data

            }),

        }),
        getuserblance: builder.query<any, void>({
            query: () => ({
                url: COMMON_URLS.GET_USER_BLANCE,
                method: "GET",
            }),
            providesTags: ['Common'],
        }),
        getCircles: builder.query<any, void>({
            query: () => ({
                url: COMMON_URLS.GET_CIRCLE,
                method: 'GET',
            }),
            providesTags: ['Common'],
        }),
        getopretor: builder.query<any, { operatorTypeId: number }>({
            query: ({ operatorTypeId }) => ({
                url: COMMON_URLS.GET_OPRETOR,
                method: 'GET',
                params: { operatorTypeId },
            }),
            providesTags: ['Common'],
        }),
        billinfo: builder.mutation<any, { data?: any } | void>({
            query: (payload) => ({
                url: COMMON_URLS.POST_BILL_INFO,
                method: "POST",
                body: payload?.data
            }),

        }),
        billpay: builder.mutation<any, { data?: any } | void>({
            query: (payload) => ({
                url: COMMON_URLS.POST_BILL_PAY,
                method: "POST",
                body: payload?.data
            }),
        }),
        getOperatorValidationData: builder.query<any, { OperatorId: number;}>({
            query: ({ OperatorId }) => ({
                url: COMMON_URLS.GET_OPERATOR_VALIDATION_DATA,
                method: 'GET',
                params: { OperatorId },
            }),
            providesTags: ['Common'],
        }),

    }),
    overrideExisting: false,
});

export const {
    useGetStateListQuery,
    useGetDistrictListQuery,
    useGetUserProfileQuery,
    useGetTransferTypeNameQuery,
    useGetDropDownQuery,
    useGetDropDownGstTypeQuery,
    useGetdownlineuserListQuery,
    useGetStatusTypeQuery,
    useGetBankListQuery,
    useGetcommisionMutation,
    useGetcommisionrangMutation,
    useGetuserblanceQuery,
    useGetCirclesQuery,
    useGetopretorQuery,
    useBillinfoMutation,
    useBillpayMutation,
    useGetOperatorValidationDataQuery,
} = CommonApi;
