import React, { useEffect } from 'react';
import { Text, View, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import tw from 'twrnc';

const SplashScreen = () => {
  const navigation = useNavigation();
  const { getItem: getOnboardingStatus } = useAsyncStorage('@onboarded');

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const onboarded = await getOnboardingStatus();
      
      if (onboarded !== null) {
        navigation.replace('Login');
      } else {
        navigation.replace('Onboarding');
      }
    };

    const timer = setTimeout(checkOnboardingStatus, 4000);

    return () => clearTimeout(timer);
  }, [navigation, getOnboardingStatus]);

  return (
    <View style={tw`flex-1 bg-white justify-center items-center`}>
      <Image source={require('../assets/Logo_Dimple.png')} style={tw`w-50 h-50`} resizeMode="contain" />
      <View style={tw`absolute bottom-10 items-center`}>
        <Text style={tw`text-sm text-gray-700 mb-2`}>created by</Text>
        <Image source={require('../assets/logopkbi_KEPRI.png')} style={tw`w-30 h-15`} resizeMode="contain" />
      </View>
    </View>
  );
}

export default SplashScreen;
