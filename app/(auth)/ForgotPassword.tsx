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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { images } from '../../constants';
import CustomText from '@/components/CustomText';
import CustomButton from '../../components/button';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formOpacity] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(formOpacity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleResetPassword = async () => {
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    // Here you would typically call your authentication service
    // For now, we'll just simulate the process
    try {
      // Simulating an API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulating a successful password reset request
      setSuccess('Password reset link sent to your email.');
    } catch (err) {
      console.error(err);
      setError('Failed to send reset link. Please try again.');
    } finally {
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
            <CustomText style={styles.title}>Forgot Password?</CustomText>
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
            {error ? <CustomText style={styles.errorText}>{error}</CustomText> : null}
            {success ? <CustomText style={styles.successText}>{success}</CustomText> : null}
            <CustomButton
              title="Reset Password"
              handlePress={handleResetPassword}
              isLoading={isSubmitting}
              style={styles.resetButton}
            />
          </Animated.View>
          <View style={styles.loginContainer}>
            <CustomText style={styles.loginText}>Remember your password? </CustomText>
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
    marginTop: -300,
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
  resetButton: {
    width: '100%',
    marginTop: 20,
    borderRadius: 25,
  },
  errorText: {
    color: '#FFA500',
    marginBottom: 10,
  },
  successText: {
    color: '#00FF00',
    marginBottom: 10,
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

export default ForgotPassword;