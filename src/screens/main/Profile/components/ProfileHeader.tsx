import React from 'react';
import { View, Text, TouchableOpacity, StatusBar, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Colors from '../../../../theme/colors';
import { Poppins } from '../../../../theme/typography';

interface ProfileHeaderProps {
  title: string;
  onBack: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ title, onBack }) => {
  return (
    <View style={styles.headerBackground}>
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerBackground: {
    backgroundColor: Colors.primary,
    height: 160,
    paddingTop: StatusBar.currentHeight || 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: 'white',
    fontSize: 16,
    fontFamily: Poppins.bold,
    marginLeft: 15,
  },
});

export default ProfileHeader;
