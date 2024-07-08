import React from 'react';
import { Text, StyleSheet, View, Image, Dimensions, TouchableOpacity } from 'react-native';
import Page1Image from '../assets/onboard.png';  // Correct path
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from './AuthProvider';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const Onboarding = () => {
  const navigation = useNavigation();
  const { setItem: setOnboarded } = useAsyncStorage('@onboarded');

  const handleOnFinish = async () => {
    await setOnboarded('true'); // Mark onboarding as complete
    navigation.navigate('Login'); // Navigate to the dashboard screen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>
        Keep your busy life <Text style={styles.highlight}>organized</Text>
      </Text>
      <Text style={styles.description}>Own tomorrow, stay on top your most important messages & events with ease.</Text>
      <Image source={Page1Image} style={styles.image} />
      <TouchableOpacity style={styles.button} onPress={handleOnFinish}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    width: width * 0.8,
    height: height * 0.4,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 46,
    fontWeight: 'bold',
    color: '#002D7A',  // Warna biru tua
    marginBottom: 10,
    marginRight: 125,
  },
  subtitle: {
    fontSize: 38,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
    textAlign: 'left',
  },
  highlight: {
    color: '#002D7A',  // Warna biru tua
  },
  description: {
    fontSize: 18,
    color: 'gray',
    textAlign: 'left',
    marginBottom: 20,
    marginRight: 12,
  },
  button: {
    backgroundColor: '#002D7A',  // Warna biru tua
    borderRadius: 50,
    paddingVertical: 15,
    paddingHorizontal: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
});

export default Onboarding;
