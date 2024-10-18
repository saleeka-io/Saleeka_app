module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'], // Use this preset
    plugins: [
      'react-native-reanimated/plugin', // Keep this if you're using react-native-reanimated
      // 'expo-router/babel' removed as it's deprecated
    ],
  };
};
