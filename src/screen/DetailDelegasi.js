import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, ScrollView, TextInput, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import tw from 'twrnc';
import config from './config';
import ResponseDialog from './ResponseDialog';

const defaultProfileImage = require('../assets/default-profile.png'); // Adjust the path as needed

const DetailDelegasi = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { eventId } = route.params;
  const [eventDetails, setEventDetails] = useState({});
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responseDialogVisible, setResponseDialogVisible] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionReasonDialogVisible, setRejectionReasonDialogVisible] = useState(false);
  const [divisions, setDivisions] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState('');
  const [persons, setPersons] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState('');
  const [changeHandlerDialogVisible, setChangeHandlerDialogVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');

  useEffect(() => {
    fetchEventDetails();
    fetchResponses();
    fetchUserId();
    fetchUserRole();
    fetchDivisions();
  }, []);

  const fetchUserRole = async () => {
    try {
      const role = await AsyncStorage.getItem('role');
      setUserRole(role);
    } catch (error) {
      console.error('Error fetching user role from AsyncStorage:', error);
    }
  };

  const handleAccept = async () => {
    try {
      await axios.post(`${config.apiBaseUrl}/event/accept/${eventId}`);
      setModalTitle('Berhasil');
      setModalMessage('Delegasi berhasil disetujui!');
      setModalVisible(true);
      fetchEventDetails(); // Refresh event details
    } catch (error) {
      console.error('Error accepting event:', error);
      setModalTitle('Gagal');
      setModalMessage(error);
      setModalVisible(true);
    }
  };

  const handleReject = async () => {
    setRejectionReasonDialogVisible(true);
  };

  const handleRejectionSubmit = async () => {
    try {
      await axios.post(`${config.apiBaseUrl}/event/Ditolak/${eventId}`, {
        reason: rejectionReason
      });
      setModalTitle('Berhasil');
      setModalMessage('Delegasi berhasil ditolak!');
      setModalVisible(true);
      fetchEventDetails(); // Refresh event details
      setRejectionReasonDialogVisible(false); // Close rejection reason dialog
    } catch (error) {
      console.error('Error rejecting event:', error);
      setModalTitle('Gagal');
      setModalMessage(error);
      setModalVisible(true);
    }
  };

  const handleFixRejection = async () => {
    try {
      await axios.post(`${config.apiBaseUrl}/event/fix/${eventId}`);
      setModalTitle('Berhasil');
      setModalMessage('Revisi berhasil diperbaiki!');
      setModalVisible(true);
      setRejectionReason('');
      fetchEventDetails(); // Refresh event details
    } catch (error) {
      console.error('Error fixing rejection:', error);
      setModalTitle('Gagal');
      setModalMessage(error);
      setModalVisible(true);
    }
  };

  const handleConfirmHandler = async () => {
    try {
      await axios.post(`${config.apiBaseUrl}/event/confirm/${eventId}`);
      setModalTitle('Berhasil');
      setModalMessage('Delegasi berhasil dikonfirmasi!');
      setModalVisible(true);
      fetchEventDetails(); // Refresh event details
    } catch (error) {
      console.error('Error confirming event:', error);
      setModalTitle('Gagal');
      setModalMessage(error);
      setModalVisible(true);
    }
  };

  const handleRejectHandler = async () => {
    try {
      await axios.post(`${config.apiBaseUrl}/event/reject-handler/${eventId}`);
      setModalTitle('Berhasil');
      setModalMessage('Delegasi berhasil ditolak!');
      setModalVisible(true);
      fetchEventDetails(); // Refresh event details
    } catch (error) {
      console.error('Error rejecting event:', error);
      setModalTitle('Gagal');
      setModalMessage(error);
      setModalVisible(true);
    }
  };

  const handleDisetujui = async () => {
    try {
      await axios.post(`${config.apiBaseUrl}/event/Disetujui/${eventId}`);
      setModalTitle('Berhasil');
      setModalMessage('Delegasi disetujui!');
      setModalVisible(true);
      fetchEventDetails(); // Refresh event details
    } catch (error) {
      console.error('Error confirming event:', error);
      setModalTitle('Gagal');
      setModalMessage(error);
      setModalVisible(true);
    }
  };

  const handleDitolak = async () => {
    setResponseDialogVisible(true);
  };

  const handleHandlerChange = async () => {
    setChangeHandlerDialogVisible(true);
  };

  const fetchEventDetails = async () => {
    try {
      const response = await axios.get(`${config.apiBaseUrl}/event/${eventId}`);
      setEventDetails(response.data.data);
      if (response.data.data.status === 'Verifikasi Ditolak') {
        setRejectionReason(response.data.data.rejectionReason || '');
      }
    } catch (error) {
      console.error('Error fetching event details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResponses = async () => {
    try {
      const response = await axios.get(`${config.apiBaseUrl}/response/event/${eventId}`);
      setResponses(response.data.data);
    } catch (error) {
      console.error('Error fetching responses:', error);
    }
  };

  const fetchUserId = async () => {
    const id = await AsyncStorage.getItem('userId');
    setUserId(id);
  };

  const fetchDivisions = async () => {
    try {
      const response = await axios.get(`${config.apiBaseUrl}/division`);
      setDivisions(response.data.data);
    } catch (error) {
      console.error('Error fetching divisions:', error);
    }
  };

  const handleDivisionChange = async (divisionId) => {
    setSelectedDivision(divisionId);
    try {
      const response = await axios.get(`${config.apiBaseUrl}/user/by-division`, {
        params: { divisionId }
      });
      setPersons(response.data.data);
      setSelectedPerson('');
    } catch (error) {
      console.error('Error fetching persons:', error);
    }
  };

  const handleChangeHandlerSubmit = async () => {
    try {
      await axios.put(`${config.apiBaseUrl}/event/update-handler/${eventId}`, {
        toDivisionId: selectedDivision,
        toPersonId: selectedPerson,
        status: 'Perlu Konfirmasi Penerima'
      });
      setModalTitle('Berhasil');
      setModalMessage('Penerima berhasil diganti!');
      setModalVisible(true);
      setChangeHandlerDialogVisible(false);
      fetchEventDetails(); // Refresh event details
    } catch (error) {
      console.error('Error changing handler:', error);
      setModalTitle('Gagal');
      setModalMessage(error);
      setModalVisible(true);
    }
  };

  const handleFileOpen = (url) => {
    Linking.openURL(`${config.apiBaseUrl}${url}`);
  };

  const handleResponseSaved = () => {
    fetchResponses(); // Refresh the responses
    setResponseDialogVisible(false); // Close the dialog
  };

  const handleEdit = () => {
    navigation.navigate('EditDelegasi', { eventId });
  };

  const divisionColors = {
    Supervisor: '#424F5E',
    'Senior Officer': '#7954F6',
    'Technical Officer': '#FFAE00',
    'Field Officer': '#11D69F',
    'Community Provider': '#663F70',
    Internship: '#EE3862',
  };

  const renderHeader = () => (
    <View style={tw`px-5`}>
      <View style={tw`flex-row justify-between items-center py-5 bg-white`}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="close" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={tw`text-lg font-bold text-blue-600`}>Detail Delegasi</Text>
        {userRole === 'admin' && eventDetails.status === 'Verifikasi Ditolak' && (
          <TouchableOpacity onPress={handleEdit}>
            <Icon name="create-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>

      <View style={tw`flex-row items-center mb-3`}>
        <Image
          source={eventDetails.profileImageUrl ? { uri: `${config.apiBaseUrl}${eventDetails.profileImageUrl}` } : defaultProfileImage}
          style={tw`w-12 h-12 rounded-full mr-3`}
        />
        <View style={tw`flex-1`}>
          <Text style={tw`text-base text-blue-600 font-bold`}>Kepada: {eventDetails.toPerson?.username}</Text>
          <Text style={tw`text-sm text-gray-500`}>{eventDetails.toPerson?.email}</Text>
          <Text style={[tw`text-sm`, { color: divisionColors[eventDetails.toDivision?.name] || '#FFA500' }]}>
            {eventDetails.toDivision?.name}
          </Text>
        </View>
        <Text style={tw`text-xs text-gray-500 text-right`}>
          {new Date(eventDetails.date).toLocaleDateString()}
        </Text>
      </View>
      {userRole === 'admin' && ['Penerima Menolak'].includes(eventDetails.status) && (
        <View style={tw`flex-row justify-between mt-5`}>
          <TouchableOpacity style={tw`bg-yellow-600 p-3 rounded-full flex-1 mr-2 items-center`} onPress={handleHandlerChange}>
            <Text style={tw`text-white text-lg font-bold`}>Ubah Penerima</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={tw`border-2 border-gray-200 my-3`} />

      <Text style={tw`text-lg font-bold text-black mb-3`}>{eventDetails.title}</Text>

      {eventDetails.descriptionImageUrl && (
        <Image source={{ uri: `${config.apiBaseUrl}${eventDetails.descriptionImageUrl}` }} style={tw`w-full h-48 rounded-lg mb-5`} />
      )}

      <Text style={tw`text-base text-black mt-2 mb-5`}>{eventDetails.description}</Text>

      <View style={tw`flex-row flex-wrap`}>
        {eventDetails.eventFileUrls && JSON.parse(eventDetails.eventFileUrls).map((file, index) => (
          <TouchableOpacity key={index} style={tw`flex-row items-center p-2 m-1 border rounded-full`} onPress={() => handleFileOpen(file.url)}>
            <Icon2 name="file-pdf-box" size={24} color="red" style={tw`mr-2`} />
            <Text style={tw`text-black`} numberOfLines={1} ellipsizeMode="tail">
              {file.originalName.length > 10 ? `${file.originalName.substring(0, 10)}...` : file.originalName}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {userRole === 'delegation_verificator' && ['Perlu Verifikasi'].includes(eventDetails.status) && (
        <View style={tw`flex-row justify-between mt-5`}>
          <TouchableOpacity style={tw`bg-green-600 p-3 rounded-full flex-1 mr-2 items-center`} onPress={handleAccept}>
            <Text style={tw`text-white text-lg font-bold`}>Disetujui</Text>
          </TouchableOpacity>
          <TouchableOpacity style={tw`bg-red-600 p-3 rounded-full flex-1 ml-2 items-center`} onPress={handleReject}>
            <Text style={tw`text-white text-lg font-bold`}>Ditolak</Text>
          </TouchableOpacity>
        </View>
      )}

      {eventDetails.status === 'Verifikasi Ditolak' && (
        <View style={tw`bg-red-100 p-4 rounded-lg mt-5 relative`}>
          <Text style={tw`text-red-600 font-bold`}>Perbaikan:</Text>
          <Text style={tw`text-red-600 mt-1`}>{rejectionReason}</Text>
          {userRole === 'admin' && (
            <TouchableOpacity style={tw`absolute top-2 right-2`} onPress={handleFixRejection}>
              <Icon name="checkmark-circle-outline" size={24} color="green" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {userRole === 'delegation_handler' && eventDetails.status === 'Perlu Konfirmasi Penerima' && (
        <View style={tw`flex-row justify-between mt-5`}>
          <TouchableOpacity style={tw`bg-green-600 p-3 rounded-full flex-1 mr-2 items-center`} onPress={handleConfirmHandler}>
            <Text style={tw`text-white text-lg font-bold`}>Ambil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={tw`bg-red-600 p-3 rounded-full flex-1 ml-2 items-center`} onPress={handleRejectHandler}>
            <Text style={tw`text-white text-lg font-bold`}>Tolak</Text>
          </TouchableOpacity>
        </View>
      )}

      {userRole === 'delegation_handler' && eventDetails.status === 'Penerima Setuju' && (
        <TouchableOpacity 
        style={tw`flex-row justify-center items-center p-3 rounded-full border border-blue-600 my-5`} 
        onPress={() => setResponseDialogVisible(true)}
        >
          <Icon name="add-circle-outline" size={24} color="#007AFF" />
          <Text style={tw`text-blue-600 text-lg font-bold ml-2`}>Buat Respon</Text>
        </TouchableOpacity>
      )}

      {userRole === 'delegation_handler' && eventDetails.status === 'Penerima Setuju' && (
        <Text style={tw`text-lg font-bold text-black my-5`}>Respon</Text>
      )}

      {userRole === 'delegation_verificator' && eventDetails.status === 'Penerima Setuju' && (
        <View style={tw`flex-row justify-between mt-5`}>
          <TouchableOpacity style={tw`bg-yellow-500 p-3 rounded-full flex-1 mr-2 items-center`} onPress={handleDitolak}>
            <Text style={tw`text-white text-lg font-bold`}>Ditolak</Text>
          </TouchableOpacity>
          <TouchableOpacity style={tw`bg-green-600 p-3 rounded-full flex-1 ml-2 items-center`} onPress={handleDisetujui}>
            <Text style={tw`text-white text-lg font-bold`}>Disetujui</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={tw`flex-1 bg-white`}>
      {renderHeader()}

      {responses.map((item, index) => (
        <View key={index} style={tw`p-5 border-b border-gray-200`}>
          <View style={tw`flex-row items-center`}>
            <Image
              source={item.user?.profileImageUrl ? { uri: `${config.apiBaseUrl}${item.user.profileImageUrl}` } : defaultProfileImage}
              style={tw`w-10 h-10 rounded-full mr-3`}
            />
            <View>
              <Text style={tw`text-base font-bold`}>{item.user?.username || 'Unknown User'}</Text>
              <Text style={tw`text-sm text-gray-500`}>{item.user?.email || 'Unknown Email'}</Text>
            </View>
          </View>
          <Text style={tw`text-base text-black mt-2`}>{item.responseText}</Text>
          {item.responseImageUrl && (
            <Image source={{ uri: `${config.apiBaseUrl}${item.responseImageUrl}` }} style={tw`w-full h-40 rounded-lg mt-3`} />
          )}
        </View>
      ))}

      {responseDialogVisible && (
        <ResponseDialog
          visible={responseDialogVisible}
          onClose={() => setResponseDialogVisible(false)}
          eventId={eventId}
          userId={userId}
          onResponseSaved={handleResponseSaved}
        />
      )}

      <Modal
        visible={rejectionReasonDialogVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setRejectionReasonDialogVisible(false)}
      >
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white p-5 rounded-lg w-4/5`}>
            <Text style={tw`text-lg font-bold mb-3`}>Revisi</Text>
            <TextInput
              style={tw`border border-gray-300 rounded-lg p-2 mb-4`}
              placeholder="Perbaikan..."
              value={rejectionReason}
              onChangeText={setRejectionReason}
            />
            <View style={tw`flex-row justify-end`}>
              <TouchableOpacity style={tw`bg-gray-400 p-3 rounded-lg mr-2`} onPress={() => setRejectionReasonDialogVisible(false)}>
                <Text style={tw`text-white text-base`}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={tw`bg-blue-600 p-3 rounded-lg`} onPress={handleRejectionSubmit}>
                <Text style={tw`text-white text-base`}>Kirim</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={changeHandlerDialogVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setChangeHandlerDialogVisible(false)}
      >
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white p-5 rounded-lg w-4/5`}>
            <Text style={tw`text-lg font-bold mb-3`}>Ubah Penerima</Text>
            <Picker
              selectedValue={selectedDivision}
              onValueChange={handleDivisionChange}
              style={tw`mb-4`}
            >
              <Picker.Item label="Pilih divisi" value="" />
              {divisions.map((division) => (
                <Picker.Item key={division.id} label={division.name} value={division.id} />
              ))}
            </Picker>
            <Picker
              selectedValue={selectedPerson}
              onValueChange={(itemValue) => setSelectedPerson(itemValue)}
              style={tw`mb-4`}
              enabled={selectedDivision !== ''}
            >
              <Picker.Item label="Pilih penerima" value="" />
              {persons.map((person) => (
                <Picker.Item key={person.id} label={person.username} value={person.id} />
              ))}
            </Picker>
            <View style={tw`flex-row justify-end`}>
              <TouchableOpacity style={tw`bg-gray-400 p-3 rounded-lg mr-2`} onPress={() => setChangeHandlerDialogVisible(false)}>
                <Text style={tw`text-white text-base`}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={tw`bg-blue-600 p-3 rounded-lg`} onPress={handleChangeHandlerSubmit}>
                <Text style={tw`text-white text-base`}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
      transparent={true}
      animationType="fade"
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
        <View style={tw`bg-white p-6 rounded-lg w-4/5 items-center`}>
          <Icon name='checkmark-circle' size={50} color="#007AFF" style={tw`mb-4`} />
          <Text style={tw`text-lg font-bold text-gray-800 mb-3 text-center`}>
            {modalTitle}
          </Text>
          <Text style={tw`text-base text-gray-600 mb-5 text-center`}>
            {modalMessage}
          </Text>
          <TouchableOpacity
            style={tw`bg-blue-600 p-3 rounded-full w-full items-center`}
            onPress={() => setModalVisible(false)}
          >
            <Text style={tw`text-white text-lg font-bold`}>Tutup</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
    </ScrollView>
  );
};

export default DetailDelegasi;
