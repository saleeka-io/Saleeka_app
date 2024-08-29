import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const ContactUs = () => {
  const router = useRouter();

  const handleEmailPress = () => {
    Linking.openURL('mailto:contact@saleeka.io');
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#3A6A64" />
      </TouchableOpacity>
      <View style={styles.content}>
        <Ionicons name="mail" size={80} color="#3A6A64" />
        <Text style={styles.title}>Contact Us</Text>
        <Text style={styles.message}>
          We'd love to hear from you! If you have any questions, feedback, or concerns, please don't hesitate to reach out.
        </Text>
        <TouchableOpacity style={styles.emailButton} onPress={handleEmailPress}>
          <Ionicons name="mail-outline" size={24} color="#f1ede1" style={styles.emailIcon} />
          <Text style={styles.emailButtonText}>contact@saleeka.io</Text>
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
  backButton: {
    padding: 10,
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
  emailButton: {
    backgroundColor: '#3A6A64',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  emailIcon: {
    marginRight: 10,
  },
  emailButtonText: {
    color: '#f1ede1',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ContactUs;