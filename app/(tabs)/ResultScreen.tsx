// import React, { useEffect, useRef, useState } from 'react';
// import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView, Animated } from 'react-native';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { LinearGradient } from 'expo-linear-gradient';
// import LottieView from 'lottie-react-native';
// import { Buffer } from 'buffer';
// import redXAnimation from '../../assets/lottie/RedX.json';
// import checkmarkAnimation from '../../assets/lottie/Checkmark.json';
// import cautionAnimation from '../../assets/lottie/Caution.json';
// import loadingAnimation from '../../assets/lottie/Loading.json';
// import bannedIngredientsData from '../bannedIngredients.json';
// import { Ionicons } from '@expo/vector-icons';

// // Define the structure of the product data
// interface ProductData {
//   product_name: string;
//   ingredients: string[];
//   additives: { code: string; name: string }[];
//   calories: number | null;
//   protein: number | null;
//   carbs: number | null;
//   fat: number | null;
//   image_url: string | null;
// }

// // Define the structure of a banned ingredient
// interface BannedIngredient {
//   name: string;
//   casNumber: string;
//   reason: string;
//   severity: 'red' | 'yellow' | 'green';
// }

// const ResultScreen = () => {
//   const { productData } = useLocalSearchParams();
//   const router = useRouter();

//   const [loading, setLoading] = useState(true);
//   const [loadingText, setLoadingText] = useState('Please wait a short moment while we obtain your results...');
//   const [parsedProduct, setParsedProduct] = useState<ProductData | null>(null);

//   // Animation references and states
//   const fillAnimation = useRef(new Animated.Value(0)).current;
//   const fadeAnimation = useRef(new Animated.Value(0)).current;
//   const imageScaleAnimation = useRef(new Animated.Value(0.95)).current;

//   // State for UI controls
//   const [showAdditives, setShowAdditives] = useState(false);
//   const [imageLoaded, setImageLoaded] = useState(false);
//   const [imageError, setImageError] = useState(false);

//   const navigateBack = () => {
//     router.push('/scan');
//   };

//   useEffect(() => {
//     if (productData) {
//       const longLoadingTimeout = setTimeout(() => {
//         setLoadingText('This is taking longer than usual. Please wait...');
//       }, 10000); // Change text after 10 seconds

//       try {
//         const product: ProductData = JSON.parse(Buffer.from(productData as string, 'base64').toString('utf-8'));
//         setParsedProduct(product);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error parsing product data:', error);
//         setLoadingText('Error loading product data. Please try again.');
//       }

//       return () => clearTimeout(longLoadingTimeout);
//     }
//   }, [productData]);

//   // useEffect(() => {
//   //   if (productData) {
//   //     const longLoadingTimeout = setTimeout(() => {
//   //       setLoadingText('This is taking longer than usual. Please wait...');
//   //     }, 10000); // Change text after 10 seconds

//   //     const simulateSlowConnection = async () => {
//   //       try {
//   //         // Simulate a delay of 5 seconds
//   //         await new Promise(resolve => setTimeout(resolve, 11000));

//   //         const product: ProductData = JSON.parse(Buffer.from(productData as string, 'base64').toString('utf-8'));
//   //         setParsedProduct(product);
//   //         setLoading(false);
//   //       } catch (error) {
//   //         console.error('Error parsing product data:', error);
//   //         setLoadingText('Error loading product data. Please try again.');
//   //       }
//   //     };

//   //     simulateSlowConnection();

//   //     return () => clearTimeout(longLoadingTimeout);
//   //   }
//   // }, [productData]);

//   useEffect(() => {
//     if (!loading && parsedProduct) {
//       // Animate the rating bar fill
//       Animated.timing(fillAnimation, {
//         toValue: calculateRating(bannedIngredients).fillPercentage,
//         duration: 1500,
//         useNativeDriver: false,
//       }).start();

//       // Fade in the content
//       Animated.timing(fadeAnimation, {
//         toValue: 1,
//         duration: 500,
//         useNativeDriver: true,
//       }).start();
//     }
//   }, [loading, parsedProduct]);

//   if (loading) {
//     return (
//       <SafeAreaView style={styles.loadingContainer}>
//         <View style={styles.loadingContent}>
//           <View style={styles.logoContainer}>
//             <Image
//               source={require('../../assets/images/logo.png')}
//               style={styles.logo}
//             />
//             <LottieView
//               source={loadingAnimation}
//               autoPlay
//               loop
//               style={styles.loadingAnimation}
//             />
//           </View>
//           <Text style={styles.loadingTitle}>Loading Results</Text>
//           <Text style={styles.loadingText}>{loadingText}</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }

