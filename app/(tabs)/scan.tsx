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

// Define the structure of product data
interface ProductData {
  product_name: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  image_url: string | null;
  ingredients: string[] | null;
  additives: { code: string; name: string }[] | null;
}

const BarcodeScanner = () => {
  // Manage camera permissions
  const [hasPermission, requestPermission] = useCameraPermissions();
  // Track if a barcode has been scanned to prevent multiple scans
  const [scanned, setScanned] = useState(false);
  
  // Hooks for navigation and routing
  const router = useRouter();
  const navigation = useNavigation();
  
  // Reference to the camera component for potential future use
  const cameraRef = useRef(null);
  
  // Access user context for user-specific operations
  const { user } = useUser();

  // New state for animating the ellipsis
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

  // Animation for the ellipsis
  useEffect(() => {
    const animateEllipsis = () => {
      setEllipsis(prev => (prev === '...' ? '' : prev + '.'));
    };

    const interval = setInterval(animateEllipsis, 500);
    return () => clearInterval(interval);
  }, []);

  // Animation for the barcode outline
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [fadeAnim]);

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

  // Request camera permission if not already granted
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  // Reset scanned state and modal visibility when the component comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Focus effect triggered: Resetting scanned and modal visibility.');
      setScanned(false);
      hideOverlay();  // Ensure the modal is hidden when returning
      setManualBarcode('');
    }, [])
  );

  // 028400589871 - Red
  // 0737628064502 - Yellow
  // 742365007071 - Green

  // Testing barcode automatically on component mount
  // useEffect(() => {
  //   const testBarcode = '7423650070'; // Hardcoded barcode for testing
  //   handleBarCodeScanned({ type: 'ean13', data: testBarcode });
  // }, []);

  // Main function to handle barcode scanning
  const handleBarCodeScanned = async (scanningResult: { type: string; data: string }) => {
    if (!scanned) {
      setScanned(true);
      const { data } = scanningResult;
      console.log(`Barcode scanned: Type: ${scanningResult.type}, Data: ${data}`);
      
      const productData = await fetchProductData(data);
      
      if (productData) {
        console.log('Product found. Navigating to ResultScreen.');
        await saveScanData(data);
        const encodedProductData = Buffer.from(JSON.stringify(productData)).toString('base64');
        router.replace(`/ResultScreen?productData=${encodedProductData}`);
      } else {
        console.log('Product not found. Navigating to ProductNotFound.');
        router.replace(`/ProductNotFound?barcode=${data}`);
      }
    } else {
      console.log('Scan skipped as the barcode was already scanned.');
    }
  };

  const handleManualInput = async () => {
    if (manualBarcode.trim() === '') {
      console.log('Error: Barcode input is empty.');
      Alert.alert('Error', 'Please enter a barcode');
      return;
    }
  
    console.log('Manual barcode entered:', manualBarcode);
    setIsOverlayVisible(false);  // Close the modal
    setScanned(true);
  
    await handleBarCodeScanned({ type: 'manual', data: manualBarcode });
    setManualBarcode('');
  };

  // Function to save scan history to Firestore
  const saveScanData = async (barcode: string) => {
    if (!user) {
      console.error("No user logged in to save scan data.");
      return;
    }
    try {
      await firestore().collection('scans').add({
        userId: user.uid,
        barcode,
        timestamp: firestore.FieldValue.serverTimestamp()
      });
      console.log("Scan data saved successfully for user:", user.uid);
    } catch (error) {
      console.error("Error saving scan data:", error);
      Alert.alert("Database Error", "Failed to save scan data.");
    }
  };

  // Function to fetch product data from OpenFoodFacts API or Firestore
  const fetchProductData = async (barcode: string): Promise<ProductData | null> => {
    try {
      // First, attempt to fetch from OpenFoodFacts
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json?fields=product_name,nutriments,image_url,ingredients_text,additives_tags,additives_original_tags`);
      const data = await response.json();
  
      if (data.status === 1) {  // Product found in OpenFoodFacts
        // Process additives data
        const additives = data.product?.additives_tags?.map((additive: string, index: number) => {
          const code = additive.replace('en:', '').toUpperCase();
          const originalTag = data.product?.additives_original_tags?.[index]?.replace('en:', '') || '';
          const name = originalTag.split(' - ')[1] || originalTag;
          return { code, name };
        }) || [];

        const ingredients = data.product.ingredients_text ? data.product.ingredients_text.split(', ') : null;

        // Check if ingredients are empty or null
        if (!ingredients || ingredients.length === 0) {
          return null; // Trigger ProductNotFound page if no ingredients
        }

        // Return structured product data
        return {
          product_name: data.product?.product_name,
          calories: data.product?.nutriments?.energy_kcal || null,
          protein: data.product?.nutriments?.proteins || null,
          carbs: data.product?.nutriments?.carbohydrates || null,
          fat: data.product?.nutriments?.fat || null,
          image_url: data.product?.image_url || null,
          ingredients: ingredients,
          additives: additives,
        };
      } else {
        console.log('Product not found in OpenFoodFacts. Checking Firestore...');
  
        // If not in OpenFoodFacts, check Firestore
        const productDoc = await firestore().collection('products').where('barcode', '==', barcode).get();
  
        if (!productDoc.empty) {  // Product found in Firestore
          const productData = productDoc.docs[0].data();
          console.log('Product found in Firestore:', productData);
  
          const rawIngredients = productData.ingredients || '';
          const ingredients = rawIngredients.trim().split(', ');
  
          // Check if ingredients are empty
          if (ingredients.length === 0 || ingredients[0] === 'to be added') {
            return null; // Trigger ProductNotFound page if no ingredients
          }

          // Return structured product data from Firestore
          return {
            product_name: productData.productName,
            calories: productData.calories || null,
            protein: productData.protein || null,
            carbs: productData.carbs || null,
            fat: productData.fat || null,
            image_url: productData.productImageUrl || null,
            ingredients: ingredients,
            additives: null,  // Set to null as additives are not available in the database yet
          };
        } else {
          console.log('Product not found in Firestore either.');
          return null;
        }
      }
    } catch (error) {
      console.error('Error fetching product data:', error);
      return null;
    }
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
