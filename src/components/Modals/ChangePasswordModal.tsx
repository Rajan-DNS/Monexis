import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Colors from '../../theme/colors';
import { useChangePasswordMutation } from '../../redux/services/Auth/AuthApi';
import { useAppSelector } from '../../redux/hooks';
import { selectCurrentUser } from '../../redux/slices/authSlice';
import StatusModal from './StatusModal';
import { Poppins } from '../../theme/typography';

interface ChangePasswordModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isVisible, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const user = useAppSelector(selectCurrentUser);
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [statusModal, setStatusModal] = useState<{ isVisible: boolean; type: 'success' | 'error'; title: string; message: string }>({
    isVisible: false,
    type: 'success',
    title: '',
    message: '',
  });

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setStatusModal({ isVisible: true, type: 'error', title: 'Error', message: 'Please fill in all fields.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatusModal({ isVisible: true, type: 'error', title: 'Error', message: 'New password and confirm password do not match.' });
      return;
    }

    try {
      const payload = {
        oldPassword: currentPassword,
        newPassword: newPassword,
        addedById: user?.id || 0,
      };
      await changePassword(payload).unwrap();

      setStatusModal({
        isVisible: true,
        type: 'success',
        title: 'Success',
        message: 'Password changed successfully!',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setStatusModal({
        isVisible: true,
        type: 'error',
        title: 'Error',
        message: error?.data?.message || 'Failed to change password. Please try again.',
      });
    }
  };

  const handleCloseStatusModal = () => {
    const wasSuccess = statusModal.type === 'success';
    setStatusModal(prev => ({ ...prev, isVisible: false }));
    if (wasSuccess) {
      onClose();
    }
  };

  return (
    <>
      <Modal
        animationType='fade'
        transparent={true}
        visible={isVisible}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Change Password</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.body}>
              <Text style={styles.label}>Current Password</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter current password"
                  secureTextEntry={!showCurrentPassword}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholderTextColor={Colors.textSecondary}
                />
                <TouchableOpacity
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  style={styles.eyeIcon}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name={showCurrentPassword ? 'visibility' : 'visibility-off'}
                    size={22}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>New Password</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter new password"
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                                    placeholderTextColor={Colors.textSecondary}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeIcon}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name={showNewPassword ? 'visibility' : 'visibility-off'}
                    size={22}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Confirm New Password</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm new password"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                                    placeholderTextColor={Colors.textSecondary}

                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                    size={22}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, isLoading && { opacity: 0.7 }]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Update Password</Text>
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
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',

  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '90%',
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 10 : 10,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontFamily: Poppins.bold,
    fontWeight: 'bold',
    color: '#1A1D2E',
  },
  closeButton: {
    padding: 4,
  },
  body: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontFamily: Poppins.semiBold,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
    marginTop: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: '#1A1D2E',
  },
  eyeIcon: {
    padding: 12,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 20 : 10,
    marginBottom: Platform.OS === 'ios' ? 10 : 0,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: Poppins.bold,
    fontWeight: 'bold',
  },
});

export default ChangePasswordModal;
