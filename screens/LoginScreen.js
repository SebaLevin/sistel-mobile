// screens/LoginScreen.js
import React, { useState, useEffect } from 'react';
import { View, Button, TextInput, Text, StyleSheet, ActivityIndicator, TouchableOpacity  } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dns, setDns] = useState('pibeapk.dyndns.org');
  const [port, setPort] = useState('2222');
  const [showConfig, setShowConfig] = useState(true); // Por defecto mostrar si no hay config
  const [configLoaded, setConfigLoaded] = useState(false);
  const [rememberCredentials, setRememberCredentials] = useState(false);

  // Cargar configuración guardada al montar el componente
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const savedDns = await AsyncStorage.getItem('app_dns');
      const savedPort = await AsyncStorage.getItem('app_port');
      const savedUsername = await AsyncStorage.getItem('saved_username');
      const savedPassword = await AsyncStorage.getItem('saved_password');
      const savedRemember = await AsyncStorage.getItem('remember_credentials');
      
      if (savedDns) setDns(savedDns);
      if (savedPort) setPort(savedPort);
      
      // Cargar credenciales guardadas
      if (savedRemember === 'true' && savedUsername && savedPassword) {
        setUsername(savedUsername);
        setPassword(savedPassword);
        setRememberCredentials(true);
      }
      
      // Si ya hay configuración guardada, colapsar el panel
      if (savedDns && savedPort) {
        setShowConfig(false);
      }
      setConfigLoaded(true);
    } catch (error) {
      console.error('Error loading config:', error);
      setConfigLoaded(true);
    }
  };

  const saveConfig = async () => {
    try {
      await AsyncStorage.setItem('app_dns', dns);
      await AsyncStorage.setItem('app_port', port);
      alert('Configuración guardada exitosamente');
      setShowConfig(false);
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Error al guardar la configuración');
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
        alert('Por favor, ingrese el nombre de usuario y la contraseña');
        return;
      }

      setLoading(true); 
      setError(null); 

      try {
        const apiUrl = `http://${dns}:${port}/api/login`;
        const response = await axios.post(apiUrl, {
          username,
          password,
        });
  
        // Validar que el backend devuelva un array con empresas (usuario válido)
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          
          console.log('Login successful', response.data);
          
          // Guardar datos del login
          await AsyncStorage.setItem('logged_username', username);
          await AsyncStorage.setItem('login_data', JSON.stringify(response.data));
          
          // Guardar o eliminar credenciales según la opción
          if (rememberCredentials) {
            await AsyncStorage.setItem('saved_username', username);
            await AsyncStorage.setItem('saved_password', password);
            await AsyncStorage.setItem('remember_credentials', 'true');
          } else {
            await AsyncStorage.removeItem('saved_username');
            await AsyncStorage.removeItem('saved_password');
            await AsyncStorage.setItem('remember_credentials', 'false');
          }
          
          navigation.navigate('Buscar');
        } else {
          // El backend devolvió array vacío = credenciales inválidas
          setError('Credenciales inválidas. Verifique usuario y contraseña.');
        }
      } catch (err) {
        console.error('Login failed', err);
        if (err.response && err.response.status === 401) {
          setError('Credenciales inválidas.');
        } else if (err.response && err.response.status === 404) {
          setError('Usuario no encontrado.');
        } else {
          setError('Error de conexión. Verifique la configuración del servidor.');
        }
      } finally {
        setLoading(false);
      }
    };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      
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
      
      {/* Checkbox para recordar credenciales */}
      <TouchableOpacity 
        style={styles.rememberContainer}
        onPress={() => setRememberCredentials(!rememberCredentials)}
      >
        <View style={[styles.checkbox, rememberCredentials && styles.checkboxChecked]}>
          {rememberCredentials && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.rememberText}>Recordar usuario y contraseña</Text>
      </TouchableOpacity>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Login" onPress={handleLogin} />
      )}

      <TouchableOpacity 
        style={styles.configButton} 
        onPress={() => setShowConfig(!showConfig)}
      >
        <Text style={styles.configButtonText}>
          {showConfig ? '▲ Ocultar configuración' : '▼ Configurar servidor'}
        </Text>
      </TouchableOpacity>

      {showConfig && (
        <View style={styles.configContainer}>
          <Text style={styles.configTitle}>Configuración del servidor</Text>
          
          <Text style={styles.label}>DNS/Host:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: pibeapk.dyndns.org"
            value={dns}
            onChangeText={setDns}
          />
          
          <Text style={styles.label}>Puerto:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 2222"
            value={port}
            onChangeText={setPort}
            keyboardType="numeric"
          />
          
          <Text style={styles.previewText}>
            URL: http://{dns}:{port}/api/login
          </Text>
          
          <Button title="Guardar configuración" onPress={saveConfig} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 20,
    backgroundColor: '#f5f5f5' 
  },
  title: { 
    fontSize: 28, 
    marginBottom: 20, 
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333'
  },
  input: { 
    borderWidth: 1, 
    marginBottom: 10, 
    padding: 12,
    backgroundColor: 'white',
    borderColor: '#ddd',
    borderRadius: 5
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center'
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rememberText: {
    fontSize: 14,
    color: '#333',
  },
  configButton: {
    marginTop: 20,
    padding: 10,
    alignItems: 'center'
  },
  configButtonText: {
    color: '#007AFF',
    fontSize: 14
  },
  configContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  configTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333'
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#555'
  },
  previewText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5
  }
});

export default LoginScreen;
