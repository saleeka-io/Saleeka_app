import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const ComingSoon = () => {
  const router = useRouter();

  const handleDonation = () => {
    router.push('/Donation');
  };

  const navigateBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={navigateBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#3A6A64" />
        </TouchableOpacity>
      </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
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