//   if (!parsedProduct) {
//     return <Text>Product data not found</Text>;
//   }

//   const ingredients = parsedProduct.ingredients || [];
//   const encodedImageUrl = parsedProduct.image_url ? parsedProduct.image_url.replace('/products/', '/products%2F') : '';
//   const additives = parsedProduct.additives || [];

//   // Filter banned ingredients based on the product's ingredients
//   const bannedIngredients: BannedIngredient[] = bannedIngredientsData.bannedIngredients.filter((ingredient) =>
//     ingredients.some((prodIngredient) =>
//       prodIngredient.toLowerCase().includes(ingredient.name.toLowerCase())
//     )
//   ) as BannedIngredient[];

//  // Calculate the product rating based on banned ingredients
//   const calculateRating = (
//     bannedIngredients: BannedIngredient[]
//   ): { rating: string; color: string; fillPercentage: number; animation: any } => {
//     if (bannedIngredients.length === 0) {
//       return { rating: 'Clean', color: '#4CAF50', fillPercentage: 100, animation: checkmarkAnimation };
//     }

//     const severityCount = {
//       red: bannedIngredients.filter((i) => i.severity === 'red').length,
//       yellow: bannedIngredients.filter((i) => i.severity === 'yellow').length,
//       green: bannedIngredients.filter((i) => i.severity === 'green').length,
//     };

//     if (severityCount.red > 0) {
//       return { rating: 'Poor', color: '#D32F2F', fillPercentage: 25, animation: redXAnimation };
//     } else if (severityCount.yellow > 0) {
//       return { rating: 'Fair', color: '#FFA000', fillPercentage: 50, animation: cautionAnimation };
//     } else {
//       return { rating: 'Good', color: '#4CAF50', fillPercentage: 75, animation: checkmarkAnimation };
//     }
//   };

//   const { rating, color, fillPercentage, animation } = calculateRating(bannedIngredients);
//   // Navigation function to the score screen
//   const navigateToScoreScreen = () => {
//     router.push('/score');
//   };

//   // Interpolate the width of the rating bar based on the fill animation
//   const width = fillAnimation.interpolate({
//     inputRange: [0, 100],
//     outputRange: ['0%', '100%'],
//   });

//   // Toggle the visibility of additives
//   const toggleAdditives = () => {
//     setShowAdditives(!showAdditives);
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView contentContainerStyle={styles.scrollContent}>
//         <View style={styles.header}>
//           <TouchableOpacity onPress={navigateBack} style={styles.backButton}>
//             <Ionicons name="arrow-back" size={24} color="#2C2C2C" />
//           </TouchableOpacity>
//           <Text style={styles.title}>
//             Product Analysis by <Text style={styles.titleHighlight}>Saleeka</Text>
//           </Text>
//         </View>

//         {/* Product Image Section */}
//         <View style={styles.imageContainer}>
//           {!imageError ? (
//             <Animated.Image
//               source={{ uri: encodedImageUrl || '' }}
//               onError={() => setImageError(true)}
//               style={[
//                 styles.productImage,
//                 {
//                   transform: [{ scale: imageScaleAnimation }],
//                 },
//               ]}
//               onLoad={() => setImageLoaded(true)}
//             />
//           ) : (
//             <View style={styles.imageFallbackContainer}>
//               <Ionicons name="image-outline" size={100} color="#D32F2F" />
//               <Text style={styles.imageFallbackText}>Image not found</Text>
//             </View>
//           )}
//           {/* Lottie animation based on product rating */}
//           <LottieView
//             source={animation}
//             autoPlay
//             loop={true}
//             speed={0.75}
//             style={styles.lottieAnimation}
//           />
//         </View>

//         {/* Main Content Section */}
//         <Animated.View style={[styles.gradientContainer, { opacity: fadeAnimation }]}>
//           <LinearGradient
//             colors={['#2F5651', '#478B4E']}
//             style={styles.gradientBackground}
//           >
//             <View style={styles.productCard}>
//               {/* Product Name */}
//               <View style={styles.productInfo}>
//                 <Text style={styles.label}>Product Name:</Text>
//                 <Text style={styles.productName}>{parsedProduct.product_name}</Text>
//               </View>

