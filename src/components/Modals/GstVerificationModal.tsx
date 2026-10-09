import React, { useState, useEffect } from 'react';
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
    ActivityIndicator,
    Image,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import { Colors } from '../../theme';
import { Poppins } from '../../theme/typography';
import { useGstVerificationMutation } from '../../redux/services/mainApi/KYC/KycService';
import CustomAlertModal from './CustomAlertModal';
import { useCustomAlert } from '../../hooks/useCustomAlert';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface GstVerificationData {
    gstNumber: string;
    kycType: string;
    gstImage: any;
}

interface GstVerificationModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: (data: GstVerificationData) => void;
    initialGstNumber?: string;
}

// GST format: 2 digits + 10 char PAN + 1 digit + Z + 1 alphanum = 15 chars
// e.g. 22AAAAA0000A1Z5
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const GstVerificationModal: React.FC<GstVerificationModalProps> = ({
    visible,
    onClose,
    onSuccess,
    initialGstNumber = '',
}) => {
    const [gstNumber, setGstNumber] = useState('');
    const [gstImage, setGstImage] = useState<Asset | null>(null);

    const [gstVerification, { isLoading }] = useGstVerificationMutation();
    const { alertConfig, showSuccess, showError, hideAlert } = useCustomAlert();

    useEffect(() => {
        if (visible && initialGstNumber) {
            setGstNumber(initialGstNumber.toUpperCase());
        }
    }, [visible, initialGstNumber]);

    const handleGstChange = (text: string) => {
        setGstNumber(text.toUpperCase().replace(/\s/g, ''));
    };

    const handleSelectImage = () => {
        launchImageLibrary(
            { mediaType: 'photo', quality: 0.8, maxWidth: 1024, maxHeight: 1024 },
            (response) => {
                if (response.didCancel) return;
                if (response.errorCode) {
                    showError('Error', response.errorMessage || 'Failed to pick image');
                } else if (response.assets && response.assets.length > 0) {
                    setGstImage(response.assets[0]);
                }
            }
        );
    };

    const handleVerify = async () => {
        if (!gstNumber) {
            showError('Required Field', 'Please enter your GST Number.');
            return;
        }
        if (!GST_REGEX.test(gstNumber)) {
            showError('Invalid Format', 'Please enter a valid 15-character GSTIN.\nExample: 22AAAAA0000A1Z5');
            return;
        }
        if (!gstImage) {
            showError('Required Field', 'Please upload your GST Certificate image.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('GstImage', {
                uri: gstImage.uri,
                type: gstImage.type || 'image/jpeg',
                name: gstImage.fileName || `gst_${gstNumber}.jpg`,
            } as any);

            const result = await gstVerification({
                gstNumber,
                kycType: 'UserKyc',
                formData,
            }).unwrap();

            if (result.success) {
                showSuccess('Verification Successful', 'GST certificate verified successfully.', () => {
                    onSuccess({ gstNumber, kycType: 'UserKyc', gstImage });
                    handleClose();
                });
            } else {
                showError('Verification Failed', result.message || 'GST verification failed.');
            }
        } catch (error: any) {
            showError('Error', error?.data?.message || 'Failed to verify GST. Please try again.');
        }
    };

    const handleClose = () => {
        setGstNumber('');
        setGstImage(null);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                {/* ── Header ── */}
                <View style={[styles.headerContainer, { backgroundColor: Colors.primary }]}>
                    <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                        <Ionicons name="close" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View style={styles.iconCircle}>
                        <MaterialCommunityIcons name="file-certificate-outline" size={32} color="#FFFFFF" />
                    </View>
                    <Text style={styles.headerTitle}>GST Verification</Text>
                    <Text style={styles.headerSubtitle}>
                        Upload your GST certificate for distributor verification
                    </Text>
                </View>

                {/* ── Form ── */}
                <ScrollView
                    style={styles.formContainer}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* GST Number Input */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>GST Number *</Text>
                        <View style={styles.inputWrapper}>
                            <MaterialCommunityIcons
                                name="file-certificate-outline"
                                size={22}
                                color="#9E9E9E"
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.textInput}
                                placeholder="22AAAAA0000A1Z5"
                                placeholderTextColor="#C4C4C4"
                                autoCapitalize="characters"
                                maxLength={15}
                                value={gstNumber}
                                onChangeText={handleGstChange}
                            />
                        </View>
                        <Text style={styles.helperText}>15-character GST Identification Number (GSTIN)</Text>
                    </View>

                    {/* GST Certificate Image */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>GST Certificate Image *</Text>
                        {gstImage ? (
                            <View style={styles.imagePreviewContainer}>
                                <Image
                                    source={{ uri: gstImage.uri }}
                                    style={styles.imagePreview}
                                    resizeMode="cover"
                                />
                                <TouchableOpacity
                                    style={styles.removeImageButton}
                                    onPress={() => setGstImage(null)}
                                >
                                    <Ionicons name="close-circle" size={28} color="#FF5252" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity style={styles.uploadButton} onPress={handleSelectImage}>
                                <MaterialCommunityIcons name="cloud-upload-outline" size={40} color={Colors.primary} />
                                <Text style={styles.uploadButtonText}>Tap to Upload GST Certificate</Text>
                                <Text style={styles.uploadHelperText}>JPG, PNG (Max 5MB)</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Verify Button */}
                    <TouchableOpacity
                        style={[
                            styles.primaryButton,
                            { backgroundColor: Colors.primaryDark },
                            isLoading && styles.primaryButtonDisabled,
                        ]}
                        onPress={handleVerify}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <>
                                <Text style={styles.primaryButtonText}>Verify GST</Text>
                                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.buttonArrow} />
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* Footer */}
                <View style={styles.footerSecure}>
                    <MaterialCommunityIcons name="shield-check" size={18} color="#00875A" />
                    <Text style={styles.footerSecureText}>Your data is encrypted and secure</Text>
                </View>
            </KeyboardAvoidingView>

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

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    headerContainer: {
        paddingTop: Platform.OS === 'ios' ? 54 : 36,
        paddingBottom: 32,
        paddingHorizontal: 32,
        alignItems: 'center',
        position: 'relative',
    },
    closeButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 54 : 16,
        right: 16,
        zIndex: 10,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 14,
    },
    headerTitle: { color: '#FFFFFF', fontSize: 20, fontFamily: Poppins.bold, marginBottom: 8 },
    headerSubtitle: {
        color: 'rgba(255,255,255,0.85)',
        fontSize: 12,
        fontFamily: Poppins.regular,
        textAlign: 'center',
        lineHeight: 20,
    },
    formContainer: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
    inputGroup: { marginBottom: 20 },
    inputLabel: { fontSize: 16, fontFamily: Poppins.semiBold, color: '#333333', marginBottom: 8 },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        height: 54,
        paddingHorizontal: 14,
        backgroundColor: '#FAFAFA',
    },
    inputIcon: { marginRight: 10 },
    textInput: { flex: 1, color: '#333333', fontSize: 16, fontFamily: Poppins.regular },
    helperText: {
        fontSize: 12,
        fontFamily: Poppins.regular,
        color: '#757575',
        marginTop: 6,
        marginLeft: 4,
    },
    uploadButton: {
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FAFAFA',
    },
    uploadButtonText: {
        fontSize: 16,
        fontFamily: Poppins.semiBold,
        color: '#333333',
        marginTop: 12,
    },
    uploadHelperText: { fontSize: 12, fontFamily: Poppins.regular, color: '#757575', marginTop: 6 },
    imagePreviewContainer: { position: 'relative', borderRadius: 12, overflow: 'hidden' },
    imagePreview: { width: '100%', height: 200, borderRadius: 12 },
    removeImageButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        elevation: 3,
    },
    primaryButton: {
        flexDirection: 'row',
        height: 54,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        elevation: 2,
    },
    primaryButtonDisabled: { opacity: 0.6 },
    primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontFamily: Poppins.bold },
    buttonArrow: { marginLeft: 8 },
    cancelButton: {
        height: 54,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 14,
        marginBottom: 40,
        backgroundColor: '#FFFFFF',
    },
    cancelButtonText: { color: '#00875A', fontSize: 16, fontFamily: Poppins.semiBold },
    footerSecure: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        borderTopWidth: 1,
        borderColor: '#F0F0F0',
        backgroundColor: '#F9FBF9',
    },
    footerSecureText: { color: '#444444', fontSize: 12, fontFamily: Poppins.medium, marginLeft: 6 },
});

export default GstVerificationModal;
