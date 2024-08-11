import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import config from './config'; // Import the configuration
import tw from 'twrnc';

const defaultProfileImage = require('../assets/default-profile.png'); // Adjust the path as needed

const ListUser = () => {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${config.apiBaseUrl}/user/list`);
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleUserPress = (userId) => {
    navigation.navigate('UserDetail', { userId });
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const divisionColors = {
    Supervisor: '#424F5E',
    'Senior Officer': '#7954F6',
    'Technical Officer': '#FFAE00',
    'Field Officer': '#11D69F',
    'Community Provider': '#663F70',
    Internship: '#EE3862',
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleUserPress(item.id)}>
      <View style={tw`flex-row items-center py-3 border-b border-gray-200`}>
        <Image source={item.profileImageUrl ? { uri: `${config.apiBaseUrl}${item.profileImageUrl}` } : defaultProfileImage} style={tw`w-15 h-15 rounded-full mr-4`} />
        <View style={tw`flex-1`}>
          <Text style={tw`text-lg font-bold text-black`}>{item.username}</Text>
          <Text style={tw`text-sm text-black`}>{item.email}</Text>
          {item.division && <Text style={[tw`text-sm`,{ color: divisionColors[item.division.name] || '#000' }]}>{item.division.name}</Text>}
          
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={tw`flex-1 bg-white`}>
      <View style={tw`flex-row items-center px-4 py-7`}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')} style={tw`mr-4`}>
          <Icon name="arrow-back" size={24} color="#002D7A" />
        </TouchableOpacity>
        <Text style={tw`text-xl font-bold text-[#002D7A]`}>Daftar Pengguna</Text>
      </View>
      <View style={tw`flex-row items-center bg-[#002D7A] rounded-full mx-4 mb-4`}>
        <Icon name="search" size={20} color="white" style={tw`ml-4`} />
        <TextInput
          placeholder="Cari..."
          placeholderTextColor="white"
          style={tw`flex-1 text-sm text-white ml-2`}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderUserItem}
        style={tw`mx-4`}
      />
    </View>
  );
};

export default ListUser;