//               {/* Rating Bar */}
//               <View style={styles.ratingBar}>
//                 <View style={styles.ratingRow}>
//                   <View style={styles.ratingIndicator}>
//                     <Animated.View style={[styles.ratingFill, { width, backgroundColor: color }]} />
//                   </View>
//                   <Text style={[styles.rating, { color }]}>Product Rating: {rating}</Text>
//                 </View>
//               </View>

//               {/* Warning or Excellent Section */}
//               {bannedIngredients.length > 0 ? (
//                 <View style={styles.warningSection}>
//                   <Text style={styles.warningTitle}>Warning! This product contains:</Text>
//                   {bannedIngredients.map((ingredient) => (
//                     <Text key={ingredient.name} style={styles.warningText}>
//                       {ingredient.name} ({ingredient.reason})
//                     </Text>
//                   ))}
//                 </View>
//               ) : (
//                 <View style={styles.excellentSection}>
//                   <Text style={styles.excellentTitle}>Excellent Choice!</Text>
//                   <Text style={styles.excellentText}>
//                     This product doesn't contain any harmful ingredients from our database.
//                   </Text>
//                 </View>
//               )}

//               {/* Nutritional Information */}
//               <View style={styles.nutritionalInfo}>
//                 <Text style={styles.nutritionalTitle}>Per Serving:</Text>
//                 <Text style={styles.nutritionalText}>Calories(Kcal): {parsedProduct.calories ? parsedProduct.calories.toFixed(1) : 'N/A'}</Text>
//                 <Text style={styles.nutritionalText}>Protein: {parsedProduct.protein ? parsedProduct.protein.toFixed(1) : 'N/A'}g</Text>
//                 <Text style={styles.nutritionalText}>Carbs: {parsedProduct.carbs ? parsedProduct.carbs.toFixed(1) : 'N/A'}g</Text>
//                 <Text style={styles.nutritionalText}>Fats: {parsedProduct.fat ? parsedProduct.fat.toFixed(1) : 'N/A'}g</Text>
//               </View>

//               {/* Additives Section (Expandable) */}
//               <TouchableOpacity style={styles.section} onPress={toggleAdditives}>
//                 <Text style={styles.sectionTitle}>Additives</Text>
//                 <Ionicons name={showAdditives ? "chevron-up" : "chevron-down"} size={24} color="#2C2C2C" />
//               </TouchableOpacity>

//               {showAdditives && (
//                 <View style={styles.additivesContent}>
//                   {additives.length > 0 ? (
//                     additives.map((additive, index) => (
//                       <Text key={index} style={styles.additiveText}>
//                         {additive.code} - {additive.name}
//                       </Text>
//                     ))
//                   ) : (
//                     <Text style={styles.additiveText}>No additives found</Text>
//                   )}
//                 </View>
//               )}

