import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert, SafeAreaView, Platform } from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

import avocadoAnimation from '../../assets/lottie/Avocado.json';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { useUser } from '../../context/UserContext';

// This component handles the scenario when a product is not found in the database
// It allows users to submit new product information, including images
const ProductNotFound = () => {
  // Extract barcode from URL params
  const { barcode } = useLocalSearchParams<{ barcode: string }>();
  
  // State variables to manage component data and UI
  const [barcodeState, setBarcodeState] = useState(barcode || '');
  const [productImage, setProductImage] = useState<string | null>(null);
  const [ingredientsImage, setIngredientsImage] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Hooks for navigation and user context
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    console.log('Received Barcode:', barcode);

    // Reset state when a new barcode is scanned
    setBarcodeState(barcode || '');
    setProductImage(null);
    setIngredientsImage(null);

    // Request camera permission when component mounts
    const requestPermission = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(status === 'granted');
    };

    requestPermission();
  }, [barcode]);

  // Function to upload an image to Firebase Storage
  const uploadImage = async (uri: string, imageName: string): Promise<string | null> => {
    if (!uri) return null;
  
    // Adjust URI for iOS to ensure compatibility
    const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
    const storageRef = storage().ref(imageName);
    
    try {
      await storageRef.putFile(uploadUri);
      const downloadURL = await storageRef.getDownloadURL();
      console.log("Uploaded Image URL:", downloadURL);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  // Function to take a photo using the device camera
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

  // Function to pick an image from the device's photo library
  const pickImage = async (setImage: React.Dispatch<React.SetStateAction<string | null>>) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Function to handle image selection, allowing user to choose between camera and photo library
  const handleImageSelection = (setImage: React.Dispatch<React.SetStateAction<string | null>>) => {
    Alert.alert(
      "Select Image Source",
      "Choose the source for your image",
      [
        {
          text: "Camera",
          onPress: () => takePhoto(setImage)
        },
        {
          text: "Photo Library",
          onPress: () => pickImage(setImage)
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ]
    );
  };

  // Function to handle form submission
  const handleSubmit = async () => {
    // Validate that all required fields are filled
    if (!barcodeState || !productImage || !ingredientsImage) {
      Alert.alert('Missing Information', 'Please provide all required information before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images to Firebase Storage
      const productImageUrl = await uploadImage(productImage, `products/${barcodeState}_front.jpg`);
      const ingredientsImageUrl = await uploadImage(ingredientsImage, `products/${barcodeState}_ingredients.jpg`);

      if (!productImageUrl || !ingredientsImageUrl) {
        throw new Error('Failed to upload images');
      }

      // Add new product to Firestore database
      await firestore().collection('products').add({
        userId: user?.uid,
        barcode: barcodeState,
        productImageUrl,
        ingredientsImageUrl,
        productName: "to be added",
        ingredients: "to be added",
        timestamp: firestore.FieldValue.serverTimestamp(),
      });

      // Show success message and navigate back to scan page
      Alert.alert(
        'Submission Successful',
        'Thank you for submitting the product information.',
        [{ 
          text: 'OK', 
          onPress: () => {
            // Reset state after successful submission
            setBarcodeState('');
            setProductImage(null);
            setIngredientsImage(null);
            router.push('/scan');
          } 
        }]
      );
    } catch (error) {
      console.error('Error during submission:', error);
      Alert.alert('Submission Failed', 'There was an error submitting the product information. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render loading state while waiting for camera permission
  if (cameraPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }

  // Render permission request if camera access is not granted
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

  // Main render method for the component
  return (
    <SafeAreaView style={styles.container}>
      {!isSubmitting ? (
        <View style={styles.content}>
          {/* App logo */}
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Product Not Found</Text>
          <Text style={styles.message}>
            Result not found. Please upload product info for flag score
          </Text>

          {/* Barcode input field */}
          <TextInput
            style={styles.input}
            placeholder="Input Barcode Number"
            value={barcodeState}
            onChangeText={text => setBarcodeState(text)}
            placeholderTextColor="#888"
          />

          {/* Image selection buttons */}
          <View style={styles.photoContainer}>
            <TouchableOpacity style={styles.photoButton} onPress={() => handleImageSelection(setProductImage)}>
              {productImage ? (
                <Image source={{ uri: productImage }} style={styles.takenPhoto} />
              ) : (
                <>
                  <Ionicons name="images" size={32} color="#fff" />
                  <Text style={styles.photoText}>Front of Product</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoButton} onPress={() => handleImageSelection(setIngredientsImage)}>
              {ingredientsImage ? (
                <Image source={{ uri: ingredientsImage }} style={styles.takenPhoto} />
              ) : (
                <>
                  <Ionicons name="images" size={32} color="#fff" />
                  <Text style={styles.photoText}>Image of Ingredients</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Submit button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Loading animation while submitting
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

// Styles for the component
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
  button: {
    backgroundColor: '#f1ede1',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  text: {
    color: '#3A6A64',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ProductNotFound;