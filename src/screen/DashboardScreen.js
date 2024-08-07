import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, Modal, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Menu, MenuItem } from 'react-native-material-menu';
import config from './config'; // Import the configuration
import tw from 'twrnc';
import LinearGradient from 'react-native-linear-gradient';

const defaultProfileImage = require('../assets/default-profile.png'); // Adjust the path as needed
const appLogo = require('../assets/Logo_Dimple.png'); // Add your app logo here

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState('Semua');
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const menuRef = useRef(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);

  const showMenu = () => {
    if (menuRef.current) {
      menuRef.current.show();
    }
  };

  const hideMenu = () => {
    if (menuRef.current) {
      menuRef.current.hide();
    }
  };

  const handleProfile = () => {
    hideMenu();
    navigation.navigate('Profile');
  };

  const handleListUser = () => {
    hideMenu();
    navigation.navigate('ListUser');
  };

  const handleManageDivisions = () => {
    hideMenu();
    navigation.navigate('ManageDivisions');
  };

  const handleCreate = () => {
    navigation.navigate('CreateDelegasi');
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchUserProfile().then(() => fetchEvents());
      filterEvents()
    }, [])
  );

  useEffect(() => {
    filterEvents();
  }, [selectedTab, events]);

  const fetchUserProfile = async () => {
    try {
      const asyncEmail = await AsyncStorage.getItem('email');
      const asyncRole = await AsyncStorage.getItem('role');
      const response = await axios.get(`${config.apiBaseUrl}/user/profile`, {
        params: { email: asyncEmail }
      });
      const { profileImageUrl } = response.data.data;
      setProfileImageUrl(profileImageUrl ? { uri: `${config.apiBaseUrl}${profileImageUrl}` } : defaultProfileImage);
      setRole(asyncRole);
      setEmail(asyncEmail);
    } catch (error) {
      console.error('Error fetching profile image URL:', error);
      setProfileImageUrl(defaultProfileImage); // Fallback to default image on error
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${config.apiBaseUrl}/event`);
      const userEvents = role === 'delegation_handler'
        ? response.data.data.filter(event => event.toPerson.email === email || event.userId === email)
        : response.data.data;
      setEvents(userEvents);
      setFilteredEvents(userEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const confirmDelete = (eventId) => {
    setSelectedEventId(eventId);
    setModalVisible(true);
  };

  const CustomConfirmDeleteModal = ({ visible, onConfirm, onCancel }) => {
    return (
      <Modal
        transparent={true}
        visible={visible}
        animationType="fade"
        onRequestClose={onCancel}
      >
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white rounded-lg p-5 w-4/5`}>
            <Text style={tw`text-lg font-bold text-center mb-3`}>Hapus Delegasi</Text>
            <Text style={tw`text-center text-base text-gray-700 mb-5`}>Apakah kamu yakin ingin menghapus delegasi ini?</Text>
            <View style={tw`flex-row justify-around`}>
              <TouchableOpacity
                onPress={onCancel}
                style={tw`bg-gray-300 px-4 py-2 rounded-full`}
              >
                <Text style={tw`text-gray-700 text-base`}>Tidak</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onConfirm}
                style={tw`bg-red-600 px-4 py-2 rounded-full`}
              >
                <Text style={tw`text-white text-base`}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const handleDelete = async() => {
    try {
      await axios.delete(`${config.apiBaseUrl}/event/${selectedEventId}`);
      setModalVisible(false);
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleEventPress = (id) => {
    navigation.navigate('DetailDelegasi', { eventId: id });
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (query.trim() === '') {
      filterEvents(events);
      return;
    }

    try {
      const response = await axios.get(`${config.apiBaseUrl}/event/search/${query}`);
      const filtered = role === 'delegation_handler'
        ? response.data.data.filter(event => event.toPerson.email === email || event.userId === email)
        : response.data.data;
      setFilteredEvents(filtered);
    } catch (error) {
      console.error('Error searching events:', error);
    }
  };

  const filterEvents = (eventsToFilter = events) => {
    let filtered;
    switch (selectedTab) {
      case 'Verifikasi':
        filtered = eventsToFilter.filter(event =>
          ['Perlu Verifikasi', 'Verifikasi Ditolak'].includes(event.status) &&
          (role !== 'delegation_handler' || event.toPerson.email === email || event.userId === email)
        );
        break;
      case 'Proses':
        filtered = eventsToFilter.filter(event =>
          ['Perlu Konfirmasi Penerima', 'Penerima Setuju', 'Penerima Menolak', 'Ditolak'].includes(event.status) &&
          (role !== 'delegation_handler' || event.toPerson.email === email || event.userId === email)
        );
        break;
      case 'Selesai':
        filtered = eventsToFilter.filter(event =>
          event.status === 'Disetujui' &&
          (role !== 'delegation_handler' || event.toPerson.email === email || event.userId === email)
        );
        break;
      case 'Semua':
      default:
        filtered = eventsToFilter.filter(event =>
          role !== 'delegation_handler' || event.toPerson.email === email || event.userId === email
        );
        break;
    }
    setFilteredEvents(filtered);
  };

  const divisionColors = {
    Supervisor: '#424F5E',
    'Senior Officer': '#7954F6',
    'Technical Officer': '#FFAE00',
    'Field Officer': '#11D69F',
    'Community Provider': '#663F70',
    Internship: '#EE3862',
  };

  const statusStyles = {
    'Perlu Verifikasi': { color: '#F7DF1E' },
    'Verifikasi Ditolak': { gradient: ['#F7DF1E', '#CF0A0A'] },
    'Disetujui': { color: '#0ACF83' },
    'Ditolak': { color: '#CF0A0A' },
    'Perlu Konfirmasi Penerima': { gradient: ['#2298F2', '#F7DF1E'] },
    'Penerima Setuju': { color: '#2298F2' },
    'Penerima Menolak': { gradient: ['#2298F2', '#CF0A0A'] },
  };

  const renderEventItem = ({ item }) => (
    <TouchableOpacity onPress={() => handleEventPress(item.id)} style={tw`flex-row items-center py-3 border-b border-gray-300`}>
      <Image
        source={item.toPerson.profileImageUrl ? { uri: `${config.apiBaseUrl}${item.toPerson.profileImageUrl}` } : defaultProfileImage}
        style={tw`w-15 h-15 rounded-full mr-4`}
      />
      <View style={tw`flex-1`}>
        <View style={tw`flex-row justify-between items-center w-full mb-2`}>
          <View style={tw`flex-row items-center`}>
            <Text style={tw`text-black font-bold mr-2`}>{item.toPerson.username}</Text>
            <Text style={[tw`text-sm`,{ color: divisionColors[item.toDivision.name] || '#000' }]}>{item.toDivision.name}</Text>
          </View>
        </View>
        <View style={tw`flex-row justify-between items-center w-full mb-1`}>
          <View style={tw`flex-row items-center`}>
            <Text style={tw`text-base font-bold text-black`}>{item.title}</Text>
          </View>
          <Text style={tw`text-xs text-gray-500`}>{new Date(item.date).toLocaleDateString()}</Text>
        </View>
        <Text style={tw`text-sm text-gray-400 mb-2`} numberOfLines={3} ellipsizeMode="tail">{item.description}</Text>
        <View style={tw`flex-row justify-between items-center w-full`}>
          {statusStyles[item.status]?.gradient ? (
            <LinearGradient
              colors={statusStyles[item.status].gradient}
              start={{ x: 0, y: 0 }} // Horizontal start point
              end={{ x: 1, y: 0 }} // Horizontal end point
              style={tw`flex-row items-center px-2 py-1 rounded-full`}
            >
              <Text style={tw`text-white text-xs`}>{item.status}</Text>
            </LinearGradient>
          ) : (
            <View style={[tw`flex-row items-center px-2 py-1 rounded-full`, { backgroundColor: statusStyles[item.status]?.color }]}>
              <Text style={tw`text-white text-xs`}>{item.status}</Text>
            </View>
          )}
          <TouchableOpacity onPress={() => confirmDelete(item.id)} style={tw`p-2`}>
            <Icon name="trash" size={20} color="#FF3B30" />
          </TouchableOpacity>

          <CustomConfirmDeleteModal
            visible={isModalVisible}
            onConfirm={handleDelete}
            onCancel={() => setModalVisible(false)}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={tw`flex-1 bg-white p-5`}>
      <View style={tw`flex-row justify-between items-center mb-5`}>
        <Image source={appLogo} style={tw`w-25 h-12 resize-contain`} />
        {role === 'admin' ? (
          <Menu
            ref={menuRef}
            anchor={
              <TouchableOpacity onPress={showMenu} style={tw`p-2`}>
                <Icon name="cog" size={24} color="black" />
              </TouchableOpacity>
            }
            onRequestClose={hideMenu}
          >
            <MenuItem onPress={handleListUser}>Daftar Pengguna</MenuItem>
            <MenuItem onPress={handleManageDivisions}>Daftar Divisi</MenuItem>
            <MenuItem onPress={handleProfile}>Profil</MenuItem>
          </Menu>
        ) : (
          <TouchableOpacity onPress={handleProfile}>
            <Image source={profileImageUrl} style={tw`w-15 h-15 rounded-full mr-3`} />
          </TouchableOpacity>
        )}
      </View>

      <View style={tw`flex-row items-center self-center bg-[#002D7A] rounded-full mb-5 h-12 w-full px-5`}>
        <Icon name="search" size={25} color="white" style={tw`mr-2`} />
        <TextInput
          placeholder="Cari..."
          placeholderTextColor="white"
          style={tw`flex-1 text-lg text-white`}
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <View style={tw`h-12`}>
        <ScrollView horizontal style={tw`border-b-2`} showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[tw`px-5 py-2`, selectedTab === 'Semua' && tw`border-b-2 border-[#002D7A]`]}
            onPress={() => setSelectedTab('Semua')}
          >
            <Text style={[tw`text-lg font-bold`, selectedTab === 'Semua' && tw`text-black`]}>Semua</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[tw`px-5 py-2`, selectedTab === 'Verifikasi' && tw`border-b-2 border-[#002D7A]`]}
            onPress={() => setSelectedTab('Verifikasi')}
          >
            <Text style={[tw`text-lg font-bold`, selectedTab === 'Verifikasi' && tw`text-black`]}>Verifikasi</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[tw`px-5 py-2`, selectedTab === 'Proses' && tw`border-b-2 border-[#002D7A]`]}
            onPress={() => setSelectedTab('Proses')}
          >
            <Text style={[tw`text-lg font-bold`, selectedTab === 'Proses' && tw`text-black`]}>Proses</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[tw`px-5 py-2`, selectedTab === 'Selesai' && tw`border-b-2 border-[#002D7A]`]}
            onPress={() => setSelectedTab('Selesai')}
          >
            <Text style={[tw`text-lg font-bold`, selectedTab === 'Selesai' && tw`text-black`]}>Selesai</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderEventItem}
      />

      {role === 'admin' && (
        <TouchableOpacity style={tw`flex-row items-center absolute right-5 bottom-5 justify-center bg-[#002D7A] py-3 rounded-full w-32`} onPress={handleCreate}>
          <Icon name="pencil" size={20} color="#fff" />
          <Text style={tw`text-white text-lg ml-2 font-bold`}>Tambah</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default DashboardScreen;
