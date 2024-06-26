import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {

  const navigation = useNavigation();

  const handleLogin = () => {
    navigation.navigate('Dashboard');
  };

  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  return (
    <View style={styles.container}>
      <View style={styles.footer}>
        <Text style={styles.title}>Sign In</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} placeholder="Enter Your Email" />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Your Password"
            secureTextEntry={true}
          />
        </View>
        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text> 
        </TouchableOpacity>
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={handleSignup}>
            <Text style={styles.registerLink}> Register</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.header}>
        <Image source={require('../assets/signin.png')} style={styles.image} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    position: 'relative', // Ensure the container is positioned relatively
  },
  header: {
    position: 'absolute', // Position the header absolutely
    top: 0, // Adjust top position if needed
    left: 0, // Adjust left position if needed
    right: 0, // Adjust right position if needed
    bottom: 510, // Adjust bottom position if needed
    zIndex: -1, // Ensure it is behind the footer
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flex: 1,
    backgroundColor: '#002D7A',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingVertical: 20,
    paddingHorizontal: 30,
    marginTop: 280,
  },
  image: {
    width: 350,
    height: 350,
    resizeMode: 'contain',
  },
  title: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 50,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 5,
    marginLeft: 15,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 50,
    padding: 15,
    fontSize: 16,
  },
  forgotPassword: {
    color: '#fff',
    textAlign: 'right',
    marginBottom: 40,
    fontWeight: 'bold',
    marginRight: 5,
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 50,
    paddingVertical: 12,
    width: '50%',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'black',
    fontSize: 22,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    color: '#fff',
    fontSize: 16,
  },
  registerLink: {
    color: '#2298F2',
    fontSize: 16,
  },
});

export default LoginScreen;