//               {/* Health Score Button */}
//               <TouchableOpacity style={styles.healthScoreButton} onPress={navigateToScoreScreen}>
//                 <Text style={styles.healthScoreText}>View Health Score Scale</Text>
//               </TouchableOpacity>
//             </View>
//           </LinearGradient>
//         </Animated.View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// // Styles for the component
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f1ede1',
//   },
//   scrollContent: {
//     flexGrow: 1,
//   },
//   gradientContainer: {
//     flex: 1,
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#2C2C2C',
//     textAlign: 'center',
//     marginTop: 20,
//     marginBottom: 20,
//   },
//   titleHighlight: {
//     color: '#43A047',
//   },
//   imageContainer: {
//     alignItems: 'center',
//     marginBottom: 20,
//     position: 'relative',
//     flexDirection: 'row',
//     justifyContent: 'center',
//   },
//   productImage: {
//     width: 200,
//     height: 200,
//     resizeMode: 'contain',
//   },
//   lottieAnimation: {
//     width: 100,
//     height: 100,
//     position: 'absolute',
//     right: 30,
//     top: '50%',
//     marginTop: -50,
//   },
//   gradientBackground: {
//     flex: 1,
//     width: '100%',
//     paddingTop: 20,
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//     minHeight: 500,
//   },
//   productCard: {
//     padding: 16,
//     flex: 1,
//   },
//   productInfo: {
//     marginBottom: 10,
//   },
//   label: {
//     color: '#FFFFFF',
//     fontSize: 14,
//   },
//   productName: {
//     color: '#FFFFFF',
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   ratingBar: {
//     marginBottom: 10,
//   },
//   ratingRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   imageFallbackContainer: {
//     width: 200,
//     height: 200,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#D32F2F',
//     borderRadius: 10,
//   },
//   imageFallbackText: {
//     color: '#D32F2F',
//     marginTop: 10,
//   },
//   ratingIndicator: {
//     flex: 1,
//     backgroundColor: '#E0E0E0',
//     height: 8,
//     borderRadius: 4,
//     marginRight: 10,
//     overflow: 'hidden',
//   },
//   ratingFill: {
//     height: '100%',
//     borderRadius: 4,
//   },
//   warningSection: {
//     marginBottom: 15,
//     backgroundColor: '#FFEBEE',
//     padding: 10,
//     borderRadius: 10,
//   },
//   rating: {
//     fontSize: 14,
//     fontWeight: 'bold',
//   },
//   warningTitle: {
//     fontWeight: 'bold',
//     color: '#D32F2F',
//     fontSize: 16,
//     marginBottom: 5,
//   },
//   warningText: {
//     color: '#D32F2F',
//     fontSize: 14,
//     marginBottom: 2,
//   },
//   excellentSection: {
//     marginBottom: 15,
//     backgroundColor: '#E8F5E9',
//     padding: 10,
//     borderRadius: 10,
//   },
//   excellentTitle: {
//     fontWeight: 'bold',
//     color: '#4CAF50',
//     fontSize: 16,
//     marginBottom: 5,
//   },
//   excellentText: {
//     color: '#2C2C2C',
//     fontSize: 14,
//   },
//   nutritionalInfo: {
//     backgroundColor: '#F1F8E9',
//     borderRadius: 10,
//     padding: 12,
//     marginBottom: 15,
//   },
//   nutritionalTitle: {
//     color: '#2C2C2C',
//     fontWeight: 'bold',
//     fontSize: 16,
//     marginBottom: 5,
//   },
//   nutritionalText: {
//     color: '#2C2C2C',
//     fontSize: 14,
//     marginBottom: 2,
//   },
//   section: {
//     backgroundColor: '#E8F5E9',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     borderRadius: 10,
//     padding: 16,
//     marginBottom: 0,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#2C2C2C',
//   },
//   additivesContent: {
//     backgroundColor: '#E8F5E9',
//     borderBottomLeftRadius: 10,
//     borderBottomRightRadius: 10,
//     padding: 16,
//     marginTop: -10,
//     marginBottom: 15,
//   },
//   additiveText: {
//     fontSize: 14,
//     color: '#2C2C2C',
//     marginBottom: 5,
//   },
//   healthScoreButton: {
//     backgroundColor: '#4CAF50',
//     borderRadius: 25,
//     padding: 15,
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   healthScoreText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   loadingContainer: {
//     flex: 1,
//     backgroundColor: '#f1ede1',
//   },
//   loadingContent: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   logoContainer: {
//     position: 'relative',
//     width: 150,
//     height: 150,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   logo: {
//     width: 100,
//     height: 100,
//     resizeMode: 'contain',
//   },
//   loadingAnimation: {
//     position: 'absolute',
//     width: 150,
//     height: 150,
//   },
//   loadingTitle: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     color: '#3A6A64',
//     marginTop: 20,
//     marginBottom: 10,
//   },
//   loadingText: {
//     fontSize: 18,
//     color: '#666',
//     textAlign: 'center',
//     marginBottom: 30,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingTop: 20,
//     paddingBottom: 10,
//     backgroundColor: '#f1ede1',
//   },
//   backButton: {
//     padding: 8,
//   },
//   headerTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#3A6A64',
//     marginLeft: 16,
//   },
// });

// export default ResultScreen;
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { Buffer } from 'buffer';
import { Ionicons } from '@expo/vector-icons';
import { RatingService } from '../../components/RatingService'; // Import RatingService
 import bannedIngredientsData from '../bannedIngredients.json';
 import { RFPercentage, RFValue } from "react-native-responsive-fontsize";

import redXAnimation from '../../assets/lottie/RedX.json';
import checkmarkAnimation from '../../assets/lottie/Checkmark.json';
import cautionAnimation from '../../assets/lottie/Caution.json';
import loadingAnimation from '../../assets/lottie/Loading.json';
import CustomText from '@/components/CustomText';

// Define the structure of the product data
interface ProductData {
  product_name: string;
  ingredients: string[];
  additives: { code: string; name: string }[];
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  image_url: string | null;
  rating?: {
    rating: string;
    color: string;
    fillPercentage: number;
  };
}

// Helper function to get the appropriate animation based on the rating
const getAnimationForRating = (rating: string) => {
  switch (rating) {
    case 'Poor':
      return redXAnimation;
    case 'Fair':
      return cautionAnimation;
    case 'Good':
    case 'Clean':
      return checkmarkAnimation;
    default:
      return null;  // Or handle default case
  }
};

const ResultScreen = () => {
  const { productData } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('Please wait a short moment while we obtain your results...');
  const [parsedProduct, setParsedProduct] = useState<ProductData | null>(null);

  const fillAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const imageScaleAnimation = useRef(new Animated.Value(0.95)).current;

  const [showAdditives, setShowAdditives] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const navigateBack = () => {
    router.push('/scan');
  };

  useEffect(() => {
    if (productData) {
      const longLoadingTimeout = setTimeout(() => {
        setLoadingText('This is taking longer than usual. Please wait...');
      }, 10000); // Change text after 10 seconds

      try {
        const product: ProductData = JSON.parse(Buffer.from(productData as string, 'base64').toString('utf-8'));
        
        // Calculate the rating using RatingService
        const rating = RatingService.calculateRating(product.ingredients);
        
        // Update product data with rating
        setParsedProduct({ ...product, rating });
        setLoading(false);
      } catch (error) {
        console.error('Error parsing product data:', error);
        setLoadingText('Error loading product data. Please try again.');
      }

      return () => clearTimeout(longLoadingTimeout);
    }
  }, [productData]);

  useEffect(() => {
    if (!loading && parsedProduct) {
      // Animate the rating bar fill
      Animated.timing(fillAnimation, {
        toValue: parsedProduct.rating?.fillPercentage || 0,
        duration: 1500,
        useNativeDriver: false,
      }).start();

      // Fade in the content
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [loading, parsedProduct]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/logo.png')}
              style={styles.logo}
            />
            <LottieView
              source={loadingAnimation}
              autoPlay
              loop
              style={styles.loadingAnimation}
            />
          </View>
          <CustomText fontWeight="medium"style={styles.loadingTitle}>Loading Results</CustomText>
          <CustomText  style={styles.loadingText}>{loadingText}</CustomText>
        </View>
      </SafeAreaView>
    );
  }

  if (!parsedProduct) {
    return <Text>Product data not found</Text>;
  }

  const ingredients = parsedProduct.ingredients || [];
  const encodedImageUrl = parsedProduct.image_url 
  ? parsedProduct.image_url.replace('/products/', '/products%2F') 
  : null;
  const additives = parsedProduct.additives || [];

  const ratingInfo = parsedProduct.rating; // Use the calculated rating

  // Interpolate the width of the rating bar based on the fill animation
  const width = fillAnimation.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const toggleAdditives = () => {
    setShowAdditives(!showAdditives);
  };

  // Dynamically get the animation based on the rating
  const animationSource = getAnimationForRating(ratingInfo?.rating || '');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={navigateBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#2C2C2C" />
          </TouchableOpacity>
          <CustomText style={styles.title}>
            Product Analysis by <Text style={styles.titleHighlight}>Saleeka</Text>
          </CustomText>
        </View>

        {/* Product Image Section */}
        <View style={styles.imageContainer}>
        {!imageError && encodedImageUrl ? (
  <Animated.Image
    source={{ uri: encodedImageUrl }}
    onError={() => setImageError(true)}
    style={[styles.productImage, { transform: [{ scale: imageScaleAnimation }] }]}
    onLoad={() => setImageLoaded(true)}
  />
) : (
  <View style={styles.imageFallbackContainer}>
    <Ionicons name="image-outline" size={100} color="#D32F2F" />
    <CustomText style={styles.imageFallbackText}>Image not found</CustomText>
  </View>
)}

          {/* Dynamically render Lottie animation based on product rating */}
          {animationSource && (
          <LottieView
          source={animationSource}
          autoPlay={true}
          loop={false}
          speed={0.75}
          style={styles.lottieAnimation}
        />
          )}
        </View>

        {/* Main Content Section */}
        <Animated.View style={[styles.gradientContainer, { opacity: fadeAnimation }]}>
          <LinearGradient
            colors={['#2F5651', '#478B4E']}
            style={styles.gradientBackground}
          >
            <View style={styles.productCard}>
              {/* Product Name */}
              <View style={styles.productInfo}>
                <CustomText  style={styles.label}>Product Name:</CustomText>
                <CustomText fontWeight='medium' style={styles.productName}>{parsedProduct.product_name}</CustomText>
              </View>

              {/* Rating Bar */}
              <View style={styles.ratingBar}>
                <View style={styles.ratingRow}>
                  <View style={styles.ratingIndicator}>
                    <Animated.View style={[styles.ratingFill, { width, backgroundColor: ratingInfo?.color }]} />
                  </View>
                  <CustomText style={[styles.rating, { color: ratingInfo?.color }]}>
                    Product Rating: {ratingInfo?.rating}
                  </CustomText>
                </View>
              </View>

              {/* Warning or Excellent Section */}
              {ratingInfo?.rating === 'Clean' ? (
                <View style={styles.excellentSection}>
                  <CustomText fontWeight="bold"style={styles.excellentTitle}>Excellent Choice!</CustomText>
                  <CustomText style={styles.excellentText}>
                    This product doesn't contain any harmful ingredients from our database.
                  </CustomText>
                </View>
              ) : (
                <View style={styles.warningSection}>
                  <CustomText style={styles.warningTitle}>Warning! This product contains:</CustomText>
                  {/* Show ingredients flagged in the banned ingredients list */}
                  {bannedIngredientsData.bannedIngredients
                    .filter((ingredient) =>
                      ingredients.some((prodIngredient) =>
                        prodIngredient.toLowerCase().includes(ingredient.name.toLowerCase())
                      )
                    )
                    .map((ingredient) => (
                      <CustomText key={ingredient.name} style={styles.warningText}>
                        {ingredient.name} ({ingredient.reason})
                      </CustomText>
                    ))}
                </View>
              )}

              {/* Nutritional Information */}
              <View style={styles.nutritionalInfo}>
                <CustomText fontWeight="medium" style={styles.nutritionalTitle}>Per Serving:</CustomText>
                <CustomText style={styles.nutritionalText}>Calories(Kcal): {parsedProduct.calories?.toFixed(1) || 'N/A'}</CustomText>
                <CustomText style={styles.nutritionalText}>Protein: {parsedProduct.protein?.toFixed(1) || 'N/A'}g</CustomText>
                <CustomText style={styles.nutritionalText}>Carbs: {parsedProduct.carbs?.toFixed(1) || 'N/A'}g</CustomText>
                <CustomText style={styles.nutritionalText}>Fats: {parsedProduct.fat?.toFixed(1) || 'N/A'}g</CustomText>
              </View>

              {/* Additives Section (Expandable) */}
              <TouchableOpacity style={styles.section} onPress={toggleAdditives}>
                <CustomText fontWeight="medium" style={styles.sectionTitle}>Additives</CustomText>
                <Ionicons name={showAdditives ? "chevron-up" : "chevron-down"} size={24} color="#2C2C2C" />
              </TouchableOpacity>

              {showAdditives && (
                <View style={styles.additivesContent}>
                  {additives.length > 0 ? (
                    additives.map((additive, index) => (
                      <CustomText  key={index} style={styles.additiveText}>
                        {additive.code} - {additive.name}
                      </CustomText>
                    ))
                  ) : (
                    <CustomText  style={styles.additiveText}>No additives found</CustomText>
                  )}
                </View>
              )}

              {/* Health Score Button */}
              <TouchableOpacity style={styles.healthScoreButton} onPress={() => router.push('/score')}>
                <CustomText  style={styles.healthScoreText}>View Health Score Scale</CustomText>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles for the component
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
    width: '50%', // or any percentage that fits your design
    height: undefined,
    aspectRatio: 1, // Maintains aspect ratio
    resizeMode: 'contain',
  },
  lottieAnimation: {
    width: 100,
    height: 100,
    position: 'absolute',
    right: 10,
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f1ede1',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    position: 'relative',
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  loadingAnimation: {
    position: 'absolute',
    width: 150,
    height: 150,
  },
  loadingTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3A6A64',
    marginTop: 20,
    marginBottom: 10,
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#f1ede1',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3A6A64',
    marginLeft: 16,
  },
});

export default ResultScreen;