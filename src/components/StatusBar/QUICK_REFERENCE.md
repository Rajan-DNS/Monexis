# StatusBar Quick Reference

## TL;DR

✅ **StatusBar is now visible on all screens globally**  
✅ **No action needed for white background screens**  
✅ **Use `useStatusBar()` hook for colored backgrounds**

---

## Import

```tsx
import { useStatusBar } from '../components/StatusBar';
import { Colors } from '../theme';
```

---

## Common Patterns

### 1. White Background (Default) - Do Nothing! ✓
```tsx
function MyScreen() {
  // StatusBar configured automatically
  return <View style={{ backgroundColor: Colors.bg }}>...</View>;
}
```

### 2. Dark/Colored Background - Use Hook
```tsx
function MyScreen() {
  useStatusBar({ backgroundColor: Colors.primary });
  return <View style={{ backgroundColor: Colors.primary }}>...</View>;
}
```

### 3. Screen with Colored Header
```tsx
function MyScreen() {
  useStatusBar({ backgroundColor: Colors.primary }); // Match header color
  return (
    <View>
      <MyHeader style={{ backgroundColor: Colors.primary }} />
      <View style={{ backgroundColor: Colors.bg }}>...</View>
    </View>
  );
}
```

---

## API

### `useStatusBar(options)`

```tsx
useStatusBar({
  backgroundColor?: string;  // Hex color (e.g., '#FFFFFF')
  barStyle?: 'dark-content' | 'light-content';  // Auto-detected if omitted
  animated?: boolean;  // Default: true
});
```

### Examples

```tsx
// Auto-detect bar style (recommended)
useStatusBar({ backgroundColor: Colors.primary });

// Explicit bar style
useStatusBar({ backgroundColor: Colors.primary, barStyle: 'light-content' });

// White background (explicit)
useStatusBar({ backgroundColor: '#FFFFFF' });
```

---

## Color Guide

| Background Color | Auto Bar Style | Result |
|-----------------|----------------|--------|
| `Colors.bg` (#FFFFFF) | `dark-content` | Dark icons |
| `Colors.primary` (#0E21A0) | `light-content` | Light icons |
| `Colors.primaryDark` (#170C79) | `light-content` | Light icons |
| `Colors.success` (#10B981) | `light-content` | Light icons |
| `Colors.error` (#B91C1C) | `light-content` | Light icons |

---

## Don't Do This ❌

```tsx
// DON'T import StatusBar from React Native
import { StatusBar } from 'react-native';

// DON'T use StatusBar component directly (unless you have a special case)
<StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
```

---

## Do This Instead ✅

```tsx
// Import and use the hook
import { useStatusBar } from '../components/StatusBar';

function MyScreen() {
  useStatusBar({ backgroundColor: Colors.primary });
  return <View>...</View>;
}
```

---

## Platform Differences

| Feature | Android | iOS |
|---------|---------|-----|
| Background color | ✅ Yes | ❌ No (always transparent) |
| Bar style (light/dark) | ✅ Yes | ✅ Yes |
| Translucent mode | ✅ Yes | N/A |

---

## When to Customize

| Screen Type | Need Custom Config? | What to Do |
|-------------|-------------------|------------|
| White background | ❌ No | Nothing - use default |
| Light gray/pastel background | ❌ No | Nothing - use default |
| Primary color header | ✅ Yes | `useStatusBar({ backgroundColor: Colors.primary })` |
| Full dark screen | ✅ Yes | `useStatusBar({ backgroundColor: Colors.primary })` |
| Gradient background | ✅ Yes | Use dominant color |
| Modal with header | ✅ Yes | Match modal header color |

---

## Troubleshooting

### StatusBar icons not visible
```tsx
// Background is dark but icons are dark too?
useStatusBar({ 
  backgroundColor: Colors.primary,
  barStyle: 'light-content'  // Explicitly set to light
});
```

### StatusBar overlapping content
```tsx
// Make sure you're using SafeAreaView
import { SafeAreaView } from 'react-native-safe-area-context';

function MyScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Your content */}
    </SafeAreaView>
  );
}
```

### Different behavior on Android vs iOS
```tsx
// This is normal! iOS StatusBar is always transparent.
// Use the hook and it handles platform differences automatically.
useStatusBar({ backgroundColor: Colors.primary });
```

---

## Need More Help?

- **Full Documentation**: `/src/components/StatusBar/README.md`
- **Examples**: `/STATUSBAR_EXAMPLES.md`
- **Implementation Guide**: `/STATUSBAR_IMPLEMENTATION.md`

---

## Key Takeaways

1. **Global config** handles most screens automatically
2. **Use the hook** for screens with colored backgrounds
3. **Auto-detection** works for 90% of cases
4. **Match screen background** for seamless integration
5. **Test on both platforms** to ensure consistency

**Remember**: Less is more. Only customize when needed! 🎯
