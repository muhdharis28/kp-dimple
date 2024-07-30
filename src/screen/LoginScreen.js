import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from './AuthProvider';
import AsyncStorage, { useAsyncStorage } from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { ALERT_TYPE, Dialog, AlertNotificationRoot } from 'react-native-alert-notification';
import config from './config'; // Import the configuration
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/FontAwesome';

const LoginScreen = () => {
  const navigation = useNavigation();
  const { setIsLoggedIn } = React.useContext(AuthContext);
  const { setItem } = useAsyncStorage('@token');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const validateEmail = (email) => {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    return reg.test(email);
  };

  const handleLogin = async (value) => {
    let valid = true;

    if (!validateEmail(value.email)) {
      setEmailError('Please enter a valid email address');
      valid = false;
    } else {
      setEmailError('');
    }

    if (value.password === '') {
      setPasswordError('Password cannot be empty');
      valid = false;
    } else {
      setPasswordError('');
    }

    if (!valid) return;

    try {
      const response = await axios.post(`${config.apiBaseUrl}/user/login`, {
        email: value.email,
        password: value.password
      });

      await AsyncStorage.setItem('password', value.password);
      await AsyncStorage.setItem('email', value.email);
      await AsyncStorage.setItem('username', response.data.data.username);
      await AsyncStorage.setItem('role', response.data.data.role);  // Save the role
      await AsyncStorage.setItem('userId', JSON.stringify(response.data.data.id));  // Save the role

      await setItem('DUMMY TOKEN');
      setIsLoggedIn(true);
      navigation.replace('Dashboard');
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
        console.log(error.request);
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
    <View style={tw`flex-1`}>
      <ScrollView contentContainerStyle={tw`flex-grow`}>
        <View style={tw`flex-1 bg-white`}>
          <View style={tw`justify-center items-center mt-0`}>
            <AlertNotificationRoot style={tw`absolute top-0 left-0 right-0`} />
            <Image source={require('../assets/signin.png')} style={tw`w-64 h-64`} resizeMode="contain" />
          </View>
          <View style={tw`flex-1 bg-[#002D7A] rounded-t-3xl p-5 mt-0`}>
            <Text style={tw`text-white text-3xl font-bold mb-5 mt-3 ml-3`}>Masuk</Text>
            <View style={tw`mb-5`}>
              <Text style={tw`ml-3 text-white text-base mt-3 mb-2`}>Email</Text>
              <View style={tw`flex-row items-center bg-white rounded-full px-3 mx-3`}>
                <TextInput 
                  style={tw`flex-1 text-base p-3`}
                  placeholder='Masukan email'
                  onChangeText={(text) => setEmail(text)}
                  value={email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View> 
              {emailError ? <Text style={tw`ml-3 text-red-500`}>{emailError}</Text> : null}
            </View>
            <View style={tw`mb-5`}>
              <Text style={tw`ml-3 text-white text-base mb-2`}>Kata Sandi</Text>
              <View style={tw`flex-row items-center bg-white rounded-full px-3 mx-3`}>
                <TextInput
                  style={tw`flex-1 text-base p-3`}
                  placeholder='Masukan kata sandi'
                  secureTextEntry={!isPasswordVisible}
                  onChangeText={(text) => setPassword(text)}
                  value={password}
                />
                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                  <Icon name={isPasswordVisible ? 'eye-slash' : 'eye'} size={24} color='grey' />
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={tw`ml-3 text-red-500`}>{passwordError}</Text> : null}
            </View>
            
            <View style={tw`items-center justify-center`}>
              <TouchableOpacity style={tw`bg-white rounded-full py-3 px-20 mt-5`} onPress={async () => await handleLogin({ email, password })}>
                <Text style={tw`text-black text-lg font-bold`}>Masuk</Text>
              </TouchableOpacity>   
            </View> 
            
            <View style={tw`flex-row justify-center mt-5`}>
              <Text style={tw`text-white text-base`}>Tidak punya akun?</Text>
              <TouchableOpacity onPress={handleSignup}>
                <Text style={tw`text-[#2298F2] text-base ml-1`}> Daftar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default LoginScreen;
