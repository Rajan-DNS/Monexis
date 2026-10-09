import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    StatusBar, Platform, Animated, Vibration,
} from 'react-native';
import {
    Camera,
    useCameraDevice,
    useCodeScanner,
} from 'react-native-vision-camera';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../../../theme';
import { FontSize, Radius, Spacing } from '../../../../theme/spacing';
import { Poppins } from '../../../../theme/typography';

interface ParsedUPI {
    upiId: string;
    name: string;
    amount: string;
    note: string;
    isValid: boolean;
}

const parseUPIQR = (raw: string): ParsedUPI => {
    const empty: ParsedUPI = { upiId: '', name: '', amount: '', note: '', isValid: false };
    try {
        let query = raw;
        if (raw.startsWith('upi://pay?') || raw.startsWith('upi://Pay?')) {
            query = raw.split('?')[1] ?? '';
        }
        const params = new URLSearchParams(query);
        const upiId = params.get('pa') || '';
        if (!upiId) return empty;

        return {
            upiId,
            name: params.get('pn') || upiId.split('@')[0],
            amount: params.get('am') || '',
            note: params.get('tn') || params.get('tr') || '',
            isValid: true,
        };
    } catch {
        return empty;
    }
};

const QRScannerScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const device = useCameraDevice('back');

    const [hasPermission, setHasPermission] = useState(false);
    const [scanned, setScanned] = useState(false);
    const [torchOn, setTorchOn] = useState(false);

    const scanLineY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        requestPermission();
        startScanAnimation();
    }, []);

    const requestPermission = async () => {
        const status = await Camera.requestCameraPermission();
        setHasPermission(status === 'granted');
    };

    const startScanAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(scanLineY, { toValue: 1, duration: 2000, useNativeDriver: true }),
                Animated.timing(scanLineY, { toValue: 0, duration: 2000, useNativeDriver: true }),
            ])
        ).start();
    };

    const handleCodeScanned = useCallback((codes: any[]) => {
        if (scanned || !codes.length) return;
        const raw: string = codes[0]?.value ?? '';
        if (!raw) return;

        setScanned(true);
        try { Vibration.vibrate(100); } catch { }

        const parsed = parseUPIQR(raw);

        if (!parsed.isValid) {
            setTimeout(() => setScanned(false), 1500);
            return;
        }

        navigation.replace('ScanPayPayScreen', {
            payee: {
                name: parsed.name,
                upiId: parsed.upiId,
                category: 'QR Pay',
                verified: true,
            },
            amount: parsed.amount,
            note: parsed.note,
        });
    }, [scanned, navigation]);

    const codeScanner = useCodeScanner({
        codeTypes: ['qr'],
        onCodeScanned: handleCodeScanned,
    });

    // ── Permission not granted ──────────────────────────────────────────────
    if (!hasPermission) {
        return (
            <View style={styles.permissionContainer}>
                <StatusBar barStyle="light-content" backgroundColor="#000" />
                <MaterialCommunityIcons name="camera-off" size={64} color={Colors.textMuted} />
                <Text style={styles.permissionTitle}>Camera Access Required</Text>
                <Text style={styles.permissionSub}>
                    Allow camera permission to scan QR codes for UPI payments.
                </Text>
                <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
                    <Text style={styles.permissionBtnText}>Grant Permission</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtnText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // ── No back camera ──────────────────────────────────────────────────────
    if (!device) {
        return (
            <View style={styles.permissionContainer}>
                <StatusBar barStyle="light-content" backgroundColor="#000" />
                <MaterialCommunityIcons name="camera-off" size={64} color={Colors.textMuted} />
                <Text style={styles.permissionTitle}>Camera Not Found</Text>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.backBtnText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const scanLineTranslate = scanLineY.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 210],
    });

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor="#000" translucent />

            {/* ── Full-screen camera ── */}
            <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={!scanned}
                codeScanner={codeScanner}
                torch={torchOn ? 'on' : 'off'}
            />

            <View style={styles.overlay}>
                <View style={styles.overlayTop} />

                <View style={styles.overlayMiddleRow}>
                    <View style={styles.overlaySide} />

                    <View style={styles.scanFrame}>
                        <View style={[styles.corner, styles.cornerTL]} />
                        <View style={[styles.corner, styles.cornerTR]} />
                        <View style={[styles.corner, styles.cornerBL]} />
                        <View style={[styles.corner, styles.cornerBR]} />

                        {/* Animated scan line */}
                        <Animated.View
                            style={[
                                styles.scanLine,
                                { transform: [{ translateY: scanLineTranslate }] },
                            ]}
                        />
                    </View>

                    <View style={styles.overlaySide} />
                </View>

                {/* Bottom dark band */}
                <View style={styles.overlayBottom}>
                    <Text style={styles.scanHint}>
                        {scanned ? '✓ QR Code Detected' : 'Align QR code within the frame'}
                    </Text>
                </View>
            </View>

            <View style={[styles.topBar, { paddingTop: Platform.OS === 'android' ? 40 : 54 }]}>
                <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>

                <Text style={styles.topBarTitle}>Scan QR Code</Text>

                <TouchableOpacity style={styles.iconBtn} onPress={() => setTorchOn(v => !v)}>
                    <MaterialCommunityIcons
                        name={torchOn ? 'flash' : 'flash-off'}
                        size={24}
                        color={torchOn ? '#FFD700' : '#fff'}
                    />
                </TouchableOpacity>
            </View>

            {/* ── UPI badge at bottom ── */}
            <View style={styles.upiBadge}>
                <MaterialCommunityIcons name="shield-check-outline" size={16} color={Colors.success} />
                <Text style={styles.upiBadgeText}>Scan any UPI QR code to pay instantly</Text>
            </View>
        </View>
    );
};

