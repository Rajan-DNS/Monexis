import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '../../theme/colors';
import { Poppins } from '../../theme/typography';

interface CustomIconProps {
    name: string;
    type?: 'material' | 'material-community';
    size?: number;
    color?: string;
    bgColor?: string;
    borderColor?: string;
    title?: string;
    onPress?: () => void;
}

const CustomIcon: React.FC<CustomIconProps> = ({
    name,
    type = 'material-community',
    size = 28,
    color = Colors.primary,
    bgColor = '#FFFFFF',
    borderColor = '#E0E0E0',
    title,
    onPress,
}) => {
    const IconComponent = type === 'material' ? MaterialIcons : MaterialCommunityIcons;
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
            disabled={!onPress}
        >
            <View style={[styles.iconBox, { backgroundColor: bgColor, borderColor: borderColor }]}>
                <IconComponent name={name} size={size} color={color} />
            </View>
            {title && <Text style={styles.title}>{title}</Text>}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        width: '22%',
        marginBottom: 16,
    },
    iconBox: {
        width: 55,
        height: 55,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        marginBottom: 8,
        shadowColor: '#020a9aff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    title: {
        fontSize: 12,
        fontFamily: Poppins.medium,
        color: '#444',
        textAlign: 'center',
    },
});

export default CustomIcon;