import React, { useState } from 'react';
import { ScrollView, View, Text, Image, StatusBar, StyleSheet, ImageBackground } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../../constants';
import { Dimensions } from 'react-native';
import FormField from '../../components/FormField';
import CustomButton from '../../components/button';
import { app, auth } from '../../firebase/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { router } from 'expo-router';
import CustomText from '@/components/CustomText';

const { height, width } = Dimensions.get('window');


const SignUp = () => {
    const [form, setForm] = useState({
        username: '',
        password: '',
        email: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUsernameChange = (text: string) => setForm(prevForm => ({ ...prevForm, username: text }));
    const handlePasswordChange = (text: string) => setForm(prevForm => ({ ...prevForm, password: text }));
    const handleEmailChange = (text: string) => setForm(prevForm => ({ ...prevForm, email: text }));

    const createUser = async () => {
        setIsSubmitting(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
            const user = userCredential.user;
            await updateProfile(user, { displayName: form.username });
            console.log('User created and updated:', user);
            // Handle post-signup logic here, like navigating to another screen
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

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
            <ImageBackground source={images.bgImage} style={styles.backgroundImage} resizeMode="cover">
                <SafeAreaView style={styles.imageAreaContent}>
                    <Image style={styles.logo} source={images.logo} />
                </SafeAreaView>
            </ImageBackground>
            <View style={styles.textSection}>
                <ScrollView contentContainerStyle={styles.contentContainer}>
                    <CustomText style={styles.loginTitle} fontWeight='semiBold'>Sign Up</CustomText>
                    <CustomText style={styles.loginSubtitle}>Create your account</CustomText>
                    <FormField title="Username" placeholder='Username' value={form.username} handleChangeText={handleUsernameChange} keyboardType="default" />
                    <FormField title="Email" placeholder='Email' value={form.email} handleChangeText={handleEmailChange} keyboardType="email-address" />
                    <FormField title="Password" value={form.password} handleChangeText={handlePasswordChange} keyboardType="default" placeholder='Password' />
                    <CustomButton title="Sign Up" handlePress={createUser} isLoading={isSubmitting} />
                    <CustomText style={styles.forgotPassword}></CustomText>
                    <View style={styles.signupContainer}>
                        <CustomText style={styles.signupText}>Have an account already? </CustomText>
                        <Link href="/login" style={styles.signupLink}>Login</Link>
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
        color: '#fff',
        fontSize: 24,
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
        fontWeight: 'regular',

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
        fontSize: 18,
        textDecorationLine: 'underline',
    }
});

export default SignUp;
