import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { Buffer } from 'buffer';
import redXAnimation from '../../assets/lottie/RedX.json';
import checkmarkAnimation from '../../assets/lottie/Checkmark.json';
import cautionAnimation from '../../assets/lottie/Caution.json';

import bannedIngredientsData from '../bannedIngredients.json';
import { Ionicons } from '@expo/vector-icons';

interface ProductData {
  product_name: string;
  ingredients: string[];
  additives: { code: string; name: string }[];
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  image_url: string | null;
}

interface BannedIngredient {
  name: string;
  casNumber: string;
  reason: string;
  severity: 'red' | 'yellow' | 'green';
}

const ResultScreen = () => {
  const { productData } = useLocalSearchParams();
  const router = useRouter();
  const fillAnimation = useRef(new Animated.Value(0)).current;
  const [showAdditives, setShowAdditives] = useState(false);

  if (!productData) {
    return <Text>Product data not found</Text>;
  }

  const product: ProductData = JSON.parse(Buffer.from(productData as string, 'base64').toString('utf-8'));  const ingredients = product.ingredients || [];
  const additives = product.additives || [];

  const bannedIngredients: BannedIngredient[] = bannedIngredientsData.bannedIngredients.filter((ingredient) =>
    ingredients.some((prodIngredient) =>
      prodIngredient.toLowerCase().includes(ingredient.name.toLowerCase())
    )
  ) as BannedIngredient[];

  const calculateRating = (
    bannedIngredients: BannedIngredient[]
  ): { rating: string; color: string; fillPercentage: number; animation: any } => {
    if (bannedIngredients.length === 0) {
      return { rating: 'Excellent', color: '#4CAF50', fillPercentage: 100, animation: checkmarkAnimation };
    }

    const severityCount = {
      red: bannedIngredients.filter((i) => i.severity === 'red').length,
      yellow: bannedIngredients.filter((i) => i.severity === 'yellow').length,
      green: bannedIngredients.filter((i) => i.severity === 'green').length,
    };

    if (severityCount.red > 0) {
      return { rating: 'Poor', color: '#D32F2F', fillPercentage: 25, animation: redXAnimation };
    } else if (severityCount.yellow > 0) {
      return { rating: 'Fair', color: '#FFA000', fillPercentage: 50, animation: cautionAnimation };
    } else {
      return { rating: 'Good', color: '#4CAF50', fillPercentage: 75, animation: checkmarkAnimation };
    }
  };

  const { rating, color, fillPercentage, animation } = calculateRating(bannedIngredients);

  useEffect(() => {
    // Delay the animation by 500ms
    setTimeout(() => {
      Animated.timing(fillAnimation, {
        toValue: fillPercentage,
        duration: 1500, // Increased duration for better visibility
        useNativeDriver: false,
      }).start();
    }, 750);
  }, [fillPercentage]);

  const navigateToScoreScreen = () => {
    router.push('/score');
  };

  const width = fillAnimation.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const toggleAdditives = () => {
    setShowAdditives(!showAdditives);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>
          Product Analysis by <Text style={styles.titleHighlight}>Saleeka</Text>
        </Text>

        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image_url || '' }} style={styles.productImage} />
          <LottieView
          source={animation}
          autoPlay
          loop={false}
          speed={0.75}  // Slows down the animation by 25%
          style={{ 
            width: 100, 
            height: 100, 
            position: 'absolute', 
            right: 30, // Adjust this value to shift it further right
            top: '50%', 
            marginTop: -50 
          }}
        />
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

            <View style={styles.ratingBar}>
              <View style={styles.ratingRow}>
                <View style={styles.ratingIndicator}>
                  <Animated.View style={[styles.ratingFill, { width, backgroundColor: color }]} />
                </View>
                <Text style={[styles.rating, { color }]}>Product Rating: {rating}</Text>
              </View>
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

            <View style={styles.nutritionalInfo}>
              <Text style={styles.nutritionalTitle}>Per Serving:</Text>
              <Text style={styles.nutritionalText}>Calories(Kcal): {product.calories ? product.calories.toFixed(1) : 'N/A'}</Text>
              <Text style={styles.nutritionalText}>Protein: {product.protein ? product.protein.toFixed(1) : 'N/A'}g</Text>
              <Text style={styles.nutritionalText}>Carbs: {product.carbs ? product.carbs.toFixed(1) : 'N/A'}g</Text>
              <Text style={styles.nutritionalText}>Fats: {product.fat ? product.fat.toFixed(1) : 'N/A'}g</Text>
            </View>

            <TouchableOpacity style={styles.section} onPress={toggleAdditives}>
              <Text style={styles.sectionTitle}>Additives</Text>
              <Ionicons name={showAdditives ? "chevron-up" : "chevron-down"} size={24} color="#2C2C2C" />
            </TouchableOpacity>

            {showAdditives && (
              <View style={styles.additivesContent}>
                {additives.length > 0 ? (
                  additives.map((additive, index) => (
                    <Text key={index} style={styles.additiveText}>
                      {additive.code} - {additive.name}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.additiveText}>No additives found</Text>
                )}
              </View>
            )}


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
    backgroundColor: '#f1ede1',
  },
  scrollContent: {
    flexGrow: 1,
  },
  additivesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2C2C2C',
  },
  additiveText: {
    fontSize: 14,
    color: '#2C2C2C',
    marginBottom: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C2C2C',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  section: {
    backgroundColor: '#E8F5E9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    padding: 16,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C2C2C',
  },
  additivesContent: {
    backgroundColor: '#E8F5E9',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    padding: 16,
    marginTop: -10,
    marginBottom: 15,
  },
  titleHighlight: {
    color: '#43A047',
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: -20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  productImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  iconContainer: {
    position: 'absolute',
    right: 60,
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
  learnMore: {
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 5,
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
  ratingBar: {
    marginBottom: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rating: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  ratingIndicator: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    height: 8,
    borderRadius: 4,
    marginRight: 10,
    overflow: 'hidden',
  },
  ratingFill: {
    height: '100%',
    borderRadius: 4,
  },
});

export default ResultScreen;
