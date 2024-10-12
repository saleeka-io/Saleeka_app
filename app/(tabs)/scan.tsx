
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, SafeAreaView, Animated, Modal, TextInput } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter, useNavigation, useFocusEffect } from 'expo-router';
import firestore from '@react-native-firebase/firestore';
import { useUser } from '../../context/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { Buffer } from 'buffer';
import { FlashMode } from 'expo-camera/build/legacy/Camera.types';
import { LinearGradient } from 'expo-linear-gradient';
import { CacheService } from '../../components/CacheService';
import { RatingService, Rating } from '../../components/RatingService';
import Constants from 'expo-constants';
const { extra } = Constants.expoConfig || {};
const apiKey = Constants?.expoConfig?.extra?.apiKey || process.env.API_KEY;
interface ProductData {
  product_name: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  image_url: string | null;
  ingredients: string[] | null;
  additives: { code: string; name: string }[] | null;
  rating: Rating;
}

const BarcodeScanner = () => {
  const [hasPermission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const cameraRef = useRef(null);
  
  const router = useRouter();
  const navigation = useNavigation();
  
  const { user } = useUser();

  const [ellipsis, setEllipsis] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // New state for manual input modal
  const overlayAnimation = useRef(new Animated.Value(0)).current;
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');

  // Simplify flash mode state to boolean
  // const [isFlashOn, setIsFlashOn] = useState(false);

  // // Simplified function to toggle flash
  // const toggleFlash = () => {
  //   setIsFlashOn(prevState => {
  //     const newState = !prevState;
  //     console.log(`Flash turned ${newState ? 'on' : 'off'}`);
  //     return newState;
  //   });
  // };

  // // Simplified function to get the appropriate flash icon
  // const getFlashIcon = () => isFlashOn ? 'flash' : 'flash-off';

  // // Log flash mode changes
  // useEffect(() => {
  //   console.log(`Current flash mode: ${isFlashOn ? 'on' : 'off'}`);
  // }, [isFlashOn]);


  // Function to show overlay with animation
  const showOverlay = () => {
    setIsOverlayVisible(true);
    Animated.timing(overlayAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Function to hide overlay with animation
  const hideOverlay = () => {
    Animated.timing(overlayAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsOverlayVisible(false));
  };

  // New state to track if the component is mounted
  const isMountedRef = useRef(true);

  // Improved logging function
  const log = (message: string) => {
    console.log(`[BarcodeScanner ${new Date().toISOString()}]: ${message}`);
  };

  useEffect(() => {
    log("Component mounted");
    return () => {
      isMountedRef.current = false;
      log("Component will unmount");
    };
  }, []);

  useEffect(() => {
    const animateEllipsis = () => {
      setEllipsis(prev => (prev === '...' ? '' : prev + '.'));
    };
    const interval = setInterval(animateEllipsis, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    );
    
    animation.start();
    
    return () => {
      animation.stop();  // Ensure animation is stopped on unmount
      log("Animation stopped");
    };
  }, [fadeAnim]);
  
  useEffect(() => {
    if (!hasPermission?.granted) {
      log("Requesting camera permission");
      requestPermission();
    }
  }, [hasPermission]);  // Only request permissions if they haven't been granted yet
  
  const renderBarcodeLines = () => {
    const lines = [];
    for (let i = 0; i < 7; i++) {
      lines.push(
        <View
          key={i}
          style={[
            styles.barcodeLine,
            { left: `${10 + i * 13}%`, width: i % 2 === 0 ? 20 : 10 }
          ]}
        />
      );
    }
    return lines;
  };

  useFocusEffect(
    useCallback(() => {
      log('Focus effect triggered: Resetting scanned and modal visibility.');
      setScanned(false);
      hideOverlay();  // Ensure the modal is hidden when returning
      setManualBarcode('');

      return () => {
        if (cameraRef.current) {
          cameraRef.current = null;  // Ensure camera deactivation
        }
        log("Focus effect cleanup: Camera deactivated.");
      };
    }, [])
  );
    // Testing barcode automatically on component mount
  useEffect(() => {
    const testBarcode = '3168930008170'; // Hardcoded barcode for testing
    handleBarCodeScanned({ type: 'ean13', data: testBarcode });
  }, []);

    // 028400589871 - Red
  // 0737628064502 - Yellow
  // 742365007071 - Green

  // Testing barcode automatically on component mount
  // useEffect(() => {
  //   const testBarcode = '7423650070'; // Hardcoded barcode for testing
  //   handleBarCodeScanned({ type: 'ean13', data: testBarcode });
  // }, []);
  
  const handleBarCodeScanned = useCallback(async (scanningResult: { type: string; data: string }) => {
    if (!scanned && isMountedRef.current) {
      setScanned(true);
      if (cameraRef.current) {
        cameraRef.current = null;  // Deactivate camera after scanning
      }
      log(`\nBarcode scanned: ${JSON.stringify(scanningResult)}`);
  
      const { data } = scanningResult;
  
      try {
        const productData = await fetchProductData(data);
  
        if (productData && isMountedRef.current) {
          // Save scan data to Firestore
          await saveScanData(data);
  
          // Navigate to ResultScreen
          const encodedProductData = Buffer.from(JSON.stringify(productData)).toString('base64');
          log(`\nEncoded product data to send to ResultScreen: ${encodedProductData}`);
          router.replace(`/ResultScreen?productData=${encodedProductData}`);
        } else if (isMountedRef.current) {
          log('\nProduct not found or has invalid data. Navigating to ProductNotFound.');
          setTimeout(() => {
            if (isMountedRef.current) {
              log('\nNavigating to ProductNotFound');
              router.replace(`/ProductNotFound?barcode=${data}`);
            } else {
              log('\nNavigation cancelled: Component unmounted');
            }
          }, 500);
        }
      } catch (error) {
        log(`\nError in handleBarCodeScanned: ${error}`);
        Alert.alert(
          "Error",
          "An unexpected error occurred while processing the barcode. Please try again.",
          [{ text: "OK" }]
        );
      } finally {
        setScanned(false);  // Allow scanning again after processing (success or failure)
      }
    } else {
      log('\nScan skipped: Already scanned or component unmounted.');
    }
  }, [scanned, router]);
  

  const handleManualInput = useCallback(async () => {
    if (manualBarcode.trim() === '') {
      log('Error: Barcode input is empty.');
      Alert.alert('Error', 'Please enter a barcode');
      return;
    }
  
    console.log('Manual barcode entered:', manualBarcode);
    setIsOverlayVisible(false);  // Close the modal
    setScanned(true);
  
    // Update this line
    await handleBarCodeScanned({ type: 'manual', data: manualBarcode });
    setManualBarcode('');
  }, [manualBarcode, handleBarCodeScanned]);

  const saveScanData = async (barcode: string) => {
    if (!user) {
      log("No user logged in to save scan data.");
      return;
    }
    try {
      log(`Saving scan data to Firestore for barcode: ${barcode}`);
      await firestore().collection('scans').add({
        userId: user.uid,
        barcode,
        timestamp: firestore.FieldValue.serverTimestamp()
      });
      log(`Scan data saved successfully for user: ${user.uid}`);
    } catch (error) {
      log(`Error saving scan data: ${error}`);
      Alert.alert("Database Error", "Failed to save scan data.");
    }
  };

  const translateIngredients = async (text: string): Promise<string> => {
    //const apiKey = apiKey; // Replace with your DeepL API key
    const url = `https://api-free.deepl.com/v2/translate`;
    console.log('Translation function is called with text:', text);
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          auth_key: apiKey,
          text: text,
          target_lang: 'EN', // Translate to English
        }).toString(),
      });
  
      const data = await response.json();
      console.log('Translation API response:', data);
  
      if (data.translations && data.translations.length > 0) {
        console.log('Translated Text:', data.translations[0].text);
        return data.translations[0].text;
      } else {
        throw new Error('Translation failed');
      }
    } catch (error) {
      console.error('Error translating ingredients:', error);
      return text; // Return the original text if translation fails
    }
  };
  
  
  
  

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds
const FETCH_TIMEOUT = 10000; // 10 seconds

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithTimeout = async (url: string, options = {}, timeout = FETCH_TIMEOUT) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(url, {
    ...options,
    signal: controller.signal
  });
  clearTimeout(id);
  return response;
};


