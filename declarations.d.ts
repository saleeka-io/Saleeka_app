import 'react-native';

declare module 'react-native' {
  interface ViewProps {
    className?: string;
  }
  interface TextProps {
    className?: string;
  }
  interface ImageProps {
    className?: string;
  }
  interface FormFieldProps {
    title: string;
    value: string;
    handleChangeText: (value: string) => void;
    otherStyles?: string;
    keyboardType?: string; // optional prop, include if necessary
  }

  
  // Add other components as needed
  // Define a type for the TabIcon props

}
