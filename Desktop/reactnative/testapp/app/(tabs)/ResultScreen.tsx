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
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const imageScaleAnimation = useRef(new Animated.Value(0.95)).current;
  const [showAdditives, setShowAdditives] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!productData) {
    return <Text>Product data not found</Text>;
  }

  const product: ProductData = JSON.parse(Buffer.from(productData as string, 'base64').toString('utf-8'));
  const ingredients = product.ingredients || [];
  const encodedImageUrl = product.image_url ? product.image_url.replace('/products/', '/products%2F') : '';
  console.log('Product Data:', product);

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
    // Always run animations for the rating regardless of image load status
    Animated.timing(fillAnimation, {
      toValue: fillPercentage,
      duration: 1500,
      useNativeDriver: false,
    }).start();

    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
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
          {!imageError ? (
            <Animated.Image
              source={{ uri: encodedImageUrl || '' }}
              onError={() => setImageError(true)} // Set image error state on failure
              style={[
                styles.productImage,
                {
                  transform: [{ scale: imageScaleAnimation }],
                },
              ]}
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <View style={styles.imageFallbackContainer}>
              <Ionicons name="image-outline" size={100} color="#D32F2F" />
              <Text style={styles.imageFallbackText}>Image not found</Text>
            </View>
          )}
            <LottieView
              source={animation}
              autoPlay
              loop={true}
              speed={0.75}
              style={styles.lottieAnimation}
            />
        </View>

        <Animated.View style={[styles.gradientContainer, { opacity: fadeAnimation }]}>
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

              {bannedIngredients.length > 0 ? (
                <View style={styles.warningSection}>
                  <Text style={styles.warningTitle}>Warning! This product contains:</Text>
                  {bannedIngredients.map((ingredient) => (
                    <Text key={ingredient.name} style={styles.warningText}>
                      {ingredient.name} ({ingredient.reason})
                    </Text>
                  ))}
                </View>
              ) : (
                <View style={styles.excellentSection}>
                  <Text style={styles.excellentTitle}>Excellent Choice!</Text>
                  <Text style={styles.excellentText}>
                    This product doesn't contain any harmful ingredients from our database.
                  </Text>
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
        </Animated.View>
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
  gradientContainer: {
    flex: 1,
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
    flexDirection: 'row',
    justifyContent: 'center',
  },
  productImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  lottieAnimation: {
    width: 100,
    height: 100,
    position: 'absolute',
    right: 30,
    top: '50%',
    marginTop: -50,
  },
  gradientBackground: {
    flex: 1,
    width: '100%',
    paddingTop: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    minHeight: 500,
  },
  productCard: {
    padding: 16,
    flex: 1,
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
  ratingBar: {
    marginBottom: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  imageFallbackContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D32F2F',
    borderRadius: 10,
  },
  imageFallbackText: {
    color: '#D32F2F',
    marginTop: 10,
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
  warningSection: {
    marginBottom: 15,
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 10,
  },
  rating: {
    fontSize: 14,
    fontWeight: 'bold',
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
  excellentSection: {
    marginBottom: 15,
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 10,
  },
  excellentTitle: {
    fontWeight: 'bold',
    color: '#4CAF50',
    fontSize: 16,
    marginBottom: 5,
  },
  excellentText: {
    color: '#2C2C2C',
    fontSize: 14,
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
  additiveText: {
    fontSize: 14,
    color: '#2C2C2C',
    marginBottom: 5,
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
