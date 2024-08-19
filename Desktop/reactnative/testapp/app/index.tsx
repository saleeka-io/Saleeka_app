import React from 'react';
import { View, Text, Image, TouchableOpacity, StatusBar, StyleSheet, Dimensions, Platform, ImageBackground } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { images } from '../constants';
const { height, width } = Dimensions.get('window');
const curveStartY = height * 0.42; // Example adjustment for starting Y position of the curves
const lowerCurveStartY = curveStartY + 60; // Slightly lower start for the second curve


const App = () => {
  return (
    <SafeAreaProvider>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.fullScreen}>
        <ImageBackground
          source={images.bgImage}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <SafeAreaView style={styles.safeAreaContent}>
            <Image
              style={styles.logo}
              source={images.logo}
            />
            <Svg
              height={height} // Ensure it's set to full height
              width={width} // Ensure it's set to full width
              viewBox={`0 0 ${width} ${height}`} // Adjust the viewBox
              style={styles.curvedContainers}
            >
              <Path
                d={`M0,${curveStartY} Q${width / 2},${curveStartY - 80} ${width},${curveStartY} V${height} H0 Z`}
                fill="#3A6A64"
              />
              <Path
                d={`M0,${lowerCurveStartY} Q${width / 2},${lowerCurveStartY - 80} ${width},${lowerCurveStartY} V${height} H0 Z`}
                fill="#2F5651"
              />
            </Svg>
            <View style={[styles.textContainer, { top: height * 0.5 }]}>
              <Text style={[styles.welcomeText, { fontSize: height * 0.04 }]}>Welcome</Text>
              <Text style={[styles.introText, { fontSize: height * 0.025 }]}>
                Your Guide To A Healthier Lifestyle, Way To A Better Living
              </Text>
              <TouchableOpacity onPress={() => console.log('Sign Up Pressed')} style={styles.signUpButton}>
                <Link href="/login" style={styles.linkText}>
                  <Text style={[styles.signUpText, { fontSize: height * 0.03 }]}>Sign Up Here</Text>
                </Link>
              </TouchableOpacity>
              <Text style={[styles.loginPrompt, { fontSize: height * 0.02 }]}>
                Already have an account?{' '}
                <Link href="/login" style={styles.linkText}>
                  <Text style={styles.loginLink}>Login</Text>
                </Link>
              </Text>
            </View>
          </SafeAreaView>
        </ImageBackground>
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeAreaContent: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: width * 0.5,
    height: height * 0.30,
    resizeMode: 'contain',
  },
  curvedContainers: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: '100%',
  },
  textContainer: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  welcomeText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'Poppins-SemiBold',
  },
  introText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 8,
  },
  signUpButton: {
    backgroundColor: '#f1ede1',
    borderRadius: 18,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpText: {
    fontWeight: 'medium',
    color: '#030303',
  },
  loginPrompt: {
    color: 'white',
    marginTop: 16,
  },
  loginLink: {
    textDecorationLine: 'underline',
  },
  linkText: {
    textDecorationLine: 'none',
  },
});

export default App;
