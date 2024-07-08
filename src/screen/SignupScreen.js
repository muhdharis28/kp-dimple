import React, { useState } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, ToastAndroid } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { ALERT_TYPE, Dialog, AlertNotificationRoot, Toast } from 'react-native-alert-notification';

const SignupScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const validateEmail = (email) => {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    return reg.test(email);
  };

  const handleOnFinish = async (value) => {
    if (value.username === '') {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Warning',
        textBody: 'Username cannot be empty',
      })
      return;
    }

    if (!validateEmail(value.email)) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Warning',
        textBody: 'Please enter a valid email address',
      })
      return;
    }

    if (value.password === '') {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Warning',
        textBody: 'Password cannot be empty',
      })
      return;
    }

    if (value.password !== value.confirmPassword) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Warning',
        textBody: 'Passwords do not match',
      })
      return;
    }

    try {
      const response = await axios.post('http://192.168.18.57:3800/user/register', {
        username: value.username,
        email: value.email,
        password: value.password
      });

      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Success',
        textBody: response.data.metadata,
        button: 'Close',
        onHide: () => {
          navigation.navigate('Login');
        }
      });

    } catch (error) {
      if (error.response) {
        const status = error.response.status;
  
        switch (status) {
          case 400:
            Dialog.show({
              type: ALERT_TYPE.WARNING,
              title: 'Warning',
              textBody: error.response.data.message || 'User already exists',
              button: 'Close'
            });
            break;
  
          case 500:
            Dialog.show({
              type: ALERT_TYPE.DANGER,
              title: 'Error',
              textBody: error.response.data.message || 'Internal server error',
              button: 'Close'
            });
            break;
  
          default:
            Dialog.show({
              type: ALERT_TYPE.DANGER,
              title: 'Error',
              textBody: 'An unexpected error occurred',
              button: 'Close'
            });
        }
      } else if (error.request) {
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Error',
          textBody: 'No response from server',
          button: 'Close'
        });
      } else {
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: 'Error',
          textBody: 'An unexpected error occurred',
          button: 'Close'
        });
      }

    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
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
        <AlertNotificationRoot/>
          <Text style={styles.title}>Sign Up</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Enter Your Name" 
              onChangeText={(text) => setUsername(text)}
              value={username}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Enter Your Email"
              onChangeText={(text) => setEmail(text)}
              value={email}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Your Password"
              secureTextEntry={true}
              onChangeText={(text) => setPassword(text)}
              value={password}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm Your Password"
              secureTextEntry={true}
              onChangeText={(text) => setConfirmPassword(text)}
              value={confirmPassword}
            />
          </View>
          
          <TouchableOpacity style={styles.button} onPress={async () => await handleOnFinish({ username, email, password, confirmPassword })}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>    
          
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.registerLink}> Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  icon: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  footer: {
    flex: 1,
    backgroundColor: '#002D7A',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingVertical: 20,
    paddingHorizontal: 30,
    marginTop: 30,
  },
  image: {
    width: 200, // Set the width to medium size
    height: 200, // Set the height to medium size
    resizeMode: 'contain',
  },
  title: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 30,
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

export default SignupScreen;
