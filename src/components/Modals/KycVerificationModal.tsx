import React, { useState, useRef, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    StyleSheet, View, Text, TextInput, TouchableOpacity,
    Modal, ScrollView, KeyboardAvoidingView, Platform,
    ActivityIndicator, NativeSyntheticEvent, TextInputKeyPressEventData,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '../../theme';
import { Poppins } from '../../theme/typography';
import { Dimensions as ThemeDimensions, Spacing, Radius, FontSize } from '../../theme/spacing';
import {
    useGetUserKycDetailsMutation,
    useSendEmailOtpMutation,
    useSendMobileOtpMutation,
    useVerifyOtpMutation,
    KycDocument,
} from '../../redux/services/mainApi/KYC/KycService';
import PanVerificationModal from './PanVerificationModal';
import AadhaarVerificationModal from './AadhaarVerificationModal';
import GstVerificationModal from './GstVerificationModal';
import CustomAlertModal from './CustomAlertModal';
import { useCustomAlert } from '../../hooks/useCustomAlert';
import { useAppSelector } from '../../redux/hooks';
import { selectCurrentUser } from '../../redux/slices/authSlice';
import { UserRole } from '../../redux/services/mainApi/Type/type';

const DOC_TYPE = {
    PAN: 2,
    EMAIL: 3,
    MOBILE: 4,
    AADHAAR: 5,
    GST: 6,
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────
export type UserKyc = 'UserKyc';

export interface KycData {
    panNumber: string;
    mobileNumber: string;
    aadhaarNumber: string;
    emailAddress: string;
    gstNumber: string;
    Kyctype: UserKyc;
}

interface VerificationStatus {
    pan: boolean;
    mobile: boolean;
    aadhaar: boolean;
    email: boolean;
    gst: boolean;
}

interface KycVerificationModalProps {
    visible: boolean;
    onClose: () => void;
    onVerify: (data: KycData) => void;
}

// ─── SplitOtpInput ────────────────────────────────────────────────────────────
interface SplitOtpInputProps {
    value: string;
    onChange: (text: string) => void;
    length?: number;
}

const SplitOtpInput: React.FC<SplitOtpInputProps> = ({ value, onChange, length = 6 }) => {
    const inputsRef = useRef<Array<TextInput | null>>([]);
    const [focusedIndex, setFocusedIndex] = useState(0);
    const otpArray = Array.from({ length }, (_, i) => value[i] || '');

    useEffect(() => { inputsRef.current[0]?.focus(); }, []);

    const handleTextChange = (text: string, index: number) => {
        const cleaned = text.replace(/[^0-9]/g, '').slice(-1);
        const arr = [...otpArray];
        arr[index] = cleaned;
        onChange(arr.join(''));
        if (cleaned && index < length - 1) inputsRef.current[index + 1]?.focus();
    };

    const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
        if (e.nativeEvent.key !== 'Backspace') return;
        const arr = [...otpArray];
        if (!otpArray[index] && index > 0) {
            arr[index - 1] = '';
            onChange(arr.join(''));
            inputsRef.current[index - 1]?.focus();
        } else {
            arr[index] = '';
            onChange(arr.join(''));
        }
    };

    return (
        <View style={otpStyles.otpContainer}>
            {Array.from({ length }).map((_, index) => (
                <TextInput
                    key={index}
                    ref={(ref) => (inputsRef.current[index] = ref)}
                    style={[
                        otpStyles.otpBox,
                        otpArray[index] !== '' && otpStyles.otpBoxFilled,
                        focusedIndex === index && otpStyles.otpBoxFocused,
                    ]}
                    keyboardType="number-pad"
                    maxLength={1}
                    value={otpArray[index]}
                    onChangeText={(t) => handleTextChange(t, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    onFocus={() => setFocusedIndex(index)}
                    textAlign="center"
                    selectTextOnFocus
                />
            ))}
        </View>
    );
};

// ─── StepCard ─────────────────────────────────────────────────────────────────
interface StepCardProps {
    step: number;
    label: string;
    icon: string;
    isComplete: boolean;
    isLoading?: boolean;
    value?: string;
    children: React.ReactNode;
}

const StepCard: React.FC<StepCardProps> = ({ step, label, icon, isComplete, isLoading, value, children }) => (
    <View style={[cardStyles.card, isComplete && cardStyles.cardDone]}>
        {/* ── Header row ── */}
        <View style={cardStyles.headerRow}>
            {/* Step number / check badge */}
            <View style={[cardStyles.badge, isComplete && cardStyles.badgeDone]}>
                {isComplete
                    ? <MaterialCommunityIcons name="check" size={13} color="#fff" />
                    : <Text style={[cardStyles.badgeText, { color: Colors.primary }]}>{step}</Text>
                }
            </View>

            <MaterialCommunityIcons
                name={icon}
                size={18}
                color={isComplete ? Colors.success : Colors.primary}
                style={{ marginHorizontal: 8 }}
            />

            <Text style={[cardStyles.label, isComplete && cardStyles.labelDone]} numberOfLines={1}>
                {label}
            </Text>
            {value ? (
                <Text style={[cardStyles.label, isComplete && cardStyles.labelDone, { marginLeft: 4, fontFamily: Poppins.regular }]} numberOfLines={1}>
                    {value}
                </Text>
            ) : null}


            {/* Verified badge — right side */}
            {isComplete ? (
                <View style={cardStyles.verifiedPill}>
                    <MaterialCommunityIcons name="shield-check" size={12} color={Colors.success} />
                    <Text style={cardStyles.verifiedText}>Verified</Text>
                </View>
            ) : null}

            {/* Spinner for loading state */}
            {isLoading && !isComplete ? (
                <ActivityIndicator size="small" color={Colors.primary} style={{ marginLeft: 'auto' }} />
            ) : null}
        </View>

        {/* ── Body — only shown when NOT complete ── */}
        {!isComplete ? (
            <View style={cardStyles.body}>
                {children}
            </View>
        ) : null}
    </View>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const KycVerificationModal: React.FC<KycVerificationModalProps> = ({ visible, onClose, onVerify }) => {

    // ── Role detection ────────────────────────────────────────────────────────
    const user = useAppSelector(selectCurrentUser);
    const isDistributor = user?.roleName?.toLowerCase() === UserRole.DISTRIBUTOR ||
        user?.role?.toLowerCase() === UserRole.DISTRIBUTOR;
    const totalSteps = isDistributor ? 5 : 4;

    // ── Form state ────────────────────────────────────────────────────────────
    const [formData, setFormData] = useState<KycData>({
        panNumber: '', mobileNumber: '', aadhaarNumber: '', emailAddress: '', gstNumber: '',
        Kyctype: 'UserKyc',
    });

    const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
        pan: false, mobile: false, aadhaar: false, email: false, gst: false,
    });

    const [activeOtpType, setActiveOtpType] = useState<'MOBILE' | 'EMAIL' | null>(null);
    const [enteredOtp, setEnteredOtp] = useState('');
    const [showPanModal, setShowPanModal] = useState(false);
    const [showAadhaarModal, setShowAadhaarModal] = useState(false);
    const [showGstModal, setShowGstModal] = useState(false);

    // ── API hooks ─────────────────────────────────────────────────────────────
    const [getUser, { isLoading: isKycLoading }] = useGetUserKycDetailsMutation();
    const [sendMobileOtp, { isLoading: isMobileLoading }] = useSendMobileOtpMutation();
    const [sendEmailOtp, { isLoading: isEmailLoading }] = useSendEmailOtpMutation();
    const [verifyOtp, { isLoading: isVerifyingOtp }] = useVerifyOtpMutation();

    const { alertConfig, showSuccess, showError, hideAlert } = useCustomAlert();

    // ── Load KYC details when modal opens ─────────────────────────────────────
    useEffect(() => {
        if (visible) {
            // Reset state first so stale data doesn't flash
            setFormData({ panNumber: '', mobileNumber: '', aadhaarNumber: '', emailAddress: '', gstNumber: '', Kyctype: 'UserKyc' });
            setVerificationStatus({ pan: false, mobile: false, aadhaar: false, email: false, gst: false });
            loadKycDetails();
        }
    }, [visible]);

    const loadKycDetails = async () => {
        try {
            const result = await getUser().unwrap();

            if (!result?.success || !Array.isArray(result?.data)) return;

            const docs: KycDocument[] = result.data;

            // Helper: find a doc by its type id
            const find = (typeId: number) => docs.find(d => d.documentTypeId === typeId);

            const panDoc = find(DOC_TYPE.PAN);
            const emailDoc = find(DOC_TYPE.EMAIL);
            const mobileDoc = find(DOC_TYPE.MOBILE);
            const aadhaarDoc = find(DOC_TYPE.AADHAAR);
            const gstDoc = find(DOC_TYPE.GST);

            // Pre-fill fields from existing documents
            setFormData({
                panNumber: panDoc?.documentNumber || '',
                emailAddress: emailDoc?.documentNumber || '',
                mobileNumber: mobileDoc?.documentNumber || '',
                aadhaarNumber: aadhaarDoc?.documentNumber || '',
                gstNumber: gstDoc?.documentNumber || '',
                Kyctype: 'UserKyc',
            });

            // Mark each field verified if isApproved === true
            setVerificationStatus({
                pan: panDoc?.isApproved === true,
                email: emailDoc?.isApproved === true,
                mobile: mobileDoc?.isApproved === true,
                aadhaar: aadhaarDoc?.isApproved === true,
                gst: gstDoc?.isApproved === true,
            });

        } catch {
            // Network / server error — user fills fields manually
        }
    };

    // ── Input helper ──────────────────────────────────────────────────────────
    const setField = (key: keyof KycData, value: string) =>
        setFormData(prev => ({ ...prev, [key]: value }));

    // ── Mobile OTP ────────────────────────────────────────────────────────────
    const handleSendMobileOtp = async () => {
        if (!formData.mobileNumber || formData.mobileNumber.length < 10) {
            showError('Invalid Number', 'Please enter a valid 10-digit mobile number.');
            return;
        }
        try {
            const res = await sendMobileOtp(formData.mobileNumber).unwrap();
            if (res.success) {
                setEnteredOtp('');
                setActiveOtpType('MOBILE');
            } else {
                showError('Failed', res.message || 'Failed to send OTP.');
            }
        } catch (e: any) {
            showError('Error', e?.data?.message || 'Server connection failed.');
        }
    };

    // ── Email OTP ─────────────────────────────────────────────────────────────
    const handleSendEmailOtp = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.emailAddress || !emailRegex.test(formData.emailAddress)) {
            showError('Invalid Email', 'Please enter a valid email address.');
            return;
        }
        try {
            const res = await sendEmailOtp(formData.emailAddress).unwrap();
            if (res.success) {
                setEnteredOtp('');
                setActiveOtpType('EMAIL');
            } else {
                showError('Failed', res.message || 'Failed to send OTP.');
            }
        } catch (e: any) {
            showError('Error', e?.data?.message || 'Server connection failed.');
        }
    };

    // ── Verify OTP ────────────────────────────────────────────────────────────
    const handleVerifyOtp = async () => {
        if (enteredOtp.length < 6) {
            showError('Incomplete', 'Please enter the complete 6-digit code.');
            return;
        }
        const isMobile = activeOtpType === 'MOBILE';
        try {
            const res = await verifyOtp({
                type: activeOtpType!,
                mobileNumber: isMobile ? formData.mobileNumber : '',
                mobileOtp: isMobile ? enteredOtp : '',
                emailId: !isMobile ? formData.emailAddress : '',
                emailOtp: !isMobile ? enteredOtp : '',
                Kyctype: ''
            }).unwrap();

            if (res.success) {
                setVerificationStatus(prev => ({ ...prev, [isMobile ? 'mobile' : 'email']: true }));
                setActiveOtpType(null);
                showSuccess('Verified', `${isMobile ? 'Mobile number' : 'Email address'} verified successfully.`);
            } else {
                showError('Failed', res.message || 'Invalid OTP entered.');
            }
        } catch (e: any) {
            showError('Error', e?.data?.message || 'Unable to verify OTP.');
        }
    };

    // ── PAN / Aadhaar success callbacks ───────────────────────────────────────
    const handlePanSuccess = (data: any) => {
        setField('panNumber', data?.panCardNumber || data?.PanCardNumber || '');
        setVerificationStatus(prev => ({ ...prev, pan: true }));
        showSuccess('PAN Verified', 'PAN card verified successfully.');
    };

    const handleAadhaarSuccess = (data: any) => {
        setField('aadhaarNumber', data?.aadhaarNumber || '');
        setVerificationStatus(prev => ({ ...prev, aadhaar: true }));
        showSuccess('Aadhaar Verified', 'Aadhaar verified successfully.');
    };

    const handleGstSuccess = (data: any) => {
        setField('gstNumber', data?.gstNumber || '');
        setVerificationStatus(prev => ({ ...prev, gst: true }));
        showSuccess('GST Verified', 'GST certificate verified successfully.');
    };

    // ── Derived values ────────────────────────────────────────────────────────
    // For distributors: 5 steps (PAN + Mobile + Aadhaar + Email + GST)
    // For others: 4 steps (PAN + Mobile + Aadhaar + Email)
    const requiredStatuses = isDistributor
        ? [verificationStatus.pan, verificationStatus.mobile, verificationStatus.aadhaar, verificationStatus.email, verificationStatus.gst]
        : [verificationStatus.pan, verificationStatus.mobile, verificationStatus.aadhaar, verificationStatus.email];
    const completedCount = requiredStatuses.filter(Boolean).length;
    const allComplete = completedCount === totalSteps;

    const insets = useSafeAreaInsets();

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                {/* ── Gradient Header ─────────────────────────────────────── */}
                <LinearGradient
                    colors={[Colors.primaryDark, Colors.primary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    {/* Close button */}
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <MaterialCommunityIcons name="close" size={22} color="rgba(255,255,255,0.8)" />
                    </TouchableOpacity>

                    {/* Shield icon */}
                    <View style={styles.shieldCircle}>
                        <MaterialCommunityIcons name="shield-account" size={34} color="#fff" />
                    </View>

                    <Text style={styles.headerTitle}>KYC Verification</Text>
                    <Text style={styles.headerSub}>Complete all {totalSteps} steps to verify your identity</Text>

                    {/* Progress bar — dynamic segments based on role */}
                    <View style={styles.progressRow}>
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <View
                                key={i}
                                style={[styles.progressSeg, completedCount > i && styles.progressSegDone]}
                            />
                        ))}
                    </View>
                    <Text style={styles.progressLabel}>{completedCount} / {totalSteps} completed</Text>

                    {/* Initial fetch spinner */}
                    {isKycLoading ? (
                        <View style={styles.fetchingRow}>
                            <ActivityIndicator size="small" color="rgba(255,255,255,0.8)" />
                            <Text style={styles.fetchingText}>Loading KYC status…</Text>
                        </View>
                    ) : null}
                </LinearGradient>

                {/* ── Step Cards ──────────────────────────────────────────── */}
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* STEP 1 — PAN Card */}
                    <StepCard
                        step={1}
                        label="PAN Card"
                        icon="card-account-details-outline"
                        isComplete={verificationStatus.pan}
                        value={formData.panNumber}
                    >
                        <View style={styles.inputRow}>
                            <View style={styles.inputBox}>
                                <MaterialCommunityIcons name="card-account-details-outline" size={19} color="#9E9E9E" />
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="ABCDE1234F"
                                    placeholderTextColor="#C4C4C4"
                                    autoCapitalize="characters"
                                    maxLength={10}
                                    value={formData.panNumber}
                                    onChangeText={(t) => setField('panNumber', t.toUpperCase())}
                                />
                            </View>
                            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowPanModal(true)}>
                                <Text style={styles.actionBtnText}>Verify</Text>
                            </TouchableOpacity>
                        </View>
                    </StepCard>

                    {/* STEP 2 — Mobile Number */}
                    <StepCard
                        step={2}
                        label="Mobile Number"
                        icon="cellphone"
                        isComplete={verificationStatus.mobile}
                        isLoading={isMobileLoading}
                        value={formData.mobileNumber}
                    >
                        <View style={styles.inputRow}>
                            <View style={styles.inputBox}>
                                <MaterialCommunityIcons name="cellphone" size={19} color="#9E9E9E" />
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="10-digit mobile number"
                                    placeholderTextColor="#C4C4C4"
                                    keyboardType="phone-pad"
                                    maxLength={10}
                                    value={formData.mobileNumber}
                                    onChangeText={(t) => setField('mobileNumber', t.replace(/[^0-9]/g, ''))}
                                />
                            </View>
                            <TouchableOpacity
                                style={[styles.actionBtn, isMobileLoading && styles.actionBtnDisabled]}
                                onPress={handleSendMobileOtp}
                                disabled={isMobileLoading}
                            >
                                {isMobileLoading
                                    ? <ActivityIndicator size="small" color="#fff" />
                                    : <Text style={styles.actionBtnText}>Send OTP</Text>
                                }
                            </TouchableOpacity>
                        </View>
                    </StepCard>

                    {/* STEP 3 — Aadhaar Card */}
                    <StepCard
                        step={3}
                        label="Aadhaar Card"
                        icon="fingerprint"
                        isComplete={verificationStatus.aadhaar}
                        value={formData.aadhaarNumber}
                    >
                        <View style={styles.inputRow}>
                            <View style={styles.inputBox}>
                                <MaterialCommunityIcons name="fingerprint" size={19} color="#9E9E9E" />
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="12-digit Aadhaar number"
                                    placeholderTextColor="#C4C4C4"
                                    keyboardType="number-pad"
                                    maxLength={12}
                                    value={formData.aadhaarNumber}
                                    onChangeText={(t) => setField('aadhaarNumber', t.replace(/[^0-9]/g, ''))}
                                />
                            </View>
                            <TouchableOpacity style={styles.actionBtn} onPress={() => setShowAadhaarModal(true)}>
                                <Text style={styles.actionBtnText}>Verify</Text>
                            </TouchableOpacity>
                        </View>
                    </StepCard>

                    {/* STEP 4 — Email Address */}
                    <StepCard
                        step={4}
                        label="Email Address"
                        icon="email-outline"
                        isComplete={verificationStatus.email}
                        isLoading={isEmailLoading}
                        value={formData.emailAddress}
                    >
                        <View style={styles.inputRow}>
                            <View style={styles.inputBox}>
                                <MaterialCommunityIcons name="email-outline" size={19} color="#9E9E9E" />
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="example@email.com"
                                    placeholderTextColor="#C4C4C4"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={formData.emailAddress}
                                    onChangeText={(t) => setField('emailAddress', t)}
                                />
                            </View>
                            <TouchableOpacity
                                style={[styles.actionBtn, isEmailLoading && styles.actionBtnDisabled]}
                                onPress={handleSendEmailOtp}
                                disabled={isEmailLoading}
                            >
                                {isEmailLoading
                                    ? <ActivityIndicator size="small" color="#fff" />
                                    : <Text style={styles.actionBtnText}>Send OTP</Text>
                                }
                            </TouchableOpacity>
                        </View>
                    </StepCard>

                    {/* ── STEP 5 — GST (Distributors only) ── */}
                    {isDistributor ? (
                        <StepCard
                            step={5}
                            label="GST Number"
                            icon="file-certificate-outline"
                            isComplete={verificationStatus.gst}
                            value={formData.gstNumber}
                        >
                            <View style={styles.inputRow}>
                                <View style={styles.inputBox}>
                                    <MaterialCommunityIcons name="file-certificate-outline" size={19} color="#9E9E9E" />
                                    <TextInput
                                        style={styles.textInput}
                                        placeholder="22AAAAA0000A1Z5"
                                        placeholderTextColor="#C4C4C4"
                                        autoCapitalize="characters"
                                        maxLength={15}
                                        value={formData.gstNumber}
                                        onChangeText={(t) => setField('gstNumber', t.toUpperCase().replace(/\s/g, ''))}
                                    />
                                </View>
                                <TouchableOpacity style={styles.actionBtn} onPress={() => setShowGstModal(true)}>
                                    <Text style={styles.actionBtnText}>Verify</Text>
                                </TouchableOpacity>
                            </View>
                        </StepCard>
                    ) : null}

                    {/* ── Complete KYC button — only when all steps done ── */}
                    {allComplete ? (
                        <TouchableOpacity style={styles.completeBtn} onPress={() => onVerify(formData)}>
                            <MaterialCommunityIcons name="check-circle-outline" size={20} color="#fff" />
                            <Text style={styles.completeBtnText}>Complete KYC</Text>
                        </TouchableOpacity>
                    ) : null}

                    <View style={{ height: 32 }} />
                </ScrollView>

                {/* ── Secure Footer ────────────────────────────────────────── */}
                <View style={styles.footer}>
                    <MaterialCommunityIcons name="shield-lock-outline" size={13} color={Colors.success} />
                    <Text style={styles.footerText}>Your data is protected with 256-bit encryption</Text>
                </View>

            </KeyboardAvoidingView>

            {/* ── OTP Bottom Sheet ─────────────────────────────────────────── */}
            <Modal
                visible={activeOtpType !== null}
                animationType="slide"
                transparent
                onRequestClose={() => setActiveOtpType(null)}
            >
                <View style={otpStyles.overlay}>
                    <View style={otpStyles.sheet}>
                        <View style={otpStyles.dragBar} />

                        {/* Icon */}
                        <View style={otpStyles.iconCircle}>
                            <MaterialCommunityIcons
                                name={activeOtpType === 'MOBILE' ? 'cellphone-message' : 'email-fast-outline'}
                                size={30}
                                color={Colors.primary}
                            />
                        </View>

                        <Text style={otpStyles.title}>Enter Verification Code</Text>
                        <Text style={otpStyles.desc}>
                            6-digit OTP sent to{' '}
                            <Text style={otpStyles.highlight}>
                                {activeOtpType === 'MOBILE' ? formData.mobileNumber : formData.emailAddress}
                            </Text>
                        </Text>

                        {/* OTP boxes */}
                        <View style={{ width: '100%', marginBottom: 28, marginTop: 8 }}>
                            <SplitOtpInput value={enteredOtp} onChange={setEnteredOtp} length={6} />
                        </View>

                        {/* Confirm */}
                        <TouchableOpacity
                            style={otpStyles.confirmBtn}
                            onPress={handleVerifyOtp}
                            disabled={isVerifyingOtp}
                        >
                            {isVerifyingOtp
                                ? <ActivityIndicator size="small" color="#fff" />
                                : <Text style={otpStyles.confirmText}>Verify & Confirm</Text>
                            }
                        </TouchableOpacity>

                        {/* Cancel */}
                        <TouchableOpacity
                            style={otpStyles.cancelBtn}
                            onPress={() => setActiveOtpType(null)}
                        >
                            <Text style={otpStyles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ── Sub-modals ───────────────────────────────────────────────── */}
            <PanVerificationModal
                visible={showPanModal}
                onClose={() => setShowPanModal(false)}
                onSuccess={handlePanSuccess}
                initialPanNumber={formData.panNumber}
            />
            <AadhaarVerificationModal
                visible={showAadhaarModal}
                onClose={() => setShowAadhaarModal(false)}
                onSuccess={handleAadhaarSuccess}
                initialAadhaarNumber={formData.aadhaarNumber}
            />

            {/* ── GST modal (distributors only) ────────────────────────── */}
            {isDistributor ? (
                <GstVerificationModal
                    visible={showGstModal}
                    onClose={() => setShowGstModal(false)}
                    onSuccess={handleGstSuccess}
                    initialGstNumber={formData.gstNumber}
                />
            ) : null}

            {/* ── Alert ───────────────────────────────────────────────────── */}
            <CustomAlertModal
                visible={alertConfig.visible}
                type={alertConfig.type}
                title={alertConfig.title}
                message={alertConfig.message}
                onClose={hideAlert}
                confirmText={alertConfig.confirmText}
                onConfirm={alertConfig.onConfirm}
            />
        </Modal>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },

    // ── Header ──
    header: {
        paddingBottom: Platform.OS === 'android' ? 24 : 24,
        alignItems: 'center',
        paddingTop: 18,

    },
    closeBtn: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 15 : 20,
        right: 20,
        zIndex: 10,
        padding: 8,
    },
    shieldCircle: {
        width: 66,
        height: 66,
        borderRadius: 33,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    headerTitle: {
        color: '#fff',
        fontSize: FontSize.xxl,
        fontFamily: Poppins.bold,
        marginBottom: 6,
        textAlign: 'center',
    },
    headerSub: {
        color: 'rgba(255,255,255,0.78)',
        fontSize: FontSize.sm,
        fontFamily: Poppins.regular,
        textAlign: 'center',
        marginBottom: 18,
    },

    // Progress bar
    progressRow: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        marginBottom: 6,
    },
    progressSeg: {
        width: 36,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.28)',
    },
    progressSegDone: {
        backgroundColor: '#4ADE80',
    },
    progressLabel: {
        color: 'rgba(255,255,255,0.82)',
        fontSize: FontSize.sm,
        fontFamily: Poppins.semiBold,
        marginBottom: Platform.OS === 'android' ? 0 : 40,
    },

    // Fetching spinner row
    fetchingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 10,
    },
    fetchingText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: FontSize.sm,
        fontFamily: Poppins.regular,
    },

    // ── Scroll ──
    scroll: {
        flex: 1,
        paddingHorizontal: Spacing.md,
    },
    scrollContent: {
        paddingTop: Spacing.md,
        paddingBottom: Spacing.xl,
    },

    // ── Input row inside each step card ──
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    inputBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: Radius.md,
        height: ThemeDimensions.inputHeight,
        paddingHorizontal: 12,
    },
    textInput: {
        flex: 1,
        fontSize: FontSize.md,
        fontFamily: Poppins.regular,
        color: '#1F2937',
        paddingVertical: 0,
    },

    // Verify / Send OTP button
    actionBtn: {
        backgroundColor: Colors.primaryDark,
        borderRadius: Radius.md,
        height: ThemeDimensions.buttonHeight,
        minWidth: 90,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 14,
    },
    actionBtnDisabled: {
        opacity: 0.65,
    },
    actionBtnText: {
        color: '#fff',
        fontSize: FontSize.sm,
        fontFamily: Poppins.semiBold,
    },

    // ── Complete KYC button ──
    completeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: Colors.success,
        height: ThemeDimensions.buttonHeight,
        borderRadius: Radius.lg,
        marginTop: Spacing.sm,
        shadowColor: Colors.success,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    completeBtnText: {
        color: '#fff',
        fontSize: FontSize.lg,
        fontFamily: Poppins.bold,
    },

    // ── Footer ──
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 14,
        borderTopWidth: 1,
        borderColor: '#F0F0F0',
        backgroundColor: '#FAFAFA',
    },
    footerText: {
        color: '#6B7280',
        fontSize: FontSize.xs,
        fontFamily: Poppins.medium,
    },
});

