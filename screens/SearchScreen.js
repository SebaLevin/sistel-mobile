// screens/SearchScreen.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet, TouchableOpacity, Keyboard, Pressable, Modal, Alert, InteractionManager } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from '@react-navigation/native';

const SearchScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dns, setDns] = useState('pibeapk.dyndns.org');
  const [port, setPort] = useState('2222');
  const searchInputRef = useRef(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  // Cargar configuración al montar
  useEffect(() => {
    loadConfig();
  }, []);

  // Foco automático en el SearchBar cada vez que la pantalla recibe foco
  useFocusEffect(
    useCallback(() => {
      // Esperar a que las animaciones de navegación terminen
      const interactionPromise = InteractionManager.runAfterInteractions(() => {
        // Usar un pequeño delay adicional para asegurar que el teclado pueda abrirse
        setTimeout(() => {
          if (searchInputRef.current) {
            searchInputRef.current.focus();
          }
        }, 50);
      });
      
      return () => interactionPromise.cancel();
    }, [])
  );

  const loadConfig = async () => {
    try {
      const savedDns = await AsyncStorage.getItem('app_dns');
      const savedPort = await AsyncStorage.getItem('app_port');
      
      if (savedDns) setDns(savedDns);
      if (savedPort) setPort(savedPort);
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  // Abrir escáner de código de barras
  const openScanner = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('Permiso denegado', 'Se necesita acceso a la cámara para escanear códigos de barras');
        return;
      }
    }
    setScanned(false);
    setShowScanner(true);
  };

  // Cerrar escáner y restaurar foco
  const closeScanner = () => {
    setShowScanner(false);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  // Manejar código escaneado
  const handleBarcodeScanned = async ({ type, data }) => {
    if (scanned) return; // Evitar múltiples escaneos
    
    setScanned(true);
    setShowScanner(false);
    setQuery(data);
    
    // Buscar automáticamente con el código escaneado
    await searchProductByCode(data);
    
    // Restaurar foco después de cerrar el escáner
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  // Buscar producto por código escaneado
  const searchProductByCode = async (code) => {
    setLoading(true);
    setError('');

    try {
      const apiUrl = `http://${dns}:${port}/api/search?searchTerm=${code}`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (response.ok && data && data.length > 0) {
        // Si hay exactamente 1 producto, ir directo al detalle
        if (data.length === 1) {
          navigation.navigate('Detalle del Producto', { product: data[0] });
          setQuery('');
          return;
        }
        setResults(data);
      } else {
        setError('Producto no encontrado');
        setResults([]);
        // Volver a hacer foco en el SearchBar
        searchInputRef.current?.focus();
      }
    } catch (err) {
      setError('Error de conexión. Verifique la configuración del servidor.');
      // Volver a hacer foco en el SearchBar
      searchInputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };


  const searchProducts = async () => {
    if (!query.trim()) return; 

    setLoading(true); 
    setError(''); 

    try {
      const apiUrl = `http://${dns}:${port}/api/search?searchTerm=${query}`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (response.ok) {
        // Si hay exactamente 1 producto, ir directo al detalle
        if (data && data.length === 1) {
          navigation.navigate('Detalle del Producto', { product: data[0] });
          setQuery(''); // Limpiar búsqueda
          return;
        }
        if (data && data.length > 0) {
          setResults(data);
        } else {
          setError('No se encontraron productos');
          setResults([]);
          // Volver a hacer foco en el SearchBar
          searchInputRef.current?.focus();
        }
      } else {
        setError('No se encontraron productos');
        // Volver a hacer foco en el SearchBar
        searchInputRef.current?.focus();
      }
    } catch (err) {
      setError('Error de conexión. Verifique la configuración del servidor.');
      // Volver a hacer foco en el SearchBar
      searchInputRef.current?.focus();
    } finally {
      setLoading(false); 
    }
  };

  // Handle the "Enter" key press
  const handleSubmitEditing = () => {
    searchProducts();
    Keyboard.dismiss();  
  };


  const handleItemPress = (product) => {
    navigation.navigate('Detalle del Producto', { product });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          ref={searchInputRef}
          style={styles.input}
          placeholder="Buscar producto"
          value={query}
          onChangeText={(text) => setQuery(text)}
          onSubmitEditing={handleSubmitEditing}  
          returnKeyType="search"
          autoFocus={true}
        />

        {/* Search Icon */}
        <Pressable onPress={searchProducts} style={styles.searchIcon}>
          <Ionicons name="search" size={24} color="gray" />
        </Pressable>

        {/* Barcode Scanner Icon */}
        <Pressable onPress={openScanner} style={styles.scanIcon}>
          <Ionicons name="barcode-outline" size={28} color="#007AFF" />
        </Pressable>
      </View>

      {loading && <Text>Buscando...</Text>}
      {error && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        data={results}
        keyExtractor={(item) => item.numint.toString()} 
        renderItem={({ item }) => (
          <Pressable onPress={() => handleItemPress(item)} style={styles.productItem}>
            <Text style={styles.productTitle}>{item.Concepto}</Text>
            <Text>{item.Marca || 'N/A'}</Text>
          </Pressable>
        )}
      />

      {/* Modal del escáner de código de barras */}
      <Modal
        visible={showScanner}
        animationType="slide"
        onRequestClose={closeScanner}
      >
        <View style={styles.scannerContainer}>
          <View style={styles.scannerHeader}>
            <Text style={styles.scannerTitle}>Escanear Código de Barras</Text>
            <Pressable onPress={closeScanner} style={styles.closeButton}>
              <Ionicons name="close" size={30} color="#fff" />
            </Pressable>
          </View>
          
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'code93', 'itf14', 'codabar', 'qr'],
            }}
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          />
          
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerFrame} />
            <Text style={styles.scannerHint}>Apunte al código de barras</Text>
          </View>

          {scanned && (
            <Pressable 
              style={styles.scanAgainButton} 
              onPress={() => setScanned(false)}
            >
              <Text style={styles.scanAgainText}>Escanear de nuevo</Text>
            </Pressable>
          )}
        </View>
      </Modal>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 45,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  searchIcon: {
    marginLeft: 10,
  },
  scanIcon: {
    marginLeft: 10,
    padding: 5,
  },
  errorText: {
    color: 'red',
    marginVertical: 10,
  },
  productItem: {
    padding: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Estilos del escáner
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  scannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingTop: 50,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  scannerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 280,
    height: 150,
    borderWidth: 2,
    borderColor: '#00ff00',
    backgroundColor: 'transparent',
    borderRadius: 10,
  },
  scannerHint: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  scanAgainButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  scanAgainText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SearchScreen;