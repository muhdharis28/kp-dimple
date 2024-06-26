import React, { useEffect } from 'react';
import { Text, StyleSheet, View, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.navigate('Onboarding');
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.splashScreen}>
      <View style={styles.content}>
        <Image source={require('../assets/Logo_Dimple.png')} style={styles.logo} />
        <Text style={styles.Text}>Create By</Text>
        <View style={styles.footer}>
          <Image source={require('../assets/logopkbi_KEPRI.png')} style={styles.footerLogo} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  splashScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 280,
    height: 140,
    marginTop: 270,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  Text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'grey',
    textAlign: 'center',
    marginTop: 220,
    marginLeft: 20,
  },
  footerLogo: {
    width: 270,
    height: 60,
    marginTop: 20,
  },
});

export default SplashScreen;
