import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

interface ProductData {
  product_name: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  image_url: string | null;
}

const ResultScreen = () => {
  const { productData } = useLocalSearchParams();

  if (!productData) {
    return <Text>Product data not found</Text>;
  }

  const product: ProductData = JSON.parse(decodeURIComponent(productData as string));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{product.product_name}</Text>
      <Image source={{ uri: product.image_url || '' }} style={styles.image} />
      <Text>Calories: {product.calories}</Text>
      <Text>Protein: {product.protein}g</Text>
      <Text>Carbs: {product.carbs}g</Text>
      <Text>Fat: {product.fat}g</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  image: {
    width: 150,
    height: 150,
    marginVertical: 20,
  },
});

export default ResultScreen;