const fetchProductData = async (barcode: string): Promise<ProductData | null> => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      log(`\n[Attempt ${attempt}] Fetching product data for barcode: ${barcode}`);
      
      // Check if the product is cached
      let cachedProduct = await CacheService.getFromCache(barcode);
      if (cachedProduct) {
        log("\nProduct found in cache");

        if (!cachedProduct.ingredients || cachedProduct.ingredients.length === 0 || cachedProduct.ingredients[0] === "to be added") {
          log("\nCached product has invalid ingredients");
          throw new Error("Invalid ingredients");
        }
       

        // If the product doesn't have a rating, calculate it
        if (!cachedProduct.rating) {
          log("\nCached product is missing a rating. Calculating rating...");
          const rating = RatingService.calculateRating(cachedProduct.ingredients);
          log(`\nCalculated rating for cached product: ${JSON.stringify(rating)}`);

          cachedProduct.rating = rating;

          // Update cache with the newly calculated rating
          await CacheService.addToCache(barcode, cachedProduct);
          log(`\nUpdated cached product with new rating: ${JSON.stringify(cachedProduct)}`);
        }

        return cachedProduct; // Return cached product
      }

      // Check Firestore for the product
      const productDoc = await firestore().collection('products').where('barcode', '==', barcode).get();
      if (!productDoc.empty) {
        log("\nProduct found in Firestore");
        const productData = productDoc.docs[0].data();
        const ingredients = productData.ingredients ? productData.ingredients.split(', ') : [];
        
        if (ingredients.length === 0 || ingredients[0] === "to be added") {
          log("\nFirestore product has invalid ingredients");
          throw new Error("Invalid ingredients");
        }

        const rating = RatingService.calculateRating(ingredients);
        log(`\nRating calculated for product from Firestore: ${JSON.stringify(rating)}`);

        const product: ProductData = {
          product_name: productData.productName,
          calories: productData.calories || null,
          protein: productData.protein || null,
          carbs: productData.carbs || null,
          fat: productData.fat || null,
          image_url: productData.productImageUrl || null,
          ingredients: ingredients,
          additives: null,
          rating: rating,
        };

        log(`\nProduct data from Firestore: ${JSON.stringify(product)}`);

        // Cache the product data
        await CacheService.addToCache(barcode, product);
        log("\nProduct cached from Firestore");
        return product;
      }

      // Fetch from OpenFoodFacts API if not found in Firestore
      log("\nProduct not found in Firestore, fetching from OpenFoodFacts API");
      const response = await fetchWithTimeout(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json?fields=product_name,nutriments,image_url,ingredients_text,additives_tags,additives_original_tags`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.status === 1) { // Product found
        const languageTags = data.product?.languages_tags || [];
        log(`Available languages: ${languageTags.join(', ')}`);
      
        // Check if English is available
        const isEnglishAvailable = languageTags.includes('en');
        const additives = data.product?.additives_tags?.map((additive: string, index: number) => {
          const code = additive.replace('en:', '').toUpperCase();
          const originalTag = data.product?.additives_original_tags?.[index]?.replace('en:', '') || '';
          const name = originalTag.split(' - ')[1] || originalTag;
          return { code, name };
        }) || [];
        let ingredients = data.product.ingredients_text_en || data.product.ingredients_text.split(', ');
        //const ingredients = data.product.ingredients_text ? data.product.ingredients_text.split(', ') : null;

        if (ingredients.length > 0 && !isEnglishAvailable) {
        
          log("\nSending ingredients to DeepL API for translation");
          log(`Original ingredients: ${ingredients.join(', ')}`);

          const translatedIngredients = await translateIngredients(ingredients.join(', '));
          ingredients = translatedIngredients.split(', ');

          log(`Translated ingredients: ${ingredients.join(', ')}`);
        }

        if (!ingredients || ingredients.length === 0 || ingredients[0] === "to be added") {
          log("\nNo valid ingredients found for product");
          throw new Error("Invalid ingredients");
        }
       

        const rating = RatingService.calculateRating(ingredients);
        log(`\nRating calculated from OpenFoodFacts API: ${JSON.stringify(rating)}`);

        const product: ProductData = {
          product_name: data.product?.product_name,
          calories: data.product?.nutriments?.energy_kcal || null,
          protein: data.product?.nutriments?.proteins || null,
          carbs: data.product?.nutriments?.carbohydrates || null,
          fat: data.product?.nutriments?.fat || null,
          image_url: data.product?.image_url || null,
          ingredients: ingredients,
          additives: additives,
          rating: rating,
        };

        log(`\nProduct data from OpenFoodFacts API: ${JSON.stringify(product)}`);

        // Cache the product
        await CacheService.addToCache(barcode, product);
        log("\nProduct cached from API");
        return product;
      } else {
        throw new Error("Product not found in OpenFoodFacts API");
      }

    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Invalid ingredients") {
          log("\nProduct found but has invalid ingredients");
          router.replace(`/ProductNotFound?barcode=${barcode}`);
      return null;
          return null; // No need to retry for invalid ingredients
        } else if (error.name === "AbortError") {
          log("\nRequest timed out");
        } else if (error.message.includes("Network request failed")) {
          log("\nNetwork error: Unable to fetch product data");
        } else {
          log(`\nError fetching product data: ${error.message}`);
        }
      } else {
        log(`\nUnknown error fetching product data: ${error}`);
      }

      if (attempt < MAX_RETRIES) {
        log(`\nRetrying in ${RETRY_DELAY / 1000} seconds...`);
        await wait(RETRY_DELAY);
      } else {
        log("\nMax retries reached. Unable to fetch product data.");
        Alert.alert(
          "Product Not Found",
          "We're having trouble finding this product. Please try again later.",
          [{ text: "OK" }]
        );
        return null;
      }
    }
  }

  return null;
};
  

  if (!hasPermission || !hasPermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.text}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderOverlay = () => (
    isOverlayVisible && (
      <Animated.View 
        style={[
          styles.overlayContainer, 
          {
            opacity: overlayAnimation,
          }
        ]}
      >
        <View style={styles.blurOverlay} />
        <Animated.View 
          style={[
            styles.overlayContent,
            {
              transform: [{
                translateY: overlayAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [300, 0],
                }),
              }],
            }
          ]}
        >
          <LinearGradient
            colors={['#3A6A64', '#2A4A45']}
            style={styles.gradientBackground}
          >
            <TouchableOpacity 
              style={styles.overlayCloseButton} 
              onPress={hideOverlay}
            >
              <Ionicons name="close" size={24} color="#f1ede1" />
            </TouchableOpacity>
            <Text style={styles.overlayTitle}>Enter Barcode</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                onChangeText={setManualBarcode}
                value={manualBarcode}
                placeholder="Type barcode number"
                keyboardType="numeric"
                placeholderTextColor="#a0a0a0"
              />
            </View>
            <TouchableOpacity style={styles.searchButton} onPress={handleManualInput}>
              <Text style={styles.searchButtonText}>Search</Text>
              <Ionicons name="search" size={20} color="#f1ede1" style={styles.searchIcon} />
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    )
  );

  return (
    <SafeAreaView style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: [
            'ean13', 'ean8', 'upc_a', 'upc_e'
          ],
        }}
        // flashMode={isFlashOn ? FlashMode.torch : FlashMode.off}
      >
        <View style={styles.overlay}>
          <TouchableOpacity 
            style={styles.manualInputButton} 
            onPress={() => {
              console.log('Manual input button pressed');
              showOverlay();
            }}
          >
            <Ionicons name="barcode-outline" size={24} color="white" />
          </TouchableOpacity>

          <Text style={styles.searchingText}>SEARCHING FOR BARCODE{ellipsis}</Text>
          <View style={styles.scanArea}>
            <Animated.View style={[styles.barcodeOutline, { opacity: fadeAnim }]}>
              {renderBarcodeLines()}
            </Animated.View>
          </View>
          {/* <TouchableOpacity 
            style={styles.flashButton} 
            onPress={() => {
              console.log('Flash button pressed');
              toggleFlash();
            }}
          >
            <Ionicons name={getFlashIcon()} size={24} color="white" />
          </TouchableOpacity> */}
        </View>
      </CameraView>
      {renderOverlay()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  overlayContent: {
    width: '90%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  gradientBackground: {
    padding: 30,
    alignItems: 'center',
  },
  overlayCloseButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 10,
  },
  overlayTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f1ede1',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    backgroundColor: '#f1ede1',
    borderRadius: 12,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 15,
    fontSize: 18,
    color: '#3A6A64',
  },
  searchButton: {
    backgroundColor: '#f1ede1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    width: '50%',
  },
  searchButtonText: {
    color: '#3A6A64',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 10,
  },
  searchIcon: {
    color: '#3A6A64',
  },
  manualInputButton: {
    position: 'absolute',
    top: 25,
    left: 20,
    padding: 25,
    zIndex: 1000,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 325,
    height: 150,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  barcodeOutline: {
    width: '90%',
    height: '80%',
    borderWidth: 4,
    borderColor: 'white',
    position: 'relative',
  },
  barcodeLine: {
    position: 'absolute',
    height: '100%',
    backgroundColor: 'white',
  },
  searchingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    position: 'absolute',
    top: 50,
  },
  // flashButton: {
  //   position: 'absolute',
  //   top: 50,
  //   right: 20,
  // },
  message: {
    color: 'white',
    textAlign: 'center',
    paddingBottom: 10,
  },
  text: {
    color: 'white',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  switchButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BarcodeScanner;