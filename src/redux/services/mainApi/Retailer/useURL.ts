// API URL Constants for User/Retailer Services

export const USER_URLS = {
    // Retailer
    ADD_DISTRIBUTOR_USER: 'User/AddDistributorUser',
    GET_DISTRIBUTOR_USER_LIST: 'User/GetDistributorUserList',

    // Account
    STATE_LIST: 'Account/StateList',
    GET_USER_PROFILE: 'Account/GetUserProfile',
    TRANSFER_TYPE: 'Account/TransferType',
    GET_DROPDOWN: 'Account/GetDropDown',
    GST_TYPE: 'Account/GstType',
    GET_DOWNLINE_USER_LIST: 'Account/GetDownlineUserList',

    // Bank
    BANK_DROPDOWN: 'Bank/BankDropdown',
    ACCOUNT_TYPE: 'Bank/AccountType',
    ADD_UPDATE_BANK_ACCOUNT: 'Bank/AddUpdateBankAccount',
    GET_BANK_ACCOUNT_LIST: 'Bank/GetBankAccountListData',

    // Wallet
    ADD_TOP_UP_REQUEST: 'Wallet/AddTopUpRequest',
    GET_WALLET_REQUEST_DATA: 'Wallet/GetWalletRequestData',
    FUND_TRANSFER_DOWNLINE_USER: 'Wallet/FundTransferDownlineUser',

    FUND_TRANSFER_LIST: 'Wallet/GetFundTransferList',
} as const;

export default USER_URLS;
