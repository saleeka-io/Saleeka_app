import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Tabs } from 'expo-router';
import icons from '../../constants/icons';
import TabIcon from '../../components/TabIcon'; // Ensure correct import path

const { height: screenHeight } = Dimensions.get('window');

const getTabBarHeight = () => {
  if (screenHeight > 800) {
    // For larger screens like iPhone Pro Max
    return 85;
  } else if (screenHeight > 700) {
    // For medium screens like iPhone 11/12/13/14
    return 75;
  } else {
    // For smaller screens like iPhone SE
    return 65;
  }
};

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: [styles.tabBar, { height: getTabBarHeight() }],
      }}
    >
      <Tabs.Screen
        name="HistoryScreen"
        options={{
          title: "History",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon={icons.history}
              color={color}
              name={''}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon={icons.barcode}
              color={color}
              name={''}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon={icons.settings}
              color={color}
              name={''}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="ResultScreen"
        options={{
          headerShown: false,
          href: null,
        }}
      />
      <Tabs.Screen
        name="ProductNotFound"
        options={{
          headerShown: false,
          href: null,
        }}
      />
    </Tabs>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#232533',
    // height will be dynamically set using getTabBarHeight function
  }
});

export default TabsLayout;