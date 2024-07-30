import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from './config'; // Import the configuration
import tw from 'twrnc';

const defaultProfileImage = require('../assets/default-profile.png'); // Adjust the path as needed

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [profileDescription, setProfileDescription] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [division, setDivision] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const asyncEmail = await AsyncStorage.getItem('email');
      const asyncPassword = await AsyncStorage.getItem('password');
      const response = await axios.get(`${config.apiBaseUrl}/user/profile`, {
        params: { email: asyncEmail }
      });
      const { username, email, description, profileImageUrl, division } = response.data.data;
      setUsername(username);
      setEmail(email);
      setPassword(asyncPassword);
      setProfileDescription(description);
      setDivision(division);
      setProfileImage(profileImageUrl ? { uri: `${config.apiBaseUrl}${profileImageUrl}` } : null);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSavePress = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      alert('New password and confirm password do not match');
      return;
    }
    try {
      await axios.put(`${config.apiBaseUrl}/user/profile`, {
        username,
        email,
        description: profileDescription,
      });
      if (newPassword) {
        const asyncEmail = await AsyncStorage.getItem('email');
        await axios.put(`${config.apiBaseUrl}/user/password`, {
          email: asyncEmail,
          newPassword,
          confirmPassword,
        });
        await AsyncStorage.setItem('password', newPassword);
      }

      alert('Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const toggleNewPasswordVisibility = () => {
    setIsNewPasswordVisible(!isNewPasswordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
  };

  const pickImage = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
    };

    launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const source = { uri: response.assets[0].uri };
        setProfileImage(source);

        const asyncEmail = await AsyncStorage.getItem('email');

        if (!asyncEmail) {
          console.error('Error: Email not found in AsyncStorage');
          return;
        }

        // Upload image to the server
        const formData = new FormData();
        formData.append('profileImage', {
          uri: response.assets[0].uri,
          type: response.assets[0].type,
          name: response.assets[0].fileName,
        });
        formData.append('email', asyncEmail); // Include email in the form data

        try {
          await axios.put(`${config.apiBaseUrl}/user/profile/image`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
          console.log('Profile image uploaded successfully');
        } catch (error) {
          console.error('Error uploading profile image:', error);
        }
      }
    });
  };

  return (
    <ScrollView style={tw`flex-1 bg-white`}>
      <View style={tw`flex-row justify-between items-center px-5 py-3 bg-white border-b border-gray-300`}>
        <TouchableOpacity onPress={navigation.goBack}>
          <Icon name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={tw`text-lg font-bold`}>Edit Profil</Text>
        <TouchableOpacity onPress={handleSavePress}>
          <Icon name="checkmark" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View style={tw`items-center py-5`}>
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity onPress={pickImage}>
            <Image source={profileImage ? profileImage : defaultProfileImage} style={tw`w-24 h-24 rounded-full`} />
          </TouchableOpacity>
          <Text style={tw`text-blue-500 ml-4`}>Unggah Foto Profil +</Text>
        </View>
        <TextInput
          style={tw`text-center mt-2 text-black border-b border-gray-300 mx-10`}
          value={profileDescription}
          onChangeText={setProfileDescription}
          placeholder="Tanpa keberanian, tak ada kemenangan. Tanpa perjuangan, tak ada happy ending."
          multiline
        />
      </View>
      <View style={tw`px-5 mx-5`}>
        <View style={tw`border-b border-gray-300 py-2`}>
          <Text style={tw`text-gray-500`}>Email</Text>
          <View style={tw`flex-row items-center`}>
            <Icon name="mail-outline" size={20} color="gray" style={tw`mr-3`} />
            <TextInput
              style={tw`text-black flex-1`}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter Email"
            />
          </View>
        </View>
        <View style={tw`border-b border-gray-300 py-2`}>
          <Text style={tw`text-gray-500`}>Username</Text>
          <View style={tw`flex-row items-center`}>
            <Icon name="person-outline" size={20} color="gray" style={tw`mr-3`} />
            <TextInput
              style={tw`text-black flex-1`}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter Username"
            />
          </View>
        </View>
        <View style={tw`border-b border-gray-300 py-2`}>
          <Text style={tw`text-gray-500`}>Current Password</Text>
          <View style={tw`flex-row items-center`}>
            <Icon name="lock-closed-outline" size={20} color="gray" style={tw`mr-3`} />
            <TextInput
              style={tw`text-black flex-1`}
              secureTextEntry={!isPasswordVisible}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter Current Password"
            />
            <TouchableOpacity onPress={togglePasswordVisibility}>
              <Icon name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} size={20} color="gray" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={tw`border-b border-gray-300 py-2`}>
          <Text style={tw`text-gray-500`}>New Password</Text>
          <View style={tw`flex-row items-center`}>
            <Icon name="lock-closed-outline" size={20} color="gray" style={tw`mr-3`} />
            <TextInput
              style={tw`text-black flex-1`}
              secureTextEntry={!isNewPasswordVisible}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter New Password"
            />
            <TouchableOpacity onPress={toggleNewPasswordVisibility}>
              <Icon name={isNewPasswordVisible ? "eye-off-outline" : "eye-outline"} size={20} color="gray" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={tw`border-b border-gray-300 py-2`}>
          <Text style={tw`text-gray-500`}>Confirm New Password</Text>
          <View style={tw`flex-row items-center`}>
            <Icon name="lock-closed-outline" size={20} color="gray" style={tw`mr-3`} />
            <TextInput
              style={tw`text-black flex-1`}
              secureTextEntry={!isConfirmPasswordVisible}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm New Password"
            />
            <TouchableOpacity onPress={toggleConfirmPasswordVisibility}>
              <Icon name={isConfirmPasswordVisible ? "eye-off-outline" : "eye-outline"} size={20} color="gray" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default EditProfileScreen;
