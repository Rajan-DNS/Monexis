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
    SafeAreaView, // Added for iOS notch safety
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary, Asset } from 'react-native-image-picker';
import { Colors } from '../../theme';
import { Poppins } from '../../theme/typography';
import { useAadhaarVerificationMutation } from '../../redux/services/mainApi/KYC/KycService';
import CustomAlertModal from './CustomAlertModal';
import { useCustomAlert } from '../../hooks/useCustomAlert';

interface AadhaarVerificationModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: (data: AadhaarVerificationData) => void;
    initialAadhaarNumber?: string;
}

export interface AadhaarVerificationData {
    aadhaarNumber: string;
    aadhaarFrontImage: any;
    aadhaarBackImage: any;
}

const AadhaarVerificationModal: React.FC<AadhaarVerificationModalProps> = ({
    visible,
    onClose,
    onSuccess,
    initialAadhaarNumber = '',
}) => {
    const [aadhaarNumber, setAadhaarNumber] = useState('');
    const [aadhaarFrontImage, setAadhaarFrontImage] = useState<Asset | null>(null);
    const [aadhaarBackImage, setAadhaarBackImage] = useState<Asset | null>(null);

    const [aadhaarVerification, { isLoading }] = useAadhaarVerificationMutation();
    const { alertConfig, showSuccess, showError, hideAlert } = useCustomAlert();

    useEffect(() => {
        if (visible && initialAadhaarNumber) {
            setAadhaarNumber(initialAadhaarNumber);
        }
    }, [visible, initialAadhaarNumber]);

    const handleAadhaarNumberChange = (text: string) => {
        const numericText = text.replace(/[^0-9]/g, '');
        setAadhaarNumber(numericText);
    };

    const handleSelectFrontImage = () => {
        launchImageLibrary(
            { mediaType: 'photo', quality: 0.8, maxWidth: 1024, maxHeight: 1024 },
            (response) => {
                if (!response.didCancel && !response.errorCode && response.assets && response.assets.length > 0) {
                    setAadhaarFrontImage(response.assets[0]);
                } else if (response.errorCode) {
                    showError('Error', response.errorMessage || 'Failed to pick image');
                }
            }
        );
    };

    const handleSelectBackImage = () => {
        launchImageLibrary(
            { mediaType: 'photo', quality: 0.8, maxWidth: 1024, maxHeight: 1024 },
            (response) => {
                if (!response.didCancel && !response.errorCode && response.assets && response.assets.length > 0) {
                    setAadhaarBackImage(response.assets[0]);
                } else if (response.errorCode) {
                    showError('Error', response.errorMessage || 'Failed to pick image');
                }
            }
        );
    };

    const validateAadhaarNumber = (aadhaar: string): boolean => {
        return aadhaar.length === 12 && /^[0-9]{12}$/.test(aadhaar);
    };

    const handleVerify = async () => {
        if (!aadhaarNumber) return showError('Required Field', 'Please enter Aadhaar Number');
        if (!validateAadhaarNumber(aadhaarNumber)) return showError('Invalid Format', 'Aadhaar number must be 12 digits');
        if (!aadhaarFrontImage) return showError('Required Field', 'Please upload Aadhaar front image');
        if (!aadhaarBackImage) return showError('Required Field', 'Please upload Aadhaar back image');

        try {
            const formData = new FormData();
            formData.append('AadhaarFrontImage', {
                uri: aadhaarFrontImage.uri,
                type: aadhaarFrontImage.type || 'image/jpeg',
                name: aadhaarFrontImage.fileName || `aadhaar_front_${aadhaarNumber}.jpg`,
            } as any);

            formData.append('AadhaarBackImage', {
                uri: aadhaarBackImage.uri,
                type: aadhaarBackImage.type || 'image/jpeg',
                name: aadhaarBackImage.fileName || `aadhaar_back_${aadhaarNumber}.jpg`,
            } as any);

            const result = await aadhaarVerification({ aadhaarNumber, formData }).unwrap();

            if (result.success) {
                showSuccess('Verification Successful', 'Aadhaar Card verified successfully', () => {
                    onSuccess({ aadhaarNumber, aadhaarFrontImage, aadhaarBackImage });
                    handleClose();
                });
            } else {
                showError('Verification Failed', result.message || 'Aadhaar verification failed');
            }
        } catch (error: any) {
            showError('Error', error?.data?.message || 'Failed to verify Aadhaar Card');
        }
    };

    const handleClose = () => {
        setAadhaarNumber('');
        setAadhaarFrontImage(null);
        setAadhaarBackImage(null);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={handleClose}>
            <SafeAreaView style={{ flex: 0, backgroundColor: Colors.primary || '#0052D4' }} />
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView
                    style={styles.container}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    {/* Header */}
                    <View style={[styles.headerContainer, { backgroundColor: Colors.primary || '#0052D4' }]}>
                        <TouchableOpacity style={styles.closeButton} onPress={handleClose} activeOpacity={0.7}>
                            <Ionicons name="close" size={28} color="#FFFFFF" />
                        </TouchableOpacity>

                        <Text style={styles.headerTitle}>Aadhaar Verification</Text>
                        <Text style={styles.headerSubtitle}>
                            Upload your Aadhaar card details for verification
                        </Text>
                    </View>

                    {/* Form Content */}
                    <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false} bounces={false}>
                        {/* Aadhaar Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Aadhaar Number *</Text>
                            <View style={styles.inputWrapper}>
                                <MaterialCommunityIcons name="card-account-details-outline" size={22} color="#9E9E9E" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="XXXX XXXX XXXX"
                                    placeholderTextColor="#C4C4C4"
                                    keyboardType="number-pad"
                                    maxLength={12}
                                    value={aadhaarNumber}
                                    onChangeText={handleAadhaarNumberChange}
                                />
                            </View>
                            <Text style={styles.helperText}>Enter 12-digit Aadhaar number</Text>
                        </View>

                        {/* Front Image */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Aadhaar Front Image *</Text>
                            {aadhaarFrontImage ? (
                                <View style={styles.imagePreviewContainer}>
                                    <Image source={{ uri: aadhaarFrontImage.uri }} style={styles.imagePreview} resizeMode="cover" />
                                    <TouchableOpacity style={styles.removeImageButton} onPress={() => setAadhaarFrontImage(null)}>
                                        <Ionicons name="close-circle" size={28} color="#FF5252" />
                                    </TouchableOpacity>
                                    <View style={styles.imageLabel}><Text style={styles.imageLabelText}>Front Side</Text></View>
                                </View>
                            ) : (
                                <TouchableOpacity style={styles.uploadButton} onPress={handleSelectFrontImage}>
                                    <MaterialCommunityIcons name="cloud-upload-outline" size={40} color={Colors.primary || '#0052D4'} />
                                    <Text style={styles.uploadButtonText}>Tap to Upload Front Side</Text>
                                    <Text style={styles.uploadHelperText}>JPG, PNG (Max 5MB)</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Back Image */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Aadhaar Back Image *</Text>
                            {aadhaarBackImage ? (
                                <View style={styles.imagePreviewContainer}>
                                    <Image source={{ uri: aadhaarBackImage.uri }} style={styles.imagePreview} resizeMode="cover" />
                                    <TouchableOpacity style={styles.removeImageButton} onPress={() => setAadhaarBackImage(null)}>
                                        <Ionicons name="close-circle" size={28} color="#FF5252" />
                                    </TouchableOpacity>
                                    <View style={styles.imageLabel}><Text style={styles.imageLabelText}>Back Side</Text></View>
                                </View>
                            ) : (
                                <TouchableOpacity style={styles.uploadButton} onPress={handleSelectBackImage}>
                                    <MaterialCommunityIcons name="cloud-upload-outline" size={40} color={Colors.primary || '#0052D4'} />
                                    <Text style={styles.uploadButtonText}>Tap to Upload Back Side</Text>
                                    <Text style={styles.uploadHelperText}>JPG, PNG (Max 5MB)</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Actions */}
                        <TouchableOpacity
                            style={[styles.primaryButton, { backgroundColor: Colors.primaryDark || '#003399' }, isLoading && styles.primaryButtonDisabled]}
                            onPress={handleVerify}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <>
                                    <Text style={styles.primaryButtonText}>Verify Aadhaar Card</Text>
                                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.buttonArrow} />
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </ScrollView>

                    {/* Sticky Footer Security Badge */}
                    <View style={styles.footerSecure}>
                        <MaterialCommunityIcons name="shield-check" size={18} color="#00875A" />
                        <Text style={styles.footerSecureText}>Your data is encrypted and secure</Text>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>

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
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    headerContainer: {
        paddingTop: Platform.OS === 'ios' ? 20 : 40,
        paddingBottom: 24,
        paddingHorizontal: 24,
        alignItems: 'center',
        position: 'relative', // Context wrapper for the close button
    },
    closeButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 15 : 20,
        right: 20,
        zIndex: 10,
        padding: 8, // Larger hit box target
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontFamily: Poppins.bold,
        marginBottom: 6,
        textAlign: 'center',
    },
    headerSubtitle: {
        color: 'rgba(255, 255, 255, 0.85)',
        fontSize: 12,
        fontFamily: Poppins.regular,
        textAlign: 'center',
        lineHeight: 18,
        paddingHorizontal: 20,
    },
    formContainer: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontFamily: Poppins.semiBold,
        color: '#333333',
        marginBottom: 8,
    },
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
    inputIcon: {
        marginRight: 10,
    },
    textInput: {
        flex: 1,
        color: '#333333',
        fontSize: 16,
        fontFamily: Poppins.regular,
        paddingVertical: 0, // Prevents Android default font padding cutting off
    },
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
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FAFAFA',
    },
    uploadButtonText: {
        fontSize: 16,
        fontFamily: Poppins.semiBold,
        color: '#333333',
        marginTop: 8,
    },
    uploadHelperText: {
        fontSize: 12,
        fontFamily: Poppins.regular,
        color: '#757575',
        marginTop: 4,
    },
    imagePreviewContainer: {
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
    },
    imagePreview: {
        width: '100%',
        height: 180,
        borderRadius: 12,
    },
    removeImageButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        elevation: 3,
    },
    imageLabel: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    imageLabelText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontFamily: Poppins.semiBold,
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
    primaryButtonDisabled: {
        opacity: 0.6,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: Poppins.bold,
    },
    buttonArrow: {
        marginLeft: 8,
    },
    cancelButton: {
        height: 54,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 14,
        marginBottom: 32,
        backgroundColor: '#FFFFFF',
    },
    cancelButtonText: {
        color: '#757575',
        fontSize: 16,
        fontFamily: Poppins.semiBold,
        fontWeight: '600',
    },
    footerSecure: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        borderTopWidth: 1,
        borderColor: '#F0F0F0',
        backgroundColor: '#F9FBF9',
    },
    footerSecureText: {
        color: '#444444',
        fontSize: 12,
        fontFamily: Poppins.medium,
        marginLeft: 6,
        fontWeight: '500',
    },
});

export default AadhaarVerificationModal;