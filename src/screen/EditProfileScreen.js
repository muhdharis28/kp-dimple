import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const asyncEmail = await AsyncStorage.getItem('email');
      const asyncPassword = await AsyncStorage.getItem('password');
      const response = await axios.get('http://192.168.18.57:3800/user/profile', {
        params: { email: asyncEmail }
      });
      const { username, email, description, profileImageUrl } = response.data.data;
      setUsername(username);
      setEmail(email);
      setPassword(asyncPassword);
      setProfileDescription(description);
      setProfileImage({ uri: `http://192.168.18.57:3800${profileImageUrl}` });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSavePress = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      alert('New password and confirm password do not match');
      return;
    }

    try {
      await axios.put('http://192.168.18.57:3800/user/profile', {
        username,
        email,
        description: profileDescription,
      });

      if (newPassword) {
        const asyncEmail = await AsyncStorage.getItem('email');
        await axios.put('http://192.168.18.57:3800/user/password', {
          email: asyncEmail,
          newPassword,
          confirmPassword,
        });
      }
      await AsyncStorage.setItem('password', newPassword);
      alert('Profile updated successfully');

      navigation.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);
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

    launchImageLibrary(options, async (response) => {
        if (response.didCancel) {
            console.log('User cancelled image picker');
        } else if (response.error) {
            console.log('ImagePicker Error: ', response.error);
        } else {
            const source = { uri: response.assets[0].uri };
            setProfileImage(source);

            const asyncEmail = await AsyncStorage.getItem('email');

            if (!asyncEmail) {
                console.error('Error: Email not found in AsyncStorage');
                return;
            }

            // Upload image to the server
            const formData = new FormData();
            formData.append('profileImage', {
                uri: response.assets[0].uri,
                type: response.assets[0].type,
                name: response.assets[0].fileName,
            });
            formData.append('email', asyncEmail); // Include email in the form data

            try {
                await axios.put('http://192.168.18.57:3800/user/profile/image', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                console.log('Profile image uploaded successfully');
            } catch (error) {
                console.error('Error uploading profile image:', error);
            }
        }
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={navigation.goBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>My Profile</Text>
        <TouchableOpacity onPress={handleSavePress} style={styles.saveButton}>
          <Icon name="checkmark" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={pickImage}>
          <Image source={profileImage} style={styles.profileImage} />
        </TouchableOpacity>
        <Text style={styles.profileName}>{username}</Text>
        <Text style={styles.profileTitle}>Executive Director</Text>
        <TextInput
          style={styles.profileDescription}
          value={profileDescription}
          onChangeText={setProfileDescription}
          multiline
        />
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Icon name="mail-outline" size={20} color="#fff" />
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.infoText}
              value={email}
              editable={false}
            />
          </View>
        </View>
        <View style={styles.infoRow}>
          <Icon name="person-outline" size={20} color="#fff" />
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.infoText}
              value={username}
              onChangeText={setUsername}
            />
          </View>
        </View>
        <View style={styles.infoRow}>
          <Icon name="lock-closed-outline" size={20} color="#fff" />
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Current Password</Text>
            <TextInput
              style={styles.infoText}
              secureTextEntry={!isPasswordVisible}
              value={password}
              editable={false}
            />
            <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
              <Icon name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Icon name="lock-closed-outline" size={20} color="#fff" />
          <View style={styles.inputContainer}>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.infoText}
              secureTextEntry={!isNewPasswordVisible}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity onPress={toggleNewPasswordVisibility} style={styles.eyeIcon}>
              <Icon name={isNewPasswordVisible ? "eye-off-outline" : "eye-outline"} size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Icon name="lock-closed-outline" size={20} color="#fff" />
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput
              style={styles.infoText}
              secureTextEntry={!isConfirmPasswordVisible}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={toggleConfirmPasswordVisibility} style={styles.eyeIcon}>
              <Icon name={isConfirmPasswordVisible ? "eye-off-outline" : "eye-outline"} size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.passwordHint}>Password should contain at least 8 characters!</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  backButton: {
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    padding: 10,
  },
  profileContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2, // Add border width
    borderColor: '#007AFF', // Add border color
    marginBottom: 10,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  profileTitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  profileDescription: {
    fontSize: 16,
    color: '#666',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    width: '100%',
    textAlign: 'center',
  },
  infoContainer: {
    padding: 20,
    backgroundColor: '#0033A0',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  inputContainer: {
    flex: 1,
    marginLeft: 10,
  },
  label: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 16,
    color: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#fff',
  },
  eyeIcon: {
    position: 'absolute',
    right: 0,
    padding: 10,
  },
  passwordHint: {
    fontSize: 12,
    color: '#fff',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default EditProfileScreen;
