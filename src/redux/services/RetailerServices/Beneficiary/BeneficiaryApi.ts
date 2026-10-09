
import UserApi from '../../mainApi/User';
import { BENEFICIARY_URLS } from './BeneficiaryURL';


export const BeneficiaryApi = UserApi.injectEndpoints({
    endpoints: (builder) => ({
        addUpdateBeneficiary: builder.mutation<any, any>({
            query: (payload) => ({
                url: BENEFICIARY_URLS.ADD_UPDATE_BENEFICIARY,
                method: 'POST',
                body: payload,
            }),
        }),
        getBeneficiaryList: builder.mutation<any, any>({
            query: (payload) => ({
                url: BENEFICIARY_URLS.GET_BENEFICIARY_LIST,
                method: 'POST',
                body: payload,
            }),
        }),
        updateBeneficiaryStatus: builder.mutation<any, any>({
            query: (payload) => ({
                url: BENEFICIARY_URLS.UPDATE_BENEFICIARY_STATUS,
                method: 'POST',
                body: payload,
            }),
        }),
        dmtPayRequest: builder.mutation<any, any>({
            query: (payload) => ({
                url: BENEFICIARY_URLS.DMT_PAY_REQUEST,
                method: 'POST',
                body: payload,
            }),
        }),
        getDMTPayData: builder.mutation<any, any>({
            query: (payload) => ({
                url: BENEFICIARY_URLS.GET_DMT_PAY_DATA,
                method: 'POST',
                body: payload,
            }),
        }),
    }),
    overrideExisting: true,
});

export const {
    useAddUpdateBeneficiaryMutation,
    useGetBeneficiaryListMutation,
    useUpdateBeneficiaryStatusMutation,
    useDmtPayRequestMutation,
    useGetDMTPayDataMutation,
} = BeneficiaryApi;
