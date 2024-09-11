import React from 'react';
import { StyleSheet, Text, View, Image, ImageSourcePropType } from 'react-native';

interface TabIconProps {
  icon: ImageSourcePropType;
  color: string;
  focused: boolean;
  name: string;
}

const TabIcon: React.FC<TabIconProps> = ({ icon, color, focused, name }) => {
  return (
    <View style={styles.tabIconContainer}>
      <Image
        source={icon}
        resizeMode="contain"
        style={[styles.icon, { tintColor: focused ? color : undefined }]}
      />
      <Text style={focused ? styles.textFocused : styles.textRegular}>
        {name}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 24,  // Equivalent to Tailwind w-6 (assuming 1 unit = 4px)
    height: 24, // Equivalent to Tailwind h-6
  },
  textFocused: {
    fontSize: 12, // Equivalent to Tailwind text-xs
    fontWeight: 'bold', // Equivalent to Tailwind font-semibold
  },
  textRegular: {
    fontSize: 12, // Equivalent to Tailwind text-xs
    fontWeight: '400', // Default font weight
  }
});

export default TabIcon;
