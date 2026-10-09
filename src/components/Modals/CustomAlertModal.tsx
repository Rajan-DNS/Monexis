import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../theme';
import Typography, { Poppins } from '../../theme/typography';

const { width } = Dimensions.get('window');

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface CustomAlertModalProps {
  visible: boolean;
  type: AlertType;
  title: string;
  message: string;
  onClose: () => void;
  confirmText?: string;
  onConfirm?: () => void;
}

const CustomAlertModal: React.FC<CustomAlertModalProps> = ({
  visible,
  type,
  title,
  message,
  onClose,
  confirmText = 'OK',
  onConfirm,
}) => {
  const config = {
    success: {
      icon: 'check-circle',
      iconColor: Colors.success,
      backgroundColor: '#E3FCEF',
      borderColor: Colors.successBorder,
    },
    error: {
      icon: 'alert-circle',
      iconColor: Colors.error,
      backgroundColor: '#FFEBE6',
      borderColor: Colors.error,
    },
    warning: {
      icon: 'alert',
      iconColor: '#FF8B00',
      backgroundColor: '#FFF4E6',
      borderColor: '#FF8B00',
    },
    info: {
      icon: 'information',
      iconColor: '#0065FF',
      backgroundColor: '#E6F2FF',
      borderColor: '#0065FF',
    },
  }[type];

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Icon Circle */}
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: config.backgroundColor },
            ]}
          >
            <MaterialCommunityIcons
              name={config.icon}
              size={50}
              color={config.iconColor}
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: config.iconColor },
              ]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: Typography.h3,
    fontFamily: Poppins.bold,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: Typography.small,
    fontFamily: Poppins.regular,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButton: {
    width: '100%',
  },
  confirmButtonText: {
    color: Colors.white,
    fontSize: Typography.body,
    fontFamily: Poppins.semiBold,
    fontWeight: '600',
  },
});

export default CustomAlertModal;
