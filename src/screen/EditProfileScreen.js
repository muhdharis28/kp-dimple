import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Modal } from 'react-native';
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
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');

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

  const uploadProfileImage = async () => {
    if (profileImage && !profileImage.uri.startsWith('http')) { // Only upload if a new image was selected
      const asyncEmail = await AsyncStorage.getItem('email');
      const formData = new FormData();
      formData.append('profileImage', {
        uri: profileImage.uri,
        type: profileImage.type || 'image/jpeg',
        name: profileImage.fileName || 'profile.jpg',
      });
      formData.append('email', asyncEmail); // Include email in the form data

      try {
        const response = await axios.put(`${config.apiBaseUrl}/user/profile/image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data.profileImageUrl; // Assuming the API returns the updated profile image URL
      } catch (error) {
        console.error('Error uploading profile image:', error);
        throw new Error('Gagal mengunggah foto profil');
      }
    }
    return null;
  };

  const handleSavePress = async () => {
    if (newPassword && newPassword !== confirmPassword) {
        setModalTitle('Gagal');
        setModalMessage('Kata sandi baru dan kata sandi konfirmasi tidak sama!');
        setModalVisible(true);
        return;
    }
    try {
        await uploadProfileImage();
        const asyncEmail = await AsyncStorage.getItem('email');
        
        // Send both the old email and new email along with other profile data to the server
        await axios.put(`${config.apiBaseUrl}/user/profile`, {
            username,
            email: asyncEmail, // Old email
            newEmail: email, // New email
            description: profileDescription,
        });

        // Update the email in AsyncStorage if the profile update was successful
        await AsyncStorage.setItem('email', email);

        if (newPassword) {
            await axios.put(`${config.apiBaseUrl}/user/password`, {
                email: email, // Use the new email here as well
                newPassword,
                confirmPassword,
            });
            await AsyncStorage.setItem('password', newPassword);
        }

        setModalTitle('Berhasil');
        setModalMessage('Profil berhasil diubah');
        setModalVisible(true);
    } catch (error) {
        console.error('Error updating profile:', error);
        setModalTitle('Gagal');
        setModalMessage(error.response?.data?.message || error.message || 'Terjadi kesalahan');
        setModalVisible(true);
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

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const source = { uri: response.assets[0].uri };
        setProfileImage(source);
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
              placeholder="masukan email..."
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
              placeholder="masukan username..."
            />
          </View>
        </View>
        <View style={tw`border-b border-gray-300 py-2`}>
          <Text style={tw`text-gray-500`}>Kata sandi saat ini</Text>
          <View style={tw`flex-row items-center`}>
            <Icon name="lock-closed-outline" size={20} color="gray" style={tw`mr-3`} />
            <TextInput
              style={tw`text-black flex-1`}
              secureTextEntry={!isPasswordVisible}
              value={password}
              onChangeText={setPassword}
              editable={false}
              placeholder="masukan kata sandi saat ini..."
            />
            <TouchableOpacity onPress={togglePasswordVisibility}>
              <Icon name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} size={20} color="gray" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={tw`border-b border-gray-300 py-2`}>
          <Text style={tw`text-gray-500`}>Kata sandi baru</Text>
          <View style={tw`flex-row items-center`}>
            <Icon name="lock-closed-outline" size={20} color="gray" style={tw`mr-3`} />
            <TextInput
              style={tw`text-black flex-1`}
              secureTextEntry={!isNewPasswordVisible}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="masukan kata sandi baru..."
            />
            <TouchableOpacity onPress={toggleNewPasswordVisibility}>
              <Icon name={isNewPasswordVisible ? "eye-off-outline" : "eye-outline"} size={20} color="gray" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={tw`border-b border-gray-300 py-2`}>
          <Text style={tw`text-gray-500`}>Konfirmasi kata sandi</Text>
          <View style={tw`flex-row items-center`}>
            <Icon name="lock-closed-outline" size={20} color="gray" style={tw`mr-3`} />
            <TextInput
              style={tw`text-black flex-1`}
              secureTextEntry={!isConfirmPasswordVisible}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="masukan kata sandi konfirmasi..."
            />
            <TouchableOpacity onPress={toggleConfirmPasswordVisibility}>
              <Icon name={isConfirmPasswordVisible ? "eye-off-outline" : "eye-outline"} size={20} color="gray" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Modal
        transparent={true}
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white p-6 rounded-lg w-4/5 items-center`}>
            <View style={tw`mb-4`}>
              {modalTitle === 'Berhasil' ? (
                <Icon name="checkmark-circle-outline" size={60} color="green" />
              ) : (
                <Icon name="alert-circle-outline" size={60} color="red" />
              )}
            </View>
            <Text style={tw`text-lg font-bold mb-3 text-center`}>{modalTitle}</Text>
            <Text style={tw`text-base mb-5 text-center text-gray-600`}>{modalMessage}</Text>
            <TouchableOpacity
              style={tw`bg-blue-600 p-3 rounded-lg w-full`}
              onPress={() => {
                setModalVisible(false);
                if (modalTitle === 'Berhasil') {
                  navigation.goBack();
                }
              }}
            >
              <Text style={tw`text-white text-base text-center`}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default EditProfileScreen;
