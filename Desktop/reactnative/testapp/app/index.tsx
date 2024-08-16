import React from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity ,StatusBar, Platform} from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
//import { StatusBar } from 'expo-status-bar';
import {images} from '../constants'
import { Dimensions } from 'react-native';
const { height, width } = Dimensions.get('window');
export default function App() {
  const paddingTop = Platform.OS === 'ios' ? 0 : StatusBar.currentHeight; // Adjust only for iOS, Android manages differently

//   return (
//     <View style={{ flex: 1, paddingTop }}>
//       <StatusBar translucent={true} backgroundColor="transparent" barStyle="light-content" />
//       <ScrollView className="flex-grow">
//       <View className=" w-full h-full items-center justify-center">
//           {/* Background Image */}
//           <Image
//             className="relative top-[-35] inset-0 w-full"
//             style={{ resizeMode: 'contain' }}
//             source={images.bgImage} // Assuming this is the scenic view
//           />

//           {/* Larger Green Circle */}
//           <Image
//           className="absolute top-[280px] left-0 right-0 mx-auto w-full"          style={{ resizeMode: 'contain' }}
//           source={images.bigCircle} // The large circle image
//         />

//         {/* Small Circle Image */}
//         <Image
//            className="absolute top-[330px] left-0 right-0 mx-auto w-full h-auto" 
//           style={{ resizeMode: 'contain' }}
//           source={images.smallCircle} // The small circle image
//         />

        
//            {/* Text and Links */}
//        {/* Text and Links */}
//        <View className="absolute top-[400px] w-full items-center">
//             <Text className="text-white text-3xl font-bold ">Welcome</Text>
//             <Text className="text-white text-sm font-bold text-center px-5 mt-2">
//               Your Guide To A Healthier Lifestyle, Way To A Better Living
//             </Text>
//             <TouchableOpacity onPress={() => console.log('Button Pressed')}>
//               <View className="bg-[#f1ede1] rounded-2xl px-6 py-4 mt-4 flex items-center justify-center">
//                 <Link href="/sign-up">
//                   <Text className="text-lg font-medium text-[#030303]">Sign Up Here</Text>
//                 </Link>
//               </View>
//             </TouchableOpacity>
//             <Text className="text-white text-sm font-medium mt-4">
//               Already have an account?{' '}
//               <Link href="/login">
//                 <Text className="underline">Login</Text>
//               </Link>
//             </Text>
//           </View>

//         </View>
//       </ScrollView>
//     </View>
//   );
// }
return (
  <View style={{ flex: 1 }}>
    <StatusBar translucent={true} backgroundColor="transparent" barStyle="light-content" />
    <ScrollView className="flex-grow">
      <View className="w-full h-full items-center justify-center">
        {/* Background Image */}
        <Image
          className="relative"
          style={{ top: -35, width: '100%', height: height * 0.6, resizeMode: 'contain' }}
          source={images.bgImage}
        />

        {/* Larger Green Circle */}
        <Image
          className="absolute"
          style={{ top: height * 0.38, left: 0, right: 0, width: '100%', height: height * 0.9, resizeMode: 'contain' }}
          source={images.bigCircle}
        />

        {/* Small Circle Image */}
        <Image
          className="absolute"
          style={{ top: height * 0.47, left: 0, right: 0, width: '100%', height: height * 0.75, resizeMode: 'contain' }}
          source={images.smallCircle}
        />

        {/* Text and Links */}
        <View className="absolute w-full items-center" style={{ top: height * 0.6 }}>
          <Text className="text-white text-3xl font-bold">Welcome</Text>
          <Text className="text-white text-sm font-bold text-center px-5 mt-2">
            Your Guide To A Healthier Lifestyle, Way To A Better Living
          </Text>
          <TouchableOpacity onPress={() => console.log('Button Pressed')}>
            <View className="bg-[#f1ede1] rounded-2xl px-6 py-4 mt-4 flex items-center justify-center">
              <Link href="/sign-up">
                <Text className="text-lg font-medium text-[#030303]">Sign Up Here</Text>
              </Link>
            </View>
          </TouchableOpacity>
          <Text className="text-white text-sm font-medium mt-4">
            Already have an account?{' '}
            <Link href="/login">
              <Text className="underline">Login</Text>
            </Link>
          </Text>
        </View>
      </View>
    </ScrollView>
  </View>
);
}