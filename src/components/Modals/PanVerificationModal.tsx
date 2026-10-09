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
import { usePanVerificationMutation } from '../../redux/services/mainApi/KYC/KycService';
import CustomAlertModal from './CustomAlertModal';
import { useCustomAlert } from '../../hooks/useCustomAlert';

interface PanVerificationModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: (data: PanVerificationData) => void;
    initialPanNumber?: string;
}

export interface PanVerificationData {
    panCardNumber: string;
    kycType: string;
    panCardImage: any;
}



const PanVerificationModal: React.FC<PanVerificationModalProps> = ({
    visible,
    onClose,
    onSuccess,
    initialPanNumber = '',
}) => {
    const [panCardNumber, setPanCardNumber] = useState('');
    const [panCardImage, setPanCardImage] = useState<Asset | null>(null);

    const [panVerification, { isLoading }] = usePanVerificationMutation();
    // Custom Alert
    const { alertConfig, showSuccess, showError, hideAlert } = useCustomAlert();

    // Set initial PAN number when modal opens
    useEffect(() => {
        if (visible && initialPanNumber) {
            setPanCardNumber(initialPanNumber.toUpperCase());
        }
    }, [visible, initialPanNumber]);

    // Handle PAN number input (auto-capitalize)
    const handlePanNumberChange = (text: string) => {
        setPanCardNumber(text.toUpperCase());
    };

    // Handle image picker
    const handleSelectImage = () => {
        launchImageLibrary(
            {
                mediaType: 'photo',
                quality: 0.8,
                maxWidth: 1024,
                maxHeight: 1024,
            },
            (response) => {
                if (response.didCancel) {
                    console.log('User cancelled image picker');
                } else if (response.errorCode) {
                    showError('Error', response.errorMessage || 'Failed to pick image');
                } else if (response.assets && response.assets.length > 0) {
                    setPanCardImage(response.assets[0]);
                }
            }
        );
    };

    // Validate PAN format (ABCDE1234F)
    const validatePanNumber = (pan: string): boolean => {
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        return panRegex.test(pan);
    };


    const handleVerify = async () => {
        // Validation
        if (!panCardNumber) {
            showError('Required Field', 'Please enter PAN Card Number');
            return;
        }

        if (!validatePanNumber(panCardNumber)) {
            showError('Invalid Format', 'Invalid PAN format. Required: ABCDE1234F');
            return;
        }



        if (!panCardImage) {
            showError('Required Field', 'Please upload PAN Card image');
            return;
        }

        try {
            // Create FormData with only image
            const formData = new FormData();

            // Append image file (React Native format)
            formData.append('PanCardImage', {
                uri: panCardImage.uri,
                type: panCardImage.type || 'image/jpeg',
                name: panCardImage.fileName || `pan_${panCardNumber}.jpg`,
            } as any);

            // Call API with panCardNumber and kycType in URL params
            const result = await panVerification({
                panCardNumber,
                kycType: "UserKyc",
                formData,
            }).unwrap();

            if (result.success) {
                showSuccess('Verification Successful', 'PAN Card verified successfully', () => {
                    onSuccess({
                        panCardNumber,
                        panCardImage,
                        kycType: "UserKyc",
                    });
                    handleClose();
                });
            } else {
                showError('Verification Failed', result.message || 'PAN verification failed');
            }
        } catch (error: any) {
            console.error('PAN Verification Error:', error);
            showError('Error', error?.data?.message || 'Failed to verify PAN Card');
        }
    };

    // Reset form and close
    const handleClose = () => {
        setPanCardNumber('');
        setPanCardImage(null);
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
                {/* Header */}
                <View style={[styles.headerContainer, { backgroundColor: Colors.primary || '#0052D4' }]}>
                    <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                        <Ionicons name="close" size={28} color="#FFFFFF" />
                    </TouchableOpacity>

                    <View style={styles.iconCircle}>
                        <MaterialCommunityIcons name="card-account-details" size={32} color="#FFFFFF" />
                    </View>

                    <Text style={styles.headerTitle}>PAN Verification</Text>
                    <Text style={styles.headerSubtitle}>
                        Upload your PAN card details for verification
                    </Text>
                </View>

                {/* Form */}
                <ScrollView
                    style={styles.formContainer}
                    showsVerticalScrollIndicator={false}
                    bounces={false}
                >
                    {/* PAN Card Number */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>PAN Card Number *</Text>
                        <View style={styles.inputWrapper}>
                            <MaterialCommunityIcons
                                name="card-account-details-outline"
                                size={22}
                                color="#9E9E9E"
                                style={styles.inputIcon}
                            />
                            <TextInput
                                style={styles.textInput}
                                placeholder="ABCDE1234F"
                                placeholderTextColor="#C4C4C4"
                                autoCapitalize="characters"
                                maxLength={10}
                                value={panCardNumber}
                                onChangeText={handlePanNumberChange}
                            />
                        </View>
                        <Text style={styles.helperText}>Format: 5 letters, 4 numbers, 1 letter</Text>
                    </View>


                    {/* PAN Card Image Upload */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>PAN Card Image *</Text>

                        {panCardImage ? (
                            <View style={styles.imagePreviewContainer}>
                                <Image
                                    source={{ uri: panCardImage.uri }}
                                    style={styles.imagePreview}
                                    resizeMode="cover"
                                />
                                <TouchableOpacity
                                    style={styles.removeImageButton}
                                    onPress={() => setPanCardImage(null)}
                                >
                                    <Ionicons name="close-circle" size={28} color="#FF5252" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.uploadButton}
                                onPress={handleSelectImage}
                            >
                                <MaterialCommunityIcons
                                    name="cloud-upload-outline"
                                    size={40}
                                    color={Colors.primary || '#0052D4'}
                                />
                                <Text style={styles.uploadButtonText}>Tap to Upload PAN Card</Text>
                                <Text style={styles.uploadHelperText}>
                                    JPG, PNG (Max 5MB)
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Action Buttons */}
                    <TouchableOpacity
                        style={[
                            styles.primaryButton,
                            { backgroundColor: Colors.primaryDark || '#003399' },
                            isLoading && styles.primaryButtonDisabled,
                        ]}
                        onPress={handleVerify}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <>
                                <Text style={styles.primaryButtonText}>Verify PAN Card</Text>
                                <Ionicons
                                    name="arrow-forward"
                                    size={20}
                                    color="#FFFFFF"
                                    style={styles.buttonArrow}
                                />
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* Footer Secure Badge */}
                <View style={styles.footerSecure}>
                    <MaterialCommunityIcons name="shield-check" size={18} color="#00875A" />
                    <Text style={styles.footerSecureText}>
                        Your data is encrypted and secure
                    </Text>
                </View>
            </KeyboardAvoidingView>

            {/* Custom Alert Modal */}
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
        paddingTop: 30,
        paddingBottom: 32,
        paddingHorizontal: 32,
        alignItems: 'center',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        position: 'relative',
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        alignSelf: 'center',
        zIndex: 10,
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 16,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontFamily: Poppins.bold,
        marginBottom: 10,
    },
    headerSubtitle: {
        color: 'rgba(255, 255, 255, 0.85)',
        fontSize: 16,
        fontFamily: Poppins.regular,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 10,
    },
    formContainer: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 24,
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
    },
    helperText: {
        fontSize: 12,
        fontFamily: Poppins.regular,
        color: '#757575',
        marginTop: 6,
        marginLeft: 4,
    },
    dropdownWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        height: 54,
        paddingHorizontal: 14,
        backgroundColor: '#FAFAFA',
    },
    dropdownText: {
        flex: 1,
        color: '#333333',
        fontSize: 16,
        fontFamily: Poppins.regular,
    },
    dropdownOptions: {
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    dropdownOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    dropdownOptionSelected: {
        backgroundColor: '#F0F7FF',
    },
    dropdownOptionText: {
        fontSize: 16,
        fontFamily: Poppins.regular,
        color: '#333333',
    },
    dropdownOptionTextSelected: {
        color: Colors.primary || '#0052D4',
        fontFamily: Poppins.semiBold,
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
    uploadHelperText: {
        fontSize: 12,
        fontFamily: Poppins.regular,
        color: '#757575',
        marginTop: 6,
    },
    imagePreviewContainer: {
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
    },
    imagePreview: {
        width: '100%',
        height: 200,
        borderRadius: 12,
    },
    removeImageButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    primaryButton: {
        flexDirection: 'row',
        height: 54,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
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
        marginBottom: 40,
        backgroundColor: '#FFFFFF',
    },
    cancelButtonText: {
        color: '#00875A',
        fontSize: 16,
        fontFamily: Poppins.semiBold,
        fontWeight: '600',
    },
    footerSecure: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
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

export default PanVerificationModal;
