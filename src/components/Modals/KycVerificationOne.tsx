import React, { useState, useRef, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    NativeSyntheticEvent,
    TextInputKeyPressEventData,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors, Spacing } from '../../theme';
import { Poppins } from '../../theme/typography';
import LinearGradient from 'react-native-linear-gradient';

interface KycVerificationOneProps {
    visible: boolean;
    onClose: () => void;
    onVerify: (data: KycData) => void;
}

export interface KycData {
    panNumber: string;
    mobileNumber: string;
    aadhaarNumber: string;
    emailAddress: string;
}

type VerificationStep = 'MOBILE' | 'MOBILE_OTP' | 'AADHAAR' | 'AADHAAR_OTP' | 'PAN' | 'PAN_OTP' | 'EMAIL' | 'EMAIL_OTP';

// --- Reusable 6-Digit Split OTP Input Component ---
interface SplitOtpInputProps {
    value: string;
    onChange: (code: string) => void;
    length?: number;
}

const SplitOtpInput: React.FC<SplitOtpInputProps> = ({ value, onChange, length = 6 }) => {
    const inputsRef = useRef<Array<TextInput | null>>([]);
    const [focusedIndex, setFocusedIndex] = useState<number>(0);

    // Create OTP array without spaces
    const otpArray = Array.from({ length }, (_, index) => value[index] || '');

    useEffect(() => {
        inputsRef.current[0]?.focus();
    }, []);

    const handleTextChange = (text: string, index: number) => {
        const cleanedText = text.replace(/[^0-9]/g, '').slice(-1);

        const updatedOtpArray = [...otpArray];
        updatedOtpArray[index] = cleanedText;

        onChange(updatedOtpArray.join(''));

        // Move to next input
        if (cleanedText && index < length - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (
        e: NativeSyntheticEvent<TextInputKeyPressEventData>,
        index: number
    ) => {
        if (e.nativeEvent.key !== 'Backspace') {
            return;
        }

        const updatedOtpArray = [...otpArray];

        if (!otpArray[index] && index > 0) {
            updatedOtpArray[index - 1] = '';
            onChange(updatedOtpArray.join(''));
            inputsRef.current[index - 1]?.focus();
        } else {
            updatedOtpArray[index] = '';
            onChange(updatedOtpArray.join(''));
        }
    };



    return (
        <View style={{ width: '100%' }}>
            <View style={otpStyles.otpContainer}>
                {Array.from({ length }).map((_, index) => (
                    <TextInput
                        key={index}
                        ref={(ref) => (inputsRef.current[index] = ref)}
                        style={[
                            otpStyles.otpBox,
                            otpArray[index] !== ' ' && otpStyles.otpBoxActive,
                            focusedIndex === index && otpStyles.otpBoxFocused
                        ]}
                        keyboardType="number-pad"
                        maxLength={1}
                        value={otpArray[index] === ' ' ? '' : otpArray[index]}
                        onChangeText={(text) => handleTextChange(text, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        onFocus={() => setFocusedIndex(index)}
                        textAlign="center"
                        selectTextOnFocus
                    />
                ))}
            </View>


        </View>
    );
};

// --- Main KYC Verification Component ---
const KycVerificationOne: React.FC<KycVerificationOneProps> = ({
    visible,
    onClose,
    onVerify,
}) => {
    const [currentStep, setCurrentStep] = useState<VerificationStep>('MOBILE');
    const [formData, setFormData] = useState<KycData>({
        panNumber: '',
        mobileNumber: '',
        aadhaarNumber: '',
        emailAddress: '',
    });

    const [mobileOtp, setMobileOtp] = useState('');
    const [aadhaarOtp, setAadhaarOtp] = useState('');
    const [panOtp, setPanOtp] = useState('');
    const [emailOtp, setEmailOtp] = useState('');

    const resetOtpStates = () => {
        setMobileOtp('');
        setAadhaarOtp('');
        setPanOtp('');
        setEmailOtp('');
    };

    const handleInputChange = (key: keyof KycData, value: string) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleNextStep = () => {
        switch (currentStep) {
            case 'MOBILE':
                if (formData.mobileNumber.trim().length >= 10) setCurrentStep('MOBILE_OTP');
                break;
            case 'MOBILE_OTP':
                if (mobileOtp.trim().length === 6) setCurrentStep('AADHAAR');
                break;
            case 'AADHAAR':
                if (formData.aadhaarNumber.trim().length === 12) setCurrentStep('AADHAAR_OTP');
                break;
            case 'AADHAAR_OTP':
                if (aadhaarOtp.trim().length === 6) setCurrentStep('PAN');
                break;
            case 'PAN':
                if (formData.panNumber.trim().length === 10) setCurrentStep('PAN_OTP');
                break;
            case 'PAN_OTP':
                if (panOtp.trim().length === 6) setCurrentStep('EMAIL');
                break;
            case 'EMAIL':
                if (formData.emailAddress.includes('@')) setCurrentStep('EMAIL_OTP');
                break;
            case 'EMAIL_OTP':
                if (emailOtp.trim().length === 6) {
                    onVerify(formData);
                }
                break;
            default:
                break;
        }
    };

    const handleBackStep = () => {
        resetOtpStates();
        switch (currentStep) {
            case 'MOBILE_OTP': setCurrentStep('MOBILE'); break;
            case 'AADHAAR': setCurrentStep('MOBILE_OTP'); break;
            case 'AADHAAR_OTP': setCurrentStep('AADHAAR'); break;
            case 'PAN': setCurrentStep('AADHAAR_OTP'); break;
            case 'PAN_OTP': setCurrentStep('PAN'); break;
            case 'EMAIL': setCurrentStep('PAN_OTP'); break;
            case 'EMAIL_OTP': setCurrentStep('EMAIL'); break;
            default: onClose(); break;
        }
    };

    const getStepMeta = () => {
        switch (currentStep) {
            case 'MOBILE':
                return { title: 'Mobile Verification', sub: 'Enter your phone number to receive a verification OTP code.', progress: 0.125 };
            case 'MOBILE_OTP':
                return { title: 'Verify Mobile OTP', sub: 'Enter the 6-digit verification code sent to your mobile device.', progress: 0.25 };
            case 'AADHAAR':
                return { title: 'Aadhaar Verification', sub: 'Please enter your unique 12-digit identification reference.', progress: 0.375 };
            case 'AADHAAR_OTP':
                return { title: 'Verify Aadhaar OTP', sub: 'Enter the secure dynamic 6-digit OTP dispatched to your linked mobile number.', progress: 0.5 };
            case 'PAN':
                return { title: 'PAN Validation', sub: 'Enter your 10-character alphanumeric Permanent Account Number.', progress: 0.625 };
            case 'PAN_OTP':
                return { title: 'Verify PAN OTP', sub: 'Enter the 6-digit authentication code sent to your income tax registered contact.', progress: 0.75 };
            case 'EMAIL':
                return { title: 'Email Registration', sub: 'Provide your communication email address context to continue.', progress: 0.875 };
            case 'EMAIL_OTP':
                return { title: 'Verify Email OTP', sub: 'Enter the 6-digit transaction verification code received in your email inbox.', progress: 1.0 };
        }
    };

    const stepMeta = getStepMeta();

    return (
        <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={handleBackStep}>
            <View style={styles.modalOverlay}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.popupCard}>

                    {/* Header Context Frame */}
                    <LinearGradient
                        colors={[Colors.primaryDark || '#002266', Colors.primary || '#003399']}
                        style={styles.headerContainer}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <TouchableOpacity style={styles.backButton} onPress={handleBackStep} activeOpacity={0.7}>
                            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
                        </TouchableOpacity>

                        <View style={styles.iconCircle}>
                            <MaterialCommunityIcons name="shield-account" size={28} color="#FFFFFF" />
                        </View>
                        <Text style={styles.headerTitle}>{stepMeta.title}</Text>
                        <Text style={styles.headerSubtitle}>{stepMeta.sub}</Text>

                        {/* Progress Track */}
                        <View style={styles.progressBarWrapper}>
                            <View style={[styles.progressBarFill, { width: `${stepMeta.progress * 100}%` }]} />
                        </View>
                    </LinearGradient>

                    {/* Central Core Form Interface Frame */}
                    <ScrollView
                        style={styles.formContainer}
                        contentContainerStyle={styles.formContentContainer}
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                    >
                        {currentStep === 'MOBILE' && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Mobile Number</Text>
                                <View style={styles.inputWrapper}>
                                    <MaterialCommunityIcons name="cellphone" size={22} color="#9E9E9E" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="+91 00000 00000"
                                        placeholderTextColor="#C4C4C4"
                                        keyboardType="phone-pad"
                                        value={formData.mobileNumber}
                                        onChangeText={(text) => handleInputChange('mobileNumber', text)}
                                    />
                                </View>
                            </View>
                        )}

                        {currentStep === 'MOBILE_OTP' && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Enter Mobile OTP</Text>
                                <SplitOtpInput value={mobileOtp} onChange={setMobileOtp} length={6} />
                            </View>
                        )}

                        {currentStep === 'AADHAAR' && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Aadhaar Number</Text>
                                <View style={styles.inputWrapper}>
                                    <MaterialCommunityIcons name="fingerprint" size={22} color="#9E9E9E" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="XXXX XXXX XXXX"
                                        placeholderTextColor="#C4C4C4"
                                        keyboardType="number-pad"
                                        maxLength={12}
                                        value={formData.aadhaarNumber}
                                        onChangeText={(text) => handleInputChange('aadhaarNumber', text)}
                                    />
                                </View>
                            </View>
                        )}

                        {currentStep === 'AADHAAR_OTP' && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Enter Aadhaar OTP</Text>
                                <SplitOtpInput value={aadhaarOtp} onChange={setAadhaarOtp} length={6} />
                            </View>
                        )}

                        {currentStep === 'PAN' && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>PAN Number</Text>
                                <View style={styles.inputWrapper}>
                                    <MaterialCommunityIcons name="card-account-details-outline" size={22} color="#9E9E9E" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="ABCDE1234F"
                                        placeholderTextColor="#C4C4C4"
                                        autoCapitalize="characters"
                                        maxLength={10}
                                        value={formData.panNumber}
                                        onChangeText={(text) => handleInputChange('panNumber', text)}
                                    />
                                </View>
                            </View>
                        )}

                        {currentStep === 'PAN_OTP' && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Enter PAN Verification OTP</Text>
                                <SplitOtpInput value={panOtp} onChange={setPanOtp} length={6} />
                            </View>
                        )}

                        {currentStep === 'EMAIL' && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Email Address</Text>
                                <View style={styles.inputWrapper}>
                                    <MaterialCommunityIcons name="email-outline" size={22} color="#9E9E9E" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="example@domain.com"
                                        placeholderTextColor="#C4C4C4"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        value={formData.emailAddress}
                                        onChangeText={(text) => handleInputChange('emailAddress', text)}
                                    />
                                </View>
                            </View>
                        )}

                        {currentStep === 'EMAIL_OTP' && (
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Enter Email OTP</Text>
                                <SplitOtpInput value={emailOtp} onChange={setEmailOtp} length={6} />
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.primaryButton, { backgroundColor: Colors.primaryDark || '#002266' }]}
                            onPress={handleNextStep}
                        >
                            <Text style={styles.primaryButtonText}>
                                {currentStep === 'EMAIL_OTP' ? 'Complete Verification' : 'Continue'}
                            </Text>
                            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={styles.buttonArrow} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>Cancel & Exit</Text>
                        </TouchableOpacity>
                    </ScrollView>

                    {/* Secure Encrypted Guard Label */}
                    <View style={styles.footerSecure}>
                        <MaterialCommunityIcons name="shield-check-outline" size={14} color="#00875A" />
                        <Text style={styles.footerSecureText}>Your data is encrypted safely</Text>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

