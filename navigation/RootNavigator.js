import React from 'react';
import { Pressable, Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import LogoAndButton from '../components/LogoAndButton';
import LoginScreen from '../screens/LoginScreen';
import SearchScreen from '../screens/SearchScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import { navigationRef } from '../lib/navigationRef';
import { logout } from '../lib/auth';

const Stack = createStackNavigator();

const LogoutButton = () => (
  <Pressable
    onPress={logout}
    style={{ paddingHorizontal: 12, paddingVertical: 6 }}
    hitSlop={8}
  >
    <Text style={{ color: '#007AFF', fontSize: 16, fontWeight: '600' }}>Salir</Text>
  </Pressable>
);

const RootNavigator = ({ initialRouteName = 'Inicio' }) => {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName={initialRouteName}>
        <Stack.Screen
          name="Inicio"
          component={LogoAndButton}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Iniciar Sesion" component={LoginScreen} />
        <Stack.Screen
          name="Buscar"
          component={SearchScreen}
          options={{ headerRight: () => <LogoutButton />, headerLeft: () => null }}
        />
        <Stack.Screen
          name="Detalle del Producto"
          component={ProductDetailScreen}
          options={{ headerRight: () => <LogoutButton /> }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
