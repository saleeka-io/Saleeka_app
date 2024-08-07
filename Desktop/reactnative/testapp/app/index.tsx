import { View, Text } from 'react-native';
import React from 'react';
import { Link } from 'expo-router';

const Index = () => {
  return (
    <View className="flex-1 items-center justify-center bg-blue-100 p-4">
      <Text className="text-xl font-semibold">
        Index Page Styled with NativeWind
      </Text>
      <Link href ="/scan" className="mt-4 text-blue-600">
        <Text className="text-blue-600">
          Go to Home
        </Text>
      </Link>
    </View>
  );
};

export default Index;
