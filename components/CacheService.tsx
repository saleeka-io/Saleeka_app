import firestore from '@react-native-firebase/firestore';

interface ProductData {
    product_name: string;
    ingredients: string[] | null;  // Allow null for ingredients
    additives: { code: string; name: string }[]| null;
    calories: number | null;
    protein: number | null;
    carbs: number | null;
    fat: number | null;
    image_url: string | null;
}

export class CacheService {
  static async getFromCache(barcode: string): Promise<ProductData | null> {
    const cacheDoc = await firestore().collection('cache').where('barcode', '==', barcode).get();
    if (!cacheDoc.empty) {
      const cachedData = cacheDoc.docs[0].data();
      return {
        product_name: cachedData.productName,
        calories: cachedData.calories || null,
        protein: cachedData.protein || null,
        carbs: cachedData.carbs || null,
        fat: cachedData.fat || null,
        image_url: cachedData.productImageUrl || null,
        ingredients: cachedData.ingredients.split(', '),
        additives: cachedData.additives || null,
      };
    }
    return null;
  }

  static async addToCache(barcode: string, productData: ProductData): Promise<void> {
    await firestore().collection('cache').add({
      barcode: barcode,
      productName: productData.product_name,
      calories: productData.calories,
      protein: productData.protein,
      carbs: productData.carbs,
      fat: productData.fat,
      productImageUrl: productData.image_url,
      ingredients: productData.ingredients?.join(', ') || '',  // Handle null ingredients
      additives: productData.additives,
    });
  }
}