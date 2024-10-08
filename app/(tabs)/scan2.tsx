import React, { useState, useEffect } from 'react';
import { Text, View, Button, Platform } from 'react-native';
import { RNCamera, BarCodeReadEvent } from 'react-native-camera'; // For camera access
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions'; // For permissions
import BarcodeScanning from '@react-native-ml-kit/barcode-scanning'; // ML Kit barcode scanning

export default function BarcodeScanner() {
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Request camera permission on mount
  useEffect(() => {
    (async () => {
      const result = await requestCameraPermission();
      setHasPermission(result);
    })();
  }, []);

  // Function to request camera permissions based on the platform
  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'ios') {
      const result = await request(PERMISSIONS.IOS.CAMERA);
      return result === RESULTS.GRANTED;
    } else if (Platform.OS === 'android') {
      const result = await request(PERMISSIONS.ANDROID.CAMERA);
      return result === RESULTS.GRANTED;
    }
    return false;
  };

  // Function to handle when a barcode is scanned
  const handleBarCodeScanned = async (barcodeData: BarCodeReadEvent) => {
    if (!scannedBarcode) { // Avoid multiple scans
      try {
        const barcodes = await BarcodeScanning.scan(barcodeData.data); // Process the image using ML Kit
        if (barcodes.length > 0) {
          setScannedBarcode(barcodes[0].value); // Get the first barcode scanned and set it
        }
      } catch (error) {
        console.error("Barcode scanning failed:", error);
      }
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }

  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {!scannedBarcode ? (
        <RNCamera
          style={{ width: '100%', height: '80%' }}
          type={RNCamera.Constants.Type.back}
          onBarCodeRead={handleBarCodeScanned} // Corrected prop name
        />
      ) : (
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 18 }}>Scanned Barcode:</Text>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginVertical: 20 }}>
            {scannedBarcode}
          </Text>
          <Button title="Scan Again" onPress={() => setScannedBarcode(null)} />
        </View>
      )}
    </View>
  );
}
