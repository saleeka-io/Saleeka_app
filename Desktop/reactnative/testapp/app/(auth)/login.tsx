import React, { useState } from 'react';
import { View, Text, Image, StatusBar, StyleSheet, ImageBackground, Dimensions, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import EStyleSheet from 'react-native-extended-stylesheet';
import Svg, { Path } from 'react-native-svg';
import { images } from '../../constants';
import FormField from '../../components/FormField';
import CustomButton from '../../components/button';

const { width, height } = Dimensions.get('window');

// Set up EStyleSheet
EStyleSheet.build({ $rem: width / 380 });

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
});

export default Login;