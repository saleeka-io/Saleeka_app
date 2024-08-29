import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import icons from '../../constants/icons';
import TabIcon from '../../components/TabIcon'; // Ensure correct import path

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar
      }}
    >
      <Tabs.Screen
        name="scan"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon={icons.barcode}
              color={color}
              name="Scan"
              focused={focused}
            />
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon={icons.profile}
              color={color}
              name="Profile"
              focused={focused}
            />
          )
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
      {/* <Tabs.Screen
        name="ComingSoon"
        options={{
          headerShown: false,
          href: null,
        }}
      />
      <Tabs.Screen
        name="Donation"
        options={{
          headerShown: false,
          href: null,
        }}
      />
      <Tabs.Screen
        name="ContactUs"
        options={{
          headerShown: false,
          href: null,
        }}
      /> */}
    </Tabs>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#232533',
    height: 100
  }
});

export default TabsLayout;