// ── Step card styles ──
const cardStyles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: Radius.lg,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 12,
        padding: Spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    cardDone: {
        borderColor: '#BBF7D0',
        backgroundColor: '#F0FDF4',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badge: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: Colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeDone: {
        backgroundColor: Colors.success,
    },
    badgeText: {
        fontSize: FontSize.xs,
        fontFamily: Poppins.bold,
    },
    label: {
        flex: 1,
        fontSize: FontSize.md + 1,
        fontFamily: Poppins.semiBold,
        color: Colors.textDark,
    },
    labelDone: {
        color: Colors.success,
    },
    verifiedPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: Radius.full,
    },
    verifiedText: {
        fontSize: FontSize.xs,
        fontFamily: Poppins.semiBold,
        color: Colors.success,
    },
    body: {
        marginTop: 14,
    },
});

// ── OTP sheet styles ──
const otpStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.52)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: Radius.xxl,
        borderTopRightRadius: Radius.xxl,
        paddingHorizontal: 28,
        paddingBottom: 0,
        paddingTop: 14,
        alignItems: 'center',
    },
    footerRow: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        paddingBottom: 0,
        borderTopWidth: 1,
        alignItems: 'center',
    },
    dragBar: {
        width: 44,
        height: 5,
        borderRadius: Radius.full,
        backgroundColor: '#E5E7EB',
        marginBottom: 20,
    },
    iconCircle: {
        width: 62,
        height: 62,
        borderRadius: 31,
        backgroundColor: Colors.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
    },
    title: {
        fontSize: FontSize.xl,
        fontFamily: Poppins.bold,
        color: '#1F2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    desc: {
        fontSize: FontSize.md,
        fontFamily: Poppins.regular,
        color: '#4B5563',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 8,
    },
    highlight: {
        fontFamily: Poppins.semiBold,
        color: Colors.primaryDark,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 4,
    },
    otpBox: {
        width: 46,
        height: 46,
        borderWidth: 1.5,
        borderColor: '#D1D5DB',
        borderRadius: Radius.md,
        fontSize: 20,
        color: '#111827',
        fontFamily: Poppins.bold,
        backgroundColor: '#F9FAFB',
        padding: 0,
        includeFontPadding: false,
        textAlignVertical: 'center'
    },
    otpBoxFilled: {
        borderColor: '#9CA3AF',
        backgroundColor: '#fff',
    },
    otpBoxFocused: {
        borderColor: Colors.primary,
        backgroundColor: '#fff',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 2,
    },
    confirmBtn: {
        width: '100%',
        height: ThemeDimensions.buttonHeight,
        backgroundColor: Colors.primaryDark,
        borderRadius: Radius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    confirmText: {
        color: '#fff',
        fontSize: FontSize.md,
        fontFamily: Poppins.bold,
    },
    cancelBtn: {
        paddingVertical: 8,
    },
    cancelText: {
        color: '#6B7280',
        fontSize: FontSize.md,
        fontFamily: Poppins.medium,
    },
});

export default KycVerificationModal;
