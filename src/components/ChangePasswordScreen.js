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

const ChangePasswordScreen = ({navigation, route}) => {
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const email = route.params?.email;

  const handleChangePassword = async () => {
    if (!resetCode.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Błąd', 'Wszystkie pola są wymagane');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Błąd', 'Hasła nie są identyczne');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}/users/change_password`,
        {
          code: resetCode.trim(),
          password: newPassword,
          confirmPassword: newPassword,
        },
        {
          headers: {
            'Content-Type': 'application/ld+json',
          },
        },
      );
      console.log('Change password response:', response.data);

      Alert.alert('Sukces', 'Hasło zostało zmienione', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Login'),
        },
      ]);
    } catch (error) {
      console.error('Change password error:', error);
      Alert.alert(
        'Błąd',
        'Nie udało się zmienić hasła. Sprawdź kod resetowania i spróbuj ponownie.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Zmień hasło</Text>
      <Text style={styles.description}>
        Wprowadź kod otrzymany w wiadomości email oraz nowe hasło.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Kod resetowania"
        value={resetCode}
        onChangeText={setResetCode}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TextInput
        style={styles.input}
        placeholder="Nowe hasło"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Potwierdź nowe hasło"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={styles.changeButton}
        onPress={handleChangePassword}
        disabled={loading}>
        <Text style={styles.changeButtonText}>
          {loading ? 'Zmienianie...' : 'Zmień hasło'}
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
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  changeButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  changeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 20,
  },
});

export default ChangePasswordScreen; 