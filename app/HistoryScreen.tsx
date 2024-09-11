import React from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Buffer } from 'buffer';

// Updated mockHistoryItems with quality ratings
const mockHistoryItems = [
  {
    id: '1',
    productData: {
      product_name: 'Organic Milk',
      image_url: 'https://example.com/milk.jpg',
      ingredients: ['Milk', 'Vitamin D'],
      timestamp: new Date('2023-09-01T10:00:00'),
      quality: 'Excellent',
    },
  },
  {
    id: '2',
    productData: {
      product_name: 'Whole Grain Bread',
      image_url: 'https://example.com/bread.jpg',
      ingredients: ['Whole Wheat Flour', 'Water', 'Yeast', 'Salt'],
      timestamp: new Date('2023-09-02T14:30:00'),
      quality: 'Good',
    },
  },
  {
    id: '3',
    productData: {
      product_name: 'Apple Juice',
      image_url: 'https://example.com/applejuice.jpg',
      ingredients: ['Apple Juice Concentrate', 'Water', 'Vitamin C'],
      timestamp: new Date('2023-09-03T09:15:00'),
      quality: 'Fair',
    },
  },
  {
    id: '4',
    productData: {
      product_name: 'Chocolate Bar',
      image_url: 'https://example.com/chocolate.jpg',
      ingredients: ['Cocoa Mass', 'Sugar', 'Cocoa Butter', 'Vanilla Extract'],
      timestamp: new Date('2023-09-04T16:45:00'),
      quality: 'Poor',
    },
  },
  {
    id: '5',
    productData: {
      product_name: 'Yogurt',
      image_url: 'https://example.com/yogurt.jpg',
      ingredients: ['Milk', 'Live Cultures', 'Fruit Puree'],
      timestamp: new Date('2023-09-05T11:20:00'),
      quality: 'Excellent',
    },
  },
];

const HistoryScreen = () => {
    const router = useRouter();
  
    const navigateToResult = (productData: any) => {
      const encodedProductData = Buffer.from(JSON.stringify(productData)).toString('base64');
      router.push({
        pathname: '/ResultScreen',
        params: { productData: encodedProductData }
      });
    };
  
    const navigateToProfile = () => {
      router.push('/profile');
    };
  
    const getQualityColor = (quality: string) => {
      switch (quality) {
        case 'Excellent':
          return '#4CAF50';
        case 'Good':
          return '#8BC34A';
        case 'Fair':
          return '#FFA000';
        case 'Poor':
          return '#D32F2F';
        default:
          return '#757575';
      }
    };
  
    const renderHistoryItem = ({ item }) => {
      const { product_name, image_url, ingredients, timestamp, quality } = item.productData;
  
      return (
        <TouchableOpacity
          style={styles.historyCard}
          onPress={() => navigateToResult(item.productData)}
        >
          <Image
            source={{ uri: image_url }}
            style={styles.productImage}
            defaultSource={require('../assets/images/logo.png')}
          />
          <View style={styles.cardContent}>
            <Text style={styles.productName} numberOfLines={1}>{product_name}</Text>
            <Text style={styles.dateText}>{timestamp.toLocaleDateString()}</Text>
            {ingredients && ingredients.length > 0 && (
              <Text style={styles.ingredientsText} numberOfLines={1}>
                Ingredients: {ingredients.slice(0, 3).join(', ')}{ingredients.length > 3 ? '...' : ''}
              </Text>
            )}
            <Text style={[styles.qualityText, { color: getQualityColor(quality) }]}>
              Quality: {quality}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#2C2C2C" />
        </TouchableOpacity>
      );
    };
  
    return (
      <>
        <StatusBar barStyle="light-content" />
        <LinearGradient
          colors={['#2F5651', '#478B4E']}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <TouchableOpacity onPress={navigateToProfile} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.title}>Scan History</Text>
            </View>
            <FlatList
              data={mockHistoryItems}
              renderItem={renderHistoryItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContainer}
            />
          </SafeAreaView>
        </LinearGradient>
      </>
    );
  };
  
  const styles = StyleSheet.create({
    gradient: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 10,
    },
    backButton: {
      padding: 8,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginLeft: 16,
    },
    listContainer: {
      paddingHorizontal: 16,
    },
    historyCard: {
      flexDirection: 'row',
      backgroundColor: '#FFFFFF',
      borderRadius: 10,
      marginBottom: 12,
      padding: 12,
      alignItems: 'center',
    },
    productImage: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginRight: 12,
    },
    cardContent: {
      flex: 1,
    },
    productName: {
      fontSize: 16,
      fontWeight: '600',
      color: '#2C2C2C',
      marginBottom: 4,
    },
    dateText: {
      fontSize: 12,
      color: '#757575',
      marginBottom: 4,
    },
    ingredientsText: {
      fontSize: 12,
      color: '#2C2C2C',
      marginBottom: 4,
    },
    qualityText: {
      fontSize: 12,
      fontWeight: '600',
    },
  });
  
  export default HistoryScreen;