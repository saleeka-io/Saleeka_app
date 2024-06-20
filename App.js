import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import BottomTabNavigator from './app/(tabs)'; // Adjust the path if necessary

export default function App() {
  return (
    <NavigationContainer>
      <BottomTabNavigator />
    </NavigationContainer>
  );
}
