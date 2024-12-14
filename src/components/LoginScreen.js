import React, {useState} from 'react';
import {Text, TextInput, Button, View, Alert} from 'react-native';
import axios from 'axios';

const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login/check', {
        username: email,
        password: password,
      });

      if (response.status === 200 && response.data.token) {
        navigation.navigate('HelloWorld');
      } else {
        Alert.alert('Błąd', 'Nieprawidłowe dane logowania');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Błąd', 'Wystąpił problem z logowaniem');
    }
  };

  return (
    <View style={{padding: 20}}>
      <Text>Login</Text>
      <TextInput
        style={{
          height: 40,
          borderColor: 'gray',
          borderWidth: 1,
          marginBottom: 10,
          paddingHorizontal: 8,
        }}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={{
          height: 40,
          borderColor: 'gray',
          borderWidth: 1,
          marginBottom: 10,
          paddingHorizontal: 8,
        }}
        placeholder="Hasło"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Zaloguj" onPress={handleLogin} />
    </View>
  );
};

export default LoginScreen;
