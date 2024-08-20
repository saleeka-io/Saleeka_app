import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';

// Interface definition for product data
interface ProductData {
  product_name: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  image_url: string | null;
}

const BarcodeScanner = () => {
  const [hasPermission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const router = useRouter();
  const cameraRef = useRef(null);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  const handleBarCodeScanned = async (scanningResult: { type: string; data: string }) => {
    setScanned(true);
    const { data } = scanningResult;
    const productData = await fetchProductData(data);

    if (productData) {
      const encodedProductData = encodeURIComponent(JSON.stringify(productData));
      router.push(`/ResultScreen?productData=${encodedProductData}`);
    } else {
      Alert.alert('Error', 'Failed to fetch product data');
    }
  };

  const fetchProductData = async (barcode: string): Promise<ProductData | null> => {
    try {
      const response = await fetch(`https://world.openfoodfacts.net/api/v3/product/${barcode}.json?fields=product_name,nutriments,image_url`);
      const data = await response.json();

      return {
        product_name: data.product?.product_name,
        calories: data.product?.nutriments?.energy_kcal || null,
        protein: data.product?.nutriments?.proteins || null,
        carbs: data.product?.nutriments?.carbohydrates || null,
        fat: data.product?.nutriments?.fat || null,
        image_url: data.product?.image_url || null,
      };
    } catch (error) {
      console.error('Error fetching product data:', error);
      return null;
    }
  };

  useEffect(() => {
    // Directly simulate barcode scanning with a hardcoded barcode
    fetchProductData('0737628064502').then((productData) => {
      if (productData) {
        const encodedProductData = encodeURIComponent(JSON.stringify(productData));
        router.push(`/ResultScreen?productData=${encodedProductData}`);
      } else {
        Alert.alert('Error', 'Failed to fetch product data');
      }
    });
  }, []);

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
            'qr',
            'ean13',
            'ean8',
            'upc_a',
            'upc_e',
            'code39',
            'code128',
            'codabar',
            'interleaved2of5',
            'pdf417',
            'aztec',
            'dataMatrix',
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