// --- Styles specifically optimized for Split Inputs ---
const otpStyles = StyleSheet.create({
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 10,
        width: '100%',
    },
    otpBox: {
        width: 44,
        height: 52,
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        backgroundColor: '#FAFAFA',
        fontSize: 16,
        color: '#333333',
        fontFamily: Poppins.semiBold,
    },
    otpBoxActive: {
        borderColor: '#777777',
        backgroundColor: '#FFFFFF',
    },
    otpBoxFocused: {
        borderColor: '#003399',
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
    },
    uiDeleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-end',
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginTop: 2,
    },
    uiDeleteButtonText: {
        color: '#FF3B30',
        fontSize: 12,
        fontFamily: Poppins.semiBold,
        marginLeft: 4,
    }
});

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    popupCard: {
        height: '68%',
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    headerContainer: {
        paddingTop: 24,
        paddingBottom: 16,
        paddingHorizontal: 24,
        alignItems: 'center',
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 16,
        zIndex: 10,
        padding: 4,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: Poppins.bold,
        marginBottom: 4,
    },
    headerSubtitle: {
        color: 'rgba(255, 255, 255, 0.85)',
        fontSize: 12,
        fontFamily: Poppins.regular,
        textAlign: 'center',
        lineHeight: 16,
        paddingHorizontal: 12,
        marginBottom: 12,
    },
    progressBarWrapper: {
        width: '100%',
        height: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#FFFFFF',
    },
    formContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    formContentContainer: {
        paddingVertical: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 12,
        fontFamily: Poppins.semiBold,
        color: '#333333',
        marginBottom: 6,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        height: 48,
        paddingHorizontal: 12,
        backgroundColor: '#FAFAFA',
    },
    inputIcon: {
        marginRight: 8,
    },
    textInput: {
        flex: 1,
        color: '#333333',
        fontSize: 16,
        fontFamily: Poppins.regular,
    },
    primaryButton: {
        flexDirection: 'row',
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: Poppins.bold,
    },
    buttonArrow: {
        marginLeft: 6,
    },
    cancelButton: {
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        backgroundColor: '#FFFFFF',
    },
    cancelButtonText: {
        color: '#777777',
        fontSize: 16,
        fontFamily: Poppins.semiBold,
    },
    footerSecure: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderColor: '#F0F0F0',
        backgroundColor: '#F9FBF9',
    },
    footerSecureText: {
        color: '#444444',
        fontSize: 12,
        fontFamily: Poppins.medium,
        marginLeft: 4,
        fontWeight: '500',
    },
});

export default KycVerificationOne;