// ─── FRAME size ───────────────────────────────────────────────────────────────
const FRAME = 240;
const CORNER = 22;
const CORNER_W = 4;

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#000',
    },

    permissionContainer: {
        flex: 1,
        backgroundColor: '#0a0a0a',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.xl,
    },
    permissionTitle: {
        color: '#fff',
        fontSize: FontSize.xl,
        fontFamily: Poppins.bold,
        marginTop: Spacing.lg,
        marginBottom: Spacing.sm,
    },
    permissionSub: {
        color: Colors.textMuted,
        fontSize: FontSize.md,
        fontFamily: Poppins.regular,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: Spacing.xl,
    },
    permissionBtn: {
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderRadius: Radius.md,
        marginBottom: Spacing.md,
    },
    permissionBtnText: {
        color: '#fff',
        fontSize: FontSize.md,
        fontFamily: Poppins.bold,
    },
    backBtn: {
        paddingVertical: Spacing.sm,
    },
    backBtnText: {
        color: Colors.textMuted,
        fontSize: FontSize.md,
        fontFamily: Poppins.medium,
    },

    // ── Scanner ──
    overlay: {
        ...StyleSheet.absoluteFill,
        flexDirection: 'column',
    },
    overlayTop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.62)',
    },
    overlayMiddleRow: {
        flexDirection: 'row',
        height: FRAME,
    },
    overlaySide: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.62)',
    },
    overlayBottom: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.62)',
        alignItems: 'center',
        paddingTop: Spacing.lg,
    },
    scanHint: {
        flex:1,
        justifyContent:'center',
        alignItems:'center',
        color: 'rgba(255,255,255,0.85)',
        fontSize: FontSize.md,
        fontFamily: Poppins.medium,
        textAlign: 'center',
    },

    // Scan frame (transparent cutout with borders)
    scanFrame: {
        width: FRAME,
        height: FRAME,
        position: 'relative',
        overflow: 'hidden',
        
    },

    // Corner brackets
    corner: {
        position: 'absolute',
        width: CORNER,
        height: CORNER,
        borderColor: Colors.primary,
    },
    cornerTL: {
        top: 0, left: 0,
        borderTopWidth: CORNER_W, borderLeftWidth: CORNER_W,
        borderTopLeftRadius: 4,
    },
    cornerTR: {
        top: 0, right: 0,
        borderTopWidth: CORNER_W, borderRightWidth: CORNER_W,
        borderTopRightRadius: 4,
    },
    cornerBL: {
        bottom: 0, left: 0,
        borderBottomWidth: CORNER_W, borderLeftWidth: CORNER_W,
        borderBottomLeftRadius: 4,
    },
    cornerBR: {
        bottom: 0, right: 0,
        borderBottomWidth: CORNER_W, borderRightWidth: CORNER_W,
        borderBottomRightRadius: 4,
    },

    // Animated scan line
    scanLine: {
        position: 'absolute',
        left: 4,
        right: 4,
        height: 2.5,
        backgroundColor: Colors.primary,
        borderRadius: 2,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 6,
        elevation: 4,
    },

    // Top bar
    topBar: {
        position: 'absolute',
        top: 0, left: 0, right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.md,
    },
    topBarTitle: {
        color: '#fff',
        fontSize: FontSize.lg,
        fontFamily: Poppins.bold,
    },
    iconBtn: {
        width: 42,
        height: 42,
        borderRadius: Radius.full,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // UPI badge
    upiBadge: {
        position: 'absolute',
        bottom: 48,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        backgroundColor: 'rgba(0,0,0,0.55)',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.full,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
    },
    upiBadgeText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: FontSize.sm,
        fontFamily: Poppins.medium,
    },
});

export default QRScannerScreen;
