import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TabOneScreen from './TabOneScreen';
import TabTwoScreen from './two';
import CameraScreen from '../../components/CameraScreen';

const BottomTab = createBottomTabNavigator();

function BottomTabNavigator() {
  return (
    <BottomTab.Navigator>
      <BottomTab.Screen name="TabOne" component={TabOneScreen} />
      <BottomTab.Screen name="TabTwo" component={TabTwoScreen} />
      <BottomTab.Screen name="Camera" component={CameraScreen} />
    </BottomTab.Navigator>
  );
}

export default BottomTabNavigator;
