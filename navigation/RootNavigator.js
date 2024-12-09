import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import LogoAndButton from '../components/LogoAndButton'; // Component with logo and button
import LoginScreen from '../screens/LoginScreen'; // Login screen
import SearchScreen from '../screens/SearchScreen'; // The search screen
import ProductDetailScreen from '../screens/ProductDetailScreen'; // Product detail screen

const Stack = createStackNavigator();

const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Inicio">
        {/* Pantalla de inicio muestra el logo y botón */}
        <Stack.Screen 
          name="Inicio" 
          component={LogoAndButton} 
          options={{ headerShown: false }} // Oculta el encabezado para esta pantalla
        />
        
        {/* Pantalla de inicio de sesión */}
        <Stack.Screen name="Iniciar Sesion" component={LoginScreen} />
        
        {/* Pantalla de búsqueda después de iniciar sesión */}
        <Stack.Screen name="Buscar" component={SearchScreen} />
        
        {/* Pantalla de detalle del producto */}
        <Stack.Screen name="Detalle del Producto" component={ProductDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
