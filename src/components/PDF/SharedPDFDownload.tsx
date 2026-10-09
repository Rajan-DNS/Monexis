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
  View,
  PermissionsAndroid
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { Colors } from '../../theme';
import { Poppins } from '../../theme/typography';

interface SharedPDFDownloadButtonProps {
  title?: string;
  shareTitle?: string;
  fileName: string;
  htmlContent: string;
  iconName?: string;
  shareIconName?: string;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  iconColor?: string;
  onGenerationSuccess?: (filePath: string) => void;
}

const SharedPDFDownloadButton: React.FC<SharedPDFDownloadButtonProps> = ({
  title = "Download",
  shareTitle = "Share",
  fileName,
  htmlContent,
  iconName = "file-document-outline",
  shareIconName = "share-variant",
  buttonStyle,
  textStyle,
  iconColor = "#1F2937",
  onGenerationSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const generatePDFFile = async (sanitizedName: string) => {
    const options = {
      html: htmlContent,
      fileName: sanitizedName,
      directory: 'Documents',
    };
    const file = await RNHTMLtoPDF.convert(options);
    if (!file || !file.filePath) throw new Error('PDF conversion generated empty path.');
    return file.filePath;
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'ios') return true;

    if (Platform.OS === 'android' && Platform.Version < 33) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: 'This app requires storage access to save PDFs directly to your Downloads folder.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Storage permission error:', err);
        return false;
      }
    }

    return true;
  };

  const handleDirectDownloadPDF = async () => {
    if (isLoading || isSharing) return;

    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Unable to save PDF file without storage permission.');
      return;
    }

    setIsLoading(true);
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9_\-]/g, '_');

    try {
      const tempPath = await generatePDFFile(sanitizedFileName);

      let targetDownloadPath = '';
      let isSavedToDownloads = false;

      if (Platform.OS === 'android') {
        const downloadFolder = RNFS.DownloadDirectoryPath || `${RNFS.ExternalStorageDirectoryPath}/Download`;
        targetDownloadPath = `${downloadFolder}/${sanitizedFileName}.pdf`;

        try {
          const exists = await RNFS.exists(targetDownloadPath);
          if (exists) {
            await RNFS.unlink(targetDownloadPath);
          }
          await RNFS.copyFile(tempPath, targetDownloadPath);
          await RNFS.scanFile(targetDownloadPath).catch(() => {});
          isSavedToDownloads = true;
        } catch (copyErr) {
          console.warn('Failed to copy to DownloadDirectoryPath, falling back to DocumentDirectoryPath:', copyErr);
          targetDownloadPath = `${RNFS.DocumentDirectoryPath}/${sanitizedFileName}.pdf`;
          const exists = await RNFS.exists(targetDownloadPath);
          if (exists) {
            await RNFS.unlink(targetDownloadPath);
          }
          await RNFS.copyFile(tempPath, targetDownloadPath);
          isSavedToDownloads = false;
        }
      } else {
        targetDownloadPath = `${RNFS.DocumentDirectoryPath}/${sanitizedFileName}.pdf`;
        const exists = await RNFS.exists(targetDownloadPath);
        if (exists) {
          await RNFS.unlink(targetDownloadPath);
        }
        await RNFS.copyFile(tempPath, targetDownloadPath);
      }

      // Clean up temporary conversion file
      if (tempPath !== targetDownloadPath) {
        await RNFS.unlink(tempPath).catch(() => {});
      }

      if (onGenerationSuccess) {
        onGenerationSuccess(targetDownloadPath);
      }

      Alert.alert(
        'Download Complete',
        Platform.OS === 'android'
          ? (isSavedToDownloads
              ? `PDF saved successfully to Downloads folder!\n\nFile: ${sanitizedFileName}.pdf\n\nLocation:\n${targetDownloadPath}`
              : `PDF saved successfully!\n\nFile: ${sanitizedFileName}.pdf\n\nLocation:\n${targetDownloadPath}`)
          : `PDF saved successfully to App Documents!\n\nFile: ${sanitizedFileName}.pdf\n\nLocation:\n${targetDownloadPath}`
      );
    } catch (error) {
      console.error("Direct PDF Download Error: ", error);
      Alert.alert('Download Error', 'Failed to save PDF directly to device.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSharePDF = async () => {
    if (isLoading || isSharing) return;
    setIsSharing(true);
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9_\-]/g, '_');

    try {
      const tempPath = await generatePDFFile(sanitizedFileName);

      // Save to CachesDirectoryPath for seamless sharing without permissions
      const targetSharePath = `${RNFS.CachesDirectoryPath}/${sanitizedFileName}.pdf`;

      if (tempPath !== targetSharePath) {
        const exists = await RNFS.exists(targetSharePath);
        if (exists) {
          await RNFS.unlink(targetSharePath);
        }
        await RNFS.copyFile(tempPath, targetSharePath);
      }

      let sharePath = targetSharePath;
      if (Platform.OS === 'android') {
        const cleanPath = targetSharePath.replace(/^file:\/\/\/?/, '');
        sharePath = `file:///${cleanPath}`;
      }

      const shareOptions = {
        title: 'Share Transaction Receipt',
        subject: 'Transaction Receipt',
        url: sharePath,
        type: 'application/pdf',
        failOnCancel: false,
      };

      await Share.open(shareOptions);
    } catch (error: any) {
      if (error?.message?.includes('User cancelled') || error?.toString()?.includes('cancelled')) {
        return;
      }
      console.error("Share Sheet PDF Generation Error: ", error);
      Alert.alert('Sharing Error', 'Could not open native application sharing engine.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <View style={styles.containerRow}>
      <TouchableOpacity
        style={[styles.defaultButton, styles.flexButton, buttonStyle]}
        onPress={handleDirectDownloadPDF}
        activeOpacity={0.7}
        disabled={isLoading || isSharing}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={iconColor} style={styles.loader} />
        ) : (
          <MaterialCommunityIcons name={iconName} size={18} color={iconColor} />
        )}
        <Text style={[styles.defaultText, textStyle]}>
          {isLoading ? "Saving..." : title}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.defaultButton, styles.flexButton, styles.shareBtnVariant, buttonStyle]}
        onPress={handleSharePDF}
        activeOpacity={0.7}
        disabled={isLoading || isSharing}
      >
        {isSharing ? (
          <ActivityIndicator size="small" color="#FFFFFF" style={styles.loader} />
        ) : (
          <MaterialCommunityIcons name={shareIconName} size={18} color="#FFFFFF" />
        )}
        <Text style={[styles.defaultText, styles.shareTextVariant, textStyle]}>
          {isSharing ? "Sharing..." : shareTitle}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SharedPDFDownloadButton;

const styles = StyleSheet.create({
  containerRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 10
  },
  flexButton: {
    flex: 1,
  },
  defaultButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 50,
  },
  shareBtnVariant: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  defaultText: {
    fontSize: 16,
    fontFamily: Poppins.semiBold,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 6,
  },
  shareTextVariant: {
    color: '#FFFFFF',
  },
  loader: {
    marginRight: 2,
  },
});