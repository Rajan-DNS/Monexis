import React from 'react';
import { StatusBar, Platform, StatusBarStyle, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CustomStatusBarProps {
  backgroundColor?: string;
  barStyle?: StatusBarStyle;
  translucent?: boolean;
}

/**
 * CustomStatusBar component that handles StatusBar configuration
 * with proper styling for both iOS and Android.
 * 
 * This component ensures the StatusBar is visible and blends seamlessly
 * with the screen background.
 */
const CustomStatusBar: React.FC<CustomStatusBarProps> = ({
  backgroundColor = '#FFFFFF',
  barStyle = 'dark-content',
  translucent = false,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar
        barStyle={barStyle}
        backgroundColor={backgroundColor}
        translucent={translucent}
        animated={true}
      />
      {/* 
        On Android, when translucent is true, add a colored view 
        to fill the status bar area with the screen's background color
      */}
      {Platform.OS === 'android' && translucent && (
        <View style={{ height: insets.top, backgroundColor }} />
      )}
    </>
  );
};

export default CustomStatusBar;
