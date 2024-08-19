import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { icons } from '../constants';

interface FormFieldProps {
    title: string;
    value: string;
    placeholder: string;
    handleChangeText: (text: string) => void;
    otherStyles?: object; // Assume otherStyles is an object for inline styles.
    keyboardType?: 'default' | 'numeric' | 'email-address' | 'ascii-capable' | 'numbers-and-punctuation' | 'url' | 'number-pad' | 'phone-pad' | 'name-phone-pad' | 'decimal-pad' | 'twitter' | 'web-search' | 'visible-password';
}

const FormField: React.FC<FormFieldProps> = ({
    title,
    value,
    placeholder,
    handleChangeText,
    otherStyles = {},
    keyboardType 
}) => {
    const [showPassword, setShowPassword] = useState(false);
    
    return (
        <View style={[styles.container, otherStyles]}>
            <TextInput
                placeholder={placeholder}
                value={value}
                onChangeText={handleChangeText}
                style={styles.input}
                placeholderTextColor="#d8c5c5"
                keyboardType={keyboardType}
                secureTextEntry={placeholder === 'Password' && !showPassword}
            />
            {placeholder === 'Password' && (
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.icon}>
                    <Image
                        source={!showPassword ? icons.eye : icons.eyeHide}
                        style={{ width: 24, height: 24 }} // Add explicit size for the icon
                    />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row', // Ensure input and icon are in the same row
        width: '90%',
        alignSelf: 'center',
        marginBottom: 20,
        alignItems: 'center', // Align items vertically
        position: 'relative', // Position relative for absolute positioning of the icon
    },
    input: {
        flex: 1, // Input takes all available space
        paddingHorizontal: 0,
        borderBottomWidth: 2,
        borderBottomColor: 'white',
        fontSize: 18,
        color: '#d8c5c5',
        fontWeight: '600',
        fontFamily: 'Poppins',
        paddingRight: 40, // Make room for the icon
        marginBottom: 20
    },
    icon: {
        padding: 10, // Padding around touchable area for easier tapping
        position: 'absolute', // Absolute position to float above the input
        right: 10, // Positioned towards the right end of the input field
        top: '0%', // Adjust top position to float above the bottom line
        transform: [{ translateY: -12 }] 
        
    }
});

export default FormField;
