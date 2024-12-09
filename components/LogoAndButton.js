// components/LogoAndButton.js
import React from 'react';
import { View, Text, Image, Button, StyleSheet } from 'react-native';
import logo from '../assets/image.png'; // Adjust the path if necessary

const LogoAndButton = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.image} />
      <Text style={styles.title}>Bienvenido</Text>
      <Button 
        title="Iniciar Sesion" 
        onPress={() => navigation.navigate('Iniciar Sesion')} // Navigate to Login screen
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 200, 
    height: 200,
    marginVertical: 20, 
  },
  title: {
    fontSize: 24,
    padding: 10,
    fontWeight: 'bold',
  },
});

export default LogoAndButton;

