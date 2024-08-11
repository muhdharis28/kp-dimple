import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { ALERT_TYPE, Dialog, AlertNotificationRoot } from 'react-native-alert-notification';
import { Picker } from '@react-native-picker/picker';
import config from './config'; // Import the configuration
import tw from 'twrnc';

const SignupScreen = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [division, setDivision] = useState('');
  const [divisions, setDivisions] = useState([]);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [divisionError, setDivisionError] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  useEffect(() => {
    const fetchDivisions = async () => {
      try {
        const response = await axios.get(`${config.apiBaseUrl}/division`);
        setDivisions(response.data.data);
      } catch (error) {
        console.error('Error fetching divisions:', error);
      }
    };

    fetchDivisions();
  }, []);

  const validateEmail = (email) => {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    return reg.test(email);
  };

  const handleOnFinish = async (value) => {
    let valid = true;

    if (value.username === '') {
      setUsernameError('Username cannot be empty');
      valid = false;
    } else {
      setUsernameError('');
    }

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

    if (value.password !== value.confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      valid = false;
    } else {
      setConfirmPasswordError('');
    }

    if (value.division === '') {
      setDivisionError('Please select a division');
      valid = false;
    } else {
      setDivisionError('');
    }

    if (!valid) return;

    try {
      const response = await axios.post(`${config.apiBaseUrl}/user/register`, {
        username: value.username,
        email: value.email,
        password: value.password,
        divisionName: value.division
      });
      console.log('sdsadsadas', value.division)
      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Success',
        textBody: response.data.metadata,
        button: 'Close',
        onHide: () => {
          navigation.replace('Login');
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
    <View style={tw`flex-1`}>
      <ScrollView contentContainerStyle={tw`flex-grow`}>
        <View style={tw`flex-1 bg-white`}>
          <View style={tw`justify-center items-center mt-0`}>
            <Icon 
              style={tw`absolute top-4 left-4 z-10`} 
              name="chevron-circle-left" 
              size={55} 
              color="#002D7A" 
              onPress={() => navigation.goBack()} 
            />
            <Image source={require('../assets/Signup.png')} style={tw`w-64 h-64`} resizeMode="contain" />
          </View>
          <View style={tw`flex-1 bg-[#002D7A] rounded-t-3xl p-5 mt-0`}>
            <AlertNotificationRoot style={tw`absolute top-0 left-0 right-0`} />
            <Text style={tw`text-white text-3xl font-bold mb-5 mt-3 ml-3`}>Daftar</Text>
            <View style={tw`mb-5`}>
              <Text style={tw`ml-3 text-white text-base mt-3 mb-2`}>Username</Text>
              <View style={tw`flex-row items-center bg-white rounded-full px-3 mx-3`}>
                <TextInput 
                  style={tw`flex-1 text-base p-3`}
                  placeholder="Masukkan username"
                  onChangeText={(text) => setUsername(text)}
                  value={username}
                />
              </View>
              {usernameError ? <Text style={tw`ml-3 text-red-500`}>{usernameError}</Text> : null}
            </View>
            <View style={tw`mb-5`}>
              <Text style={tw`ml-3 text-white text-base mt-3 mb-2`}>Email</Text>
              <View style={tw`flex-row items-center bg-white rounded-full px-3 mx-3`}>
                <TextInput 
                  style={tw`flex-1 text-base p-3`}
                  placeholder="Masukkan email"
                  onChangeText={(text) => setEmail(text)}
                  value={email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              {emailError ? <Text style={tw`ml-3 text-red-500`}>{emailError}</Text> : null}
            </View>
            <View style={tw`mb-5`}>
              <Text style={tw`ml-3 text-white text-base mt-3 mb-2`}>Kata Sandi</Text>
              <View style={tw`flex-row items-center bg-white rounded-full px-3 mx-3`}>
                <TextInput
                  style={tw`flex-1 text-base p-3`}
                  secureTextEntry={!isPasswordVisible}
                  placeholder="Masukkan kata sandi"
                  onChangeText={(text) => setPassword(text)}
                  value={password}
                />
                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                  <Icon name={isPasswordVisible ? 'eye-slash' : 'eye'} size={24} color="grey" />
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={tw`ml-3 text-red-500`}>{passwordError}</Text> : null}
            </View>
            <View style={tw`mb-5`}>
              <Text style={tw`ml-3 text-white text-base mt-3 mb-2`}>Konfirmasi Kata Sandi</Text>
              <View style={tw`flex-row items-center bg-white rounded-full px-3 mx-3`}>
                <TextInput
                  style={tw`flex-1 text-base p-3`}
                  secureTextEntry={!isConfirmPasswordVisible}
                  placeholder="Konfirmasi kata sandi"
                  onChangeText={(text) => setConfirmPassword(text)}
                  value={confirmPassword}
                />
                <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
                  <Icon name={isConfirmPasswordVisible ? 'eye-slash' : 'eye'} size={24} color="grey" />
                </TouchableOpacity>
              </View>
              {confirmPasswordError ? <Text style={tw`ml-3 text-red-500`}>{confirmPasswordError}</Text> : null}
            </View>
            <View style={tw`mb-5`}>
              <Text style={tw`ml-3 text-white text-base mt-3 mb-2`}>Divisi</Text>
              <View style={tw`flex-row items-center bg-white rounded-full px-3 mx-3`}>
                <Picker
                  selectedValue={division}
                  onValueChange={(itemValue) => setDivision(itemValue)}
                  style={tw`flex-1 text-base p-3`}
                >
                  <Picker.Item label="Pilih divisi" value="" />
                  {divisions.map((div) => (
                    <Picker.Item key={div.id} label={div.name} value={div.name} />
                  ))}
                </Picker>
              </View>
              {divisionError ? <Text style={tw`ml-3 text-red-500`}>{divisionError}</Text> : null}
            </View>
            <View style={tw`items-center justify-center`}>
              <TouchableOpacity style={tw`bg-white rounded-full py-3 px-20 mt-5`} onPress={async () => await handleOnFinish({ username, email, password, confirmPassword, division })}>
                <Text style={tw`text-black text-lg font-bold`}>Daftar</Text>
              </TouchableOpacity>   
            </View> 
            
            <View style={tw`flex-row justify-center mt-5`}>
              <Text style={tw`text-white text-base`}>Sudah punya akun?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={tw`text-[#2298F2] text-base ml-1`}> Masuk</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default SignupScreen;
