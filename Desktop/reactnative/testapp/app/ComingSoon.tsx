import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const ComingSoon = () => {
  const router = useRouter();

  const handleDonation = () => {
    // Replace with your actual donation page route
    router.push('/Donation');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="hourglass-outline" size={80} color="#3A6A64" />
        <Text style={styles.title}>Coming Soon</Text>
        <Text style={styles.message}>
          We're working hard to bring you this feature. Stay tuned!
        </Text>
        <TouchableOpacity style={styles.donateButton} onPress={handleDonation}>
          <Text style={styles.donateButtonText}>Support Our Work</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1ede1',
  },
  content: {
    flex: 1,
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
    marginBottom: 30,
  },
  donateButton: {
    backgroundColor: '#3A6A64',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  donateButtonText: {
    color: '#f1ede1',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ComingSoon;