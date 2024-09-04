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

const { width, height } = Dimensions.get('window');

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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // New state for password visibility
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

  const handleSignUp = async () => {
    setIsSubmitting(true);
    if (!errors.username && !errors.email && !errors.password) {
      try {
        const userCredential = await auth().createUserWithEmailAndPassword(form.email, form.password);
        if (userCredential.user) {
          await userCredential.user.updateProfile({
            displayName: form.username
          });
          const userRef = firestore().collection('Users').doc(userCredential.user.uid);
          await userRef.set({
            username: form.username,
            email: form.email
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

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <AnimatedLinearGradient
        colors={['#3A6A64', '#2F5651']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.headerContainer}>
            <Image source={images.logo} style={styles.logo} resizeMode="contain" />
            <CustomText style={styles.title}>Create Account</CustomText>
          </View>
          <Animated.View style={[styles.formContainer, { opacity: formOpacity }]}>
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
            {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}
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
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={24} color="#FFFFFF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={form.password}
                onChangeText={handlePasswordChange}
                placeholder="Password"
                placeholderTextColor="#A0AEC0"
                secureTextEntry={!isPasswordVisible} // Toggle secureTextEntry based on isPasswordVisible
              />
              <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                <Ionicons
                  name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                  size={24}
                  color="#FFFFFF"
                  style={styles.passwordIcon}
                />
              </TouchableOpacity>
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            {error ? <CustomText style={styles.errorText}>{error}</CustomText> : null}
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

            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-apple" size={24} color="#FFFFFF" style={styles.socialIcon} />
              <CustomText style={styles.socialButtonText}>Sign up with Apple</CustomText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-google" size={24} color="#FFFFFF" style={styles.socialIcon} />
              <CustomText style={styles.socialButtonText}>Sign up with Google</CustomText>
            </TouchableOpacity>
          </Animated.View>
          <View style={styles.loginContainer}>
            <CustomText style={styles.loginText}>Already have an account? </CustomText>
            <Link href="/login" style={styles.loginLink}>
              <CustomText style={styles.loginLinkText}>Log In</CustomText>
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
    position: 'relative', // Ensure proper positioning for the eye icon
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
  signUpButton: {
    width: '100%',
    marginTop: 20,
    borderRadius: 25,
  },
  errorText: {
    color: '#FFA500',
    marginBottom: 10,
    alignSelf: 'flex-start',
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
