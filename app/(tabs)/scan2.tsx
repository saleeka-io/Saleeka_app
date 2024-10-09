import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Platform, StyleSheet } from 'react-native';
import { RNCamera } from 'react-native-camera';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import BarcodeScanning from '@react-native-ml-kit/barcode-scanning';

interface BarCodeEvent {
  data: string;
  type: string;
}

export default function BarcodeScanner() {
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const cameraRef = useRef<RNCamera | null>(null);

  useEffect(() => {
    (async () => {
      const result = await requestCameraPermission();
      setHasPermission(result);
    })();
  }, []);

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

  const handleBarCodeScanned = async ({ data, bounds, format }: BarCodeEvent) => {
    if (!scannedBarcode && cameraRef.current) {
      try {
        const { uri } = await cameraRef.current.takePictureAsync({ quality: 0.5 });
        const results = await BarcodeScanning.scan(uri);
        
        if (results.length > 0) {
          setScannedBarcode(results[0].value);
          console.log(`ML Kit scanned barcode: ${results[0].value}`);
        } else {
          // Fallback to RNCamera result if ML Kit doesn't detect a barcode
          setScannedBarcode(data);
          console.log(`RNCamera scanned barcode: ${data}`);
        }
      } catch (error) {
        console.error("Error scanning barcode:", error);
        // Fallback to RNCamera result if ML Kit fails
        setScannedBarcode(data);
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
    <View style={styles.container}>
      {!scannedBarcode ? (
        <RNCamera
          ref={cameraRef}
          style={styles.camera}
          type={RNCamera.Constants.Type.back}
          onBarCodeRead={handleBarCodeScanned}
          captureAudio={false}
        />
      ) : (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>Scanned Barcode:</Text>
          <Text style={styles.barcodeText}>{scannedBarcode}</Text>
          <Button title="Scan Again" onPress={() => setScannedBarcode(null)} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    width: '100%',
    height: '80%',
  },
  resultContainer: {
    alignItems: 'center',
  },
  resultText: {
    fontSize: 18,
  },
  barcodeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
  },
});
