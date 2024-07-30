import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Linking } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import DocumentPicker from 'react-native-document-picker';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import config from './config';

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
    toDivision: '',
    toPerson: '',
    title: '',
    description: '',
  });
  const [divisions, setDivisions] = useState([]);
  const [users, setUsers] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);

  useEffect(() => {
    fetchEventDetails();
    fetchDivisions();
  }, []);

  useEffect(() => {
    if (formData.toDivision) {
      fetchUsersByDivision(formData.toDivision);
    }
  }, [formData.toDivision]);

  const fetchEventDetails = async () => {
    try {
      const response = await axios.get(`${config.apiBaseUrl}/event/${eventId}`);
      const event = response.data.data;
      setEventDetails(event);
      setFormData({
        toDivision: event.toDivision.id, // Assuming `toDivision` is an object with an `id` property
        toPerson: event.toPerson.id, // Assuming `toPerson` is an object with an `id` property
        title: event.title,
        description: event.description,
      });
      setDate(new Date(event.date));
      setDescriptionImage(event.descriptionImageUrl ? { uri: `${config.apiBaseUrl}${event.descriptionImageUrl}` } : null);
      setExistingFiles(event.eventFileUrls ? JSON.parse(event.eventFileUrls) : []);
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

  const removeExistingFile = (index) => {
    setExistingFiles(existingFiles.filter((_, i) => i !== index));
  };

  const handleFileOpen = (url) => {
    Linking.openURL(url);
  };

  const uploadDescriptionImage = async () => {
    if (descriptionImage && descriptionImage.uri) {
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
    return eventDetails.descriptionImageUrl;
  };

  const uploadEventFiles = async () => {
    if (eventFiles.length > 0) {
      const formData = new FormData();
      eventFiles.forEach((file, index) => {
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
      const newEventFileUrls = await uploadEventFiles();
      const combinedFiles = [
        ...existingFiles,
        ...newEventFileUrls.map(file => ({
          originalName: file.originalname,
          url: file.url,
          mimeType: file.mimetype
        }))
      ];

      const eventFormData = {
        ...formData,
        descriptionImageUrl,
        eventFileUrls: JSON.stringify(combinedFiles),
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>X</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Delegasi</Text>
      </View>

      <Text style={styles.label}>To Division:</Text>
      <Picker
        selectedValue={formData.toDivision}
        onValueChange={(itemValue) => handleInputChange('toDivision', itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select Division" value="" />
        {divisions.map((division) => (
          <Picker.Item key={division.id} label={division.name} value={division.id} />
        ))}
      </Picker>

      <Text style={styles.label}>To Person:</Text>
      <Picker
        selectedValue={formData.toPerson}
        onValueChange={(itemValue) => handleInputChange('toPerson', itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select Person" value="" />
        {users.map((user) => (
          <Picker.Item key={user.id} label={user.username} value={user.id} />
        ))}
      </Picker>

      <Text style={styles.label}>Title:</Text>
      <TextInput
        style={styles.input}
        value={formData.title}
        onChangeText={(value) => handleInputChange('title', value)}
        placeholder="Event Title"
      />

      <Text style={styles.label}>Date:</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
        <Text>{date.toDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onChangeDate}
        />
      )}

      <Text style={styles.label}>Description:</Text>
      <TextInput
        style={styles.textarea}
        value={formData.description}
        onChangeText={(value) => handleInputChange('description', value)}
        placeholder="Description"
        multiline
      />

      <Text style={styles.label}>Description Image:</Text>
      {descriptionImage && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: descriptionImage.uri }} style={styles.previewImage} />
          <TouchableOpacity onPress={removeImage} style={styles.removeButton}>
            <Icon name="close-circle" size={24} color="red" />
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity onPress={pickImage} style={styles.iconButton}>
        <Icon name="image-outline" size={40} color="#007AFF" />
      </TouchableOpacity>

      <Text style={styles.label}>Event Files:</Text>
      {existingFiles.map((file, index) => (
        <View key={index} style={styles.fileItem}>
          <Text style={styles.fileName}>{file.originalName}</Text>
          <TouchableOpacity onPress={() => handleFileOpen(`${config.apiBaseUrl}${file.url}`)}>
            <Icon name="document-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => removeExistingFile(index)} style={styles.removeButton}>
            <Icon name="close-circle" size={24} color="red" />
          </TouchableOpacity>
        </View>
      ))}
      {eventFiles.map((file, index) => (
        <View key={index} style={styles.fileItem}>
          <Text style={styles.fileName}>{file.name}</Text>
          <TouchableOpacity onPress={() => handleFileOpen(file.uri)}>
            <Icon name="document-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => removeFile(index)} style={styles.removeButton}>
            <Icon name="close-circle" size={24} color="red" />
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity onPress={pickFiles} style={styles.iconButton}>
        <Icon name="document-outline" size={40} color="#007AFF" />
      </TouchableOpacity>

      <Button title="Save" onPress={handleSave} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 18,
    color: '#007AFF',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  label: {
    marginVertical: 5,
    fontSize: 16,
    color: '#000',
    textAlign: 'left',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    textAlign: 'left',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    height: 100,
    marginBottom: 10,
    textAlign: 'left',
  },
  picker: {
    marginBottom: 10,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginHorizontal: 10,
  },
  previewContainer: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  previewImage: {
    width: '100%',
    height: 200,
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  fileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  fileName: {
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EditDelegasi;
