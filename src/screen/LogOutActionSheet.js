import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ActionSheet from 'react-native-actions-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const LogoutActionSheet = () => {
  const actionSheetRef = useRef(null);
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('@token');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error clearing token:', error);
    } finally {
      actionSheetRef.current?.hide();
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => actionSheetRef.current?.show()}
        style={styles.signOutButton}
      >
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>

      <ActionSheet ref={actionSheetRef}>
        <View style={styles.actionSheetContent}>
          <Text style={styles.title}>Are you sure you want to logout?</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={handleLogout} style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Logout</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => actionSheetRef.current?.hide()}
              style={[styles.actionButton, styles.cancelButton]}
            >
              <Text style={[styles.actionButtonText, styles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ActionSheet>
    </>
  );
};

const styles = StyleSheet.create({
  signOutButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionSheetContent: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  cancelButtonText: {
    color: '#007AFF',
  },
});

export default LogoutActionSheet;
