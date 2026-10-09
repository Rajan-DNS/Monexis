import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Colors from '../../theme/colors';
import { Poppins } from '../../theme/typography';

const { width } = Dimensions.get('window');

interface StatusModalProps {
  isVisible: boolean;
  type: 'success' | 'error';
  title: string;
  message: string;
  onClose: () => void;
}

const StatusModal: React.FC<StatusModalProps> = ({
  isVisible,
  type,
  title,
  message,
  onClose,
}) => {
  const isSuccess = type === 'success';

  return (
    <Modal 
      visible={isVisible} 
      transparent 
      animationType="fade"
      onRequestClose={onClose} // Handles Android hardware back button
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View
            style={[
              styles.iconContainer,
              { 
                // Safely falls back to an explicit secondary/tint color structure if hex appending fails
                backgroundColor: isSuccess 
                  ? Colors.badgeSuccessBg 
                  : Colors.error + '1A'
              },
            ]}
          >
            <MaterialIcons
              name={isSuccess ? 'check-circle' : 'error'}
              size={50}
              color={isSuccess ? Colors.success : Colors.error}
            />
          </View>
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: isSuccess ? Colors.success : Colors.error },
            ]}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    backgroundColor: Colors.bgSurface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
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
    fontSize: 20,
    fontFamily: Poppins.bold, // Removed conflicting fontWeight: 'bold'
    color: Colors.textDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: Colors.textBody,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Poppins.bold, // Removed conflicting fontWeight: 'bold'
  },
});

export default StatusModal;
