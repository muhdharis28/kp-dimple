import React from 'react';
import { Text, View, Image, Dimensions, TouchableOpacity } from 'react-native';
import Page1Image from '../assets/onboard.png';  // Correct path
import { useNavigation } from '@react-navigation/native';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import tw from 'twrnc';

const { width, height } = Dimensions.get('window');

const Onboarding = () => {
  const navigation = useNavigation();
  const { setItem: setOnboarded } = useAsyncStorage('@onboarded');

  const handleOnFinish = async () => {
    await setOnboarded('true'); // Mark onboarding as complete
    navigation.replace('Login'); // Navigate to the dashboard screen
  };

  return (
    <View style={tw`flex-1 bg-white items-center justify-center p-5`}>
      <View style={tw`w-full px-6`}>
        <Text style={tw`text-[32.6px] font-bold text-black mb-3`}>
          Atur Kesibukanmu <Text style={tw`text-[#002D7A]`}>Agar Terorganisir</Text>
        </Text>
        <Text style={tw`text-xs text-gray-500`}>
          Siap hadapi hari esok, kelola pendelegasian dan tugas pentingmu dengan mudah
        </Text>
      </View>
      <Image source={Page1Image} style={{ width: width * 0.8, height: height * 0.4, marginTop: 20, marginBottom: 60 }} resizeMode="contain" />
      <TouchableOpacity style={tw`bg-[#002D7A] rounded-full py-3 px-20 mt-5`} onPress={handleOnFinish}>
        <Text style={tw`text-white text-lg font-bold`}>Mulai</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Onboarding;
