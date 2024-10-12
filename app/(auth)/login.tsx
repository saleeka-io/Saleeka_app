import React, { useState, useEffect, useRef } from 'react';
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
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
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

// Get the device dimensions for responsive design
const { width, height } = Dimensions.get('window');

// Calculate responsive font sizes and spacing
const responsiveFontSize = (size: number) => {
  const scaleFactor = Math.min(width, height) / 375; // Base scale on iPhone 8 screen width
  return Math.round(size * scaleFactor);
};

const responsiveSpacing = (space: number) => {
  const scaleFactor = Math.min(width, height) / 375;
  return Math.round(space * scaleFactor);
};

interface FirebaseAuthError {
  code: string;
  message: string;
}

// Create an animated version of LinearGradient for smooth transitions
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const Login = () => {
  // State variables for form inputs and UI control
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formOpacity] = useState(new Animated.Value(0));

  const scrollViewRef = useRef<ScrollView>(null);

  // Animate the form's opacity when the component mounts
  useEffect(() => {
    Animated.timing(formOpacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
    }, 100);
  
    return () => clearTimeout(timer);
  }, []);

  function isFirebaseError(error: unknown): error is FirebaseAuthError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      'message' in error &&
      typeof (error as any).code === 'string' &&
      typeof (error as any).message === 'string'
    );
  }
  

  // Handle the login process
  const handleLogin = async () => {
    setIsSubmitting(true);
    try {
      // Attempt to sign in with email and password
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      console.log('Logged in!', userCredential);
      // Clear the navigation stack and redirect to the scan page
      while (router.canGoBack()) {
        router.back();
      }
      router.replace('/scan');
    } catch (err) {
      console.error(err);
      // Handle different types of errors
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
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoidingView}
          >
            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={styles.scrollViewContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.headerContainer}>
                <Image source={images.HDlogo} style={styles.logo} resizeMode="contain" />
                <CustomText style={styles.title}>Welcome Back!</CustomText>
              </View>
              
              <Animated.View style={[styles.formContainer, { opacity: formOpacity }]}>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputContainer}>
                    <Ionicons name="mail-outline" size={responsiveFontSize(24)} color="#FFFFFF" style={styles.inputIcon} />
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
                </View>
                
                <View style={styles.inputWrapper}>
                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={responsiveFontSize(24)} color="#FFFFFF" style={styles.inputIcon} />
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
                        size={responsiveFontSize(24)}
                        color="#FFFFFF"
                        style={styles.passwordIcon}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                
                {error ? <CustomText style={styles.errorText}>{error}</CustomText> : null}
                
                <CustomButton
                  title="Log In"
                  handlePress={handleLogin}
                  isLoading={isSubmitting}
                  containerStyles={styles.loginButton}
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

                <TouchableOpacity style={styles.socialButton} onPress={handleAppleSignIn}>
                  <Ionicons name="logo-apple" size={responsiveFontSize(24)} color="#FFFFFF" style={styles.socialIcon} />
                  <CustomText style={styles.socialButtonText}>Login with Apple</CustomText>
                </TouchableOpacity>

                <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
                  <Ionicons name="logo-google" size={responsiveFontSize(24)} color="#FFFFFF" style={styles.socialIcon} />
                  <CustomText style={styles.socialButtonText}>Login with Google</CustomText>
                </TouchableOpacity>
              </Animated.View>
              
              <View style={styles.signupContainer}>
                <CustomText style={styles.signupText}>Don't have an account? </CustomText>
                <Link href="/Disclaimer" style={styles.signupLink}>
                  <CustomText style={styles.signupLinkText}>Sign Up</CustomText>
                </Link>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
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
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(20),
    paddingTop: Platform.OS === 'ios' ? responsiveSpacing(60) : responsiveSpacing(40),
    paddingBottom: responsiveSpacing(20),
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: responsiveSpacing(30),
  },
  logo: {
    paddingLeft: responsiveSpacing(18),
    position: 'relative',
    width: width * 0.8,
    height: width * 0.8 * (9/16),
    marginBottom: -responsiveSpacing(20),
    marginTop: -responsiveSpacing(34),
  },
  title: {
    fontSize: responsiveFontSize(22),
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  formContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: -responsiveSpacing(20),
  },
  inputWrapper: {
    width: '100%',
    marginBottom: responsiveSpacing(15),
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    position: 'relative',
  },
  inputIcon: {
    marginRight: responsiveSpacing(10),
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: responsiveFontSize(12),
    paddingVertical: responsiveSpacing(10),
  },
  passwordIcon: {
    marginLeft: responsiveSpacing(10),
  },
  errorText: {
    color: '#FFA500',
    marginBottom: responsiveSpacing(10),
    alignSelf: 'center',
    fontSize: responsiveFontSize(14),
  },
  loginButton: {
    width: '100%',
    marginTop: responsiveSpacing(20),
    borderRadius: responsiveSpacing(25),
  },
  forgotPassword: {
    color: '#FFFFFF',
    marginTop: responsiveSpacing(15),
    textDecorationLine: 'underline',
    fontSize: responsiveFontSize(14),
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: responsiveSpacing(20),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dividerText: {
    color: '#FFFFFF',
    paddingHorizontal: responsiveSpacing(10),
    fontSize: responsiveFontSize(14),
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: responsiveSpacing(50),
    borderRadius: responsiveSpacing(25),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: responsiveSpacing(15),
  },
  socialIcon: {
    marginRight: responsiveSpacing(10),
  },
  socialButtonText: {
    color: '#FFFFFF',
    fontSize: responsiveFontSize(16),
    fontWeight: '600',
  },
  appleButton: {
    width: '100%',
    height: responsiveSpacing(50),
    marginVertical: responsiveSpacing(10),
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: responsiveSpacing(20),
  },
  signupText: {
    color: '#FFFFFF',
    fontSize: responsiveFontSize(14),
  },
  signupLink: {
    marginLeft: responsiveSpacing(5),
  },
  signupLinkText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    fontSize: responsiveFontSize(14),
  },
});

export default Login;