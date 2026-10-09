import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Colors from '../../../../theme/colors';
import { Poppins } from '../../../../theme/typography';
import { useAppSelector } from '../../../../redux/hooks';

interface SecuritySectionProps {
  onLogoutPress: () => void;
  onChangePassword: () => void;
  onChangePin: () => void;
  onShowPin: () => void;
}

const SecuritySection: React.FC<SecuritySectionProps> = ({ onLogoutPress, onChangePassword, onChangePin, onShowPin }) => {

  const user = useAppSelector((state: any) => state.auth.user)
  console.log(user)
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>SECURITY</Text>

      <View style={styles.menuCard}>
        <MenuItem
          icon="lock-outline"
          title="Change Password"
          subtitle="Update your account password"
          color="#F97316"
          onPress={onChangePassword}
        />
        {
          user.role === 'Retailer' && (
            <>
              <MenuItem
                icon="lock"
                title="Create Pin"
                subtitle="Update your account pin"
                color="#0EA5E9"
                onPress={onChangePin}
              />

              <MenuItem
                icon="lock"
                title="Show Pin"
                subtitle="View your account pin"
                color="#0EA5E9"
                onPress={onShowPin}
              />
            </>
          )
        }
        {/* <MenuItem
          icon="logout"
          title="Logout"
          subtitle="Sign out of your account"
          color="#EF4444"
          onPress={onLogoutPress}
        /> */}
      </View>
    </View>
  );
};

const MenuItem = ({ icon, title, subtitle, color, onPress }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={[styles.menuIconBox, { backgroundColor: color + '15' }]}>
      <MaterialIcons name={icon} size={22} color={color} />
    </View>
    <View style={styles.menuTextContainer}>
      <Text style={styles.menuTitle}>{title}</Text>
      <Text style={styles.menuSubtitle}>{subtitle}</Text>
    </View>
    <MaterialIcons name="chevron-right" size={24} color="#CBD5E1" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: Poppins.extraBold,
    color: '#64748B',
    marginBottom: 12,
    letterSpacing: 1,
  },
  logoutBanner: {
    backgroundColor: '#0F4A94',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutBannerText: {
    color: 'white',
    fontSize: 16,
    fontFamily: Poppins.bold,

    marginRight: 8,
  },
  logoutConfirmCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 16,
  },
  logoutCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  logoutIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F7FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutTextContent: {
    marginLeft: 12,
    flex: 1,
  },
  logoutTitle: {
    fontSize: 16,
    fontFamily: Poppins.bold,

    color: '#1E293B',
  },
  logoutSubtitle: {
    fontSize: 12,
    fontFamily: Poppins.regular,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18,
  },
  logoutActionRow: {
    flexDirection: 'row',
    marginTop: 16,
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#94A3B8',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',

  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#0F4A94',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',

  },
  menuCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  menuTitle: {
    fontSize: 16,
    fontFamily: Poppins.bold,

    color: '#334155',
  },
  menuSubtitle: {
    fontSize: 12,
    fontFamily: Poppins.regular,
    color: '#94A3B8',
  },
});

export default SecuritySection;
