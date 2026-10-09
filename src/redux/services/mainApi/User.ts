import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../baseQuery';

export const UserApi = createApi({
    reducerPath: 'UserApi',
    baseQuery,
    tagTypes: ['User', 'Bank', 'Retailer', 'Topup', 'Common'],
    endpoints: () => ({}), // Endpoints will be injected from modular files
});

export default UserApi;
