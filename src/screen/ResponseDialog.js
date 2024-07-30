import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert, Image, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import DocumentPicker from 'react-native-document-picker';
import { launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';
import config from './config';

const ResponseDialog = ({ visible, onClose, eventId, userId, onResponseSaved }) => {
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
        console.log('Appending file:', file);
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
      Alert.alert('Error', 'Failed to send response');
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
      console.log('Selected files:', res);
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
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Response</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color="black" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <View style={styles.iconRow}>
              <TouchableOpacity style={styles.iconButton} onPress={pickImage}>
                <Icon name="image-outline" size={40} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={pickFiles}>
                <Icon name="document-outline" size={40} color="#007AFF" />
              </TouchableOpacity>
            </View>
            {responseImage && (
              <View style={styles.previewContainer}>
                <Image source={{ uri: responseImage.uri }} style={styles.previewImage} />
                <TouchableOpacity onPress={removeImage} style={styles.removeButton}>
                  <Icon name="close-circle" size={24} color="red" />
                </TouchableOpacity>
              </View>
            )}
            {responseFiles.map((file, index) => (
              <View key={index} style={styles.fileItem}>
                <Text style={styles.fileName}>{file.name}</Text>
                <TouchableOpacity onPress={() => removeFile(index)}>
                  <Icon name="close-circle" size={24} color="red" />
                </TouchableOpacity>
              </View>
            ))}
            <TextInput
              style={styles.input}
              placeholder="Describe your response..."
              multiline
              value={responseText}
              onChangeText={setResponseText}
            />
          </View>
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={saving}>
              {saving ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.sendButtonText}>Send</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    marginBottom: 20,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    height: 100,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: 'white',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  sendButtonText: {
    color: 'white',
  },
});

export default ResponseDialog;
