import { UserApi } from '../User';
import { RETAILER_URLS } from './RetailerURL';

export const RetailerApi = UserApi.injectEndpoints({
    endpoints: (builder) => ({
        addRetailer: builder.mutation<any, any>({
            query: (data) => ({
                url: RETAILER_URLS.ADD_DISTRIBUTOR_USER,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Retailer'],
        }),

        getDistributorUserList: builder.query<any, any>({
            query: (data) => ({
                url: RETAILER_URLS.GET_DISTRIBUTOR_USER_LIST,
                method: 'POST',
                body: data,
            }),
            providesTags: ['Retailer'],
        }),
    }),
    overrideExisting: false,
});

export const {
    useAddRetailerMutation,
    useGetDistributorUserListQuery,
} = RetailerApi;
