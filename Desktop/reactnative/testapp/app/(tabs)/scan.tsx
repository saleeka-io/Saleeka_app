import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter, useNavigation } from 'expo-router';
import firestore from '@react-native-firebase/firestore';
import { useUser } from '../../context/UserContext';

interface ProductData {
  product_name: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  image_url: string | null;
  ingredients: string[] | null;
}

const BarcodeScanner = () => {
  const [hasPermission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const router = useRouter();
  const navigation = useNavigation();
  const cameraRef = useRef(null);
  const { user } = useUser();

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  useEffect(() => {
    const testBarcode = '3628064502'; // Hardcoded barcode for testing
    handleBarCodeScanned({ type: 'ean13', data: testBarcode });
  }, []);

  const handleBarCodeScanned = async (scanningResult: { type: string; data: string }) => {
    if (!scanned) {
      setScanned(true);  // Disable further scanning
      const { data } = scanningResult;
      const productData = await fetchProductData(data);
  
      if (productData) {
        saveScanData(data);
        const encodedProductData = encodeURIComponent(JSON.stringify(productData));
  
        if (navigation.canGoBack()) {
          navigation.goBack();
        }
  
        router.push(`/ResultScreen?productData=${encodedProductData}`);
      } else {
        router.push(`/ProductNotFound?barcode=${data}`);
        Alert.alert('Product Not Found', 'Please help by providing product information.');
      }
    }
  };
  
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

  const fetchProductData = async (barcode: string): Promise<ProductData | null> => {
    try {
      // Attempt to fetch product data from OpenFoodFacts
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json?fields=product_name,nutriments,image_url,ingredients_text`);
      const data = await response.json();
  
      if (data.status === 0) {  // Product not found in OpenFoodFacts
        console.log('Product not found for barcode:', barcode);
        console.log('Checking Firestore for the product...');
  
        // Check Firestore for the product
        const productDoc = await firestore().collection('products').where('barcode', '==', barcode).get();
  
        if (!productDoc.empty) {  // Product found in Firestore
          const productData = productDoc.docs[0].data();
          console.log('Raw Firestore product data:', productData);  // Log the entire product data
  
          const rawIngredients = productData.ingredients || '';
          console.log('Raw ingredients field from Firestore:', rawIngredients);  // Log the raw ingredients field
  
          const ingredients = rawIngredients.trim().split(', ');
          console.log('Parsed ingredients:', ingredients);
  
          return {
            product_name: productData.productName,
            calories: null,
            protein: null,
            carbs: null,
            fat: null,
            image_url: productData.productImageUrl,
            ingredients: ingredients,
          };
        } else {
          console.log('Product not found in Firestore either.');
          return null;
        }
      }
  
      // Product found in OpenFoodFacts
      return {
        product_name: data.product?.product_name,
        calories: data.product?.nutriments?.energy_kcal || null,
        protein: data.product?.nutriments?.proteins || null,
        carbs: data.product?.nutriments?.carbohydrates || null,
        fat: data.product?.nutriments?.fat || null,
        image_url: data.product?.image_url || null,
        ingredients: data.product.ingredients_text ? data.product.ingredients_text.split(', ') : null,
      };
    } catch (error) {
      console.error('Error fetching product data:', error);
      router.push(`/ProductNotFound?barcode=${barcode}`);
      return null;
    }
  };
  
  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: [
            'qr', 'ean13', 'ean8', 'upc_a', 'upc_e', 'code39', 'code128',
            'codabar', 'interleaved2of5', 'pdf417', 'aztec', 'dataMatrix',
          ],
        }}
      >
        {scanned && (
          <TouchableOpacity style={styles.buttonOverlay} onPress={() => setScanned(false)}>
            <Text style={styles.scanAgainText}>Tap to Scan Again</Text>
          </TouchableOpacity>
        )}
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonOverlay: {
    flex: 1,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  scanAgainText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default BarcodeScanner;
