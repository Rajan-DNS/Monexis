import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Modal,
  Platform,
  Image,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Colors from '../../../theme/colors';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { logout } from '../../../redux/slices/authSlice';

// Sub-components
import ProfileHeader from './components/ProfileHeader';
import ProfileInfoCard from './components/ProfileInfoCard';
import SecuritySection from './components/SecuritySection';
import OtherSection from './components/OtherSection';
import ChangePasswordModal from '../../../components/Modals/ChangePasswordModal';
import ChangePinModal from '../../../components/Modals/ChangePinModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useGetUserProfileQuery } from '../../../redux/services/mainApi/Common/CommonApi';
import { useKycDocumentReportMutation } from '../../../redux/services/mainApi/KYC/KycService';
import { API_BASE_URL } from '../../../redux/services/baseQuery';
import { ProfileSkeleton } from '../../../components/Skeleton';
import { Poppins } from '../../../theme/typography';

// Helper function to safely build image URLs and avoid missing/duplicate slashes
const resolveImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) return '';

  // If the path is already a full absolute URL, return it directly
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Extract the base domain from API_BASE_URL (e.g., https://webapi.neminathsolution.com)
  // because images are hosted at the root domain, not under /NeminathSolution/
  let baseDomain = API_BASE_URL;
  try {
    const match = API_BASE_URL.match(/^(https?:\/\/[^\/]+)/);
    if (match) {
      baseDomain = match[1];
    }
  } catch (e) {
    // fallback
    baseDomain = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  }

  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

  return `${baseDomain}${cleanPath}`;
};

