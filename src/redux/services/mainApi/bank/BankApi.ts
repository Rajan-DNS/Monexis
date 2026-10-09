import { UserApi } from '../User';
import { BANK_URLS } from './BankURL';

export const BankApi = UserApi.injectEndpoints({
    endpoints: (builder) => ({
        getBankDropdown: builder.query<any, void>({
            query: () => ({
                url: BANK_URLS.BANK_DROPDOWN,
                method: 'GET',
            }),
            providesTags: ['Bank'],
        }),

        getAccountType: builder.query<any, void>({
            query: () => ({
                url: BANK_URLS.ACCOUNT_TYPE,
                method: 'GET',
            }),
            providesTags: ['Bank'],
        }),

        addBankAccount: builder.mutation<any, any>({
            query: (data) => ({
                url: BANK_URLS.ADD_UPDATE_BANK_ACCOUNT,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['Bank'],
        }),

        getBankAccountList: builder.mutation<any, any>({
            query: (data) => ({
                url: BANK_URLS.GET_BANK_ACCOUNT_LIST,
                method: 'POST',
                body: data,
            }),
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetBankDropdownQuery,
    useGetAccountTypeQuery,
    useAddBankAccountMutation,
    useGetBankAccountListMutation,
} = BankApi;
