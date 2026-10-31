import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { Poppins } from '../../../../theme/typography';

const OtherSection = () => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>OTHER</Text>
      <View style={styles.menuCard}>
        <MenuItem
          icon="description"
          title="Terms & Conditions"
          subtitle="Read our terms of service"
          color="#001F5B"
          badge="Updated"
          onPress={() => navigation.navigate('TermsConditions')}
        />
        <MenuItem
          icon="security"
          title="Privacy Policy"
          subtitle="Your data and privacy"
          color="#0088E8"
          badge="Active"
          onPress={() => navigation.navigate('PrivacyPolicy')}
        />
        {/* Refund and Cancellation Policy */}
        <MenuItem
          icon="currency-exchange"
          title="Refund & Cancellation"
          subtitle="Satisfaction guarantee & refund terms"
          color="#001F5B"
          badge="Active"
          onPress={() => navigation.navigate('RefundAndCancellationPolicy')}
        />
        {/* COOKIE POLICY */}
        <MenuItem
          icon="cookie"
          iconType="community"
          title="Cookie Policy"
          subtitle="Manage cookies & tracking preferences"
          color="#0088E8"
          badge="Active"
          onPress={() => navigation.navigate('CookiePolicy')}
        />
        <MenuItem
          icon="headset-mic"
          title="Contact Us"
          subtitle="Discover more about our app"
          color="#64748B"
          onPress={() => navigation.navigate('ContactUs')}
        />
        <MenuItem
          icon="info"
          title="About Us"
          subtitle="Learn more about our app"
          color="#64748B"
          onPress={() => navigation.navigate('AboutUs')}
        />
        <MenuItem
          icon="star-border"
          title="Rate Our App"
          subtitle="Share your feedback"
          color="#64748B"
        />
      </View>
    </View>
  );
};

const MenuItem = ({ icon, iconType, title, subtitle, color, badge, onPress }: any) => {
  const IconComponent = iconType === 'community' ? MaterialCommunityIcons : MaterialIcons;
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIconBox, { backgroundColor: color + '15' }]}>
        <IconComponent name={icon} size={22} color={color} />
      </View>
      <View style={styles.menuTextContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.menuTitle}>{title}</Text>
          {badge && (
            <View style={[styles.itemBadge, { backgroundColor: color + '15' }]}>
              <Text style={[styles.itemBadgeText, { color: color }]}>{badge}</Text>
            </View>
          )}
        </View>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#CBD5E1" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: Poppins.extraBold,
    color: '#64748B',
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: 1,
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
    fontSize: 15,
    fontFamily: Poppins.bold,
    fontWeight: 'bold',
    color: '#334155',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  itemBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  itemBadgeText: {
    fontSize: 10,
    fontFamily: Poppins.bold,
    letterSpacing: 0.5,
  },
  menuSubtitle: {
    fontSize: 12,
    fontFamily: Poppins.regular,
    color: '#94A3B8',
    marginTop: 2,
  },
});

export default OtherSection;
