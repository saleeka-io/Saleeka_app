import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert, SafeAreaView, Platform } from 'react-native'; // Import Platform here
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { useUser } from '../../context/UserContext'; // Assuming you're using a UserContext to get the user ID

const ProductNotFound = () => {
  const { barcode } = useLocalSearchParams<{ barcode: string }>();
  const [barcodeState, setBarcodeState] = useState(barcode || '');
  const [productImage, setProductImage] = useState<string | null>(null);
  const [ingredientsImage, setIngredientsImage] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const router = useRouter();
  const { user } = useUser(); // Get the user from your context

  useEffect(() => {
    console.log('Received Barcode:', barcode);  // Debugging: log the received barcode

    const requestPermission = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(status === 'granted');
    };

    requestPermission();
  }, [barcode]);

  const uploadImage = async (uri: string, imageName: string): Promise<string | null> => {
    if (!uri) return null;
  
    const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
    const storageRef = storage().ref(imageName);
    
    try {
      await storageRef.putFile(uploadUri);
      const downloadURL = await storageRef.getDownloadURL();
      console.log("Uploaded Image URL:", downloadURL); // Log the URL to debug
      return downloadURL;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };
  

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

  const handleSubmit = async () => {
    if (!barcodeState || !productImage || !ingredientsImage) {
      Alert.alert('Missing Information', 'Please provide all required information before submitting.');
      return;
    }

    const productImageUrl = await uploadImage(productImage, `products/${barcodeState}_front.jpg`);
    const ingredientsImageUrl = await uploadImage(ingredientsImage, `products/${barcodeState}_ingredients.jpg`);

    if (!productImageUrl || !ingredientsImageUrl) {
      Alert.alert('Image Upload Failed', 'Failed to upload images. Please try again.');
      return;
    }

    try {
      await firestore().collection('products').add({
        userId: user?.uid, // Include the user ID in the submission
        barcode: barcodeState,
        productImageUrl, // Save the download URL instead of the local file path
        ingredientsImageUrl, // Save the download URL instead of the local file path
        productName: "to be added", // Default placeholder value
        ingredients: "to be added", // Default placeholder value
        timestamp: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert('Submission Successful', 'Thank you for submitting the product information.');
      router.back(); // Go back to the previous screen
    } catch (error) {
      console.error('Error adding document to Firestore:', error);
      Alert.alert('Submission Failed', 'There was an error submitting the product information. Please try again later.');
    }
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
      <View style={styles.content}>
        <Image
          source={require('../../assets/images/logo.png')} // Add your app logo
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

        <View style={styles.uploadContainer}>
          <TouchableOpacity style={styles.uploadButton} onPress={() => takePhoto(setProductImage)}>
            <Ionicons name="camera" size={32} color="#fff" />
            <Text style={styles.uploadText}>Front of Product</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.uploadButton} onPress={() => pickImage(setProductImage)}>
            <Ionicons name="image-outline" size={32} color="#fff" />
            {productImage && <Image source={{ uri: productImage }} style={styles.imagePreview} />}
            <Text style={styles.uploadText}>Front Image of Product</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.uploadContainer}>
          <TouchableOpacity style={styles.uploadButton} onPress={() => takePhoto(setIngredientsImage)}>
            <Ionicons name="camera" size={32} color="#fff" />
            <Text style={styles.uploadText}>Ingredients Image</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.uploadButton} onPress={() => pickImage(setIngredientsImage)}>
            <Ionicons name="image-outline" size={32} color="#fff" />
            {ingredientsImage && <Image source={{ uri: ingredientsImage }} style={styles.imagePreview} />}
            <Text style={styles.uploadText}>Back Image of Product</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(58, 106, 100, 0.9)', // Semi-transparent overlay
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
  uploadContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  uploadButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(47, 86, 81, 0.8)',
    padding: 15,
    borderRadius: 15,
    marginHorizontal: 5,
  },
  uploadText: {
    color: '#fff',
    marginTop: 5,
    textAlign: 'center',
  },
  imagePreview: {
    width: 50,
    height: 50,
    marginTop: 10,
    borderRadius: 5,
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
});

export default ProductNotFound;
