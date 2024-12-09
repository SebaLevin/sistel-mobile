// screens/SearchScreen.js
import React, { useState } from 'react';
import { View, TextInput, FlatList, Text, StyleSheet, TouchableOpacity, Keyboard, Pressable } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const SearchScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const searchProducts = async () => {
    if (!query.trim()) return; 

    setLoading(true); 
    setError(''); 

    try {
      const response = await fetch(`http://pibeapk.dyndns.org:2222/api/search?searchTerm=${query}`);
      const data = await response.json();

      if (response.ok) {
        setResults(data); 
      } else {
        setError('Failed to fetch products');
      }
    } catch (err) {
      setError('Error fetching data');
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
          style={styles.input}
          placeholder="Buscar producto"
          value={query}
          onChangeText={(text) => setQuery(text)}
          onSubmitEditing={handleSubmitEditing}  
          returnKeyType="search"  
        />

        {/* Search Icon */}
        <Pressable onPress={searchProducts} style={styles.searchIcon}>
          <Ionicons name="search" size={24} color="gray" />
        </Pressable>
      </View>
      {loading && <Text>Loading...</Text>}
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
    width: '80%',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginLeft: 10,
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
});

export default SearchScreen;