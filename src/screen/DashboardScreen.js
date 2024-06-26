import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import CustomCheckbox from './CustomCheckbox';

const messages = [
  {
    id: '1',
    name: 'Pak Dirut',
    date: '19 Dec',
    subject: 'Requesting event for 28 Dec 2024',
    content: 'I am requesting blablablablablablablablablablablablablablablablablablablabla',
    avatar: require('../assets/profilepicture.png')
  },
  {
    id: '2',
    name: 'Pak Dirut',
    date: '19 Dec',
    subject: 'Requesting event for 28 Dec 2024',
    content: 'I am requesting blablablablablablablablablablablablablablablablablablablabla',
    avatar: require('../assets/profilepicture.png')
  },
  {
    id: '3',
    name: 'Pak Dirut',
    date: '19 Dec',
    subject: 'Requesting event for 28 Dec 2024',
    content: 'I am requesting blablablablablablablablablablablablablablablablablablablabla',
    avatar: require('../assets/profilepicture.png')
  }
];

const employees = [
  {
    value: 'junior',
    user: {
      name: 'Junior Garcia',
      avatar: 'https://avatars.githubusercontent.com/u/30373425?v=4',
      username: 'jrgarciadev',
      url: 'https://twitter.com/jrgarciadev',
      role: 'Software Developer',
      status: 'Active',
    }
  },
  {
    value: 'johndoe',
    user: {
      name: 'John Doe',
      avatar: 'https://i.pravatar.cc/300?u=a042581f4e29026707d',
      username: 'johndoe',
      url: '#',
      role: 'Product Designer',
      status: 'Vacation',
    }
  },
  {
    value: 'zoeylang',
    user: {
      name: 'Zoey Lang',
      avatar: 'https://i.pravatar.cc/300?u=a042581f4e29026704d',
      username: 'zoeylang',
      url: '#',
      role: 'Technical Writer',
      status: 'Out of office',
    }
  },
  {
    value: 'william',
    user: {
      name: 'William Howard',
      avatar: 'https://i.pravatar.cc/300?u=a048581f4e29026701d',
      username: 'william',
      url: '#',
      role: 'Sales Manager',
      status: 'Active',
    }
  }
];

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState('All');
  const [isEditing, setIsEditing] = useState(false);
  const [groupSelected, setGroupSelected] = useState([]);

  const handleEditPress = () => {
    setIsEditing(!isEditing);
  };

  const handleCheckboxPress = (value) => {
    if (groupSelected.includes(value)) {
      setGroupSelected(groupSelected.filter(item => item !== value));
    } else {
      setGroupSelected([...groupSelected, value]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>All inbox</Text>
        <Image source={require('../assets/profilepicture.png')} style={styles.profileImage} />
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={25} color="white" style={styles.searchIcon} />
        <TextInput placeholder="Search" placeholderTextColor="white" style={styles.searchInput} />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleEditPress}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {isEditing && (
        <View style={styles.editContainer}>
          <Text style={styles.editTitle}>Select employees</Text>
          {employees.map(employee => (
            <CustomCheckbox
              key={employee.value}
              user={employee.user}
              isChecked={groupSelected.includes(employee.value)}
              onPress={() => handleCheckboxPress(employee.value)}
            />
          ))}
          <Text style={styles.selectedText}>
            Selected: {groupSelected.join(", ")}
          </Text>
        </View>
      )}

      {!isEditing && (
        <>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, selectedTab === 'All' && styles.tabButtonActive]}
              onPress={() => setSelectedTab('All')}
            >
              <Text style={[styles.tabButtonText, selectedTab === 'All' && styles.tabButtonTextActive]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, selectedTab === 'Process' && styles.tabButtonActive]}
              onPress={() => setSelectedTab('Process')}
            >
              <Text style={[styles.tabButtonText, selectedTab === 'Process' && styles.tabButtonTextActive]}>Process</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, selectedTab === 'Complete' && styles.tabButtonActive]}
              onPress={() => setSelectedTab('Complete')}
            >
              <Text style={[styles.tabButtonText, selectedTab === 'Complete' && styles.tabButtonTextActive]}>Complete</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.messageContainer}>
                <Image source={item.avatar} style={styles.avatar} />
                <View style={styles.messageContent}>
                  <Text style={styles.messageTitle}>{item.name}</Text>
                  <Text style={styles.messageSubject}>{item.subject}</Text>
                  <Text style={styles.messageText}>{item.content}</Text>
                </View>
                <Text style={styles.messageDate}>{item.date}</Text>
              </View>
            )}
          />

          <TouchableOpacity style={styles.createButton}>
            <Icon name="pencil" size={20} color="#fff" />
            <Text style={styles.createButtonText}>Create</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#002D7A',
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 20,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 20,
    marginRight: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    borderWidth: 1,
    backgroundColor: '#002D7A',
    borderRadius: 50,
    marginBottom: 20,
    height: 50,
    width: '95%',
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
    marginLeft: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: 'white',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 2,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    borderBottomColor: '#002D7A',
    borderBottomWidth: 3,
  },
  tabButtonText: {
    fontSize: 21,
    fontWeight: 'bold',
    color: 'black',
  },
  tabButtonTextActive: {
    color: 'black',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  buttonText: {
    color: '#002D7A',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 30,
    textDecorationLine: "underline",
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 25,
    marginRight: 15,
  },
  messageContent: {
    flex: 1,
  },
  messageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#002D7A',
    marginBottom: 5,
  },
  messageSubject: {
    fontSize: 14,
    color: 'black',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  messageText: {
    fontSize: 14,
    color: 'black',
  },
  messageDate: {
    fontSize: 12,
    color: 'black',
    bottom: 31,
    fontWeight: 'bold',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: 20,
    bottom: 20,
    justifyContent: 'center',
    backgroundColor: '#002D7A',
    paddingVertical: 15,
    borderRadius: 30,
    bottom: 60,
    width: '40%',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 20,
    marginLeft: 10,
    bottom: 2,
    fontWeight: 'bold',
  },
  editContainer: {
    marginTop: 20,
  },
  editTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#002D7A',

  },
  selectedText: {
    marginTop: 10,
    color: '#002D7A',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;
