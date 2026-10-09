import { UserApi } from '../User';
import { REPORT_URLS } from './RepoetURL';

export const ReportApi = UserApi.injectEndpoints({
    endpoints: (builder) => ({
        getRetailerRechargeReport: builder.mutation<any, any>({
            query: (payload) => ({
                url: REPORT_URLS.RETAILER_RECHARGE_REPORT,
                method: 'POST',
                body: payload,
            }),
        }),
        getUserTxnLedgerData: builder.mutation<any, any>({
            query: (payload) => ({
                url: REPORT_URLS.USER_TXN_LEDGER,
                method: 'POST',
                body: payload,
            }),
        }),
        getDistributorUserDayBook: builder.mutation<any, any>({
            queryFn: async (arg, queryApi, extraOptions, fetchWithBQ) => {
                const state = queryApi.getState() as any;
                const role = state?.auth?.user?.role;
                const url = role === 'Distributor' 
                    ? REPORT_URLS.DISTRIBUTOR_USER_DAY_BOOK 
                    : REPORT_URLS.DISTRIBUTOR_DAY_BOOK;
                const result = await fetchWithBQ({
                    url: url,
                    method: 'POST',
                    body: arg,
                });
                return result.data ? { data: result.data } : { error: result.error as any };
            },
        }),
    }),
    overrideExisting: true,
});

export const {
    useGetRetailerRechargeReportMutation,
    useGetUserTxnLedgerDataMutation,
    useGetDistributorUserDayBookMutation,
} = ReportApi;
