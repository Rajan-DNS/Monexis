// Server Response Types for Auth Services

export interface AuthResponseData {
    id: number;
    userName: string;
    email: string;
    roleId: number;
    roleName: string;
    orgName: string;
    parentId?: number;
    p2PBalance: number;
    mobileNumber: string;
    // Add other fields as per API response
}

export interface AuthResponse {
    status: boolean;
    message: string;
    token: string;
    data: AuthResponseData;
}

export interface CommonResponse {
    status: boolean;
    message: string;
}

export interface SignUpShowResponse extends CommonResponse {
    success?: boolean;
    data?: {
        showSignUp: boolean;
    };
}
