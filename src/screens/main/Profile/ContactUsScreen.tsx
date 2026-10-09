import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../../../theme/colors';
import { Poppins } from '../../../theme/typography';

const ContactUsScreen = ({ navigation }: any) => {
  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support Centre</Text>
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: 'https://i.pinimg.com/736x/da/59/64/da59647bd31dd524c09991cb89949804.jpg' }}
            style={styles.profileImage}
          />
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Support Banner */}
        <View style={styles.supportBanner}>
          <Text style={styles.bannerLabel}>GET IN TOUCH</Text>
          <Text style={styles.bannerTitle}>We're here for your support</Text>
          <Text style={styles.bannerSubtitle}>
            Whether you have a question about our platform, need technical assistance, or want to discuss scaling your merchant operations, our expert team is ready to assist.
          </Text>
          <TouchableOpacity style={styles.chatButton}>
            <MaterialIcons name="chat" size={20} color={Colors.primary} />
            <Text style={styles.chatButtonText}>Start a Live Chat</Text>
          </TouchableOpacity>
        </View>

        {/* Contact Methods */}
        <View style={styles.contactSection}>
          <ContactCard
            icon="email-outline"
            label="Email Support"
            value="rajkotmonexis@gmail.com"
            desc="Average response time is under 4 business hours."
            actionText="Send Message"
          />
          <ContactCard
            icon="phone-outline"
            label="Call Us"
            value="+91 (910) 4244 451 "
            desc="Available Mon-Fri, 9am-6pm EST for urgent inquiries."
            actionText="Call Now"
          />
          <ContactCard
            icon="map-marker-outline"
            label="Office"
            value="Rk World Tower"
            desc="Office No 741, Rk World Tower, Near Shital Park, 150 Feet Ring Road, Madhapar, Rajkot, Gujarat, India 230003"
            actionText="Get Directions"
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const ContactCard = ({ icon, label, value, desc, actionText }: any) => (
  <View style={styles.contactCard}>
    <View style={styles.iconBox}>
      <MaterialCommunityIcons name={icon} size={24} color={Colors.primary} />
    </View>
    <Text style={styles.cardLabel}>{label}</Text>
    <Text style={styles.cardValue}>{value}</Text>
    <Text style={styles.cardDesc}>{desc}</Text>
    <TouchableOpacity style={styles.actionButton}>
      <Text style={styles.actionText}>{actionText}</Text>
      <MaterialIcons name="arrow-forward" size={16} color={Colors.primary} />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: Poppins.bold,

    color: '#000',
  },
  profileContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
  },
  supportBanner: {
    backgroundColor: '#0052D4',
    margin: 20,
    borderRadius: 24,
    padding: 28,
  },
  bannerLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    fontFamily: Poppins.bold,

    letterSpacing: 1,
    marginBottom: 12,
  },
  bannerTitle: {
    color: 'white',
    fontSize: 20,
    fontFamily: Poppins.bold,

    lineHeight: 40,
    marginBottom: 16,
  },
  bannerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontFamily: Poppins.regular,
    lineHeight: 22,
    marginBottom: 24,
  },
  chatButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 30,
    alignSelf: 'flex-start',
    paddingHorizontal: 24,
  },
  chatButtonText: {
    color: '#0052D4',

    marginLeft: 8,
    fontSize: 16,
    fontFamily: Poppins.bold,
  },
  contactSection: {
    paddingHorizontal: 20,
    gap: 20,
  },
  contactCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardLabel: {
    fontSize: 12,
    fontFamily: Poppins.bold,
    color: '#94A3B8',

    letterSpacing: 0.5,
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 16,
    fontFamily: Poppins.bold,

    color: '#1E293B',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 12,
    fontFamily: Poppins.regular,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    color: '#0052D4',

    fontSize: 16,
    fontFamily: Poppins.bold,
    marginRight: 6,
  },
});

export default ContactUsScreen;
