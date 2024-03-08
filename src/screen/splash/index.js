import {View, Text, StyleSheet, Image} from 'react-native';
import React from 'react';

const SplashScreen = ({navigation}) => {
  setTimeout(() => {
    navigation.replace('Login');
  }, 3000);
  return (
    <View style={styles.container}>
      <Image
        source={
          require('../../assets/dimple.png')
        }
        style={styles.logo}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 700,
    height: 700,
    top:30,
    left:30
  },
  text: {
    color: 'white',
    fontSize: 30,
    marginTop: 20,
  },
});

export default SplashScreen;
