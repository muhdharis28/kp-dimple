import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

const SignupScreen = () => {
  const navigation = useNavigation();

  const handleOnFinish = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon 
          style={styles.icon} 
          name="chevron-circle-left" 
          size={55} 
          color="#002D7A" 
          onPress={() => navigation.goBack()} 
        />
        <Image source={require('../assets/Signup.png')} style={styles.image} />
      </View>
      <View style={styles.footer}>
        <Text style={styles.title}>Sign Up</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Username</Text>
          <TextInput style={styles.input} placeholder="Enter Your Name" />
        </View>

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

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm Your Password"
            secureTextEntry={true}
          />
        </View>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Already have an account?</Text>
          <TouchableOpacity onPress={handleOnFinish}>
            <Text style={styles.registerLink}> Sign In</Text>
          </TouchableOpacity>
        </View>
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
    bottom: 260, // Adjust bottom position if needed
    zIndex: -1, // Ensure it is behind the footer
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1, // Ensure the icon is above other elements
  },
  footer: {
    flex: 1,
    backgroundColor: '#002D7A',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginTop: 240,
  },
  image: {
    width: 500,
    height: 500,
    resizeMode: 'contain',
  },
  title: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 8,
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
    fontSize: 14,
    height: 55,
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
    marginTop: 20,
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

export default SignupScreen;
