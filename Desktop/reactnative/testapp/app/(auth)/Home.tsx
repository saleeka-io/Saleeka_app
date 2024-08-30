import React from 'react';
import { View, Text, Image, TouchableOpacity, StatusBar, StyleSheet, Dimensions, ImageBackground } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { images } from '../..//constants';
import EStyleSheet from 'react-native-extended-stylesheet';
import CustomText from '@/components/CustomText';

const { height, width } = Dimensions.get('window');

// Set up EStyleSheet
EStyleSheet.build({ $rem: width / 380 });

const App = () => {
  // Calculate logo position based on screen height
  const logoTopPosition = height < 700 ? height * 0.05 : height * 0.1;

  return (
    <SafeAreaProvider>
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
          <View style={[styles.textContainer, { top: height * 0.5 }]}>
            <Text style={styles.welcomeText}>Welcome</Text>
            <Text style={styles.introText}>
              Your Guide To A Healthier Lifestyle, Way To A Better Living
            </Text>
            <TouchableOpacity style={styles.signUpButton}>
              <Link href="/Disclaimer" style={styles.linkText}>
                <Text style={styles.signUpText}>Sign Up Here</Text>
              </Link>
            </TouchableOpacity>
            <Text style={styles.loginPrompt}>
              Already have an account?{' '}
              <Link href="/login" style={styles.linkText}>
                <Text style={styles.loginLink}>Login</Text>
              </Link>
            </Text>
          </View>
        </ImageBackground>
      </View>
    </SafeAreaProvider>
  );
};

const styles = EStyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
  textContainer: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: '20rem',
  },
  welcomeText: {
    color: 'white',
    fontSize: '24rem',
    fontWeight: 'bold',
    marginBottom: '10rem',
  },
  introText: {
    color: 'white',
    fontSize: '16rem',
    textAlign: 'center',
    marginBottom: '15rem',
  },
  signUpButton: {
    backgroundColor: '#f1ede1',
    borderRadius: 18,
    paddingHorizontal: '24rem',
    paddingVertical: '12rem',
    marginTop: '30rem',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpText: {
    fontSize: '16rem',
    fontWeight: '500',
    color: '#030303',
  },
  loginPrompt: {
    color: 'white',
    fontSize: '16rem',
    marginTop: '20rem',
  },
  loginLink: {
    textDecorationLine: 'underline',
  },
  linkText: {
    textDecorationLine: 'none',
  },
});

export default App;