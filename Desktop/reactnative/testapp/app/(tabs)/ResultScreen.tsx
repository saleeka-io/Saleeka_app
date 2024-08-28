import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Dimensions, TouchableOpacity, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import bannedIngredientsData from '../bannedIngredients.json';

interface ProductData {
  product_name: string;
  ingredients: string[];
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  image_url: string | null;
}

const ResultScreen = () => {
  const { productData } = useLocalSearchParams();
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;

  if (!productData) {
    return <Text>Product data not found</Text>;
  }

  const product: ProductData = JSON.parse(decodeURIComponent(productData as string));

  // Log the entire product data to inspect what fields are returned
  console.log('Product Data:', product);

  // Safety check to ensure ingredients is defined
  const ingredients = product.ingredients || [];

  // Log the ingredients
  console.log('Ingredients:', ingredients);

  // Check for banned ingredients
  const bannedIngredients = bannedIngredientsData.bannedIngredients.filter((ingredient) =>
    ingredients.some((prodIngredient) =>
      prodIngredient.toLowerCase().includes(ingredient.name.toLowerCase())
    )
  );

const navigateToScoreScreen = () => {
  router.push('/score');
};
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>
          Product Analysis by <Text style={styles.titleHighlight}>Saleeka</Text>
        </Text>
        
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image_url || '' }} style={styles.productImage} />
          <View style={styles.checkmarkContainer}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          </View>
        </View>

        <LinearGradient 
          colors={['#2F5651', '#478B4E']} 
          style={styles.gradientBackground}
        >
          <View style={styles.productCard}>
            <View style={styles.productInfo}>
              <Text style={styles.label}>Product Name:</Text>
              <Text style={styles.productName}>{product.product_name}</Text>
            </View>

            {bannedIngredients.length > 0 && (
              <View style={styles.warningSection}>
                <Text style={styles.warningTitle}>Warning! This product contains:</Text>
                {bannedIngredients.map((ingredient) => (
                  <Text key={ingredient.name} style={styles.warningText}>
                    {ingredient.name} ({ingredient.reason})
                  </Text>
                ))}
              </View>
            )}

            <View style={styles.ratingBar}>
              <Text style={styles.learnMore}>*Learn more</Text>
              <View style={styles.ratingRow}>
                <View style={styles.ratingIndicator}>
                  <View style={styles.ratingFill} />
                </View>
                <Text style={styles.rating}>Product Rating: Excellent</Text>
              </View>
            </View>

            <View style={styles.nutritionalInfo}>
              <Text style={styles.nutritionalTitle}>Per Serving:</Text>
              <Text style={styles.nutritionalText}>Calories(Kcal): {product.calories}</Text>
              <Text style={styles.nutritionalText}>Protein: {product.protein}g</Text>
              <Text style={styles.nutritionalText}>Carbs: {product.carbs}g</Text>
              <Text style={styles.nutritionalText}>Fats: {product.fat}g</Text>
            </View>

            <TouchableOpacity style={styles.section}>
              <Text style={styles.sectionTitle}>Additives</Text>
              <Ionicons name="chevron-forward" size={24} color="#2C2C2C" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.section}>
              <Text style={styles.sectionTitle}>Allergies</Text>
              <Ionicons name="chevron-forward" size={24} color="#2C2C2C" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.healthScoreButton} onPress={navigateToScoreScreen}>
            <Text style={styles.healthScoreText}>View Health Score Scale</Text>
          </TouchableOpacity>
          </View>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C2C2C',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  titleHighlight: {
    color: '#43A047',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  productImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 10,
    right: 80,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 2,
  },
  gradientBackground: {
    flex: 1,
    width: '100%',
    paddingTop: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  productCard: {
    padding: 16,
  },
  productInfo: {
    marginBottom: 10,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  productName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  warningSection: {
    marginBottom: 15,
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 10,
  },
  warningTitle: {
    fontWeight: 'bold',
    color: '#D32F2F',
    fontSize: 16,
    marginBottom: 5,
  },
  warningText: {
    color: '#D32F2F',
    fontSize: 14,
    marginBottom: 2,
  },
  ratingBar: {
    marginBottom: 10,
  },
  learnMore: {
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 5,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rating: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  ratingIndicator: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  ratingFill: {
    backgroundColor: '#66BB6A',
    height: 8,
    borderRadius: 4,
    width: '85%',
  },
  nutritionalInfo: {
    backgroundColor: '#F1F8E9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
  },
  nutritionalTitle: {
    color: '#2C2C2C',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  nutritionalText: {
    color: '#2C2C2C',
    fontSize: 14,
    marginBottom: 2,
  },
  section: {
    backgroundColor: '#E8F5E9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C2C2C',
  },
  healthScoreButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  healthScoreText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ResultScreen;
