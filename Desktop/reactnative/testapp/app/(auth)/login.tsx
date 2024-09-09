import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  Keyboard,
  Animated,
  TouchableWithoutFeedback,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { images } from '../../constants';
import CustomText from '@/components/CustomText';
import CustomButton from '../../components/button';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { AppleButton, appleAuth } from '@invertase/react-native-apple-authentication';

const { width } = Dimensions.get('window');

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formOpacity] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(formOpacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const isFirebaseError = (error: any) => {
    return typeof error.code === 'string' && typeof error.message === 'string';
  };

  const handleLogin = async () => {
    setIsSubmitting(true);
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      console.log('Logged in!', userCredential);
      while (router.canGoBack()) {
        router.back();
      }
      router.replace('/scan');
    } catch (err) {
      console.error(err);
      if (isFirebaseError(err)) {
        if (err.code.startsWith('auth/')) {
          setError('Invalid email or password');
        }
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      console.log('Starting Google Sign-In process...');
      
      // Check if Google Services are available
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      console.log('Google Play Services are available');
      
      // Perform Google Sign-In
      const signInResult: any = await GoogleSignin.signIn();
      console.log('Google Sign-In result:', JSON.stringify(signInResult, null, 2));
      
      // Attempt to retrieve idToken and accessToken
      const idToken = signInResult?.idToken || signInResult?.user?.idToken || signInResult?.data?.idToken;
      const accessToken = signInResult?.accessToken || signInResult?.user?.accessToken || signInResult?.data?.accessToken;
  
      if (!idToken) {
        console.error('No idToken found in sign-in result');
        throw new Error('Google sign-in failed: No idToken found');
      }
  
      console.log('idToken successfully retrieved');
  
      // Create a credential using the Google ID token and access token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken, accessToken);
      console.log('Google credential created');
      
      // Sign in to Firebase with the Google credential
      const userCredential = await auth().signInWithCredential(googleCredential);
      console.log('Firebase sign-in successful');
      console.log('User UID:', userCredential.user.uid);
  
      // Save user data to Firestore
      if (userCredential.user) {
        const userRef = firestore().collection('Users').doc(userCredential.user.uid);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
          // User does not exist, so create a new document
          await userRef.set({
            username: userCredential.user.displayName,
            email: userCredential.user.email,
          });
          console.log('User data saved to Firestore');
        } else {
          console.log('User already exists in Firestore');
        }
        
        router.replace('/scan');
      }
    } catch (error: any) {
      console.error('Detailed Google Sign-In Error:', error);
      if (error.code) {
        console.error('Error code:', error.code);
      }
      if (error.message) {
        console.error('Error message:', error.message);
      }
      setError('Google sign-in failed. Please try again.');
    }
  };

  const handleAppleSignIn = async () => {
    try {
      // Start the Apple sign-in request
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      const { identityToken, nonce } = appleAuthRequestResponse;

      if (!identityToken) {
        throw new Error('Apple Sign-In failed - no identity token returned');
      }

      // Create a Firebase credential with the token
      const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);

      // Sign in to Firebase with the Apple credential
      const userCredential = await auth().signInWithCredential(appleCredential);

      // Check if the user data exists in Firestore and create it if necessary
      if (userCredential.user) {
        const userRef = firestore().collection('Users').doc(userCredential.user.uid);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
          // User does not exist, so create a new document
          await userRef.set({
            username: userCredential.user.displayName || 'Apple User',
            email: userCredential.user.email,
          });
          console.log('User data saved to Firestore');
        } else {
          console.log('User already exists in Firestore');
        }
        
        router.replace('/scan');
      }
    } catch (error: any) {
      console.error('Apple Sign-In Error:', error);
      Alert.alert('Apple Sign-In Error', error.message);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <AnimatedLinearGradient
        colors={['#3A6A64', '#2F5651']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerContainer}>
            <Image source={images.logo} style={styles.logo} resizeMode="contain" />
            <CustomText style={styles.title}>Welcome Back</CustomText>
          </View>
          <Animated.View style={[styles.formContainer, { opacity: formOpacity }]}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={24} color="#FFFFFF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor="#A0AEC0"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={24} color="#FFFFFF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#A0AEC0"
                secureTextEntry={!isPasswordVisible}
              />
              <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                <Ionicons
                  name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                  size={24}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>
            {error ? <CustomText style={styles.errorText}>{error}</CustomText> : null}
            <CustomButton
              title="Log In"
              handlePress={handleLogin}
              isLoading={isSubmitting}
              style={styles.loginButton}
            />
            <Link href="/ForgotPassword" asChild>
              <TouchableOpacity>
                <CustomText style={styles.forgotPassword}>Forgot Password?</CustomText>
              </TouchableOpacity>
            </Link>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <CustomText style={styles.dividerText}>OR</CustomText>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
              <Ionicons name="logo-google" size={24} color="#FFFFFF" style={styles.socialIcon} />
              <CustomText style={styles.socialButtonText}>Login with Google</CustomText>
            </TouchableOpacity>

            <AppleButton
              style={styles.appleButton}
              buttonStyle={AppleButton.Style.BLACK}
              buttonType={AppleButton.Type.SIGN_IN}
              onPress={handleAppleSignIn}
            />
          </Animated.View>
          <View style={styles.signupContainer}>
            <CustomText style={styles.signupText}>Don't have an account? </CustomText>
            <Link href="/Disclaimer" style={styles.signupLink}>
              <CustomText style={styles.signupLinkText}>Sign Up</CustomText>
            </Link>
          </View>
        </SafeAreaView>
      </AnimatedLinearGradient>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logo: {
    width: width * 0.3,
    height: width * 0.3,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: -80,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 10,
  },
  loginButton: {
    width: '100%',
    marginTop: 20,
    borderRadius: 25,
  },
  errorText: {
    color: '#FFA500',
    marginBottom: 10,
  },
  forgotPassword: {
    color: '#FFFFFF',
    marginTop: 15,
    textDecorationLine: 'underline',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    color: '#FFFFFF',
    paddingHorizontal: 10,
    fontSize: 14,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 15,
  },
  socialIcon: {
    marginRight: 10,
  },
  socialButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  appleButton: {
    width: '100%',
    height: 50,
    marginVertical: 10,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    color: '#FFFFFF',
  },
  signupLink: {
    marginLeft: 5,
  },
  signupLinkText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default Login;
