import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, SafeAreaView, Animated, Modal, TextInput } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter, useNavigation, useFocusEffect } from 'expo-router';
import firestore from '@react-native-firebase/firestore';
import { useUser } from '../../context/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { Buffer } from 'buffer';

// Define the structure of product data
// This helps in maintaining consistent data types throughout the component
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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');

  // Animation for the ellipsis
  useEffect(() => {
    const animateEllipsis = () => {
      setEllipsis(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    };

    const interval = setInterval(animateEllipsis, 500);
    return () => clearInterval(interval);
  }, []);

  // Animation for the barcode outline
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
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

  // Reset scanned state when the component comes into focus
  // This allows for repeated scanning when navigating back to this screen
  useFocusEffect(
    useCallback(() => {
      setScanned(false);
      setIsModalVisible(false);
      setManualBarcode('');
    }, [])
  );


  // 028400589871 - Red
  // 0737628064502 - Yellow
  // 742365007071 - Green

  // Testing barcode automatically on component mount
  // useEffect(() => {
  //   const testBarcode = '74236500707'; // Hardcoded barcode for testing
  //   handleBarCodeScanned({ type: 'ean13', data: testBarcode });
  // }, []);


  // Main function to handle barcode scanning
  const handleBarCodeScanned = useCallback(async (scanningResult: { type: string; data: string }) => {
    if(scanned) return;
    if (!scanned) {
      setScanned(true);  // Prevent multiple scans
      const { data } = scanningResult;
      const productData = await fetchProductData(data);

      if (productData) {
        // Save scan data for user history
        saveScanData(data);
        // Encode product data for URL parameter
        const encodedProductData = Buffer.from(JSON.stringify(productData)).toString('base64');
        
        // Navigation logic to ensure proper stack management
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
        while (router.canGoBack()) {
          router.back();
        }
        // Navigate to result screen with product data
        router.push(`/ResultScreen?productData=${encodedProductData}`);
      } else {
        // Navigate to product not found screen if data isn't available
        router.push(`/ProductNotFound?barcode=${data}`);
        // Alert.alert('Product Not Found', 'Please help by providing product information.');
      }
    }
  },[scanned, router]);

    const handleManualInput = useCallback(async () => {
    if (manualBarcode.trim() === '') {
      Alert.alert('Error', 'Please enter a barcode');
      return;
    }
    setIsModalVisible(false);
    setScanned(true);
    await handleBarCodeScanned({ type: 'manual', data: manualBarcode});
    setManualBarcode('');
  }, [manualBarcode, handleBarCodeScanned]);


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

  const renderModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isModalVisible}
      onRequestClose={() => {
        setManualBarcode('');
        setIsModalVisible(false);
      }}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TouchableOpacity 
            style={styles.modalCloseButton} 
            onPress={() => setIsModalVisible(false)}
          >
            <Ionicons name="close" size={24} color="#3A6A64" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Enter Barcode Manually</Text>
          <TextInput
            style={styles.input}
            onChangeText={setManualBarcode}
            value={manualBarcode}
            placeholder="Enter barcode"
            keyboardType="numeric"
            placeholderTextColor="#666"
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleManualInput}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: [
            'ean13', 'ean8', 'upc_a', 'upc_e', 'code39', 'code128',
            'codabar', 'interleaved2of5', 'pdf417', 'aztec', 'dataMatrix',
          ],
        }}
      >
       <View style={styles.overlay}>
          {/* Manual input button */}
          <TouchableOpacity 
            style={styles.manualInputButton} 
            onPress={() => setIsModalVisible(true)}
          >
            <Ionicons name ="barcode-outline" size={24} color={"white"}/>
          </TouchableOpacity>

          <Text style={styles.searchingText}>SEARCHING FOR BARCODE{ellipsis}</Text>
          <View style={styles.scanArea}>
            <Animated.View style={[styles.barcodeOutline, { opacity: fadeAnim }]}>
              {renderBarcodeLines()}
            </Animated.View>
          </View>
          <TouchableOpacity style={styles.flashButton}>
            <Ionicons name="flash-off" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </CameraView>
        {renderModal()}
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#f1ede1',
    padding: 20,
    borderRadius: 15,
    width: '80%',
    alignItems: 'center',
  },
  modalCloseButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3A6A64',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#3A6A64',
    borderRadius: 25,
    padding: 15,
    marginBottom: 20,
    width: '100%',
    fontSize: 16,
    color: '#3A6A64',
    backgroundColor: '#fff',
  },
  searchButton: {
    backgroundColor: '#3A6A64',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  searchButtonText: {
    color: '#f1ede1',
    fontSize: 18,
    fontWeight: 'bold',
  },
  manualInputButton: {
    position: 'absolute',
    top: 38,
    left: 20,
    padding: 10,
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
  flashButton: {
    position: 'absolute',
    top: 50,
    right: 20,
  },
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