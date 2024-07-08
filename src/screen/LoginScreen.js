import React, { useState } from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, ToastAndroid } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from './AuthProvider';
import AsyncStorage, {
  useAsyncStorage,
} from '@react-native-async-storage/async-storage';
import axios from 'axios'
import { ALERT_TYPE, Dialog, AlertNotificationRoot, Toast } from 'react-native-alert-notification';

const LoginScreen = () => {
  const navigation = useNavigation();
  const { setIsLoggedIn } = React.useContext(AuthContext);
  const { setItem } = useAsyncStorage('@token');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const validateEmail = (email) => {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    return reg.test(email);
  };

  const handleLogin = async (value) => {
    if (!validateEmail(value.email)) {
        Toast.show({
            type: ALERT_TYPE.WARNING,
            title: 'Warning',
            textBody: 'Please enter a valid email address',
        });
        return;
    }

    if (value.password === '') {
        Toast.show({
            type: ALERT_TYPE.WARNING,
            title: 'Warning',
            textBody: 'Password cannot be empty',
        });
        return;
    }

    try {
        const response = await axios.post('http://192.168.18.57:3800/user/login', {
            email: value.email,
            password: value.password
        });

        await AsyncStorage.setItem('password', value.password);
        await AsyncStorage.setItem('email', value.email);
        await AsyncStorage.setItem('username', response.data.data.username);

        await setItem('DUMMY TOKEN');
        Dialog.show({
            type: ALERT_TYPE.SUCCESS,
            title: 'Success',
            textBody: response.data.message,
            button: 'Close',
            onHide: () => {
                setIsLoggedIn(true);
                navigation.navigate('Dashboard');
            }
        });
    } catch (error) {
        console.log('Error:', error);

        if (error.response) {
            const status = error.response.status;
            const message = error.response.data.message;

            switch (status) {
                case 400:
                    Dialog.show({
                        type: ALERT_TYPE.WARNING,
                        title: 'Warning',
                        textBody: message || 'Bad request',
                        button: 'Close'
                    });
                    break;

                case 401:
                    Dialog.show({
                        type: ALERT_TYPE.DANGER,
                        title: 'Unauthorized',
                        textBody: message || 'Unauthorized access',
                        button: 'Close'
                    });
                    break;

                case 404:
                    Dialog.show({
                        type: ALERT_TYPE.DANGER,
                        title: 'Not Found',
                        textBody: message || 'User not found',
                        button: 'Close'
                    });
                    break;

                case 500:
                    Dialog.show({
                        type: ALERT_TYPE.DANGER,
                        title: 'Error',
                        textBody: 'Internal server error',
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

  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Image source={require('../assets/signin.png')} style={styles.image} />
        </View>
        <View style={styles.footer}>
          <AlertNotificationRoot/>
          <Text style={styles.title}>Sign In</Text>
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
          
            <TouchableOpacity style={styles.button} onPress={async () => await handleLogin({ email, password })}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>  
          
          
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={handleSignup}>
              <Text style={styles.registerLink}> Register</Text>
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
    marginTop: 0,
  },
  footer: {
    flex: 1,
    backgroundColor: '#002D7A',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingVertical: 20,
    paddingHorizontal: 30,
    marginTop: 0,
  },
  image: {
    width: 250,
    height: 250,
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
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 50,
    paddingVertical: 10,
    width: '50%',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 15,
    marginTop: 40,
  },
  buttonText: {
    color: 'black',
    fontSize: 15,
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
