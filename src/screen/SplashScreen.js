import React, { useEffect } from 'react';
import { Text, StyleSheet, View, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';

const SplashScreen = () => {
  const navigation = useNavigation();
  const { getItem: getOnboardingStatus } = useAsyncStorage('@onboarded');

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const onboarded = await getOnboardingStatus();
      
      if (onboarded !== null) {
        navigation.navigate('Login');
      } else {
        navigation.navigate('Onboarding');
      }
    };

    const timer = setTimeout(checkOnboardingStatus, 4000);

    return () => clearTimeout(timer);
  }, [navigation, getOnboardingStatus]);

  return (
    <View style={styles.splashScreen}>
      <View style={styles.content}>
        <Image source={require('../assets/Logo_Dimple.png')} style={styles.logo} />
      </View>
      <View style={styles.footer}>
        <Text style={styles.text}>created by</Text>
        <Image source={require('../assets/logopkbi_KEPRI.png')} style={styles.footerLogo} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  splashScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  footer: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
  },
  text: {
    fontSize: 10,
    color: '#333',
    marginBottom: -35,
  },
  footerLogo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
});

export default SplashScreen;
