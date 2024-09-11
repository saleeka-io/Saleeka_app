import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import EStyleSheet from 'react-native-extended-stylesheet';

const score = () => {
  const router = useRouter();

  const RatingBar = ({ color, width }: { color: string; width: string }) => (
    <View style={[styles.ratingBar, { backgroundColor: color, width }]} />
  );

  const RatingSection = ({ rating, color, description, icon }: { rating: string; color: string; description: string; icon: React.ReactNode }) => (
    <View style={styles.ratingSection}>
      <Text style={styles.ratingText}>Product Rating: <Text style={{ color }}>{rating}</Text></Text>
      <View style={styles.ratingContent}>
        <RatingBar color={color} width={rating === 'Excellent' ? '90%' : rating === 'Okay' ? '50%' : '20%'} />
        <View style={styles.descriptionContainer}>
          {icon}
          <Text style={styles.descriptionText}>{description}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="arrow-back" size={24} color="#3A6A64" onPress={() => router.back()} />
          <Text style={styles.title}>Learn what our scale means</Text>
        </View>
        
        <RatingSection 
          rating="Excellent" 
          color="#4CAF50" 
          description="Clean Ingredients (Saleeka Approved)"
          icon={<Ionicons name="checkmark-circle" size={24} color="#4CAF50" />}
        />
        
        <RatingSection 
          rating="Okay" 
          color="#FFC107" 
          description="Use with caution (some people can be sensitive to ingredients in the product)"
          icon={<Ionicons name="warning" size={24} color="#FFC107" />}
        />
        
        <RatingSection 
          rating="Poor" 
          color="#F44336" 
          description="Not recommended (product has ingredients which are seen to cause health issues in research)"
          icon={<Ionicons name="close-circle" size={24} color="#F44336" />}
        />

        <Text style={styles.footnote}>
          *Learn more about the research backing our approval at saleeka.io
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1ede1',
  },
  scrollContent: {
    padding: '20rem',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: '20rem',
  },
  title: {
    fontSize: '22rem',
    fontWeight: 'bold',
    color: '#3A6A64',
    marginLeft: '15rem',
  },
  ratingSection: {
    marginBottom: '30rem',
  },
  ratingText: {
    fontSize: '18rem',
    fontWeight: '600',
    marginBottom: '10rem',
  },
  ratingContent: {
    backgroundColor: 'white',
    borderRadius: '10rem',
    padding: '15rem',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingBar: {
    height: '10rem',
    borderRadius: '5rem',
    marginBottom: '10rem',
  },
  descriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  descriptionText: {
    fontSize: '14rem',
    marginLeft: '10rem',
    flex: 1,
  },
  footnote: {
    fontSize: '12rem',
    color: '#666',
    textAlign: 'center',
    marginTop: '20rem',
  },
});

export default score;