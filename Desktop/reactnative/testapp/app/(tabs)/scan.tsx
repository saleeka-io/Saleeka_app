import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Button } from 'react-native';
import { Camera } from 'expo-camera';

// Define the structure for the barcode scanning event
interface BarCodeScanEvent {
  type: string;
  data: string;
}

const CameraScreen = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [productData, setProductData] = useState<any | null>(null);
  const [additives, setAdditives] = useState<Array<any>>([]);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
    fetchProductData('0737628064502');
  }, []);

  const handleBarCodeScanned = ({ type, data }: BarCodeScanEvent) => {
    setScanned(true);
    alert(`Bar code with type ${type} and data ${data} has been scanned!`);
    fetchProductData(data);
  };

  const fetchProductData = async (barcode: string) => {
    try {
      const response = await fetch(`https://world.openfoodfacts.net/api/v3/product/${barcode}.json?fields=product_name,ingredients_text,additives_tags`);
      const data = await response.json();
      setProductData(data.product);

      if (data.product && data.product.additives_tags.length > 0) {
        const additiveDetails = await Promise.all(
          data.product.additives_tags.map(async (additive: string) => {
            const additiveCode = additive.replace('en:', '');
            const additiveResponse = await fetch(`https://world.openfoodfacts.org/additive/${additiveCode}.json`);
            const additiveData = await additiveResponse.json();
            return {
              code: additiveCode,
              name: additiveData?.additive?.name || `Unknown Additive (${additiveCode})`,
              description: additiveData?.additive?.description || 'No description available',
            };
          })
        );
        setAdditives(additiveDetails);
      }
    } catch (error) {
      console.error('Error fetching product data:', error);
      Alert.alert('Error', 'Failed to fetch product data');
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      {/* Uncomment below to enable barcode scanning */}
      {/* <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setScanned(false)}>
        <Camera
          style={StyleSheet.absoluteFillObject}
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          barCodeScannerSettings={{
            barCodeTypes: [
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
              'dataMatrix'
            ],
          }}
        />
      </TouchableOpacity>
      {scanned && (
        <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />
      )} */}
      {productData ? (
        <View style={styles.productDataContainer}>
          <Text style={styles.headerText}>Product Name:</Text>
          <Text>{productData.product_name}</Text>
          <Text style={styles.headerText}>Ingredients:</Text>
          <Text>{productData.ingredients_text}</Text>
          <Text style={styles.headerText}>Additives:</Text>
          {additives.length > 0 ? (
            additives.map((additive, index) => (
              <View key={index} style={styles.additiveContainer}>
                <Text style={styles.additiveName}>{additive.name}</Text>
                <Text>{additive.description}</Text>
              </View>
            ))
          ) : (
            <Text>No additives found.</Text>
          )}
        </View>
      ) : (
        <Text>Loading product data...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    padding: 20,
  },
  productDataContainer: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginTop: 10,
  },
  headerText: {
    fontWeight: 'bold',
    marginTop: 10,
  },
  additiveContainer: {
    marginTop: 10,
    padding: 5,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  additiveName: {
    fontWeight: 'bold',
  },
});

export default CameraScreen;
