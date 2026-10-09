import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
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
          color="#64748B"
          onPress={() => navigation.navigate('TextContent', {
            title: 'Terms & Conditions',
            content: [
              { title: '1. Introduction', text: 'Welcome to our platform. By using our services, you agree to these terms.' },
              { title: '2. User Responsibilities', text: 'Users are responsible for maintaining the confidentiality of their account.' }
            ]
          })}
        />
        <MenuItem
          icon="security"
          title="Privacy Policy"
          subtitle="Your data and privacy"
          color="#64748B"
          onPress={() => navigation.navigate('TextContent', {
            title: 'Privacy Policy',
            content: [
              { title: '1. Data Collection', text: 'We collect data to provide better services to all our users.' },
              { title: '2. Data Usage', text: 'We use the information we collect to provide, maintain, protect and improve our services.' }
            ]
          })}
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
    fontSize: 16,
    fontFamily: Poppins.bold,
    fontWeight: 'bold',
    color: '#334155',
  },
  menuSubtitle: {
    fontSize: 12,
    fontFamily: Poppins.regular,
    color: '#94A3B8',
  },
});

export default OtherSection;
