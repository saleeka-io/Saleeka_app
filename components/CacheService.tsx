import firestore from '@react-native-firebase/firestore';

// Define the structure for Product Data
interface ProductData {
  product_name: string;
  ingredients: string[] | null;  // Allow null for ingredients
  additives: { code: string; name: string }[] | null;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  image_url: string | null;
  rating: Rating;  // Rating now includes only necessary fields, no animation
}

// Define the structure for Rating, animation removed
interface Rating {
  rating: string;
  color: string;
  fillPercentage: number;
}

// CacheService class to handle cache read/write operations
export class CacheService {
  
  // Method to fetch a product from cache by barcode
  static async getFromCache(barcode: string): Promise<ProductData | null> {
    try {
      // Query the cache collection by barcode
      const cacheDoc = await firestore().collection('cache').where('barcode', '==', barcode).get();
      
      // Check if cache document exists
      if (!cacheDoc.empty) {
        const cachedData = cacheDoc.docs[0].data();

        // Return the product data with rating (but no animation)
        return {
          product_name: cachedData.productName,
          calories: cachedData.calories || null,
          protein: cachedData.protein || null,
          carbs: cachedData.carbs || null,
          fat: cachedData.fat || null,
          image_url: cachedData.productImageUrl || null,
          ingredients: cachedData.ingredients ? cachedData.ingredients.split(', ') : null,
          additives: cachedData.additives || null,
          rating: cachedData.rating,  // Pass rating without animation
        };
      }

      return null;  // Return null if no document found
    } catch (error) {
      console.error('Error fetching from cache:', error);
      return null;  // Return null on error
    }
  }

  // Method to add a product to the cache by barcode
  static async addToCache(barcode: string, productData: ProductData): Promise<void> {
    try {
      // Add product data to cache
      await firestore().collection('cache').add({
        barcode: barcode,
        productName: productData.product_name,
        calories: productData.calories,
        protein: productData.protein,
        carbs: productData.carbs,
        fat: productData.fat,
        productImageUrl: productData.image_url,
        ingredients: productData.ingredients?.join(', ') || '',  // Join ingredients array
        additives: productData.additives || null,  // Ensure additives are handled
        rating: {
          rating: productData.rating.rating,
          color: productData.rating.color,
          fillPercentage: productData.rating.fillPercentage,
          // No animation stored
        },
      });
    } catch (error) {
      console.error('Error adding to cache:', error);
    }
  }
}
