import React from 'react';
import { StyleSheet, Text, View, Image, ImageSourcePropType } from 'react-native';
import { Tabs, Link } from 'expo-router';
import icons from '../../constants/icons';

// Define an interface for the props
interface TabIconProps {
  icon: ImageSourcePropType;
  color: string;
  focused: boolean;
  name: string;
}

const TabIcon: React.FC<TabIconProps> = ({ icon, color, focused, name }) => {
  return (
    <View className = "items-center justify-center gap-2">
      <Image
        source={icon}
        resizeMode = "contain"
        className = "w-6 h-6"
        style={{ tintColor: focused ? color : undefined }}
        
      />
      <Text className = {`${focused ? 'font-semibold' : 'font-pregular'} test-xs`}>
        {name}
      </Text>
    </View>
  );
};

const TabsLayout = () => {
  return(
    <>
<Tabs
  screenOptions={{
    tabBarShowLabel: false,
    tabBarStyle: {
      backgroundColor: '#FFFFFFFF',
      borderTopWidth: 1,
      borderTopColor : '#232533',
      height:70,

    }

  }}
  >
  <Tabs.Screen
  name = "scan"
  options = {{
    title: "Home",
    headerShown: false,
    tabBarIcon: ({color, focused}) => (
      <TabIcon
      icon = {icons.barcode}
      color = {color}
      name = "Scan"
      focused = {focused}
      />
    )
  }}
  />
  {/* <Tabs.Screen
  name = "history"
  options = {{
    title: "History",
    headerShown: false,
    tabBarIcon: ({color, focused}) => (
      <TabIcon
      icon = {icons.barcode}
      color = {color}
      name = "History"
      focused = {focused}
      />
    )
  }}
  /> */}
  <Tabs.Screen
  name = "profile"
  options = {{
    title: "Profile",
    headerShown: false,
    tabBarIcon: ({color, focused}) => (
      <TabIcon
      icon = {icons.profile}
      color = {color}
      name = "Profile"
      focused = {focused}
      />
    )
  }}
  />
</Tabs>
</>
  );
};

export default TabsLayout;

const styles = StyleSheet.create({});
