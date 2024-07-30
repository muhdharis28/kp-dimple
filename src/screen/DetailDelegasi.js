import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking, FlatList, Alert, Dimensions, ActivityIndicator, TextInput, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from './config';
import ResponseDialog from './ResponseDialog';
import { Picker } from '@react-native-picker/picker';

const defaultProfileImage = require('../assets/default-profile.png'); // Adjust the path as needed

const { width } = Dimensions.get('window');

const DetailDelegasi = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { eventId } = route.params;
  const [eventDetails, setEventDetails] = useState({});
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responseDialogVisible, setResponseDialogVisible] = useState(false);
  const [userId, setUserId] = useState(null);
  const [savingResponse, setSavingResponse] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionReasonDialogVisible, setRejectionReasonDialogVisible] = useState(false);
  const [isRejectionReasonVisible, setIsRejectionReasonVisible] = useState(false);
  const [divisions, setDivisions] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState('');
  const [persons, setPersons] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState('');
  const [changeHandlerDialogVisible, setChangeHandlerDialogVisible] = useState(false);

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
      Alert.alert('Success', 'Event accepted successfully!');
      fetchEventDetails(); // Refresh event details
    } catch (error) {
      console.error('Error accepting event:', error);
      Alert.alert('Error', 'Error accepting event');
    }
  };

  const handleReject = async () => {
    setRejectionReasonDialogVisible(true);
  };

  const handleRejectionSubmit = async () => {
    try {
      await axios.post(`${config.apiBaseUrl}/event/reject/${eventId}`, {
        reason: rejectionReason
      });
      Alert.alert('Success', 'Event rejected successfully!');
      fetchEventDetails(); // Refresh event details
      setRejectionReasonDialogVisible(false); // Close rejection reason dialog
    } catch (error) {
      console.error('Error rejecting event:', error);
      Alert.alert('Error', 'Error rejecting event');
    }
  };

  const handleFixRejection = async () => {
    try {
      await axios.post(`${config.apiBaseUrl}/event/fix/${eventId}`);
      Alert.alert('Success', 'Rejection fixed successfully!');
      setRejectionReason('');
      fetchEventDetails(); // Refresh event details
    } catch (error) {
      console.error('Error fixing rejection:', error);
      Alert.alert('Error', 'Error fixing rejection');
    }
  };

  const handleConfirmHandler = async () => {
    try {
      await axios.post(`${config.apiBaseUrl}/event/confirm/${eventId}`);
      Alert.alert('Success', 'Event confirmed successfully!');
      fetchEventDetails(); // Refresh event details
    } catch (error) {
      console.error('Error confirming event:', error);
      Alert.alert('Error', 'Error confirming event');
    }
  };

  const handleRejectHandler = async () => {
    try {
      await axios.post(`${config.apiBaseUrl}/event/reject-handler/${eventId}`);
      Alert.alert('Success', 'Event rejected successfully!');
      fetchEventDetails(); // Refresh event details
    } catch (error) {
      console.error('Error rejecting event:', error);
      Alert.alert('Error', 'Error rejecting event');
    }
  };

  const handleDisetujui = async () => {
    try {
      await axios.post(`${config.apiBaseUrl}/event/Disetujui/${eventId}`);
      Alert.alert('Success', 'Disetujui!');
      fetchEventDetails(); // Refresh event details
    } catch (error) {
      console.error('Error confirming event:', error);
      Alert.alert('Error', 'Error confirming event');
    }
  };

  const handleDitolak = async () => {
    setResponseDialogVisible(true);
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
        status: 'Butuh Verifikasi Penerima'
      });
      Alert.alert('Success', 'Handler changed successfully!');
      setChangeHandlerDialogVisible(false);
      fetchEventDetails(); // Refresh event details
    } catch (error) {
      console.error('Error changing handler:', error);
      Alert.alert('Error', 'Error changing handler');
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

  const toggleRejectionReasonVisibility = () => {
    setIsRejectionReasonVisible(!isRejectionReasonVisible);
  };

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Delegasi</Text>
        {userRole === 'admin' && eventDetails.status === 'Verifikasi Ditolak' && (
          <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
            <Icon name="create-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.headerContent}>
        <Image
          source={eventDetails.profileImageUrl ? { uri: `${config.apiBaseUrl}${eventDetails.profileImageUrl}` } : defaultProfileImage}
          style={styles.profileImage}
        />
        <View>
          <Text style={styles.to}>To: {eventDetails.toPerson?.username}</Text>
          <Text style={styles.position}>{eventDetails.toPerson?.email}</Text>
          <View style={styles.badgeContainer}>
            <Text style={styles.badge}>{eventDetails.toDivision?.name}</Text>
          </View>
        </View>
        <Text style={styles.date}>{new Date(eventDetails.date).toLocaleDateString()}</Text>
      </View>
      {userRole === 'admin' && eventDetails.status === 'Penerima Menolak' && (
        <TouchableOpacity
          style={styles.changeHandlerButton}
          onPress={() => setChangeHandlerDialogVisible(true)}
        >
          <Text style={styles.changeHandlerButtonText}>Change Handler</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.title}>{eventDetails.title}</Text>
      <Text style={styles.description}>{eventDetails.description}</Text>
      {eventDetails.descriptionImageUrl && (
        <Image source={{ uri: `${config.apiBaseUrl}${eventDetails.descriptionImageUrl}` }} style={styles.descriptionImage} />
      )}

      <View style={styles.fileContainer}>
        {eventDetails.eventFileUrls && JSON.parse(eventDetails.eventFileUrls).map((file, index) => (
          <TouchableOpacity key={index} style={styles.fileButton} onPress={() => handleFileOpen(file.url)}>
            <Icon name="document-outline" size={24} color="red" />
            <Text style={styles.fileText}>{file.originalName}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {userRole === 'delegation_verificator' && ['Perlu Verifikasi'].includes(eventDetails.status) && (
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}

      {eventDetails.status === 'Verifikasi Ditolak' && (
        <>
          <View style={styles.rejectionReasonContainer}>
            <Text style={styles.rejectionReasonTitle}>Rejection Reason:</Text>
            <Text style={styles.rejectionReasonText}>{rejectionReason}</Text>
            {userRole === 'admin' && (
              <TouchableOpacity style={styles.checklistButton} onPress={handleFixRejection}>
                <Icon name="checkmark-circle-outline" size={24} color="green" />
              </TouchableOpacity>
            )}
          </View>
        </>
      )}

      {userRole === 'delegation_handler' && eventDetails.status === 'Butuh Verifikasi Penerima' && (
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmHandler}>
            <Text style={styles.buttonText}>Take</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectHandlerButton} onPress={handleRejectHandler}>
            <Text style={styles.buttonText}>Deny</Text>
          </TouchableOpacity>
        </View>
      )}

      {userRole === 'delegation_handler' && eventDetails.status === 'Penerima Setuju' && (
        <TouchableOpacity style={styles.responseButton} onPress={() => setResponseDialogVisible(true)}>
          <Icon name="add-circle-outline" size={24} color="#007AFF" />
          <Text style={styles.responseText}>Add Response</Text>
        </TouchableOpacity>
      )}

      {userRole === 'delegation_handler' && eventDetails.status === 'Penerima Setuju' && (
        <Text style={styles.sectionTitle}>Responses</Text>
      )}

      {userRole === 'delegation_verificator' && eventDetails.status === 'Penerima Setuju' && (
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.DitolakButton} onPress={handleDitolak}>
            <Text style={styles.buttonText}>Ditolak</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.DisetujuiButton} onPress={handleDisetujui}>
            <Text style={styles.buttonText}>Disetujui</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={responses}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <View style={styles.responseContainer}>
            <View style={styles.responseHeader}>
              <Image
                source={item.user?.profileImageUrl ? { uri: `${config.apiBaseUrl}${item.user.profileImageUrl}` } : defaultProfileImage}
                style={styles.responseProfileImage}
              />
              <View>
                <Text style={styles.responseFrom}>{item.user?.username || 'Unknown User'}</Text>
                <Text style={styles.responseEmail}>From: {item.user?.email || 'Unknown Email'}</Text>
              </View>
            </View>
            {item.responseImageUrl && (
              <Image source={{ uri: `${config.apiBaseUrl}${item.responseImageUrl}` }} style={styles.responseImage} />
            )}
            <Text style={styles.responseDescription}>{item.responseText}</Text>
            <View style={styles.responseFileContainer}>
              {item.responseFileUrls && JSON.parse(item.responseFileUrls).map((file, index) => (
                <TouchableOpacity key={index} style={styles.responseFileButton} onPress={() => handleFileOpen(file.url)}>
                  <Icon name="document-outline" size={24} color="#007AFF" />
                  <Text style={styles.responseFileText}>{file.originalName || '-'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
      />

      {responseDialogVisible && (
        <ResponseDialog
          visible={responseDialogVisible}
          onClose={() => setResponseDialogVisible(false)}
          eventId={eventId}
          userId={userId}
          onResponseSaved={handleResponseSaved}
        />
      )}

      {rejectionReasonDialogVisible && (
        <View style={styles.rejectionDialogContainer}>
          <View style={styles.rejectionDialog}>
            <Text style={styles.rejectionDialogTitle}>Rejection Reason</Text>
            <TextInput
              style={styles.rejectionDialogInput}
              placeholder="Enter reason for rejection"
              value={rejectionReason}
              onChangeText={setRejectionReason}
            />
            <View style={styles.rejectionDialogButtons}>
              <TouchableOpacity
                style={[styles.dialogButton, styles.dialogCancelButton]}
                onPress={() => setRejectionReasonDialogVisible(false)}
              >
                <Text style={styles.dialogButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogButton, styles.dialogSubmitButton]}
                onPress={handleRejectionSubmit}
              >
                <Text style={styles.dialogButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {savingResponse && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.savingText}>Saving response...</Text>
        </View>
      )}

      <Modal
        visible={changeHandlerDialogVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setChangeHandlerDialogVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Handler</Text>
            <Picker
              selectedValue={selectedDivision}
              onValueChange={handleDivisionChange}
              style={styles.picker}
            >
              <Picker.Item label="Select Division" value="" />
              {divisions.map((division) => (
                <Picker.Item key={division.id} label={division.name} value={division.id} />
              ))}
            </Picker>
            <Picker
              selectedValue={selectedPerson}
              onValueChange={(itemValue) => setSelectedPerson(itemValue)}
              style={styles.picker}
              enabled={selectedDivision !== ''}
            >
              <Picker.Item label="Select Person" value="" />
              {persons.map((person) => (
                <Picker.Item key={person.id} label={person.username} value={person.id} />
              ))}
            </Picker>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.dialogButton, styles.dialogCancelButton]}
                onPress={() => setChangeHandlerDialogVisible(false)}
              >
                <Text style={styles.dialogButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogButton, styles.dialogSubmitButton]}
                onPress={handleChangeHandlerSubmit}
              >
                <Text style={styles.dialogButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    paddingRight: 10,
  },
  editButton: {
    paddingLeft: 10,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  position: {
    fontSize: 14,
    color: 'red',
  },
  to: {
    fontSize: 14,
    color: '#007AFF',
  },
  date: {
    fontSize: 14,
    color: '#000',
    marginLeft: 'auto',
  },
  changeHandlerButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 20,
  },
  changeHandlerButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  descriptionImage: {
    width: width * 0.9,
    height: 200,
    marginBottom: 20,
    alignSelf: 'center',
    borderRadius: 5,
  },
  fileContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderColor: '#007AFF',
    borderWidth: 1,
    borderRadius: 5,
    marginRight: 10,
    marginBottom: 10,
  },
  fileText: {
    marginLeft: 10,
    color: '#007AFF',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  acceptButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  rejectHandlerButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  fixButton: {
    backgroundColor: 'orange',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  DitolakButton: {
    backgroundColor: 'yellow',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  DisetujuiButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  responseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderColor: '#007AFF',
    borderWidth: 1,
    borderRadius: 5,
    justifyContent: 'center',
    marginBottom: 20,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  badge: {
    backgroundColor: '#002D7A',
    color: 'white',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 5,
  },
  responseText: {
    marginLeft: 10,
    color: '#007AFF',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  responseContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  responseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  responseProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  responseFrom: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  responseEmail: {
    fontSize: 14,
    color: '#007AFF',
  },
  responseDescription: {
    fontSize: 14,
    marginBottom: 10,
  },
  responseImage: {
    width: width * 0.9,
    height: 200,
    marginBottom: 10,
    alignSelf: 'center',
    borderRadius: 5,
  },
  responseFileContainer: {
    flexDirection: 'column',
  },
  responseFileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  responseFileText: {
    marginLeft: 10,
    color: '#007AFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
  },
  rejectionReasonContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#ffe6e6',
    borderRadius: 5,
    position: 'relative',
  },
  rejectionReasonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#ff0000',
  },
  rejectionReasonText: {
    fontSize: 16,
    color: '#ff0000',
  },
  checklistButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  rejectionDialogContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectionDialog: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  rejectionDialogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  rejectionDialogInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  rejectionDialogButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  dialogButton: {
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  dialogCancelButton: {
    backgroundColor: '#ccc',
  },
  dialogSubmitButton: {
    backgroundColor: '#007AFF',
  },
  dialogButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
});

export default DetailDelegasi;
