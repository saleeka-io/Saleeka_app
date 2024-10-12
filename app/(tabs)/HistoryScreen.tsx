// import React from 'react';
// import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
// import { useRouter } from 'expo-router';
// import { LinearGradient } from 'expo-linear-gradient';
// import { Ionicons } from '@expo/vector-icons';
// import { Buffer } from 'buffer';

// // Updated mockHistoryItems with quality ratings
// const mockHistoryItems = [
//   {
//     id: '1',
//     productData: {
//       product_name: 'Organic Milk',
//       image_url: 'https://example.com/milk.jpg',
//       ingredients: ['Milk', 'Vitamin D'],
//       timestamp: new Date('2023-09-01T10:00:00'),
//       quality: 'Excellent',
//     },
//   },
//   {
//     id: '2',
//     productData: {
//       product_name: 'Whole Grain Bread',
//       image_url: 'https://example.com/bread.jpg',
//       ingredients: ['Whole Wheat Flour', 'Water', 'Yeast', 'Salt'],
//       timestamp: new Date('2023-09-02T14:30:00'),
//       quality: 'Good',
//     },
//   },
//   {
//     id: '3',
//     productData: {
//       product_name: 'Apple Juice',
//       image_url: 'https://example.com/applejuice.jpg',
//       ingredients: ['Apple Juice Concentrate', 'Water', 'Vitamin C'],
//       timestamp: new Date('2023-09-03T09:15:00'),
//       quality: 'Fair',
//     },
//   },
//   {
//     id: '4',
//     productData: {
//       product_name: 'Chocolate Bar',
//       image_url: 'https://example.com/chocolate.jpg',
//       ingredients: ['Cocoa Mass', 'Sugar', 'Cocoa Butter', 'Vanilla Extract'],
//       timestamp: new Date('2023-09-04T16:45:00'),
//       quality: 'Poor',
//     },
//   },
//   {
//     id: '5',
//     productData: {
//       product_name: 'Yogurt',
//       image_url: 'https://example.com/yogurt.jpg',
//       ingredients: ['Milk', 'Live Cultures', 'Fruit Puree'],
//       timestamp: new Date('2023-09-05T11:20:00'),
//       quality: 'Excellent',
//     },
//   },
// ];

// const HistoryScreen = () => {
//     const router = useRouter();
  
//     const navigateToResult = (productData: any) => {
//       const encodedProductData = Buffer.from(JSON.stringify(productData)).toString('base64');
//       router.push({
//         pathname: '/ResultScreen',
//         params: { productData: encodedProductData }
//       });
//     };
  
//     const navigateToScan = () => {
//       router.push('/scan');
//     };
  
//     const getQualityColor = (quality: string) => {
//       switch (quality) {
//         case 'Excellent':
//           return '#4CAF50';
//         case 'Good':
//           return '#8BC34A';
//         case 'Fair':
//           return '#FFA000';
//         case 'Poor':
//           return '#D32F2F';
//         default:
//           return '#757575';
//       }
//     };
  
//     const renderHistoryItem = ({ item }) => {
//       const { product_name, image_url, ingredients, timestamp, quality } = item.productData;
  
//       return (
//         <TouchableOpacity
//           style={styles.historyCard}
//           onPress={() => navigateToResult(item.productData)}
//         >
//           <Image
//             source={{ uri: image_url }}
//             style={styles.productImage}
//             defaultSource={require('../../assets/images/HDlogo.png')}
//           />
//           <View style={styles.cardContent}>
//             <Text style={styles.productName} numberOfLines={1}>{product_name}</Text>
//             <Text style={styles.dateText}>{timestamp.toLocaleDateString()}</Text>
//             {ingredients && ingredients.length > 0 && (
//               <Text style={styles.ingredientsText} numberOfLines={1}>
//                 Ingredients: {ingredients.slice(0, 3).join(', ')}{ingredients.length > 3 ? '...' : ''}
//               </Text>
//             )}
//             <Text style={[styles.qualityText, { color: getQualityColor(quality) }]}>
//               Quality: {quality}
//             </Text>
//           </View>
//           <Ionicons name="chevron-forward" size={24} color="#2C2C2C" />
//         </TouchableOpacity>
//       );
//     };
  
