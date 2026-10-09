import { UserApi } from '../User';
import { TOPUP_URLS } from './TopupURL';

export const TopupApi = UserApi.injectEndpoints({
    endpoints: (builder) => ({
        addTopUp: builder.mutation<any, any>({
            query: (data) => ({
                url: TOPUP_URLS.ADD_TOP_UP_REQUEST,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Topup'],
        }),

        getTopUpList: builder.mutation<any, any>({
            query: (data) => ({
                url: TOPUP_URLS.GET_WALLET_REQUEST_DATA,
                method: 'POST',
                body: data,
            }),
        }),

        fundTransferDownlineUser: builder.mutation<any, any>({
            query: (data) => ({
                url: TOPUP_URLS.FUND_TRANSFER_DOWNLINE_USER,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Topup'],
        }),

        getFundTransferList: builder.mutation<any, any>({
            query: (data) => ({
                url: TOPUP_URLS.FUND_TRANSFER_LIST,
                method: 'POST',
                body: data,
            }),
        }),
        ParentBankAccountData: builder.mutation<any, any>({
            query: (data) => ({
                url: TOPUP_URLS.PARENT_BANK_ACCOUNT_DATA,
                method: 'POST',
                body: data,
            }),
        }),
    }),
    overrideExisting: false,
});

export const {
    useAddTopUpMutation,
    useGetTopUpListMutation,
    useFundTransferDownlineUserMutation,
    useGetFundTransferListMutation,
    useParentBankAccountDataMutation
} = TopupApi;
