import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const Donation = () => {
  const router = useRouter();
  const [amount, setAmount] = useState('');

  const handleDonation = () => {
    // This is where you would implement the Apple Pay functionality
    Alert.alert('Thank you!', `Your donation of $${amount} is appreciated. Apple Pay integration coming soon!`);
  };

  const predefinedAmounts = [5, 10, 20, 50];

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#3A6A64" />
      </TouchableOpacity>
      <View style={styles.content}>
        <Ionicons name="heart" size={80} color="#3A6A64" />
        <Text style={styles.title}>Support Our Work</Text>
        <Text style={styles.message}>
          Your donation helps us continue our mission to provide nutritional information to everyone.
        </Text>
        <View style={styles.amountContainer}>
          {predefinedAmounts.map((presetAmount) => (
            <TouchableOpacity
              key={presetAmount}
              style={[styles.amountButton, amount === presetAmount.toString() && styles.selectedAmount]}
              onPress={() => setAmount(presetAmount.toString())}
            >
              <Text style={[styles.amountButtonText, amount === presetAmount.toString() && styles.selectedAmountText]}>
                ${presetAmount}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.customAmount}
          placeholder="Enter custom amount"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <TouchableOpacity style={styles.donateButton} onPress={handleDonation}>
          <Ionicons name="logo-apple" size={24} color="#f1ede1" style={styles.appleIcon} />
          <Text style={styles.donateButtonText}>Donate with Apple Pay</Text>
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
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  amountButton: {
    backgroundColor: '#f1ede1',
    borderWidth: 2,
    borderColor: '#3A6A64',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  selectedAmount: {
    backgroundColor: '#3A6A64',
  },
  amountButtonText: {
    color: '#3A6A64',
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectedAmountText: {
    color: '#f1ede1',
  },
  customAmount: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#3A6A64',
    borderRadius: 25,
    padding: 15,
    fontSize: 18,
    marginBottom: 20,
  },
  donateButton: {
    backgroundColor: '#3A6A64',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  appleIcon: {
    marginRight: 10,
  },
  donateButtonText: {
    color: '#f1ede1',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Donation;