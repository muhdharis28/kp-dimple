import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, Image, TouchableOpacity,
  ScrollView, ActivityIndicator, StyleSheet
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DocumentPicker from 'react-native-document-picker';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import tw from 'twrnc';
import { Menu, MenuItem } from 'react-native-material-menu';
import config from './config'; // Import the configuration

const EditDelegasi = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { eventId } = route.params;

  const [eventDetails, setEventDetails] = useState({});
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [descriptionImage, setDescriptionImage] = useState(null);
  const [eventFiles, setEventFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    toDivisionId: '',
    toPersonId: '',
    title: '',
    description: '',
  });
  const [divisions, setDivisions] = useState([]);
  const [users, setUsers] = useState([]);
  const menuRef = useRef(null);

  useEffect(() => {
    fetchEventDetails();
    fetchDivisions();
  }, []);

  useEffect(() => {
    if (formData.toDivisionId) {
      fetchUsersByDivision(formData.toDivisionId);
    }
  }, [formData.toDivisionId]);

  const fetchEventDetails = async () => {
  try {
    const response = await axios.get(`${config.apiBaseUrl}/event/${eventId}`);
    const event = response.data.data;

    setEventDetails(event);
    setFormData({
      toDivisionId: event.toDivision?.id || '',  // Use optional chaining and provide fallback
      toPersonId: event.toPerson?.id || '',  // Use optional chaining and provide fallback
      title: event.title || '',
      description: event.description || '',
    });
    setDate(new Date(event.date));
  } catch (error) {
    console.error('Error fetching event details:', error);
  }
};

  const fetchDivisions = async () => {
    try {
      const response = await axios.get(`${config.apiBaseUrl}/division`);
      setDivisions(response.data.data);
    } catch (error) {
      console.error('Error fetching divisions:', error);
    }
  };

  const fetchUsersByDivision = async (divisionId) => {
    try {
      const response = await axios.get(`${config.apiBaseUrl}/user/by-division`, {
        params: { divisionId }
      });
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users by division:', error);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (!response.didCancel && !response.error) {
        setDescriptionImage(response.assets[0]);
      }
    });
  };

  const removeImage = () => {
    setDescriptionImage(null);
  };

  const pickFiles = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.doc, DocumentPicker.types.docx, DocumentPicker.types.ppt, DocumentPicker.types.pptx],
        allowMultiSelection: true,
      });
      setEventFiles(res);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled the picker');
      } else {
        throw err;
      }
    }
  };

  const removeFile = (index) => {
    setEventFiles(eventFiles.filter((_, i) => i !== index));
  };

  const uploadDescriptionImage = async () => {
    if (descriptionImage) {
      const formData = new FormData();
      const filename = descriptionImage.uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;
      formData.append('descriptionImageUrl', { uri: descriptionImage.uri, name: filename, type });

      try {
        const response = await axios.post(`${config.apiBaseUrl}/event/upload-description-image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data.descriptionImageUrl;
      } catch (error) {
        console.error('Error uploading description image:', error);
        throw error;
      }
    }
    return null;
  };

  const uploadEventFiles = async () => {
    if (eventFiles.length > 0) {
      const formData = new FormData();
      eventFiles.forEach((file) => {
        formData.append('eventFiles', {
          uri: file.uri,
          name: file.name,
          type: file.type,
        });
      });
      
      try {
        const response = await axios.post(`${config.apiBaseUrl}/event/upload-event-files`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data.eventFileUrls;
      } catch (error) {
        console.error('Error uploading response files:', error);
        throw error;
      }
    }
    return [];
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const descriptionImageUrl = await uploadDescriptionImage();
      const eventFileUrls = await uploadEventFiles();

      const eventFormData = {
        ...formData,
        descriptionImageUrl,
        eventFileUrls: JSON.stringify(eventFileUrls),
        date: date.toISOString()
      };
      await axios.put(`${config.apiBaseUrl}/event/update/${eventId}`, eventFormData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      alert('Event updated successfully!');
      navigation.goBack();
    } catch (error) {
      if (error.response) {
        console.error('Error updating event:', error.response.data);
        alert(`Error updating event: ${error.response.data.message}`);
      } else if (error.request) {
        console.error('Network error:', error.request);
        alert('Network error. Please check your connection.');
      } else {
        console.error('Error:', error.message);
        alert(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const showMenu = () => {
    menuRef.current.show();
  };

  const hideMenu = () => {
    menuRef.current.hide();
  };

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const customMenuStyles = StyleSheet.create({
    menuContainer: {
      margin: 0,
      borderRadius: 40,
      minWidth: 0,
      height: 0,
    },
    menuItem: {
      justifyContent: 'center',
      alignItems: 'center',
      minWidth: 40,
      height: 40,
      marginVertical: 5,
    },
    iconStyle: {
      color: '#2563EB',
    },
  });

  return (
    <ScrollView style={tw`flex-1 bg-white`}>
      {/* Note Banner */}
      <View style={[tw`bg-yellow-300 p-3`, { borderBottomWidth: 1, borderBottomColor: '#FFA000' }]}>
        <Text style={tw`text-black text-center font-bold`}>
          Catatan: Pastikan untuk mengunggah ulang file dan gambar saat menyimpan data.
        </Text>
      </View>

      <View style={tw`flex-row justify-between items-center px-5 py-5 bg-white`}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={tw`text-lg font-bold text-gray-600`}>
            <Icon name="close" size={24} color="#007AFF" />
          </Text>
        </TouchableOpacity>
        <Text style={tw`text-lg font-bold text-blue-600`}>Edit Delegasi</Text>
        <Menu
          ref={menuRef}
          anchor={
            <TouchableOpacity onPress={showMenu}>
              <Icon2 name="attachment" size={24} color="black" />
            </TouchableOpacity>
          }
          onRequestClose={hideMenu}
          contentStyle={customMenuStyles.menuContainer} // Custom menu container style
        >
          <MenuItem
            onPress={pickFiles}
            style={customMenuStyles.menuItem}
          >
            <Icon name="document-outline" size={24} style={customMenuStyles.iconStyle} />
          </MenuItem>
          <MenuItem
            onPress={pickImage}
            style={customMenuStyles.menuItem}
          >
            <Icon name="image-outline" size={24} style={customMenuStyles.iconStyle} />
          </MenuItem>
        </Menu>
      </View>

      <View style={tw`px-5 mt-5`}>
        <View style={tw`flex-row`}>
          <View style={tw`flex-1`}>
            <Text style={tw`text-gray-600 text-base`}>Tujuan:</Text>
          </View>
        </View>
        <View style={tw`flex-row items-center`}>
          <Text style={tw`text-gray-600 mb-1`}>Divisi:</Text>
          <Picker
            selectedValue={formData.toDivisionId}
            onValueChange={(itemValue) => handleInputChange('toDivisionId', itemValue)}
            style={tw`flex-1 ml-2 text-black`}
          >
            <Picker.Item label="Pilih divisi..." value="" />
            {divisions.map((division) => (
              <Picker.Item key={division.id} label={division.name} value={division.id} style={tw`flex-1 ml-2 text-black`} />
            ))}
          </Picker>
        </View>
        <View style={tw`flex-row items-center`}>
          <Text style={tw`text-gray-600 mb-1`}>Penerima:</Text>
          <Picker
            selectedValue={formData.toPersonId}
            onValueChange={(itemValue) => handleInputChange('toPersonId', itemValue)}
            style={tw`flex-1 ml-2`}
          >
            <Picker.Item label="Pilih penerima..." value="" />
            {users.map(user => (
              <Picker.Item key={user.id} label={user.username} value={user.id} />
            ))}
          </Picker>
        </View>

        <View style={tw`flex-row items-center`}>
          <Text style={tw`text-gray-600 mr-2 text-base`}>Judul:</Text>
          <TextInput
            style={tw`flex-1 p-2 text-black`}
            value={formData.title}
            onChangeText={(value) => handleInputChange('title', value)}
            placeholder="Isi judul..."
          />
        </View>
        <View style={tw`border-b border-gray-300 mb-5`}/>
        <View style={tw`flex-row items-center`}>
          <Text style={tw`text-gray-600 mr-2 text-base`}>Tanggal:</Text>
          <Text style={tw`flex-1 p-2 text-black`}>{date.toDateString()}</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={tw`p-2 ml-auto`}>
            <Icon name="calendar" size={24} color="gray" />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onChangeDate}
            />
          )}
        </View>
        <View style={tw`border-b border-gray-300 mb-5`}/>
        <View style={tw`flex-row items-center`}>
          <Text style={tw`text-gray-600 mr-2 text-base`}>Deskripsi:</Text>
        </View>
        
        {descriptionImage && (
          <View style={tw`mb-4`}>
            <Image source={{ uri: descriptionImage.uri }} style={tw`w-full h-40 mt-5 rounded-lg`} />
            <TouchableOpacity onPress={removeImage} style={tw`absolute top-7 right-2`}>
              <Icon name="close-circle" size={24} color="red" />
            </TouchableOpacity>
          </View>
        )}
        <TextInput
          style={tw``}
          value={formData.description}
          onChangeText={(value) => handleInputChange('description', value)}
          placeholder="Isi deskripsi..."
          multiline
        />

          <View style={tw`flex-row flex-wrap`}>
            {eventFiles.map((file, index) => (
              <View
                key={index}
                style={[
                  tw`flex-row items-center p-2 m-1 border rounded-full`,
                  { borderColor: '#000' },
                ]}
              >
                <Icon2
                  name="file-pdf-box"
                  size={24}
                  color="red"
                  style={tw`mr-2`}
                />
                <Text style={tw`text-black`} numberOfLines={1} ellipsizeMode="tail">
                  {file.name.length > 10
                    ? `${file.name.substring(0, 10)}...`
                    : file.name}
                </Text>
                <TouchableOpacity onPress={() => removeFile(index)} style={tw`ml-2`}>
                  <Icon name="close" size={16} color="black" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

        <TouchableOpacity onPress={handleSave} style={tw`bg-blue-600 p-3 rounded-full items-center mt-10 mb-10 mx-10`}>
          <Text style={tw`text-white text-lg font-bold`}>Simpan</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default EditDelegasi;
