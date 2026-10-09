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
  Dimensions,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { Poppins } from '../../../theme/typography';

const { width } = Dimensions.get('window');

const AboutUsScreen = ({ navigation }: any) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Our Mission</Text>
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: 'https://i.pinimg.com/736x/da/59/64/da59647bd31dd524c09991cb89949804.jpg' }}
            style={styles.profileImage}
          />
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Mission Banner */}
        <View style={styles.missionBanner}>
          <View style={styles.visionBadge}>
            <Text style={styles.visionText}>OUR VISION</Text>
          </View>
          <Text style={styles.bannerTitle}>Boost your productivity with our to-do app</Text>
          <Text style={styles.bannerSubtitle}>
            A website wireframe, also known as a page schematic or screen blueprint, is a visual guide that represents the skeletal framework of a website. Wireframes are created for the purpose of arranging elements to best accomplish.
          </Text>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          <Text style={styles.contentTitle}>A Single Source of Truth for Your Growth</Text>
          <Text style={styles.contentText}>
            At Merchant Kinetic, our mission is to eliminate the friction between opportunity and execution. We provide high-performance merchants with an editorial-grade financial dashboard that transforms complex data into actionable intelligence in real-time.
          </Text>

          <View style={styles.statsCard}>
            <Text style={styles.statsValue}>99.9%</Text>
            <Text style={styles.statsLabel}>System Uptime</Text>
          </View>

          {/* Feature Cards */}
          <View style={styles.featureGrid}>
            <FeatureItem
              icon="bolt"
              title="Unmatched Velocity"
              desc="Process transactions and sync insights with zero latency. Our architecture is built to handle volume without compromising on speed."
              color="#0052D4"
            />
            <FeatureItem
              icon="eye"
              title="Editorial Clarity"
              desc="Information design inspired by premium journals, ensuring your financial health is always the main headline."
              color="#0052D4"
            />
            <FeatureItem
              icon="shield-check"
              title="Fortified Security"
              desc="Military-grade encryption and adaptive risk scoring protect every cent of your revenue, allowing you to scale with peace of mind."
              color="#0052D4"
            />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const FeatureItem = ({ icon, title, desc, color }: any) => (
  <View style={styles.featureCard}>
    <View style={[styles.featureIconBox, { backgroundColor: color + '15' }]}>
      <MaterialCommunityIcons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.featureTitle}>{title}</Text>
    <Text style={styles.featureDesc}>{desc}</Text>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
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
  missionBanner: {
    backgroundColor: '#0052D4',
    margin: 20,
    borderRadius: 24,
    padding: 24,
  },
  visionBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  visionText: {
    color: 'white',
    fontSize: 12,
    fontFamily: Poppins.bold,
    
    letterSpacing: 1,
  },
  bannerTitle: {
    color: 'white',
    fontSize: 20,
    fontFamily: Poppins.bold,
    
    lineHeight: 36,
    marginBottom: 16,
  },
  bannerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    fontFamily: Poppins.regular,
    lineHeight: 22,
  },
  contentSection: {
    paddingHorizontal: 20,
  },
  contentTitle: {
    fontSize: 20,
    fontFamily: Poppins.bold,
    
    color: '#1A1D2E',
    marginBottom: 16,
  },
  contentText: {
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: '#64748B',
    lineHeight: 24,
    marginBottom: 24,
  },
  statsCard: {
    backgroundColor: '#F1F7FF',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 32,
  },
  statsValue: {
    fontSize: 20,
    fontFamily: Poppins.bold,
    
    color: '#0052D4',
  },
  statsLabel: {
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: '#64748B',
    marginTop: 4,
  },
  featureGrid: {
    gap: 24,
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  featureIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: Poppins.bold,
    
    color: '#1E293B',
    marginBottom: 8,
  },
  featureDesc: {
    fontSize: 16,
    fontFamily: Poppins.regular,
    color: '#64748B',
    lineHeight: 22,
  },
});

export default AboutUsScreen;
