import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, SafeAreaView } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter, useNavigation, useFocusEffect } from 'expo-router';
import firestore from '@react-native-firebase/firestore';

import { useUser } from '../../context/UserContext';
import { Ionicons } from '@expo/vector-icons';

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
  //   const testBarcode = '0737628064502'; // Hardcoded barcode for testing
  //   handleBarCodeScanned({ type: 'ean13', data: testBarcode });
  // }, []);

  const handleBarCodeScanned = async (scanningResult: { type: string; data: string }) => {
    if (!scanned) {
      setScanned(true);  // Disable further scanning
      const { data } = scanningResult;
      const productData = await fetchProductData(data);
  
      if (productData) {
        saveScanData(data);
        const encodedProductData = encodeURIComponent(JSON.stringify(productData));
  
        // Prevent double push
        if (navigation.canGoBack()) {
          navigation.goBack(); // Or use router.back();
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
        //productData,
        timestamp: firestore.FieldValue.serverTimestamp()
      });
      console.log("Scan data saved successfully for user:", user.uid);
    } catch (error) {
      console.error("Error saving scan data:", error);
      Alert.alert("Database Error", "Failed to save scan data.");
    }
  };

  // Commented out to test useEffect above on line 34
  // useEffect(() => {
  //   // Directly simulate barcode scanning with a hardcoded barcode
  //   fetchProductData('0737628064502').then((productData) => {
  //     // fetchProductData('07376280645').then((productData) => { ****** Uncomment if you want to see productnotfound
  //     if (productData) {
  //       console.log("Ingredients:", productData.ingredients); // Log ingredients to check
  //       const encodedProductData = encodeURIComponent(JSON.stringify(productData));
  //       router.push(`/ResultScreen?productData=${encodedProductData}`);
  //     } else {
  //       router.push(`/ProductNotFound?barcode=073762806450`);
  //     }
  //   });
  // }, []);

  const fetchProductData = async (barcode: string): Promise<ProductData | null> => {
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json?fields=product_name,nutriments,image_url,ingredients_text,additives_tags`);
      const data = await response.json();

      if (data.status === 0) {  // Checking if the product is not found
        console.log('Product not found for barcode:', barcode);
        saveScanData(barcode);
        return null;
      }

      const additives = data.product?.additives_tags?.map((additive: string, index: number) => {
        const code = additive.replace('en:', '').toUpperCase();
        const originalTag = data.product?.additives_original_tags?.[index]?.replace('en:', '') || '';
        const name = originalTag.split(' - ')[1] || originalTag;
        return { code, name };
      }) || [];
      console.log(data.product);

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
    } catch (error) {
      console.error('Error fetching product data:', error);
      router.replace(`/ProductNotFound?barcode=${barcode}`);
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