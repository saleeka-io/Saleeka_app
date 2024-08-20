import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';

// Define an interface for the component props
interface CustomButtonProps {
  title: string;
  handlePress: () => void;
  containerStyles?: ViewStyle;
  textStyles?: TextStyle;
  isLoading: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  handlePress,
  containerStyles = {},
  textStyles = {},
  isLoading,
}) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[styles.button, containerStyles, isLoading ? styles.disabled : null]}
      disabled={isLoading}
    >
      <Text style={[styles.text, textStyles]}>
        {title}
      </Text>

      {isLoading && (
        <ActivityIndicator
          animating={isLoading}
          color="#FFFFFF"
          size="small"
          style={styles.activityIndicator}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FFFFFFFF', // Assuming bg-secondary is a shade of blue
    borderRadius: 10,
    minHeight: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width:'80%',
    marginTop: 5,
  },
  text: {
    color: '#00', 
    fontWeight: '600', // Assuming font-psemibold is semibold
    fontSize: 20,
    fontFamily: 'Poppins-Regular'
  },
  activityIndicator: {
    marginLeft: 8,
  },
  disabled: {
    opacity: 0.5
  }
});

export default CustomButton;
