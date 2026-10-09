import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch } from '../../redux/hooks';
import { logout } from '../../redux/slices/authSlice';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../theme/colors';
import { Poppins } from '../../theme/typography';

interface AppHeaderProps {
  title?: string;
  isHome?: boolean;
  showBack?: boolean;
  onBackPress?: () => void;
  onLogout?: () => void;
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  isHome = false,
  showBack = true,
  onBackPress,
  onNotificationPress,
  onProfilePress,
}) => {
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    setIsLogoutModalVisible(false);
    await AsyncStorage.clear();
    dispatch(logout());
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const handleProfilePress = () => {
    if (onProfilePress) {
      onProfilePress();
    } else {
      navigation.navigate('Profile');
    }
  };

  if (isHome) {
    return (
      <View style={styles.homeHeader}>
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={handleProfilePress} style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://i.pinimg.com/736x/da/59/64/da59647bd31dd524c09991cb89949804.jpg' }}
              style={styles.avatarImage}
            />
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <Text style={styles.welcomeText}>Welcome to</Text>
            <Text style={styles.brandText}>MoneXis</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={onNotificationPress}>
            <Ionicons name="notifications-outline" size={24} color="#1E293B" />
            <View style={styles.badge} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setIsLogoutModalVisible(true)}>
            <MaterialIcons name="logout" size={22} color="#475569" />
          </TouchableOpacity>
        </View>

        {/* Modal remains consistent */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={isLogoutModalVisible}
          onRequestClose={() => setIsLogoutModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalIconContainer}>
                <MaterialIcons name="logout" size={32} color={Colors.error} />
              </View>
              <Text style={styles.modalTitle}>Log Out</Text>
              <Text style={styles.modalMessage}>Are you sure you want to log out?</Text>
              <View style={styles.modalButtonsContainer}>
                <TouchableOpacity style={[styles.modalButton, styles.modalCancelButton]} onPress={() => setIsLogoutModalVisible(false)}>
                  <Text style={styles.modalCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, styles.modalLogoutButton]} onPress={handleLogout}>
                  <Text style={styles.modalLogoutButtonText}>Yes, Log Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.commonHeader}>
      <View style={styles.leftSection}>
        {showBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <MaterialIcons name="arrow-back" size={24} color="#1E293B" />
          </TouchableOpacity>
        )}
        <Text style={styles.pageTitle}>{title}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  homeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: '#F8F9FE',
  },
  commonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  profileInfo: {
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 12,
    fontFamily: Poppins.regular,
    color: '#64748B',
  },
  brandText: {
    fontSize: 20,
    fontFamily: Poppins.bold,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: -2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
    borderWidth: 1,
    borderColor: '#EEF2FF',
  },
  pageTitle: {
    fontSize: 16,
    fontFamily: Poppins.bold,
    color: '#1E293B',
  },
  backButton: {
    marginRight: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: Poppins.bold,
    color: '#1E293B',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  modalLogoutButton: {
    backgroundColor: Colors.error,
    marginLeft: 8,
  },
  modalCancelButtonText: {
    color: '#475569',
    fontFamily: Poppins.bold,
  },
  modalLogoutButtonText: {
    color: '#FFFFFF',
    fontFamily: Poppins.bold,
  },
});

export default AppHeader;