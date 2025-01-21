import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
  Modal,
  SafeAreaView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import {API_URL} from '../services/api';
import {getAuthHeader} from '../services/auth';
import {scheduleTaskNotification} from '../services/notifications';

const CreateTaskScreen = ({navigation, route}) => {
  console.log('TEST LOG: CreateTaskScreen mounted');
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [status, setStatus] = useState('pending');
  const [deadLine, setDeadLine] = useState(
    route.params?.selectedDate 
      ? new Date(route.params.selectedDate)
      : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const onDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setDeadLine(selectedDate);
    }
  };

  const renderDatePicker = () => {
    if (Platform.OS === 'ios') {
      return (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showDatePicker}>
          <View style={styles.modalContainer}>
            <SafeAreaView style={styles.modalContent}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.cancelButton}>Anuluj</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowDatePicker(false);
                  }}>
                  <Text style={styles.doneButton}>Gotowe</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={deadLine}
                mode="datetime"
                is24Hour={true}
                display="spinner"
                onChange={onDateChange}
                style={styles.dateTimePicker}
                minimumDate={new Date()}
              />
            </SafeAreaView>
          </View>
        </Modal>
      );
    }

    return showDatePicker ? (
      <DateTimePicker
        value={deadLine}
        mode="datetime"
        is24Hour={true}
        display="default"
        onChange={(event, date) => {
          setShowDatePicker(false);
          onDateChange(event, date);
        }}
        minimumDate={new Date()}
      />
    ) : null;
  };

  const handleSubmit = async () => {
    if (!name.trim() || !employeeId) {
      Alert.alert('Błąd', 'Wszystkie pola są wymagane');
      return;
    }

    if (isNaN(parseInt(employeeId, 10))) {
      Alert.alert('Błąd', 'ID pracownika musi być liczbą');
      return;
    }

    try {
      setLoading(true);
      console.log('Creating task with data:', {
        name: name.trim(),
        deadLine: deadLine.toISOString(),
        employeeId: parseInt(employeeId, 10),
        status: 'pending',
      });
      
      const response = await axios.post(
        `${API_URL}/task`,
        {
          name: name.trim(),
          deadLine: deadLine.toISOString(),
          employeeId: parseInt(employeeId, 10),
          status: 'pending',
        },
        {
          headers: {
            'Content-Type': 'application/ld+json',
            ...getAuthHeader(),
          },
        },
      );
      
      await scheduleTaskNotification({
        name: name.trim(),
        deadLine: deadLine,
      });
      
      console.log('Task created successfully:', response.data);

      Alert.alert('Sukces', 'Zadanie zostało dodane', [
        {
          text: 'OK',
          onPress: () => {
            console.log('Calling onTaskCreated callback');
            if (route.params?.onTaskCreated) {
              route.params.onTaskCreated();
            }
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error('Error creating task:', error);
      if (error.response?.status === 401) {
        Alert.alert('Błąd', 'Sesja wygasła. Zaloguj się ponownie.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Błąd', 'Nie udało się dodać zadania');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleString('pl-PL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Dodaj nowe zadanie</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nazwa zadania"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="ID pracownika"
        value={employeeId}
        onChangeText={setEmployeeId}
        keyboardType="numeric"
      />

      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateButtonText}>Termin wykonania:</Text>
        <Text style={styles.dateText}>
          {formatDate(deadLine)}
        </Text>
      </TouchableOpacity>

      {renderDatePicker()}

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading}>
        <Text style={styles.submitButtonText}>
          {loading ? 'Dodawanie...' : 'Dodaj zadanie'}
        </Text>
      </TouchableOpacity>

      {loading && (
        <ActivityIndicator
          style={styles.loader}
          size="large"
          color="#007AFF"
        />
      )}
    </ScrollView>
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
  dateButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dateButtonText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 5,
  },
  dateText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  cancelButton: {
    color: '#007AFF',
    fontSize: 16,
  },
  doneButton: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateTimePicker: {
    height: 200,
    width: '100%',
  },
});

export default CreateTaskScreen; 