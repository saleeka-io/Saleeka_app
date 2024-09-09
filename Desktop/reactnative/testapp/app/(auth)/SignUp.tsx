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
  ScrollView,
  KeyboardAvoidingView,
  Platform,
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

const SignUp = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [formOpacity] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(formOpacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const validateUsername = (username: string) => {
    if (!/^[A-Za-z]+$/.test(username)) {
      setErrors((prev) => ({ ...prev, username: 'Username must contain only A-Z characters' }));
    } else {
      setErrors((prev) => ({ ...prev, username: '' }));
    }
  };

  const validatePassword = (password: string) => {
    if (password.length < 8 || !/\d/.test(password) || !/[!@#$%^&*]/.test(password)) {
      setErrors((prev) => ({
        ...prev,
        password: 'Password must be 8+ characters with at least one number and special character',
      }));
    } else {
      setErrors((prev) => ({ ...prev, password: '' }));
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors((prev) => ({ ...prev, email: 'Please enter a valid email address' }));
    } else {
      setErrors((prev) => ({ ...prev, email: '' }));
    }
  };

  const handleUsernameChange = (text: string) => {
    setForm((prevForm) => ({ ...prevForm, username: text }));
    validateUsername(text);
  };

  const handlePasswordChange = (text: string) => {
    setForm((prevForm) => ({ ...prevForm, password: text }));
    validatePassword(text);
  };

  const handleEmailChange = (text: string) => {
    setForm((prevForm) => ({ ...prevForm, email: text }));
    validateEmail(text);
  };

  const handleSignUp = async () => {
    setIsSubmitting(true);
    if (!errors.username && !errors.email && !errors.password) {
      try {
        const userCredential = await auth().createUserWithEmailAndPassword(form.email, form.password);
        if (userCredential.user) {
          await userCredential.user.updateProfile({
            displayName: form.username,
          });
          const userRef = firestore().collection('Users').doc(userCredential.user.uid);
          await userRef.set({
            username: form.username,
            email: form.email,
          });
          while (router.canGoBack()) {
            router.back();
          }
          router.replace('/scan');
        }
      } catch (err) {
        console.error(err);
        setError('Error creating account. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setError('Please fix the errors before submitting.');
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      console.log('Starting Google Sign-In process...');

      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      console.log('Google Play Services are available');

      const signInResult: any = await GoogleSignin.signIn();
      console.log('Google Sign-In result:', JSON.stringify(signInResult, null, 2));

      const idToken = signInResult?.idToken || signInResult?.user?.idToken || signInResult?.data?.idToken;
      const accessToken =
        signInResult?.accessToken || signInResult?.user?.accessToken || signInResult?.data?.accessToken;

      if (!idToken) {
        console.error('No idToken found in sign-in result');
        throw new Error('Google sign-up failed: No idToken found');
      }

      console.log('idToken successfully retrieved');

      const googleCredential = auth.GoogleAuthProvider.credential(idToken, accessToken);
      console.log('Google credential created');

      const userCredential = await auth().signInWithCredential(googleCredential);
      console.log('Firebase sign-in successful');
      console.log('User UID:', userCredential.user.uid);

      if (userCredential.user) {
        const userRef = firestore().collection('Users').doc(userCredential.user.uid);
        await userRef.set({
          username: userCredential.user.displayName,
          email: userCredential.user.email,
        });
        console.log('User data saved to Firestore');
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
      setError('Google sign-up failed. Please try again.');
    }
  };

  const handleAppleSignUp = async () => {
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      const { identityToken, nonce } = appleAuthRequestResponse;

      if (!identityToken) {
        throw new Error('Apple Sign-In failed - no identity token returned');
      }

      const appleCredential = auth.AppleAuthProvider.credential(identityToken, nonce);

      const userCredential = await auth().signInWithCredential(appleCredential);

      if (userCredential.user) {
        const userRef = firestore().collection('Users').doc(userCredential.user.uid);
        await userRef.set({
          username: userCredential.user.displayName || 'Apple User',
          email: userCredential.user.email,
        });
        console.log('User data saved to Firestore');
        router.replace('/scan');
      }
    } catch (error: any) {
      console.error('Apple Sign-Up Error:', error);
      Alert.alert('Apple Sign-Up Error', error.message);
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
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
          >
            <ScrollView
              contentContainerStyle={styles.scrollViewContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.headerContainer}>
                <Image source={images.logo} style={styles.logo} resizeMode="contain" />
                <CustomText style={styles.title}>Create Account</CustomText>
              </View>
              <Animated.View style={[styles.formContainer, { opacity: formOpacity }]}>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputContainer}>
                    <Ionicons name="person-outline" size={24} color="#FFFFFF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={form.username}
                      onChangeText={handleUsernameChange}
                      placeholder="Username"
                      placeholderTextColor="#A0AEC0"
                      autoCapitalize="none"
                    />
                  </View>
                  <Text style={styles.errorText}>{errors.username}</Text>
                </View>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputContainer}>
                    <Ionicons name="mail-outline" size={24} color="#FFFFFF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={form.email}
                      onChangeText={handleEmailChange}
                      placeholder="Email"
                      placeholderTextColor="#A0AEC0"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                  <Text style={styles.errorText}>{errors.email}</Text>
                </View>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed-outline" size={24} color="#FFFFFF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      value={form.password}
                      onChangeText={handlePasswordChange}
                      placeholder="Password"
                      placeholderTextColor="#A0AEC0"
                      secureTextEntry={!isPasswordVisible}
                    />
                    <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                      <Ionicons
                        name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                        size={24}
                        color="#FFFFFF"
                        style={styles.passwordIcon}
                      />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.errorText}>{errors.password}</Text>
                </View>
                {error ? <CustomText style={styles.generalErrorText}>{error}</CustomText> : null}
                <CustomButton
                  title="Sign Up"
                  handlePress={handleSignUp}
                  isLoading={isSubmitting}
                  style={styles.signUpButton}
                />

                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <CustomText style={styles.dividerText}>OR</CustomText>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity style={styles.socialButton} onPress={handleGoogleSignUp}>
                  <Ionicons name="logo-google" size={24} color="#FFFFFF" style={styles.socialIcon} />
                  <CustomText style={styles.socialButtonText}>Sign up with Google</CustomText>
                </TouchableOpacity>

                <AppleButton
                  style={styles.appleButton}
                  buttonStyle={AppleButton.Style.WHITE}
                  buttonType={AppleButton.Type.SIGN_UP}
                  onPress={handleAppleSignUp}
                />
              </Animated.View>
              <View style={styles.loginContainer}>
                <CustomText style={styles.loginText}>Already have an account? </CustomText>
                <Link href="/login" style={styles.loginLink}>
                  <CustomText style={styles.loginLinkText}>Log In</CustomText>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
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
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 15,
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
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 10,
  },
  passwordIcon: {
    marginLeft: 10,
  },
  errorText: {
    color: '#FFA500',
    fontSize: 12,
    marginTop: 5,
    minHeight: 15, // Ensures consistent height even when empty
  },
  generalErrorText: {
    color: '#FFA500',
    marginBottom: 10,
    alignSelf: 'center',
  },
  signUpButton: {
    width: '100%',
    marginTop: 10,
    borderRadius: 25,
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#FFFFFF',
  },
  loginLink: {
    marginLeft: 5,
  },
  loginLinkText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default SignUp;
