import { UserApi } from '../User';
import { KYC_URL } from './kycurl';

export interface SendOtpRequest {
  emailId?: string;
  mobileNumber?: string;
}

export interface VerifyOtpRequest {
  type: 'EMAIL' | 'MOBILE';
  emailId?: string;
  emailOtp?: string;
  mobileNumber?: string;
  mobileOtp?: string;
}

export interface PanVerificationRequest {
  PanCardNumber: string;
  KycType: string;
  PanCardImage: any; // File/Image
}

export interface PanVerificationPayload {
  panCardNumber: string;
  kycType: string;
  formData: FormData;
}

export interface AadhaarVerificationPayload {
  aadhaarNumber: string;
  formData: FormData;
}

export interface GstVerificationPayload {
  gstNumber: string;
  kycType: string;
  formData: FormData;
}

export interface OtpResponse {
  success: boolean;
  message: string;
  data?: any;
}
// Exact shape from GET /User/GetUserKycDetails
export interface KycDocument {
  documentTypeName: string;
  documentTypeId: number; // 2=PAN, 3=Email, 4=Mobile, 5=Aadhaar, 6=GST
  documentNumber: string;
  holderName: string;
  documentAddress: string;
  frontImage: string;
  backImage: string;
  isApproved: boolean;
}

export interface KycDetailsResponse {
  success: boolean;
  message?: string;
  data: KycDocument[];
}

export interface KycDocumentReportRequest {
  pageNumber: number;
  pageSize: number;
  filter: {
    isApproved: number;
    userId: number;
  };
}

export interface KycDocumentReportItem {
  id: number;
  documentTypeId: number;
  documentTypeName: string;
  documentNumber: string;
  documentAddress: string;
  holderName: string;
  frontImage: string;
  backImage: string;
  orgName: string;
  isKycApproved: boolean;
  isApproved: boolean;
}

export interface KycDocumentReportResponse {
  success: boolean;
  message: string;
  count: number;
  data: KycDocumentReportItem[];
}

export const KycService = UserApi.injectEndpoints({
  endpoints: (builder) => ({
    sendEmailOtp: builder.mutation<OtpResponse, string>({
      query: (emailId) => ({
        url: KYC_URL.SEND_EMAIL_OTP(emailId),
        method: 'GET',
      }),
      invalidatesTags: ['User'],
    }),

    sendMobileOtp: builder.mutation<OtpResponse, string>({
      query: (mobileNumber) => ({
        url: KYC_URL.SEND_MOBILE_OTP(mobileNumber),
        method: 'GET',
      }),
      invalidatesTags: ['User'],
    }),

    verifyOtp: builder.mutation<OtpResponse, VerifyOtpRequest>({
      query: (body) => ({
        url: KYC_URL.OTP_VERIFICATION,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['User'],
    }),

    panVerification: builder.mutation<OtpResponse, PanVerificationPayload>({
      query: ({ panCardNumber, kycType, formData }) => ({
        url: KYC_URL.PAN_VERIFICATION(panCardNumber, kycType),
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['User'],
    }),

    aadhaarVerification: builder.mutation<OtpResponse, AadhaarVerificationPayload>({
      query: ({ aadhaarNumber, formData }) => ({
        url: KYC_URL.aadHAAR_VERIFICATION(aadhaarNumber),
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['User'],
    }),
    getUserKycDetails: builder.mutation<KycDetailsResponse, void>({
      query: () => ({
        url: 'User/GetUserKycDetails',
        method: 'POST',
      }),
    }),
    gstVerification: builder.mutation<OtpResponse, GstVerificationPayload>({
      query: ({ gstNumber, kycType, formData }) => ({
        url: KYC_URL.GST_VERIFICATION(gstNumber, kycType),
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['User'],
    }),
    kycDocumentReport: builder.mutation<KycDocumentReportResponse, KycDocumentReportRequest>({
      query: (data) => ({
        url: KYC_URL.KYC_documentReport,
        method: "POST",
        body: data,
      }),
    }),
    kycChecker: builder.query({
      query: () => ({
        url: KYC_URL.KYC_Checker,
        method: "GET",
      })
    })
  }),

  overrideExisting: false,
});

export const {
  useSendEmailOtpMutation,
  useSendMobileOtpMutation,
  useVerifyOtpMutation,
  usePanVerificationMutation,
  useAadhaarVerificationMutation,
  useGetUserKycDetailsMutation,
  useGstVerificationMutation,
  useKycDocumentReportMutation,
  useKycCheckerQuery
} = KycService;
