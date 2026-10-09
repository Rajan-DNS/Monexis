import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../../../../theme/colors';
import { Poppins } from '../../../../theme/typography';

interface ProfileInfoCardProps {
  user: any;
}

const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({ user }) => {
  // console.log('ProfileInfoCard user:', user);
  const isKycApproved = user?.isKycApproved;
  return (
    <View style={styles.profileCard}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <MaterialIcons name="person" size={60} color="#64748B" />
          <TouchableOpacity style={styles.cameraIcon}>
            <MaterialCommunityIcons name="camera" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.profileName}>{user?.orgName || user?.name || 'N/A'}</Text>
      <View style={styles.verifiedContainer}>
        {isKycApproved ? (
          <>
            <MaterialIcons name="check-circle" size={16} color="#10B981" />
            <Text style={styles.verifiedText}>Verified Account</Text>
          </>
        ) :  <>
            <MaterialIcons name="check-circle" size={16} color="#f4780c" />
            <Text style={{color: '#f4780c',
    fontSize: 12,
    fontFamily: Poppins.semiBold,
    marginLeft: 4,}}>Pending Verification</Text>
          </>}
      </View>
      {/* <TouchableOpacity>
        <Text style={styles.editProfileText}>Edit Profile</Text>
      </TouchableOpacity> */}

      <View style={styles.infoList}>
        <InfoItem icon="person" label="Full Name" value={user?.orgName || user?.name || 'N/A'} />
        <InfoItem icon="phone-android" label="Phone Number" value={user?.mobileNumber || user?.phone || 'N/A'} />
        <InfoItem icon="mail-outline" label="Email ID" value={user?.email || 'N/A'} />
        <InfoItem icon="location-on" label="Address" value={user?.address || 'N/A'} subValue={user?.city ? `${user.city}, ${user.state || ''} - ${user.pincode || ''}` : ''} />
      </View>
    </View>
  );
};

const InfoItem = ({ icon, label, value, subValue }: any) => (
  <View style={styles.infoItem}>
    <View style={styles.infoIconBox}>
      <MaterialIcons name={icon} size={20} color={Colors.primary} />
    </View>
    <View style={styles.infoTextContainer}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
      {subValue && <Text style={styles.infoSubValue}>{subValue}</Text>}
    </View>
  </View>
);

const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: 'white',
    marginTop: -80,
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 0.3,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#E2E8F0',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#334155',
    padding: 6,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'white',
  },
  profileName: {
    fontSize: 20,
    fontFamily: Poppins.bold,
    
    color: '#0F172A',
  },
  verifiedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  verifiedText: {
    color: '#10B981',
    fontSize: 12,
    fontFamily: Poppins.semiBold,
    marginLeft: 4,
      },
  editProfileText: {
    color: '#64748B',
    fontSize: 12,
    fontFamily: Poppins.bold,
    
    textDecorationLine: 'underline',
    marginTop: 2,
  },
  infoList: {
    width: '100%',
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F1F7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: Poppins.bold,
    color: '#94A3B8',
    
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: Poppins.bold,
    color: '#1E293B',
        marginTop: 2,
  },
  infoSubValue: {
    fontSize: 12,
    fontFamily: Poppins.regular,
    color: '#64748B',
    marginTop: 2,
  },
});

export default ProfileInfoCard;