//     return (
//       <>
//         <StatusBar barStyle="light-content" />
//         <LinearGradient
//           colors={['#2F5651', '#478B4E']}
//           style={styles.gradient}
//         >
//           <SafeAreaView style={styles.safeArea}>
//             <View style={styles.header}>
//               <TouchableOpacity onPress={navigateToScan} style={styles.backButton}>
//                 <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
//               </TouchableOpacity>
//               <Text style={styles.title}>Scan History</Text>
//             </View>
//             <FlatList
//               data={mockHistoryItems}
//               renderItem={renderHistoryItem}
//               keyExtractor={item => item.id}
//               contentContainerStyle={styles.listContainer}
//             />
//           </SafeAreaView>
//         </LinearGradient>
//       </>
//     );
//   };
  
//   const styles = StyleSheet.create({
//     gradient: {
//       flex: 1,
//     },
//     safeArea: {
//       flex: 1,
//     },
//     header: {
//       flexDirection: 'row',
//       alignItems: 'center',
//       paddingHorizontal: 16,
//       paddingTop: 20,
//       paddingBottom: 10,
//     },
//     backButton: {
//       padding: 8,
//     },
//     title: {
//       fontSize: 24,
//       fontWeight: 'bold',
//       color: '#FFFFFF',
//       marginLeft: 16,
//     },
//     listContainer: {
//       paddingHorizontal: 16,
//     },
//     historyCard: {
//       flexDirection: 'row',
//       backgroundColor: '#FFFFFF',
//       borderRadius: 10,
//       marginBottom: 12,
//       padding: 12,
//       alignItems: 'center',
//     },
//     productImage: {
//       width: 60,
//       height: 60,
//       borderRadius: 30,
//       marginRight: 12,
//     },
//     cardContent: {
//       flex: 1,
//     },
//     productName: {
//       fontSize: 16,
//       fontWeight: '600',
//       color: '#2C2C2C',
//       marginBottom: 4,
//     },
//     dateText: {
//       fontSize: 12,
//       color: '#757575',
//       marginBottom: 4,
//     },
//     ingredientsText: {
//       fontSize: 12,
//       color: '#2C2C2C',
//       marginBottom: 4,
//     },
//     qualityText: {
//       fontSize: 12,
//       fontWeight: '600',
//     },
//   });
  
//   export default HistoryScreen;
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CacheService } from '../../components/CacheService';
import firestore from '@react-native-firebase/firestore';
import { useUser } from '../../context/UserContext';
import { Buffer } from 'buffer';
import { RatingService, Rating } from '../../components/RatingService';
import CustomText from '@/components/CustomText';

