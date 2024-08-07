import React, { useEffect, useState, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from './src/screen/SplashScreen';
import Onboarding from './src/screen/Onboarding';
import LoginScreen from './src/screen/LoginScreen'; // Make sure you have a LoginScreen component
import SignupScreen from './src/screen/SignupScreen';
import DashboardScreen from './src/screen/DashboardScreen';
import { AuthContext } from './src/screen/AuthProvider';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import ProfileScreen from './src/screen/ProfileScreen';
import EditProfileScreen from './src/screen/EditProfileScreen';
import CreateDelegasi from './src/screen/CreateDelegasi';
import DetailDelegasi from './src/screen/DetailDelegasi';
import ListUser from './src/screen/ListUser';
import UserDetail from './src/screen/UserDetail';
import EditDelegasi from './src/screen/EditDelegasi';
import ManageDivisions from './src/screen/ManageDivisions';

const Stack = createStackNavigator();

const App = () => {
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
  const { getItem: getToken } = useAsyncStorage('@token');
  const { getItem: getOnboardingStatus } = useAsyncStorage('@onboarded');
  const { getItem: getUserRole } = useAsyncStorage('role');
  const [checking, setIsChecking] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [role, setRole] = useState('');

  useEffect(() => {
    const checkStatus = async () => {
      const token = await getToken();
      const onboarded = await getOnboardingStatus();
      const userRole = await getUserRole();

      if (token !== null) {
        setIsLoggedIn(true);
      }
      if (onboarded !== null) {
        setHasOnboarded(true);
      }
      if (userRole !== null) {
        setRole(userRole);
      }

      setIsChecking(false);
    };

    checkStatus();
  }, [getToken, getOnboardingStatus, setIsLoggedIn, getUserRole]);

  if (checking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isLoggedIn ? (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ListUser" component={ListUser} options={{ headerShown: false }} />
            <Stack.Screen name="UserDetail" component={UserDetail} options={{ headerShown: false }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name='Signup' component={SignupScreen} options={{ headerShown: false }} />
            <Stack.Screen name="CreateDelegasi" component={CreateDelegasi} options={{ headerShown: false }} />
            <Stack.Screen name="DetailDelegasi" component={DetailDelegasi} options={{ headerShown: false }} />
            <Stack.Screen name="EditDelegasi" component={EditDelegasi} options={{ headerShown: false }} />
            <Stack.Screen name="ManageDivisions" component={ManageDivisions} options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
            {!hasOnboarded && <Stack.Screen name="Onboarding" component={Onboarding} options={{ headerShown: false }} />}
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name='Signup' component={SignupScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
