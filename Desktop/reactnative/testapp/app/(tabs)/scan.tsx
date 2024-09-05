import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, SafeAreaView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter, useNavigation, useFocusEffect } from 'expo-router';
import firestore from '@react-native-firebase/firestore';
import { useUser } from '../../context/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { Buffer } from 'buffer';

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

  useFocusEffect(
    useCallback(() => {
      setScanned(false);
    }, [])
  );

  // Testing barcode automatically on component mount
  // useEffect(() => {
  //   const testBarcode = '3858890476835'; // Hardcoded barcode for testing
  //   handleBarCodeScanned({ type: 'ean13', data: testBarcode });
  // }, []);

  const handleBarCodeScanned = async (scanningResult: { type: string; data: string }) => {
    if (!scanned) {
      setScanned(true);  // Disable further scanning
      const { data } = scanningResult;
      const productData = await fetchProductData(data);

      if (productData) {
        saveScanData(data);
        const encodedProductData = Buffer.from(JSON.stringify(productData)).toString('base64');
        // Prevent double push
        if (navigation.canGoBack()) {
          navigation.goBack();
        }

        while (router.canGoBack()) { // Pop from stack until one element is left
          router.back();
        }
        router.replace(`/ResultScreen?productData=${encodedProductData}`);

        // router.replace(`/ResultScreen?productData=${encodedProductData}`);
      } else {
        router.replace(`/ProductNotFound?barcode=${data}`);
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
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json?fields=product_name,nutriments,image_url,ingredients_text,additives_tags,additives_original_tags`);
      const data = await response.json();
  
      if (data.status === 1) {  // Product found in OpenFoodFacts
        const additives = data.product?.additives_tags?.map((additive: string, index: number) => {
          const code = additive.replace('en:', '').toUpperCase();
          const originalTag = data.product?.additives_original_tags?.[index]?.replace('en:', '') || '';
          const name = originalTag.split(' - ')[1] || originalTag;
          return { code, name };
        }) || [];

        const ingredients = data.product.ingredients_text ? data.product.ingredients_text.split(', ') : null;

        // Check if ingredients are empty or null
        if (!ingredients || ingredients.length === 0) {
          return null; // This will trigger the ProductNotFound page
        }

        return {
          product_name: data.product?.product_name,
          calories: data.product?.nutriments?.energy_kcal || null,
          protein: data.product?.nutriments?.proteins || null,
          carbs: data.product?.nutriments?.carbohydrates || null,
          fat: data.product?.nutriments?.fat || null,
          image_url: data.product?.image_url || null,
          ingredients: data.product.ingredients_text ? data.product.ingredients_text.split(', ') : null,
          additives: additives,
        };
      } else {
        console.log('Product not found in OpenFoodFacts. Checking Firestore...');
  
        // Check Firestore for the product
        const productDoc = await firestore().collection('products').where('barcode', '==', barcode).get();
  
        if (!productDoc.empty) {  // Product found in Firestore
          const productData = productDoc.docs[0].data();
          console.log('Product found in Firestore:', productData);
  
          const rawIngredients = productData.ingredients || '';
          const ingredients = rawIngredients.trim().split(', ');
  
          // Check if ingredients are empty
          if (ingredients.length === 0) {
            return null; // This will trigger the ProductNotFound page
          }

          return {
            product_name: productData.productName,
            calories: productData.calories || null,
            protein: productData.protein || null,
            carbs: productData.carbs || null,
            fat: productData.fat || null,
            image_url: productData.productImageUrl || null,
            ingredients: ingredients,
            additives: null,  // Set to null as additives are not available in your database yet
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

  return (
    <SafeAreaView style={styles.container}>
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
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
        </View>
      </CameraView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.switchButton}>
          <Ionicons name="flash-off" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.switchButton}>
          <Ionicons name="camera-reverse-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'transparent',
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
  message: {
    color: 'white',
    textAlign: 'center',
    paddingBottom: 10,
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  text: {
    color: 'white',
    fontSize: 16,
  },
});

export default BarcodeScanner;