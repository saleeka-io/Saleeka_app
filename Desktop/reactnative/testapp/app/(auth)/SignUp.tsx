import React, { useState } from 'react';
import { View, Text, Image, StatusBar, StyleSheet, ImageBackground, Dimensions, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import EStyleSheet from 'react-native-extended-stylesheet';
import Svg, { Path } from 'react-native-svg';
import { images } from '../../constants';
import FormField from '../../components/FormField';
import CustomButton from '../../components/button';
import { app, auth } from '../../firebase/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

// Set up EStyleSheet
EStyleSheet.build({ $rem: width / 380 });

const SignUp = () => {
    const [form, setForm] = useState({
        username: '',
        password: '',
        email: ''
    });
    const [errors, setErrors] = useState({
        username: '',
        password: '',
        email: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validateUsername = (username: string) => {
        if (!/^[A-Za-z]+$/.test(username)) {
            setErrors(prev => ({ ...prev, username: 'Username must contain only A-Z characters' }));
        } else {
            setErrors(prev => ({ ...prev, username: '' }));
        }
    };

    const validatePassword = (password: string) => {
        if (password.length < 8 || !/\d/.test(password) || !/[!@#$%^&*]/.test(password)) {
            setErrors(prev => ({ ...prev, password: 'Password must be 8+ characters with at least one number and special character' }));
        } else {
            setErrors(prev => ({ ...prev, password: '' }));
        }
    };

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
        } else {
            setErrors(prev => ({ ...prev, email: '' }));
        }
    };

    const handleUsernameChange = (text: string) => {
        setForm(prevForm => ({ ...prevForm, username: text }));
        validateUsername(text);
    };

    const handlePasswordChange = (text: string) => {
        setForm(prevForm => ({ ...prevForm, password: text }));
        validatePassword(text);
    };

    const handleEmailChange = (text: string) => {
        setForm(prevForm => ({ ...prevForm, email: text }));
        validateEmail(text);
    };

    const createUser = async () => {
        setIsSubmitting(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
            const user = userCredential.user;
            await updateProfile(user, { displayName: form.username });
            console.log('User created and updated:', user);
            router.replace('/login');
        } catch (error) {
            if (typeof error === "object" && error !== null && "message" in error) {
                console.error('Error signing up:', error.message);
            } else {
                console.error('An unexpected error occurred:', error);
            }
        }
        setIsSubmitting(false);
    };

    // Calculate logo position based on screen height
    const logoTopPosition = height < 700 ? height * 0.05 : height * 0.1;

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
            <ImageBackground
                source={images.bgImage}
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                <SafeAreaView style={styles.safeArea}>
                    <Image
                        style={[styles.logo, { top: logoTopPosition }]}
                        source={images.logo}
                        resizeMode="contain"
                    />
                </SafeAreaView>
                <Svg
                    height={height}
                    width={width}
                    viewBox={`0 0 ${width} ${height}`}
                    style={styles.svgContainer}
                    >
                    <Path
                        d={`M0,${height * 0.42} Q${width / 2},${height * 0.42 - 80} ${width},${height * 0.42} V${height} H0 Z`}
                        fill="#3A6A64"
                    />
                    <Path
                        d={`M0,${height * 0.42 + 40} Q${width / 2},${height * 0.42 + 60 - 100} ${width},${height * 0.42 + 45} V${height} H0 Z`}
                        fill="#2F5651"
                    />
                    </Svg>
            </ImageBackground>
            <ScrollView 
                style={[styles.scrollView, { marginTop: height * 0.45, zIndex: 1 }]}
                contentContainerStyle={styles.scrollViewContent}
            >
                <Text style={styles.loginTitle}>Sign Up</Text>
                <Text style={styles.loginSubtitle}>Create your account</Text>
                <FormField
                    title="Username"
                    placeholder='Username'
                    value={form.username}
                    handleChangeText={handleUsernameChange}
                    keyboardType="default"
                />
                {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}
                <FormField
                    title="Email"
                    placeholder='Email'
                    value={form.email}
                    handleChangeText={handleEmailChange}
                    keyboardType="email-address"
                />
                {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
                <FormField
                    title="Password"
                    value={form.password}
                    handleChangeText={handlePasswordChange}
                    keyboardType="default" 
                    placeholder='Password'
                />
                {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
                <CustomButton
                    title="Sign Up"
                    handlePress={createUser}
                    isLoading={isSubmitting}
                />
                <View style={styles.signupContainer}>
                    <Text style={styles.signupText}>Have an account already? </Text>
                    <Link href="/login" style={styles.signupLink}>Login</Link>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = EStyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    safeArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: width * 0.5,
        height: width * 0.5,
        position: 'absolute',
    },
    svgContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        zIndex: 0,
    },
    scrollView: {
        flex: 1,
    },
    scrollViewContent: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: '20rem',
    },
    loginTitle: {
        color: '#FFF',
        fontSize: '24rem',
        fontWeight: 'bold',
        marginBottom: '10rem',
    },
    loginSubtitle: {
        color: '#FFF',
        fontSize: '16rem',
        textAlign: 'center',
        marginBottom: '15rem',
    },
    forgotPassword: {
        color: '#FFF',
        fontSize: '16rem',
        marginTop: '20rem',
    },
    signupContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: '20rem',
    },
    signupText: {
        color: '#FFF',
        fontSize: '16rem',
    },
    signupLink: {
        color: '#FFF',
        fontSize: '16rem',
        textDecorationLine: 'underline',
    },
    errorText: {
        color: 'red',
        fontSize: '12rem',
        marginTop: '-16rem',
        marginLeft: '18rem',
        marginRight: '18rem',
    },
});

export default SignUp;