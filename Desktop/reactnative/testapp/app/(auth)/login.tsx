import React, { useState } from 'react';
import { ScrollView, View, Text, Image, StatusBar, StyleSheet, ImageBackground } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../../constants';
import { Dimensions } from 'react-native';
import FormField from '../../components/FormField';
import CustomButton from '../../components/button';
import CustomText from '@/components/CustomText';
import { app, auth } from '../../firebase/firebase';
import {signInWithEmailAndPassword} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { router } from 'expo-router';


const { height, width } = Dimensions.get('window');

const Login = () => {
    const [form, setForm] = useState({
        email: '',
        password: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleUsernameChange = (text: string) => {
        setForm(prevForm => ({ ...prevForm, email: text }));
    };

    const handlePasswordChange = (text: string) => {
        setForm(prevForm => ({ ...prevForm, password: text }));
    };
    const handleLogin = async () => {
        setIsSubmitting(true);
        try {
            const response = await signInWithEmailAndPassword(auth, form.email, form.password);
            console.log('Logged in!', response);
            // Navigate to your home screen here
            router.replace('/scan');
        } catch (err) {
            console.error(err);
            if (err instanceof FirebaseError) {
                // Handle Firebase errors
                setError(err.message);
            } else {
                // Handle generic errors differently or convert them to a string if needed
                setError('An unexpected error occurred.');
            }
        } finally {
            setIsSubmitting(false);
        }
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
                    <CustomText style={styles.loginTitle} fontWeight='semiBold'>Login</CustomText>
                    <CustomText style={styles.loginSubtitle}>Sign in to your account</CustomText>
                    <FormField
                        title="Email"
                        placeholder='Email'
                        value={form.email}
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
                        handlePress={handleLogin}
                        isLoading={isSubmitting}
                    />
                    <CustomText style={styles.forgotPassword}>Forgot Password?</CustomText>
                    <View style={styles.signupContainer}>
                        <CustomText style={styles.signupText}>Don't have an account? </CustomText>
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
