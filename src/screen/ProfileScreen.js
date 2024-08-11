import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, TextInput, ActivityIndicator, Modal } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import config from './config'; // Import the configuration
import tw from 'twrnc';
import LinearGradient from 'react-native-linear-gradient';

const defaultProfileImage = require('../assets/default-profile.png'); // Adjust the path as needed

const ProfileScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [division, setDivision] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [profileDescription, setProfileDescription] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  useEffect(() => {
    if (isFocused) {
      fetchUserProfile();
    }
  }, [isFocused]);

  const fetchUserProfile = async () => {
    try {
      const asyncEmail = await AsyncStorage.getItem('email');
      const asyncPassword = await AsyncStorage.getItem('password');
      const response = await axios.get(`${config.apiBaseUrl}/user/profile`, {
        params: { email: asyncEmail }
      });
      const { username, email, description, profileImageUrl, division, role } = response.data.data;
      setUsername(username);
      setEmail(email);
      setDivision(division);
      setPassword(asyncPassword);
      setProfileDescription(description);
      setRole(role);
      setProfileImage(profileImageUrl ? { uri: `${config.apiBaseUrl}${profileImageUrl}` } : defaultProfileImage);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleEditPress = () => {
    navigation.navigate('EditProfile');
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const roleMapping = {
    admin: 'Admin',
    delegation_verificator: 'Verifikator',
    delegation_handler: 'Penerima',
  };

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!email) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <Text style={tw`text-lg text-red-500`}>Failed to load profile data.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={tw`flex-1 bg-white`}>
      <LinearGradient 
          colors={['#002D7A', '#0052D4']}
          style={tw`-mx-8 rounded-b-[200px] pb-16 pt-8 items-center relative`}
      >
          <View style={tw`flex-row justify-between items-center px-13 w-full`}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Icon name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={tw`text-white text-xl font-bold`}>Profil</Text>
              <TouchableOpacity onPress={handleEditPress}>
                  <Icon name="create" size={24} color="#fff" />
              </TouchableOpacity>
          </View>
          <View style={tw`items-center mt-10`}>
              <Image
                  source={profileImage}
                  style={tw`w-24 h-24 rounded-full mb-3`}
              />
              <Text style={tw`text-white text-2xl font-bold mb-4`}>{username}</Text>
              <Text style={tw`text-white text-center text-sm px-4 mx-10`}>{profileDescription}</Text>
          </View>
      </LinearGradient>
      <View style={tw`p-5`}>
        <Text style={tw`text-lg text-[#002D7A] font-bold mb-5 ml-5`}>Informasi</Text>
        <View style={tw`flex-row items-center mb-2 mx-5`}>
          <Icon name="mail-outline" size={20} color="gray" style={tw`mr-3`} />
          <Text style={tw`text-sm text-gray-500`}>Email</Text>
          <Text style={tw`text-sm text-black ml-auto`}>{email}</Text>
        </View>
        <View style={tw`border-b border-gray-300 mb-5 mx-5`}/>
        <View style={tw`flex-row items-center mb-2 mx-5`}>
          <Icon name="briefcase-outline" size={20} color="gray" style={tw`mr-3`} />
          <Text style={tw`text-sm text-gray-500`}>Divisi</Text>
          <Text style={tw`text-sm text-black ml-auto text-[#FFA500]`}>{division}</Text>
        </View>
        <View style={tw`border-b border-gray-300 mb-5 mx-5`}/>
        <View style={tw`flex-row items-center mb-2 mx-5`}>
          <Icon name="person-outline" size={20} color="gray" style={tw`mr-3`} />
          <Text style={tw`text-sm text-gray-500`}>Peran</Text>
          <Text style={tw`text-sm text-black ml-auto`}>
            {roleMapping[role] || 'Unknown Role'}
          </Text>
        </View>
        <View style={tw`border-b border-gray-300 mb-5 mx-5`}/>
        <View style={tw`flex-row items-center mb-2 mx-5`}>
          <Icon name="lock-closed-outline" size={20} color="gray" style={tw`mr-3`} />
          <Text style={tw`text-sm text-gray-500`}>Kata Sandi</Text>
          <TextInput
            style={tw`text-sm text-black ml-auto`}
            secureTextEntry={!isPasswordVisible}
            value={password}
            editable={false}
          />
          <TouchableOpacity onPress={togglePasswordVisibility}>
            <Icon name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} size={20} color="gray" />
          </TouchableOpacity>
        </View>
        <View style={tw`border-b border-gray-300 mb-5 mx-5`}/>
        <TouchableOpacity style={tw`flex-row items-center mt-5 p-3`} onPress={() => setLogoutModalVisible(true)}>
          <Icon name="log-out-outline" size={24} color="red" />
          <Text style={tw`text-red-500 font-bold ml-2`}>Keluar</Text>
        </TouchableOpacity>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={logoutModalVisible}
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white w-4/5 p-5 rounded-3xl`}>
            <Text style={tw`text-lg text-center font-bold mb-4 text-black`}>Keluar</Text>
            <Text style={tw`text-center mb-4 text-black mx-5`}>Apakah anda ingin keluar dari akun anda?</Text>
            <View style={tw`flex-row justify-between`}>
              <TouchableOpacity onPress={() => setLogoutModalVisible(false)} style={tw`bg-gray-200 p-3 rounded-full px-8 mx-3`}>
                <Text style={tw`text-gray-500 font-bold`}>Tidak</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout} style={tw`bg-red-600 p-3 rounded-full px-8 mx-3`}>
                <Text style={tw`text-white font-bold`}>Keluar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default ProfileScreen;
