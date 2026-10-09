export const KYC_URL = {
  SEND_EMAIL_OTP: (emailId: string) => `User/SendOtpToEmail?EmailId=${emailId}`,
  SEND_MOBILE_OTP: (mobileNumber: string) => `User/SendKycOTP?MobileNumber=${mobileNumber}`,
  OTP_VERIFICATION: 'User/OTPVerification',
  PAN_VERIFICATION: (panCardNumber: string, kycType?: string) =>
    kycType
      ? `User/PanVerification?PanCardNumber=${panCardNumber}&KycType=${kycType}`
      : `User/PanVerification?PanCardNumber=${panCardNumber}&KycType=Beneficiary`,
  aadHAAR_VERIFICATION: (aadhaarNumber: string) =>
    `User/AadhaarVerification?AadhaarNumber=${aadhaarNumber}`,
  GET_USER_KYC_DETAILS: `User/GetUserKycDetails`,
  GST_VERIFICATION: (gstNumber: string, kycType: string) => `User/GstVerification?GstNumber=${gstNumber}&KycType=${kycType}`,
  KYC_documentReport: 'User/KycDocumentReport',
  KYC_Checker: 'User/CheckDMTKYCOnApp'
}