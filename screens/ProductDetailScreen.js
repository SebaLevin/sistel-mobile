import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getProductDetails, updateProductStock } from '../lib/data';

const ProductDetailScreen = ({ route }) => {
  const { product } = route.params;
  const [loading, setLoading] = useState(true);
  const [stockData, setStockData] = useState([]);
  const [priceData, setPriceData] = useState([]);
  const [newStock, setNewStock] = useState('');
  const [updatingStock, setUpdatingStock] = useState(false);
  const [showStockInput, setShowStockInput] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    fetchDetails();
  }, [product.numint]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const { stock, price } = await getProductDetails(product.numint);
      setStockData(stock);
      setPriceData(price);
    } catch (err) {
      console.error('Error fetching product details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async () => {
    if (!newStock.trim()) {
      Alert.alert('Error', 'Por favor ingrese el nuevo stock');
      return;
    }

    setUpdatingStock(true);
    try {
      await updateProductStock(product.numint, newStock);
      Alert.alert('Éxito', 'Stock actualizado correctamente');
      setShowStockInput(false);
      setNewStock('');
      fetchDetails();
    } catch (err) {
      console.error('Error updating stock:', err);
      Alert.alert('Error', 'No se pudo actualizar el stock');
    } finally {
      setUpdatingStock(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{product.Concepto}</Text>
      <Text style={styles.brand}>Marca: {product.Marca || 'N/A'}</Text>
      <Text style={styles.code}>Codigo: {product.Codigo}</Text>

      <ScrollView style={styles.tableContainer}>
        {/* Tabla de Stock */}
        <Text style={styles.tableTitle}>Stock</Text>
        {stockData.length > 0 ? (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.headerCell]}>Almacen</Text>
              <Text style={[styles.tableCell, styles.headerCell]}>Stock</Text>
            </View>
            {stockData.map((detail, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{detail.Almacen}</Text>
                <Text style={styles.tableCell}>{detail.Stock}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>Sin Stock</Text>
          </View>
        )}

        {/* Tabla de Precio */}
        <Text style={styles.tableTitle}>Price</Text>
        {priceData.length > 0 ? (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.headerCell]}>NroLista</Text>
              <Text style={[styles.tableCell, styles.headerCell]}>PrecioFinal</Text>
            </View>
            {priceData.map((detail, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{detail.NroLista}</Text>
                <Text style={styles.tableCell}>{detail.PrecioFinal}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>Sin Precio</Text>
          </View>
        )}
      </ScrollView>

      {/* Botón para actualizar stock */}
      <Pressable
        style={styles.updateStockButton}
        onPress={() => setShowStockInput(!showStockInput)}
      >
        <Text style={styles.updateStockText}>
          {showStockInput ? '✕ Cancelar' : '📦 Actualizar Stock'}
        </Text>
      </Pressable>

      {showStockInput && (
        <View style={styles.stockInputContainer}>
          <Text style={styles.stockLabel}>Nuevo Stock:</Text>
          <TextInput
            style={styles.stockInput}
            placeholder="Ingrese el nuevo stock"
            value={newStock}
            onChangeText={setNewStock}
            keyboardType="numeric"
          />
          <Pressable
            style={[styles.confirmStockButton, updatingStock && styles.disabledButton]}
            onPress={handleUpdateStock}
            disabled={updatingStock}
          >
            {updatingStock ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.confirmStockText}>Confirmar</Text>
            )}
          </Pressable>
        </View>
      )}

      <Pressable
        style={styles.goBackButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.goBackText}>Volver</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  brand: { fontSize: 18, marginBottom: 10 },
  code: { fontSize: 18, marginBottom: 20 },
  tableContainer: { flex: 1, marginTop: 10 },
  tableTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
    color: '#333',
  },
  noDataContainer: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  table: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f4f4f4',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  tableCell: {
    flex: 1,
    padding: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  headerCell: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#333',
  },
  updateStockButton: {
    backgroundColor: '#28a745',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 15,
  },
  updateStockText: { 
    color: '#fff', 
    fontSize: 16,
    fontWeight: '600',
  },
  stockInputContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  stockLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  stockInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  confirmStockButton: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  confirmStockText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#6c757d',
  },
  goBackButton: {
    backgroundColor: '#6c757d',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 15,
  },
  goBackText: { color: '#fff', fontSize: 18 },
});

export default ProductDetailScreen;