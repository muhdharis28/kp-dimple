import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Modal } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/AntDesign';
import config from './config'; // Import the configuration
import tw from 'twrnc';

const ManageDivisions = () => {
  const navigation = useNavigation();
  const [divisions, setDivisions] = useState([]);
  const [divisionName, setDivisionName] = useState('');
  const [editDivisionId, setEditDivisionId] = useState(null);
  const [editDivisionName, setEditDivisionName] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [divisionToDelete, setDivisionToDelete] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

  useEffect(() => {
    fetchDivisions();
  }, []);

  const fetchDivisions = async () => {
    try {
      const response = await axios.get(`${config.apiBaseUrl}/division`);
      setDivisions(response.data.data);
    } catch (error) {
      console.error('Error fetching divisions:', error);
    }
  };

  const handleAddDivision = async () => {
    if (!divisionName.trim()) {
      showErrorModal('Error', 'Nama divisi tidak boleh kosong');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${config.apiBaseUrl}/division`, { name: divisionName });
      setDivisionName('');
      setAddModalVisible(false);
      fetchDivisions(); // Refresh the list of divisions
    } catch (error) {
      console.error('Error adding division:', error);
      showErrorModal('Error', 'Tidak dapat menambah divisi');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (divisionId) => {
    setDivisionToDelete(divisionId);
    setDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`${config.apiBaseUrl}/division/${divisionToDelete}`);
      fetchDivisions(); // Refresh the list of divisions after deletion
      setDeleteModalVisible(false);
    } catch (error) {
      console.error('Error deleting division:', error);
      showErrorModal('Error', 'Tidak dapat menghapus divisi');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (division) => {
    setEditDivisionId(division.id);
    setEditDivisionName(division.name);
    setEditModalVisible(true);
  };

  const handleEditDivision = async () => {
    if (!editDivisionName.trim()) {
      showErrorModal('Error', 'Nama divisi tidak boleh kosong');
      return;
    }

    setLoading(true);
    try {
      await axios.put(`${config.apiBaseUrl}/division/${editDivisionId}`, { name: editDivisionName });
      setEditModalVisible(false);
      fetchDivisions(); // Refresh the list of divisions
    } catch (error) {
      console.error('Error editing division:', error);
      showErrorModal('Error', 'Tidak dapat mengedit divisi');
    } finally {
      setLoading(false);
    }
  };

  const showErrorModal = (title, message) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const renderDivisionItem = ({ item }) => (
    <View style={tw`flex-row items-center justify-between bg-[#F6F6F6] p-4 rounded-3xl mb-3 shadow-md`}>
      <Text style={tw`text-lg font-semibold`}>{item.name}</Text>
      <View style={tw`flex-row`}>
        <TouchableOpacity onPress={() => openEditModal(item)} style={tw`bg-blue-600 p-2 rounded-full mr-2`}>
          <Icon name="pencil" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => confirmDelete(item.id)} style={tw`bg-red-600 p-2 rounded-full`}>
          <Icon name="trash" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={tw`flex-1 bg-white p-5`}>
      <View style={tw`flex-row items-center justify-between mb-5`}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={tw`p-2`}>
          <Icon name="arrow-back" size={24} color="#002D7A" />
        </TouchableOpacity>
        <Text style={tw`text-xl font-bold text-[#002D7A]`}>Daftar Divisi</Text>
        <TouchableOpacity onPress={() => setAddModalVisible(true)} style={tw`p-2`}>
          <Icon2 name="adduser" size={24} color="#002D7A" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={divisions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderDivisionItem}
        contentContainerStyle={tw`flex-grow bg-white p-5 rounded-lg shadow-md`}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white w-4/5 p-5 rounded-3xl`}>
            <Text style={tw`text-lg text-center font-bold mb-4 text-black`}>Edit Divisi</Text>
            <TextInput
              style={tw`border text-gray-500 border-gray-300 p-2 px-5 rounded-full mb-4 mx-10`}
              value={editDivisionName}
              onChangeText={setEditDivisionName}
              placeholder="Nama divisi"
            />
            <View style={tw`flex-row justify-between`}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={tw`bg-gray-200 p-3 rounded-full px-8 mx-3`}>
                <Text style={tw`text-white font-bold`}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleEditDivision} style={tw`bg-blue-600 p-3 rounded-full px-8 mx-3`}>
                <Text style={tw`text-white font-bold`}>Edit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={addModalVisible}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white w-4/5 p-5 rounded-3xl`}>
            <Text style={tw`text-lg text-center font-bold mb-4 text-black`}>Tambah Divisi</Text>
            <TextInput
              style={tw`border text-gray-500 border-gray-300 p-2 px-5 rounded-full mb-4 mx-10`}
              value={divisionName}
              onChangeText={setDivisionName}
              placeholder="Nama divisi"
            />
            <View style={tw`flex-row justify-between`}>
              <TouchableOpacity onPress={() => setAddModalVisible(false)} style={tw`bg-gray-200 p-3 rounded-full px-8 mx-3`}>
                <Text style={tw`text-gray-500 font-bold`}>Tidak</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddDivision} style={tw`bg-blue-600 p-3 rounded-full px-8 mx-3`}>
                <Text style={tw`text-white font-bold`}>Tambah</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white w-4/5 p-5 rounded-3xl`}>
            <Text style={tw`text-lg text-center font-bold mb-4 text-black`}>Hapus Divisi</Text>
            <Text style={tw`text-base text-center mb-4 text-gray-500`}>Apakah Anda yakin ingin menghapus divisi ini?</Text>
            <View style={tw`flex-row justify-between`}>
              <TouchableOpacity onPress={() => setDeleteModalVisible(false)} style={tw`bg-gray-200 p-3 rounded-full px-8 mx-3`}>
                <Text style={tw`text-gray-500 font-bold`}>Tidak</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={tw`bg-red-600 p-3 rounded-full px-8 mx-3`}>
                <Text style={tw`text-white font-bold`}>Hapus</Text>
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
          <View style={tw`bg-white p-5 rounded-lg w-4/5 items-center`}>
            <Icon
              name={modalTitle === 'Error' ? "alert-circle-outline" : "checkmark-circle-outline"}
              size={50}
              color={modalTitle === 'Error' ? "red" : "green"}
              style={tw`mb-3`}
            />
            <Text style={tw`text-lg font-bold mb-3 text-center`}>{modalTitle}</Text>
            <Text style={tw`text-base mb-5 text-center text-gray-600`}>{modalMessage}</Text>
            <TouchableOpacity
              style={tw`bg-blue-600 p-3 rounded-lg w-full`}
              onPress={() => setModalVisible(false)}
            >
              <Text style={tw`text-white text-base text-center`}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ManageDivisions;
