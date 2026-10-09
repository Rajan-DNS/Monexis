import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert,
  StyleProp,
  ViewStyle,
  TextStyle,
  PermissionsAndroid
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import { Poppins } from '../../theme/typography';

interface DownloadPDFButtonProps {
  title?: string;
  fileName: string;
  htmlContent: string;
  iconName?: string;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  iconColor?: string;
  onGenerationSuccess?: (filePath: string) => void;
}

const DownloadPDFButton: React.FC<DownloadPDFButtonProps> = ({
  title = "Download PDF Directly",
  fileName,
  htmlContent,
  iconName = "file-document-outline",
  buttonStyle,
  textStyle,
  iconColor = "#1F2937",
  onGenerationSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Handles dynamic permission handling across historical and modern Android variations
  const requestStoragePermission = async () => {
    if (Platform.OS === 'ios') return true;

    // Legacy Android variations (API 29 and below) require write permission explicitly
    if (Platform.OS === 'android' && Platform.Version < 33) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: 'This app requires storage access to save PDFs directly to your downloads directory.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Android legacy permission error:', err);
        return false;
      }
    }

    // Android 13+ (API 33+) uses Scoped Storage. App can write to its public directories without WRITE_EXTERNAL_STORAGE.
    return true;
  };

  const handleDirectDownloadPDF = async () => {
    if (isLoading) return;

    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Unable to save PDF file without storage permission.');
      return;
    }

    setIsLoading(true);
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9_\-]/g, '_');

    try {
      const options = {
        html: htmlContent,
        fileName: sanitizedFileName,
        directory: 'Documents',
      };

      // Generate the initial PDF in cached app space
      const file = await RNHTMLtoPDF.convert(options);

      if (!file || !file.filePath) {
        Alert.alert('Error', 'Failed to initialize PDF generation layout.');
        return;
      }

      let destinationPath = '';

      if (Platform.OS === 'android') {
        // Points safely to the public /storage/emulated/0/Download directory
        destinationPath = `${RNFS.DownloadDirectoryPath}/${sanitizedFileName}.pdf`;
      } else {
        // iOS App Sandbox layout structure
        destinationPath = `${RNFS.DocumentDirectoryPath}/${sanitizedFileName}.pdf`;
      }

      // Check and remove redundant older versions to prevent clean file copy locks
      const fileExists = await RNFS.exists(destinationPath);
      if (fileExists) {
        await RNFS.unlink(destinationPath);
      }

      // Copy the file out directly to the destination path
      await RNFS.copyFile(file.filePath, destinationPath);

      if (onGenerationSuccess) {
        onGenerationSuccess(destinationPath);
      }

      // Clear the temporary build file out of mobile cache cleanly
      await RNFS.unlink(file.filePath).catch(() => { });

      Alert.alert(
        'Download Complete',
        Platform.OS === 'android'
          ? `Saved directly to your system 'Downloads' folder!`
          : `Saved safely! You can open it anytime using the iOS native 'Files' App under our app folder.`
      );

    } catch (error: any) {
      console.error("Global Direct PDF Download Error: ", error);
      Alert.alert('Download Error', 'An error occurred while saving the file directly to your device.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.defaultButton, buttonStyle]}
      onPress={handleDirectDownloadPDF}
      activeOpacity={0.7}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={iconColor} style={styles.loader} />
      ) : (
        <MaterialCommunityIcons name={iconName} size={20} color={iconColor} />
      )}
      <Text style={[styles.defaultText, textStyle]}>
        {isLoading ? "Downloading..." : title}
      </Text>
      {!isLoading && (
        <MaterialCommunityIcons name="download" size={18} color="#2563EB" style={styles.downloadIcon} />
      )}
    </TouchableOpacity>
  );
};

export default DownloadPDFButton;

const styles = StyleSheet.create({
  defaultButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  defaultText: {
    fontSize: 16,
    fontFamily: Poppins.semiBold,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 8,
  },
  loader: {
    marginRight: 2,
  },
  downloadIcon: {
    marginLeft: 'auto',
  },
});