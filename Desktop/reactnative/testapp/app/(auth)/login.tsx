import React, { useState } from 'react';
import { ScrollView, View, Text, Image, StatusBar, StyleSheet, ImageBackground } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../../constants';
import { Dimensions } from 'react-native';
import FormField from '../../components/FormField';
import CustomButton from '../../components/button';

const { height, width } = Dimensions.get('window');

const Login = () => {
    const [form, setForm] = useState({
        username: '',
        password: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUsernameChange = (text: string) => {
        setForm(prevForm => ({ ...prevForm, username: text }));
    };

    const handlePasswordChange = (text: string) => {
        setForm(prevForm => ({ ...prevForm, password: text }));
    };

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
            <ImageBackground
                source={images.bgImage}
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                <SafeAreaView style={styles.imageAreaContent}>
                    <Image
                        style={styles.logo}
                        source={images.logo}
                    />
                </SafeAreaView>
            </ImageBackground>
            <View style={styles.textSection}>
                <ScrollView contentContainerStyle={styles.contentContainer}>
                    <Text style={styles.loginTitle}>Login</Text>
                    <Text style={styles.loginSubtitle}>Sign in to your account</Text>
                    <FormField
                        title="Username"
                        placeholder='Username'
                        value={form.username}
                        handleChangeText={handleUsernameChange}
                        keyboardType="default"
                    />
                    <FormField
                        title="Password"
                        value={form.password}
                        handleChangeText={handlePasswordChange}
                        keyboardType="default" 
                        placeholder='Password'
                    />
                    <CustomButton
                        title="Log In"
                        handlePress={() => {}}
                        isLoading={isSubmitting}
                    />
                    <Text style={styles.forgotPassword}>Forgot Password?</Text>
                    <View style={styles.signupContainer}>
                        <Text style={styles.signupText}>Don't have an account? </Text>
                        <Link href="/SignUp" style={styles.signupLink}>Sign Up</Link>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundImage: {
        width: '100%',
        height: '80%', // This height should match where the text section starts
        position: 'absolute',
    },
    imageAreaContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 0, // Make sure there's no extra padding
    },
    textSection: {
        flex: 1,
        backgroundColor: '#2F5651',
        paddingTop: 0, // Remove padding if any that might cause space
        marginTop: height * 0.4, // Ensure this matches the end of the image background
    },
    contentContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        marginTop: -(height * 0.4), // Dynamically calculated negative margin                width: width * 0.5,
        height: height * 0.5,
        resizeMode: 'contain',
    },
    loginTitle: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    loginSubtitle: {
        color: '#FFF',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 30,
    },
    forgotPassword: {
        color: '#FFF',
        fontSize: 16,
    },
    signupContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
    },
    signupText: {
        color: '#FFF',
        fontSize: 16,
    },
    signupLink: {
        color: '#FFF',
        fontSize: 16,
        textDecorationLine: 'underline',
    }
});

export default Login;
