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
import {resetPassword} from '../services/auth';

const ResetPasswordScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Błąd', 'Wprowadź adres email');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email.trim());
      Alert.alert(
        'Sukces',
        'Na podany adres email został wysłany kod resetowania hasła.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('ChangePassword', { email: email.trim() }),
          },
        ],
      );
    } catch (error) {
      console.error('Reset password error:', error);
      Alert.alert(
        'Błąd',
        'Wystąpił błąd podczas próby resetowania hasła. Spróbuj ponownie później.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resetuj hasło</Text>
      <Text style={styles.description}>
        Wprowadź swój adres email, a wyślemy Ci instrukcje resetowania hasła.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Adres email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <TouchableOpacity
        style={styles.resetButton}
        onPress={handleResetPassword}
        disabled={loading}>
        <Text style={styles.resetButtonText}>
          {loading ? 'Wysyłanie...' : 'Resetuj hasło'}
        </Text>
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator
          style={styles.loader}
          size="large"
          color="#007AFF"
        />
      )}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Powrót do logowania</Text>
      </TouchableOpacity>
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
  resetButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 15,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  loader: {
    marginTop: 20,
  },
});

export default ResetPasswordScreen; 