import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter, useNavigation, Href } from 'expo-router';

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

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setScanned(false);
    });

    return unsubscribe;
  }, [navigation]);

  const handleBarCodeScanned = async (scanningResult: { type: string; data: string }) => {
    if (!scanned) {
      setScanned(true);
      const { data } = scanningResult;
      const productData = await fetchProductData(data);

      if (productData) {
        const encodedProductData = encodeURIComponent(JSON.stringify(productData));
        router.push(`/ResultScreen?productData=${encodedProductData}`);
      } else {
        Alert.alert('Error', 'Failed to fetch product data');
      }
    }
  };

  useEffect(() => {
    // Directly simulate barcode scanning with a hardcoded barcode
    fetchProductData('0737628064502').then((productData) => {
      // fetchProductData('07376280645').then((productData) => { ****** Uncomment if you want to see productnotfound
      if (productData) {
        console.log("Ingredients:", productData.ingredients); // Log ingredients to check
        const encodedProductData = encodeURIComponent(JSON.stringify(productData));
        router.push(`/ResultScreen?productData=${encodedProductData}`);
      } else {
        router.push(`/ProductNotFound?barcode=073762806450`);
      }
    });
  }, []);

  const fetchProductData = async (barcode: string): Promise<ProductData | null> => {
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json?fields=product_name,nutriments,image_url,ingredients_text`);
      const data = await response.json();

      if (!data.product?.ingredients_text) {
        console.warn('Ingredients not found for this product.');
        Alert.alert('No Ingredients Data', 'The ingredients for this product are not available.');
        return null;
      }

      if (!data.product) {
        console.warn('Product not found');
        router.push(`/ProductNotFound?barcode=${barcode}`);
        return null;
      }

      return {
        product_name: data.product?.product_name,
        calories: data.product?.nutriments?.energy_kcal || null,
        protein: data.product?.nutriments?.proteins || null,
        carbs: data.product?.nutriments?.carbohydrates || null,
        fat: data.product?.nutriments?.fat || null,
        image_url: data.product?.image_url || null,
        ingredients: data.product.ingredients_text.split(', ') || null,
      };
    } catch (error) {
      console.error('Error fetching product data:', error);
      router.push(`/ProductNotFound?barcode=${barcode}`);
      return null;
    }
  };

  if (!hasPermission) {
    return <Text>Requesting for camera permission...</Text>;
  }

  if (!hasPermission.granted) {
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
