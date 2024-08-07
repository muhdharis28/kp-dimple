import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import config from './config'; // Import the configuration
import { Picker } from '@react-native-picker/picker';
import LinearGradient from 'react-native-linear-gradient';
import tw from 'twrnc';

const UserDetail = ({ route, navigation }) => {
    const { userId } = route.params;
    const [user, setUser] = useState(null);
    const [role, setRole] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');

    useEffect(() => {
        fetchUserDetails();
    }, []);

    const fetchUserDetails = async () => {
        try {
            const response = await axios.get(`${config.apiBaseUrl}/user/${userId}`);
            const userData = response.data.data;
            setUser(userData);
            setRole(userData.role || ''); // Set default role to empty string if null
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    const handleSave = async () => {
        try {
            await axios.put(`${config.apiBaseUrl}/user/${userId}`, { role });
            showModal('Berhasil', 'Peran pengguna berhasil diperbarui');
        } catch (error) {
            console.error('Error updating user role:', error);
            showModal('Error', 'Gagal memperbarui peran pengguna');
        }
    };

    const showModal = (title, message) => {
        setModalTitle(title);
        setModalMessage(message);
        setModalVisible(true);
    };

    const divisionColors = {
        Supervisor: '#424F5E',
        'Senior Officer': '#7954F6',
        'Technical Officer': '#FFAE00',
        'Field Officer': '#11D69F',
        'Community Provider': '#663F70',
        Internship: '#EE3862',
    };

    if (!user) {
        return (
            <View style={tw`flex-1 justify-center items-center`}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <ScrollView style={tw`flex-1 bg-white`}>
            <LinearGradient 
                colors={['#002D7A', '#0052D4']}
                style={tw`rounded-b-[200px] pb-10 pt-8 items-center relative`}
            >
                <View style={tw`flex-row justify-between items-center px-5 w-full`}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Icon name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={tw`text-white text-xl font-bold`}>Detail Pengguna</Text>
                    <TouchableOpacity onPress={handleSave}>
                        <Icon name="checkmark" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
                <View style={tw`items-center mt-10`}>
                    <Image
                        source={user.profileImageUrl ? { uri: `${config.apiBaseUrl}${user.profileImageUrl}` } : require('../assets/default-profile.png')}
                        style={tw`w-24 h-24 rounded-full mb-3`}
                    />
                </View>
            </LinearGradient>
            <View style={tw`p-5 items-center`}>
                <Text style={tw`text-black text-2xl font-bold mb-2`}>{user.username}</Text>
                <Text style={tw`text-gray-600 text-center mb-6 text-sm px-4`}>{user.description}</Text>
                <View style={tw`w-full mb-4 px-4`}>
                    <View style={tw`flex-row items-center mb-2`}>
                        <Icon name="mail" size={20} color="grey" style={tw`mr-3`} />
                        <Text style={tw`text-base ml-2`}>Email</Text>
                        <Text style={tw`text-base text-black ml-auto`}>{user.email}</Text>
                    </View>
                    <View style={tw`flex-row items-center mb-2`}>
                        <Icon name="briefcase" size={20} color="grey" style={tw`mr-3`} />
                        <Text style={tw`text-base ml-2`}>Divisi</Text>
                        <Text style={[tw`text-base ml-auto`,{ color: divisionColors[user.division.name] || '#000' }]}>{user.division ? user.division.name : 'N/A'}</Text>
                    </View>
                    <View style={tw`flex-row items-center mb-2`}>
                        <Icon name="person" size={20} color="grey" style={tw`mr-3`} />
                        <Text style={tw`text-base ml-2`}>Peran</Text>
                        <Picker
                            selectedValue={role}
                            style={tw`flex-1 ml-auto text-black`}
                            onValueChange={(itemValue) => setRole(itemValue)}
                        >
                            <Picker.Item label="Pilih peran..." value="" />
                            <Picker.Item label="Admin" value="admin" />
                            <Picker.Item label="Verifikator" value="delegation_verificator" />
                            <Picker.Item label="Penerima" value="delegation_handler" />
                        </Picker>
                    </View>
                </View>
            </View>
            <Modal
                transparent={true}
                animationType="fade"
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                    if (modalTitle === 'Berhasil') {
                        navigation.goBack();
                    }
                }}
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
                            onPress={() => {
                                setModalVisible(false);
                                if (modalTitle === 'Berhasil') {
                                    navigation.goBack();
                                }
                            }}
                        >
                            <Text style={tw`text-white text-base text-center`}>Tutup</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

export default UserDetail;
