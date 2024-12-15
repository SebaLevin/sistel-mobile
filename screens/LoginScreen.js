// screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Button, TextInput, Text, StyleSheet, ActivityIndicator  } from 'react-native';
import axios from 'axios';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    if (!username || !password) {
        alert('Por favor, ingrese el nombre de usuario y la contraseña');
        return;
      }

      setLoading(true); 
      setError(null); 

      try {
       
        const response = await axios.post('http://pibeapk.dyndns.org:2222/api/login', {
          username,
          password,
        });
  
        if (response.data) {

          console.log('Login successful', response.data);
          

          navigation.navigate('Buscar');
        } else {
          setError('Invalid credentials');
        }
      } catch (err) {
        console.error('Login failed', err);
        setError('Login failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };
  

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Nombre de usuario"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 10 },
  title: { fontSize: 24, marginBottom: 20 },
  input: { borderWidth: 1, marginBottom: 10, padding: 8 },
});

export default LoginScreen;
