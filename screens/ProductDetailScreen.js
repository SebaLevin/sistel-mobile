import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ProductDetailScreen = ({ route }) => {
  const { product } = route.params;
  const [loading, setLoading] = useState(true);
  const [productDetails, setProductDetails] = useState([]);

  const navigation = useNavigation();

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`http://pibeapk.dyndns.org:2222/api/product/${product.numint}`);
        const data = await response.json();
        setProductDetails(data);
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [product.numint]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{product.Concepto}</Text>
      <Text style={styles.brand}>Marca: {product.Marca || 'N/A'}</Text>
      <Text style={styles.code}>Codigo: {product.Codigo}</Text>

      {productDetails.length > 0 ? (
        <ScrollView style={styles.tableContainer}>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.headerCell]}>Almacen</Text>
              <Text style={[styles.tableCell, styles.headerCell]}>Stock</Text>
            </View>
            {productDetails.map((detail, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{detail.NombreAlmacen}</Text>
                <Text style={styles.tableCell}>{detail.Stock}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <Text>Sin Stock</Text>
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
  goBackButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  goBackText: { color: '#fff', fontSize: 18 },
});

export default ProductDetailScreen;