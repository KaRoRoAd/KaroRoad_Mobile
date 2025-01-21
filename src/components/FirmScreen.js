import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';
import {API_URL} from '../services/api';
import {getAuthHeader} from '../services/auth';

const FirmScreen = ({navigation}) => {
  const [firms, setFirms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFirms = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/firm`, {
        headers: {
          'Content-Type': 'application/ld+json',
          ...getAuthHeader(),
        },
      });
      setFirms(response.data['member']);
    } catch (error) {
      console.error('Error fetching firms:', error);
      if (error.response?.status === 401) {
        Alert.alert('Błąd', 'Sesja wygasła. Zaloguj się ponownie.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Błąd', 'Nie udało się pobrać firm');
      }
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  useEffect(() => {
    fetchFirms();
  }, [fetchFirms]);

  const handleManageEmployees = (firmId) => {
    navigation.navigate('FirmManagement', {
      firmId,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => 
          navigation.navigate('CreateFirm', {
            onFirmCreated: fetchFirms,
          })
        }>
        <Text style={styles.addButtonText}>+ Dodaj firmę</Text>
      </TouchableOpacity>

      <FlatList
        data={firms}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({item}) => (
          <TouchableOpacity 
            style={styles.firmCard}
            onPress={() => handleManageEmployees(item.id)}>
            <View style={styles.firmInfo}>
              <Text style={styles.firmName}>{item.name}</Text>
              <Text style={styles.firmId}>ID: {item.id}</Text>
            </View>
            <View style={styles.manageButton}>
              <Text style={styles.manageButtonText}>Zarządzaj pracownikami</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  addButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    gap: 10,
  },
  firmCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  firmInfo: {
    marginBottom: 10,
  },
  firmName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  firmId: {
    fontSize: 14,
    color: '#666',
  },
  manageButton: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  manageButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default FirmScreen; 