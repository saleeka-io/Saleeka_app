import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  Platform,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

import avocadoAnimation from '../../assets/lottie/Avocado.json';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { useUser } from '../../context/UserContext';

// Get the device dimensions for responsive design
const { width, height } = Dimensions.get('window');

// Calculate responsive font sizes and spacing
const responsiveFontSize = (size: number) => {
  const scaleFactor = Math.min(width, height) / 375; // Base scale on iPhone 8 screen width
  return Math.round(size * scaleFactor);
};

const responsiveSpacing = (space: number) => {
  const scaleFactor = Math.min(width, height) / 375;
  return Math.round(space * scaleFactor);
};

const ProductNotFound = () => {
  const { barcode } = useLocalSearchParams<{ barcode: string }>();
  
  const [barcodeState, setBarcodeState] = useState(barcode || '');
  const [productImage, setProductImage] = useState<string | null>(null);
  const [ingredientsImage, setIngredientsImage] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    console.log('Received Barcode:', barcode);

    setBarcodeState(barcode || '');
    setProductImage(null);
    setIngredientsImage(null);

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
      console.log("Uploaded Image URL:", downloadURL);
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

  const handleSubmit = async () => {
    if (!barcodeState || !productImage || !ingredientsImage) {
      Alert.alert('Missing Information', 'Please provide all required information before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const productImageUrl = await uploadImage(productImage, `products/${barcodeState}_front.jpg`);
      const ingredientsImageUrl = await uploadImage(ingredientsImage, `products/${barcodeState}_ingredients.jpg`);

      if (!productImageUrl || !ingredientsImageUrl) {
        throw new Error('Failed to upload images');
      }

      await firestore().collection('products').add({
        userId: user?.uid,
        barcode: barcodeState,
        productImageUrl,
        ingredientsImageUrl,
        productName: "to be added",
        ingredients: "to be added",
        timestamp: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert(
        'Submission Successful',
        'Thank you for submitting the product information.',
        [{ 
          text: 'OK', 
          onPress: () => {
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

  if (cameraPermission === null) {
    return <Text style={styles.message}>Requesting camera permission...</Text>;
  }

  if (!cameraPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to use the camera</Text>
        <TouchableOpacity onPress={() => Camera.requestCameraPermissionsAsync()} style={styles.button}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
        >
          {!isSubmitting ? (
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
                <TouchableOpacity style={styles.photoButton} onPress={() => handleImageSelection(setProductImage)}>
                  {productImage ? (
                    <Image source={{ uri: productImage }} style={styles.takenPhoto} />
                  ) : (
                    <>
                      <Ionicons name="images" size={responsiveFontSize(32)} color="#fff" />
                      <Text style={styles.photoText}>Front of Product</Text>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.photoButton} onPress={() => handleImageSelection(setIngredientsImage)}>
                  {ingredientsImage ? (
                    <Image source={{ uri: ingredientsImage }} style={styles.takenPhoto} />
                  ) : (
                    <>
                      <Ionicons name="images" size={responsiveFontSize(32)} color="#fff" />
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
              <Text style={styles.thankYouText}>Thank you, your submission is being processed</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(58, 106, 100, 0.9)',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: responsiveSpacing(20),
    paddingTop: Platform.OS === 'ios' ? responsiveSpacing(20) : responsiveSpacing(20),
    paddingBottom: responsiveSpacing(20),
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5 * (9/16),
    marginBottom: responsiveSpacing(20),
  },
  title: {
    fontSize: responsiveFontSize(24),
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: responsiveSpacing(10),
  },
  message: {
    fontSize: responsiveFontSize(14),
    color: '#f1ede1',
    textAlign: 'center',
    marginBottom: responsiveSpacing(20),
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#f1ede1',
    padding: responsiveSpacing(15),
    borderRadius: responsiveSpacing(25),
    marginBottom: responsiveSpacing(20),
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    fontSize: responsiveFontSize(14),
  },
  photoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: responsiveSpacing(20),
  },
  photoButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(47, 86, 81, 0.8)',
    padding: responsiveSpacing(15),
    borderRadius: responsiveSpacing(15),
    marginHorizontal: responsiveSpacing(5),
    height: width * 0.4,
  },
  photoText: {
    color: '#fff',
    marginTop: responsiveSpacing(5),
    textAlign: 'center',
    fontSize: responsiveFontSize(14),
  },
  takenPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: responsiveSpacing(15),
  },
  submitButton: {
    backgroundColor: '#f1ede1',
    padding: responsiveSpacing(15),
    borderRadius: responsiveSpacing(25),
    width: '100%',
    alignItems: 'center',
    marginTop: responsiveSpacing(20),
  },
  submitText: {
    color: '#3A6A64',
    fontWeight: 'bold',
    fontSize: responsiveFontSize(16),
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avocadoAnimation: {
    width: width * 0.5,
    height: width * 0.5,
  },
  thankYouText: {
    marginTop: responsiveSpacing(20),
    fontSize: responsiveFontSize(18),
    color: '#fff',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#f1ede1',
    padding: responsiveSpacing(15),
    borderRadius: responsiveSpacing(25),
    alignItems: 'center',
    marginTop: responsiveSpacing(20),
  },
  buttonText: {
    color: '#3A6A64',
    fontWeight: 'bold',
    fontSize: responsiveFontSize(16),
  },
});

export default ProductNotFound;