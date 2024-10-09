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
  StatusBar,
} from 'react-native';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import avocadoAnimation from '../../assets/lottie/Avocado.json';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { useUser } from '../../context/UserContext';

const { width, height } = Dimensions.get('window');

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

    // Set status bar properties
    StatusBar.setBarStyle('light-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('#3A6A64');
    }
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

  const handleImageSelection = async (setImage: React.Dispatch<React.SetStateAction<string | null>>) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant permission to access your photo library.');
      return;
    }

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
    <View style={styles.container}>
      <LinearGradient
        colors={['#3A6A64', '#1E3B38']}
        style={styles.gradient}
      >
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
                <View style={styles.logoContainer}>
                  <Image
                    source={require('../../assets/images/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.title}>Product Not Found</Text>
                <Text style={styles.message}>
                  Result not found. Please upload product info for flag score
                </Text>

                <TextInput
                  style={styles.input}
                  placeholder="Input Barcode Number"
                  value={barcodeState}
                  onChangeText={text => setBarcodeState(text)}
                  placeholderTextColor="#CCCCCC"
                />

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
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40, // Increased top padding to account for status bar
    paddingBottom: 20,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  logoContainer: {
    width: width * 0.3,
    height: width * 0.52 * (9/16),
    borderRadius: width * 0.3,
    backgroundColor: '#f1ede1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    overflow: 'hidden',
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5 * (9/16),
    marginBottom: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 40,
    marginBottom: 20,
    color: '#FFFFFF',
    fontSize: 16,
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    height: width * 0.4,
  },
  photoText: {
    color: '#FFFFFF',
    marginTop: 10,
    textAlign: 'center',
    fontSize: 14,
  },
  takenPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  submitButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
  },
  submitText: {
    color: '#3A6A64',
    fontWeight: 'bold',
    fontSize: 18,
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
    marginTop: 20,
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#3A6A64',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ProductNotFound;