import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    Vibration,
    View,
    NativeSyntheticEvent,
    TextInputKeyPressEventData,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ReactNativeBiometrics from 'react-native-biometrics';
import { Colors } from '../../theme';
import { FontSize, Radius, Spacing } from '../../theme/spacing';
import { Poppins } from '../../theme/typography';
import { useAppSelector } from '../../redux/hooks';
import { selectCurrentUser } from '../../redux/slices/authSlice';
import { useSendOTPMutation, useShowPinMutation } from '../../redux/services/Auth/AuthApi';
import StatusModal from './StatusModal';

const { width } = Dimensions.get('window');
const PIN_LENGTH = 6;
const IS_ANDROID = Platform.OS === 'android';

type AuthMode = 'biometric' | 'pin';
type BiometricState = 'idle' | 'scanning' | 'failed';

interface PaymentAuthModalProps {
    visible: boolean;
    amount: string | number;
    onSuccess: (pin: string) => void;
    onClose: () => void;
    userPin?: string;
}

const PaymentAuthModal: React.FC<PaymentAuthModalProps> = ({
    visible,
    amount,
    onSuccess,
    onClose,
}) => {
    const [mode, setMode] = useState<AuthMode>('biometric');
    const [biometricState, setBiometricState] = useState<BiometricState>('idle');
    const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
    const [pin, setPin] = useState('');
    const [pinError, setPinError] = useState('');
    const [biometricError, setBiometricError] = useState('');

    const [isChangePinVisible, setIsChangePinVisible] = useState(false);
    const [timer, setTimer] = useState(0);
    const [otpValue, setOtpValue] = useState('');
    const [newPin, setNewPin] = useState('');

    const shakeAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const [sendOTP, { isLoading: isSendingOTP }] = useSendOTPMutation();
    const [showpin, { isLoading: isShowingPin }] = useShowPinMutation();
    // Correct instantiation for react-native-biometrics
    const rnBiometrics = useRef(new ReactNativeBiometrics());
    const user = useAppSelector(selectCurrentUser);

    const [statusModal, setStatusModal] = useState<{ isVisible: boolean; type: 'success' | 'error'; title: string; message: string }>({
        isVisible: false,
        type: 'success',
        title: '',
        message: '',
    });



    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    useEffect(() => {
        if (visible) {
            setMode('biometric');
            setPin('');
            setPinError('');
            setBiometricError('');
            setBiometricState('idle');
            const timerRef = setTimeout(() => checkAndAutoPrompt(), 450);
            return () => clearTimeout(timerRef);
        }
    }, [visible]);



    useEffect(() => {
        if (biometricState === 'scanning') {
            const loop = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.16, duration: 650, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 650, useNativeDriver: true }),
                ])
            );
            loop.start();
            return () => loop.stop();
        } else {
            pulseAnim.setValue(1);
        }
    }, [biometricState]);

    const checkAndAutoPrompt = useCallback(async () => {
        try {
            const { available } = await rnBiometrics.current.isSensorAvailable();
            setIsBiometricAvailable(available);

            if (!available) {
                setMode('pin');
                return;
            }
            await runBiometricPrompt();
        } catch {
            setIsBiometricAvailable(false);
            setMode('pin');
        }
    }, [amount]);

    const runBiometricPrompt = async () => {
        setBiometricState('scanning');
        setBiometricError('');

        try {
            const result = await rnBiometrics.current.simplePrompt({
                promptMessage: `Authorize payment of ₹${amount}`,
                cancelButtonText: 'Use PIN instead',
            });

            if (result.success === true) {
                setBiometricState('idle');
                onSuccess('');
            } else {
                setBiometricState('idle');
                setMode('pin');
            }
        } catch (err: any) {
            setBiometricState('failed');
            const msg: string = err?.message || String(err) || '';

            if (msg.toLowerCase().includes('lockout')) {
                setBiometricError('Too many attempts. Fingerprint locked. Use PIN.');
            } else if (msg.toLowerCase().includes('cancel') || msg.toLowerCase().includes('user')) {
                setBiometricState('idle');
                setMode('pin');
            } else {
                setBiometricError('Fingerprint not recognised. Try again or use PIN.');
            }
        }
    };



    const triggerShake = () => {
        try { Vibration.vibrate(200); } catch { /* permission not granted */ }
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 14, duration: 55, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -14, duration: 55, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 10, duration: 55, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -10, duration: 55, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
        ]).start();
    };

    const handleKeyPress = (key: string) => {
        setPinError('');
        if (key === 'backspace') {
            setPin(p => p.slice(0, -1));
        } else if (pin.length < PIN_LENGTH) {
            const newPin = pin + key;
            setPin(newPin);
            if (newPin.length === PIN_LENGTH) {
                setTimeout(() => {
                    onSuccess(newPin);
                }, 100);
            }
        }
    };

    const handleSendOTP = async (isManual = false) => {
        const mobileNumber = user?.mobileNumber || user?.phone;
        if (!mobileNumber) {
            setStatusModal({ isVisible: true, type: 'error', title: 'Error', message: 'Mobile number not found in profile.' });
            return;
        }

        try {
            await sendOTP({ MobileNumber: mobileNumber }).unwrap();
            setTimer(60);
            setIsChangePinVisible(true);
            if (isManual) {
                setStatusModal({ isVisible: true, type: 'success', title: 'Success', message: 'OTP sent successfully!' });
            }
        } catch (error: any) {
            setStatusModal({ isVisible: true, type: 'error', title: 'Error', message: error?.data?.message || 'Failed to send OTP.' });
        }
    };

    const handleConfirmShowPin = async () => {
        try {
            const res = await showpin({ otp: otpValue }).unwrap();
            console.log(res)
            setStatusModal({
                isVisible: true,
                type: 'success',
                title: 'Success',
                message: res?.message,
            });
            setIsChangePinVisible(false);
            setOtpValue('');
            setNewPin('');
        } catch (error: any) {
            setStatusModal({
                isVisible: true,
                type: 'error',
                title: 'Error',
                message: error.data?.message || 'Failed to verify OTP',
            });
        }
    };

    const handleCloseStatusModal = () => {
        setStatusModal(prev => ({ ...prev, isVisible: false }));
    };

    const biometricIcon = IS_ANDROID ? 'fingerprint' : 'face-recognition';
    const biometricLabel = IS_ANDROID ? 'Fingerprint' : 'Face ID';

    const keypadRows = [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        ['show pin', '0', 'backspace'],
    ];

    const renderBiometricView = () => (
        <View style={styles.biometricContainer}>
            <View style={styles.lockCircle}>
                <MaterialCommunityIcons name="lock-outline" size={26} color={Colors.primary} />
            </View>
            <Text style={styles.title}>Authorize Payment</Text>
            <Text style={styles.subtitle}>
                Confirm <Text style={styles.amountText}>₹{amount}</Text> using {biometricLabel}
            </Text>

            <TouchableOpacity onPress={runBiometricPrompt} activeOpacity={0.8}>
                <Animated.View
                    style={[
                        styles.fingerprintCircle,
                        biometricState === 'scanning' && styles.fingerprintScanning,
                        biometricState === 'failed' && styles.fingerprintFailed,
                        { transform: [{ scale: pulseAnim }] },
                    ]}
                >
                    <MaterialCommunityIcons
                        name={biometricIcon}
                        size={68}
                        color={biometricState === 'failed' ? Colors.error : Colors.primary}
                    />
                </Animated.View>
            </TouchableOpacity>

            <Text style={[styles.biometricStatus, biometricState === 'failed' && { color: Colors.error }]}>
                {biometricState === 'scanning'
                    ? `Scanning ${biometricLabel}...`
                    : biometricState === 'failed'
                        ? biometricError
                        : `Touch the sensor to verify`}
            </Text>

            <TouchableOpacity
                style={styles.usePinBtn}
                onPress={() => { setMode('pin'); setPin(''); setPinError(''); }}
                activeOpacity={0.75}
            >
                <MaterialCommunityIcons name="dialpad" size={17} color={Colors.primary} />
                <Text style={styles.usePinText}>Use PIN instead</Text>
            </TouchableOpacity>
        </View>
    );

    const renderPinView = () => (
        <View style={styles.pinContainer}>
            <View style={styles.pinHeader}>
                {isBiometricAvailable && (
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => { setMode('biometric'); runBiometricPrompt(); }}
                    >
                        <MaterialCommunityIcons name="arrow-left" size={22} color={Colors.textMuted} />
                    </TouchableOpacity>
                )}
                <View style={styles.lockCircleSmall}>
                    <MaterialCommunityIcons name="lock-outline" size={20} color={Colors.primary} />
                </View>
            </View>

            <Text style={styles.title}>Enter PIN</Text>
            <Text style={styles.subtitle}>
                6-digit PIN to confirm <Text style={styles.amountText}>₹{amount}</Text>
            </Text>

            <Animated.View style={[styles.dotsRow, { transform: [{ translateX: shakeAnim }] }]}>
                {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.dot,
                            i < pin.length ? styles.dotFilled : styles.dotEmpty,
                            !!pinError && styles.dotError,
                        ]}
                    />
                ))}
            </Animated.View>

            {!!pinError && <Text style={styles.pinErrorText}>{pinError}</Text>}

            <View style={styles.keypad}>
                {keypadRows.map((row, rIdx) => (
                    <View key={rIdx} style={styles.keypadRow}>
                        {row.map((key, kIdx) => {
                            if (key === 'show pin') {
                                return (
                                    <TouchableOpacity
                                        key={kIdx}
                                        style={styles.key}
                                        onPress={() => handleSendOTP(false)}
                                        disabled={isSendingOTP}
                                    >
                                        {isSendingOTP ? (
                                            <ActivityIndicator size="small" color={Colors.primary} />
                                        ) : (
                                            <Text style={[styles.keyText, { fontSize: FontSize.sm }]}>show pin</Text>
                                        )}
                                    </TouchableOpacity>
                                );
                            }
                            if (key === '') return <View key={kIdx} style={styles.keyEmpty} />;
                            if (key === 'backspace') {
                                return (
                                    <TouchableOpacity
                                        key={kIdx}
                                        style={styles.key}
                                        onPress={() => handleKeyPress('backspace')}
                                        activeOpacity={0.7}
                                    >
                                        <MaterialCommunityIcons name="backspace-outline" size={24} color={Colors.textDark} />
                                    </TouchableOpacity>
                                );
                            }
                            return (
                                <TouchableOpacity
                                    key={kIdx}
                                    style={styles.key}
                                    onPress={() => handleKeyPress(key)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.keyText}>{key}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ))}
            </View>
        </View>
    );

    return (
        <>
            <Modal
                animationType="slide"
                transparent={true}
                visible={isChangePinVisible}
                onRequestClose={() => setIsChangePinVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.modalContent}
                    >
                        <View style={styles.header}>
                            <Text style={styles.title}>Verify to View PIN</Text>
                            <TouchableOpacity onPress={() => setIsChangePinVisible(false)} style={styles.closeButton}>
                                <MaterialIcons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.body}>
                            <View style={styles.labelRow}>
                                <Text style={styles.label}>OTP (6 digits)</Text>
                                <TouchableOpacity
                                    onPress={() => handleSendOTP(true)}
                                    disabled={timer > 0 || isSendingOTP}
                                >
                                    {isSendingOTP ? (
                                        <ActivityIndicator size="small" color={Colors.primary} />
                                    ) : (
                                        <Text style={[styles.resendText, timer > 0 && { color: '#9CA3AF' }]}>
                                            {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>

                            <View style={styles.inputContainer}>
                                <SplitOtpInput value={otpValue} onChange={setOtpValue} length={6} secureTextEntry={false} />
                            </View>


                            <TouchableOpacity
                                style={[styles.submitButton, isShowingPin && { opacity: 0.7 }]}
                                onPress={handleConfirmShowPin}
                                disabled={isShowingPin}
                            >
                                {isShowingPin ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Confirm & Show PIN</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

            <StatusModal
                isVisible={statusModal.isVisible}
                type={statusModal.type}
                title={statusModal.title}
                message={statusModal.message}
                onClose={handleCloseStatusModal}
            />

            <Modal
                visible={visible}
                transparent
                animationType="slide"
                onRequestClose={onClose}
                statusBarTranslucent
            >
                <View style={styles.overlay}>
                    <View style={styles.sheet}>
                        <View style={styles.dragBar} />

                        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                            <MaterialCommunityIcons name="close" size={22} color={Colors.textMuted} />
                        </TouchableOpacity>

                        {mode === 'biometric' ? renderBiometricView() : renderPinView()}

                        <View style={styles.secureNote}>
                            <MaterialCommunityIcons name="shield-lock-outline" size={13} color={Colors.success} />
                            <Text style={styles.secureNoteText}>Secured with 256-bit encryption</Text>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};

interface SplitOtpInputProps {
    value: string;
    onChange: (val: string) => void;
    length?: number;
    secureTextEntry?: boolean;
}

const SplitOtpInput: React.FC<SplitOtpInputProps> = ({ value, onChange, length = 6, secureTextEntry = false }) => {
    const inputsRef = useRef<Array<TextInput | null>>([]);
    const [focusedIndex, setFocusedIndex] = useState<number>(0);

    const otpArray = Array.from({ length }, (_, index) => value[index] || '');

    useEffect(() => {
        if (inputsRef.current[0]) {
            inputsRef.current[0].focus();
        }
    }, []);

    const handleTextChange = (text: string, index: number) => {
        const cleanedText = text.replace(/[^0-9]/g, '').slice(-1);
        const updatedOtpArray = [...otpArray];
        updatedOtpArray[index] = cleanedText;

        onChange(updatedOtpArray.join(''));

        if (cleanedText && index < length - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (
        e: NativeSyntheticEvent<TextInputKeyPressEventData>,
        index: number
    ) => {
        if (e.nativeEvent.key !== 'Backspace') return;

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
                            otpArray[index] !== '' && otpStyles.otpBoxActive,
                            focusedIndex === index && otpStyles.otpBoxFocused
                        ]}
                        keyboardType="number-pad"
                        maxLength={1}
                        value={otpArray[index]}
                        onChangeText={(text) => handleTextChange(text, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        onFocus={() => setFocusedIndex(index)}
                        secureTextEntry={secureTextEntry}
                        textAlign="center"
                        selectTextOnFocus
                    />
                ))}
            </View>
        </View>
    );
};

const KEY_W = (width - Spacing.lg * 2 - Spacing.sm * 2) / 3;

const otpStyles = StyleSheet.create({
    otpContainer: { flexDirection: 'row', width: '100%', justifyContent: 'center', marginVertical: Spacing.sm },
    otpBox: { width: 42, height: 50, borderWidth: 1.5, borderColor: '#D1D5DB', borderRadius: 10, fontSize: 16, color: '#111827', fontWeight: '600', backgroundColor: '#F9FAFB', marginHorizontal: 4 },
    otpBoxActive: { borderColor: '#9CA3AF' },
    otpBoxFocused: { borderColor: Colors.primary, backgroundColor: '#FFFFFF' },
});

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    sheet: { backgroundColor: Colors.white, borderTopLeftRadius: Radius.xxl, borderTopRightRadius: Radius.xxl, paddingHorizontal: Spacing.lg, paddingBottom: Platform.OS === 'ios' ? 36 : Spacing.xl, paddingTop: Spacing.md, alignItems: 'center' },
    dragBar: { width: 44, height: 5, borderRadius: Radius.full, backgroundColor: '#E5E7EB', marginBottom: Spacing.sm },
    closeBtn: { alignSelf: 'flex-end', padding: Spacing.xs, marginBottom: Spacing.xs },
    title: { fontSize: FontSize.xl, fontFamily: Poppins.bold, color: Colors.textDark, marginBottom: Spacing.xs, textAlign: 'center' },
    subtitle: { fontSize: FontSize.md, fontFamily: Poppins.regular, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: Spacing.md },
    amountText: { fontFamily: Poppins.bold, color: Colors.primary },
    biometricContainer: { width: '100%', alignItems: 'center', paddingBottom: Spacing.sm },
    lockCircle: { width: 52, height: 52, borderRadius: Radius.full, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm },
    fingerprintCircle: { width: 126, height: 126, borderRadius: Radius.full, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginVertical: Spacing.xl, borderWidth: 2.5, borderColor: 'transparent' },
    fingerprintScanning: { borderColor: Colors.primary },
    fingerprintFailed: { backgroundColor: '#FFF1F0', borderColor: Colors.error },
    biometricStatus: { fontSize: FontSize.md, fontFamily: Poppins.medium, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.lg },
    usePinBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, borderWidth: 1.5, borderColor: Colors.primary, borderRadius: Radius.lg, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2 },
    usePinText: { color: Colors.primary, fontSize: FontSize.md, fontFamily: Poppins.semiBold },
    pinContainer: { width: '100%', alignItems: 'center' },
    pinHeader: { width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm, position: 'relative' },
    backBtn: { position: 'absolute', left: 0, padding: Spacing.xs },
    lockCircleSmall: { width: 44, height: 44, borderRadius: Radius.full, backgroundColor: Colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
    dotsRow: { flexDirection: 'row', gap: Spacing.md, marginVertical: Spacing.lg },
    dot: { width: 15, height: 15, borderRadius: Radius.full },
    dotEmpty: { borderWidth: 2, borderColor: '#CBD5E1', backgroundColor: 'transparent' },
    dotFilled: { backgroundColor: Colors.primary, borderWidth: 0 },
    dotError: { backgroundColor: Colors.error, borderColor: Colors.error },
    pinErrorText: { fontSize: FontSize.sm, fontFamily: Poppins.medium, color: Colors.error, marginBottom: Spacing.sm, textAlign: 'center' },
    keypad: { width: '100%', gap: Spacing.sm, marginTop: Spacing.sm },
    keypadRow: { flexDirection: 'row', gap: Spacing.sm },
    key: { flex: 1, height: KEY_W * 0.68, borderRadius: Radius.lg, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
    keyText: { fontSize: FontSize.xxl, fontFamily: Poppins.semiBold, color: Colors.textDark },
    keyEmpty: { flex: 1, height: KEY_W * 0.68 },
    secureNote: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginTop: Spacing.lg },
    secureNoteText: { fontSize: FontSize.xs, fontFamily: Poppins.medium, color: Colors.success },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#FFF', width: '90%', borderRadius: Radius.lg, padding: Spacing.lg },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
    closeButton: { padding: Spacing.xs },
    body: { width: '100%' },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
    label: { fontSize: FontSize.sm, fontFamily: Poppins.medium, color: Colors.textDark },
    resendText: { fontSize: FontSize.sm, fontFamily: Poppins.semiBold, color: Colors.primary },
    inputContainer: { width: '100%', alignItems: 'center' },
    submitButton: { backgroundColor: Colors.primary, padding: Spacing.md, borderRadius: Radius.md, alignItems: 'center', marginTop: Spacing.lg },
    submitButtonText: { color: '#FFF', fontSize: FontSize.md, fontFamily: Poppins.bold }
});

export default PaymentAuthModal;