const ProfileScreen = ({ navigation }: any) => {
  const reduxUser = useAppSelector((state: any) => state.auth.user);
  const { data: profileResponse, isLoading } = useGetUserProfileQuery();
  const dispatch = useAppDispatch();

  // Combine redux user data with fetched profile data
  const user = {
    ...reduxUser,
    ...(profileResponse?.data || profileResponse || {}),
  };

  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isChangePasswordVisible, setIsChangePasswordVisible] = useState(false);
  const [isChangePinVisible, setIsChangePinVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [kycDocumentReport, { data: kycReportResponse }] = useKycDocumentReportMutation();

  console.log('kycReportResponse', reduxUser.isKycApproved);

  useEffect(() => {
    kycDocumentReport({
      pageNumber: 1,
      pageSize: 10,
      filter: {
        isApproved: 0,
        userId: 0,
      }
    });
  }, []);

  const handleLogout = async () => {
    setIsLogoutModalVisible(false);
    // Clear all storage data
    await AsyncStorage.clear();
    // Clear Redux state
    dispatch(logout());
    // Reset to Login screen
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={Platform.OS === 'ios'}
      >
        <ProfileHeader
          title="My Profile"
          onBack={() => navigation.goBack()}
        />

        <ProfileInfoCard user={user} />

        <SecuritySection
          onLogoutPress={() => setIsLogoutModalVisible(true)}
          onChangePassword={() => setIsChangePasswordVisible(true)}
          onChangePin={() => setIsChangePinVisible(true)}
                    onShowPin={() => setIsChangePinVisible(true)}

        />

        <OtherSection />

        {/* KYC Documents Section */}
        {kycReportResponse?.data && kycReportResponse.data.length > 0 && (
          <View style={styles.kycSection}>
            <Text style={styles.kycSectionTitle}>KYC Documents</Text>
            {kycReportResponse.data.map((doc: any, index: number) => (
              <View key={index} style={styles.kycCard}>
                <View style={styles.kycCardHeader}>
                  <Text style={styles.kycDocType}>{doc.documentTypeName}</Text>
                  <View style={[styles.kycStatusBadge, { backgroundColor: doc.isApproved ? '#DEF7EC' : '#FDE8E8' }]}>
                    <Text style={[styles.kycStatusText, { color: doc.isApproved ? '#03543F' : '#9B1C1C' }]}>
                      {doc.isApproved ? 'Approved' : 'Pending'}
                    </Text>
                  </View>
                </View>
                <View style={styles.kycCardBody}>
                  <Text style={styles.kycDocNumber}>{doc.documentNumber}</Text>
                  {!!doc.holderName && <Text style={styles.kycDocName}>{doc.holderName}</Text>}

                  {(!!doc.frontImage || !!doc.backImage) && (
                    <View style={styles.kycImageContainer}>
                      {!!doc.frontImage && (
                        <TouchableOpacity onPress={() => setSelectedImage(resolveImageUrl(doc.frontImage))}>
                          <Image
                            source={{ uri: resolveImageUrl(doc.frontImage) }}
                            style={styles.kycDocImage}
                            resizeMode="cover"
                            onError={(e) => console.log('KYC Front Image Load Error:', e.nativeEvent.error)}
                          />
                        </TouchableOpacity>
                      )}
                      {!!doc.backImage && (
                        <TouchableOpacity onPress={() => setSelectedImage(resolveImageUrl(doc.backImage))}>
                          <Image
                            source={{ uri: resolveImageUrl(doc.backImage) }}
                            style={styles.kycDocImage}
                            resizeMode="cover"
                            onError={(e) => console.log('KYC Back Image Load Error:', e.nativeEvent.error)}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Final Logout Button */}
        <TouchableOpacity
          style={styles.finalLogoutButton}
          onPress={() => setIsLogoutModalVisible(true)}
        >
          <MaterialIcons name="logout" size={20} color="#EF4444" />
          <Text style={styles.finalLogoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isVisible={isChangePasswordVisible}
        onClose={() => setIsChangePasswordVisible(false)}
      />

      {/* Change PIN Modal */}
      <ChangePinModal
        isVisible={isChangePinVisible}
        onClose={() => setIsChangePinVisible(false)}
      />

      {/* Logout Modal */}
      <Modal
        visible={isLogoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.logoutConfirmCard}>
            <View style={styles.logoutCardHeader}>
              <View style={styles.logoutIconBox}>
                <MaterialIcons name="logout" size={20} color={Colors.primary} />
              </View>
              <View style={styles.logoutTextContent}>
                <Text style={styles.logoutTitle}>Logout</Text>
                <Text style={styles.logoutSubtitle}>
                  Are you sure you want to log out, {user?.name || 'User'}? You will need to sign in again to access your account.
                </Text>
              </View>
            </View>
            <View style={styles.logoutActionRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsLogoutModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleLogout}
              >
                <Text style={styles.confirmButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Image Viewer Modal */}
      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.imageViewerOverlay}>
          <TouchableOpacity style={styles.imageViewerCloseBtn} onPress={() => setSelectedImage(null)}>
            <MaterialIcons name="close" size={28} color="white" />
          </TouchableOpacity>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullScreenImage}
              resizeMode="contain"
              onError={(e) => console.log('Modal Fullscreen Image Load Error:', e.nativeEvent.error)}
            />
          )}
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 10 : 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoutConfirmCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  logoutCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  logoutIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1F7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutTextContent: {
    marginLeft: 16,
    flex: 1,
  },
  logoutTitle: {
    fontSize: 16,
    fontFamily: Poppins.bold,
    
    color: '#1E293B',
  },
  logoutSubtitle: {
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: '#64748B',
    marginTop: 6,
    lineHeight: 20,
  },
  logoutActionRow: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#64748B',
    
    fontSize: 16,
    fontFamily: Poppins.bold,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#0F4A94',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    
    fontSize: 16,
    fontFamily: Poppins.bold,
  },
  finalLogoutButton: {
    marginTop: 32,
    marginHorizontal: 20,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  finalLogoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontFamily: Poppins.bold,
    
    marginLeft: 8,
  },
  kycSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  kycSectionTitle: {
    fontSize: 16,
    fontFamily: Poppins.bold,
    
    color: '#1E293B',
    marginBottom: 12,
  },
  kycCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  kycCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  kycDocType: {
    fontSize: 16,
    fontFamily: Poppins.semiBold,
        color: '#334155',
  },
  kycStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  kycStatusText: {
    fontSize: 12,
    fontFamily: Poppins.bold,
    
  },
  kycCardBody: {
    marginTop: 4,
  },
  kycDocNumber: {
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: '#64748B',
  },
  kycDocName: {
    fontSize: 16,
    fontFamily: Poppins.semiBold,
    color: '#1E293B',
    marginTop: 4,
  },
  kycImageContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  kycDocImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  imageViewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerCloseBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  fullScreenImage: {
    width: '100%',
    height: '80%',
  },
});

export default ProfileScreen;