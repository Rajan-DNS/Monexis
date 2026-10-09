# StatusBar Configuration

This directory contains utilities for managing the StatusBar across the React Native app. The StatusBar is now configured to be visible on all screens with appropriate styling that adapts to the screen's background color.

## Overview

The StatusBar implementation provides:
- ✅ Global StatusBar visibility on all screens
- ✅ Automatic bar style detection (light/dark icons) based on background color
- ✅ Seamless blending with screen backgrounds
- ✅ Consistent behavior across Android and iOS
- ✅ No layout overlap or breaking of existing UI
- ✅ Easy customization per screen when needed

## Components and Utilities

### 1. `CustomStatusBar` Component
A React component that renders the StatusBar with proper configuration.

```tsx
import { CustomStatusBar } from '../components/StatusBar';

<CustomStatusBar 
  backgroundColor="#FFFFFF" 
  barStyle="dark-content"
/>
```

### 2. `useStatusBar` Hook
A custom hook for managing StatusBar in functional components.

```tsx
import { useStatusBar } from '../hooks/useStatusBar';
import { Colors } from '../theme';

function MyScreen() {
  // Automatically determines bar style based on background color
  useStatusBar({ backgroundColor: Colors.primary });
  
  return (
    <View style={{ backgroundColor: Colors.primary }}>
      {/* Your screen content */}
    </View>
  );
}
```

### 3. `withStatusBar` HOC
A higher-order component for class components or when you need to wrap a component.

```tsx
import { withStatusBar } from '../components/StatusBar/withStatusBar';
import { Colors } from '../theme';

const MyScreen = () => {
  return (
    <View style={{ backgroundColor: Colors.primary }}>
      {/* Your screen content */}
    </View>
  );
};

export default withStatusBar(MyScreen, { 
  backgroundColor: Colors.primary 
});
```

### 4. `getStatusBarStyle` Utility
A function that automatically determines whether to use light or dark icons based on background color luminance.

```tsx
import { getStatusBarStyle } from '../utils/statusBarHelper';

const barStyle = getStatusBarStyle('#0E21A0'); // Returns 'light-content'
const barStyle2 = getStatusBarStyle('#FFFFFF'); // Returns 'dark-content'
```

## Global Configuration

The StatusBar is configured globally in `App.tsx`:

```tsx
<CustomStatusBar 
  backgroundColor={Colors.bg} 
  barStyle='dark-content'
/>
```

This ensures the StatusBar is visible on all screens by default.

## Per-Screen Customization

If a specific screen needs different StatusBar styling (e.g., a screen with a dark background), you have three options:

### Option 1: Use the `useStatusBar` hook (Recommended)
```tsx
import { useStatusBar } from '../hooks/useStatusBar';
import { Colors } from '../theme';

function DarkScreen() {
  useStatusBar({ backgroundColor: Colors.primary }); // Automatically uses light-content
  
  return (
    <View style={{ flex: 1, backgroundColor: Colors.primary }}>
      {/* Content */}
    </View>
  );
}
```

### Option 2: Use the `withStatusBar` HOC
```tsx
import { withStatusBar } from '../components/StatusBar/withStatusBar';

const DarkScreen = () => {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.primary }}>
      {/* Content */}
    </View>
  );
};

export default withStatusBar(DarkScreen, { backgroundColor: Colors.primary });
```

### Option 3: Use StatusBar directly with automatic style detection
```tsx
import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { getStatusBarStyle } from '../utils/statusBarHelper';
import { Colors } from '../theme';

function DarkScreen() {
  useEffect(() => {
    const barStyle = getStatusBarStyle(Colors.primary);
    StatusBar.setBarStyle(barStyle);
    StatusBar.setBackgroundColor(Colors.primary);
  }, []);
  
  return (
    <View style={{ flex: 1, backgroundColor: Colors.primary }}>
      {/* Content */}
    </View>
  );
}
```

## Color Luminance Detection

The `getStatusBarStyle` function uses the WCAG 2.0 luminance formula to determine if a background color is light or dark:

- **Light backgrounds** (luminance > 0.5): Use `dark-content` (dark icons/text)
- **Dark backgrounds** (luminance ≤ 0.5): Use `light-content` (light icons/text)

Examples:
- `#FFFFFF` → `dark-content` ✓
- `#0E21A0` (primary blue) → `light-content` ✓
- `#10B981` (success green) → `light-content` ✓

## Platform-Specific Behavior

### Android
- StatusBar background color can be customized
- Uses `StatusBar.setBackgroundColor()`
- Respects the `translucent` prop for full-screen experiences

### iOS
- StatusBar is always transparent
- Only bar style (light/dark) can be changed
- Background color is achieved through view layout

## Best Practices

1. **Use the hook for most screens**: The `useStatusBar` hook is the simplest way to configure StatusBar in functional components.

2. **Let automatic detection work**: Unless you have a specific design requirement, let `getStatusBarStyle` automatically determine the appropriate bar style.

3. **Match screen backgrounds**: Always set the StatusBar background color to match your screen's background for seamless integration.

4. **Use theme colors**: Reference colors from the theme system (`Colors`) for consistency.

5. **Don't override unnecessarily**: The global configuration handles most cases. Only customize when a screen has a unique background color.

## Migration Guide

If you have existing screens with manual StatusBar configuration:

### Before:
```tsx
import { StatusBar } from 'react-native';

function MyScreen() {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View>{/* Content */}</View>
    </>
  );
}
```

### After:
```tsx
import { useStatusBar } from '../hooks/useStatusBar';

function MyScreen() {
  useStatusBar({ backgroundColor: '#FFFFFF' }); // barStyle auto-detected
  
  return <View>{/* Content */}</View>;
}
```

## Troubleshooting

### StatusBar not visible
- Ensure you're not hiding it with `StatusBar.setHidden(true)`
- Check that SafeAreaView is not covering it
- Verify that the app has proper permissions (Android)

### Wrong icon color (black icons on dark background)
- Use `useStatusBar` hook to automatically detect the correct style
- Or explicitly set `barStyle: 'light-content'` for dark backgrounds

### StatusBar overlapping content
- Ensure you're using `SafeAreaView` from `react-native-safe-area-context`
- Check that your layout doesn't use absolute positioning near the top

### Different behavior on Android vs iOS
- This is expected due to platform differences
- Use the provided utilities to abstract platform-specific code
- Test on both platforms during development
