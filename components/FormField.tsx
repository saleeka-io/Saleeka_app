import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Image } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { icons } from '../constants';

interface FormFieldProps {
    title: string;
    value: string;
    placeholder: string;
    handleChangeText: (text: string) => void;
    otherStyles?: object;
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
                        style={styles.iconImage}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = EStyleSheet.create({
    container: {
        flexDirection: 'row',
        width: '90%',
        alignSelf: 'center',
        marginBottom: '20rem',
        alignItems: 'center',
        position: 'relative',
    },
    input: {
        flex: 1,
        paddingHorizontal: 0,
        borderBottomWidth: 2,
        borderBottomColor: 'white',
        fontSize: '18rem',
        color: '#d8c5c5',
        fontWeight: '600',
        fontFamily: 'Poppins',
        paddingRight: '40rem'
    },
    icon: {
        padding: '10rem',
        position: 'absolute',
        right: '10rem',
        top: '0%',
        transform: [{ translateY: -12 }]
    },
    iconImage: {
        width: '24rem',
        height: '24rem'
    }
});

export default FormField;