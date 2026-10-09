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
  View
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

  const handleDirectDownloadPDF = async () => {
    if (isLoading || isSharing) return;

    setIsLoading(true);
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9_\-]/g, '_');

    try {
      const tempPath = await generatePDFFile(sanitizedFileName);

      // Using DocumentDirectoryPath avoids Scoped Storage restrictions entirely
      const targetDownloadPath = `${RNFS.DocumentDirectoryPath}/${sanitizedFileName}.pdf`;

      const exists = await RNFS.exists(targetDownloadPath);
      if (exists) {
        await RNFS.unlink(targetDownloadPath);
      }

      await RNFS.copyFile(tempPath, targetDownloadPath);
      if (onGenerationSuccess) onGenerationSuccess(targetDownloadPath);

      Alert.alert(
        'Download Complete',
        'PDF saved successfully to App Documents!'
      );
    } catch (error) {
      console.error("Direct PDF Download Error: ", error);
      Alert.alert('Error', 'Failed to save PDF directly to device.');
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