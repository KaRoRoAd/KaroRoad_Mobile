import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import {API_URL} from '../services/api';
import {getAuthHeader} from '../services/auth';

const CreateFirmScreen = ({navigation, route}) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Błąd', 'Nazwa firmy jest wymagana');
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        `${API_URL}/firm`,
        {
          name: name.trim(),
        },
        {
          headers: {
            'Content-Type': 'application/ld+json',
            ...getAuthHeader(),
          },
        },
      );

      Alert.alert('Sukces', 'Firma została dodana', [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
            route.params?.onFirmCreated?.();
          },
        },
      ]);
    } catch (error) {
      console.error('Error creating firm:', error);
      if (error.response?.status === 401) {
        Alert.alert('Błąd', 'Sesja wygasła. Zaloguj się ponownie.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Błąd', 'Nie udało się dodać firmy');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dodaj nową firmę</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nazwa firmy"
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading}>
        <Text style={styles.submitButtonText}>
          {loading ? 'Dodawanie...' : 'Dodaj firmę'}
        </Text>
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator
          style={styles.loader}
          size="large"
          color="#007AFF"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 20,
  },
});

export default CreateFirmScreen; 