import React from 'react';
import { Text, TextStyle, StyleSheet, TextProps } from 'react-native';

interface CustomTextProps extends TextProps {
    fontWeight?: keyof typeof fontWeights; // Optional, uses keys from fontWeights
}

const fontWeights = {
    black: 'Poppins-Black',
    bold: 'Poppins-Bold',
    extraBold: 'Poppins-ExtraBold',
    extraLight: 'Poppins-ExtraLight',
    light: 'Poppins-Light',
    medium: 'Poppins-Medium',
    regular: 'Poppins-Regular',
    semiBold: 'Poppins-SemiBold',
    thin: 'Poppins-Thin',
};

const CustomText: React.FC<CustomTextProps> = ({ children, style, fontWeight = 'regular', ...props }) => {
    const fontFamily = fontWeights[fontWeight] || fontWeights.regular;
    const combinedStyle = StyleSheet.flatten([{ fontFamily }, styles.defaultStyle, style]);

    return <Text style={combinedStyle} {...props}>{children}</Text>;
};

const styles = StyleSheet.create({
    defaultStyle: {
        fontSize: 16,
        color: '#FFFFFF', // Corrected color value
    },
});

export default CustomText;
