import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert, SafeAreaView } from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

import avocadoAnimation from '../../assets/lottie/Avocado.json';

const ProductNotFound = () => {
  const { barcode } = useLocalSearchParams<{ barcode: string }>();
  const [barcodeState, setBarcodeState] = useState(barcode || '');
  const [productImage, setProductImage] = useState<string | null>(null);
  const [ingredientsImage, setIngredientsImage] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log('Received Barcode:', barcode);

    const requestPermission = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(status === 'granted');
    };

    requestPermission();
  }, [barcode]);

  const takePhoto = async (setImage: React.Dispatch<React.SetStateAction<string | null>>) => {
    if (cameraPermission === null) {
      return;
    }

    if (!cameraPermission) {
      Alert.alert('Permission Required', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    console.log('Submitting:', { barcodeState, productImage, ingredientsImage });
    setSubmitted(true);
    setTimeout(() => {
      router.push('/scan');
    }, 4000); // Adjust this timing based on the animation duration
  };

  if (cameraPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }

  if (!cameraPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to use the camera</Text>
        <TouchableOpacity onPress={() => Camera.requestCameraPermissionsAsync()} style={styles.button}>
          <Text style={styles.text}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {!submitted ? (
        <View style={styles.content}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Product Not Found</Text>
          <Text style={styles.message}>
            Result not found. Please upload product info for flag score
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Input Barcode Number"
            value={barcodeState}
            onChangeText={text => setBarcodeState(text)}
            placeholderTextColor="#888"
          />

          <View style={styles.photoContainer}>
            <TouchableOpacity style={styles.photoButton} onPress={() => takePhoto(setProductImage)}>
              {productImage ? (
                <Image source={{ uri: productImage }} style={styles.takenPhoto} />
              ) : (
                <>
                  <Ionicons name="camera" size={32} color="#fff" />
                  <Text style={styles.photoText}>Front of Product</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoButton} onPress={() => takePhoto(setIngredientsImage)}>
              {ingredientsImage ? (
                <Image source={{ uri: ingredientsImage }} style={styles.takenPhoto} />
              ) : (
                <>
                  <Ionicons name="camera" size={32} color="#fff" />
                  <Text style={styles.photoText}>Image of Ingredients</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.centeredContainer}>
          <LottieView
            source={avocadoAnimation}
            autoPlay
            loop={true}
            style={styles.avocadoAnimation}
          />
          <Text style={styles.thankYouText}>Thank You, your submission is being processed</Text>
        </View>
      )}
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(58, 106, 100, 0.9)',
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#f1ede1',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#f1ede1',
    padding: 15,
    borderRadius: 25,
    marginBottom: 20,
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  photoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  photoButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(47, 86, 81, 0.8)',
    padding: 15,
    borderRadius: 15,
    marginHorizontal: 5,
    height: 150,
  },
  photoText: {
    color: '#fff',
    marginTop: 5,
    textAlign: 'center',
  },
  takenPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  submitButton: {
    backgroundColor: '#f1ede1',
    padding: 15,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  submitText: {
    color: '#3A6A64',
    fontWeight: 'bold',
    fontSize: 16,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avocadoAnimation: {
    width: 200,
    height: 200,
  },
  thankYouText: {
    marginTop: 20,
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
});

export default ProductNotFound;
