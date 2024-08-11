import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Image, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DocumentPicker from 'react-native-document-picker';
import { launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';
import tw from 'twrnc';
import config from './config';

const ResponseDialog = ({ visible, onClose, eventId, userId, onResponseSaved, userRole }) => {
  const [responseText, setResponseText] = useState('');
  const [responseImage, setResponseImage] = useState(null);
  const [responseFiles, setResponseFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) {
      // Clear the form when the dialog closes
      setResponseText('');
      setResponseImage(null);
      setResponseFiles([]);
    }
  }, [visible]);

  const uploadResponseImage = async () => {
    if (responseImage) {
      const formData = new FormData();
      const filename = responseImage.uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;
      formData.append('responseImageUrl', { uri: responseImage.uri, name: filename, type });

      try {
        const response = await axios.post(`${config.apiBaseUrl}/response/upload-response-image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data.responseImageUrl;
      } catch (error) {
        console.error('Error uploading response image:', error);
        throw error;
      }
    }
    return null;
  };

  const uploadResponseFiles = async () => {
    if (responseFiles.length > 0) {
      const formData = new FormData();
  
      responseFiles.forEach((file) => {
        formData.append('responseFiles', {
          uri: file.uri,
          name: file.name,
          type: file.type,
        });
      });
  
      try {
        const response = await axios.post(`${config.apiBaseUrl}/response/upload-response-files`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
  
        return response.data.responseFileUrls;
      } catch (error) {
        console.error('Error uploading response files:', error);
        throw error;
      }
    }
    return [];
  };

  const handleSend = async () => {
    setSaving(true);
    try {
      const responseImageUrl = await uploadResponseImage();
      const responseFileUrls = await uploadResponseFiles();
      const responseFormData = {
        responseText,
        responseImageUrl,
        responseFileUrls: JSON.stringify(responseFileUrls),
        eventId,
        userId,
        userRole
      };

      await axios.post(`${config.apiBaseUrl}/response/create`, responseFormData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      onResponseSaved(); // Notify the parent component that the response has been saved
      onClose(); // Close the dialog after sending
    } catch (error) {
      console.error('Error sending response:', error);
      // You could show a modal here to alert the user of an error
    } finally {
      setSaving(false);
    }
  };

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (!response.didCancel && !response.errorCode) {
        setResponseImage(response.assets[0]);
      }
    });
  };

  const pickFiles = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf, DocumentPicker.types.doc, DocumentPicker.types.docx, DocumentPicker.types.ppt, DocumentPicker.types.pptx],
        allowMultiSelection: true,
      });
      setResponseFiles(res);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled the picker');
      } else {
        throw err;
      }
    }
  };

  const removeImage = () => {
    setResponseImage(null);
  };

  const removeFile = (index) => {
    setResponseFiles(responseFiles.filter((_, i) => i !== index));
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
        <View style={tw`bg-white p-5 rounded-lg w-4/5`}>
          <View style={tw`flex-row justify-between items-center mb-5`}>
            <Text style={tw`text-lg font-bold`}>Buat Respon</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>
          <View style={tw`flex-row mb-5`}>
            <TouchableOpacity style={tw`bg-gray-100 p-4 rounded-lg items-center justify-center mr-3`} onPress={pickImage}>
              <Icon name="image-outline" size={30} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity style={tw`bg-gray-100 p-4 rounded-lg items-center justify-center`} onPress={pickFiles}>
              <Icon name="document-outline" size={30} color="#007AFF" />
            </TouchableOpacity>
          </View>
          {responseImage && (
            <View style={tw`mb-5`}>
              <Image source={{ uri: responseImage.uri }} style={tw`w-full h-40 rounded-lg`} />
              <TouchableOpacity onPress={removeImage} style={tw`absolute top-2 right-2`}>
                <Icon name="close-circle" size={24} color="red" />
              </TouchableOpacity>
            </View>
          )}
          <View style={tw`flex-row flex-wrap mb-2`}>
            {responseFiles.map((file, index) => (
              <View
                key={index}
                style={[
                  tw`flex-row items-center border rounded-full mb-2 mr-2`,
                  { borderColor: '#000', paddingVertical: 2, paddingHorizontal: 8, width: '45%' },
                ]}
              >
                <Icon
                  name="document-outline"
                  size={20}
                  color="red"
                  style={tw`mr-2`}
                />
                <Text style={tw`text-black flex-1 text-xs`} numberOfLines={1} ellipsizeMode="tail">
                  {file.name.length > 6
                    ? `${file.name.substring(0, 6)}...`
                    : file.name}
                </Text>
                <TouchableOpacity onPress={() => removeFile(index)} style={tw`ml-2`}>
                  <Icon name="close" size={16} color="black" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <TextInput
            style={tw`border border-gray-300 rounded-lg p-3 mb-5 h-32`}
            placeholder="Deskripsikan respon..."
            multiline
            value={responseText}
            onChangeText={setResponseText}
            textAlignVertical="top"
          />
          <View style={tw`flex-row justify-end`}>
            <TouchableOpacity style={tw`bg-gray-400 p-3 rounded-lg  mr-2`} onPress={onClose}>
              <Text style={tw`text-white text-center`}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tw`bg-blue-600 p-3 rounded-lg`} onPress={handleSend} disabled={saving}>
              {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={tw`text-white text-center`}>Kirim</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ResponseDialog;
