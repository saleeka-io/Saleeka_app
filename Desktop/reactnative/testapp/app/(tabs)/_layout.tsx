import React from 'react';
import { StyleSheet, Image, Text, View, ImageSourcePropType } from 'react-native';
import { Tabs } from 'expo-router';
import icons from '../../constants/icons';

interface TabIconProps {
  icon: ImageSourcePropType;
  color: string;
  focused: boolean;
  name: string;
}

const TabIcon: React.FC<TabIconProps> = ({ icon, color, focused, name }) => (
  <View className="items-center justify-center gap-2">
    <Image
      source={icon}
      resizeMode="contain"
      className="w-6 h-6"
      style={{ tintColor: focused ? color : undefined }}
    />
    <Text className={`${focused ? 'font-semibold' : 'font-pregular'} test-xs`}>
      {name}
    </Text>
  </View>
);

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#232533',
          height: 100,
        },
      }}
    >
      <Tabs.Screen
        name="scan"
        options={{
          title: "Scan",
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon={icons.barcode}
              color={color}
              name="Scan"
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
              icon={icons.profile}
              color={color}
              name="Profile"
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;

const styles = StyleSheet.create({});
