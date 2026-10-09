// =============================================
// CENTRAL TYPE DEFINITIONS
// All shared interfaces and types go here.
// =============================================

// ─── COMMON / UI ────────────────────────────

export interface ModalState {
    isVisible: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
}

export interface DropdownOption {
    value: number;
    text: string;
}

export interface PaginatedFilter {
    pageNumber: number;
    pageSize: number;
    filter: Record<string, any>;
}

// ─── AUTH ────────────────────────────────────

export enum UserRole {
    ADMIN = 'admin',
    DISTRIBUTOR = 'distributor',
    RETAILER = 'retailer',
}

export interface UserIdentity {
    id: number;
    name: string;
    orgName: string;
    roleName: string;
    email: string;
    phone: string;
    role: string;
    roleId: number;
    parentId?: number;
    p2PBalance: number;
    isKycApproved: boolean;
}

export interface SignInPayload {
    userName: string;
    passWord: string;
    isOTP: boolean;
    otp: string;
}

export interface SendOTPPayload {
    MobileNumber: string;
    email?: string;
}

export interface ForgotPasswordPayload {
    mobileNumber: string;
}

export interface ChangePasswordPayload {
    oldPassword: string;
    newPassword: string;
    addedById?: number;
}

// ─── TOP-UP SERVICE ──────────────────────────

export interface AddTopUpPayload {
    id: number;
    userId: number;
    roleId: number;
    gstTypeId: number;
    bankAccountId: number;
    amount: number;
    transferTypeId: number;
    paymentDate: string;
    paymentReferenceNumber: string;
    remark: string;
    isPullOut: boolean;
    isApproved: boolean;
    addedById: number;
}

export interface TopUpFormData {
    amount: string;
    paymentDate: string;
    paymentReferenceNumber: string;
    remark: string;
    bankAccountId: number;
    transferTypeId: number;
    gstTypeId: number;
}

export interface TopUpListPayload {
    pageIndex: number;
    pageSize: number;
    search: string;
    addedById: number;
}

export interface FundTransferPayload {
    addedById: number;
    transferUserId: string;
    receiveBankId: string;
    transferTypeId: string;
    amount: string;
    paymentReferenceNumber: string;
    paymentDate: string;
    paymentremark: string;
}

export interface FundTransferFormData {
    retailerId: number;
    bankId: number;
    transferTypeId: number;
    amount: string;
    utr: string;
    paymentDate: string;
    remark: string;
}

// ─── RETAILER ────────────────────────────────

export interface AddRetailerPayload {
    id: number;
    fullName: string;
    email: string;
    mobileNumber: string;
    shopName: string;
    stateId: number;
    password: string;
    registeredAddress: string;
}

export interface RetailerFormData {
    retailerName: string;
    shopName: string;
    mobileNumber: string;
    email: string;
    password: string;
    address: string;
    stateId: number;
}

export interface RetailerFilterOptions {
    roleId?: number;
    userRequestId?: string;
    statusId?: number;
}

export interface RetailerFilter {
    accountNumber: string;
    accountHolderName: string;
    ifscCode: string;
    mobileNumber: string;
    userName: string;
    shopName: string;
    lapuNumber: string;
    email: string;
    recId: number;
    userId: number;
    roleId: number;
    statusId: number;
    gstTypeId: number;
    globalId: number;
    hubId: number;
    bankAccountId: number;
    txnTypeId: number;
    amountTypeId: number;
    transferTypeId: number;
    packageId: number;
    operatorId: number;
    operatorTypeId: number;
    apiId: number;
    filterTypeId: number;
    circleId: number;
    parentId: number;
    paymentReferenceNumber: string;
    remark: string;
    dealerId: number;
    transactionId: number;
    ourRequestId: string;
    userRequestId: string;
    fromDate: string;
    toDate: string;
}

export interface RetailerFilterPayload {
    pageNumber: number;
    pageSize: number;
    filter: RetailerFilter;
}

// ─── REPORT ──────────────────────────────────

export interface ReportFilter {
    userId: number;
    fromDate: string;
    toDate: string;
    statusId?: number;
    searchQuery?: string;
    [key: string]: any;
}

export interface ReportPayload {
    pageNumber: number;
    pageSize: number;
    filter: ReportFilter;
}

export interface DayBookFilter {
    userId: number;
    fromDate: string;
    toDate: string;
    searchQuery?: string;
    [key: string]: any;
}

export interface DayBookPayload {
    pageNumber: number;
    pageSize: number;
    filter: DayBookFilter;
}
