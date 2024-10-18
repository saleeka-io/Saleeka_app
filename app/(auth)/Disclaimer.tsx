import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const Disclaimer = () => {
  const router = useRouter();

  const handleContinue = () => {
    // You might want to set a flag in AsyncStorage to remember that the user has agreed to the disclaimer
    // AsyncStorage.setItem('hasAgreedToDisclaimer', 'true');
    
    // Route to the index page
    router.replace('/SignUp');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Ionicons name="information-circle" size={80} color="#3A6A64" />
        <Text style={styles.title}>Disclaimer</Text>
        <Text style={styles.message}>
          The information and scale provided in this application are based on our research and analysis. We strive to provide accurate and up-to-date information, but we cannot guarantee its completeness or accuracy.
        </Text>
        <Text style={styles.message}>
          Our intent is not to defame any company or product. The assessments and ratings are provided for informational purposes only and should not be considered as definitive judgments on any company or product.
        </Text>
        <Text style={styles.message}>
          Users should use this information as a starting point for their own research and decision-making process. We encourage users to consult multiple sources and professional advice when making important decisions related to their health and nutrition.
        </Text>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>I Agree, Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1ede1',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3A6A64',
    marginTop: 20,
    marginBottom: 10,
  },
  message: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  continueButton: {
    backgroundColor: '#3A6A64',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  continueButtonText: {
    color: '#f1ede1',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Disclaimer;