interface ProductData {
  product_name: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  image_url: string | null;
  ingredients: string[] | null;
  additives: { code: string; name: string }[] | null;
  rating: Rating;
}
const HistoryScreen = () => {
  const router = useRouter();
  const { user } = useUser(); // Fetch the user from your AuthProvider
  const [loading, setLoading] = useState(true);
  const [historyItems, setHistoryItems] = useState<ProductData[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const flatListRef = useRef<FlatList>(null); // Add ref for FlatList
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;  // Ensure user is logged in
      try {
        setLoading(true);
        const scansSnapshot = await firestore().collection('scans')
        .where('userId', '==', user.uid)
        .orderBy('timestamp', 'desc')  // Order by timestamp in descending order
        .get();
        const barcodes = scansSnapshot.docs.map(doc => doc.data().barcode);

        console.log(`Total barcodes found for user ${user.uid}: ${barcodes.length}`);
        console.log(`Barcodes: ${barcodes.join(', ')}`);

        const uniqueBarcodes = Array.from(new Set(barcodes)); // Remove duplicates
        const productHistory: ProductData[] = [];

        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        const paginatedBarcodes = uniqueBarcodes.slice(startIndex, endIndex);

        for (const barcode of paginatedBarcodes) {
          const productData = await fetchProductData(barcode);
          if (productData) {
            productHistory.push(productData);
          }
        }

        if (paginatedBarcodes.length < itemsPerPage) {
          setHasMore(false); // No more items to load
        }

        setHistoryItems(prevItems => [...prevItems, ...productHistory]); // Append new items
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user, page]);

  

  const fetchProductData = async (barcode: string): Promise<ProductData | null> => {
    console.log(`Checking cache for barcode: ${barcode}`);

    // Try fetching from cache first
    const cachedProduct = await CacheService.getFromCache(barcode);
    if (cachedProduct) {
      console.log(`Product data for barcode ${barcode} found in cache.`);
      return cachedProduct;
    }

    // If not in cache, check products collection
    console.log(`Checking products collection for barcode: ${barcode}`);
    const productDoc = await firestore().collection('products').where('barcode', '==', barcode).get();
    if (!productDoc.empty) {
      const productData = productDoc.docs[0].data();
      console.log(`Product data for barcode ${barcode} found in Firestore 'products' collection.`);
      const ingredients = productData.ingredients ? productData.ingredients.split(', ') : [];
      const product: ProductData = {
        product_name: productData.productName,
        calories: productData.calories || null,
        protein: productData.protein || null,
        carbs: productData.carbs || null,
        fat: productData.fat || null,
        image_url: productData.productImageUrl || null,
        ingredients: ingredients,
        additives: productData.additives || [],
        rating: RatingService.calculateRating(ingredients),  // Corrected line
      };
      
      
      await CacheService.addToCache(barcode, product);  // Add to cache for future
      return product;
    }

    // Fetch from OpenFoodFacts if not in Firestore
    console.log(`Fetching product data from OpenFoodFacts API for barcode: ${barcode}`);
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = await response.json();
    if (data.status === 1) {  // Product found in OpenFoodFacts
      console.log(`Product data for barcode ${barcode} found in OpenFoodFacts API.`);
      const additives = data.product.additives_tags?.map((additive: string, index: number) => {
        const code = additive.replace('en:', '').toUpperCase();
        const name = data.product.additives_original_tags[index]?.split(' - ')[1] || code;
        return { code, name };
      }) || [];
      const product: ProductData = {
        product_name: data.product.product_name,
        calories: data.product.nutriments.energy_kcal || null,
        protein: data.product.nutriments.proteins || null,
        carbs: data.product.nutriments.carbohydrates || null,
        fat: data.product.nutriments.fat || null,
        image_url: data.product.image_url || null,
        ingredients: data.product.ingredients_text?.split(', ') || [],
        additives: additives,
        rating: RatingService.calculateRating(data.product.ingredients_text?.split(', ') || []), // Corrected line
      };
      
      await CacheService.addToCache(barcode, product);  // Add to cache
      return product;
    }

    console.log(`Product data for barcode ${barcode} not found anywhere.`);
    return null;  // If product not found anywhere
  };

  const navigateToResult = (productData: ProductData) => {
    const encodedProductData = Buffer.from(JSON.stringify(productData)).toString('base64');
    router.push({
      pathname: '/ResultScreen',
      params: { productData: encodedProductData },
    });
  };

  const renderHistoryItem = ({ item }: { item: ProductData }) => {
    const { product_name, image_url, ingredients } = item;
    const rating = RatingService.calculateRating(item.ingredients || []);
    return (
      <TouchableOpacity style={styles.historyCard} onPress={() => navigateToResult(item)}>
        <Image source={{ uri: image_url || undefined }} style={styles.productImage} />
        <View style={styles.cardContent}>
          <CustomText fontWeight="medium" style={styles.productName}>{product_name}</CustomText>
          <CustomText style={[styles.qualityText, { color: rating.color }]}>
            Quality: {rating.rating}
          </CustomText>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && historyItems.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#478B4E" />
        <Text style={styles.loadingText}>Loading scan history...</Text>
      </View>
    );
  }

  const scrollToTop = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
    }
  };

  const renderFooter = () => {
    if (loading && hasMore) {
      // Show loading indicator while more data is being fetched
      return (
        <View style={styles.footerContainer}>
          <ActivityIndicator size="small" />
        </View>
      );
    } else if (!hasMore && !loading) {
      // Show "Jump to Top" button when all data has been loaded
      return (
        <View style={styles.footerContainer}>
          <TouchableOpacity style={styles.jumpToTopButton} onPress={scrollToTop}>
            <CustomText style={styles.jumpToTopText}>Jump to Top</CustomText>
          </TouchableOpacity>
        </View>
      );
    } else {
      // No footer component while loading is false and hasMore is true
      return null;
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage((prevPage) => prevPage + 1); // Load next page
    }
  };

  if (loading && historyItems.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#478B4E" />
        <Text style={styles.loadingText}>Loading scan history...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#2F5651', '#478B4E']} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <CustomText style={styles.headerTitle}>History</CustomText>
        </View>
        <FlatList
          ref={flatListRef}
          data={historyItems}
          renderItem={renderHistoryItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
          onEndReached={loadMore} // Load more when reaching the bottom
          onEndReachedThreshold={0.5} // Adjust the threshold as needed
          ListFooterComponent={renderFooter}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContainer: { paddingHorizontal: 16 },
  historyCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  productImage: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
  cardContent: { flex: 1 },
  productName: { fontSize: 16, fontWeight: '600', color: '#2C2C2C' },
  qualityText: { fontSize: 14, fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#666' },
  footerContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  jumpToTopButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  jumpToTopText: {
    color: '#478B4E',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HistoryScreen;